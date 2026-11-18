# Buying list for the Hybrid Multi-Sensor Soil Reader

The list assumes the existing classic ESP32 DevKit and sensors are reused. Check exact module markings and connector dimensions before ordering or cutting the enclosure.

| Qty | Order or search for | Match before buying |
| --- | --- | --- |
| 1 | 0.96-inch SSD1306 OLED, 128×64, four-pin I2C, 3.3 V | Confirm SSD1306 and I2C, typically address 0x3C or 0x3D. The Makerlab reference was listed at ₱149 and marked sold out when checked. [Makerlab PH](https://makerlab.ph/products/oled-0-96-128x64-i2c?variant=43278347960511) |
| 1 | Waveshare SIM7600G-H 4G Module, 3.3 V UART, with matching LTE antenna | Confirm the global G-H carrier board, antenna connector and package contents. Buy the carrier with translated UART and a SIM slot. Check SMS support with the intended carrier and location, then verify sending to a handset before enclosure work. [Waveshare module](https://www.waveshare.com/SIM7600G-H-4G-Module.htm), [module documentation](https://www.waveshare.com/wiki/SIM7600G-H_4G_Module) |
| 1 | Active LTE nano-SIM, SMS service | Test registration and an outgoing text with the planned carrier. Include SIM activation and test texts in the budget. [Globe LTE/SMS guidance](https://www.globe.com.ph/help/network/faq) |
| 1 | 3.3 V logic SPI microSD breakout | Confirm CS, SCK, DI/MOSI and DO/MISO. The referenced breakout uses 3.3 V for power and logic. [Adafruit #4682](https://www.adafruit.com/product/4682) |
| 1 | Branded 8–32 GB microSDHC card plus PC reader if needed | Prepare as FAT32. Prefer a genuine card from a reliable supplier. [Espressif SD library](https://github.com/espressif/arduino-esp32/tree/master/libraries/SD) |
| 1 | DS3231 RTC breakout and manufacturer-specified coin cell | Required for independent offline timestamps. The Adafruit breakout uses a CR1220. Match the cell to the selected breakout and its charging design. [Adafruit #3013](https://www.adafruit.com/product/3013) |
| 2 | Momentary normally open panel buttons | Allow for Scan and View. Reuse kit buttons on the bench. |
| 1 | Regulated modem bench supply and short power leads | Use a regulated 5 V/3 A bench supply as the starting point for the referenced modem's 5 V input. Confirm the exact VIN/VBUS terminal, startup method and power specifications from the module manual. Measure actual transmission load before choosing the battery regulators. [Waveshare module documentation](https://www.waveshare.com/wiki/SIM7600G-H_4G_Module) |

For the enclosure, allow access to the display, pushbuttons, antenna, microSD and power switch. Keep the modem antenna away from pH analog wiring. Assemble and test on the bench before finalizing solar panel wattage, battery capacity, charge controller and regulator ratings.

Start with the OLED, buttons, breakout and card. Add the RTC for timestamped collection. Confirm the SIM and modem combination before buying the enclosure or field power hardware. The pH, moisture and temperature hardware from the previous build can be reused. Defer buying an NPK probe until its exact manual and matching laboratory method have been confirmed.

Record supplier, SKU, quantity, actual unit cost in PHP, shipping and availability. Use the [budget checklist](COMPLETE_MATERIALS_AND_TESTING_BUDGET.md) for the full prototype and testing expenses.
