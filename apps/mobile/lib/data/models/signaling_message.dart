import 'package:freezed_annotation/freezed_annotation.dart';
import 'device.dart';

part 'signaling_message.freezed.dart';
part 'signaling_message.g.dart';

/// Signaling message types
enum SignalingMessageType {
  announce,
  signal,
  @JsonValue('peer-joined')
  peerJoined,
  @JsonValue('peer-left')
  peerLeft,
  offer,
  answer,
  @JsonValue('ice-candidate')
  iceCandidate,
  init,
}

/// WebSocket signaling message for device discovery and WebRTC signaling
@freezed
class SignalingMessage with _$SignalingMessage {
  const factory SignalingMessage({
    required SignalingMessageType type,
    Device? deviceInfo,
    String? peerId,
    Map<String, dynamic>? signal,
    String? targetPeer,
    String? fromPeer,
  }) = _SignalingMessage;

  factory SignalingMessage.fromJson(Map<String, dynamic> json) =>
      _$SignalingMessageFromJson(json);
}
