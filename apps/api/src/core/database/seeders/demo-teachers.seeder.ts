import { prisma } from '../prisma.client'
import { hashPassword } from '../../utils/auth/password'

export async function seedDemoTeachers() {
  const password = await hashPassword('teacher123')
  const teachers = [
    {
      email: 'ahmed.phys@edu.eg', username: 'ahmed_phys', fullName: 'أحمد محمود',
      phoneNumber: '01012345678', subjectSpecialization: 'الفيزياء', accountStatus: 'active',
    },
    {
      email: 'sara.math@edu.eg', username: 'sara_math', fullName: 'سارة إبراهيم',
      phoneNumber: '01098765432', subjectSpecialization: 'math', accountStatus: 'active',
    },
    {
      email: 'mohamed.chem@edu.eg', username: 'mohamed_chem', fullName: 'محمد علي',
      phoneNumber: '01122334455', subjectSpecialization: 'الكيمياء', accountStatus: 'trial',
    },
  ]

  const [teacher1] = await Promise.all(teachers.map((teacher) => prisma.teacher.upsert({
    where: { email: teacher.email },
    update: teacher,
    create: { ...teacher, password },
  })))

  console.log('  ✅ 3 Demo teachers verified')
  return { teacherId: teacher1.id }
}
