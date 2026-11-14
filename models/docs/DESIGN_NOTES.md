# Proposed soil analyzer

The concept follows `docs/paper_revised.docx`, particularly **Components of the Device** and **Hardware Development**.

- `blend-files/soil_analyzer_proposed.blend`: editable 3D model. Open the scene **01 Proposed soil analyzer** for the assembled device or **02 Internal component layout** for its conceptual packaging.
- `images/soil_analyzer_proposed_design.png`: perspective render of the proposal.
- `py-files/build_soil_analyzer.py`: source geometry script, executable inside Blender's Python environment.

The model includes a portable enclosure, carry handle, hinged solar panel, rechargeable battery, ESP32, charging controller, capacitive moisture blade, DS18B20 temperature probe, and provisional NPK probe. The liquid pH electrode is shown in a separate soil-water suspension cup, consistent with the revised paper. Status LEDs are an illustrative addition; the thesis's monitoring and advisory interface is accessed through an external computer or mobile browser.

The enclosure envelope is approximately **304 × 224 × 157 mm**, including its cover and excluding the feet, panel, handle, and accessories. The panel envelope is approximately **270 × 165 mm**. These are proposed visual dimensions, not thesis specifications or verified component fits. Battery capacity, solar wattage, controller selection, connector types, material specifications, water resistance, and sensor performance remain to be established. NPK inclusion depends on the feasibility and laboratory checks described in the paper.

The original default scene and `blend-files/test.blend` are retained. The model is a design proposal, not a fabrication-ready assembly.
