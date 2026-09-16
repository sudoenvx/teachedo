import { prisma } from '../prisma.client'
import { hashPassword } from '../../utils/auth/password'

export async function seedDemoStudents(teacherId: number, stage1Id: number, stage2Id: number) {
  const parentPassword = await hashPassword('parent123')
  const studentPassword = await hashPassword('123456')
  const parent = await prisma.parent.upsert({
    where: { phoneNumber: '01000000001' },
    update: { fullName: 'محمود عبد الله' },
    create: {
      phoneNumber: '01000000001', fullName: 'محمود عبد الله',
      whatsappNumber: '01000000001', password: parentPassword,
    },
  })

  const [student1, student2] = await Promise.all([
    prisma.student.upsert({
      where: { id: 1 },
      update: { fullName: 'علي محمود عبد الله', studentCode: 'STU-1-1001', password: studentPassword },
      create: {
        teacherId, parentId: parent.id, studyStageId: stage1Id, fullName: 'علي محمود عبد الله',
        studentCode: 'STU-1-1001', password: studentPassword, phoneNumber: '01000000002', status: 'active',
      },
    }),
    prisma.student.upsert({
      where: { id: 2 },
      update: { fullName: 'عمر محمود عبد الله', studentCode: 'STU-1-1002', password: studentPassword },
      create: {
        teacherId, parentId: parent.id, studyStageId: stage2Id, fullName: 'عمر محمود عبد الله',
        studentCode: 'STU-1-1002', password: studentPassword, phoneNumber: '01000000003', status: 'active',
      },
    }),
  ])

  return { student1Id: student1.id, student2Id: student2.id }
}
