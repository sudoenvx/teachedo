import { prisma } from '../../core/database/prisma.client'
import { NotFoundError } from '../../shared/contracts/api-error'
import type { CreateCenterInput, UpdateCenterInput } from './center.schema'

export class CenterService {
  list(teacherId: number) {
    return prisma.center.findMany({
      where: { teacherId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { classes: true } } },
    })
  }

  async findById(id: number, teacherId: number) {
    const center = await prisma.center.findFirst({
      where: { id, teacherId, isActive: true },
      include: {
        _count: { select: { classes: true } },
        classes: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            className: true,
            gradeLevel: true,
            sessionPrice: true,
            monthlyPrice: true,
            maxCapacity: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
    })
    if (!center) throw new NotFoundError('Center not found.')

    const now = new Date()
    const year = now.getFullYear()
    const monthStart = new Date(year, now.getMonth(), 1)
    const nextMonthStart = new Date(year, now.getMonth() + 1, 1)
    const yearStart = new Date(year, 0, 1)
    const nextYearStart = new Date(year + 1, 0, 1)
    const yearPayments = await prisma.studentPayment.findMany({
        where: { teacherId, paidAt: { gte: yearStart, lt: nextYearStart }, student: { classEnrollments: { some: { studentClass: { centerId: id } } } } },
        select: { amount: true, paidAt: true, studentId: true },
      })
    const commission = (amount: number, payingStudents: number) => center.commissionType === 'percentage'
      ? amount * Number(center.commission ?? 0) / 100
      : center.commissionType === 'fixed_per_student' ? Number(center.commission ?? 0) * payingStudents : 0
    const chart = Array.from({ length: 12 }, (_, index) => {
      const monthPayments = yearPayments.filter((payment) => payment.paidAt.getMonth() === index)
      const income = monthPayments.reduce((total, payment) => total + Number(payment.amount), 0)
      return { month: index + 1, income, commission: commission(income, new Set(monthPayments.map((payment) => payment.studentId)).size) }
    })
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()
    const month = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1
      const dayPayments = yearPayments.filter((payment) => payment.paidAt.getMonth() === now.getMonth() && payment.paidAt.getDate() === day)
      const income = dayPayments.reduce((total, payment) => total + Number(payment.amount), 0)
      return { day, income, commission: commission(income, new Set(dayPayments.map((payment) => payment.studentId)).size) }
    })
    const currentMonthPayments = yearPayments.filter((payment) => payment.paidAt >= monthStart && payment.paidAt < nextMonthStart)
    const currentMonthIncome = currentMonthPayments.reduce((total, payment) => total + Number(payment.amount), 0)
    const currentMonthPayingStudents = new Set(currentMonthPayments.map((payment) => payment.studentId)).size
    return { ...center, analytics: { currentMonthIncome, currentMonthCommission: commission(currentMonthIncome, currentMonthPayingStudents), year: chart, month } }
  }

  create(teacherId: number, input: CreateCenterInput) {
    return prisma.center.create({
      data: {
        teacherId,
        name: input.name,
        location: input.location ?? null,
        area: input.area ?? null,
        phoneNumber: input.phoneNumber ?? null,
        commission: input.commission ?? null,
        commissionType: input.commissionType,
      },
    })
  }

  async update(id: number, teacherId: number, input: UpdateCenterInput) {
    await this.findById(id, teacherId)
    return prisma.center.update({ where: { id }, data: input })
  }

  async remove(id: number, teacherId: number) {
    await this.findById(id, teacherId)
    await prisma.center.update({ where: { id }, data: { isActive: false } })
    return { message: 'Center deleted successfully.' }
  }
}

export const centerService = new CenterService()