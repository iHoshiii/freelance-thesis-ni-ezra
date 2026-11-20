import argparse
import os
from pathlib import Path
import shlex
import subprocess

parser = argparse.ArgumentParser(description="Run the soil reader's pH offset checks.")
parser.add_argument("--compiler", default="c++", help='C++ compiler command, e.g. "python -m ziglang c++"')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / ".pio" / "host-tests"
output.mkdir(parents=True, exist_ok=True)
binary = output / ("ph-offset-test.exe" if os.name == "nt" else "ph-offset-test")
command = shlex.split(args.compiler, posix=os.name != "nt")
subprocess.run(command + ["-std=c++11", "-Wall", "-Wextra", "-Werror", "-Iinclude",
                          "tests/ph_offset_test.cpp", "-o", str(binary)], cwd=root, check=True)
subprocess.run([str(binary)], cwd=root, check=True)
print("PASS: pH offset checks")
