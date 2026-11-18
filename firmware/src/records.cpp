#include "records.h"
#include "config.h"
#include "npk.h"
#include <esp_system.h>

String createRecordId() {
  uint8_t bytes[16];
  esp_fill_random(bytes, sizeof(bytes));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  char value[37];
  snprintf(value, sizeof(value), "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
      bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
      bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15]);
  return value;
}

static String csvCell(const String& value) {
  String escaped = value;
  escaped.replace("\"", "\"\"");
  return "\"" + escaped + "\"";
}

static String numeric(float value, unsigned decimals = 3) {
  return isfinite(value) ? String(value, decimals) : String();
}

static String raw(int32_t value) { return value >= 0 ? String(value) : String(); }

String recordCsv(const ScanRecord& record) {
  const auto& r = record.reading;
  String csv = "device_id,record_id,sample_id,location,acquired_at_utc,time_quality,ph,ph_before_offset,ph_offset,"
               "moisture_ref_pct,temperature_c,n_raw,p_raw,k_raw,ph_state,moisture_state,temperature_state,npk_state\r\n";
  csv += csvCell(Config::deviceId) + "," + record.id + "," + csvCell(record.sample) + "," + csvCell(record.location);
  csv += "," + record.acquiredAt + (record.acquiredAt.isEmpty() ? ",unknown," : ",rtc,");
  csv += numeric(r.ph, 6) + "," + numeric(r.phBeforeOffset, 6) + "," + numeric(r.phAppliedOffset, 6);
  csv += "," + numeric(r.moisture) + "," + numeric(r.temperature);
  csv += "," + raw(r.nitrogenRaw) + "," + raw(r.phosphorusRaw) + "," + raw(r.potassiumRaw);
  csv += String(",") + phState() + "," + moistureState() + "," + temperatureState() + "," + npkState() + "\r\n";
  return csv;
}

static String forSms(float value, const char* unit) {
  return isfinite(value) ? String(value, 2) + unit : String("NA");
}

String smsSummary(const ScanRecord& record) {
  const auto& r = record.reading;
  const String time = record.acquiredAt.isEmpty() ? "time unknown" : record.acquiredAt;
  return "Soil " + record.id.substring(0, 8) + " " + time + ": pH " + forSms(r.ph, "") +
      ", moisture index " + forSms(r.moisture, "%") + ", temp " + forSms(r.temperature, " C") + ".";
}

bool validLabel(const String& label) {
  if (label.isEmpty() || label.length() > 120 || !isalnum(static_cast<unsigned char>(label[0]))) return false;
  for (size_t i = 0; i < label.length(); ++i) {
    if (label[i] < 32 || label[i] > 126 || label[i] == '|') return false;
  }
  return true;
}
