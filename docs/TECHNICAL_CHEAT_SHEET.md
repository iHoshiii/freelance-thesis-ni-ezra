# Soil Analyzer Hardware and Web Application Cheat Sheet

This is a study and presentation reference for the **Hybrid Multi-Sensor Soil Analyzer with Fertilizer Compatibility Advisor and Web-Based Monitoring System**. It explains what each part does, why it is needed, and what users should see in the web application.

**Basis:** the complete text of [initial_paper.docx](initial_paper.docx), especially Components of the Device, System Architecture, Firmware and Data Acquisition, Fertilizer Compatibility Advisory, and Web-Based Application Development. Individual draft part names were cross-checked against `FL13_refined.docx` and the component drawings. The file currently named `initial_paper.docx` already includes offline recording and removal of the physical screen.

**Status:** this describes the proposed prototype. It does not claim that the hardware, firmware, web application, or trained model has already been built or validated. A named draft module is not yet a finalized electrical design.

**Function** means what a component does. **Purpose** means why the project needs it.

## 1. The system in one explanation

The sensors collect soil-related measurements. The ESP32 reads and processes those measurements, saves pending records locally, and uploads them when the configured Wi-Fi network and server are reachable. The server stores the uploaded records and generates the fertilizer compatibility advisory. Users view the results through a browser on a phone or computer.

```text
Prepared soil-water suspension -> pH electrode -> pH interface board --+
Soil -> capacitive moisture sensor ----------------------------------+
Soil -> DS18B20 temperature probe -----------------------------------+-> ESP32
Soil -> provisional NPK probe -> MAX3485 RS485 interface --------------+

ESP32 -> local flash queue -> configured Wi-Fi -> server/database
     -> pending records stay local until upload is acknowledged

Server -> trained model + documented reference rules -> web dashboard
```

The pH electrode measures a **separately prepared soil-water suspension**. It is not inserted directly into dry soil. The NPK probe remains subject to feasibility testing and validation.

## 2. Hardware parts

### 2.1 The 18 groups in the updated component drawing

The numbers below follow the drawing without the OLED. The two cells are one illustrated group, and jumper wires and resistors are another group; therefore, 18 groups does not mean 18 individual physical pieces.

| No. | Part | Function | Purpose in the analyzer |
| --- | --- | --- | --- |
| 01 | Solar panel | Converts available sunlight into electrical energy for the charging circuit. | Supplements battery charging during suitable field conditions. Panel size and output must match the final power design. |
| 02 | Solderless breadboard | Provides reusable electrical connection points without soldering. | Allows the prototype circuit to be assembled, tested, and adjusted. It replaces the perfboard in the current prototype concept. |
| 03 | ESP32 development board | Runs the firmware, reads sensors, applies calibration corrections, manages saved records, and communicates over Wi-Fi. | Acts as the device controller and connects the sensing hardware to the web system. Its Wi-Fi capability is built in. |
| 04 | pH interface board, such as the board in the SEN0161-V2 kit | Conditions the pH electrode signal and supplies an analog output for the controller to read. | Makes the electrode signal usable by the ESP32; firmware and calibration convert the reading into pH. The interface board and electrode perform different jobs. [H1] |
| 05 | MAX3485 RS485 interface module | Converts between the controller's logic-level serial signals and RS485 bus signals. | Allows the ESP32 to communicate with a compatible RS485 NPK probe. It transfers data; it does not measure nutrients. MAX3485 is the drafted 3.3 V transceiver, so a differently labeled module needs its own compatibility check. [H2] |
| 06 | TP4056-based charging module, draft choice | Controls charging current and voltage for a compatible single-cell lithium-ion battery arrangement. | Recharges the battery. Its suitability for the proposed solar input, operation while charging, protection arrangement, and two-cell holder is not yet established. It is not a charger for two cells connected in series. [H3] |
| 07 | 5 V boost converter, draft choice | Raises a lower input voltage to a regulated 5 V output within its operating limits. | Supplies a 5 V rail if required by the selected development board or modules. The correct board power input and required current must be confirmed. |
| 08 | 12 V boost converter, conditional draft choice | Raises a lower input voltage to a regulated 12 V output within its operating limits. | Supplies the NPK probe only if the selected probe requires a 12 V supply. The actual probe specification determines whether this converter is needed. |
| 09 | Two rechargeable 18650 cells, draft quantity | Store electrical energy chemically and provide power when discharged. | Make portable operation possible when sunlight or external charging is unavailable. Capacity and the series/parallel arrangement remain to be selected with the charger and protection circuit. |
| 10 | Battery holder | Holds the cells and provides electrical contacts. | Makes battery installation and mechanical support practical. The holder's wiring determines the cell arrangement; the holder itself does not charge or protect the cells. |
| 11 | Power switch | Opens or closes the device power path according to the final wiring. | Gives the user a physical on/off control. |
| 12 | Capacitive soil moisture sensor, such as SEN0193 | Produces an analog signal that changes with the moisture-related dielectric properties around the sensing area. | Supplies the soil moisture input. The project must calibrate it against the chosen reference method before reporting a moisture percentage. [H4] |
| 13 | DS18B20 temperature probe | Measures temperature and communicates digitally over a 1-Wire interface. | Supplies the soil temperature input in degrees Celsius after reference checks. The proposed probe assembly has a waterproof sensing tip. [H5] |
| 14 | RS485 NPK probe, provisional | Reports N-, P-, and K-related readings through its supported communication protocol. | Provides proposed nutrient-related inputs for monitoring and advisory generation. Inclusion depends on comparison with suitable laboratory measurements; the displayed units and nutrient fractions must match the actual probe and validation method. |
| 15 | Liquid pH electrode | Produces an electrical response related to the pH of the liquid sample in contact with it. | Measures acidity or alkalinity in the prepared soil-water suspension. It connects to the pH interface board, not directly to a normal ESP32 analog input. [H1] |
| 16 | Soil-water sample cup | Holds the prepared suspension during pH measurement. | Provides a separate container for a consistent pH sampling procedure. It is a sample accessory, not an electronic sensor. |
| 17 | Jumper wires and resistors | Wires connect circuit points; resistors provide functions such as a data-line pull-up or a designed voltage divider. | Complete the prototype connections and support suitable signal levels. A typical DS18B20 connection uses a 4.7 kΩ pull-up; a divider is a separate circuit whose values depend on its purpose. [H6] |
| 18 | Push button, drafted local control | Sends a momentary input to the ESP32. | Can provide a simple local action, such as requesting a measurement. Its exact action must be defined in the firmware; the paper does not establish a completed button workflow. |

### 2.2 Other hardware and supporting equipment

These are also relevant even though they are not separate groups on the 18-part plate.

| Part or equipment | Function | Purpose and status |
| --- | --- | --- |
| Allocated onboard flash on the ESP32 board | Retains committed data without continuous power. | Holds a bounded queue of pending sensor records during loss of server access. It is already on the board, so no separate memory module is added. Capacity and restart recovery must be tested. [H7] |
| Battery protection and suitable power regulation | Limit electrical conditions and provide the required supply rails. | Support operation within the selected cells' and electronics' specifications. The exact protection circuit and module ratings remain to be selected. Charging control, battery protection, and voltage conversion are separate functions. |
| Enclosure, lid, fasteners, and internal supports | Hold and shield the electronics. | Provide the final assembled device with mechanical protection and accessible parts. The exposed breadboard illustration shows the inside; it does not eliminate the paper's final enclosure requirement. |
| Cable connectors, entries, strain relief, and seals | Route and secure probe and power connections. | Allow practical connection and reduce pulling on circuit joints. Enclosure water resistance depends on the completed construction and testing. |
| Programming/data cable compatible with the ESP32 board | Connects the board to a development computer. | Allows firmware upload and development diagnostics. It is supporting equipment rather than another sensor. |
| Wi-Fi router or configured access point | Provides the wireless network connection. | Connects the analyzer to the server. Cloud upload also needs an internet route; a local server can operate through a reachable local network. [H8] |
| Computer used as a local server, or a hosted server | Runs the receiving application, database connection, and advisory service. | Provides the server side of the system. A separate server purchase or a paid cloud service is not specified as mandatory. |
| Phone or computer with a supported browser | Displays the web interface and accepts user actions. | Serves as the user's screen because the analyzer has no dedicated OLED or LCD. |
| External analog-to-digital converter, conditional | Converts analog sensor voltages into digital readings. | May be added only if preliminary tests show the selected ESP32 analog inputs are unsuitable. The paper does not make it a finalized component. |

### 2.3 Calibration and testing materials

These establish whether the readings are useful. They are not all installed inside the analyzer.

| Material or instrument | Function | Purpose |
| --- | --- | --- |
| Calibrated reference pH meter | Measures the same prepared suspension independently. | Provides reference pH values for comparison with the prototype. |
| Certified pH buffer solutions | Provide known pH reference points. | Calibrate and check the pH system. The paper ordinarily uses pH 4.00 and 7.00, with an additional point where appropriate. Use the actual certified buffer values and applicable procedure; the older draft lists different buffer values. |
| Calibrated reference thermometer | Provides an independent temperature measurement. | Checks the DS18B20 over the intended test range. |
| Drying oven | Dries soil according to the selected reference procedure. | Supports gravimetric moisture determination. |
| Balance, moisture tins, and desiccator | Measure sample mass, hold samples, and support controlled cooling after drying. | Establish wet/dry mass measurements for the moisture reference. |
| Soil auger or trowel, bags, labels, sieve, and clean containers | Collect, identify, prepare, and contain soil samples. | Keep measurements traceable to the correct sample and preparation method. |
| Suitable laboratory N, P, and K analyses | Measure specified nutrient fractions using documented methods. | Determine whether the provisional NPK outputs are suitable for the intended use. |
| Digital multimeter and suitable current or power meter | Measure electrical conditions. | Verify supply voltages, current demand, and power behavior. |
| Browser tools and stopwatch or timing logger | Measure application behavior and elapsed time. | Collect evidence for web performance and functional testing. |

### 2.4 Hardware decisions to remember

- **No physical screen:** the browser dashboard is the display.
- **No separate microSD module or card:** pending readings use allocated onboard flash.
- **Breadboard for the prototype:** the earlier perfboard arrangement is superseded.
- **No standalone RTC or GPS in the current proposal:** timestamps need a valid clock or an explicit time-quality flag; sample locations can be recorded manually.
- **Power modules remain draft choices:** the panel, battery arrangement, charger, protection, and converters must be selected together. The component drawing is not a wiring diagram.
- **NPK remains provisional:** a working serial connection alone does not validate the nutrient measurements.

## 3. Web application features users should see

The following content is supported by the paper. Related items can share one page; this is a feature inventory, not a requirement to build a separate page for every row.

### 3.1 Main user features

| Feature or visible item | What users see or do | Purpose |
| --- | --- | --- |
| Main dashboard | View an overview of the latest uploaded readings and update information. | Replace the physical screen and give a quick view of the most recently received soil information. |
| pH reading | View the calibrated pH result for the identified soil-water sample. | Review the measured acidity or alkalinity. pH has no percentage unit. |
| Soil temperature reading | View the temperature in °C. | Review the measured soil temperature alongside the other parameters. |
| Soil moisture reading | View the calibrated moisture result and its stated basis or unit. | Review soil moisture without presenting raw analog readings as a validated percentage. |
| N, P, and K readings | View separate nutrient-related values and units when the probe and measurement method have passed the required checks. | Include validated nutrient information. Missing or unvalidated values should be identified rather than treated as reliable concentrations. |
| Sample and record identification | See which sample and measurement record the values belong to. | Keep the pH suspension, other sensor readings, history, and advisory linked to the correct sample or session. |
| Measurement time or time-quality information | See when the reading was acquired, or that its acquisition time is unavailable or uncertain. | Distinguish actual measurement time from later upload time. |
| Server receipt time and last update | See when the server received the record and when displayed information was last refreshed. | Make delayed uploads understandable. |
| Historical records | Retrieve previously uploaded measurements and their identifiers, times, and associated information. | Review past samples and compare records, including readings uploaded after an offline period. |
| Fertilizer compatibility advisory | Request or view the model-generated advisory for a selected valid measurement record. | Provide decision support based on the study's defined dataset and fertilizer references. |
| Supported crop or fertilizer selection, where applicable | Choose only among the crop or fertilizer options actually supported by the study. | Give the advisor the correct context. The paper initially limits the advisory to one locally relevant crop and a small defined fertilizer set. |
| Model result and supporting measurements | See the compatibility class or advisory together with the soil values used. | Help the user understand the basis of the output. Exact class names must be defined during model development. |
| Calibration or measurement-validity information | See relevant calibration status and whether a measurement is acceptable for use. | Avoid treating unchecked or unsuitable inputs as validated data. |
| Invalid, missing, or insufficient-data messages | See a clear explanation when the inputs cannot support a result. | Prevent misleading readings or unsupported advisories. |
| Stale-data or delayed-upload indication | See that a displayed record is older or arrived after a connection outage. | Prevent old values from being mistaken for live measurements. |
| Advisory limitation notice | See the defined limits of the recommendation. | Explain that the output supports decisions and does not replace laboratory analysis or professional agronomic advice. |
| Device last-contact information | See when the server last heard from the device. | Help users judge whether displayed information may be outdated. This is evidence of last contact, not continuous knowledge of the device's condition. |
| Synchronization information | See the last reported upload state, pending-record count, and storage condition. | Show whether local records were awaiting upload or storage was full when the device last reported. These values cannot update through a disconnected device. |
| Controlled data access and retrieval | Access records through the application's allowed actions. | Support organized storage and retrieval without assuming unrestricted editing or deletion. |
| Login or basic session control, if required | Sign in or maintain an authorized application session. | Control access when required by the implementation. The thesis does not mandate public registration or a full administrator role system. |
| Phone and desktop browser layout | Read the same supported information on the selected mobile and desktop browsers. | Make the web interface usable as the display during field use and evaluation. |

### 3.2 Useful presentation choices that are not fixed requirements

| Possible addition | Purpose | How to describe it accurately |
| --- | --- | --- |
| Charts of historical readings | Make changes across recorded measurements easier to compare. | Charts appear in the earlier materials draft. They can visualize the paper's history feature, but chart types and pages are not finalized. |
| Date or sample filters | Make a particular stored record easier to find. | A practical way to implement record retrieval; the exact filters remain a design choice. |
| Readings shown as cards, tables, or tabs | Make values and details easier to scan. | Interface layout choices, not additional research capabilities. |

Battery percentage, solar charging telemetry, GPS maps, downloadable reports, and a numerical model-confidence score are **not established web requirements in the current paper**. They need their own supporting hardware, data, or software decisions before being described as available features.

## 4. Software that works behind the interface

These functions make the visible features possible. They do not all need a user-facing page.

| Software element | Function | Purpose |
| --- | --- | --- |
| ESP32 firmware | Initializes sensors, reads signals, applies calibration, records measurements, and manages communication. | Coordinates the physical device. It is software running on the analyzer rather than in the browser. |
| Local persistent queue | Saves pending records in allocated flash before upload attempts. | Supports limited offline recording and intended retention of committed records across restarts, subject to testing. |
| Wi-Fi reconnection and upload logic | Reconnects to the configured network and retries when the selected server becomes reachable. | Transfers pending records after an outage without requiring uninterrupted connectivity. |
| API or server receiving endpoint | Accepts device records and checks their required fields and formats. | Provides the communication boundary between the device and stored web data. |
| Database | Stores measurement records, identifiers, calibration information, timestamps, and advisory records. | Supplies persistent history and the records used by the dashboard and advisor. The paper does not require a particular database vendor. |
| Duplicate prevention and server acknowledgement | Recognizes repeated device/record identifiers and confirms successful storage. | Lets uploads be retried without creating duplicate measurements; the device releases a pending record only after confirmation. |
| Time handling | Separates acquisition time, time-quality status, and server receipt time. | Preserves the meaning of measurements collected before upload or before a valid clock is available. |
| Input validation and advisory checks | Detect invalid, missing, stale, or unsupported inputs and apply the defined handling rules. | Keep unsuitable data from producing misleading advice. |
| Trained model | Maps supported, calibrated inputs to the defined advisory classes. | Produces the fertilizer compatibility output. A Decision Tree is the initial candidate; Random Forest or SVM are conditional comparisons, not three mandatory deployed models. |
| Documented fertilizer references and decision rules | Define supported options, interpretation limits, and consistency checks. | Connect the model output to the study's reviewed agricultural basis. |
| Browser interface | Retrieves and presents available records, statuses, and advisories. | Gives users a readable operating display. |
| Hosting environment | Runs the selected server services. | Makes the application reachable through a local server or a chosen hosted deployment. A domain name, database, and application server perform different jobs. |

## 5. What happens when connectivity changes

| Situation | Device behavior | What the user can see on the web |
| --- | --- | --- |
| Configured Wi-Fi and server are reachable | Acquires and saves records, uploads them, and clears acknowledged pending entries. | Newly received readings, history, and supported server-generated advisories. Update timing depends on the implemented measurement and refresh intervals. |
| Wi-Fi is unavailable | Continues sensing and local recording while power and queue capacity allow. | Previously uploaded data only, if the user's browser can still reach the server. New device readings are not yet visible. |
| Wi-Fi is connected but the server is unreachable | Keeps pending records and retries later. | No new uploads from that device. Wi-Fi connection alone does not prove cloud access. |
| Connectivity returns | Uploads pending records using their existing identifiers and waits for confirmation. | Delayed records become available with their time information; history should not label upload time as acquisition time. |
| Local storage becomes full | Preserves pending records and pauses new local logging. | The condition can be reported after communication resumes. The dashboard cannot promise an immediate warning during a device outage. |
| Device restarts | Attempts to recover committed records and resume synchronization. | Recovered records appear after successful upload. Retention and interrupted-write behavior must be validated. |

**Offline recording does not mean an offline web dashboard or an on-device fertilizer advisor.** The proposal places the advisory on the server. A phone with internet access can view previously uploaded cloud data even while the analyzer is disconnected; a phone without a route to the server cannot fetch new server data.

## 6. Short answers for a technical presentation

| Question | Short answer |
| --- | --- |
| What is the controller? | The ESP32. It reads the sensors, applies calibration, saves pending records, and uploads them. |
| Where is the screen? | The browser on the user's phone or computer serves as the screen. There is no dedicated OLED or LCD on the analyzer. |
| Where are offline readings saved? | In a limited, allocated area of the ESP32 board's onboard flash. The final retained record count will be measured. |
| When can users see an offline reading? | After it has been successfully uploaded to the server. |
| What is the difference between the pH electrode and its board? | The electrode responds to the sample's pH; the interface board conditions its signal for the controller. |
| Why is there an RS485 module? | It lets the ESP32 exchange data with the compatible NPK probe. It does not sense nutrients itself. |
| Does the device recommend fertilizer by itself? | The proposed server generates the advisory from uploaded data using the trained model and documented references. |
| Does the solar panel guarantee continuous operation? | No. It supplements charging; runtime depends on the selected battery, load, sunlight, and charging design. |
| Are all NPK readings automatically reliable? | No. The NPK probe is provisional and must be checked against appropriate laboratory reference measurements. |
| Is the whole application already implemented? | This cheat sheet describes the proposal. Implementation and validation establish what the prototype actually achieves. |

## 7. Reference notes

The thesis controls the project scope. Manufacturer documentation below supports component behavior; it does not establish that a particular purchased module, wiring arrangement, or prototype has passed testing.

- **H1:** [DFRobot SEN0161-V2 pH kit documentation](https://wiki.dfrobot.com/sen0161-v2/) — solution pH measurement, signal conditioning, and calibration support.
- **H2:** [Analog Devices MAX3485 documentation](https://www.analog.com/en/products/max3485.html) — 3.3 V RS485/RS422 transceiver function.
- **H3:** [TPOWER TP4056 manufacturer datasheet hosted by LCSC](https://datasheet.lcsc.com/lcsc/TPOWER-TP4056_C382139.pdf) — single-cell lithium-ion charging function. A module's additional protection features must be checked separately.
- **H4:** [DFRobot SEN0193 moisture sensor documentation](https://wiki.dfrobot.com/sen0193/) — capacitive sensing and analog output.
- **H5:** [Analog Devices DS18B20 documentation](https://www.analog.com/en/products/ds18b20.html) — digital temperature measurement and 1-Wire communication.
- **H6:** [Analog Devices DS18B20 pull-up guidance](https://support.analog.com/en-US/knowledgebase/article/000094969) — the 4.7 kΩ pull-up in the typical connection.
- **H7:** [Espressif non-volatile storage documentation](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/storage/nvs_flash.html) — persistent storage in flash.
- **H8:** [Espressif Wi-Fi station documentation](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/wifi-driver/station-scenarios.html) — configured network connection and application reconnection handling.

When converting this Markdown into a document, preserve the words **proposed**, **draft**, **conditional**, and **provisional** where used. Do not turn a listed interface choice or untested component into a completed feature or validated result.
