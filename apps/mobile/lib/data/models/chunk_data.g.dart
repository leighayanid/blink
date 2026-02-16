// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chunk_data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ChunkDataImpl _$$ChunkDataImplFromJson(Map<String, dynamic> json) =>
    _$ChunkDataImpl(
      type: $enumDecode(_$ChunkDataTypeEnumMap, json['type']),
      transferId: json['transferId'] as String?,
      data: const Uint8ListConverter().fromJson(json['data'] as List<int>?),
      metadata: json['metadata'] == null
          ? null
          : FileMetadata.fromJson(json['metadata'] as Map<String, dynamic>),
      chunkIndex: (json['chunkIndex'] as num?)?.toInt(),
      totalChunks: (json['totalChunks'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$ChunkDataImplToJson(_$ChunkDataImpl instance) =>
    <String, dynamic>{
      'type': _$ChunkDataTypeEnumMap[instance.type]!,
      'transferId': instance.transferId,
      'data': const Uint8ListConverter().toJson(instance.data),
      'metadata': instance.metadata,
      'chunkIndex': instance.chunkIndex,
      'totalChunks': instance.totalChunks,
    };

const _$ChunkDataTypeEnumMap = {
  ChunkDataType.fileMeta: 'file-meta',
  ChunkDataType.fileChunk: 'file-chunk',
  ChunkDataType.fileComplete: 'file-complete',
};
