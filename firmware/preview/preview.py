from concurrent.futures import ThreadPoolExecutor
import tkinter as tk
from tkinter import ttk

from navigation import PreviewNavigation
from render import HEIGHT, WIDTH, PreviewError, Renderer, frame_ppm, source_snapshot
BACKGROUND, MUTED, ACCENT = "#132124", "#b1c3c8", "#91dfcc"
ZOOM = 5

class Preview:
    def __init__(self, window, renderer):
        self.window, self.renderer = window, renderer
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.future, self.attempted = None, None
        self.navigation = PreviewNavigation(window.after, self.refresh)
        self.view_timer = None
        self.view_was_held = False
        self.image = None
        self.build_interface()
        self.window.after(0, self.watch_source)

    def build_interface(self):
        self.window.title("Soil Reader OLED Preview")
        self.window.configure(bg=BACKGROUND)
        self.window.minsize(684, 410)
        style = ttk.Style(self.window)
        style.theme_use("clam")
        style.configure("Preview.TButton", padding=(14, 8))
        style.configure("Scan.TButton", padding=(14, 8), background=ACCENT, foreground="#132124")

        outer = tk.Frame(self.window, bg=BACKGROUND, padx=20, pady=20)
        outer.pack(fill="both", expand=True)
        self.panel = tk.Canvas(outer, width=WIDTH * ZOOM, height=HEIGHT * ZOOM, bg="#091317",
                               highlightbackground="#416366", highlightthickness=2)
        self.panel.pack()
        self.frame = self.panel.create_image(0, 0, anchor="nw")

        controls = tk.Frame(outer, bg=BACKGROUND)
        controls.pack(pady=(12, 0))
        self.scan_button = ttk.Button(controls, text="Scan", style="Scan.TButton",
                                      command=self.navigation.scan, state="disabled")
        self.scan_button.pack(side="left")
        self.view_button = ttk.Button(controls, text="View", style="Preview.TButton", command=self.view, state="disabled")
        self.view_button.pack(side="left", padx=(6, 0))
        self.view_button.bind("<ButtonPress-1>", self.view_down)
        self.view_button.bind("<ButtonRelease-1>", self.view_up)
        self.view_button.bind("<Shift-Return>", self.keyboard_hold_view)

        self.status = tk.Label(outer, fg=MUTED, bg=BACKGROUND, font=("Segoe UI", 10))
        self.errors = tk.Text(outer, height=6, wrap="word", bg="#202b30", fg="#ffd4c9", padx=8, pady=6,
                              relief="flat", font=("Consolas", 9))

    def watch_source(self):
        if self.future is not None and self.future.done():
            try:
                self.future.result()
                self.renderer.accept_build()
                self.errors.pack_forget()
                self.status.pack_forget()
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
                    self.errors.pack_forget()
                    self.show_status("Building preview...")
                    self.future = self.executor.submit(self.renderer.build)
            except OSError as exc:
                self.report_error("Waiting for the screen source.", exc)
        self.window.after(500, self.watch_source)

    def show_status(self, message):
        self.status.configure(text=message)
        self.status.pack(anchor="w", pady=(8, 0))

    def report_error(self, status, exc):
        self.show_status(status)
        self.errors.configure(state="normal")
        self.errors.delete("1.0", "end")
        self.errors.insert("1.0", str(exc))
        self.errors.configure(state="disabled")
        self.errors.pack(fill="x", pady=(8, 0))

    def draw(self):
        if not self.renderer.binary.is_file():
            return
        try:
            pixels = self.renderer.pixels(self.navigation.screen, "sample")
            self.image = tk.PhotoImage(data=frame_ppm(pixels), format="PPM").zoom(ZOOM)
            self.panel.itemconfigure(self.frame, image=self.image)
        except PreviewError as exc:
            self.report_error("Could not draw the OLED frame.", exc)

    def update_buttons(self):
        ready = self.renderer.binary.is_file() and self.navigation.screen != "scanning"
        self.scan_button.configure(state="normal" if ready else "disabled")
        self.view_button.configure(state="normal" if ready else "disabled")

    def refresh(self):
        self.update_buttons()
        self.draw()

    def view_down(self, _event):
        if self.view_button.instate(("!disabled",)):
            self.view_was_held = False
            self.view_timer = self.window.after(600, self.hold_view)

    def view_up(self, _event):
        if self.view_timer is not None:
            self.window.after_cancel(self.view_timer)
            self.view_timer = None

    def hold_view(self):
        self.view_timer = None
        self.view_was_held = True
        self.navigation.hold_view()

    def keyboard_hold_view(self, _event):
        if self.view_button.instate(("!disabled",)):
            self.navigation.hold_view()
        return "break"

    def view(self):
        if not self.view_was_held:
            self.navigation.view()
        self.view_was_held = False

if __name__ == "__main__":
    window = tk.Tk()
    renderer = Renderer()
    preview = Preview(window, renderer)
    try:
        window.mainloop()
    finally:
        preview.executor.shutdown(wait=True, cancel_futures=True)
        renderer.close()
