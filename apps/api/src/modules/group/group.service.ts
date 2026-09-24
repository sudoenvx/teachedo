import { prisma } from '../../core/database/prisma.client';
import { NotFoundError } from '../../shared/contracts/api-error';
import type {
    ClassSessionsQueryInput,
    CreateClassInput,
    CreateClassSessionInput,
    RecordSessionAttendanceInput,
    RescheduleClassSessionInput,
    UpdateClassInput,
} from './group.schema';

function toDateOnly(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
}

function toTime(value?: string | null) {
    if (!value) return null;
    const [hours = 0, minutes = 0] = value.split(':').map(Number);
    const result = new Date(0);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
}

function dateRange(query: ClassSessionsQueryInput) {
    return {
        ...(query.from ? { gte: toDateOnly(query.from) } : {}),
        ...(query.to ? { lte: toDateOnly(query.to) } : {}),
    };
}

export class ClassService {
    public async list(teacherId: number) {
        const classes = await prisma.studentClass.findMany({
            where: { teacherId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
                center: { select: { id: true, name: true, location: true, area: true, phoneNumber: true, commission: true, commissionType: true } },
                _count: { select: { enrollments: true, classSessions: true } },
            },
        });
        return classes;
    }

    public async findById(id: number, teacherId: number) {
        const group = await prisma.studentClass.findFirst({
            where: { id, teacherId, deletedAt: null },
            include: {
                center: { select: { id: true, name: true, location: true, area: true, phoneNumber: true, commission: true, commissionType: true } },
                _count: { select: { enrollments: true, classSessions: true } },
                enrollments: {
                    where: { status: 'active', student: { deletedAt: null } },
                    orderBy: { student: { fullName: 'asc' } },
                    select: {
                        status: true,
                        enrollmentDate: true,
                        customPrice: true,
                        studentAttendanceType: true,
                        student: {
                            select: {
                                id: true,
                                fullName: true,
                                studentCode: true,
                                phoneNumber: true,
                                profilePictureUrl: true,
                                status: true,
                                studyStage: { select: { stageName: true } },
                            },
                        },
                    },
                },
                classSessions: {
                    orderBy: { sessionDate: 'desc' },
                    select: {
                        id: true,
                        sessionDate: true,
                        sessionType: true,
                        scheduledStartTime: true,
                        durationMinutes: true,
                        isMandatory: true,
                        topic: true,
                        status: true,
                        isCompleted: true,
                        attendance: {
                            select: { studentId: true, status: true },
                        },
                    },
                },
            },
        });
        if (!group) throw new NotFoundError('Class not found.');
        return group;
    }

    public async create(teacherId: number, input: CreateClassInput) {
        if (input.centerId) {
            const center = await prisma.center.findFirst({
                where: { id: input.centerId, teacherId, isActive: true },
                select: { id: true },
            });
            if (!center) throw new NotFoundError('Center not found.');
        }
        return prisma.$transaction(async (transaction) => {
            const group = await transaction.studentClass.create({
            data: {
                teacherId,
                className: input.className,
                gradeLevel: input.gradeLevel,
                centerId: input.centerId ?? null,
                sessionPrice: input.sessionPrice ?? null,
                monthlyPrice: input.monthlyPrice ?? null,
                maxCapacity: input.maxCapacity ?? null,
                groupTier: input.groupTier,
                deliveryMode: input.deliveryMode,
            },
            });
            const created = await transaction.studentClass.findUnique({
                where: { id: group.id },
                include: {
                    center: { select: { id: true, name: true, location: true, area: true, phoneNumber: true, commission: true, commissionType: true } },
                    _count: { select: { enrollments: true, classSessions: true } },
                },
            });
            return created;
        });
    }

    public async update(id: number, teacherId: number, input: UpdateClassInput) {
        await this.findById(id, teacherId);
        if (input.centerId) {
            const center = await prisma.center.findFirst({
                where: { id: input.centerId, teacherId, isActive: true },
                select: { id: true },
            });
            if (!center) throw new NotFoundError('Center not found.');
        }
        return prisma.$transaction(async (transaction) => {
            const group = await transaction.studentClass.update({
                where: { id },
                data: {
                ...(input.className !== undefined ? { className: input.className } : {}),
                ...(input.gradeLevel !== undefined ? { gradeLevel: input.gradeLevel } : {}),
                ...(input.centerId !== undefined ? { centerId: input.centerId ?? null } : {}),
                ...(input.sessionPrice !== undefined ? { sessionPrice: input.sessionPrice ?? null } : {}),
                ...(input.monthlyPrice !== undefined ? { monthlyPrice: input.monthlyPrice ?? null } : {}),
                ...(input.maxCapacity !== undefined ? { maxCapacity: input.maxCapacity ?? null } : {}),
                ...(input.groupTier !== undefined ? { groupTier: input.groupTier } : {}),
                ...(input.deliveryMode !== undefined ? { deliveryMode: input.deliveryMode } : {}),
                },
            });
            const updated = await transaction.studentClass.findUnique({
                where: { id: group.id },
                include: {
                    center: { select: { id: true, name: true, location: true, area: true, phoneNumber: true, commission: true, commissionType: true } },
                    _count: { select: { enrollments: true, classSessions: true } },
                },
            });
            return updated;
        });
    }

    public async delete(id: number, teacherId: number) {
        await this.findById(id, teacherId);
        await prisma.studentClass.update({ where: { id }, data: { deletedAt: new Date() } });
        return { message: 'Class deleted successfully.' };
    }

    public async listSessions(teacherId: number, query: ClassSessionsQueryInput) {
        const sessions = await prisma.classSession.findMany({
            where: {
                teacherId,
                status: { not: 'cancelled' },
                ...(query.from || query.to ? { sessionDate: dateRange(query) } : {}),
            },
            orderBy: [{ sessionDate: 'asc' }, { scheduledStartTime: 'asc' }],
            select: {
                id: true,
                classId: true,
                sessionDate: true,
                sessionType: true,
                scheduledStartTime: true,
                durationMinutes: true,
                isMandatory: true,
                topic: true,
                status: true,
                isCompleted: true,
                attendance: {
                    where: { status: { in: ['present', 'late'] } },
                    select: { studentId: true },
                },
                studentClass: {
                    select: {
                        className: true,
                        gradeLevel: true,
                        groupTier: true,
                        deliveryMode: true,
                        center: { select: { name: true } },
                        _count: {
                            select: {
                                enrollments: {
                                    where: { status: 'active', student: { deletedAt: null } },
                                },
                            },
                        },
                    },
                },
            },
        });

        return sessions.map(({ attendance, studentClass, ...session }) => {
            const { _count, ...group } = studentClass;
            return {
                ...session,
                checkedInCount: attendance.length,
                totalExpected: _count.enrollments,
                studentClass: group,
            };
        });
    }

    private async findSession(classId: number, sessionId: number, teacherId: number) {
        const session = await prisma.classSession.findFirst({
            where: { id: sessionId, classId, teacherId },
            select: { id: true, classId: true, teacherId: true },
        });
        if (!session) throw new NotFoundError('Class session not found.');
        return session;
    }

    public async rescheduleSession(
        classId: number,
        sessionId: number,
        teacherId: number,
        input: RescheduleClassSessionInput,
    ) {
        await this.findSession(classId, sessionId, teacherId);
        return prisma.classSession.update({
            where: { id: sessionId },
            data: {
                sessionDate: toDateOnly(input.sessionDate),
                ...(input.scheduledStartTime !== undefined
                    ? { scheduledStartTime: toTime(input.scheduledStartTime) }
                    : {}),
            },
        });
    }

    public async startSession(classId: number, sessionId: number, teacherId: number) {
        await this.findSession(classId, sessionId, teacherId);
        return prisma.classSession.update({
            where: { id: sessionId },
            data: { status: 'live', isCompleted: false },
        });
    }

    public async getLiveSession(classId: number, sessionId: number, teacherId: number) {
        await this.findSession(classId, sessionId, teacherId);
        return prisma.classSession.findUniqueOrThrow({
            where: { id: sessionId },
            select: {
                id: true,
                classId: true,
                sessionDate: true,
                sessionType: true,
                scheduledStartTime: true,
                durationMinutes: true,
                isMandatory: true,
                topic: true,
                status: true,
                isCompleted: true,
                studentClass: {
                    select: {
                        className: true,
                        gradeLevel: true,
                        groupTier: true,
                        deliveryMode: true,
                        center: { select: { name: true } },
                        enrollments: {
                            where: { status: 'active', student: { deletedAt: null } },
                            select: {
                                student: {
                                    select: { id: true, fullName: true, studentCode: true, profilePictureUrl: true },
                                },
                                studentAttendanceType: true,
                            },
                            orderBy: { student: { fullName: 'asc' } },
                        },
                    },
                },
                attendance: {
                    orderBy: { recordedAt: 'desc' },
                    select: {
                        id: true,
                        studentId: true,
                        status: true,
                        excuseReason: true,
                        recordedAt: true,
                        student: { select: { fullName: true, studentCode: true } },
                    },
                },
            },
        });
    }

    public async recordAttendance(
        classId: number,
        sessionId: number,
        teacherId: number,
        input: RecordSessionAttendanceInput,
    ) {
        await this.findSession(classId, sessionId, teacherId);
        const student = await prisma.student.findFirst({
            where: {
                teacherId,
                deletedAt: null,
                ...(input.studentId
                    ? { id: input.studentId }
                    : input.studentCode
                        ? { studentCode: input.studentCode }
                        : {}),
                classEnrollments: { some: { classId, status: 'active' } },
            },
            select: { id: true },
        });
        if (!student) throw new NotFoundError('Active enrolled student not found.');

        await prisma.attendance.upsert({
            where: { sessionId_studentId: { sessionId, studentId: student.id } },
            update: {
                status: input.status,
                excuseReason: input.status === 'excused' ? input.excuseReason ?? null : null,
                recordedAt: new Date(),
            },
            create: {
                sessionId,
                studentId: student.id,
                teacherId,
                status: input.status,
                excuseReason: input.status === 'excused' ? input.excuseReason ?? null : null,
            },
        });

        return this.getLiveSession(classId, sessionId, teacherId);
    }

    public async createSession(classId: number, teacherId: number, input: CreateClassSessionInput) {
        await this.findById(classId, teacherId);

        const session = await prisma.classSession.create({
            data: {
                classId,
                teacherId,
                sessionDate: toDateOnly(input.sessionDate),
                sessionType: input.sessionType,
                scheduledStartTime: toTime(input.scheduledStartTime),
                durationMinutes: input.durationMinutes,
                isMandatory: input.isMandatory,
                topic: input.topic ?? null,
                status: 'scheduled',
            },
            select: {
                id: true,
                sessionDate: true,
                sessionType: true,
                scheduledStartTime: true,
                durationMinutes: true,
                isMandatory: true,
                topic: true,
                status: true,
                isCompleted: true,
                attendance: { select: { studentId: true, status: true } },
            },
        });

        return session;
    }
}

export const classService = new ClassService();
