// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'signaling_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SignalingMessageImpl _$$SignalingMessageImplFromJson(
  Map<String, dynamic> json,
) => _$SignalingMessageImpl(
  type: $enumDecode(_$SignalingMessageTypeEnumMap, json['type']),
  deviceInfo: json['deviceInfo'] == null
      ? null
      : Device.fromJson(json['deviceInfo'] as Map<String, dynamic>),
  peerId: json['peerId'] as String?,
  signal: json['signal'] as Map<String, dynamic>?,
  targetPeer: json['targetPeer'] as String?,
  fromPeer: json['fromPeer'] as String?,
);

Map<String, dynamic> _$$SignalingMessageImplToJson(
  _$SignalingMessageImpl instance,
) => <String, dynamic>{
  'type': _$SignalingMessageTypeEnumMap[instance.type]!,
  'deviceInfo': instance.deviceInfo,
  'peerId': instance.peerId,
  'signal': instance.signal,
  'targetPeer': instance.targetPeer,
  'fromPeer': instance.fromPeer,
};

const _$SignalingMessageTypeEnumMap = {
  SignalingMessageType.announce: 'announce',
  SignalingMessageType.signal: 'signal',
  SignalingMessageType.peerJoined: 'peer-joined',
  SignalingMessageType.peerLeft: 'peer-left',
  SignalingMessageType.offer: 'offer',
  SignalingMessageType.answer: 'answer',
  SignalingMessageType.iceCandidate: 'ice-candidate',
  SignalingMessageType.init: 'init',
};
