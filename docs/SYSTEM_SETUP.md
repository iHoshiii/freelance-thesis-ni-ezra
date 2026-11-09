# System initialization

This is a development starter for the current proposal, not a completed or validated analyzer. No hosted service has been created or deployed.

## Recommended stack

| Layer | Selection | Reason |
| --- | --- | --- |
| Browser application and receiving API | Next.js App Router, React, TypeScript | One application for responsive pages and HTTP endpoints. |
| Styling | Tailwind CSS | Responsive layouts without a separate design framework. |
| Database and eventual user login | Supabase PostgreSQL and Auth | Relational sample history, ownership policies, and managed authentication. |
| Server database access | Prisma ORM 7 with the PostgreSQL adapter | Typed models for existing tables and parameterized calls to the atomic upload function. |
| Device transport | HTTPS JSON with per-device bearer tokens | Straightforward acknowledged uploads; no MQTT broker needed for the prototype. |
| Device firmware | Arduino C++ under PlatformIO | ESP32 development and reproducible dependency configuration. |
| Later model training | Python and scikit-learn | Fits the proposed decision-tree baseline and evaluation workflow. Add an authenticated Python inference service only after a model is trained and validated. |

Sources: [Next.js setup](https://nextjs.org/docs/app/getting-started/installation), [Supabase Next.js guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Supabase row security](https://supabase.com/docs/guides/database/postgres/row-level-security), [PlatformIO ESP32](https://docs.platformio.org/en/latest/boards/espressif32/esp32dev.html), [scikit-learn model persistence](https://scikit-learn.org/stable/model_persistence.html).

## Run the starter

Use Node.js 24 LTS and npm. From the repository root:

```powershell
cd apps/web
npm ci
npm run dev
```

Open http://localhost:3000. The dashboard deliberately starts empty and works without credentials. It does not yet query private readings or implement login.

Checks: `npm test`, `npm run typecheck`, and `npm run build` from `apps/web`.

## Connect a database

1. Create your own Supabase project, or use a local Supabase instance.
2. Apply `supabase/migrations/202611040001_initial.sql` using the SQL editor or your migration workflow. It has not been applied automatically.
3. Add `DATABASE_URL` to `apps/web/.env` or `.env.local` using `.env.example`. Supply the Supabase PostgreSQL connection string, including the database password. Optionally set `DIRECT_URL` to the direct or session-pooler URL for Prisma CLI commands. Run `npm run db:generate` and `npm run db:validate` from `apps/web`. Database credentials belong only on the server, never in the ESP32 or a `NEXT_PUBLIC_` variable.
4. Provision an Auth user, then a device row with that user's ID, a device identifier, and a SHA-256 hash of a unique cryptographically random device token (at least 32 random bytes). Provisioning is an administrator operation; no public device registration endpoint exists.
5. Use the raw device token only in that device's configuration and send it as `Authorization: Bearer <token>`. The database stores its hash. Use HTTPS outside isolated local development.

Browser roles can only read rows belonging to their signed-in user; they cannot insert measurements or read device token hashes. The receiving API uses Prisma to authenticate the device before calling the restricted database function with bound parameters. The Prisma database role must have the required table and function privileges. The SQL migration remains responsible for ownership, row policies, checks, and atomic ingestion. Database configuration alone does not complete user login or private dashboard reads.

## Device record contract

`POST /api/readings` accepts one record per request. Maximum body size: 8 KiB.

```json
{
  "deviceId": "soil-001",
  "recordId": "550e8400-e29b-41d4-a716-446655440000",
  "sampleId": "sample-001",
  "acquiredAt": null,
  "timeQuality": "unknown",
  "ph": null,
  "moisturePercent": null,
  "temperatureC": null,
  "npkRaw": null
}
```

Null means unavailable, never zero. `timeQuality` is `synced` or `unknown`; a synced record requires an ISO acquisition timestamp, and unknown requires null. The server assigns its own receipt time. Numeric range checks reject malformed inputs; they do not establish calibration or agronomic validity. `npkRaw`, if available, contains `n`, `p`, `k`, and a nonempty `unit` reported by the probe; these remain provisional readings.

Only a successful database transaction produces `{ "acknowledgedRecordId": "..." }`. A unique `(device_id, record_id)` key prevents duplicate rows on retries. A retry must send the same immutable payload and identifier; conflicting reuse returns 409. The initial payload is preserved. Database failures never acknowledge a record.

Firmware must persist a record before upload, retain it until the matching acknowledgement, and reuse its identifier after restart. The initialized firmware only prints a startup message: persistent queue, restart recovery, queue-full behavior, HTTPS transport, retry/backoff, clock handling, sensor drivers, and calibration are **not implemented yet**. No OLED, microSD, RTC, or pin assignments are assumed.

## Implementation order

1. Complete login, owner-scoped dashboard reads, history, and last-contact handling.
2. Confirm exact hardware, electrical design, sensor protocol, and calibration methods.
3. Implement and test acquisition and persistent flash queue, including interrupted writes, lost acknowledgements, restarts, full storage, and network outages.
4. Connect the real device and evaluate readings against references; resolve NPK feasibility.
5. Assemble labeled study data, train/evaluate the baseline model without data leakage, then integrate the advisor. Until then no fertilizer recommendation is produced.

Neither offline web browsing nor an on-device advisor is included. Offline acquisition becomes visible in the web app only after successful upload. Budget, power design, calibration, and hardware validation remain separate work.
