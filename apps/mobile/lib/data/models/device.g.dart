// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'device.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DeviceImpl _$$DeviceImplFromJson(Map<String, dynamic> json) => _$DeviceImpl(
  id: json['id'] as String,
  name: json['name'] as String,
  platform: json['platform'] as String,
  ip: json['ip'] as String?,
  timestamp: (json['timestamp'] as num).toInt(),
  peerId: json['peerId'] as String?,
);

Map<String, dynamic> _$$DeviceImplToJson(_$DeviceImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'platform': instance.platform,
      'ip': instance.ip,
      'timestamp': instance.timestamp,
      'peerId': instance.peerId,
    };
