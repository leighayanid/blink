import 'dart:typed_data';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'file_metadata.dart';

part 'chunk_data.freezed.dart';
part 'chunk_data.g.dart';

/// Chunk data types for file transfer protocol
enum ChunkDataType {
  @JsonValue('file-meta')
  fileMeta,
  @JsonValue('file-chunk')
  fileChunk,
  @JsonValue('file-complete')
  fileComplete,
}

/// File transfer chunk data
@freezed
class ChunkData with _$ChunkData {
  const factory ChunkData({
    required ChunkDataType type,
    String? transferId,
    @Uint8ListConverter() Uint8List? data,
    FileMetadata? metadata,
    int? chunkIndex,
    int? totalChunks,
  }) = _ChunkData;

  factory ChunkData.fromJson(Map<String, dynamic> json) =>
      _$ChunkDataFromJson(json);
}

/// Custom converter for Uint8List serialization
class Uint8ListConverter implements JsonConverter<Uint8List?, List<int>?> {
  const Uint8ListConverter();

  @override
  Uint8List? fromJson(List<int>? json) {
    if (json == null) return null;
    return Uint8List.fromList(json);
  }

  @override
  List<int>? toJson(Uint8List? object) {
    return object?.toList();
  }
}
