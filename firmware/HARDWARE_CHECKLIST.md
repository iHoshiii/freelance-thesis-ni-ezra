# Arrival and integration checks

Record firmware commit, board marking, flash size, configured queue limit and date alongside the results. Use a dedicated development device ID for integration checks. Serial commands are documented in [README.md](README.md).

| Check | Procedure | Expected result |
| --- | --- | --- |
| USB boot | Upload with sensors disabled, open Serial, send `status` | Correct chip/flash, no fabricated readings, readiness false. |
| Server reporting | Configure reachable Wi-Fi/server/token | Website Status receives heartbeats about every 30 seconds. Sensor values and battery stay unavailable until implemented. |
| Actual sensor | Enable one verified sensor, send `read`, compare with reference | Real measurements, absent inputs remain unavailable. Calibration quality is recorded separately. |
| Offline capture | Disconnect router/internet as appropriate, send `scan test-001\|Bench` | Serial confirms Saved. The website cannot see the offline scan yet. |
| Restart retention | With a saved offline scan, reset or unplug/reconnect USB | Pending scan count and payload survive restart. |
| Reconnect | Restore Wi-Fi/server | Original scan ID is acknowledged, pending count falls, exactly one matching database row exists. |
| Wrong token | Build with a deliberately invalid development token, record a real test scan | HTTP 401, saved scan retained, retries paused. Restore correct token, upload firmware without formatting, send `sync`. |
| Lost acknowledgement | Interrupt communication around upload and retry | No deletion without a matching acknowledgement. The server retains one row for the same device/record ID. |
| Full queue | Temporarily set `Config::queueLimit` to 2, capture three real offline test scans | Third scan refused, first two preserved and uploaded after reconnect. Restore the normal limit. |
| Interrupted write | On disposable test data, interrupt power repeatedly during save | Fully saved scans survive. Incomplete/corrupt files are retained and stop acquisition for inspection. Never claim zero data loss from host tests alone. |
| Unknown clock | Power up with no NTP access and capture a real scan | `timeQuality=unknown`, `acquiredAt=null`. Upload later preserves those fields. |
| Sensor unplug | Disconnect a verified temperature sensor, send `read` | Temperature unavailable, sensor error reported, previous queued records preserved. |
| pH offset | On verified reference data, send `ph-offset DEVICE_ID 1`, then `read` and restart | Future pH increases by 1 when within range, offset survives restart, old queue entries stay unchanged. A different device ID is refused. Reset offset to 0 after this disposable check. |

Before field collection, verify the actual storage capacity, sensor calibration, power circuit, scan procedure and acceptable error limits with the study's reference methods. The initial firmware captures manually through USB Serial. A field capture button and its pin can be added once the physical assembly is confirmed.
