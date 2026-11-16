# Web workspace: implemented and next steps

## Current tabs

- **Overview:** last 7 days, last 30 days, all-time synced totals; selected device's offline queue, saved scans, battery, sync state, readiness and last report.
- **Scans:** latest scan, paginated history, quick date periods, location/search/custom filters, comparison and CSV export.
- **Recommendations:** checks for the latest scan; pH grouping, moisture calibration, crop-dependent temperature targets and NPK validation requirements. No unvalidated fertilizer dose is generated.
- **Statistics:** pH, moisture and temperature distributions, average/min/max and missing readings; NPK coverage; dated scan counts by week, month, year or all time and location. Queries cover every matching record.
- **Status:** independent browser-to-server and database checks, schema readiness, device readiness and each sensor's reported condition. Setup and registered devices remain reachable here.

Periods called week/month mean rolling 7/30 calendar days including today in UTC+8, rather than the previous calendar week/month. All-time counts include unknown scan times; date-filtered statistics exclude them. Offline queue counts are separate from synced records and come from the selected device's latest heartbeat.

## Next implementation order

1. **ESP32 data path.** Implement sensor acquisition, persistent flash queue, Wi-Fi reconnection, acknowledged upload retries and `/api/device-status` heartbeats. Report actual battery measurements and sensor self-test results. Follow [the reporting contract](DEVICE_TELEMETRY.md). Test connection loss, power loss, duplicate uploads and reconnecting with queued scans on hardware.
2. **Calibration and crop profile.** Record crop, growth stage, soil type, sampling depth and location. Set moisture field-capacity/reference points and crop-specific temperature/pH targets. Store calibration date, unit, method and reference test.
3. **Validated recommendation model.** Compare NPK and other inputs against laboratory references, validate the thesis model, then add explainable crop-specific recommendations with confidence/validation status.
4. **Sync event history and alerts.** Keep upload failures, last successful sync, low battery and sensor errors as events. Add targeted alerts and a last-seen timeline; avoid treating missing data as zero or as proof of sensor failure.
5. **Research reports.** Add saved location comparisons, downloadable summary reports and missing-data/calibration coverage over time. Add access control if deployment extends beyond the shared research team.

No hardware telemetry is simulated. Firmware is currently a scaffold. The web endpoint and table are ready to receive real device reports.
