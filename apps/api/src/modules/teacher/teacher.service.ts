import { prisma } from '../../core/database/prisma.client';
import { AuthError, NotFoundError, DuplicationError } from '../../shared/contracts/api-error';
import { verifyPassword, hashPassword } from '../../core/utils/auth/password';
import { generateToken } from '../../core/utils/auth/jwt';
import {
    TeacherLoginInput,
    ChangeTeacherPasswordInput,
    CreateTeacherInput,
    UpdateTeacherInput,
    QueryTeachersInput,
    CompleteTeacherOnboardingInput,
} from './teacher.schema';
import { AuthTokenPayload } from '../../core/types/auth.types';
import { ApiResponse, PaginationMeta } from '../../core/types/api-response';
import { storageService } from '../../core/services/storage.service';
import { policyService } from '../policy/policy.service';

export class TeacherService {
    public async login(input: TeacherLoginInput) {
        const teacher = await prisma.teacher.findUnique({
            where: { username: input.username.toLowerCase().trim() },
        });

        if (!teacher) {
            throw new AuthError('Invalid username or password.');
        }

        const isPasswordValid = await verifyPassword(input.password, teacher.password);
        if (!isPasswordValid) {
            throw new AuthError('Invalid username or password.');
        }

        if (teacher.accountStatus === 'inactive' || teacher.accountStatus === 'suspended_payment') {
            throw new AuthError(`Account is currently ${teacher.accountStatus}. Please contact support.`);
        }

        const tokenPayload: AuthTokenPayload = {
            id: teacher.id,
            role: 'teacher',
            email: teacher.email || undefined,
            scopeTeacherId: teacher.id,
            permissions: ['*'],
        };

        const token = generateToken(tokenPayload);

        return {
            teacher: {
                id: teacher.id,
                fullName: teacher.fullName,
                username: teacher.username,
                email: teacher.email,
                phoneNumber: teacher.phoneNumber,
                subjectSpecialization: teacher.subjectSpecialization,
                accountStatus: teacher.accountStatus,
                profilePictureUrl: teacher.profilePictureUrl,
                mustChangePassword: teacher.mustChangePassword,
                onboardingRequired: !teacher.onboardingCompletedAt,
                createdAt: teacher.createdAt,
            },
            token,
        };
    }

    public async create(input: CreateTeacherInput, profileImage?: Express.Multer.File) {
        const username = input.username.toLowerCase().trim();
        const existingUsername = await prisma.teacher.findUnique({
            where: { username },
        });

        if (existingUsername) {
            throw new DuplicationError('A teacher with this username already exists.');
        }

        const email = input.email?.toLowerCase().trim() || null;
        if (email && await prisma.teacher.findUnique({ where: { email } })) {
            throw new DuplicationError('A teacher with this email already exists.');
        }

        if (input.phoneNumber) {
            const existingPhone = await prisma.teacher.findUnique({
                where: { phoneNumber: input.phoneNumber.trim() },
            });
            if (existingPhone) {
                throw new DuplicationError('A teacher with this phone number already exists.');
            }
        }

        const customSubdomain = input.customSubdomain?.toLowerCase().trim() || null;
        if (customSubdomain && await prisma.teacher.findFirst({ where: { customSubdomain } })) {
            throw new DuplicationError('A teacher with this subdomain already exists.');
        }

        const hashedPassword = await hashPassword(input.password);

        const teacher = await prisma.teacher.create({
            data: {
                fullName: input.fullName.trim(),
                username,
                email,
                password: hashedPassword,
                phoneNumber: input.phoneNumber ? input.phoneNumber.trim() : null,
                subjectSpecialization: input.subjectSpecialization ? input.subjectSpecialization.trim() : null,
                accountStatus: input.accountStatus || 'active',
                profilePictureUrl: input.profilePictureUrl || null,
                pricePerStudent: input.pricePerStudent ?? null,
                customSubdomain,
            },
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                phoneNumber: true,
                subjectSpecialization: true,
                accountStatus: true,
                profilePictureUrl: true,
                mustChangePassword: true,
                famousName: true,
                teachingMode: true,
                pricePerStudent: true,
                customSubdomain: true,
                onboardingCompletedAt: true,
                createdAt: true,
            },
        });

        if (profileImage) {
            let savedProfilePictureUrl: string | undefined;
            try {
                savedProfilePictureUrl = await storageService.save(profileImage, 'teachers');
                await prisma.teacher.update({ where: { id: teacher.id }, data: { profilePictureUrl: savedProfilePictureUrl } });
                teacher.profilePictureUrl = savedProfilePictureUrl;
            } catch (error) {
                await storageService.delete(savedProfilePictureUrl);
                await prisma.teacher.delete({ where: { id: teacher.id } });
                throw error;
            }
        }

        return teacher;
    }

    public async changePassword(id: number, input: ChangeTeacherPasswordInput) {
        const teacher = await prisma.teacher.findUnique({ where: { id } });
        if (!teacher) throw new NotFoundError('Teacher not found.');
        if (!(await verifyPassword(input.currentPassword, teacher.password))) {
            throw new AuthError('The temporary password is incorrect.');
        }

        await prisma.teacher.update({
            where: { id },
            data: { password: await hashPassword(input.newPassword), mustChangePassword: false },
        });
    }

    public async isSubdomainAvailable(subdomain: string, teacherId?: number) {
        const normalized = subdomain.toLowerCase().trim();
        const existing = await prisma.teacher.findFirst({
            where: { customSubdomain: normalized, ...(teacherId ? { id: { not: teacherId } } : {}) },
            select: { id: true },
        });
        return { subdomain: normalized, available: !existing };
    }

    public async completeOnboardingV2(id: number, input: CompleteTeacherOnboardingInput, profileImage?: Express.Multer.File) {
        const policy = await policyService.getPublishedByKey(input.policyKey);
        if (policy.version !== input.policyVersion) throw new AuthError('The onboarding policy has changed. Please review it again.');
        const existing = await prisma.teacher.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Teacher not found.');

        const username = input.username.toLowerCase().trim();
        if (username !== existing.username && await prisma.teacher.findUnique({ where: { username } })) {
            throw new DuplicationError('Username is already taken.');
        }
        const email = input.email?.toLowerCase().trim() || null;
        if (email && email !== existing.email && await prisma.teacher.findUnique({ where: { email } })) {
            throw new DuplicationError('Email is already taken.');
        }
        const customSubdomain = input.customSubdomain?.toLowerCase().trim() || null;
        if (customSubdomain !== existing.customSubdomain && customSubdomain && !(await this.isSubdomainAvailable(customSubdomain, id)).available) {
            throw new DuplicationError('Subdomain is already taken.');
        }

        let savedProfilePictureUrl: string | undefined;
        if (profileImage) savedProfilePictureUrl = await storageService.save(profileImage, 'teachers');

        try {
            return await prisma.$transaction(async (transaction) => {
                const customSubjectNames = [...new Set(input.customSubjects.map((name) => name.trim()).filter(Boolean))];
                const customSubjects = await Promise.all(customSubjectNames.map((name) => transaction.subject.upsert({
                    where: { name },
                    update: { isActive: true },
                    create: { name, icon: 'book-open', isActive: true },
                    select: { id: true },
                })));
                const subjectIds = [...new Set([...input.subjectIds, ...customSubjects.map((subject) => subject.id)])];
                const subjectCount = await transaction.subject.count({ where: { id: { in: subjectIds }, isActive: true } });
                if (subjectCount !== subjectIds.length) throw new NotFoundError('One or more selected subjects were not found.');

                const teacher = await transaction.teacher.update({
                    where: { id },
                    data: {
                        fullName: input.fullName.trim(),
                        username,
                        email,
                        phoneNumber: input.phoneNumber?.trim() || null,
                        subjectSpecialization: input.subjectSpecialization?.trim() || null,
                        famousName: input.famousName?.trim() || null,
                        teachingMode: input.teachingMode,
                          customSubdomain,
                        ...(savedProfilePictureUrl ? { profilePictureUrl: savedProfilePictureUrl } : {}),
                        onboardingCompletedAt: new Date(),
                        onboardingPolicyKey: policy.key,
                        onboardingPolicyVersion: policy.version,
                    },
                    select: { id: true, fullName: true, username: true, email: true, phoneNumber: true, subjectSpecialization: true, accountStatus: true, profilePictureUrl: true, famousName: true, teachingMode: true, customSubdomain: true, onboardingCompletedAt: true },
                });

                await transaction.studyStage.deleteMany({ where: { teacherId: id } });
                await transaction.studyStage.createMany({ data: input.stages.map((stage, index) => ({
                    teacherId: id,
                    stageGroup: stage.stageGroup,
                    gradeNumber: stage.gradeNumber,
                    stageName: `${stage.stageGroup === 'primary' ? 'الابتدائي' : stage.stageGroup === 'preparatory' ? 'الإعدادي' : 'الثانوي'} - الصف ${stage.gradeNumber}`,
                    orderingIndex: index + 1,
                })) });
                await transaction.teacherSubject.deleteMany({ where: { teacherId: id } });
                await transaction.teacherSubject.createMany({ data: subjectIds.map((subjectId) => ({ teacherId: id, subjectId })) });

                return teacher;
            });
        } catch (error) {
            await storageService.delete(savedProfilePictureUrl);
            throw error;
        }
    }

    public async completeOnboarding(id: number, input: CompleteTeacherOnboardingInput) {
        const policy = await policyService.getPublishedByKey(input.policyKey);
        if (policy.version !== input.policyVersion) throw new AuthError('The onboarding policy has changed. Please review it again.');
        return prisma.$transaction(async (transaction) => {
            const teacher = await transaction.teacher.update({
                where: { id },
                data: {
                    fullName: input.fullName.trim(),
                    phoneNumber: input.phoneNumber?.trim() || null,
                    subjectSpecialization: input.subjectSpecialization?.trim() || null,
                    onboardingCompletedAt: new Date(),
                    onboardingPolicyKey: policy.key,
                    onboardingPolicyVersion: policy.version,
                },
                select: { id: true, fullName: true, username: true, email: true, phoneNumber: true, subjectSpecialization: true, accountStatus: true, profilePictureUrl: true, onboardingCompletedAt: true },
            });

            await transaction.studyStage.deleteMany({ where: { teacherId: id } });
            await Promise.all(input.stages.map((stage, index) => transaction.studyStage.create({
                data: {
                    teacherId: id,
                    stageGroup: stage.stageGroup,
                    gradeNumber: stage.gradeNumber,
                    stageName: `${stage.stageGroup === 'primary' ? 'الابتدائي' : stage.stageGroup === 'preparatory' ? 'الإعدادي' : 'الثانوي'} - الصف ${stage.gradeNumber}`,
                    orderingIndex: index + 1,
                },
                select: { id: true, stageGroup: true, gradeNumber: true },
            })));

            await transaction.teacherSubject.deleteMany({ where: { teacherId: id } });
            await transaction.teacherSubject.create({ data: { teacherId: id, subjectId: input.subjectId } });

            return teacher;
        });
    }

    public async list(query: QueryTeachersInput, requestUrl: string): Promise<{ data: unknown[]; meta: PaginationMeta }> {
        const page = Math.max(1, Number(query.page) || 1);
        const perPage = Math.max(1, Math.min(100, Number(query.perPage) || 10));
        const skip = (page - 1) * perPage;

        const where: Record<string, unknown> = {};

        if (query.status) {
            where.accountStatus = query.status;
        }

        if (query.subjectSpecialization) {
            where.subjectSpecialization = { contains: query.subjectSpecialization };
        }

        if (query.search && query.search.trim() !== '') {
            const term = query.search.trim();
            where.OR = [
                { fullName: { contains: term } },
                { email: { contains: term } },
                { phoneNumber: { contains: term } },
                { subjectSpecialization: { contains: term } },
            ];
        }

        const [total, teachers] = await Promise.all([
            prisma.teacher.count({ where }),
            prisma.teacher.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    subjectSpecialization: true,
                    accountStatus: true,
                    profilePictureUrl: true,
                    pricePerStudent: true,
                    customSubdomain: true,
                    createdAt: true,
                    _count: {
                        select: {
                            students: { where: { deletedAt: null } },
                            studentClasses: { where: { deletedAt: null } },
                            assistants: true,
                        },
                    },
                },
            }),
        ]);

        const formatted = teachers.map((t) => ({
            id: t.id,
            name: t.fullName,
            fullName: t.fullName,
            email: t.email,
            phone: t.phoneNumber,
            phoneNumber: t.phoneNumber,
            subject: t.subjectSpecialization,
            subjectSpecialization: t.subjectSpecialization,
            status: (t.accountStatus || 'active').toUpperCase(),
            accountStatus: t.accountStatus || 'active',
            profilePictureUrl: t.profilePictureUrl,
            pricePerStudent: t.pricePerStudent === null ? null : Number(t.pricePerStudent),
            customSubdomain: t.customSubdomain,
            studentsCount: t._count.students,
            classesCount: t._count.studentClasses,
            assistantsCount: t._count.assistants,
            joinDate: t.createdAt.toISOString().split('T')[0],
            createdAt: t.createdAt,
        }));

        const lastPage = Math.ceil(total / perPage) || 1;
        const pagination = {
            currentPage: page,
            perPage,
            total,
            lastPage,
            from: total === 0 ? null : skip + 1,
            to: total === 0 ? null : Math.min(skip + perPage, total),
            path: requestUrl.split('?')[0] || '/api/admin/teachers',
        };

        const meta = ApiResponse.paginationMeta(pagination, requestUrl);

        return { data: formatted, meta };
    }

    public async findById(id: number) {
        const teacher = await prisma.teacher.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                subjectSpecialization: true,
                accountStatus: true,
                profilePictureUrl: true,
                mustChangePassword: true,
                famousName: true,
                teachingMode: true,
                pricePerStudent: true,
                customSubdomain: true,
                onboardingCompletedAt: true,
                createdAt: true,
                _count: {
                    select: {
                        students: { where: { deletedAt: null } },
                        studentClasses: { where: { deletedAt: null } },
                        assistants: true,
                        classSessions: true,
                    },
                },
                studentClasses: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        className: true,
                        monthlyPrice: true,
                        maxCapacity: true,
                        _count: { select: { enrollments: true } },
                    },
                },
                billingCycles: {
                    take: 6,
                    orderBy: { generatedAt: 'desc' },
                    select: {
                        id: true,
                        billingMonth: true,
                        activeStudentsSnapshot: true,
                        rateApplied: true,
                        totalDue: true,
                        amountPaid: true,
                        status: true,
                        generatedAt: true,
                        paidAt: true,
                    },
                },
                platformPayments: {
                    take: 5,
                    orderBy: { paidAt: 'desc' },
                    select: {
                        id: true,
                        amount: true,
                        paymentMethod: true,
                        transactionReference: true,
                        status: true,
                        paidAt: true,
                    },
                },
            },
        });

        if (!teacher) {
            throw new NotFoundError('Teacher not found.');
        }

        return {
            id: teacher.id,
            name: teacher.fullName,
            fullName: teacher.fullName,
            email: teacher.email,
            phone: teacher.phoneNumber,
            phoneNumber: teacher.phoneNumber,
            subject: teacher.subjectSpecialization,
            subjectSpecialization: teacher.subjectSpecialization,
            status: (teacher.accountStatus || 'active').toUpperCase(),
            accountStatus: teacher.accountStatus || 'active',
            profilePictureUrl: teacher.profilePictureUrl,
            mustChangePassword: teacher.mustChangePassword,
            famousName: teacher.famousName,
            teachingMode: teacher.teachingMode,
            pricePerStudent: teacher.pricePerStudent === null ? null : Number(teacher.pricePerStudent),
            customSubdomain: teacher.customSubdomain,
            onboardingRequired: !teacher.onboardingCompletedAt,
            joinDate: teacher.createdAt.toISOString().split('T')[0],
            createdAt: teacher.createdAt,
            stats: {
                totalStudents: teacher._count.students,
                activeClasses: teacher._count.studentClasses,
                totalAssistants: teacher._count.assistants,
                totalSessions: teacher._count.classSessions,
            },
            studyStages: await prisma.studyStage.findMany({ where: { teacherId: id }, orderBy: { orderingIndex: 'asc' }, select: { id: true, stageName: true } }),
            classes: teacher.studentClasses,
            recentInvoices: teacher.billingCycles.map((b) => ({
                id: `inv-${b.id}`,
                month: b.billingMonth,
                amount: Number(b.totalDue),
                amountPaid: Number(b.amountPaid),
                isPaid: b.status === 'paid',
                status: b.status,
            })),
            recentPayments: teacher.platformPayments,
        };
    }

    public async update(id: number, input: UpdateTeacherInput, profileImage?: Express.Multer.File) {
        const existing = await prisma.teacher.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Teacher not found.');
        }

        if (input.email && input.email.toLowerCase().trim() !== existing.email?.toLowerCase()) {
            const emailInUse = await prisma.teacher.findUnique({
                where: { email: input.email.toLowerCase().trim() },
            });
            if (emailInUse) {
                throw new DuplicationError('Email is already taken by another teacher.');
            }
        }

        if (input.username && input.username.toLowerCase().trim() !== existing.username) {
            const usernameInUse = await prisma.teacher.findUnique({ where: { username: input.username.toLowerCase().trim() } });
            if (usernameInUse) throw new DuplicationError('Username is already taken by another teacher.');
        }

        if (input.phoneNumber && input.phoneNumber.trim() !== existing.phoneNumber) {
            const phoneInUse = await prisma.teacher.findUnique({
                where: { phoneNumber: input.phoneNumber.trim() },
            });
            if (phoneInUse) {
                throw new DuplicationError('Phone number is already taken by another teacher.');
            }
        }

        const customSubdomain = input.customSubdomain === undefined
            ? undefined
            : input.customSubdomain?.toLowerCase().trim() || null;
        const existingSubdomain = (existing as { customSubdomain?: string | null }).customSubdomain;
        if (customSubdomain && customSubdomain !== existingSubdomain) {
            const subdomainInUse = await prisma.teacher.findFirst({ where: { customSubdomain } });
            if (subdomainInUse) throw new DuplicationError('Subdomain is already taken by another teacher.');
        }

        const data: Record<string, unknown> = {};
        if (input.fullName !== undefined) data.fullName = input.fullName.trim();
        if (input.username !== undefined) data.username = input.username.toLowerCase().trim();
        if (input.email !== undefined) data.email = input.email ? input.email.toLowerCase().trim() : null;
        if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber ? input.phoneNumber.trim() : null;
        if (input.subjectSpecialization !== undefined) data.subjectSpecialization = input.subjectSpecialization ? input.subjectSpecialization.trim() : null;
        if (input.accountStatus !== undefined) data.accountStatus = input.accountStatus;
        if (input.profilePictureUrl !== undefined) data.profilePictureUrl = input.profilePictureUrl;
        if (input.pricePerStudent !== undefined) data.pricePerStudent = input.pricePerStudent;
        if (customSubdomain !== undefined) data.customSubdomain = customSubdomain;
        if (input.password) {
            data.password = await hashPassword(input.password);
        }

        const updated = await prisma.teacher.update({
            where: { id },
            data,
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                subjectSpecialization: true,
                accountStatus: true,
                profilePictureUrl: true,
                pricePerStudent: true,
                customSubdomain: true,
                createdAt: true,
            },
        });

        if (profileImage) {
            const profilePictureUrl = await storageService.save(profileImage, 'teachers');
            await prisma.teacher.update({ where: { id }, data: { profilePictureUrl } });
            updated.profilePictureUrl = profilePictureUrl;
            await storageService.delete(existing.profilePictureUrl);
        } else if (input.profilePictureUrl !== undefined && input.profilePictureUrl !== existing.profilePictureUrl) {
            await storageService.delete(existing.profilePictureUrl);
        }

        return updated;
    }

    public async delete(id: number) {
        const existing = await prisma.teacher.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Teacher not found.');
        }

        // Check if teacher has associated data, soft delete if needed or clean delete
        await prisma.teacher.update({
            where: { id },
            data: { accountStatus: 'inactive' },
        });

        await storageService.delete(existing.profilePictureUrl);

        return { message: 'Teacher deactivated successfully.' };
    }

    public async updateStatus(id: number, status: string) {
        const existing = await prisma.teacher.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Teacher not found.');
        }

        const updated = await prisma.teacher.update({
            where: { id },
            data: { accountStatus: status },
            select: {
                id: true,
                fullName: true,
                accountStatus: true,
            },
        });

        return updated;
    }

    public async getLatest(limit: number = 5) {
        const teachers = await prisma.teacher.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                subjectSpecialization: true,
                accountStatus: true,
                createdAt: true,
                _count: {
                    select: {
                        students: { where: { deletedAt: null } },
                    },
                },
            },
        });

        return teachers.map((t) => ({
            id: String(t.id),
            name: t.fullName,
            email: t.email,
            subject: t.subjectSpecialization || 'عام',
            studentsCount: t._count.students,
            status: ((t.accountStatus || 'active').toUpperCase()) as 'ACTIVE' | 'TRIAL' | 'EXPIRED',
            joinDate: t.createdAt.toISOString().split('T')[0],
        }));
    }
}

export const teacherService = new TeacherService();
