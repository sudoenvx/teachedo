import { prisma } from '../../core/database/prisma.client';
import { NotFoundError } from '../../shared/contracts/api-error';
import type { CreateGroupInput, UpdateGroupInput } from './group.schema';

function toTime(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date(1970, 0, 1);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function durationMinutes(startTime: string, endTime: string) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
}

function withEndTimes<T extends { schedules: Array<{ startTime: Date; durationMinutes: number }> }>(group: T) {
    return {
        ...group,
        schedules: group.schedules.map((schedule) => ({
            ...schedule,
            endTime: new Date(schedule.startTime.getTime() + schedule.durationMinutes * 60_000),
        })),
    };
}

export class GroupService {
    public async list(teacherId: number) {
        const groups = await prisma.studentGroup.findMany({
            where: { teacherId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
                studyStage: { select: { id: true, stageName: true } },
                _count: { select: { enrollments: true, classSessions: true } },
                schedules: true,
            },
        });
        return groups.map(withEndTimes);
    }

    public async findById(id: number, teacherId: number) {
        const group = await prisma.studentGroup.findFirst({
            where: { id, teacherId, deletedAt: null },
            include: {
                studyStage: { select: { id: true, stageName: true } },
                _count: { select: { enrollments: true, classSessions: true } },
                schedules: true,
                enrollments: {
                    where: { status: 'active', student: { deletedAt: null } },
                    orderBy: { student: { fullName: 'asc' } },
                    select: {
                        status: true,
                        enrollmentDate: true,
                        customPrice: true,
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
                        startTime: true,
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
        if (!group) throw new NotFoundError('Group not found.');
        return withEndTimes(group);
    }

    public async create(teacherId: number, input: CreateGroupInput) {
        return prisma.$transaction(async (transaction) => {
            const group = await transaction.studentGroup.create({
            data: {
                teacherId,
                groupName: input.groupName,
                studyStageId: input.studyStageId ?? null,
                standardMonthlyFee: input.standardMonthlyFee ?? null,
                maxCapacity: input.maxCapacity ?? null,
            },
            });
            if (input.schedules?.length) {
                await transaction.groupSchedule.createMany({ data: input.schedules.map((schedule) => ({ groupId: group.id, dayOfWeek: schedule.dayOfWeek, startTime: toTime(schedule.startTime), durationMinutes: durationMinutes(schedule.startTime, schedule.endTime) })) });
            }
            const created = await transaction.studentGroup.findUnique({
                where: { id: group.id },
                include: {
                    studyStage: { select: { id: true, stageName: true } },
                    _count: { select: { enrollments: true, classSessions: true } },
                    schedules: true,
                },
            });
            return created ? withEndTimes(created) : created;
        });
    }

    public async update(id: number, teacherId: number, input: UpdateGroupInput) {
        await this.findById(id, teacherId);
        return prisma.$transaction(async (transaction) => {
            const group = await transaction.studentGroup.update({
                where: { id },
                data: {
                ...(input.groupName !== undefined ? { groupName: input.groupName } : {}),
                ...(input.studyStageId !== undefined ? { studyStageId: input.studyStageId ?? null } : {}),
                ...(input.standardMonthlyFee !== undefined ? { standardMonthlyFee: input.standardMonthlyFee ?? null } : {}),
                ...(input.maxCapacity !== undefined ? { maxCapacity: input.maxCapacity ?? null } : {}),
                },
            });
            if (input.schedules !== undefined) {
                await transaction.groupSchedule.deleteMany({ where: { groupId: id } });
                await transaction.groupSchedule.createMany({ data: input.schedules.map((schedule) => ({ groupId: id, dayOfWeek: schedule.dayOfWeek, startTime: toTime(schedule.startTime), durationMinutes: durationMinutes(schedule.startTime, schedule.endTime) })) });
            }
            const updated = await transaction.studentGroup.findUnique({
                where: { id: group.id },
                include: {
                    studyStage: { select: { id: true, stageName: true } },
                    _count: { select: { enrollments: true, classSessions: true } },
                    schedules: true,
                },
            });
            return updated ? withEndTimes(updated) : updated;
        });
    }

    public async delete(id: number, teacherId: number) {
        await this.findById(id, teacherId);
        await prisma.studentGroup.update({ where: { id }, data: { deletedAt: new Date() } });
        return { message: 'Group deleted successfully.' };
    }
}

export const groupService = new GroupService();