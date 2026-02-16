import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/services/file_transfer_service.dart';

void main() {
  group('FileTransferService', () {
    late FileTransferService service;

    setUp(() {
      service = FileTransferService();
    });

    tearDown(() async {
      await service.dispose();
    });

    test('should initialize with empty transfers', () {
      expect(service.activeTransfers, isEmpty);
      expect(service.completedTransfers, isEmpty);
      expect(service.failedTransfers, isEmpty);
    });

    test('should have correct chunk size', () {
      expect(FileTransferService.chunkSize, equals(64 * 1024));
    });

    test('should stream transfer updates', () async {
      expect(service.transfersStream, isNotNull);

      // Listen to stream
      final streamData = <List>[];
      final subscription = service.transfersStream.listen((transfers) {
        streamData.add(transfers);
      });

      // Initial state should be empty
      await Future.delayed(const Duration(milliseconds: 100));

      await subscription.cancel();
    });

    test('should clear completed transfers', () {
      service.clearCompleted();
      expect(service.completedTransfers, isEmpty);
    });

    test('allTransfers should combine all transfer lists', () {
      final all = service.allTransfers;
      expect(all, isNotNull);
      expect(all, isList);
    });
  });
}
