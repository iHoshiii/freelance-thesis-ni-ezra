# System setup

The web application implements the shared research workspace. No login is required while the paper's account requirements remain undecided. Hardware acquisition, calibration, production deployment, and the trained fertilizer model remain separate work.

## Stack

| Layer | Selection | Purpose |
| --- | --- | --- |
| Website and upload API | Next.js App Router, React, TypeScript | Dashboard, history, details, CSV, and device uploads. |
| Styling | CSS and Tailwind CSS | Green-and-white responsive monitoring interface. |
| Database | Supabase PostgreSQL | Device records and immutable scan history. |
| Server database access | Prisma ORM 7 with PostgreSQL adapter | Typed, device-scoped reads and atomic upload-function calls. |
| Device transport | HTTPS JSON with per-device bearer tokens | Acknowledged uploads without a separate message broker. |
| Firmware | Arduino C++ under PlatformIO | ESP32 development after hardware details are confirmed. |
| Later model training | Python and scikit-learn | Train and evaluate the advisor using approved study data. |

## Run the application

Use Node.js 24 LTS and npm. From the repository root:

```powershell
cd apps/web
npm ci
npm run dev
```

Open http://localhost:3000. The dashboard renders an honest empty state and setup guidance when configuration is incomplete. `/setup` shows configuration and upload readiness without revealing credentials.

## Connect the system

1. Create a Supabase project or local Supabase instance.
2. Configure `DATABASE_URL` in `apps/web/.env` or `.env.local` with a PostgreSQL connection string. Optionally use `DIRECT_URL` for setup commands. Encode special characters in the database password. PostgreSQL error `28P01` indicates invalid connection credentials.
3. From `apps/web`, run `npm run db:setup`, `npm run db:generate`, and `npm run db:check`.
4. Run `npm run device:provision -- soil-001 "Field unit" "$env:TEMP/soil-001.token"`. It creates the device without requiring a user account and writes the token to the chosen file. Existing devices are not replaced.
5. Set `WORKSPACE_DEVICE_IDS=soil-001` in the server environment, using commas for multiple devices, and restart the app. An empty or invalid list exposes no readings.
6. Configure the device with its ID and token. Send the token as `Authorization: Bearer <token>` to `POST /api/readings`. Keep the database credentials on the server.
7. Verify the first upload in the dashboard. For a prepared development JSON record, use `npm run device:upload -- "$env:TEMP/soil-001.token" ./scan.json`.

The setup command applies `202611040001_initial.sql` and `202611090001_shared_workspace.sql` transactionally, with a migration ledger and checksum verification. An existing initial installation is recognized before applying the shared-workspace update. Use the SQL migration workflow rather than `prisma db push`, because checks, Auth relationships, policies, and upload functions are not fully described by Prisma models.

The runtime database role needs read access to devices and readings, write access to readings, permission to update device contact time, and permission to execute `ingest_reading`, with appropriate RLS privileges. Supabase browser roles cannot read token hashes or directly insert readings. Future account-based access can assign `owner_id` and reuse the existing ownership policies.

The website is deliberately shared: anyone who can access the deployment can view the configured devices' scans. The server checks the configured device list for history, details, trends, and CSV export. It never returns device token hashes. User login and public registration are deferred until the paper's requirements are confirmed.

## Device record contract

`POST /api/readings` accepts one JSON record, up to 8 KiB:

```json
{
  "deviceId": "soil-001",
  "recordId": "550e8400-e29b-41d4-a716-446655440000",
  "sampleId": "sample-001",
  "location": "North plot",
  "acquiredAt": null,
  "timeQuality": "unknown",
  "ph": null,
  "moisturePercent": null,
  "temperatureC": null,
  "npkRaw": null
}
```

`location` is optional, nonempty when present, and limited to 120 characters. Old payloads without it remain supported. Null measurements mean unavailable, never zero. A synchronized clock requires an ISO acquisition timestamp; unknown acquisition time requires null. The server independently assigns receipt time.

`npkRaw`, when present, contains numeric `n`, `p`, `k`, and a nonempty `unit`. These values remain provisional until reference validation. Input range checks do not establish calibration or agronomic validity.

Only a successful database transaction returns `{ "acknowledgedRecordId": "...", "receivedAt": "..." }`. The `(device_id, record_id)` primary key prevents duplicate scans on retries. Identical retries return the original acknowledgement. Conflicting reuse returns 409 and preserves the first payload. Storage failures return 503 without acknowledgement.

## Dashboard rules

- Last scan is independent of history filters and prioritizes known measurement time. Unknown-time scans are ordered by upload time after dated scans.
- Date filters explicitly choose measurement or upload time. Unknown measurement times are excluded from dated measurement filters and remain visible in All or upload-time filters.
- Day boundaries and displayed dates use Philippine time (UTC+8). Seven and thirty days include today and the previous six or twenty-nine calendar days.
- Locations are captured in each uploaded scan. Trends require a named location, use at most its latest 200 dated scans matching the filters, and leave gaps for missing readings.
- CSV export includes every matching record across pages and protects text cells against spreadsheet formulas. Comparison keeps units, timestamps, and provisional NPK labels visible.
- Last contact/upload does not imply the device is currently online. Pending offline-record counts are not inferred from database rows.
- The advisor displays its validation status until approved training data and an evaluated model exist.

## Verification

From `apps/web`, run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`. After building, `npm run test:e2e` uses installed Chrome and a separate in-memory PostgreSQL test server on ports 3100 and 55439. Test measurements never enter the live database.

## Remaining device and research work

The firmware scaffold only prints a startup message. Sensor drivers, calibration, persistent flash queue, restart recovery, queue-full behavior, HTTPS transport, retry/backoff, and clock handling require implementation after confirming the exact hardware and electrical design. No OLED, microSD, RTC, or pin assignments are assumed.

Train and evaluate the advisor using approved reference data and sample-separated train/test partitions before integrating inference. Provisional NPK values must not become validated inputs automatically. Neither offline web browsing nor an on-device advisor is included.

See the [dashboard feature plan](../apps/web/docs/DASHBOARD_PLAN.md) and [UI design plan](../apps/web/docs/UI_DESIGN_PLAN.md).
