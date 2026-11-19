# HYBRID MULTI-SENSOR SOIL READER

An ESP32-based field instrument for measuring soil pH, moisture and temperature, with an experimental RS485 NPK input. Press **Scan** to measure and save a CSV record to removable microSD. Use **View** to switch between the measurement and NPK screens. The ESP32 draws the interface on its built-in OLED, and both the display and logging work offline. A configured LTE modem can submit a short SMS summary after a confirmed save.

## Thesis revision

- [Revised Word manuscript](docs/HYBRID_MULTI_SENSOR_SOIL_READER.docx)
- [Study scope and test plan](docs/SYSTEM_SETUP.md)
- [Wiring with and without a breadboard](docs/WIRING_GUIDE.md)
- [Hardware buying list](docs/SHOPEE_PURCHASING_CHECKLIST.md)
- [Materials and testing budget](docs/COMPLETE_MATERIALS_AND_TESTING_BUDGET.md)
- [Evaluation formulas](docs/DATA_EVALUATION_FORMULAS_REVIEW.md)
- [Firmware build, pinout and configuration](firmware/README.md)
- [Desktop OLED preview](firmware/README.md#preview-the-oled-on-your-monitor)
- [Physical bench and field verification](firmware/HARDWARE_CHECKLIST.md)

The study evaluates measurement agreement and repeatability, operation of the display, storage and SMS, and direct prototype cost. The reader uses rechargeable power with supplemental solar charging. NPK validation is provisional.

The prototype firmware compiles for the classic ESP32 Dev Module. Measurements, storage reliability, SMS delivery, battery runtime and solar charging require physical tests.
