# Labeled exploded view

Open soil_analyzer_exploded_labeled.blend.

- Scene 03 Exploded and labeled parts shows the opened enclosure and separated components.
- Scene 04 Labeled component reference shows each numbered component without occlusion.
- Scenes 01 and 02 retain the simplified assembled and internal arrangements.

Labels and leader lines are native Blender objects. Every detached component group is separately selectable in the Exploded collection. The image is a proposed packaging view; separation distances are for explanation, not assembly dimensions or electrical connections.

| No. | Component | Note |
| --- | --- | --- |
| 01 | Solar panel |  |
| 02 | Removable lid and screws |  |
| 03 | ESP32 development board | Wi-Fi data acquisition |
| 04 | pH interface board |  |
| 05 | MAX3485 RS485 interface |  |
| 06 | TP4056 charging module | Draft part; electrical selection pending |
| 07 | 5 V boost converter |  |
| 08 | 12 V boost converter |  |
| 09 | Two rechargeable 18650 cells | Battery wiring not specified |
| 10 | Battery holder |  |
| 11 | Perfboard mounting base |  |
| 12 | 0.96 inch OLED display | Basic device status |
| 13 | Power switch |  |
| 14 | Capacitive moisture sensor |  |
| 15 | DS18B20 temperature probe |  |
| 16 | RS485 NPK probe | Provisional; feasibility check first |
| 17 | Liquid pH electrode |  |
| 18 | Soil-water sample cup | Separate pH measurement sample |
| 19 | Enclosure base |  |
| 20 | Cable entries and seals |  |
| 21 | Jumper wires and resistor | Wiring components; not a circuit diagram |
| 22 | Push button | Draft local control |


The simplified thesis scope is retained: no microSD storage, offline logging, GPS, or standalone RTC. NPK remains conditional on the feasibility check in the revised paper. The pH probe uses a separately prepared soil-water suspension. The charger and converter modules are draft physical placeholders and do not constitute an approved power circuit.

The jumper/resistor bundle and push button visualize items already in the supplied materials list. Calibration consumables and laboratory instruments are not installed parts of the device and are outside this exploded assembly.
