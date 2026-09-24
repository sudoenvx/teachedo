import { prisma } from '../../core/database/prisma.client';
import { NotFoundError } from '../../shared/contracts/api-error';
import type { CreateClassInput, CreateClassSessionInput, UpdateClassInput } from './group.schema';

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
                    take: 30,
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
