/// Platform detection utility for web
class PlatformDetector {
  /// Get platform name (always returns 'Web' for Flutter web)
  static String getPlatform() {
    return 'Web';
  }

  /// Get device name (browser-based detection)
  static Future<String> getDeviceName() async {
    return 'Web Browser';
  }

  /// Get device ID (generate from timestamp for web)
  static Future<String> getDeviceId() async {
    return 'web-${DateTime.now().millisecondsSinceEpoch}';
  }

  /// Get platform label (WIN, MAC, AND, IOS, LIN, WEB)
  static String getPlatformLabel(String platform) {
    final map = {
      'Windows': 'WIN',
      'macOS': 'MAC',
      'Linux': 'LIN',
      'Android': 'AND',
      'iOS': 'IOS',
      'Web': 'WEB',
      'Unknown': 'UNK',
    };
    return map[platform] ?? 'WEB';
  }
}
