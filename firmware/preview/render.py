import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory

PREVIEW = Path(__file__).resolve().parent
FIRMWARE = PREVIEW.parent
DISPLAY_SOURCES = [FIRMWARE / "src" / name for name in ("display.cpp", "display_wifi.cpp")]
WIDTH, HEIGHT = 128, 64
STRIDE = WIDTH // 8
CORE_HOME = Path(os.environ.get("PLATFORMIO_CORE_DIR", Path.home() / ".platformio"))
CORE = CORE_HOME / "packages" / "framework-arduinoespressif32" / "cores" / "esp32"
GFX = FIRMWARE / ".pio" / "libdeps" / "esp32dev" / "Adafruit GFX Library"


class PreviewError(Exception):
    pass


def source_snapshot():
    files = [*DISPLAY_SOURCES, *sorted((FIRMWARE / "include").glob("*.h")), *sorted(PREVIEW.glob("*.cpp")),
             *sorted((PREVIEW / "host").glob("*.h"))]
    return tuple((path, path.stat().st_mtime_ns) for path in files)


def compiler_command():
    if importlib.util.find_spec("ziglang"):
        python = Path(sys.executable)
        if python.name.lower() == "pythonw.exe":
            python = python.with_name("python.exe")
        return [str(python), "-m", "ziglang", "c++"]
    compiler = shutil.which("c++") or shutil.which("clang++")
    if compiler:
        return [compiler]
    raise PreviewError("A local C++ compiler is required. Install ziglang in the Python environment used for the preview.")


def run_command(command, timeout):
    options = {"creationflags": subprocess.CREATE_NO_WINDOW} if os.name == "nt" else {}
    try:
        result = subprocess.run(command, cwd=FIRMWARE, capture_output=True, timeout=timeout, **options)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise PreviewError(str(exc)) from exc
    if result.returncode:
        diagnostic = result.stderr or result.stdout
        raise PreviewError(diagnostic.decode("utf-8", errors="replace").strip()
                           or f"Preview renderer exited with status {result.returncode}.")
    return result.stdout


class Renderer:
    def __init__(self):
        cache = FIRMWARE / ".pio" / "oled-preview"
        cache.mkdir(parents=True, exist_ok=True)
        self._window_dir = TemporaryDirectory(dir=cache)
        self.directory = Path(self._window_dir.name)
        suffix = ".exe" if os.name == "nt" else ""
        self.binary = self.directory / f"render{suffix}"
        self.candidate = self.directory / f"candidate{suffix}"

    def build(self):
        core_files = [CORE / name for name in ("Print.cpp", "Print.h", "Printable.h")]
        gfx = GFX / "Adafruit_GFX.cpp"
        if not all(path.is_file() for path in [*core_files, gfx]):
            raise PreviewError("Build the ESP32 firmware once to install its PlatformIO libraries and Arduino core.")
        for path in core_files:
            shutil.copyfile(path, self.directory / path.name)
        headers = [self.directory, PREVIEW / "host", FIRMWARE / "include", GFX]
        sources = [PREVIEW / "preview_display.cpp", *DISPLAY_SOURCES, gfx, self.directory / "Print.cpp"]
        command = compiler_command() + ["-std=c++11", "-O2", "-DARDUINO=10819", "-DSOIL_DESKTOP_PREVIEW"]
        for directory in headers:
            command += ["-I", str(directory)]
        command += [*(str(path) for path in sources), "-o", str(self.candidate)]
        run_command(command, timeout=120)

    def accept_build(self):
        self.candidate.replace(self.binary)

    def pixels(self, screen, scenario):
        pixels = run_command([str(self.binary), screen, scenario], timeout=5)
        if len(pixels) != STRIDE * HEIGHT:
            raise PreviewError(f"Expected a {WIDTH}x{HEIGHT} monochrome frame, received {len(pixels)} bytes.")
        return pixels

    def close(self):
        self._window_dir.cleanup()


def frame_ppm(pixels):
    lit, dark = bytes.fromhex("B9E7FF"), bytes.fromhex("091317")
    colors = [b"".join(lit if value & (0x80 >> bit) else dark for bit in range(8)) for value in range(256)]
    return f"P6\n{WIDTH} {HEIGHT}\n255\n".encode("ascii") + b"".join(colors[value] for value in pixels)
