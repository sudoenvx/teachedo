import { PrismaClient } from "../../src/index";
import seedAdmin from "./admin.seeder";
import { seedPermissions } from "./permissions.seeder";
import { seedPolicyData } from "./policy.seeder";
import { seedSettingsData } from "./settings.seeder";
import seedTeacherData from "./teacher.seeder";

export async function runSeeders(_prisma: PrismaClient): Promise<void> {
    await seedAdmin(_prisma)
    await seedPolicyData(_prisma)
    await seedPermissions(_prisma)
    await seedSettingsData(_prisma)
    await seedTeacherData(_prisma)
}