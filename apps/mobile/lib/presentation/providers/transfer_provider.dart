import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/transfer.dart';
import '../../data/services/file_transfer_service.dart';

/// File transfer service provider
final fileTransferServiceProvider = Provider<FileTransferService>((ref) {
  final service = FileTransferService();
  ref.onDispose(() => service.dispose());
  return service;
});

/// Transfers stream provider
final transfersProvider = StreamProvider<List<Transfer>>((ref) {
  final service = ref.watch(fileTransferServiceProvider);
  return service.transfersStream;
});

/// Active transfers provider
final activeTransfersProvider = Provider<List<Transfer>>((ref) {
  final service = ref.watch(fileTransferServiceProvider);
  return service.activeTransfers;
});

/// Completed transfers provider
final completedTransfersProvider = Provider<List<Transfer>>((ref) {
  final service = ref.watch(fileTransferServiceProvider);
  return service.completedTransfers;
});

/// Failed transfers provider
final failedTransfersProvider = Provider<List<Transfer>>((ref) {
  final service = ref.watch(fileTransferServiceProvider);
  return service.failedTransfers;
});
