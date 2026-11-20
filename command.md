# Soil Reader commands

Use **PowerShell** to build, upload, and open the preview or Serial Monitor. Once the **Serial Monitor** is open, type commands like `read` there and press **Enter**.

To use your PC as a temporary screen, plug in the ESP32 with a USB data cable. Run **ports**, then **monitor**, then type **read**. If the soil reader firmware has yet to be installed, run **upload** before opening the monitor.

## PowerShell commands

Open PowerShell in the project folder.

```powershell
Set-Location 'C:\Users\Hoshi\Desktop\soilsense'
```

### Find the ESP32 port

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\firmware.ps1 ports
```

Lists the available COM ports. If several appear, run it once with the ESP32 unplugged and again with it plugged in. Use the port that appears after plugging it in. If no port appears, check that your USB cable carries data.

### Open the Serial Monitor

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\firmware.ps1 monitor -Port COM5
```

Replace `COM5` with your ESP32's port. The monitor opens at **115200 baud** and shows the board's messages and sensor readings. Type `help` or `read` and press **Enter**. Press **Ctrl+C** to close the monitor.

### Build the firmware

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\firmware.ps1 build
```

Checks the code and builds the firmware on your PC. This can run while the ESP32 is unplugged. The first build gets the PlatformIO libraries used by the project.

### Upload the firmware

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\firmware.ps1 upload -Port COM5
```

Builds and installs the soil reader firmware on the ESP32. Close the Serial Monitor first and replace `COM5` with your detected port. Use this again after you change and save the firmware or sensor settings.

### Open the OLED preview on your PC

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\firmware.ps1 preview
```

Shows the OLED layout using sample readings. Click **Scan** to show the sample results and **View** to switch pages. Edit [display.cpp](firmware/src/display.cpp) and save to see layout changes on the PC. For real readings from your ESP32, use the Serial Monitor.

### Connect the ESP32 to Wi-Fi

Upload the firmware with Wi-Fi setup first. Close the Serial Monitor, leave the ESP32 plugged into USB, and replace `COM5` with your ESP32's port.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\wifi.ps1 -Port COM5
```

Enter the exact name of your 2.4 GHz network and its password. The script hides the password as you type. The ESP32 saves the network after it connects and tries it again when it starts up. Run the same command for a new network.

### Set up the optional SMS settings

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\firmware.ps1 configure
```

Prepares `firmware/include/secrets.h`. To enable SMS, set `SOIL_SMS_RECIPIENT` to the consenting recipient's number in international format, then upload the firmware again. Keep your existing device ID. An empty recipient keeps SMS disabled.

## Commands to type in the Serial Monitor

Enter one command at a time and press **Enter**. The lines below are for the ESP32 after the Serial Monitor has opened.

| Command | What it does |
| --- | --- |
| `help` | Lists the commands the ESP32 accepts. |
| `status` | Shows whether the clock and microSD are ready, along with the saved pH offset. |
| `wifi-status` | Shows whether the ESP32 is connected to Wi-Fi. |
| `read` | Displays one set of current sensor readings on your PC without saving a file or sending an SMS. This is the command to use before the OLED or microSD arrives. |
| `scan SAMPLE-01` | Takes a reading labeled `SAMPLE-01` and tries to save it to the card. Saving requires at least one usable reading and a working microSD card. A configured modem may submit an SMS after a successful save. |
| `scan SAMPLE-01\|Garden` | Takes a scan and records `Garden` as the location. Type the vertical bar between the sample code and the location. |
| `rtc-set YYYY-MM-DDTHH:MM:SSZ` | Sets the connected DS3231 clock. Replace the date and time with the current **UTC** time and keep the `T` and `Z`. For example, 9:30 AM in the Philippines is 01:30 UTC on the same day. |
| `ph-offset` | Displays the current pH offset and device ID when the offset is available. |
| `ph-offset DEVICE_ID OFFSET` | Saves a pH correction for future readings. Use the reader's actual device ID and an offset calculated from your calibration. [pH calibration and offset guide](docs/PH_CALIBRATION_CONFIGURATION.md) |

If `read` shows empty fields, check that the sensor is wired and enabled in [sensor_settings.h](firmware/include/sensor_settings.h). The pH and moisture readings also need measured calibration values. [Wiring guide](docs/WIRING_GUIDE.md)
