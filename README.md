# HYBRID MULTI-SENSOR SOIL READER

An ESP32-based field instrument for measuring soil pH, moisture and temperature, with an experimental RS485 NPK input. The operator presses **Scan**, reads the results on the built-in OLED and saves a CSV record to removable microSD. An optional LTE modem submits a short SMS summary after a confirmed save. The OLED and microSD work without mobile coverage.

## Thesis revision

- [Revised Word manuscript](docs/HYBRID_MULTI_SENSOR_SOIL_READER.docx)
- [Study scope and test plan](docs/SYSTEM_SETUP.md)
- [Hardware buying list](docs/SHOPEE_PURCHASING_CHECKLIST.md)
- [Firmware build, pinout and configuration](firmware/README.md)
- [Physical bench and field verification](firmware/HARDWARE_CHECKLIST.md)

The study evaluates measurement agreement and repeatability, operation of the display, storage and SMS, and direct prototype cost. It retains rechargeable power with supplemental solar charging. NPK validation is provisional. The base revision focuses on measurement and logging. Fertilizer compatibility remains a possible separate study feature subject to adviser approval and supporting sensor and model data.

The prototype firmware compiles for the classic ESP32 Dev Module. Measurements, storage reliability, SMS delivery, battery runtime and solar charging require physical tests.

## Previous prototype

The earlier [web prototype](apps/web), [database migrations](supabase), [model notes](ml) and [enclosure assets](models) are retained for reference. The active firmware uses neither the web app nor the database. The earlier Word manuscript and panel notes are preserved in [docs](docs).
