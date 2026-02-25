import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:uuid/uuid.dart';
import '../models/transfer.dart';
import '../models/file_metadata.dart';
import 'file_saver.dart';

/// File Transfer Service with chunking
/// Replicates the functionality of useFileTransfer.ts from the web app
class FileTransferService {
  // 64KB chunks (same as web app)
  static const int chunkSize = 64 * 1024;

  final _uuid = const Uuid();

  // Stream controllers for reactive updates
  final _transfersController = StreamController<List<Transfer>>.broadcast();
  final _activeTransfers = <Transfer>[];
  final _completedTransfers = <Transfer>[];
  final _failedTransfers = <Transfer>[];

  // Active receive operations
  final Map<String, _ReceiveOperation> _receiveOperations = {};

  // FIFO queue mapping binary chunks to their pending transfer IDs (Issue 5)
  final Queue<String> _pendingBinaryQueue = Queue<String>();

  // Throttled notify timer (Issue 4)
  Timer? _notifyTimer;

  // Getters
  List<Transfer> get activeTransfers => List.unmodifiable(_activeTransfers);
  List<Transfer> get completedTransfers =>
      List.unmodifiable(_completedTransfers);
  List<Transfer> get failedTransfers => List.unmodifiable(_failedTransfers);
  List<Transfer> get allTransfers =>
      [..._activeTransfers, ..._completedTransfers, ..._failedTransfers];

  Stream<List<Transfer>> get transfersStream => _transfersController.stream;

  /// Generate unique transfer ID
  String _generateTransferId() {
    return 'transfer-${DateTime.now().millisecondsSinceEpoch}-${_uuid.v4().substring(0, 9)}';
  }

  /// Send file through WebRTC data channel
  Future<String> sendFile({
    required Uint8List fileBytes,
    required String fileName,
    required int fileSize,
    required RTCDataChannel channel,
    Function(double progress)? onProgress,
  }) async {
    final transferId = _generateTransferId();

    final transfer = Transfer(
      id: transferId,
      fileName: fileName,
      fileSize: fileSize,
      progress: 0,
      status: TransferStatus.sending,
      startTime: DateTime.now().millisecondsSinceEpoch,
    );

    _addTransfer(transfer);

    try {
      // 1. Send file metadata (JSON)
      final metadata = FileMetadata(
        name: fileName,
        size: fileSize,
        type: _getMimeType(fileName),
        lastModified: DateTime.now().millisecondsSinceEpoch,
      );

      final metaMessage = jsonEncode({
        'type': 'file-meta',
        'transferId': transferId,
        'metadata': metadata.toJson(),
      });

      await channel.send(RTCDataChannelMessage(metaMessage));
      print('[FileTransfer] Sent metadata for: $fileName');

      await Future.delayed(const Duration(milliseconds: 100));

      // 2. Send file in chunks (binary)
      final totalChunks = (fileSize / chunkSize).ceil();
      int chunkIndex = 0;

      for (int offset = 0; offset < fileSize; offset += chunkSize) {
        final end = (offset + chunkSize < fileSize) ? offset + chunkSize : fileSize;
        final chunk = fileBytes.sublist(offset, end);

        // Send chunk metadata (JSON)
        final chunkMetaMessage = jsonEncode({
          'type': 'file-chunk',
          'transferId': transferId,
          'chunkIndex': chunkIndex,
          'totalChunks': totalChunks,
        });

        await channel.send(RTCDataChannelMessage(chunkMetaMessage));
        await channel.send(RTCDataChannelMessage.fromBinary(chunk));

        chunkIndex++;

        final progress = ((offset + chunkSize) / fileSize) * 100;
        _updateTransfer(
          transferId,
          transfer.copyWith(progress: progress.clamp(0, 100)),
        );
        onProgress?.call(progress.clamp(0, 100));

        await Future.delayed(const Duration(milliseconds: 10));
      }

      // 3. Send completion message (JSON)
      final completeMessage = jsonEncode({
        'type': 'file-complete',
        'transferId': transferId,
      });

      await channel.send(RTCDataChannelMessage(completeMessage));

      _updateTransfer(
        transferId,
        transfer.copyWith(
          status: TransferStatus.completed,
          progress: 100,
          endTime: DateTime.now().millisecondsSinceEpoch,
        ),
      );

      print('[FileTransfer] File sent successfully: $fileName');
      return transferId;
    } catch (error) {
      print('[FileTransfer] Error sending file: $error');
      _updateTransfer(
        transferId,
        transfer.copyWith(status: TransferStatus.failed),
      );
      rethrow;
    }
  }

  /// Set up receive handler for incoming files
  void setupReceiveHandler(RTCDataChannel channel) {
    channel.onMessage = (message) {
      _handleIncomingData(message);
    };
    print('[FileTransfer] Receive handler setup for channel');
  }

  /// Handle incoming data (control messages or file chunks)
  Future<void> _handleIncomingData(RTCDataChannelMessage message) async {
    try {
      if (!message.isBinary) {
        if (message.text.isNotEmpty) {
          final data = jsonDecode(message.text) as Map<String, dynamic>;
          await _handleControlMessage(data);
        }
      } else {
        await _handleBinaryChunk(message.binary);
      }
    } catch (error) {
      print('[FileTransfer] Error handling incoming data: $error');
    }
  }

  /// Handle control messages (file-meta, file-chunk metadata, file-complete)
  Future<void> _handleControlMessage(Map<String, dynamic> data) async {
    final type = data['type'] as String;
    final transferId = data['transferId'] as String?;

    if (type == 'file-meta' && transferId != null) {
      final metadata = FileMetadata.fromJson(
        data['metadata'] as Map<String, dynamic>,
      );

      _receiveOperations[transferId] = _ReceiveOperation(
        transferId: transferId,
        metadata: metadata,
      );

      final transfer = Transfer(
        id: transferId,
        fileName: metadata.name,
        fileSize: metadata.size,
        progress: 0,
        status: TransferStatus.receiving,
        startTime: DateTime.now().millisecondsSinceEpoch,
      );

      _addTransfer(transfer);
      print('[FileTransfer] Receiving file: ${metadata.name}');
    } else if (type == 'file-chunk' && transferId != null) {
      final operation = _receiveOperations[transferId];
      if (operation != null) {
        operation.totalChunks = data['totalChunks'] as int;
        // Enqueue so _handleBinaryChunk knows which transfer this chunk belongs to
        _pendingBinaryQueue.addLast(transferId);
      }
    } else if (type == 'file-complete' && transferId != null) {
      final operation = _receiveOperations[transferId];
      if (operation != null) {
        await _completeFileReceive(transferId, operation);
      }
    }
  }

  /// Handle binary chunk data — dequeues the pending transfer ID (Issue 5)
  Future<void> _handleBinaryChunk(Uint8List chunk) async {
    if (_pendingBinaryQueue.isNotEmpty) {
      final transferId = _pendingBinaryQueue.removeFirst();
      final operation = _receiveOperations[transferId];
      if (operation != null) {
        operation.chunks.add(chunk);
        operation.receivedChunks++;

        if (operation.totalChunks > 0) {
          final progress =
              (operation.receivedChunks / operation.totalChunks) * 100;
          final idx = _activeTransfers.indexWhere((t) => t.id == transferId);
          if (idx != -1) {
            _updateTransfer(
              transferId,
              _activeTransfers[idx].copyWith(
                progress: progress.clamp(0, 100),
              ),
            );
          }
        }
      }
    }
  }

  /// Complete file receive and save to device
  Future<void> _completeFileReceive(
    String transferId,
    _ReceiveOperation operation,
  ) async {
    try {
      // Combine all chunks
      final totalBytes = operation.chunks.fold<int>(
        0,
        (sum, chunk) => sum + chunk.length,
      );

      final fileBytes = Uint8List(totalBytes);
      int offset = 0;

      for (final chunk in operation.chunks) {
        fileBytes.setRange(offset, offset + chunk.length, chunk);
        offset += chunk.length;
      }

      // Save file using platform-appropriate saver
      await saveFile(fileBytes, operation.metadata.name);

      final idx = _activeTransfers.indexWhere((t) => t.id == transferId);
      if (idx != -1) {
        _updateTransfer(
          transferId,
          _activeTransfers[idx].copyWith(
            status: TransferStatus.completed,
            progress: 100,
            endTime: DateTime.now().millisecondsSinceEpoch,
          ),
        );
      }

      print(
        '[FileTransfer] File received successfully: ${operation.metadata.name}',
      );
      _receiveOperations.remove(transferId);
    } catch (error) {
      print('[FileTransfer] Error completing file receive: $error');
      // Issue 9: cleanup operation and mark as failed
      _receiveOperations.remove(transferId);
      final idx = _activeTransfers.indexWhere((t) => t.id == transferId);
      if (idx != -1) {
        _updateTransfer(
          transferId,
          _activeTransfers[idx].copyWith(status: TransferStatus.failed),
        );
      }
    }
  }

  /// Add transfer to active list
  void _addTransfer(Transfer transfer) {
    _activeTransfers.add(transfer);
    _notifyListenersImmediate();
  }

  /// Update transfer in-place for active transfers; move to terminal lists otherwise (Issue 4)
  void _updateTransfer(String transferId, Transfer updated) {
    if (updated.status == TransferStatus.sending ||
        updated.status == TransferStatus.receiving) {
      final idx = _activeTransfers.indexWhere((t) => t.id == transferId);
      if (idx != -1) {
        _activeTransfers[idx] = updated;
        _notifyListenersThrottled();
        return;
      }
    }

    _activeTransfers.removeWhere((t) => t.id == transferId);
    if (updated.status == TransferStatus.completed) {
      _completedTransfers.add(updated);
      _notifyListenersImmediate();
    } else if (updated.status == TransferStatus.failed) {
      _failedTransfers.add(updated);
      _notifyListenersImmediate();
    } else {
      _activeTransfers.add(updated);
      _notifyListenersThrottled();
    }
  }

  /// Remove transfer from all lists
  void removeTransfer(String transferId) {
    _activeTransfers.removeWhere((t) => t.id == transferId);
    _completedTransfers.removeWhere((t) => t.id == transferId);
    _failedTransfers.removeWhere((t) => t.id == transferId);
    _notifyListenersImmediate();
  }

  /// Clear completed transfers
  void clearCompleted() {
    _completedTransfers.clear();
    _notifyListenersImmediate();
  }

  /// Throttled notify — coalesces rapid progress updates (Issue 4)
  void _notifyListenersThrottled() {
    if (_notifyTimer?.isActive == true) return;
    _notifyTimer = Timer(
      const Duration(milliseconds: 100),
      _notifyListenersImmediate,
    );
  }

  /// Immediate notify — used for state changes (add, complete, fail)
  void _notifyListenersImmediate() {
    _notifyTimer?.cancel();
    _transfersController.add(allTransfers);
  }

  /// Get MIME type from file extension
  String _getMimeType(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'json': 'application/json',
      'zip': 'application/zip',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
    };
    return mimeTypes[extension] ?? 'application/octet-stream';
  }

  /// Dispose service
  Future<void> dispose() async {
    _notifyTimer?.cancel();
    _receiveOperations.clear();
    await _transfersController.close();
  }
}

/// Private class for tracking receive operations
class _ReceiveOperation {
  final String transferId;
  final FileMetadata metadata;
  final List<Uint8List> chunks = [];
  int receivedChunks = 0;
  int totalChunks = 0;

  _ReceiveOperation({
    required this.transferId,
    required this.metadata,
  });
}
