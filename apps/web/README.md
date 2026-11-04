# SoilSense web starter

Next.js App Router, TypeScript, Tailwind CSS, and a Supabase-backed device upload endpoint.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. No credentials are needed to view the initial empty dashboard. It has no simulated readings or fertilizer advice. Login and private dashboard reads are not implemented yet.

For real uploads, configure `.env.local` using `.env.example`, apply the database migration, and provision a device. Follow [system setup](../../docs/SYSTEM_SETUP.md) for the schema, record contract, and remaining work.

```powershell
npm test
npm run typecheck
npm run build
```

No database has been provisioned and no application has been deployed automatically.
