import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../data/models/device.dart';

/// Signaling Client for device discovery using raw WebSocket
/// Protocol matches ws.ts on the Nuxt server
class SignalingClient {
  WebSocketChannel? _channel;
  StreamSubscription? _channelSub;
  Device? _localDevice;
  bool _isConnected = false;
  String? _wsId;

  // Default server URL — ws path matches Nitro defineWebSocketHandler route
  String serverUrl;

  // Stream controllers for reactive updates
  final _devicesController = StreamController<List<Device>>.broadcast();
  final _connectionStatusController = StreamController<bool>.broadcast();
  final _errorController = StreamController<String>.broadcast();
  final _signalsController =
      StreamController<Map<String, dynamic>>.broadcast();

  final List<Device> _discoveredDevices = [];
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 10;
  static const Duration _reconnectDelay = Duration(seconds: 3);

  // Getters
  bool get isConnected => _isConnected;
  Device? get localDevice => _localDevice;
  List<Device> get discoveredDevices => List.unmodifiable(_discoveredDevices);

  Stream<List<Device>> get devicesStream => _devicesController.stream;
  Stream<bool> get connectionStatusStream =>
      _connectionStatusController.stream;
  Stream<String> get errorStream => _errorController.stream;

  /// Emits {fromPeer, signal} maps for incoming WebRTC signals
  Stream<Map<String, dynamic>> get signalsStream => _signalsController.stream;

  SignalingClient({
    this.serverUrl = 'ws://localhost:3000/ws',
  });

  /// Initialize local device information
  void initDevice(Device device) {
    _localDevice = device;
    print('[Signaling] Local device initialized: ${device.name}');
  }

  /// Connect to signaling server
  Future<void> connect() async {
    if (_isConnected) {
      print('[Signaling] Already connected');
      return;
    }

    // Cancel existing subscription before reconnecting
    await _channelSub?.cancel();
    _channelSub = null;
    try {
      await _channel?.sink.close();
    } catch (_) {}
    _channel = null;

    try {
      print('[Signaling] Connecting to: $serverUrl');
      _channel = WebSocketChannel.connect(Uri.parse(serverUrl));

      _channelSub = _channel!.stream.listen(
        _handleMessage,
        onError: (error) {
          print('[Signaling] WebSocket error: $error');
          _isConnected = false;
          _connectionStatusController.add(false);
          _errorController.add('WebSocket error: $error');
          _scheduleReconnect();
        },
        onDone: () {
          print('[Signaling] WebSocket closed');
          _isConnected = false;
          _connectionStatusController.add(false);
          _errorController.add('Disconnected from server');
          _scheduleReconnect();
        },
      );
    } catch (error) {
      print('[Signaling] Connection error: $error');
      _errorController.add('Failed to connect: $error');
      _scheduleReconnect();
    }
  }

  /// Handle incoming WebSocket message
  void _handleMessage(dynamic rawMessage) {
    try {
      final data = jsonDecode(rawMessage as String) as Map<String, dynamic>;
      final type = data['type'] as String?;

      if (type == 'init') {
        _wsId = data['peerId'] as String?;
        _isConnected = true;
        _reconnectAttempts = 0;
        _reconnectTimer?.cancel();
        _connectionStatusController.add(true);
        print('[Signaling] Connected, wsId: $_wsId');
        if (_localDevice != null) {
          announceDevice(_localDevice!);
        }
      } else if (type == 'peer-joined') {
        final deviceData = data['deviceInfo'] as Map<String, dynamic>?;
        if (deviceData != null) {
          try {
            final device = Device.fromJson(deviceData);
            _handleDeviceDiscovered(device);
          } catch (e) {
            print('[Signaling] Error parsing peer-joined device: $e');
          }
        }
      } else if (type == 'peer-left') {
        final peerId = data['peerId'] as String?;
        if (peerId != null) {
          _handleDeviceLeft(peerId);
        }
      } else if (type == 'signal') {
        final fromPeer = data['fromPeer'] as String?;
        final signal = data['signal'] as Map<String, dynamic>?;
        if (fromPeer != null && signal != null) {
          _signalsController.add({'fromPeer': fromPeer, 'signal': signal});
        }
      }
    } catch (error) {
      print('[Signaling] Error handling message: $error');
    }
  }

  /// Schedule automatic reconnection
  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      print('[Signaling] Max reconnect attempts reached');
      _errorController.add(
        'Unable to connect to server after $_maxReconnectAttempts attempts',
      );
      return;
    }

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(_reconnectDelay, () {
      _reconnectAttempts++;
      print(
        '[Signaling] Reconnect attempt $_reconnectAttempts/$_maxReconnectAttempts',
      );
      connect();
    });
  }

  /// Announce this device to the network
  void announceDevice(Device device) {
    if (!_isConnected || _channel == null) {
      print('[Signaling] Cannot announce: not connected');
      _errorController.add('Cannot announce device: not connected to server');
      return;
    }

    try {
      _channel!.sink.add(jsonEncode({
        'type': 'announce',
        'deviceInfo': device.toJson(),
      }));
      print('[Signaling] Announced device: ${device.name}');
    } catch (error) {
      print('[Signaling] Error announcing device: $error');
      _errorController.add('Failed to announce device: $error');
    }
  }

  /// Set local peer ID (from WebRTC init)
  void setLocalPeerId(String peerId) {
    if (_localDevice != null) {
      _localDevice = _localDevice!.copyWith(peerId: peerId);
      print('[Signaling] Local peer ID set: $peerId');
      if (_isConnected) {
        announceDevice(_localDevice!);
      }
    }
  }

  /// Send WebRTC signal to a specific peer
  void sendSignal({
    required String targetPeer,
    required Map<String, dynamic> signal,
  }) {
    if (!_isConnected || _channel == null) {
      print('[Signaling] Cannot send signal: not connected');
      _errorController.add('Cannot send signal: not connected to server');
      return;
    }

    try {
      _channel!.sink.add(jsonEncode({
        'type': 'signal',
        'targetPeer': targetPeer,
        'signal': signal,
      }));
      print('[Signaling] Signal sent to: $targetPeer');
    } catch (error) {
      print('[Signaling] Error sending signal: $error');
      _errorController.add('Failed to send signal: $error');
    }
  }

  /// Handle discovered device
  void _handleDeviceDiscovered(Device device) {
    // Don't add self
    if (device.id == _localDevice?.id) return;

    final existingIndex = _discoveredDevices.indexWhere(
      (d) => d.id == device.id,
    );

    if (existingIndex != -1) {
      _discoveredDevices[existingIndex] = device;
      print('[Signaling] Device updated: ${device.name}');
    } else {
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

  /// Disconnect from signaling server
  Future<void> disconnect() async {
    print('[Signaling] Disconnecting from server');

    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _reconnectAttempts = 0;

    await _channelSub?.cancel();
    _channelSub = null;

    try {
      await _channel?.sink.close();
    } catch (_) {}
    _channel = null;

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
    await _errorController.close();
    await _signalsController.close();
  }
}
