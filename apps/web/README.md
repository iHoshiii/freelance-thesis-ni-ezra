# SoilSense web application

Next.js, TypeScript, Prisma ORM 7, and Supabase PostgreSQL. The initial release is a shared research workspace with no login. Only devices explicitly listed in `WORKSPACE_DEVICE_IDS` are visible.

## Run

Use Node.js 24 LTS. From this directory:

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Without database configuration, the dashboard stays empty and links to `/setup`. It never generates sample measurements.

## Database and device setup

Use `.env.example` as a reference and configure your own `.env` or `.env.local`:

```dotenv
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
WORKSPACE_DEVICE_IDS=soil-001
```

`DATABASE_URL` is the runtime PostgreSQL connection. `DIRECT_URL` optionally supplies a direct or session-pooler connection for setup commands. Both Next.js and CLI tools load `.env.local` before `.env`. Supabase API URLs and service-role API keys are not PostgreSQL connection strings. Percent-encode special characters in connection-string passwords.

```powershell
npm run db:setup
npm run db:generate
npm run db:check
npm run device:provision -- soil-001 "Field unit" "$env:TEMP/soil-001.token"
```

The setup command applies the SQL migrations in a transaction and records their checksums. It recognizes the existing initial schema and preserves stored readings. The shared-workspace migration makes device ownership optional, adds sampling locations, and retains atomic upload acknowledgements. Supabase roles and the `auth` schema must already exist.

Provisioning saves a new device token to the specified file without printing it. It refuses to replace an existing device or token file. Configure the ESP32 with that ID and token, then set `WORKSPACE_DEVICE_IDS` and restart the application. Multiple IDs are comma-separated. Neither database credentials nor device token hashes are included in dashboard responses.

To send a prepared development record:

```powershell
npm run device:upload -- "$env:TEMP/soil-001.token" ./scan.json
```

The optional third argument is the upload endpoint. HTTPS is required outside localhost. Optional `location` is a nonempty string up to 120 characters. Legacy records without a location remain accepted.

Use SQL migrations for schema changes. `prisma db push` does not manage Supabase Auth relationships, row policies, checks, or the ingestion function.

## Dashboard behavior

- Last scan is the latest known measurement time, with upload time used to order records when all measurement times are unknown. It is independent of history filters.
- History supports Today, Last 7 days, Last 30 days, All, custom ranges, search, location filters, and pagination.
- Date filters explicitly select scan time or upload time. Unknown scan times appear in All; select upload time to find them within a date range.
- Database connections use UTC. Calendar boundaries and displayed times use Philippine time (UTC+8). Seven and thirty days include today.
- CSV export includes every matching scan across pages. Missing readings stay empty, and text cells are protected against spreadsheet-formula execution.
- Two scans can be compared side by side. Selecting a named location enables a trend chart of its latest 200 dated scans in the filtered period. Missing readings leave gaps.
- Details include measurement time, upload time, units, device information, and advisor availability. NPK remains provisional. No fertilizer advice is generated before model validation.
- Anyone who can access this deployment can view its configured scans. Login is deferred until the paper's requirements are confirmed.

## Checks

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Unit and SQL tests use an isolated in-memory PostgreSQL engine. Browser tests require a production build and installed Google Chrome. They run a separate local application on port 3100 and an in-memory database on port 55439 with synthetic test records. They never use the configured live database. Screenshots and traces are saved under ignored `test-results/`.

See [dashboard plan](docs/DASHBOARD_PLAN.md), [UI plan](docs/UI_DESIGN_PLAN.md), and [system setup](../../docs/SYSTEM_SETUP.md). Firmware sensing, persistent offline storage, and model training remain separate hardware and research work.
