import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../../core/network/webrtc_manager.dart';

/// WebRTC manager provider
final webrtcManagerProvider = Provider<WebRTCManager>((ref) {
  final manager = WebRTCManager();
  ref.onDispose(() => manager.destroy());
  return manager;
});

/// Connection states provider
final connectionStatesProvider =
    StreamProvider<Map<String, WebRTCConnectionState>>((ref) {
  final manager = ref.watch(webrtcManagerProvider);
  return manager.connectionStatesStream;
});

/// Data channels provider
final dataChannelsProvider =
    StreamProvider<Map<String, RTCDataChannel>>((ref) {
  final manager = ref.watch(webrtcManagerProvider);
  return manager.dataChannelsStream;
});

/// Local peer ID provider
final localPeerIdProvider = Provider<String?>((ref) {
  final manager = ref.watch(webrtcManagerProvider);
  return manager.localPeerId;
});
