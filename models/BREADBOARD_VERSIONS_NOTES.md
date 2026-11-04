# Exposed breadboard versions

Two new models follow the request for a compact version and a scattered-parts version. Both remove the enclosure and lid and replace the perfboard with a generic solderless breadboard. The earlier files are retained.

- `soil_analyzer_breadboard_compact.blend` shows an exposed assembly. The ESP32, RS485 interface, jumper/resistor bundle and push button are placed around the breadboard; the other modules and battery holder sit adjacent. The solar panel is beside the exposed assembly. Matching numbers identify the 19 component groups in the legend.
- `soil_analyzer_breadboard_scattered.blend` shows the same 19 groups separately, each with its name.
- The corresponding PNG images are presentation previews of those two models.

All parts and labels are editable Blender objects. Each file opens in its presentation camera view. Viewport helper overlays are disabled to avoid the camera, light and relationship-line clutter seen in the earlier screenshot. The Labels collection can be hidden separately when inspecting the geometry.

The generic breadboard is shown with 830 socket marks: 630 terminal-strip contacts and 200 power-rail contacts. Its dimensions and all component placement are illustrative. Sensor cables and jumper routes show a proposed physical arrangement, not a validated electrical circuit. The charging modules, battery configuration and final wiring remain to be selected and checked against the actual parts.

The thesis constraints remain: the liquid pH electrode is used with a separate soil-water suspension; NPK is provisional; no SD-card logging, standalone RTC, GPS or offline storage feature is added.
