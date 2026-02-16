import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../data/models/device.dart';
import '../../data/models/signaling_message.dart';

/// Signaling Client for device discovery using Socket.io
/// Replicates the functionality of useDeviceDiscovery.ts from the web app
class SignalingClient {
  IO.Socket? _socket;
  Device? _localDevice;
  bool _isConnected = false;

  // Default server URL - should be configured from environment
  String serverUrl;

  // Stream controllers for reactive updates
  final _devicesController = StreamController<List<Device>>.broadcast();
  final _connectionStatusController = StreamController<bool>.broadcast();

  final List<Device> _discoveredDevices = [];

  // Getters
  bool get isConnected => _isConnected;
  Device? get localDevice => _localDevice;
  List<Device> get discoveredDevices => List.unmodifiable(_discoveredDevices);

  Stream<List<Device>> get devicesStream => _devicesController.stream;
  Stream<bool> get connectionStatusStream =>
      _connectionStatusController.stream;

  SignalingClient({
    this.serverUrl = 'http://localhost:3000', // Default development server
  });

  /// Initialize local device information
  void initDevice(Device device) {
    _localDevice = device;
    print('[Signaling] Local device initialized: ${device.name}');
  }

  /// Connect to signaling server
  Future<void> connect() async {
    if (_socket != null && _socket!.connected) {
      print('[Signaling] Already connected to server');
      return;
    }

    print('[Signaling] Connecting to server: $serverUrl');

    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setReconnectionDelay(1000)
          .setReconnectionAttempts(5)
          .build(),
    );

    _setupEventHandlers();
    _socket!.connect();
  }

  /// Set up Socket.io event handlers
  void _setupEventHandlers() {
    if (_socket == null) return;

    _socket!.onConnect((_) {
      print('[Signaling] Connected to server');
      _isConnected = true;
      _connectionStatusController.add(true);

      // Announce this device to the network
      if (_localDevice != null) {
        announceDevice(_localDevice!);
      }
    });

    _socket!.onDisconnect((_) {
      print('[Signaling] Disconnected from server');
      _isConnected = false;
      _connectionStatusController.add(false);
    });

    _socket!.onConnectError((error) {
      print('[Signaling] Connection error: $error');
      _isConnected = false;
      _connectionStatusController.add(false);
    });

    _socket!.onError((error) {
      print('[Signaling] Socket error: $error');
    });

    // Listen for peer-joined events (new device discovered)
    _socket!.on('peer-joined', (data) {
      try {
        print('[Signaling] Peer joined: $data');
        final message = SignalingMessage.fromJson(data as Map<String, dynamic>);

        if (message.deviceInfo != null) {
          _handleDeviceDiscovered(message.deviceInfo!);
        }
      } catch (error) {
        print('[Signaling] Error parsing peer-joined: $error');
      }
    });

    // Listen for peer-left events (device left network)
    _socket!.on('peer-left', (data) {
      try {
        print('[Signaling] Peer left: $data');
        final message = SignalingMessage.fromJson(data as Map<String, dynamic>);

        if (message.peerId != null) {
          _handleDeviceLeft(message.peerId!);
        }
      } catch (error) {
        print('[Signaling] Error parsing peer-left: $error');
      }
    });

    // Listen for announce events (device announcement)
    _socket!.on('announce', (data) {
      try {
        print('[Signaling] Device announcement: $data');
        final message = SignalingMessage.fromJson(data as Map<String, dynamic>);

        if (message.deviceInfo != null) {
          _handleDeviceDiscovered(message.deviceInfo!);
        }
      } catch (error) {
        print('[Signaling] Error parsing announce: $error');
      }
    });

    // Listen for WebRTC signaling messages
    _socket!.on('signal', (data) {
      try {
        print('[Signaling] Signal received: $data');
        final message = SignalingMessage.fromJson(data as Map<String, dynamic>);
        // This will be handled by WebRTC manager
      } catch (error) {
        print('[Signaling] Error parsing signal: $error');
      }
    });
  }

  /// Announce this device to the network
  void announceDevice(Device device) {
    if (_socket == null || !_socket!.connected) {
      print('[Signaling] Cannot announce: not connected');
      return;
    }

    print('[Signaling] Announcing device: ${device.name}');

    final message = SignalingMessage(
      type: SignalingMessageType.announce,
      deviceInfo: device,
      peerId: device.peerId,
    );

    _socket!.emit('announce', message.toJson());
  }

  /// Set local peer ID (from WebRTC)
  void setLocalPeerId(String peerId) {
    if (_localDevice != null) {
      _localDevice = _localDevice!.copyWith(peerId: peerId);
      print('[Signaling] Local peer ID set: $peerId');

      // Re-announce with peer ID
      if (_isConnected) {
        announceDevice(_localDevice!);
      }
    }
  }

  /// Handle discovered device
  void _handleDeviceDiscovered(Device device) {
    // Don't add self
    if (device.id == _localDevice?.id) {
      return;
    }

    // Check if device already exists
    final existingIndex = _discoveredDevices.indexWhere(
      (d) => d.id == device.id,
    );

    if (existingIndex != -1) {
      // Update existing device
      _discoveredDevices[existingIndex] = device;
      print('[Signaling] Device updated: ${device.name}');
    } else {
      // Add new device
      _discoveredDevices.add(device);
      print('[Signaling] New device discovered: ${device.name}');
    }

    _devicesController.add(List.from(_discoveredDevices));
  }

  /// Handle device left
  void _handleDeviceLeft(String peerId) {
    _discoveredDevices.removeWhere((device) => device.peerId == peerId);
    print('[Signaling] Device removed: $peerId');
    _devicesController.add(List.from(_discoveredDevices));
  }

  /// Send WebRTC signal to a peer
  void sendSignal({
    required String targetPeer,
    required Map<String, dynamic> signal,
  }) {
    if (_socket == null || !_socket!.connected) {
      print('[Signaling] Cannot send signal: not connected');
      return;
    }

    final message = SignalingMessage(
      type: SignalingMessageType.signal,
      targetPeer: targetPeer,
      fromPeer: _localDevice?.peerId,
      signal: signal,
    );

    _socket!.emit('signal', message.toJson());
    print('[Signaling] Signal sent to: $targetPeer');
  }

  /// Disconnect from signaling server
  Future<void> disconnect() async {
    print('[Signaling] Disconnecting from server');

    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
    }

    _isConnected = false;
    _discoveredDevices.clear();
    _connectionStatusController.add(false);
    _devicesController.add([]);
  }

  /// Clean up resources
  Future<void> dispose() async {
    await disconnect();
    await _devicesController.close();
    await _connectionStatusController.close();
  }
}
