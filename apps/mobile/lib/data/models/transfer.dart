import 'package:freezed_annotation/freezed_annotation.dart';

part 'transfer.freezed.dart';
part 'transfer.g.dart';

/// Transfer status enum
enum TransferStatus {
  pending,
  sending,
  receiving,
  completed,
  failed,
}

/// File transfer model
@freezed
class Transfer with _$Transfer {
  const factory Transfer({
    required String id,
    required String fileName,
    required int fileSize,
    required double progress,
    required TransferStatus status,
    double? speed,
    String? fromDevice,
    String? toDevice,
    int? startTime,
    int? endTime,
  }) = _Transfer;

  factory Transfer.fromJson(Map<String, dynamic> json) =>
      _$TransferFromJson(json);
}

/// Extension for Transfer helper methods
extension TransferX on Transfer {
  /// Check if transfer is active (in progress)
  bool get isActive =>
      status == TransferStatus.sending || status == TransferStatus.receiving;

  /// Check if transfer is completed
  bool get isCompleted => status == TransferStatus.completed;

  /// Check if transfer failed
  bool get isFailed => status == TransferStatus.failed;

  /// Get transfer duration in milliseconds
  int? get duration {
    if (startTime != null && endTime != null) {
      return endTime! - startTime!;
    }
    return null;
  }

  /// Format file size to human-readable string
  String get formattedSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) {
      return '${(fileSize / 1024).toStringAsFixed(2)} KB';
    }
    if (fileSize < 1024 * 1024 * 1024) {
      return '${(fileSize / (1024 * 1024)).toStringAsFixed(2)} MB';
    }
    return '${(fileSize / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }

  /// Format speed to human-readable string
  String? get formattedSpeed {
    if (speed == null) return null;
    if (speed! < 1024) return '${speed!.toStringAsFixed(0)} B/s';
    if (speed! < 1024 * 1024) {
      return '${(speed! / 1024).toStringAsFixed(2)} KB/s';
    }
    return '${(speed! / (1024 * 1024)).toStringAsFixed(2)} MB/s';
  }
}
