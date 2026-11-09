# SoilSense web starter

Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM 7, and Supabase PostgreSQL.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. No credentials are needed to view the initial empty dashboard. It has no simulated readings or fertilizer advice. Login and private dashboard reads are not implemented yet.

For real uploads, add `DATABASE_URL` to `.env` or `.env.local` using `.env.example`. Use the Supabase PostgreSQL connection string, which includes the database password. The Supabase API URL and service-role API key are not database connection strings.

`DATABASE_URL` is the runtime connection. `DIRECT_URL` optionally supplies the direct or session-pooler connection for the Prisma CLI. Both the app and Prisma CLI load `.env.local` before `.env`.

```powershell
npm run db:generate
npm run db:validate
npm run db:studio
```

Client generation also runs after installation and before production builds. `prisma/schema.prisma` maps the existing `devices` and `readings` tables. The shared client is server-only and reuses connections during development.

Apply the existing [SQL migration](../../supabase/migrations/202611040001_initial.sql) and provision a device before uploading. This migration remains the schema source, including Supabase Auth ownership, row policies, checks, and the atomic `ingest_reading` function. Prisma calls that function with bound parameters. The server database role needs permission to read devices, write readings, update device contact time, and execute the function.

Use the SQL migration workflow for schema changes. `prisma db push` does not manage the Auth relationship, row policies, checks, or function. Follow [system setup](../../docs/SYSTEM_SETUP.md) for the record contract and remaining work.

```powershell
npm test
npm run typecheck
npm run build
```

No database has been provisioned and no application has been deployed automatically.
