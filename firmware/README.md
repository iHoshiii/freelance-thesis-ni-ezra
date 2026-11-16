# Soil analyzer firmware

Prepared for the LAFVIN ESP32 Basic Starter Kit. The generic `esp32dev` target assumes a classic ESP32/ESP-32S module with 4 MB flash. Confirm the metal module marking when it arrives. An ESP32-S3 or ESP32-C3 requires a different target before uploading. The [manufacturer's matching kit](https://lafvintech.com/products/lafvin-basic-starter-kit-for-esp32-esp-32s-wifi-i-ot-development-board-for-arduino-project-learning-kit-with-tutorials) and [PlatformIO board reference](https://docs.platformio.org/en/stable/boards/espressif32/esp32dev.html) support this provisional selection. The exact Shopee variant could not be inspected.

## What is ready

- Wi-Fi reconnection, NTP time, authenticated JSON uploads and 30-second device reports.
- Bounded LittleFS scan queue, checksum verification, restart recovery, retry backoff and matching upload acknowledgements. A failed acknowledgement never removes a scan.
- Manual sample capture through Serial. No automatic scans, invented measurements or assumed sensor wiring.
- Optional DS18B20 temperature driver and two-point analog pH/moisture adapters. All inputs are disabled initially.
- Battery remains null. NPK remains null and its driver awaits the purchased probe's protocol/register map.

## Before the board arrives

Install the **PlatformIO IDE** extension in VS Code and open it once. Open this `firmware` folder as the PlatformIO project. From a PowerShell terminal in this folder:

```powershell
./firmware.ps1 configure
./firmware.ps1 build
```

`configure` creates `include/secrets.h` without overwriting an existing file. This file is ignored by Git. Fill in Wi-Fi name/password, device ID, token and server URL. The code also builds without it, using empty connection settings.

Provision the device once using the [server setup instructions](../docs/SYSTEM_SETUP.md#connect-the-system), or use the token already provisioned for that ID. Never replace a registered device just to obtain another token. Keep database credentials on the server. The device needs only its per-device token. Add its ID to `WORKSPACE_DEVICE_IDS`, run `npm run db:setup` and restart the web server.

### Local laptop server

For a private bench network, edit these values in `include/secrets.h`:

```cpp
#define SOIL_SERVER_URL "http://192.168.1.50:3000"
#define SOIL_ALLOW_LOCAL_HTTP true
```

Replace the address with your laptop's current Wi-Fi IPv4 address from `ipconfig`. Use the same reachable Wi-Fi network on both devices. `localhost` on the ESP32 refers to itself. HTTP is accepted only for literal private IPv4 addresses and explicitly enabled bench use. Your token is visible on that network, so use a trusted network and a dedicated development device/token. The URL must contain only the server origin, without `/api` or a trailing slash.

Start the web app from `apps/web` with `npm run dev`. Ensure the server listens on the LAN address and Windows Firewall permits it on the intended private network. The kit uses 2.4 GHz Wi-Fi. If connection fails, check the access point's band and client isolation settings.

### HTTPS server

Set `SOIL_SERVER_URL` to the server's HTTPS origin and leave local HTTP disabled. Replace the empty root CA definition with the issuer's PEM root certificate:

```cpp
static constexpr char SOIL_ROOT_CA[] = R"PEM(-----BEGIN CERTIFICATE-----
PASTE THE ACTUAL ROOT CERTIFICATE HERE
-----END CERTIFICATE-----
)PEM";
```

TLS verifies certificates and waits for a valid device clock. It does not disable verification or follow redirects. An offline boot can still record scans with unknown acquisition time. Connecting later does not rewrite saved timestamps.

## Arrival day: USB only

1. Confirm the module is classic ESP32/ESP-32S and use a USB data cable. Leave sensors, batteries and solar power disconnected during the first check.
2. Find the new port, then upload and open Serial:

```powershell
./firmware.ps1 ports
./firmware.ps1 upload -Port COM5
./firmware.ps1 monitor -Port COM5
```

Replace `COM5` with the actual port. If upload stays at Connecting, hold the board's BOOT button while connecting, then release it when writing begins. If no port appears, check the cable and identify the USB-UART chip before installing its matching driver. Close Serial Monitor before uploading. Exit PlatformIO monitor with Ctrl+C.

3. On a **new board only**, if Serial reports that flash is not mounted, send `format ERASE` once. This erases queued scans and creates the filesystem. Never format an existing research queue to troubleshoot a mount failure. Firmware does not automatically format flash. Do not use Upload Filesystem or erase-flash commands on a board holding pending scans.
4. Send `status`. Confirm chip/flash details, Wi-Fi, upload configuration and clock. With no sensors enabled, `ready` is false and sensor states are `not_installed`.
5. Check the website's Status tab for a real heartbeat. A database/server error stays visible in Serial. No scan should appear until real sensor measurements are recorded.

Commands require Enter/newline. The helper monitor enables line entry. A different serial terminal should use 115200 baud and newline endings.

## Add the sensors later

Edit [sensor settings](include/sensor_settings.h) only after checking the actual wiring. GPIO numbers are configurable suggestions for a classic ESP32, not connector positions or a verified assembly diagram. Never feed a 5 V signal to an ESP32 input. pH is measured in the separately prepared soil-water suspension.

| Input | Initial setting | Preparation |
| --- | --- | --- |
| DS18B20 | Disabled, GPIO 4 | Confirm a three-wire probe, 3.3 V-compatible wiring and the required data pull-up. Enable `temperatureEnabled`. Compare against a reference thermometer. |
| Analog pH | Disabled, ADC1 GPIO 34 | Confirm output voltage and module type. Enable `phEnabled`, run `read` in two known buffer solutions, then enter the paired millivolt/pH calibration points. |
| Capacitive moisture | Disabled, ADC1 GPIO 35 | Enable `moistureEnabled`, use `read` to collect approved dry/wet reference millivolts, then enter the two reference points. The result is a reference-scaled percentage, not validated volumetric water content. |
| NPK / RS485 | No driver enabled | Confirm probe model, supply, 3.3 V interface, baud/address/register map and scaling before implementation. |
| Battery | No measurement circuit assumed | Add an approved voltage measurement circuit and battery-specific conversion before reporting a percentage. |

Analog inputs without calibration print millivolts but do not upload guessed pH or moisture. Rail-level inputs and out-of-range conversions remain unavailable. The initial sensor `ok` state means the read passed basic checks, not laboratory validation. When several temperature probes are connected, this initial driver uses index zero and needs explicit probe-address selection.

After configuring a real sensor, rebuild and upload, then send:

```text
read
scan sample-001|North plot
status
sync
```

`read` measures without saving. `scan` saves one immutable record with a fresh UUID. Location is optional. All-null readings are refused. `sync` releases a paused upload retry after a configuration/server fix. Sample and location are entered per scan, so separate samples are not silently assigned a fixed location.

## Queue behavior and verification

The limit is initially **100 scans**, at most 4096 bytes each, with a flash reserve. Actual usable capacity depends on the board and filesystem. A full queue refuses new scans and preserves existing ones. Do not change the flash partition layout or device identity while scans remain pending.

A scan is written to a temporary file, flushed, read back, checked and renamed before Serial says Saved. On restart, complete temporary records are recovered. Incomplete/corrupt files stop the queue and remain on flash for inspection. A remote save followed by power loss can cause a duplicate retry, which the API handles using the original record ID. Uploads can arrive in UUID order after restart, so acquisition timestamps determine measurement history.

HTTP 4xx responses pause scan retries except 408/429. Fix the cause and send `sync` or restart. Transient failures use increasing delays capped at 60 seconds. Every retry uses the saved payload and ID. Heartbeats never acknowledge a scan. A lost heartbeat retries on the next reporting interval. Network operations can briefly delay Serial while their timeouts expire.

Portable queue tests run without hardware using a C++11 compiler:

```powershell
python tests/run_tests.py --compiler "g++"
```

For the optional local test toolchain prepared during development:

```powershell
./.venv/Scripts/python.exe tests/run_tests.py --compiler ".venv/Scripts/python.exe -m ziglang c++"
```

Tests exercise the production queue code with an in-memory storage adapter, including restart recovery, partial writes, corruption, capacity and acknowledgement failures. Compilation and host tests cannot verify actual flash power-loss behavior, sensors, USB upload or Wi-Fi. Follow [the hardware acceptance checklist](HARDWARE_CHECKLIST.md) when the board arrives.
