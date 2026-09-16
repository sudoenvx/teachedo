# @teachedo/api-sandbox

Minimal Node.js TypeScript Express server in the `sandbox/` folder for testing, building, and integrating with `@teachedo/database-sandbox` (Prisma).

## Features

- **Framework**: Express 5 + TypeScript + ESM (`"type": "module"`)
- **Database**: Integrated with `@teachedo/database-sandbox` (`PrismaClient` exported from database-sandbox)
- **Tooling**: Built with `tsx` for fast dev execution & `@teachedo/tsconfig`

## Available Routes

- `GET /` - Root overview & API documentation
- `GET /health` - Server health check & database ping (`SELECT 1`)
- `GET /api/users` - List all users from Prisma `db.user.findMany()`
- `GET /api/users/:id` - Fetch user by ID
- `POST /api/users` - Create user `{ "email": "user@example.com", "name": "John" }`
- `DELETE /api/users/:id` - Delete user by ID

## Running

From repo root:

```bash
# Generate database client first if needed
pnpm --filter @teachedo/database-sandbox db:generate

# Start api-sandbox dev server
pnpm --filter @teachedo/api-sandbox dev
```
