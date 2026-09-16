import { prisma } from '../prisma.client'

export async function seedDemoGroups(teacherId: number, stage1Id: number, stage2Id: number) {
  const groups = await Promise.all([
    prisma.studentGroup.upsert({
      where: { id: 1 },
      update: { groupName: 'مجموعة العباقرة - السبت والثلاثاء', standardMonthlyFee: 250 },
      create: {
        teacherId, studyStageId: stage1Id, groupName: 'مجموعة العباقرة - السبت والثلاثاء',
        standardMonthlyFee: 250, maxCapacity: 30,
      },
    }),
    prisma.studentGroup.upsert({
      where: { id: 2 },
      update: { groupName: 'مجموعة المتفوقين - الأحد والأربعاء', standardMonthlyFee: 300 },
      create: {
        teacherId, studyStageId: stage2Id, groupName: 'مجموعة المتفوقين - الأحد والأربعاء',
        standardMonthlyFee: 300, maxCapacity: 25,
      },
    }),
  ])

  return { group1Id: groups[0].id, group2Id: groups[1].id }
}
