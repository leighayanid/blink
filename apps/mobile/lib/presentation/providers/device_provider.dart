import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/device.dart';
import '../../core/network/signaling_client.dart';
import '../../core/utils/platform_detector.dart';

/// Device state
class DeviceState {
  final List<Device> discoveredDevices;
  final Device? localDevice;
  final bool isConnected;
  final Set<String> connectedPeers;
  final Device? selectedDevice;

  const DeviceState({
    this.discoveredDevices = const [],
    this.localDevice,
    this.isConnected = false,
    this.connectedPeers = const {},
    this.selectedDevice,
  });

  DeviceState copyWith({
    List<Device>? discoveredDevices,
    Device? localDevice,
    bool? isConnected,
    Set<String>? connectedPeers,
    Device? selectedDevice,
  }) {
    return DeviceState(
      discoveredDevices: discoveredDevices ?? this.discoveredDevices,
      localDevice: localDevice ?? this.localDevice,
      isConnected: isConnected ?? this.isConnected,
      connectedPeers: connectedPeers ?? this.connectedPeers,
      selectedDevice: selectedDevice ?? this.selectedDevice,
    );
  }
}

/// Device state notifier
class DeviceNotifier extends StateNotifier<DeviceState> {
  final SignalingClient _signalingClient;

  DeviceNotifier(this._signalingClient) : super(const DeviceState()) {
    // Issue 7: catch async errors from unawaited _init()
    _init().catchError((error, stackTrace) {
      print('[DeviceNotifier] Init error: $error\n$stackTrace');
    });
  }

  Future<void> _init() async {
    // Listen to device discoveries
    _signalingClient.devicesStream.listen((devices) {
      state = state.copyWith(discoveredDevices: devices);
    });

    // Listen to connection status
    _signalingClient.connectionStatusStream.listen((isConnected) {
      state = state.copyWith(isConnected: isConnected);
    });

    // Initialize local device
    final platform = PlatformDetector.getPlatform();
    final deviceName = await PlatformDetector.getDeviceName();
    final deviceId = await PlatformDetector.getDeviceId();

    final localDevice = Device(
      id: deviceId,
      name: deviceName,
      platform: platform,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );

    state = state.copyWith(localDevice: localDevice);
    _signalingClient.initDevice(localDevice);
  }

  Future<void> connect() async {
    await _signalingClient.connect();
  }

  Future<void> disconnect() async {
    await _signalingClient.disconnect();
  }

  void setLocalPeerId(String peerId) {
    _signalingClient.setLocalPeerId(peerId);
    if (state.localDevice != null) {
      state = state.copyWith(
        localDevice: state.localDevice!.copyWith(peerId: peerId),
      );
    }
  }

  void selectDevice(Device device) {
    state = state.copyWith(selectedDevice: device);
  }

  void addConnectedPeer(String peerId) {
    final updatedPeers = {...state.connectedPeers, peerId};
    state = state.copyWith(connectedPeers: updatedPeers);
  }

  void removeConnectedPeer(String peerId) {
    final updatedPeers = {...state.connectedPeers}..remove(peerId);
    state = state.copyWith(connectedPeers: updatedPeers);
  }

  void announce() {
    if (state.localDevice != null) {
      _signalingClient.announceDevice(state.localDevice!);
    }
  }
}

/// Signaling client provider — points at the Nuxt ws.ts route
final signalingClientProvider = Provider<SignalingClient>((ref) {
  final client = SignalingClient(serverUrl: 'ws://localhost:3000/ws');
  ref.onDispose(() => client.dispose());
  return client;
});

/// Device provider
final deviceProvider = StateNotifierProvider<DeviceNotifier, DeviceState>((ref) {
  final signalingClient = ref.watch(signalingClientProvider);
  return DeviceNotifier(signalingClient);
});
