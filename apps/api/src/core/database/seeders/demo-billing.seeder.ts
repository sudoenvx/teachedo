import { prisma } from '../prisma.client'

export async function seedDemoBilling(teacherId: number) {
  const billingMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const cycle = await prisma.platformBillingCycle.upsert({
    where: { teacherId_billingMonth: { teacherId, billingMonth } },
    update: {
      activeStudentsSnapshot: 2, rateApplied: 15, totalDue: 30, amountPaid: 30, status: 'paid',
    },
    create: {
      teacherId, billingMonth, activeStudentsSnapshot: 2, rateApplied: 15,
      totalDue: 30, amountPaid: 30, status: 'paid', paidAt: new Date(),
    },
  })

  const payment = {
    teacherId, billingCycleId: cycle.id, amount: 30, paymentMethod: 'instapay',
    transactionReference: 'IP-2026-DEMO-001', status: 'confirmed',
    paidAt: new Date(), confirmedAt: new Date(),
  }
  const existingPayment = await prisma.platformPayment.findFirst({
    where: { teacherId, transactionReference: payment.transactionReference },
  })

  if (existingPayment) {
    await prisma.platformPayment.update({ where: { id: existingPayment.id }, data: payment })
  } else {
    await prisma.platformPayment.create({ data: payment })
  }
}
