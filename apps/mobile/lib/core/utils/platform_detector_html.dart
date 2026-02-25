// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'package:uuid/uuid.dart';

/// Web (dart:html) platform detector with localStorage-persisted device ID
class PlatformDetector {
  static String getPlatform() => 'Web';

  static Future<String> getDeviceName() async {
    final ua = html.window.navigator.userAgent;
    if (ua.contains('Android')) return 'Android Browser';
    if (ua.contains('iPhone') || ua.contains('iPad')) return 'iOS Browser';
    if (ua.contains('Windows')) return 'Windows Browser';
    if (ua.contains('Mac')) return 'Mac Browser';
    if (ua.contains('Linux')) return 'Linux Browser';
    return 'Web Browser';
  }

  static Future<String> getDeviceId() async {
    var id = html.window.localStorage['deviceId'];
    if (id == null) {
      id = 'web-${const Uuid().v4()}';
      html.window.localStorage['deviceId'] = id;
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
    return map[platform] ?? 'WEB';
  }
}
