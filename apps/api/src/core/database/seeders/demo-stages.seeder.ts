import { prisma } from '../prisma.client'

export async function seedDemoStages(teacherId: number) {
  const stages = await Promise.all([
    prisma.studyStage.upsert({
      where: { id: 1 },
      update: { stageName: 'الثانوي - الصف 1', stageGroup: 'secondary', gradeNumber: 1, teacherId },
      create: { stageName: 'الثانوي - الصف 1', stageGroup: 'secondary', gradeNumber: 1, teacherId, orderingIndex: 10 },
    }),
    prisma.studyStage.upsert({
      where: { id: 2 },
      update: { stageName: 'الثانوي - الصف 2', stageGroup: 'secondary', gradeNumber: 2, teacherId },
      create: { stageName: 'الثانوي - الصف 2', stageGroup: 'secondary', gradeNumber: 2, teacherId, orderingIndex: 11 },
    }),
  ])

  return { stage1Id: stages[0].id, stage2Id: stages[1].id }
}
