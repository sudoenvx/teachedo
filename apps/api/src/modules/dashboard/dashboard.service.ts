import { prisma } from '../../core/database/prisma.client';

export class DashboardService {
    public async getAdminOverview() {
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
            return {
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                label: date.toLocaleDateString('ar-EG', { month: 'short' }),
            };
        });
        const currentMonth = months[months.length - 1].key;

        const [billingCycles, overdueCycles, topTeachers] = await Promise.all([
            prisma.platformBillingCycle.groupBy({
                by: ['billingMonth'],
                where: { billingMonth: { in: months.map((month) => month.key) } },
                _sum: { amountPaid: true },
            }),
            prisma.platformBillingCycle.findMany({
                where: {
                    billingMonth: currentMonth,
                    status: { in: ['unpaid', 'overdue', 'suspended'] },
                },
                select: { totalDue: true, amountPaid: true },
            }),
            prisma.teacher.findMany({
                take: 5,
                orderBy: { students: { _count: 'desc' } },
                select: {
                    id: true,
                    fullName: true,
                    subjectSpecialization: true,
                    _count: { select: { students: { where: { deletedAt: null } } } },
                },
            }),
        ]);

        const billingByMonth = new Map(
            billingCycles.map((cycle) => [cycle.billingMonth, Number(cycle._sum.amountPaid || 0)]),
        );
        const outstanding = overdueCycles.reduce(
            (total, cycle) => total + Number(cycle.totalDue) - Number(cycle.amountPaid),
            0,
        );

        return {
            revenueHistory: months.map((month) => ({
                month: month.label,
                amount: billingByMonth.get(month.key) || 0,
            })),
            cashFlow: {
                outstanding: Math.max(0, outstanding),
                overdueTeachers: overdueCycles.length,
            },
            topTeachers: topTeachers.map((teacher) => ({
                id: teacher.id,
                name: teacher.fullName,
                subject: teacher.subjectSpecialization || 'عام',
                studentsCount: teacher._count.students,
            })),
        };
    }

    public async getAdminStats(month?: string) {
        const now = new Date();
        const currentMonthStr = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // 30 days ago boundary for growth rate comparison
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

        const [
            activeTeachers,
            totalTeachers,
            teachersLast30Days,
            teachersPrev30Days,
            enrolledStudents,
            studentsLast30Days,
            studentsPrev30Days,
            activeGroups,
            billingCyclesSum,
            platformPaymentsSum,
        ] = await Promise.all([
            prisma.teacher.count({
                where: { accountStatus: 'active' },
            }),
            prisma.teacher.count(),
            prisma.teacher.count({
                where: { createdAt: { gte: thirtyDaysAgo } },
            }),
            prisma.teacher.count({
                where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            }),
            prisma.student.count({
                where: { deletedAt: null },
            }),
            prisma.student.count({
                where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
            }),
            prisma.student.count({
                where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, deletedAt: null },
            }),
            prisma.studentGroup.count({
                where: { deletedAt: null },
            }),
            prisma.platformBillingCycle.aggregate({
                where: { billingMonth: currentMonthStr },
                _sum: { totalDue: true, amountPaid: true },
            }),
            prisma.platformPayment.aggregate({
                where: { status: 'confirmed' },
                _sum: { amount: true },
            }),
        ]);

        const calcGrowth = (curr: number, prev: number): number => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        };

        const activeTeachersGrowth = calcGrowth(teachersLast30Days, teachersPrev30Days);
        const enrolledStudentsGrowth = calcGrowth(studentsLast30Days, studentsPrev30Days);

        const monthlyRevenue = Number(billingCyclesSum._sum.amountPaid || platformPaymentsSum._sum.amount || 0);

        return {
            activeTeachers,
            totalTeachers,
            activeTeachersGrowth,
            enrolledStudents,
            enrolledStudentsGrowth,
            activeGroups,
            monthlyRevenue,
            systemHealth: 99.8,
            currentMonth: currentMonthStr,
            billingSummary: {
                totalBilled: Number(billingCyclesSum._sum.totalDue || 0),
                totalCollected: Number(billingCyclesSum._sum.amountPaid || 0),
            },
        };
    }

    public async getTeacherStats(teacherId: number) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalStudents,
            activeGroups,
            totalSessions,
            sessionsThisMonth,
            paymentsAggregate,
            pendingInvoices,
        ] = await Promise.all([
            prisma.student.count({
                where: { teacherId, deletedAt: null },
            }),
            prisma.studentGroup.count({
                where: { teacherId, deletedAt: null },
            }),
            prisma.classSession.count({
                where: { teacherId },
            }),
            prisma.classSession.count({
                where: { teacherId, sessionDate: { gte: firstDayOfMonth } },
            }),
            prisma.studentPayment.aggregate({
                where: { teacherId, paidAt: { gte: firstDayOfMonth } },
                _sum: { amount: true },
            }),
            prisma.studentInvoice.count({
                where: { teacherId, status: 'unpaid' },
            }),
        ]);

        return {
            teacherId,
            totalStudents,
            activeGroups,
            totalSessions,
            sessionsThisMonth,
            revenueThisMonth: Number(paymentsAggregate._sum.amount || 0),
            pendingInvoices,
        };
    }

    public async getUpcomingTeacherSessions(teacherId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return prisma.classSession.findMany({
            where: {
                teacherId,
                sessionDate: { gte: today },
                isCompleted: false,
                status: { not: 'cancelled' },
            },
            take: 8,
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            select: {
                id: true,
                sessionDate: true,
                startTime: true,
                topic: true,
                status: true,
                group: { select: { groupName: true } },
            },
        });
    }
}

export const dashboardService = new DashboardService();
