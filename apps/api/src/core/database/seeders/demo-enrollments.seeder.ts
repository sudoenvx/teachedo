import { prisma } from '../prisma.client'

export async function seedDemoEnrollments(group1Id: number, group2Id: number, student1Id: number, student2Id: number) {
  await Promise.all([
    prisma.groupEnrollment.upsert({
      where: { groupId_studentId: { groupId: group1Id, studentId: student1Id } },
      update: { status: 'active' },
      create: { groupId: group1Id, studentId: student1Id, status: 'active', enrollmentDate: new Date() },
    }),
    prisma.groupEnrollment.upsert({
      where: { groupId_studentId: { groupId: group2Id, studentId: student2Id } },
      update: { status: 'active' },
      create: { groupId: group2Id, studentId: student2Id, status: 'active', enrollmentDate: new Date() },
    }),
  ])
}
