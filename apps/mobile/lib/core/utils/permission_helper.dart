import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/foundation.dart';

/// Permission helper for native platforms
class PermissionHelper {
  /// Request storage permission
  static Future<bool> requestStoragePermission() async {
    if (kIsWeb) return true;
    if (await Permission.storage.isGranted) return true;
    final status = await Permission.storage.request();
    return status.isGranted;
  }

  /// Request notification permission
  static Future<bool> requestNotificationPermission() async {
    if (kIsWeb) return true;
    final status = await Permission.notification.request();
    // Treat denied (but not permanently denied) as acceptable
    return status.isGranted || status.isDenied;
  }

  /// Check if all required permissions are granted
  static Future<bool> checkAllPermissions() async {
    if (kIsWeb) return true;
    return await Permission.storage.isGranted;
  }
}
