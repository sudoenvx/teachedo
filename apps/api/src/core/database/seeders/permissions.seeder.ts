import { prisma } from '../prisma.client'

const permissions = [
  { key: 'finance_view', label: 'View financial data and invoices' },
  { key: 'finance_manage', label: 'Manage invoices and record payments' },
  { key: 'attendance_view', label: 'View attendance records' },
  { key: 'attendance_write', label: 'Take and edit attendance' },
  { key: 'students_view', label: 'View student profiles' },
  { key: 'students_manage', label: 'Add, edit and manage students' },
  { key: 'groups_view', label: 'View groups and schedules' },
  { key: 'groups_manage', label: 'Manage groups and class schedules' },
  { key: 'lessons_manage', label: 'Manage lessons and content' },
  { key: 'question_bank_manage', label: 'Manage question bank and quizzes' },
  { key: 'notifications_send', label: 'Send broadcast notifications' },
]

export async function seedPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { label: permission.label },
      create: permission,
    })
  }
  console.log(`  ✅ ${permissions.length} permissions catalogued`)
}