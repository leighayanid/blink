import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

/// Native (dart:io) platform detector with persistent device ID
class PlatformDetector {
  static String getPlatform() {
    if (Platform.isAndroid) return 'Android';
    if (Platform.isIOS) return 'iOS';
    if (Platform.isMacOS) return 'macOS';
    if (Platform.isWindows) return 'Windows';
    if (Platform.isLinux) return 'Linux';
    return 'Unknown';
  }

  static Future<String> getDeviceName() async => Platform.localHostname;

  static Future<String> getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    var id = prefs.getString('deviceId');
    if (id == null) {
      id = 'flutter-${const Uuid().v4()}';
      await prefs.setString('deviceId', id);
    }
    return id;
  }

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
