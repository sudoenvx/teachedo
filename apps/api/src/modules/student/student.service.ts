import { prisma } from '../../core/database/prisma.client';
import { AuthError, NotFoundError, DuplicationError } from '../../shared/contracts/api-error';
import { verifyPassword, hashPassword } from '../../core/utils/auth/password';
import { generateToken } from '../../core/utils/auth/jwt';
import {
    StudentLoginInput,
    CreateStudentInput,
    UpdateStudentInput,
    EnrollStudentInput,
    QueryStudentsInput,
} from './student.schema';
import { AuthTokenPayload } from '../../core/types/auth.types';
import { ApiResponse, PaginationMeta } from '../../core/types/api-response';
import { generateRandomPassword } from '../../core/utils/auth/credentials';
import { storageService } from '../../core/services/storage.service';

export class StudentService {
    public async login(input: StudentLoginInput) {
        const code = input.studentCode.trim();
        const student = await prisma.student.findFirst({
            where: {
                studentCode: code,
                deletedAt: null,
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        subjectSpecialization: true,
                        accountStatus: true,
                    },
                },
                studyStage: {
                    select: {
                        id: true,
                        stageName: true,
                    },
                },
            },
        });

        if (!student || !student.password) {
            throw new AuthError('Invalid student ID code or password.');
        }

        const isPasswordValid = await verifyPassword(input.password, student.password);
        if (!isPasswordValid) {
            throw new AuthError('Invalid student ID code or password.');
        }

        if (student.status === 'inactive') {
            throw new AuthError('Student account is currently inactive. Please contact your teacher.');
        }

        const tokenPayload: AuthTokenPayload = {
            id: student.id,
            role: 'student',
            scopeTeacherId: student.teacherId,
        };

        const token = generateToken(tokenPayload);

        return {
            student: {
                id: student.id,
                fullName: student.fullName,
                studentCode: student.studentCode,
                phoneNumber: student.phoneNumber,
                status: student.status,
                teacher: student.teacher,
                studyStage: student.studyStage,
            },
            token,
        };
    }

    public async create(teacherId: number, input: CreateStudentInput, profileImage?: Express.Multer.File) {
        let parentId = input.parentId;

        // 1. Resolve or fast-create Parent
        if (!parentId && input.parent) {
            const parentPhone = input.parent.phoneNumber.trim();
            const existingParent = await prisma.parent.findUnique({
                where: { phoneNumber: parentPhone },
            });

            if (existingParent) {
                parentId = existingParent.id;
            } else {
                const parentPass = input.parent.password || '123456';
                const hashedParentPass = await hashPassword(parentPass);
                const newParent = await prisma.parent.create({
                    data: {
                        fullName: input.parent.fullName.trim(),
                        phoneNumber: parentPhone,
                        whatsappNumber: input.parent.whatsappNumber ? input.parent.whatsappNumber.trim() : null,
                        password: hashedParentPass,
                    },
                });
                parentId = newParent.id;
            }
        }

        // 2. Generate student code & password for ID card
        let studentCode = input.studentCode?.trim();
        if (!studentCode) {
            let uniqueFound = false;
            while (!uniqueFound) {
                const randomDigits = Math.floor(1000 + Math.random() * 9000);
                const candidate = `STU-${teacherId}-${randomDigits}`;
                const existing = await prisma.student.findUnique({ where: { studentCode: candidate } });
                if (!existing) {
                    studentCode = candidate;
                    uniqueFound = true;
                }
            }
        } else {
            const existing = await prisma.student.findUnique({ where: { studentCode } });
            if (existing) {
                throw new DuplicationError('A student with this ID code already exists.');
            }
        }

        const rawPassword = input.password?.trim() || generateRandomPassword();
        const hashedPassword = await hashPassword(rawPassword);

        // 3. Create Student
        const student = await prisma.student.create({
            data: {
                teacherId,
                ...(parentId ? { parentId } : {}),
                fullName: input.fullName.trim(),
                studentCode,
                password: hashedPassword,
                plainPassword: rawPassword,
                phoneNumber: input.phoneNumber ? input.phoneNumber.trim() : null,
                profilePictureUrl: input.profilePictureUrl || null,
                studyStageId: input.studyStageId || null,
                status: input.status || 'active',
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        whatsappNumber: true,
                    },
                },
                studyStage: {
                    select: {
                        id: true,
                        stageName: true,
                    },
                },
            },
        });

        if (profileImage) {
            let savedProfilePictureUrl: string | undefined;
            try {
                savedProfilePictureUrl = await storageService.save(profileImage, 'students');
                await prisma.student.update({ where: { id: student.id }, data: { profilePictureUrl: savedProfilePictureUrl } });
                student.profilePictureUrl = savedProfilePictureUrl;
            } catch (error) {
                await storageService.delete(savedProfilePictureUrl);
                await prisma.student.delete({ where: { id: student.id } });
                throw error;
            }
        }

        // 4. Initial group enrollment if specified
        if (input.groupId) {
            await prisma.groupEnrollment.create({
                data: {
                    groupId: input.groupId,
                    studentId: student.id,
                    enrollmentDate: new Date(),
                    status: 'active',
                    customPrice: input.customPrice !== undefined ? input.customPrice : null,
                },
            });
        }

        return {
            ...student,
            cardCredentials: {
                studentCode: student.studentCode,
                initialPassword: rawPassword,
            },
        };
    }

    public async list(teacherId: number | undefined, query: QueryStudentsInput, requestUrl: string): Promise<{ data: unknown[]; meta: PaginationMeta }> {
        console.log(query);
        
        const page = Math.max(1, Number(query.page) || 1);
        const perPage = Math.max(1, Math.min(100, Number(query.perPage) || 10));
        const skip = (page - 1) * perPage;

        const where: Record<string, unknown> = {
            deletedAt: null,
            ...(teacherId ? { teacherId } : {}),
        };

        if (query.status) {
            where.status = query.status;
        }

        if (query.stageId) {
            where.studyStageId = Number(query.stageId);
        }

        if (query.groupId) {
            where.groupEnrollments = {
                some: {
                    groupId: Number(query.groupId),
                    status: 'active',
                },
            };
        }

        if (query.search && query.search.trim() !== '') {
            const term = query.search.trim();
            where.OR = [
                { fullName: { contains: term } },
                { phoneNumber: { contains: term } },
                { studentCode: { contains: term } },
                { parent: { fullName: { contains: term } } },
                { parent: { phoneNumber: { contains: term } } },
            ];
        }

        const [total, students] = await Promise.all([
            prisma.student.count({ where }),
            prisma.student.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    studentCode: true,
                    phoneNumber: true,
                    profilePictureUrl: true,
                    status: true,
                    createdAt: true,
                    parent: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                            whatsappNumber: true,
                        },
                    },
                    studyStage: {
                        select: {
                            id: true,
                            stageName: true,
                        },
                    },
                    groupEnrollments: {
                        where: { status: 'active' },
                        select: {
                            groupId: true,
                            customPrice: true,
                            group: {
                                select: {
                                    id: true,
                                    groupName: true,
                                    standardMonthlyFee: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            attendance: true,
                            invoices: true,
                        },
                    },
                },
            }),
        ]);

        const formatted = students.map((s) => ({
            id: s.id,
            fullName: s.fullName,
            studentCode: s.studentCode,
            phoneNumber: s.phoneNumber,
            profilePictureUrl: s.profilePictureUrl,
            status: s.status || 'active',
            stageName: s.studyStage?.stageName || 'غير محدد',
            parentName: s.parent?.fullName,
            parentPhone: s.parent?.phoneNumber,
            parentWhatsapp: s.parent?.whatsappNumber,
            activeGroups: s.groupEnrollments.map((ge) => ge.group.groupName),
            totalAttendance: s._count.attendance,
            createdAt: s.createdAt,
        }));

        const lastPage = Math.ceil(total / perPage) || 1;
        const pagination = {
            currentPage: page,
            perPage,
            total,
            lastPage,
            from: total === 0 ? null : skip + 1,
            to: total === 0 ? null : Math.min(skip + perPage, total),
            path: requestUrl.split('?')[0] || '/api/students',
        };

        const meta = ApiResponse.paginationMeta(pagination, requestUrl);

        return { data: formatted, meta };
    }

    public async stats(teacherId: number) {
        const where = { teacherId, deletedAt: null };
        const [total, active, inactive, withParent] = await Promise.all([
            prisma.student.count({ where }),
            prisma.student.count({ where: { ...where, status: 'active' } }),
            prisma.student.count({ where: { ...where, status: 'inactive' } }),
            prisma.student.count({ where: { ...where, parent: { isNot: null } } }),
        ]);

        return { total, active, inactive, withParent };
    }

    public async findById(id: number, teacherId?: number) {
        const where: Record<string, unknown> = { id, deletedAt: null };
        if (teacherId) where.teacherId = teacherId;

        const student = await prisma.student.findFirst({
            where,
            include: {
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        subjectSpecialization: true,
                        phoneNumber: true,
                    },
                },
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        whatsappNumber: true,
                    },
                },
                studyStage: {
                    select: {
                        id: true,
                        stageName: true,
                    },
                },
                groupEnrollments: {
                    include: {
                        group: {
                            select: {
                                id: true,
                                groupName: true,
                                standardMonthlyFee: true,
                            },
                        },
                    },
                },
                attendance: {
                    take: 10,
                    orderBy: { recordedAt: 'desc' },
                    include: {
                        session: {
                            select: {
                                id: true,
                                sessionDate: true,
                                topic: true,
                            },
                        },
                    },
                },
                invoices: {
                    take: 6,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        billingMonth: true,
                        amountDue: true,
                        amountPaid: true,
                        status: true,
                        group: { select: { groupName: true } },
                    },
                },
                payments: {
                    take: 6,
                    orderBy: { paidAt: 'desc' },
                    select: {
                        id: true,
                        amount: true,
                        paymentMethod: true,
                        paidAt: true,
                        receiptNote: true,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundError('Student not found.');
        }

        return student;
    }

    public async update(id: number, teacherId: number | undefined, input: UpdateStudentInput, profileImage?: Express.Multer.File) {
        const where: Record<string, unknown> = { id, deletedAt: null };
        if (teacherId) where.teacherId = teacherId;

        const existing = await prisma.student.findFirst({ where });
        if (!existing) {
            throw new NotFoundError('Student not found.');
        }

        if (input.studentCode && input.studentCode.trim() !== existing.studentCode) {
            const inUse = await prisma.student.findUnique({
                where: { studentCode: input.studentCode.trim() },
            });
            if (inUse) {
                throw new DuplicationError('Student ID code is already in use.');
            }
        }

        const data: Record<string, unknown> = {};
        if (input.fullName !== undefined) data.fullName = input.fullName.trim();
        if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber ? input.phoneNumber.trim() : null;
        if (input.profilePictureUrl !== undefined) data.profilePictureUrl = input.profilePictureUrl;
        if (input.studentCode !== undefined) data.studentCode = input.studentCode ? input.studentCode.trim() : null;
        if (input.studyStageId !== undefined) data.studyStageId = input.studyStageId;
        if (input.parentId !== undefined) data.parentId = input.parentId;
        if (input.status !== undefined) data.status = input.status;
        if (input.password) {
            data.password = await hashPassword(input.password);
            data.plainPassword = input.password;
        }

        const updated = await prisma.student.update({
            where: { id },
            data,
            include: {
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                    },
                },
                studyStage: {
                    select: {
                        id: true,
                        stageName: true,
                    },
                },
            },
        });

        if (profileImage) {
            const profilePictureUrl = await storageService.save(profileImage, 'students');
            await prisma.student.update({ where: { id }, data: { profilePictureUrl } });
            updated.profilePictureUrl = profilePictureUrl;
            await storageService.delete(existing.profilePictureUrl);
        } else if (input.profilePictureUrl !== undefined && input.profilePictureUrl !== existing.profilePictureUrl) {
            await storageService.delete(existing.profilePictureUrl);
        }

        return updated;
    }

    public async delete(id: number, teacherId?: number) {
        const where: Record<string, unknown> = { id, deletedAt: null };
        if (teacherId) where.teacherId = teacherId;

        const existing = await prisma.student.findFirst({ where });
        if (!existing) {
            throw new NotFoundError('Student not found.');
        }

        await prisma.student.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'inactive',
            },
        });

        await storageService.delete(existing.profilePictureUrl);

        return { message: 'Student deleted successfully.' };
    }

    public async regenerateCredentials(id: number, teacherId: number) {
        const student = await prisma.student.findFirst({
            where: { id, teacherId, deletedAt: null },
        });

        if (!student) {
            throw new NotFoundError('Student not found.');
        }

        let uniqueFound = false;
        let newCode = '';
        while (!uniqueFound) {
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const candidate = `STU-${teacherId}-${randomDigits}`;
            const existing = await prisma.student.findUnique({ where: { studentCode: candidate } });
            if (!existing) {
                newCode = candidate;
                uniqueFound = true;
            }
        }

        const newRawPassword = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await hashPassword(newRawPassword);

        await prisma.student.update({
            where: { id },
            data: {
                studentCode: newCode,
                password: hashedPassword,
                plainPassword: newRawPassword,
            },
        });

        return {
            studentId: id,
            fullName: student.fullName,
            studentCode: newCode,
            newPassword: newRawPassword,
        };
    }

    public async enroll(studentId: number, teacherId: number | undefined, input: EnrollStudentInput) {
        const studentWhere: Record<string, unknown> = { id: studentId, deletedAt: null };
        if (teacherId) studentWhere.teacherId = teacherId;

        const student = await prisma.student.findFirst({ where: studentWhere });
        if (!student) {
            throw new NotFoundError('Student not found.');
        }

        const enrollment = await prisma.groupEnrollment.upsert({
            where: {
                groupId_studentId: {
                    groupId: input.groupId,
                    studentId,
                },
            },
            update: {
                status: 'active',
                leftAt: null,
                ...(input.customPrice !== undefined ? { customPrice: input.customPrice } : {}),
            },
            create: {
                groupId: input.groupId,
                studentId,
                status: 'active',
                enrollmentDate: new Date(),
                customPrice: input.customPrice !== undefined ? input.customPrice : null,
            },
        });

        return enrollment;
    }

    public async unenroll(studentId: number, groupId: number, teacherId?: number) {
        const studentWhere: Record<string, unknown> = { id: studentId, deletedAt: null };
        if (teacherId) studentWhere.teacherId = teacherId;

        const student = await prisma.student.findFirst({ where: studentWhere });
        if (!student) {
            throw new NotFoundError('Student not found.');
        }

        await prisma.groupEnrollment.update({
            where: {
                groupId_studentId: {
                    groupId,
                    studentId,
                },
            },
            data: {
                status: 'left',
                leftAt: new Date(),
            },
        });

        return { message: 'Student unenrolled from group successfully.' };
    }

    public async getStudentMe(studentId: number) {
        const student = await prisma.student.findUnique({
            where: { id: studentId, deletedAt: null },
            include: {
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        subjectSpecialization: true,
                        phoneNumber: true,
                    },
                },
                studyStage: {
                    select: {
                        id: true,
                        stageName: true,
                    },
                },
                groupEnrollments: {
                    where: { status: 'active' },
                    include: {
                        group: {
                            include: {
                                schedules: true,
                            },
                        },
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundError('Student not found.');
        }

        return student;
    }

    public async getStudentAttendance(studentId: number) {
        const attendance = await prisma.attendance.findMany({
            where: { studentId },
            orderBy: { recordedAt: 'desc' },
            include: {
                session: {
                    select: {
                        sessionDate: true,
                        startTime: true,
                        topic: true,
                        group: {
                            select: {
                                groupName: true,
                            },
                        },
                    },
                },
            },
        });

        return attendance;
    }

    public async getStudentInvoices(studentId: number) {
        const [invoices, payments] = await Promise.all([
            prisma.studentInvoice.findMany({
                where: { studentId },
                orderBy: { createdAt: 'desc' },
                include: {
                    group: {
                        select: {
                            groupName: true,
                        },
                    },
                },
            }),
            prisma.studentPayment.findMany({
                where: { studentId },
                orderBy: { paidAt: 'desc' },
            }),
        ]);

        return { invoices, payments };
    }
}

export const studentService = new StudentService();
