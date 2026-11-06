# Shopee Philippines purchasing checklist

Research date: 5 November 2026. One proposed analyzer. See the [complete device-to-testing checklist](COMPLETE_MATERIALS_AND_TESTING_BUDGET.md) for reference instruments, services, and overall project costs.

These are **candidate listings**, not a confirmed compatible shopping cart. Prices below are amounts returned by public listing pages or search-index snapshots; checkout prices, exact variants, stock, authenticity, delivery fees, and seller identity have not been independently verified. Search snapshots can be old. A listing with a known model name is not proof that the delivered part is genuine. No seller has been contacted and no purchase made.

## 1. Core device listings found

Buy one of each selected component. Alternatives replace a row; they are not extra purchases.

| Component | Candidate Shopee listing | Displayed/indexed PHP | Status and selection conditions |
| --- | --- | ---: | --- |
| ESP32 development board | [ESP32 38Pin Development Board](https://shopee.ph/ESP32-38Pin-Development-Board-i.1646651452.40622889424) | 299 | Generic candidate; the title alone does not establish that it is an original Espressif DevKitC. Confirm module marking, pin map, regulator, USB connector, and flash capacity. |
| DFRobot pH V2 kit | [MakerLab: Gravity Analog pH Sensor/Meter Kit V2](https://shopee.ph/DFRobot-Gravity-Analog-pH-Sensor-Meter-Kit-V2-i.18252381.2633566478) | 5,649 | Opened page displayed this price. Confirm SEN0161-V2 and inclusion of electrode, interface board, and cable. The cheaper PH-4502C and original SEN0161 are different designs. |
| Alternate pH V2 source | [Createlabz: Gravity Analog pH Sensor/Meter Kit V2](https://shopee.ph/DFRobot-Gravity-Analog-pH-Sensor-Meter-Kit-V2-i.66722864.7058347494) | 3,070 | Search snapshot displayed sold out; price may involve a voucher. Do not treat as an available lower-cost order. |
| DFRobot capacitive moisture sensor, alternate model | [MakerLab: SEN0308 waterproof capacitive sensor](https://shopee.ph/DFRobot-Gravity-Analog-Waterproof-Capacitive-Soil-Moisture-Sensor-SEN0308-i.18252381.23055744537) | 1,175 | **SEN0308 is different from the previously budgeted SEN0193.** It is a candidate replacement, not an additional sensor. Update the actual hardware description and calibration if selected. |
| DS18B20 waterproof probe | [easyelectronyx: DS18B20 waterproof sensor](https://shopee.ph/DS18b20-WATERPROOF-TEMPERATURE-SENSOR-for-ARDUINO-ESP8266-NODEMCU-RPI-i.752842668.16558551674) | 85 | Older indexed price. Generic probe; confirm a three-wire unit, cable length and supply specification; compare with a calibrated thermometer. |
| 3.3 V RS485 interface | [donskytech: MAX3485 converter module](https://shopee.ph/TTL-To-RS485-MAX3485-Converter-Module-i.1090440049.27604497357) | 199 | Indexed price; reopened page required JavaScript. Confirm actual transceiver, 3.3 V supply/logic and DE/RE direction control. Do not substitute an unchecked 5 V MAX485 board. |
| NPK probe, provisional | [MakerLab: RS485 three-pin probe, 2 m cable](https://shopee.ph/RS485-Output-3Pin-Probes-Soil-NPK-Sensor-with-Cable-2M-i.18252381.24586562886) | 2,199 | **Opened page displayed sold out.** Manufacturer/model and register map still required. Borrow/test first; the listing does not establish nutrient accuracy. |

The six component references using the MakerLab pH kit, SEN0308, and provisional NPK price total **9,606 PHP** (299 + 5,649 + 1,175 + 85 + 199 + 2,199). The alternate pH source is excluded from this sum. This is **not a complete or currently orderable device total**: it includes an unavailable probe and mixed-date listing prices, and excludes power, construction, calibration, delivery, reserve, and laboratory costs.

Technical basis for considering SEN0308: [DFRobot specifications](https://wiki.dfrobot.com/sen0308/) list a 3.3–5.5 V supply and 0–2.9 V analog output. The analog input still needs proper range configuration/input conditioning and soil calibration. It does not automatically produce validated moisture percentages.

## 2. Power: Shopee candidate found, design still pending

[Waveshare Solar Power Manager (D) listing](https://shopee.ph/Waveshare-Solar-Power-Manager-Module-%28D%29-Supports-6V~24V-Solar-Panel-and-Type-C-Power-Adapter-5V-3A-for-Raspberry-Pi-Arduino-i.345394400.51516350811) showed an indexed **932–1,052 PHP** range with two variants. Verify the exact module and holder inclusion.

[Waveshare's manufacturer page](https://www.waveshare.com/product/modules/solar-power-manager-d.htm) specifies 6–24 V solar input, a 3.7 V rechargeable lithium-battery arrangement, and regulated 5 V output up to 3 A. Those ratings apply to the documented manufacturer product, not automatically to any similarly titled listing. Available output depends on the battery, panel, wiring, and operating conditions.

This is an **alternative design to DFRobot DFR0559**, not an extra charger to add to it. Before buying the power group, the freelancer must specify:

| Item | Search/model specification | What remains to confirm |
| --- | --- | --- |
| Solar manager | Waveshare Solar Power Manager (D), exact revision | Charging current/settings, low-current behavior, protection, connectors and delivered variant. |
| Solar panel | Candidate: 6 V, about 5 W panel for this controller | Open-circuit voltage within the controller limit, connector/polarity, measured load and realistic charging budget. A regulated 5 V panel is not automatically interchangeable with its 6–24 V solar input. |
| Battery and mounting/holder | Documented 3.7 V nominal compatible battery arrangement | Genuine cells or assembled pack, correct holder wiring, charge/discharge current and polarity. Do not assume any two-cell holder is suitable. The manufacturer's optional holder differs from the paper's draft two-cell illustration. |
| Required converter for NPK | Regulated output matching the exact probe, e.g. 12 V if required | Input range, startup behavior, output current, ripple and load. A converter's advertised peak current is not a verified continuous output rating. |
| Switch, wire and circuit protection | Ratings appropriate to the final circuit | Placement, current capacity, connections and any fuse/protection required by the design. |

Do not automatically combine this manager with the earlier Adafruit battery recommendation until charging-current compatibility is confirmed. A separate TP4056 and 5 V boost board may duplicate functions already supplied by the selected solar manager. No complete Shopee power bundle has been approved here.

## 3. Remaining construction materials: search checklist

These are **search terms and quantity guidance**, not verified product listings or price quotations.

| Material | Starting quantity | Suggested Shopee search / selection note |
| --- | --- | --- |
| Solderless breadboard | 1; possibly two if needed for board width | `MB102 830 tie points solderless breadboard`; ensure accessible rows beside the ESP32. |
| Jumper/hookup wire | 1 mixed set | `Dupont male male male female female female jumper wire 2.54mm`; select ends actually required. |
| Resistors | 1 small assortment | `4.7k resistor 1 percent` plus values specified for input conditioning. |
| Power switch | 1 | `panel mount rocker switch`; select DC voltage/current rating. |
| Momentary button | 1 | `momentary push button normally open`; match mounting/wiring. |
| USB data cable | 1 | Match actual board: micro-USB or USB-C; data capable. |
| Enclosure and lid | 1 | `ABS project enclosure`; size only after a component layout. |
| Cable glands and connectors | Per probe/power entry | `waterproof cable gland`, suitable terminal blocks and connector sets; choose cable diameters. |
| Mounting parts | 1 set | `M3 nylon standoff screws`, cable ties, heat-shrink, appropriate insulation and seals. |
| pH suspension cup | 1 dedicated cup | Clean suitable beaker/cup; separate from rinse/preparation vessels. |

## 4. Calibration and sample supplies: search checklist

| Material | Starting quantity | Selection note |
| --- | --- | --- |
| Certified pH buffers | Two points; third if method requires | Search for original sealed buffers with certified value, lot and expiry, e.g. documented Hanna buffer products. Use the actual values in calibration; 6.86, 7.00 and 7.01 are not identical. Select the calibration procedure before buying. |
| Electrode storage/cleaning solution | 1 initial set | Manufacturer-compatible electrode-care products; subtract kit inclusions. |
| Distilled/deionized water | Initial 2–5 L allowance | Grade and quantity required by the selected method; local laboratory supply may be more practical than delivery. |
| Wash bottle | 1 | `laboratory wash bottle`; appropriate clean material. |
| Preparation beakers/cups, volume measure and stirring tools | 1 preparation set | Borrow suitable lab glassware if available; do not buy the device cup twice. |
| Soil sample bags, labels and marker | Sample count plus spares | Durable labels and correct bag/sample size for the receiving laboratory. |
| Gloves, wipes and waste bags | Test-plan dependent | Follow the laboratory's handling procedure. |
| Moisture tins / heat-safe containers | Simultaneous test capacity | Lab-approved material; preferably borrow. |
| Sieve, trowel/auger and mixing bucket/tray | 1 suitable collection set | Size and preparation method set by the adviser/lab; reuse/borrow where appropriate. |

## 5. Testing equipment and services

Do not replace university reference instruments with an unverified cheap Shopee tester simply to complete a cart. Arrange suitable calibrated pH and temperature references, oven/balance/desiccator access, multimeter/power measurements, and independent nutrient laboratory analysis. These are listed fully in the [complete budget checklist](COMPLETE_MATERIALS_AND_TESTING_BUDGET.md).

Shopee can supply assembly tools and ordinary accessories, but laboratory analysis and expert advisory validation are separate services. A cheap pH pen or NPK meter is not automatically an adequate reference standard. No new laptop, phone, router or laboratory instrument purchase is assumed when suitable existing access is available.

## 6. Current purchasing position

- Candidate Shopee listings exist for the core device parts; some exact premium models could not be verified in stock.
- The SEN0308 and Waveshare power manager are proposed alternatives. Neither has been silently substituted into the thesis, schematic, firmware or earlier budgets.
- Keep the NPK probe and power-group purchases pending their documented selection and feasibility checks.
- Ask the freelancer for one itemized selection containing exact listing, variant, quantity, pin map/schematic, rated supply and final delivered price. Do not treat separate low-price listings as a compatible bundle.
- Record all delivery charges and reimbursement responsibility. Do not add this partial subtotal to the previous full prototype budget: its core parts overlap.

No OLED, microSD, standalone RTC, GPS or perfboard is added. Do not order every alternative listed in this document.
