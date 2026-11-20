class PreviewNavigation:
    def __init__(self, schedule, redraw):
        self.schedule = schedule
        self.redraw = redraw
        self.screen = "ready"
        self.previous = "ready"
        self.selection = 0
        self.history_index = 0
        self.network_index = 0
        self.revision = 0

    def show(self, screen):
        self.revision += 1
        self.screen = screen
        self.redraw()

    def finish(self, revision, result):
        if self.revision == revision:
            self.show(result)

    def scan(self):
        if self.screen in ("ready", "measurements", "npk"):
            self.show("scanning")
            self.schedule(450, self.finish, self.revision, "measurements")
        elif self.screen.startswith("menu-"):
            self.history_index = 0
            self.show(("history-0", "wifi", "bluetooth")[self.selection])
        elif self.screen.startswith("history-"):
            self.show(f"past-npk-{self.history_index}")
        elif self.screen.startswith("past-npk-"):
            self.show(f"history-{self.history_index}")
        elif self.screen == "wifi" or self.screen in ("wifi-0", "wifi-1"):
            self.network_index = 0
            self.show("wifi-searching")
            self.schedule(650, self.finish, self.revision, "wifi-0")

    def view(self):
        if self.screen in ("measurements", "npk"):
            self.show("npk" if self.screen == "measurements" else "measurements")
        elif self.screen.startswith("menu-"):
            self.selection = (self.selection + 1) % 3
            self.show(f"menu-{self.selection}")
        elif self.screen.startswith(("history-", "past-npk-")):
            self.history_index = 1 - self.history_index
            self.show(f"history-{self.history_index}")
        elif self.screen in ("wifi-0", "wifi-1"):
            self.network_index = 1 - self.network_index
            self.show(f"wifi-{self.network_index}")

    def hold_view(self):
        if self.screen.startswith("menu-"):
            self.show(self.previous)
        elif self.screen in ("ready", "measurements", "npk"):
            self.previous = self.screen
            self.selection = 0
            self.show("menu-0")
        elif self.screen != "scanning":
            self.show(f"menu-{self.selection}")
