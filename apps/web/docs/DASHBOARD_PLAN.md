# SoilSense dashboard plan

Status: Planned
Agreed: 9 November 2026

Visual direction: [UI design plan](UI_DESIGN_PLAN.md).

## Goal

Make the latest scan and previous scans easy to review. Keep the interface compact, with short labels, restrained green accents, and minimal explanatory text.

## Dashboard layout

1. Header with last-upload status.
2. Last scan and its sensor readings.
3. One trend chart, added after the first version.
4. Scan history with date filters, search, and export.

The last-scan section shows the latest known scan independently of the history filters. History and trends share the selected period and location filters.

## Features

### Last scan

- Show scan ID, scan date and time, and sampling location when available.
- Display pH, moisture, temperature, and nitrogen, phosphorus, and potassium readings.
- Provide a **View details** action for the complete record.
- Show missing readings as unavailable, never as zero.
- Keep NPK readings marked as provisional until reference validation is complete.

### Scan history

- Date filters: **Today**, **Last 7 days**, **Last 30 days**, **All**, and **Custom range**.
- Display newest scans first and show the number of matching scans.
- Search by scan ID or sampling location.
- Open individual scan details from a history row.
- Include scan ID, scan time, location, and a compact reading summary in the list.

### Trend chart

- Use one chart with a parameter switch for pH, moisture, or temperature.
- Follow the history date range and selected sampling location.
- Compare scans from the same location rather than joining unrelated samples.
- Show individual observations when there are too few scans for a useful trend.
- Do not present missing values as zero or invent intermediate readings.

### Last-upload status

- Show when the device last uploaded a record in a small header status.
- Display scan time and upload time separately because offline scans can arrive later.
- Mark unknown scan times clearly.
- Only show an **Online** status after a reliable connection check is implemented.
- Do not infer the number of pending device uploads from the server's stored records.

### Compare scans

- Allow selection of two scans from history.
- Show their readings, units, timestamps, and locations side by side.
- Support reviewing repeat measurements and changes at the same location.
- Place the comparison action beside the history controls.

### Export CSV

- Export the scans matching the current date range, search, and location filters.
- Include scan identifiers, location, measurement time, upload time, readings, and units.
- Preserve missing readings as empty values.
- Place the export action beside the history controls.

### Scan details and fertilizer advice

- Show the complete measurement record when a scan is opened.
- Keep fertilizer advice tied to that specific scan inside its details.
- Until the model is validated, show the advisor's availability status.
- Explain missing or unsuitable inputs instead of producing a recommendation.

## Delivery order

### First version

1. Last scan with sensor readings.
2. Filtered, searchable scan history.
3. Individual scan details.
4. Last-upload status.
5. CSV export.

### Later additions

1. Trend chart once enough comparable readings are available.
2. Two-scan comparison.
3. Fertilizer advice after model training and validation.

## Implementation decisions to settle

- How sampling locations are assigned and stored; the current reading schema has no location field.
- How date filters handle records whose scan time is unknown, without silently treating upload time as scan time.
- Whether the initial account scope is the research team or individual farmers with their own devices.

## First milestone

One signed-in user, one assigned device, and one test reading uploaded to a development database and displayed only to its owner.

See the [system setup](../../../docs/SYSTEM_SETUP.md) for the device upload flow, database setup, and implementation boundaries.
