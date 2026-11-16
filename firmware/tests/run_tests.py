import argparse
import os
from pathlib import Path
import shlex
import subprocess

parser = argparse.ArgumentParser(description="Run the real queue implementation against an in-memory flash adapter.")
parser.add_argument("--compiler", default="c++", help='C++ compiler command, e.g. "python -m ziglang c++"')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / ".pio" / "host-tests"
output.mkdir(parents=True, exist_ok=True)
binary = output / ("queue-test.exe" if os.name == "nt" else "queue-test")
sources = ["src/scan_queue.cpp", "src/queue_codec.cpp", "tests/queue_test.cpp", "tests/recovery_test.cpp"]
command = shlex.split(args.compiler, posix=os.name != "nt")
subprocess.run(command + ["-std=c++11", "-Wall", "-Wextra", "-Werror", "-Iinclude", "-Itests", *sources, "-o", str(binary)], cwd=root, check=True)
subprocess.run([str(binary)], cwd=root, check=True)
