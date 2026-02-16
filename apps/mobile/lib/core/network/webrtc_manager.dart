import 'dart:async';
import 'dart:typed_data';
import 'package:flutter_webrtc/flutter_webrtc.dart';

/// Connection state for WebRTC peers
enum WebRTCConnectionState {
  connecting,
  connected,
  disconnected,
  error,
}

/// WebRTC Manager for P2P connections
/// Replicates the functionality of useWebRTC.ts from the web app
class WebRTCManager {
  RTCPeerConnection? _localPeer;
  final Map<String, RTCPeerConnection> _peerConnections = {};
  final Map<String, RTCDataChannel> _dataChannels = {};
  final Map<String, WebRTCConnectionState> _connectionStates = {};

  String? _localPeerId;
  bool _shouldReconnect = true;

  // Ice servers (same as web app)
  final List<Map<String, String>> _iceServers = [
    {'urls': 'stun:stun.l.google.com:19302'},
    {'urls': 'stun:stun1.l.google.com:19302'},
  ];

  // Stream controllers for reactive updates
  final _connectionStatesController =
      StreamController<Map<String, WebRTCConnectionState>>.broadcast();
  final _dataChannelsController =
      StreamController<Map<String, RTCDataChannel>>.broadcast();

  // Getters
  String? get localPeerId => _localPeerId;
  Map<String, WebRTCConnectionState> get connectionStates => {..._connectionStates};
  Map<String, RTCDataChannel> get dataChannels => {..._dataChannels};

  Stream<Map<String, WebRTCConnectionState>> get connectionStatesStream =>
      _connectionStatesController.stream;
  Stream<Map<String, RTCDataChannel>> get dataChannelsStream =>
      _dataChannelsController.stream;

  /// Initialize peer connection
  Future<String> initPeer(String deviceId) async {
    _shouldReconnect = true;
    _localPeerId = deviceId;

    print('[WebRTC] Initializing peer with ID: $deviceId');

    try {
      // Create peer connection configuration
      final configuration = {
        'iceServers': _iceServers,
        'sdpSemantics': 'unified-plan',
      };

      _localPeer = await createPeerConnection(configuration);

      print('[WebRTC] Peer initialized successfully with ID: $_localPeerId');
      return deviceId;
    } catch (error) {
      print('[WebRTC] Failed to initialize peer: $error');
      rethrow;
    }
  }

  /// Connect to a peer
  Future<RTCDataChannel> connectToPeer(String peerId) async {
    if (_localPeer == null) {
      throw Exception('Peer not initialized');
    }

    print('[WebRTC] Attempting to connect to peer: $peerId');
    _setConnectionState(peerId, WebRTCConnectionState.connecting);

    try {
      // Create peer connection for this peer
      final configuration = {
        'iceServers': _iceServers,
        'sdpSemantics': 'unified-plan',
      };

      final peerConnection = await createPeerConnection(configuration);
      _peerConnections[peerId] = peerConnection;

      // Create data channel
      final dataChannelInit = RTCDataChannelInit();
      dataChannelInit.ordered = true;

      final dataChannel = await peerConnection.createDataChannel(
        'fileTransfer',
        dataChannelInit,
      );

      _dataChannels[peerId] = dataChannel;

      // Set up data channel event handlers
      _setupDataChannelHandlers(peerId, dataChannel);

      // Set up peer connection event handlers
      _setupPeerConnectionHandlers(peerId, peerConnection);

      // Create and send offer
      final offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      print('[WebRTC] Created offer for peer: $peerId');

      // In a real implementation, you would send this offer through signaling server
      // For now, we'll mark it as connecting

      return dataChannel;
    } catch (error) {
      print('[WebRTC] Error connecting to peer: $error');
      _setConnectionState(peerId, WebRTCConnectionState.error);
      rethrow;
    }
  }

  /// Handle incoming connection (when another peer initiates)
  Future<void> handleIncomingConnection(
    String peerId,
    RTCSessionDescription offer,
  ) async {
    print('[WebRTC] Handling incoming connection from: $peerId');
    _setConnectionState(peerId, WebRTCConnectionState.connecting);

    try {
      final configuration = {
        'iceServers': _iceServers,
        'sdpSemantics': 'unified-plan',
      };

      final peerConnection = await createPeerConnection(configuration);
      _peerConnections[peerId] = peerConnection;

      // Set up event handlers
      _setupPeerConnectionHandlers(peerId, peerConnection);

      // Set remote description (offer)
      await peerConnection.setRemoteDescription(offer);

      // Create and set answer
      final answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      print('[WebRTC] Created answer for peer: $peerId');
    } catch (error) {
      print('[WebRTC] Error handling incoming connection: $error');
      _setConnectionState(peerId, WebRTCConnectionState.error);
      rethrow;
    }
  }

  /// Set up peer connection event handlers
  void _setupPeerConnectionHandlers(
    String peerId,
    RTCPeerConnection connection,
  ) {
    connection.onIceCandidate = (candidate) {
      print('[WebRTC] ICE candidate for $peerId: ${candidate.candidate}');
      // In real implementation, send this to signaling server
    };

    connection.onIceConnectionState = (state) {
      print('[WebRTC] ICE connection state for $peerId: $state');

      if (state == RTCIceConnectionState.RTCIceConnectionStateConnected) {
        _setConnectionState(peerId, WebRTCConnectionState.connected);
      } else if (state == RTCIceConnectionState.RTCIceConnectionStateFailed) {
        _setConnectionState(peerId, WebRTCConnectionState.error);
      } else if (state ==
          RTCIceConnectionState.RTCIceConnectionStateDisconnected) {
        _setConnectionState(peerId, WebRTCConnectionState.disconnected);
      }
    };

    connection.onDataChannel = (channel) {
      print('[WebRTC] Data channel received from $peerId');
      _dataChannels[peerId] = channel;
      _setupDataChannelHandlers(peerId, channel);
      _dataChannelsController.add({..._dataChannels});
    };
  }

  /// Set up data channel event handlers
  void _setupDataChannelHandlers(String peerId, RTCDataChannel channel) {
    channel.onDataChannelState = (state) {
      print('[WebRTC] Data channel state for $peerId: $state');

      if (state == RTCDataChannelState.RTCDataChannelOpen) {
        _setConnectionState(peerId, WebRTCConnectionState.connected);
        print('[WebRTC] Data channel OPENED with peer: $peerId');
      } else if (state == RTCDataChannelState.RTCDataChannelClosed) {
        _setConnectionState(peerId, WebRTCConnectionState.disconnected);
        print('[WebRTC] Data channel closed with peer: $peerId');
      }
    };

    channel.onMessage = (message) {
      print('[WebRTC] Data received from $peerId');
      // This will be handled by FileTransferService
    };
  }

  /// Send data to a specific peer
  Future<bool> sendData(String peerId, dynamic data) async {
    final dataChannel = _dataChannels[peerId];

    if (dataChannel == null) {
      print('[WebRTC] No data channel for peer: $peerId');
      return false;
    }

    if (dataChannel.state != RTCDataChannelState.RTCDataChannelOpen) {
      print('[WebRTC] Data channel not open for peer: $peerId');
      return false;
    }

    try {
      if (data is String) {
        await dataChannel.send(RTCDataChannelMessage(data));
      } else if (data is List<int>) {
        await dataChannel.send(RTCDataChannelMessage.fromBinary(Uint8List.fromList(data)));
      } else if (data is Uint8List) {
        await dataChannel.send(RTCDataChannelMessage.fromBinary(data));
      } else {
        print('[WebRTC] Unsupported data type');
        return false;
      }
      return true;
    } catch (error) {
      print('[WebRTC] Error sending data: $error');
      return false;
    }
  }

  /// Close connection with a specific peer
  Future<void> closeConnection(String peerId) async {
    print('[WebRTC] Closing connection with: $peerId');

    final dataChannel = _dataChannels[peerId];
    if (dataChannel != null) {
      await dataChannel.close();
      _dataChannels.remove(peerId);
    }

    final peerConnection = _peerConnections[peerId];
    if (peerConnection != null) {
      await peerConnection.close();
      _peerConnections.remove(peerId);
    }

    _setConnectionState(peerId, WebRTCConnectionState.disconnected);
  }

  /// Get connection state for a specific peer
  WebRTCConnectionState? getConnectionState(String peerId) {
    return _connectionStates[peerId];
  }

  /// Set connection state and notify listeners
  void _setConnectionState(String peerId, WebRTCConnectionState state) {
    _connectionStates[peerId] = state;
    _connectionStatesController.add({..._connectionStates});
    print('[WebRTC] Connection state changed: $peerId -> $state');
  }

  /// Destroy all connections
  Future<void> destroy() async {
    print('[WebRTC] Destroying WebRTC manager - disabling reconnect');
    _shouldReconnect = false;

    // Close all data channels
    for (final channel in _dataChannels.values) {
      await channel.close();
    }
    _dataChannels.clear();

    // Close all peer connections
    for (final connection in _peerConnections.values) {
      await connection.close();
    }
    _peerConnections.clear();

    // Close local peer
    if (_localPeer != null) {
      await _localPeer!.close();
      _localPeer = null;
    }

    _connectionStates.clear();
    _localPeerId = null;

    // Close streams
    await _connectionStatesController.close();
    await _dataChannelsController.close();
  }
}
