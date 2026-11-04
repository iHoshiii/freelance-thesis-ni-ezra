# Soil Analyzer Materials Budget

Research date: 4 November 2026. Currency: Philippine pesos.

The user clarified that the freelancer's development fee is **₱15,000**, while the user purchases materials and the freelancer reimburses those purchases separately. Keep the development fee and reimbursable materials in separate records.

## Recommended budget

Allow **about ₱17,000 for materials, basic consumables, shipping, and a replacement reserve**, with an initial reimbursement limit of **₱18,000** to be agreed with the freelancer. This is a planning estimate for one prototype, not a supplier quotation or a guaranteed maximum.

The combined project budget is approximately **₱32,000**, including the ₱15,000 development fee, before laboratory validation and any paid hosting. Since materials are reimbursed, this combined budget is not necessarily the user's final personal expense.

The estimate follows the paper's separate pH, moisture, temperature, and provisional NPK sensors. It excludes an OLED/LCD, microSD module/card, GPS, and standalone RTC. It assumes access to an existing computer, Wi-Fi network, phone/browser, and laboratory reference instruments.

## Listed prices for major components

These are public retail prices observed during research. Availability changes, and several pages currently show sold out. These links are price references rather than a verified ready-to-order shopping cart. Shipping and imported-order charges are not included in the unit prices below.

| Component | Quantity | Listed unit price | Extended price | Source and availability note |
| --- | --- | ---: | ---: | --- |
| ESP32 Type-C development board | 1 | ₱349 | ₱349 | [Makerlab](https://makerlab.ph/products/type-c-esp32-development-board-30-pins-38-pins); listed as sold out when opened. Pin-count variant must match the build. |
| DFRobot SEN0161-V2 pH kit | 1 kit | ₱4,148 | ₱4,148 | [Circuitrocks](https://circuit.rocks/products/ph-sensor-meter-analog-kit-v2-gravity-for-arduino); limited stock displayed. Budget the kit once, rather than adding its electrode and interface board again. |
| DFRobot SEN0193 capacitive moisture sensor | 1 | ₱620 | ₱620 | [Circuitrocks](https://circuit.rocks/products/soil-moisture-sensor-corrosion-resistant); listed as sold out when opened. |
| Waterproof DS18B20 probe | 1 | ₱99 | ₱99 | [Makerlab](https://makerlab.ph/products/waterproof-temperature-sensor-ds18b20-1); listed as sold out when opened. Check selected cable-length variant. |
| RS485 NPK probe, provisional purchasing reference | 1 | ₱3,598 | ₱3,598 | [PowerMav](https://powermavelectronics.com/shop/module/npk-sensor-rs485/); limited stock displayed. Price reference only: exact model, documentation, and suitability require review. |
| **Subtotal of listed major components** | | | **₱8,814** | |

A second price reference for the same pH-kit SKU is [DigiKey Philippines at ₱2,435.18](https://www.digikey.ph/en/products/detail/dfrobot/SEN0161-V2/9608223). It showed zero stock in the retrieved listing; delivery charges and any applicable import charges also need checking. It is not treated as an immediately available replacement for the locally listed kit in this budget.

The earlier ₱5,485 hardware estimate was a rough materials draft. The named pH kit and provisional NPK probe alone total **₱7,746** at the local prices above, so that older estimate should not be used as the purchasing budget for this configuration.

## Allowances for parts that need final selection

**Every figure in this table is my planning allowance, not a verified price for a finalized part.** The freelancer needs to specify the actual modules, quantities, wiring, and ratings. These allowances cover the remaining illustrated parts and basic assembly needs.

| Item or group | Allowance | What it covers |
| --- | ---: | --- |
| Compatible 3.3 V RS485 interface module | ₱250 | MAX3485-type module or a documented compatible alternative. A bare transceiver IC is not the same purchase as a complete module. |
| Breadboard and small electrical parts | ₱450 | One suitable breadboard, jumper wires, resistors including the required pull-up, power switch, push button, and programming cable. |
| Solar panel | ₱600 | Initial small-panel allowance; final voltage and wattage depend on the chosen charger and measured device load. |
| Charging, protection, and voltage conversion | ₱1,500 | Compatible charging/protection hardware and required regulated outputs, including the 5 V and conditional NPK supply. Do not purchase overlapping converter functions twice. |
| Two suitable 18650 cells and matching holder | ₱700 | Draft two-cell quantity. Arrangement, cell specifications, and holder wiring must match the charger and protection design. |
| Enclosure and mechanical/accessory parts | ₱700 | Simple enclosure, cable entries, connectors, mounting hardware, and pH sample cup. Custom fabrication can exceed this allowance. |
| Basic calibration and electrode-care consumables | ₱600 | Initial allowance for required buffers, electrode-care solution, and small sample-preparation consumables. Final quantities and grades require a supplier quote; subtract supplies confirmed to be included with the kit. |
| **Allowance subtotal** | **₱4,800** | |

The power allowance does not approve the old combination of a 6 V panel, TP4056, two cells, and boost converters. Select the charging and battery arrangement together. A different power design can change both the parts and the price.

## Budget arithmetic

| Budget line | Amount |
| --- | ---: |
| Major components at listed prices | ₱8,814 |
| Remaining materials and basic consumable allowances | ₱4,800 |
| **Materials and consumables subtotal** | **₱13,614** |
| Shipping allowance across suppliers | ₱500 |
| Replacement/design-change reserve, approximately 20% of subtotal rounded up | ₱2,800 |
| **Working materials budget** | **₱16,914** |
| Agreed development fee | ₱15,000 |
| **Combined working project budget before laboratory costs** | **₱31,914** |

Use **₱17,000** as the rounded materials target and **₱18,000** as an initial reimbursement limit if both parties agree. The reserve is not an amount to spend automatically. A more expensive NPK probe, additional power requirements, substantial custom fabrication, or a different pH kit can require a revised budget.

## Laboratory validation is a separate cost

The paper requires comparison with suitable reference measurements. The component budget does not include buying a laboratory pH meter, oven, precision balance, or reference thermometer, or paying for the full sample-analysis program.

For a published Philippine example, the [National Tobacco Administration analytical-services schedule](https://nta.da.gov.ph/services_analytical.html) lists:

| Soil analysis | Published fee |
| --- | ---: |
| Total nitrogen | ₱365 |
| Available phosphorus | ₱310 |
| Exchangeable potassium | ₱220 |
| **Combined example for those three tests** | **₱895 per sample** |
| Potentiometric pH, if additionally requested | ₱100 |

At those published fees, **10 samples would cost ₱8,950 for the three nutrient tests**, or **₱9,950 including pH**. This is an arithmetic illustration, not a recommended sample count or a current quotation from the laboratory. Confirm current fees, eligibility, sample preparation, and required methods directly with the selected laboratory.

Total nitrogen, available phosphorus, and exchangeable potassium are different measured fractions. They must not automatically be treated as equivalent to an unspecified NPK probe's outputs. The adviser and laboratory need to confirm a suitable comparison before analysis is commissioned.

University access or an applicable government program may reduce cash expenditure, but do not budget a service as free until access and eligibility are confirmed.

## Purchasing recommendations

1. Have the freelancer provide exact product links, quantities, and the final power arrangement before placing orders. Use the figures above as a budget, not a substitute for that list.
2. Follow the paper's proposal to borrow or test the NPK probe for feasibility before buying it. Borrowing a suitable unit could avoid the ₱3,598 probe purchase in this example.
3. Choose the actual pH and moisture sensor models deliberately. A cheaper generic board is not automatically the named DFRobot part, and the paper and calibration work need to describe the parts actually used.
4. Agree which purchases, delivery fees, consumables, and replacement parts are reimbursable and when reimbursement happens. Keep receipts and an itemized record separate from the ₱15,000 development payment.
5. Obtain the laboratory quotation after the sample plan and comparison methods are defined. Do not assume the development fee includes reference testing or dataset collection.

No paid hosting, domain purchase, new computer/router, travel, printing, or binding is included here. A local deployment using existing equipment can avoid a new hosting subscription during development; a cloud deployment needs a separate choice and cost check.
