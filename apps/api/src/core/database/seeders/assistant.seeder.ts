import { prisma } from '../prisma.client'
import { hashPassword } from '../../utils/auth/password'

const assistantPermissions = ['attendance_write', 'attendance_view', 'students_view', 'students_manage', 'groups_view']

export async function seedAssistantData(teacherId: number) {
  const assistantPasswordHash = await hashPassword('assist123')
  const assistant = await prisma.teacherAssistant.upsert({
    where: { email: 'hassan.assist@edu.eg' },
    update: {
      teacherId,
      fullName: 'حسن كمال',
      username: 'hassan_assist',
      phoneNumber: '01234567890',
    },
    create: {
      teacherId,
      fullName: 'حسن كمال',
      username: 'hassan_assist',
      email: 'hassan.assist@edu.eg',
      password: assistantPasswordHash,
      phoneNumber: '01234567890',
    },
  })

  const permissions = await prisma.permission.findMany({
    where: { key: { in: assistantPermissions } },
  })

  for (const permission of permissions) {
    await prisma.assistantPermission.upsert({
      where: {
        assistantId_permissionId: {
          assistantId: assistant.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        assistantId: assistant.id,
        permissionId: permission.id,
      },
    })
  }

  console.log('  ✅ Demo assistant and permissions verified')
}
