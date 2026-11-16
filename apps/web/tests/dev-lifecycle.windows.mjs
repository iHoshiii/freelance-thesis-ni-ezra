import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { createConnection } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

const supervisor = fileURLToPath(new URL("../scripts/dev-windows.ps1", import.meta.url));
const quotePs = (value) => `'${value.replaceAll("'", "''")}'`;
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
const listening = (port) => new Promise((resolve) => {
  const socket = createConnection({ host: "127.0.0.1", port });
  socket.once("connect", () => { socket.destroy(); resolve(true); });
  socket.once("error", () => resolve(false));
});

for (const mode of ["supervisor", "launcher", "terminal"]) {
  test(`Windows cleans up workers after forced ${mode} termination`, { skip: process.platform !== "win32", timeout: 25000 }, async () => {
    const directory = await mkdtemp(join(tmpdir(), "soilsense-dev-test-"));
    let terminal;
    let info;
    try {
      const worker = join(directory, "worker.mjs");
      const launcher = join(directory, "launcher.mjs");
      const shell = join(directory, "terminal.ps1");
      // The job must terminate both generations and release the grandchild socket.
      await writeFile(worker, `
        import { spawn } from 'node:child_process';
        const code = \`require('node:net').createServer().listen(0, '127.0.0.1', function () {
          console.log(JSON.stringify({ port: this.address().port, server: process.pid,
            worker: Number(process.env.TEST_WORKER), supervisor: Number(process.env.TEST_SUPERVISOR),
            launcher: Number(process.env.SOILSENSE_DEV_OWNER), args: JSON.parse(process.env.TEST_ARGS) }));
        });\`;
        spawn(process.execPath, ['-e', code], { stdio: 'inherit', env: { ...process.env,
          TEST_WORKER: String(process.pid), TEST_SUPERVISOR: String(process.ppid), TEST_ARGS: JSON.stringify(process.argv.slice(2)) } });
        setInterval(() => {}, 1000);
      `);
      const argumentsToPreserve = ["space in argument", 'embedded "quote"', "trailing\\", ""];
      await writeFile(launcher, `
        import { spawn } from 'node:child_process';
        const child = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ${JSON.stringify(supervisor)}], {
          stdio: 'inherit', windowsHide: true, env: { ...process.env, SOILSENSE_DEV_OWNER: String(process.pid),
            SOILSENSE_DEV_COMMAND: JSON.stringify([process.execPath, ${JSON.stringify(worker)}, ...${JSON.stringify(argumentsToPreserve)}]) } });
        child.on('exit', code => process.exit(code ?? 1));
      `);
      await writeFile(shell, `& ${quotePs(process.execPath)} ${quotePs(launcher)}\nexit $LASTEXITCODE\n`);
      terminal = spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", shell], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      let output = "";
      terminal.stdout.on("data", (chunk) => { output += chunk; });
      terminal.stderr.on("data", (chunk) => { output += chunk; });
      const deadline = Date.now() + 15000;
      while (!info && Date.now() < deadline) {
        info = output.split(/\r?\n/).filter((line) => line.startsWith('{"port":')).map((line) => JSON.parse(line))[0];
        if (!info) await delay(25);
      }
      assert.ok(info, `Worker did not start: ${output}`);
      assert.deepEqual(info.args, argumentsToPreserve);
      assert.equal(await listening(info.port), true);
      const exited = once(terminal, "exit");
      process.kill(mode === "terminal" ? terminal.pid : info[mode]);
      const stoppedAt = Date.now();
      while ((alive(info.worker) || alive(info.server) || await listening(info.port)) && Date.now() - stoppedAt < 2000) await delay(25);
      assert.equal(alive(info.worker), false, "Next's parent process survived");
      assert.equal(alive(info.server), false, "Next's child process survived");
      assert.equal(await listening(info.port), false, "The port was not released");
      await exited;
    } finally {
      for (const pid of [info?.server, info?.worker, info?.supervisor, info?.launcher, terminal?.pid]) {
        if (pid && alive(pid)) process.kill(pid);
      }
      await rm(directory, { recursive: true, force: true });
    }
  });
}
