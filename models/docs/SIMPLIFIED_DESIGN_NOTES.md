# Simplified thesis proposal

The user's scope instruction and `docs/paper_revised.docx` govern the design. `C:/Users/Administrator/Downloads/FL13_refined.docx` supplies draft component choices; inclusion in that list does not make a feature part of the thesis.

| Item | Treatment |
| --- | --- |
| ESP32, Wi-Fi, sensor interfaces | Included for acquisition and web/server transmission. |
| Capacitive moisture sensor and DS18B20 | Included as separate soil probes. |
| Glass pH electrode and interface | Included with a separate soil-water suspension cup; no direct dry-soil insertion. |
| RS485 NPK probe and MAX3485 | Provisional; the revised paper requires feasibility checks before final inclusion. |
| Solar panel, rechargeable cells, protection and regulation | Included as physical concepts. Draft TP4056 and boost modules are placeholders pending electrical selection. |
| Two 18650 cells and holder | Shown as draft physical components; no series/parallel wiring is specified. |
| 0.96-inch OLED | Included from the materials list as a basic status display. It does not imply offline storage or on-device advice. |
| microSD module and SD card | Excluded. The paper does not specify offline logging or later synchronization, and the user explicitly excluded memory for that purpose. |
| DS3231 RTC | Omitted; the paper requires timestamps but does not establish a separate hardware clock requirement. |
| GPS | Omitted; not established in the revised paper's device scope. |
| Data history and fertilizer advice | Web/server functions. No paid hosting or specific database vendor is assumed. |

The revised paper allows an existing computer/local web server or institutional hosting. It describes connectivity failure handling but does not define autonomous offline logging, an offline advisory workflow, or queued uploads. That distinction is retained in the model.

The revised proposal uses a plain enclosure with a flat solar panel, simple cable entries, a status OLED and a power switch. It removes the elaborate carry frame, articulated solar mount, integrated pH cup holder, custom probe rack and decorative bumper assemblies from the earlier concept. The soil block is presentation context, not a device component.

The enclosure is approximately 204 × 144 × 83 mm including its cover; the panel is approximately 164 × 110 mm. These dimensions are illustrative. Purchased-part dimensions, electrical ratings, charger suitability, battery arrangement, probe validation and enclosure sealing remain to be confirmed. This is a proposed appearance and packaging model, not fabrication CAD or a wiring diagram.

Open `blend-files/soil_analyzer_simplified.blend`. Scene **01 Simplified soil analyzer** shows the assembly; scene **02 Simplified internal arrangement** shows the conceptual component layout. The earlier design remains in `blend-files/soil_analyzer_proposed.blend`.
