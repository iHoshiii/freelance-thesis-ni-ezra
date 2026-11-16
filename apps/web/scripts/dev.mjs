import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const command = [process.execPath, require.resolve("next/dist/bin/next"), "dev", ...process.argv.slice(2)];
const windows = process.platform === "win32";
const child = windows
  ? spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", fileURLToPath(new URL("./dev-windows.ps1", import.meta.url))], {
      stdio: "inherit", windowsHide: true,
      env: { ...process.env, SOILSENSE_DEV_COMMAND: JSON.stringify(command), SOILSENSE_DEV_OWNER: String(process.pid) },
    })
  : spawn(command[0], command.slice(1), { stdio: "inherit" });

// Closing this supervisor also closes the Windows job that owns every Next worker.
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP", ...(windows ? ["SIGBREAK"] : [])]) {
  process.on(signal, () => child.kill(windows ? "SIGTERM" : signal));
}
process.on("exit", () => child.kill());
child.on("error", (error) => {
  console.error(`Could not start the dev server: ${error.message}`);
  process.exit(1);
});
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 0 : 1)));
