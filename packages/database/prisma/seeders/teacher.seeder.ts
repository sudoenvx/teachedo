import { hashPassword } from "@teachedo/utils/encryption";
import { PrismaClient } from "../../src";

async function seedTeacherData(prisma: PrismaClient) {
    await prisma.teacher.upsert({
        where: { username: 'teachedo' },
        update: {},
        create: {
            username: "teachedo",
            password: await hashPassword('teachedo'),
            fullName: "Mohamed Salah",
            pricePerStudent: 10,
            onboardingCompletedAt: new Date()
        }
    })
}

export default seedTeacherData