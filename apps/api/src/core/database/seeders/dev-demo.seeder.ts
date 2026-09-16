import { seedAssistantData } from './assistant.seeder'
import { seedDemoBilling } from './demo-billing.seeder'
import { seedDemoEnrollments } from './demo-enrollments.seeder'
import { seedDemoGroups } from './demo-groups.seeder'
import { seedDemoStages } from './demo-stages.seeder'
import { seedDemoStudents } from './demo-students.seeder'
import { seedDemoTeachers } from './demo-teachers.seeder'

export async function seedDevDemoData() {
  console.log('🧪 [2/2] Seeding Development Demo Data...')

  const { teacherId } = await seedDemoTeachers()
  const { stage1Id, stage2Id } = await seedDemoStages(teacherId)
  const { group1Id, group2Id } = await seedDemoGroups(teacherId, stage1Id, stage2Id)
  const { student1Id, student2Id } = await seedDemoStudents(teacherId, stage1Id, stage2Id)

  await seedAssistantData(teacherId)
  await seedDemoEnrollments(group1Id, group2Id, student1Id, student2Id)
  await seedDemoBilling(teacherId)

  console.log('  ✅ Demo stages, groups, students, and billing records initialized')
}
