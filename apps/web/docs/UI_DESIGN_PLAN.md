# SoilSense UI design plan

Status: Planned
Agreed: 9 November 2026

## Design direction

Build a compact monitoring dashboard with mostly white surfaces, forest-green navigation, and pale-green selections. Give the readings and scan history the strongest visual emphasis.

Keep copy short and functional. Use consistent typography, spacing, and controls to make the interface feel considered and specific to soil monitoring.

This plan complements the [dashboard feature plan](DASHBOARD_PLAN.md).

## Visual references

| Reference | Details to adapt |
| --- | --- |
| [FarmSense by tubik](https://dribbble.com/shots/25937205-Smart-Farming-Dashboard-UI-FarmSense-App) | Compact monitoring panels, short labels, and clear separation between readings and controls. |
| [Agrova by Emura](https://dribbble.com/shots/27189397-Agrova-Smart-Farming-Dashboard) | Restrained green tones, thin borders, and generous spacing. |

Use FarmSense's compact organization as the main reference, adapted to SoilSense's scan workflow and the palette below.

## Color palette

| Role | Color | Use |
| --- | --- | --- |
| Forest green | `#173F35` | Sidebar, primary buttons, and strong accents. |
| White | `#FFFFFF` | Reading panels, tables, and main content surfaces. |
| Pale green | `#EAF4EC` | Selected filters and navigation highlights on white surfaces. |
| Light background | `#F6F9F6` | Page background around content panels. |
| Dark text | `#24352B` | Headings, values, and readable labels. |

Use green consistently for navigation and selection. Reserve warning and error colors for meaningful states, with text or icons as well as color.

## Desktop layout

1. A narrow forest-green sidebar with clearly labeled navigation.
2. A compact header with the page title and last-upload status.
3. One prominent **Last scan** panel.
4. A **Scans** section with filters, search, export, and the history table.
5. One trend chart in the later phase, between the last scan and history.

Keep the last scan visible independently of history filters. Group actions with the content they affect.

### Last scan panel

- Show scan ID, measurement time, and location when available in a compact heading row.
- Divide the panel into four reading groups: pH, moisture, temperature, and NPK.
- Use simple dividers and alignment rather than nesting multiple cards.
- Emphasize the reading value, with its unit beside it and a short label above.
- Include **View details** for the full measurement record.
- Keep unavailable values and provisional NPK status clear.

### Scan history

- Place date controls above the table: **Today**, **Last 7 days**, **Last 30 days**, **All**, and **Custom range**.
- Use the same labels and date meanings across the application.
- Group search and CSV export with the history controls.
- Show the matching scan count beside the section title.
- Use compact, readable rows with aligned units and numeric columns.
- Open a scan's details from its row.
- Add comparison controls in the later phase.

## Typography and styling

- Use one neutral sans-serif font family with a small, consistent size hierarchy.
- Use tabular numerals for readings and table values.
- Keep body text and table labels readable; reduce wording rather than shrinking text.
- Use modest corner rounding, thin borders, and restrained shadows.
- Keep icons consistent and pair unfamiliar actions with text labels.
- Use white space to separate sections and maintain consistent spacing within them.
- Give hover, selected, focus, disabled, and loading states distinct treatments.

## Copy and content

- Prefer direct labels: **Last scan**, **Scans**, **Last upload**, **View details**, and **Export CSV**.
- Keep setup explanations and calibration notes inside relevant disclosures or scan details.
- Put fertilizer advice inside the details of the selected scan.
- Keep empty states brief, such as **No scans yet**, with one useful explanatory sentence.
- Show measurement time and upload time separately.
- Only display **Online** after a reliable connection check exists.
- Avoid large greetings, marketing slogans, decorative crop illustrations, and oversized status cards.
- Avoid decorative charts, invented measurements, and unsupported soil-health claims.

## Mobile layout

- Replace the desktop sidebar with compact labeled navigation.
- Arrange the reading groups in a two-column layout, stacking further on narrow screens.
- Let history controls wrap without clipping labels or reducing touch targets.
- Preserve access to full scan details when the history table needs horizontal scrolling.
- Keep last-upload information visible without taking over the header.

## Delivery order

1. Apply the palette, typography, navigation, and shared control styles.
2. Build the last-scan panel and concise empty state.
3. Build history filters, search, table, and export controls as their data features become available.
4. Apply the same styles to scan details and advisor availability states.
5. Verify desktop and mobile layouts, keyboard focus, text contrast, and long or missing values.
6. Add trends and comparison using the same visual rules in the later phase.

## Review criteria

- The latest scan and its readings are easy to locate immediately.
- Date filters, search, and export are easy to find above the history list.
- The interface stays predominantly green and white without losing readable contrast.
- Labels are brief, units are visible, and paragraphs do not dominate the dashboard.
- Empty, loading, missing-data, and error states remain useful and truthful.
- The layout fits the agreed dashboard scope and works on desktop and mobile.
