# Prototype verification

Use a fixed firmware revision, documented sensor settings, known reference inputs and a dedicated card for fault tests. Record scan IDs, expected results, actual results and test conditions.

| Test | Procedure and evidence |
| --- | --- |
| Boot | Connect the OLED and FAT32 card. Verify startup, SD readiness and the 115200 baud console. With sensors disabled, check that Scan shows unavailable instead of saving a record. |
| Buttons and screen | With a verified sensor, press and hold Scan. Confirm one record per deliberate press, then switch pages with View. Check units, missing-value display and readability outdoors. |
| Offline operation | Leave the modem disconnected and power on with the OLED, verified sensor and FAT32 card connected. Press Scan. Confirm the OLED shows a reading and a successful save, then use View and verify the matching microSD file. |
| Sensors | Compare the temperature probe, pH in prepared slurry and calibrated moisture against their documented references. Disconnect each probe and inspect availability behavior. For analog sensors, test open inputs and include limitations in the results. |
| NPK | Enable only with the actual register map. Verify N/P/K order and raw values, then check fault behavior on a missing probe or invalid reply. Proceed to lab comparison only with compatible reference methods. |
| Record integrity | Verify screen readings against the CSV for the same ID, using the screen's rounding. Restart and confirm saved files can be copied. Run a full-card trial and inspect previous records. |
| Interrupted write | On disposable data, interrupt power before and during a save. Count confirmed files, unreadable files and temporary files separately. Compare preserved records byte for byte where feasible. |
| Clock | Set RTC to UTC, power-cycle, and compare against a known clock. Remove power from the backup clock on a disposable test setup, then check for `unknown` quality and a blank time. |
| SMS | Verify the SIM is active and can send at the intended sites. Test modem disabled, a successful submission and actual handset receipt, poor/no coverage, busy modem and a new scan during an ongoing SMS attempt. Log submission and receipt latency separately. Verify that scans remain on microSD in every SMS outcome. |
| Power | Record bench supply voltage and current during sampling, SD write and LTE transmit. Check for voltage drops, resets and sensor noise. Measure battery runtime and the contribution of the solar charging system under documented conditions. |
| pH offset | Verify a known offset in range, reboot, and recheck. Confirm the prior CSV is unchanged. Restore the study's approved offset after the test. |

The compiled binary is a starting point. Record actual hardware test results before making performance claims.
