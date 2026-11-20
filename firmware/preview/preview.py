from concurrent.futures import ThreadPoolExecutor
import os
from pathlib import Path
import shutil
import subprocess
import tkinter as tk
from tkinter import ttk

from render import HEIGHT, WIDTH, PreviewError, Renderer, SOURCE, frame_ppm, source_snapshot

CASES = {
    "Sample readings (offline)": "sample",
    "microSD unavailable": "card-missing",
    "No usable sensors": "no-readings",
    "Clock unavailable": "no-clock",
    "SMS failed": "sms-failed",
    "SMS submitted": "sms-submitted",
}
BACKGROUND, TEXT, MUTED, ACCENT = "#132124", "#edf4f4", "#b1c3c8", "#91dfcc"
ZOOM = 5

class Preview:
    def __init__(self, window, renderer):
        self.window, self.renderer = window, renderer
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.future, self.attempted = None, None
        self.screen, self.scan_timer = "ready", None
        self.case = tk.StringVar(value=next(iter(CASES)))
        self.status = tk.StringVar(value="Building the OLED preview...")
        self.image = None
        self.build_interface()
        self.window.after(0, self.watch_source)

    def build_interface(self):
        self.window.title("Soil Reader OLED Preview")
        self.window.configure(bg=BACKGROUND)
        self.window.minsize(705, 520)
        style = ttk.Style(self.window)
        style.theme_use("clam")
        style.configure("Preview.TButton", padding=(14, 8))
        style.configure("Scan.TButton", padding=(14, 8), background=ACCENT, foreground="#132124")

        outer = tk.Frame(self.window, bg=BACKGROUND, padx=26, pady=20)
        outer.pack(fill="both", expand=True)
        tk.Label(outer, text="OLED preview", fg=TEXT, bg=BACKGROUND,
                 font=("Segoe UI", 22, "bold")).pack(anchor="w")
        tk.Label(outer, text="Hybrid Multi-Sensor Soil Reader   /   SSD1306 128 x 64", fg=MUTED,
                 bg=BACKGROUND, font=("Segoe UI", 10)).pack(anchor="w", pady=(0, 12))
        self.panel = tk.Canvas(outer, width=WIDTH * ZOOM, height=HEIGHT * ZOOM, bg="#091317",
                               highlightbackground="#416366", highlightthickness=2)
        self.panel.pack()
        self.frame = self.panel.create_image(0, 0, anchor="nw")

        controls = tk.Frame(outer, bg=BACKGROUND)
        controls.pack(fill="x", pady=(12, 8))
        self.scan_button = ttk.Button(controls, text="Scan", style="Scan.TButton", command=self.scan, state="disabled")
        self.scan_button.pack(side="left")
        self.view_button = ttk.Button(controls, text="View", style="Preview.TButton", command=self.view, state="disabled")
        self.view_button.pack(side="left", padx=6)
        ttk.Button(controls, text="Reset", style="Preview.TButton", command=self.reset).pack(side="left")
        choices = ttk.Combobox(controls, textvariable=self.case, state="readonly", values=list(CASES), width=25)
        choices.pack(side="right")
        choices.bind("<<ComboboxSelected>>", lambda _: self.draw())

        footer = tk.Frame(outer, bg=BACKGROUND)
        footer.pack(fill="x")
        tk.Label(footer, textvariable=self.status, fg=MUTED, bg=BACKGROUND, font=("Segoe UI", 10)).pack(side="left")
        ttk.Button(footer, text="Open display.cpp", style="Preview.TButton", command=self.open_source).pack(side="right")
        self.errors = tk.Text(outer, height=6, wrap="word", bg="#202b30", fg="#ffd4c9", padx=8, pady=6,
                              relief="flat", font=("Consolas", 9))

    def watch_source(self):
        if self.future is not None and self.future.done():
            try:
                self.future.result()
                self.renderer.accept_build()
                self.errors.pack_forget()
                self.status.set("Save display.cpp to update the preview.")
                self.update_buttons()
                self.draw()
            except (OSError, PreviewError) as exc:
                self.report_error("Preview build failed. Edit and save to retry.", exc)
            self.future = None

        if self.future is None:
            try:
                snapshot = source_snapshot()
                if snapshot != self.attempted:
                    self.attempted = snapshot
                    self.status.set("Building the OLED preview...")
                    self.future = self.executor.submit(self.renderer.build)
            except OSError as exc:
                self.report_error("Waiting for the screen source.", exc)
        self.window.after(500, self.watch_source)

    def report_error(self, status, exc):
        self.status.set(status)
        self.errors.configure(state="normal")
        self.errors.delete("1.0", "end")
        self.errors.insert("1.0", str(exc))
        self.errors.configure(state="disabled")
        self.errors.pack(fill="x", pady=(8, 0))

    def draw(self):
        if not self.renderer.binary.is_file():
            return
        try:
            pixels = self.renderer.pixels(self.screen, CASES[self.case.get()])
            self.image = tk.PhotoImage(data=frame_ppm(pixels), format="PPM").zoom(ZOOM)
            self.panel.itemconfigure(self.frame, image=self.image)
        except PreviewError as exc:
            self.report_error("Could not draw the OLED frame.", exc)

    def update_buttons(self):
        ready = self.renderer.binary.is_file() and self.screen != "scanning"
        self.scan_button.configure(state="normal" if ready else "disabled")
        self.view_button.configure(state="normal" if ready and self.screen != "ready" else "disabled")

    def show(self, screen):
        self.screen = screen
        self.update_buttons()
        self.draw()

    def scan(self):
        self.show("scanning")
        self.scan_timer = self.window.after(450, self.finish_scan)

    def finish_scan(self):
        self.scan_timer = None
        self.show("measurements")

    def view(self):
        self.show("npk" if self.screen == "measurements" else "measurements")

    def reset(self):
        if self.scan_timer is not None:
            self.window.after_cancel(self.scan_timer)
            self.scan_timer = None
        self.show("ready")

    def open_source(self):
        code = shutil.which("Code.exe" if os.name == "nt" else "code")
        if os.name == "nt" and not code:
            installed = Path(os.environ["LOCALAPPDATA"]) / "Programs/Microsoft VS Code/Code.exe"
            code = str(installed) if installed.is_file() else None
        if code:
            subprocess.Popen([code, str(SOURCE)])
        elif os.name == "nt":
            os.startfile(str(SOURCE))


if __name__ == "__main__":
    window = tk.Tk()
    renderer = Renderer()
    preview = Preview(window, renderer)
    try:
        window.mainloop()
    finally:
        preview.executor.shutdown(wait=True, cancel_futures=True)
        renderer.close()
