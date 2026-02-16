// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'transfer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TransferImpl _$$TransferImplFromJson(Map<String, dynamic> json) =>
    _$TransferImpl(
      id: json['id'] as String,
      fileName: json['fileName'] as String,
      fileSize: (json['fileSize'] as num).toInt(),
      progress: (json['progress'] as num).toDouble(),
      status: $enumDecode(_$TransferStatusEnumMap, json['status']),
      speed: (json['speed'] as num?)?.toDouble(),
      fromDevice: json['fromDevice'] as String?,
      toDevice: json['toDevice'] as String?,
      startTime: (json['startTime'] as num?)?.toInt(),
      endTime: (json['endTime'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$TransferImplToJson(_$TransferImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'fileName': instance.fileName,
      'fileSize': instance.fileSize,
      'progress': instance.progress,
      'status': _$TransferStatusEnumMap[instance.status]!,
      'speed': instance.speed,
      'fromDevice': instance.fromDevice,
      'toDevice': instance.toDevice,
      'startTime': instance.startTime,
      'endTime': instance.endTime,
    };

const _$TransferStatusEnumMap = {
  TransferStatus.pending: 'pending',
  TransferStatus.sending: 'sending',
  TransferStatus.receiving: 'receiving',
  TransferStatus.completed: 'completed',
  TransferStatus.failed: 'failed',
};
