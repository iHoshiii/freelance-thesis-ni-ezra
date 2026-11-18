# Materials and testing budget

Use this checklist with the [hardware buying list](SHOPEE_PURCHASING_CHECKLIST.md) and the [bench test plan](../firmware/HARDWARE_CHECKLIST.md). Record quantities, prices, delivery charges, and actual amounts paid in Philippine pesos.

## Prototype parts

| Group | Include |
| --- | --- |
| Controller and sensors | Classic ESP32 DevKit, pH electrode and interface, capacitive moisture probe, DS18B20, pull-up and analog filter parts |
| Provisional NPK | Compatible probe, 3.3 V RS485 transceiver, and a supply rated for the specific probe. Budget this after checking the register map and reference method. |
| Display and controls | SSD1306 OLED, two momentary switches, panel mounting and leads |
| Records and time | SPI microSD breakout, FAT32-capable microSD card, DS3231 RTC and matching cell, PC card reader if needed |
| Optional SMS | LTE modem, matching antenna, SMS-enabled SIM, message charges, and a regulated modem supply |
| Field power | Rechargeable battery, protection, compatible solar charger and panel, regulators, switch, fuse, and wiring as required by the power design |
| Assembly | Prototype board, connectors, insulated wiring, enclosure, cable glands, probe mounts and strain relief |

Check stock, actual voltages, and the contents of each kit. Budget reused parts separately as in-kind equipment. Select the field power components after measuring the prototype during sampling, SD writes, and modem transmission.

## Calibration and testing

| Task | Consumables and equipment |
| --- | --- |
| Sample collection and preparation | Sample containers and labels, probe cleaning supplies, distilled or deionized water, measuring vessels and disposable supplies |
| pH calibration and validation | Fresh calibration buffers, electrode storage solution, and access to a calibrated reference pH meter |
| Temperature validation | Calibrated reference thermometer and a setup that stabilizes both probes under the same conditions |
| Moisture validation | Sample tins, balance, drying oven, desiccator and suitable handling tools for gravimetric reference testing |
| NPK validation, if included | A laboratory service that measures the matching nutrient fraction and reports the required units and method |
| Device and power testing | Multimeter, power meter, regulated supplies, test microSD, stopwatch, and handset for SMS receipt tests |
| User evaluation | Evaluation sheets or a local data collection method, plus any expenses approved by the study |

Arrange university or laboratory access before buying shared reference equipment. Obtain a written quote for any paid reference analysis. Base the quantity of tests on the approved independent sample and replicate counts.

## Cost record

| Category | Quantity or unit | Estimated PHP | Actual PHP |
| --- | --- | ---: | ---: |
| Prototype electronics and construction | Parts and fabrication | | |
| Calibration and sample supplies | Consumables purchased | | |
| Reference equipment and analysis | Access and submitted samples | | |
| SIM and test messages | Activation and actual use | | |
| Shipping and field travel | Deliveries and trips | | |
| Other approved direct expenses | Documented amounts | | |
| **Total direct prototype and testing cost** | | | |

Multiply each item quantity by its actual unit price and sum the direct expenses. Keep quotes, reserves, reimbursements, and borrowed equipment distinct from actual costs. Record fabrication or development labor separately if it forms part of the approved cost scope.
