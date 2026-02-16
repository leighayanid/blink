/// Permission helper for web (no permissions needed)
class PermissionHelper {
  /// Request storage permission (not needed for web)
  static Future<bool> requestStoragePermission() async {
    // Web doesn't require explicit storage permissions
    return true;
  }

  /// Request notification permission (optional for web)
  static Future<bool> requestNotificationPermission() async {
    // Web notifications are optional and handled by browser
    return true;
  }

  /// Check if all required permissions are granted (always true for web)
  static Future<bool> checkAllPermissions() async {
    return true;
  }
}
