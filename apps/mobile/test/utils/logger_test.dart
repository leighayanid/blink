import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/utils/logger.dart';

void main() {
  group('Logger', () {
    test('should create logger with tag', () {
      const logger = Logger('Test');
      expect(logger, isNotNull);
    });

    test('should log info messages in debug mode', () {
      const logger = Logger('Test');
      // In debug mode, this should print without errors
      logger.info('Test info message');
    });

    test('should log error messages with stack trace', () {
      const logger = Logger('Test');
      final error = Exception('Test error');
      final stackTrace = StackTrace.current;

      // Should not throw
      logger.error('Test error', error, stackTrace);
    });

    test('AppLogger should provide pre-defined loggers', () {
      expect(AppLogger.webrtc, isNotNull);
      expect(AppLogger.signaling, isNotNull);
      expect(AppLogger.transfer, isNotNull);
      expect(AppLogger.ui, isNotNull);
      expect(AppLogger.device, isNotNull);
    });
  });
}
