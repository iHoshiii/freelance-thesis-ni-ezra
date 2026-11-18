# pH offset configuration

The Configuration sidebar tab compares a known reference pH with the current device reading. With a pH 4.00 reference, a 3.00 device reading and an existing offset of zero, the new offset is +1.00.

The calculation is `new offset = existing device offset + reference pH - device measured pH`. New sensor acquisitions then use `pH = pH before offset + new offset`. The existing offset is accounted for so a previously corrected reading is not adjusted twice.

## Workflow

1. Complete the sensor's initial voltage calibration and allow the reading to stabilize in a verified reference. The offset feature does not replace initial pH calibration.
2. Open the ESP32 Serial Monitor and send `ph-offset`. Note the current offset and device ID.
3. Open Configuration, select/enter that device ID, enter reference pH, the current device reading and the existing offset. Preview the result. Notes can identify the buffer, reference instrument or measurement temperature.
4. Save the check in this browser and optionally export its JSON record. The browser keeps the last 20 saved checks for each device. These records are local to that browser, are not shared through the database and do not establish that a device applied them.
5. Copy the generated command, e.g. `ph-offset soil-001 1.000000`, and send it to the device through Serial. The updated firmware validates the device ID and value, saves one device-bound record in NVS, and confirms the active offset. The initial firmware upload is required once to add this command.
6. Send `read` and check the reference again. Send `ph-offset` after restarting to verify persistence. Reset to zero with `ph-offset soil-001 0` when appropriate. After changing the base voltage calibration, reset the offset and perform a new reference check.

Only future acquisitions use a new offset. Already queued payloads and uploaded scans retain the measurements recorded at acquisition. New scans with valid pH retain `phCalibration.beforeOffset` and `phCalibration.offset` in their immutable payload. Scan details and CSV export expose these values alongside the recorded pH. Legacy scans without metadata remain supported. The existing database JSON payload stores the metadata without a schema migration. The updated API must be running before uploading these new records.

Offset and pH values must be finite and within the supported ranges. A corrected value outside pH 0 to 14 is unavailable rather than clipped to an endpoint. Disabled or uncalibrated sensors remain unavailable. LittleFS formatting does not reset the offset in NVS. No device command has been sent or tested on hardware before the ESP32 arrives.

## Calibration scope

A single reference adjusts the offset at that point. It does not establish accuracy across the whole pH range. The [DFRobot SEN0161-V2 instructions](https://wiki.dfrobot.com/sen0161-v2/docs/20941) use pH 4.0 and 7.0 buffers for two-point calibration. Follow the actual sensor's instructions and compare independent reference measurements before treating corrected readings as validated soil measurements.

Possible later additions include two-point slope calibration in the tab, calibration reminders, repeat-reading stability checks, moisture reference calibration and authenticated Wi-Fi configuration with device acknowledgement.
