import { PrismaClient } from "../../src/index";
import seedAdmin from "./admin.seeder";

export async function runSeeders(_prisma: PrismaClient): Promise<void> {
    await seedAdmin(_prisma)
}