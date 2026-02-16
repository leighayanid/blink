import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:uuid/uuid.dart';
import 'package:universal_html/html.dart' as html;
import '../models/transfer.dart';
import '../models/file_metadata.dart';

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

    // Create transfer object
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

      // Wait a bit for metadata to be processed
      await Future.delayed(const Duration(milliseconds: 100));

      // 2. Send file in chunks (binary)
      final bytes = fileBytes;
      final totalChunks = (fileSize / chunkSize).ceil();
      int chunkIndex = 0;

      for (int offset = 0; offset < fileSize; offset += chunkSize) {
        final end = (offset + chunkSize < fileSize)
            ? offset + chunkSize
            : fileSize;
        final chunk = bytes.sublist(offset, end);

        // Send chunk metadata (JSON)
        final chunkMetaMessage = jsonEncode({
          'type': 'file-chunk',
          'transferId': transferId,
          'chunkIndex': chunkIndex,
          'totalChunks': totalChunks,
        });

        await channel.send(RTCDataChannelMessage(chunkMetaMessage));

        // Send actual chunk data (binary)
        await channel.send(RTCDataChannelMessage.fromBinary(chunk));

        chunkIndex++;

        // Update progress
        final progress = ((offset + chunkSize) / fileSize) * 100;
        _updateTransfer(
          transferId,
          transfer.copyWith(progress: progress.clamp(0, 100)),
        );

        onProgress?.call(progress.clamp(0, 100));

        // Small delay to prevent overwhelming the connection
        await Future.delayed(const Duration(milliseconds: 10));
      }

      // 3. Send completion message (JSON)
      final completeMessage = jsonEncode({
        'type': 'file-complete',
        'transferId': transferId,
      });

      await channel.send(RTCDataChannelMessage(completeMessage));

      // Update transfer status
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
      // Check if it's a text message (control message)
      if (message.text != null && message.text!.isNotEmpty) {
        final data = jsonDecode(message.text!);
        await _handleControlMessage(data);
      }
      // Binary data (file chunk)
      else if (message.binary != null) {
        await _handleBinaryChunk(message.binary!);
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

      // Create receive operation
      _receiveOperations[transferId] = _ReceiveOperation(
        transferId: transferId,
        metadata: metadata,
      );

      // Create transfer object
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
        operation.awaitingChunk = true;
      }
    } else if (type == 'file-complete' && transferId != null) {
      final operation = _receiveOperations[transferId];
      if (operation != null) {
        await _completeFileReceive(transferId, operation);
      }
    }
  }

  /// Handle binary chunk data
  Future<void> _handleBinaryChunk(Uint8List chunk) async {
    // Find the receive operation that's awaiting a chunk
    for (final entry in _receiveOperations.entries) {
      final operation = entry.value;
      if (operation.awaitingChunk) {
        operation.chunks.add(chunk);
        operation.receivedChunks++;
        operation.awaitingChunk = false;

        // Update progress
        if (operation.totalChunks > 0) {
          final progress =
              (operation.receivedChunks / operation.totalChunks) * 100;
          final transfer = _activeTransfers.firstWhere(
            (t) => t.id == operation.transferId,
            orElse: () => throw Exception('Transfer not found'),
          );

          _updateTransfer(
            operation.transferId,
            transfer.copyWith(progress: progress.clamp(0, 100)),
          );
        }
        break;
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

      // Save file
      await _saveFile(fileBytes, operation.metadata.name);

      // Update transfer status
      final transfer = _activeTransfers.firstWhere(
        (t) => t.id == transferId,
        orElse: () => throw Exception('Transfer not found'),
      );

      _updateTransfer(
        transferId,
        transfer.copyWith(
          status: TransferStatus.completed,
          progress: 100,
          endTime: DateTime.now().millisecondsSinceEpoch,
        ),
      );

      print('[FileTransfer] File received successfully: ${operation.metadata.name}');

      // Cleanup
      _receiveOperations.remove(transferId);
    } catch (error) {
      print('[FileTransfer] Error completing file receive: $error');
      final transfer = _activeTransfers.firstWhere(
        (t) => t.id == transferId,
        orElse: () => throw Exception('Transfer not found'),
      );
      _updateTransfer(
        transferId,
        transfer.copyWith(status: TransferStatus.failed),
      );
    }
  }

  /// Save file to device storage (Web: triggers download)
  Future<void> _saveFile(Uint8List bytes, String fileName) async {
    try {
      // For web: trigger browser download
      final blob = html.Blob([bytes]);
      final url = html.Url.createObjectUrlFromBlob(blob);
      final anchor = html.AnchorElement(href: url)
        ..setAttribute('download', fileName)
        ..click();
      html.Url.revokeObjectUrl(url);

      print('[FileTransfer] File download triggered: $fileName');
    } catch (error) {
      print('[FileTransfer] Error saving file: $error');
      rethrow;
    }
  }

  /// Add transfer to list
  void _addTransfer(Transfer transfer) {
    _activeTransfers.add(transfer);
    _notifyListeners();
  }

  /// Update transfer
  void _updateTransfer(String transferId, Transfer updatedTransfer) {
    // Remove from active
    _activeTransfers.removeWhere((t) => t.id == transferId);

    // Add to appropriate list based on status
    if (updatedTransfer.status == TransferStatus.completed) {
      _completedTransfers.add(updatedTransfer);
    } else if (updatedTransfer.status == TransferStatus.failed) {
      _failedTransfers.add(updatedTransfer);
    } else {
      _activeTransfers.add(updatedTransfer);
    }

    _notifyListeners();
  }

  /// Remove transfer
  void removeTransfer(String transferId) {
    _activeTransfers.removeWhere((t) => t.id == transferId);
    _completedTransfers.removeWhere((t) => t.id == transferId);
    _failedTransfers.removeWhere((t) => t.id == transferId);
    _notifyListeners();
  }

  /// Clear completed transfers
  void clearCompleted() {
    _completedTransfers.clear();
    _notifyListeners();
  }

  /// Notify listeners of changes
  void _notifyListeners() {
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
  bool awaitingChunk = false;

  _ReceiveOperation({
    required this.transferId,
    required this.metadata,
  });
}
