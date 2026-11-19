# pH offset configuration

The device stores a per-device pH offset in ESP32 non-volatile settings. Start with the two-point voltage calibration for the physical pH interface. Measure at the GPIO34 junction with the divider in place. Use the actual probe manual and verified buffer solutions. [DFRobot SEN0161 instructions](https://wiki.dfrobot.com/sen0161) · [Wiring guide](WIRING_GUIDE.md#put-these-dividers-between-the-sensors-and-the-esp32)

## Serial workflow

1. Enable the installed pH sensor and set its measured voltage and pH calibration points in `firmware/include/sensor_settings.h`.
2. In the serial monitor at 115200 baud with newline enabled, send `ph-offset`. Record the reported device ID and current offset. Send `read` while the probe is stable in a verified reference and note the corrected pH from the CSV preview.
3. Compute `new offset = current offset + reference pH - measured pH`. For a 4.00 reference, a 3.00 observed pH and a current offset of 0.00, the new offset is +1.00.
4. Send `ph-offset soil-001 1.000000` with the actual device ID and calculated offset. The firmware will confirm the value after a successful write.
5. Send `read` and recheck the reference. Reboot and send `ph-offset` to verify persistence. After changing the base voltage calibration, reset the existing offset with `ph-offset soil-001 0` as appropriate and perform a fresh reference check.

Future readings will use the new offset. Existing CSVs keep their original pH, pre-offset value and applied offset. Out-of-range corrected values are unavailable. Keep the same device ID when updating an existing board so its previously saved offset remains associated with it.

A single reference check resolves an offset at one point. Evaluate agreement across the intended pH range with independent reference measurements.
