#pragma once
#include <Adafruit_GFX.h>
#include <algorithm>
#include <cstdio>
#include <vector>

constexpr uint8_t SSD1306_SWITCHCAPVCC = 2;
constexpr uint16_t SSD1306_BLACK = 0, SSD1306_WHITE = 1, SSD1306_INVERSE = 2;

struct PreviewWire {
  void beginTransmission(uint8_t) {}
  uint8_t endTransmission() { return 0; }
};

extern PreviewWire Wire;

// Keep Adafruit's drawing and font routines, replacing the I2C flush with a framebuffer write.
class Adafruit_SSD1306 : public Adafruit_GFX {
 public:
  Adafruit_SSD1306(uint8_t width, uint8_t height, PreviewWire*, int8_t)
      : Adafruit_GFX(width, height), stride_((width + 7) / 8), pixels_(stride_ * height) {}
  bool begin(uint8_t, uint8_t, bool, bool) { return true; }
  void clearDisplay() { std::fill(pixels_.begin(), pixels_.end(), 0); }
  void drawPixel(int16_t x, int16_t y, uint16_t color) override {
    if (x < 0 || x >= width() || y < 0 || y >= height()) return;
    if (rotation == 1 || rotation == 3) std::swap(x, y);
    if (rotation == 1 || rotation == 2) x = WIDTH - 1 - x;
    if (rotation == 2 || rotation == 3) y = HEIGHT - 1 - y;
    auto& byte = pixels_[y * stride_ + x / 8];
    const uint8_t mask = 0x80 >> (x % 8);
    if (color == SSD1306_INVERSE) byte ^= mask;
    else if (color == SSD1306_WHITE) byte |= mask;
    else if (color == SSD1306_BLACK) byte &= ~mask;
  }
  void display() { std::fwrite(pixels_.data(), 1, pixels_.size(), stdout); }

 private:
  size_t stride_;
  std::vector<uint8_t> pixels_;
};
