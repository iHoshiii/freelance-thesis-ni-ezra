# Offline recording and screenless proposal revision

Date: 2026-11-04

The entire text of `paper_revised.docx` and `paper_revised_with_design_figures.docx` was reviewed for storage, communication, firmware, monitoring, reliability, and testing. The source described Wi-Fi transmission, server/database history, connection-failure handling, and recovery tests. It did not define persistent device-side logging or later synchronization. Existing model notes explicitly excluded that feature and included a status OLED.

The user selected offline recording followed by synchronization and then requested removal of the physical display. The revision was initially saved as `paper_revised_offline_screenless.docx`. The current working copy is now named `initial_paper.docx` and includes those revisions; the earlier tracked Word drafts remain available in the Git history.

The proposal now specifies:

- A bounded queue in an allocated area of the selected ESP32 board's onboard flash. Capacity and retained record count must be measured after firmware storage needs are known.
- Local recording without a server connection and automatic upload after a configured Wi-Fi network and the selected server become reachable. Cloud upload requires internet access; a reachable local server can use the local network.
- Persistent record identifiers, duplicate prevention on retry, server acknowledgements, and retention of pending records until storage is confirmed.
- Preservation of pending records and suspension of new local logging when storage is full. The condition is reported to the dashboard when communication resumes.
- Acquisition timestamps when valid, explicit time-quality flags when a valid clock is unavailable, and separate server receipt times. A standalone hardware clock is not assumed.
- A browser dashboard as the user display. New offline readings appear after upload; device status shown during an outage is the last received status, not a live report.
- Server-side fertilizer advice. Autonomous offline advisory generation is outside the proposed scope.

The objective, scope, definitions, related literature, components, architecture, hardware and firmware descriptions, web features, reliability evaluation, integration tests, and cost description were aligned. The power/data-flow figure now shows the persistent queue and acknowledgement workflow. Three proposal illustrations were revised to omit the OLED; the parts plate has 18 groups. Primary Espressif documentation was added to the references.

These changes describe work to implement and validate. They do not establish that functioning firmware, measured storage capacity, power-loss protection, synchronization, or a deployed web application already exists.

The existing `.blend` files and their original generation scripts are historical versions and retain their original geometry and labels. Blender MCP was not connected and no runnable local Blender executable was found during this revision, so the screenless images are edited conceptual illustrations rather than new Blender renders. Original model files and the earlier design assets were preserved.

The NPK probe remains provisional, and the liquid pH electrode still measures a separately prepared soil-water suspension. No separate SD-card module, GPS, or standalone RTC is added.
