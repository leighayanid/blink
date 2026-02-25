/// Stub implementation — should never be reached on real platforms
class PlatformDetector {
  static String getPlatform() => 'Unknown';

  static Future<String> getDeviceName() async => 'Unknown Device';

  static Future<String> getDeviceId() async =>
      'stub-${DateTime.now().millisecondsSinceEpoch}';

  static String getPlatformLabel(String platform) {
    const map = {
      'Windows': 'WIN',
      'macOS': 'MAC',
      'Linux': 'LIN',
      'Android': 'AND',
      'iOS': 'IOS',
      'Web': 'WEB',
      'Unknown': 'UNK',
    };
    return map[platform] ?? 'UNK';
  }
}
