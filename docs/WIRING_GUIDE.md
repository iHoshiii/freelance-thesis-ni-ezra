# Hybrid Multi-Sensor Soil Reader wiring

Use this guide with a classic ESP32-WROOM-32 or ESP-32S DevKit. Match the **GPIO labels** on your board. For example, GPIO21 means the pin marked `21` or `IO21`, not the 21st pin in a row. Check the board marking before wiring, especially if your board is from a starter kit. [Espressif DevKit reference](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html)

## 1. Decide how to power the bench setup

- Start with the ESP32 powered through its USB port. Use its **3V3** pin for the low-current 3.3 V modules and its **GND** pin for their ground. Check the voltage and keep within your board regulator's current rating, including when the SD card writes.
- Use a **regulated 5 V supply** for the DFRobot SEN0161 pH board. Connect its ground to ESP32 GND. Feed its positive wire only to the pH supply branch. Keep the ESP32's own 5 V input free while its USB cable powers the board. Start the ESP32 before powering the pH board, and turn off pH power first when shutting down. Unplug both supplies before changing the wiring. [DFRobot SEN0161 pinout](https://wiki.dfrobot.com/sen0161)
- The LTE modem and the NPK probe have their own power connections below. Run their power wires directly to their supplies. The breadboard carries the low-current connections in this setup.

## 2. Wire it with your breadboard

[Open the breadboard layout](images/design/esp32-bench-wiring.png).

The middle has **two groups of five holes per row**. For row 6, A6 to E6 are one connection. F6 to J6 are a different connection across the gap. Row 7 is separate from row 6. Here, **L6** means any hole from A6 to E6 and **R6** means any hole from F6 to J6. Put wires that share a connection in different holes of the same group.

1. Put the ESP32 beside the breadboard so its width leaves all the holes free. Use jumper leads from the ESP32 headers into the board.
2. With all supplies unplugged, use a multimeter in continuity mode. Check a five-hole group, then check across the gap. Check each long `+` and `-` strip from end to end. Some strips are split halfway. Bridge segments only when they need to carry the same voltage or ground.
3. Connect ESP32 **3V3** to the left `+` rail and ESP32 **GND** to the left `-` rail. Jumper the left `-` rail to the right `-` rail so both are GND. Connect the pH supply's **5 V** to the right `+` rail and its ground to the right `-` rail. **Keep the two positive rails separate.** Label them **3.3 V** and **5 V**, even if both are printed red. [Breadboard rail and row guide](https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard/anatomy-of-a-breadboard)

Use these example rows or copy the same pattern onto other free rows. For shared SDA, put the GPIO21 wire in **A6**, the OLED SDA wire in **C6**, and the RTC SDA wire in **E6**. The row numbers are for your wiring layout. The GPIO numbers come from the firmware.

| Part | Power | Wire the signals into these groups of holes |
| --- | --- | --- |
| SSD1306 I2C OLED | `VCC` to left `+`, `GND` to left `-` | `SDA` and GPIO21 to **L6**. `SCL` and GPIO22 to **L7**. Some boards mark the I2C clock `SCK`. |
| DS3231 clock (planned) | Board supply to left `+` if rated for 3.3 V, `GND` to left `-` | `SDA` to **L6** and `SCL` to **L7**. The clock and screen share the same two wires. |
| 3.3 V SPI microSD board | `3V` or documented 3.3 V supply to left `+`, `GND` to left `-` | `CLK/SCK` with GPIO18 at **L8**, `SO/MISO` with GPIO19 at **L9**, `SI/MOSI` with GPIO23 at **L10**, and `CS` with GPIO13 at **L11**. |
| DS18B20 probe | Verified `VDD` to left `+`, `GND` to left `-` | `DQ` and GPIO4 to **L12**. Add a **4.7 kΩ** resistor from another hole in L12 to left `+`. Check probe wire roles on its own label or manual. |
| DFRobot SEN0161 pH kit | Board `+` to right `+`, board `-` to right `-` | Probe plugs into the board's **BNC** socket. Board pin `A` goes to **L15** and passes through the pH divider below to GPIO34. |
| DFRobot SEN0308 moisture probe | `VCC` to left `+`. Connect both documented `GND` leads to ground. | `Signal` goes to **R15** and passes through the moisture divider below to GPIO35. DFRobot marks red as VCC, yellow as Signal, and both black leads as GND. |
| Scan button | One switched contact to GND | Other switched contact to GPIO32. Example group for the GPIO wire is **L25**. |
| View button | One switched contact to GND | Other switched contact to GPIO33. Example group for the GPIO wire is **L29**. |

For each four-leg button, use the meter to pick two legs that are **open when released and connected when pressed**. Mount it across the center gap if it fits. Use jumpers to the two identified contacts if the button has panel wires. The firmware already enables a pull-up on GPIO32 and GPIO33.

Check that OLED and RTC I2C pull-ups go to **3.3 V**. The OLED address in the firmware is `0x3C`. The DS3231 address is `0x68`. Use the backup cell type specified by your exact RTC board. Insert a FAT32 card only with power off. [Adafruit RTC pinout](https://learn.adafruit.com/adafruit-ds3231-precision-rtc-breakout/pinouts) · [Adafruit 3.3 V microSD pinout](https://learn.adafruit.com/adafruit-microsd-spi-sdio/pinouts) · [DS18B20 pull-up](https://support.analog.com/en-US/knowledgebase/article/000094969)

### Put these dividers between the sensors and the ESP32

Each **ADC point** is the place where the two resistors meet. GPIO34 or GPIO35 goes to that point. Connect a **100 nF ceramic capacitor** from each ADC point to GND, close to the ESP32 if possible. The resistor values are build choices for this wiring, and the two channels use different values. [ESP32 ADC guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/schematic-checklist.html#adc) · [DFRobot SEN0161](https://wiki.dfrobot.com/sen0161) · [DFRobot SEN0308](https://wiki.dfrobot.com/sen0308)

```text
pH board A ---- 12 kΩ ----●---- 10 kΩ ---- GND
                          ├--------------- GPIO34
                          └---- 100 nF --- GND

Moisture OUT -- 10 kΩ ----●---- 20 kΩ ---- GND
                          ├--------------- GPIO35
                          └---- 100 nF --- GND
```

| Channel | Row-by-row placement on the breadboard |
| --- | --- |
| pH | Put `A` at **L15**. Put **12 kΩ** from **L15** to **L18**, then **10 kΩ** from **L18** to GND. GPIO34 and the capacitor's first leg also go to **L18**. If you only have kit values, build the 12 kΩ leg with 10 kΩ from L15 to L16, 1 kΩ from L16 to L17, and 1 kΩ from L17 to L18. |
| Moisture | Put `Signal` at **R15**. Put **10 kΩ** from **R15** to **R16**. From **R16**, run **20 kΩ** to GND, or use 10 kΩ from R16 to R17 and another 10 kΩ from R17 to GND. GPIO35 and the capacitor's first leg go to **R16**. |

Put each capacitor's other leg on GND. Before connecting GPIO34 or GPIO35, power the sensor and measure its divider point with the black meter lead at GND. With nominal resistors, a **5.0 V** pH output would give about **2.27 V** at the GPIO34 point. The SEN0308's **2.9 V** maximum output would give about **1.93 V** at the GPIO35 point. These are calculated divider values. If a point reads above about **2.45 V** or below GND, inspect the wiring and verify the sensor output before attaching the ESP32. Then switch the supplies off, connect the GPIOs, and calibrate using the voltage at each ADC point with the divider installed. [ESP32-WROOM-32 ADC characteristics](https://documentation.espressif.com/esp32-wroom-32_datasheet_en.html)

## 3. Wire it without a breadboard

[Open the direct wiring layout](images/design/esp32-direct-wiring.png).

1. Use insulated locking connectors or a soldered perfboard for permanent connections. Make one **3.3 V distribution point**, one **5 V pH distribution point**, and one **common GND point**. An insulated terminal block with linked ports can serve each point. Keep the positive terminals separate and label the wires at both ends.
2. Wire OLED and RTC `SDA` together with GPIO21 and their `SCL` together with GPIO22. Connect the other signals point to point.

   | Signal wire | Direct connection |
   | --- | --- |
   | Card `CLK/SCK`, `SO/MISO`, `SI/MOSI`, `CS` | GPIO18, GPIO19, GPIO23, GPIO13 respectively |
   | DS18B20 `DQ` | GPIO4, with 4.7 kΩ from GPIO4 to 3.3 V |
   | pH `A` | Through the 12 kΩ/10 kΩ divider to GPIO34 |
   | Moisture `Signal` | Through the 10 kΩ/20 kΩ divider to GPIO35 |
   | Scan, View | GPIO32 to GND through Scan. GPIO33 to GND through View. |
3. Solder or fasten each divider and capacitor close to the ESP32. Insulate the ADC junctions and exposed resistor legs. Keep probe signal wires away from the modem's power leads and antenna. Attach the cables to the case so a pull on a probe does not pull on the contacts.
4. Use the module's own labeled power pins as listed in the breadboard table. The two optional modules below use the same signal connections in both builds. Route their supply returns straight back to their supplies and connect their grounds to the common GND point for the signals.

## 4. Add the optional modules after the reader can save a scan

### SIM7600G-H SMS modem

- For the **Waveshare SIM7600G-H 4G Module carrier** with default **3.3 V UART logic**, connect modem `TXD` to ESP32 **GPIO16**, modem `RXD` to ESP32 **GPIO17**, and modem `GND` to common GND. Leave `VIO` open for the documented default. Use the exact carrier manual if the label differs. The bare SIM7600 chip and other carriers have different power and logic requirements.
- Use a **dedicated regulated 5 V supply with 3 A capacity** at the carrier's documented 5 V USB input. Use a cable suitable for the load and measure voltage during SMS. Use one input method at a time. Connect the LTE antenna and insert an active SMS-capable SIM before powering it. Follow the board's power-on instructions. The firmware uses **115200 baud** and sends after a confirmed card save. [Waveshare carrier pinout and power inputs](https://www.waveshare.com/wiki/SIM7600G-H_4G_Module)

### MAX3485 and RS485 NPK probe

- For the listed red **TTL485-V2.0 MAX3485 board** with four header pins, connect `VCC` to **3V3**, `GND` to common **GND**, adapter `TXD` to ESP32 **GPIO26**, and adapter `RXD` to **GPIO27**. The diagram on the back of the board shows that crossing. This board handles direction automatically, so use `npkDirection = -1` and leave **GPIO25** free. Use this map when the actual board matches the label and pin markings. [Adapter listing and photos](https://shopee.ph/MAX3485-Module-TTL-To-RS485-Module-MCU-Development-Accessories-i.215434955.26054546212) · [MAX3485 datasheet](https://www.analog.com/en/products/max3485.html)
- If using a different 3.3 V MAX3485 breakout with **separate `RO`, `DI`, `DE`, and `/RE` pins**, connect `RO` to **GPIO26**, `DI` to **GPIO27**, and join `DE` and `/RE` at **GPIO25**. Set `npkDirection = 25` for that board.
- Connect probe `A/B` to the matching bus signals on the breakout once the probe manual identifies its wires and polarity. Use the `A/B` pair for data only. Connect the probe's confirmed power leads to its own regulated supply at the voltage specified for the actual unit. Join its ground with the signal ground for this non-isolated breakout. Leave termination and bias as specified for the actual modules and cable. MakerLab's listing gives **5 to 30 V**, but it does not identify the power-wire colors or register map. Keep the probe unpowered until those are confirmed. [MakerLab listing for MLE05243](https://makerlab.ph/products/rs485-output-3pin-probes-soil-npk-sensor-with-cable-2m)
- Keep NPK disabled until you have the baud rate, address, function and register map. The current firmware expects three consecutive N, P and K registers and saves raw values.

## 5. Switch to the Waveshare solar and battery supply

**For the DFRobot Solar Power Manager 5V V1.1 (DFR0559), use the [solar-to-reading guide](SOLAR_TO_READING_GUIDE.md#1-solar-panel-power-manager-and-18650).** The voltages and connections below apply to the Waveshare module.

Bench-test on USB before adding the battery and panel. Use the **Waveshare Solar Power Manager (D)** with its matching factory holder. The holder's three slots share a **3.7 V nominal parallel connection**. Follow the maker's polarity marks and use matched, undamaged cells of the same type and charge state. If you cannot verify the three cells you already have, leave the holder empty and use bench power. Use the factory plug for the holder. Keep cell power and charging wires off the breadboard.

The module accepts **6 to 24 V DC at SOLAR IN** and provides **5 V at up to 3 A** on its regulated output. Use the panel only after you verify a compatible DC solar output on the actual connector. The **6 V, 10 W** seller rating alone does not verify that the panel's USB ports deliver a suitable solar input. Check the output voltage and polarity with the panel disconnected from the manager, then verify it stays within the input range under load. [Waveshare Solar Power Manager (D) manual](https://www.waveshare.com/wiki/Solar_Power_Manager_%28D%29)

Connect the verified **5 V output** to the ESP32 board's documented **5 V power input** and to the pH board's 5 V branch. Connect output **GND** to the common GND point. Unplug the PC USB cable before feeding the ESP32 through its 5 V header. A board-specific 5 V input label may be `5V` or `VIN`. Use the ESP32 **3V3** rail for the same low-current modules if its regulator can support them. Keep the modem on its verified separate supply until testing confirms that a portable power design can handle its transmit bursts along with the reader. [Espressif DevKit power options](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html)

## 6. Test one part at a time

1. With power off, check that the two positive rails are separate and that GND reaches both sides. With modules unplugged, check for shorts from either supply rail to GND. Power the rails and measure their voltage and polarity before plugging parts in.
2. Connect the OLED and buttons. Boot on USB and check the screen responds to **Scan** and **View**. Add the clock and powered-off microSD card once this works.
3. Connect the temperature sensor, then the moisture and pH sensors. In [sensor_settings.h](../firmware/include/sensor_settings.h), set each installed and checked sensor's `temperatureEnabled`, `moistureEnabled`, or `phEnabled` to `true`. Enter measured pH and moisture calibration points and upload the firmware. Use the serial monitor at **115200 baud** and `read` to check the readings before saving.
4. Take a scan with a usable reading. Confirm the OLED shows that it saved. Power down, remove the card, and open the CSV in the `scans` folder. Then test the optional modem, optional NPK probe and portable supply one at a time. Watch for supply drops or resets during an SD write or SMS attempt. [Firmware setup and operation](../firmware/README.md#configure-and-operate)
