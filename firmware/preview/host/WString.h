#pragma once
#include <string>

class __FlashStringHelper;
#define F(text) (reinterpret_cast<const __FlashStringHelper*>(text))

class String {
 public:
  String(const char* value = "") : text_(value) {}
  const char* c_str() const { return text_.c_str(); }
  size_t length() const { return text_.length(); }
  bool isEmpty() const { return text_.empty(); }
  String substring(size_t first, size_t last) const { return text_.substr(first, last - first).c_str(); }

 private:
  std::string text_;
};
