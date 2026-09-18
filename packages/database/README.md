# @teachedo/database

Shared database package for the Orthedo monorepo. Owns the Prisma schema,
migrations, seeders, and a `PrismaClient` wired to the PostgreSQL driver adapter.

## Structure

```text
packages/database
├── prisma.config.ts      # Prisma CLI config (schema, migrations, seed, DATABASE_URL)
├── prisma/
│   ├── schema.prisma     # Data model (PostgreSQL provider)
│   ├── migrations/       # Generated migration history (`pnpm db:migrate`)
│   ├── seed.ts           # Seed entry point (`tsx prisma/seed.ts`)
│   └── seeders/          # Modular seeders, run in order from seeders/index.ts
└── src/
    ├── client.ts         # PrismaClient singleton + @prisma/adapter-pg (PostgreSQL driver adapter)
    ├── index.ts          # Public entry point (re-exports client + generated types)
    └── generated/prisma/ # Generated Prisma Client (gitignored)
```

## Setup

1. Install dependencies (from the repo root): `pnpm install`
2. Copy the environment template and set a real `DATABASE_URL`:

   ```bash
   cp packages/database/.env.example packages/database/.env
   ```

## Commands

Run from the repo root (Turborepo) or inside `packages/database`:

| Script        | Command                          | Purpose                                 |
| ------------- | -------------------------------- | --------------------------------------- |
| `db:generate` | `prisma generate`                | Generate the Prisma Client              |
| `db:migrate`  | `prisma migrate dev`             | Create/apply dev migrations             |
| `db:deploy`   | `prisma migrate deploy`          | Apply migrations (CI/production)        |
| `db:push`     | `prisma db push`                 | Push schema without a migration         |
| `db:reset`    | `prisma migrate reset`           | Drop, re-migrate, and reseed the DB     |
| `db:seed`     | `prisma db seed`                 | Run `prisma/seed.ts`                    |
| `db:studio`   | `prisma studio`                  | Browse/edit data in Prisma Studio       |

Examples:

```bash
pnpm db:generate            # from the repo root
pnpm --filter @teachedo/database db:migrate
```

## Consuming from an app

Add it to any app/package as a workspace dependency:

```bash
pnpm --filter <app> add @teachedo/database@workspace:*
```

Then use the shared client and generated types:

```ts
import { prisma } from "@teachedo/database";

const users = await prisma.user.findMany();
```

The Turborepo config already makes `build`, `dev`, and `typecheck` depend on
`db:generate`, so the generated client is always available before those tasks run.