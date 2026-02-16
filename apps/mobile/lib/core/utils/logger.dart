import 'package:flutter/foundation.dart';

/// Simple logging utility for the app
/// Provides colored console output and categorized logging
class Logger {
  final String _tag;

  const Logger(this._tag);

  /// Log info message
  void info(String message) {
    if (kDebugMode) {
      print('ℹ️  [$_tag] $message');
    }
  }

  /// Log success message
  void success(String message) {
    if (kDebugMode) {
      print('✅ [$_tag] $message');
    }
  }

  /// Log warning message
  void warning(String message) {
    if (kDebugMode) {
      print('⚠️  [$_tag] $message');
    }
  }

  /// Log error message
  void error(String message, [Object? error, StackTrace? stackTrace]) {
    if (kDebugMode) {
      print('❌ [$_tag] $message');
      if (error != null) {
        print('   Error: $error');
      }
      if (stackTrace != null) {
        print('   Stack trace: $stackTrace');
      }
    }
  }

  /// Log debug message (only in debug mode)
  void debug(String message) {
    if (kDebugMode) {
      print('🐛 [$_tag] $message');
    }
  }

  /// Log network activity
  void network(String message) {
    if (kDebugMode) {
      print('🌐 [$_tag] $message');
    }
  }

  /// Log file transfer activity
  void transfer(String message) {
    if (kDebugMode) {
      print('📁 [$_tag] $message');
    }
  }
}

/// Pre-defined loggers for common modules
class AppLogger {
  static const webrtc = Logger('WebRTC');
  static const signaling = Logger('Signaling');
  static const transfer = Logger('FileTransfer');
  static const ui = Logger('UI');
  static const device = Logger('Device');
}
