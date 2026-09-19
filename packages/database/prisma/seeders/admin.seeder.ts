import { hashPassword } from "@teachedo/utils/encryption";
import { PrismaClient } from "../../src";

async function seedAdmin(prisma: PrismaClient) {
    await prisma.admin.upsert({
        where: { email: 'admin@teachedo.com' },
        update: {},
        create: {
            email: 'admin@teachedo.com',
            name: "علي طارق",
            password: await hashPassword('adminx'),
        }
    })
}

export default seedAdmin