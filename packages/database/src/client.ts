import "dotenv/config";

import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from "./generated/prisma/client.ts";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `Missing environment variable "${name}". ` +
                "Copy packages/database/.env.example to packages/database/.env and set it, " +
                "or export it in the environment running your app.",
        );
    }
    return value;
}

function createPrismaClient(): PrismaClient {
    const databseUrl = requireEnv("DATABASE_URL")
    const adapter = new PrismaMariaDb(databseUrl);
    return new PrismaClient({ adapter });
}

// Reuse a single client across hot-reloads in long-running dev processes
// (e.g. Next.js, Vite, node --watch) to avoid exhausting the connection pool.
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

/** Process-wide PrismaClient bound to the PostgreSQL driver adapter. */
export const db = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== "production") {
    globalForPrisma.__prisma = db;
}

/** Disconnect the shared PrismaClient (used by CLI scripts and graceful shutdowns). */
export async function disconnect(): Promise<void> {
    await db.$disconnect();
}