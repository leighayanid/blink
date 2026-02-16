import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/models/transfer.dart';

void main() {
  group('Transfer Model Tests', () {
    test('Transfer should be created with required fields', () {
      final transfer = Transfer(
        id: 'transfer-1',
        fileName: 'test.pdf',
        fileSize: 1024000,
        progress: 50.0,
        status: TransferStatus.sending,
      );

      expect(transfer.id, 'transfer-1');
      expect(transfer.fileName, 'test.pdf');
      expect(transfer.fileSize, 1024000);
      expect(transfer.progress, 50.0);
      expect(transfer.status, TransferStatus.sending);
    });

    test('Transfer should calculate if active', () {
      final sendingTransfer = Transfer(
        id: 'transfer-1',
        fileName: 'test.pdf',
        fileSize: 1024000,
        progress: 50.0,
        status: TransferStatus.sending,
      );

      final completedTransfer = Transfer(
        id: 'transfer-2',
        fileName: 'test.pdf',
        fileSize: 1024000,
        progress: 100.0,
        status: TransferStatus.completed,
      );

      expect(sendingTransfer.isActive, true);
      expect(completedTransfer.isActive, false);
    });

    test('Transfer should format file size correctly', () {
      final smallFile = Transfer(
        id: 'transfer-1',
        fileName: 'test.txt',
        fileSize: 500,
        progress: 0,
        status: TransferStatus.pending,
      );

      final mediumFile = Transfer(
        id: 'transfer-2',
        fileName: 'test.pdf',
        fileSize: 1024 * 500, // 500 KB
        progress: 0,
        status: TransferStatus.pending,
      );

      final largeFile = Transfer(
        id: 'transfer-3',
        fileName: 'video.mp4',
        fileSize: 1024 * 1024 * 50, // 50 MB
        progress: 0,
        status: TransferStatus.pending,
      );

      expect(smallFile.formattedSize, '500 B');
      expect(mediumFile.formattedSize.contains('KB'), true);
      expect(largeFile.formattedSize.contains('MB'), true);
    });

    test('Transfer should calculate duration', () {
      final transfer = Transfer(
        id: 'transfer-1',
        fileName: 'test.pdf',
        fileSize: 1024000,
        progress: 100.0,
        status: TransferStatus.completed,
        startTime: 1000,
        endTime: 5000,
      );

      expect(transfer.duration, 4000);
    });
  });
}
