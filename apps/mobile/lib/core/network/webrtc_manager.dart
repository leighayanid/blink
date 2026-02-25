import 'dart:async';
import 'dart:typed_data';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../utils/logger.dart';

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

  /// Callback wired by main_screen to forward signals through signaling server
  Function(String targetPeer, Map<String, dynamic> signal)? onSendSignal;

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
  final _errorController = StreamController<String>.broadcast();

  static const _logger = AppLogger.webrtc;

  // Getters
  String? get localPeerId => _localPeerId;
  Map<String, WebRTCConnectionState> get connectionStates => {..._connectionStates};
  Map<String, RTCDataChannel> get dataChannels => {..._dataChannels};

  Stream<Map<String, WebRTCConnectionState>> get connectionStatesStream =>
      _connectionStatesController.stream;
  Stream<Map<String, RTCDataChannel>> get dataChannelsStream =>
      _dataChannelsController.stream;
  Stream<String> get errorStream => _errorController.stream;

  /// Initialize peer connection
  Future<String> initPeer(String deviceId) async {
    _shouldReconnect = true;
    _localPeerId = deviceId;

    _logger.info('Initializing peer with ID: $deviceId');

    try {
      final configuration = {
        'iceServers': _iceServers,
        'sdpSemantics': 'unified-plan',
      };

      _localPeer = await createPeerConnection(configuration);

      _logger.success('Peer initialized successfully with ID: $_localPeerId');
      return deviceId;
    } catch (error, stackTrace) {
      _logger.error('Failed to initialize peer', error, stackTrace);
      _errorController.add('Failed to initialize WebRTC: $error');
      rethrow;
    }
  }

  /// Connect to a peer (initiator side — creates offer)
  Future<RTCDataChannel> connectToPeer(String peerId) async {
    if (_localPeer == null) {
      final error = 'Peer not initialized';
      _logger.error(error);
      _errorController.add(error);
      throw Exception(error);
    }

    _logger.info('Attempting to connect to peer: $peerId');
    _setConnectionState(peerId, WebRTCConnectionState.connecting);

    try {
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
      _setupDataChannelHandlers(peerId, dataChannel);
      _setupPeerConnectionHandlers(peerId, peerConnection);

      // Create offer and set local description
      final offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      _logger.success('Created offer for peer: $peerId');

      // Forward offer through signaling server
      onSendSignal?.call(peerId, {'type': 'offer', 'sdp': offer.sdp});

      return dataChannel;
    } catch (error, stackTrace) {
      _logger.error('Error connecting to peer: $peerId', error, stackTrace);
      _setConnectionState(peerId, WebRTCConnectionState.error);
      _errorController.add('Failed to connect to peer: $error');
      rethrow;
    }
  }

  /// Handle incoming connection (responder side — processes offer, creates answer)
  Future<void> handleIncomingConnection(
    String peerId,
    RTCSessionDescription offer,
  ) async {
    _logger.info('Handling incoming connection from: $peerId');
    _setConnectionState(peerId, WebRTCConnectionState.connecting);

    try {
      final configuration = {
        'iceServers': _iceServers,
        'sdpSemantics': 'unified-plan',
      };

      final peerConnection = await createPeerConnection(configuration);
      _peerConnections[peerId] = peerConnection;

      _setupPeerConnectionHandlers(peerId, peerConnection);

      await peerConnection.setRemoteDescription(offer);

      final answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      _logger.success('Created answer for peer: $peerId');

      // Forward answer through signaling server
      onSendSignal?.call(peerId, {'type': 'answer', 'sdp': answer.sdp});
    } catch (error, stackTrace) {
      _logger.error(
        'Error handling incoming connection from: $peerId',
        error,
        stackTrace,
      );
      _setConnectionState(peerId, WebRTCConnectionState.error);
      _errorController.add('Failed to handle incoming connection: $error');
      rethrow;
    }
  }

  /// Handle a WebRTC signal received via the signaling server
  Future<void> handleSignal(
    String fromPeer,
    Map<String, dynamic> signal,
  ) async {
    final type = signal['type'] as String?;

    if (type == 'offer') {
      await handleIncomingConnection(
        fromPeer,
        RTCSessionDescription(signal['sdp'] as String, 'offer'),
      );
    } else if (type == 'answer') {
      await _peerConnections[fromPeer]?.setRemoteDescription(
        RTCSessionDescription(signal['sdp'] as String, 'answer'),
      );
    } else if (type == 'ice-candidate') {
      await _peerConnections[fromPeer]?.addCandidate(
        RTCIceCandidate(
          signal['candidate'] as String?,
          signal['sdpMid'] as String?,
          signal['sdpMLineIndex'] as int?,
        ),
      );
    }
  }

  /// Set up peer connection event handlers
  void _setupPeerConnectionHandlers(
    String peerId,
    RTCPeerConnection connection,
  ) {
    connection.onIceCandidate = (candidate) {
      _logger.debug('ICE candidate for $peerId: ${candidate.candidate}');
      if (candidate.candidate != null) {
        onSendSignal?.call(peerId, {
          'type': 'ice-candidate',
          'candidate': candidate.candidate,
          'sdpMid': candidate.sdpMid,
          'sdpMLineIndex': candidate.sdpMLineIndex,
        });
      }
    };

    connection.onIceConnectionState = (state) {
      _logger.info('ICE connection state for $peerId: $state');

      if (state == RTCIceConnectionState.RTCIceConnectionStateConnected) {
        _setConnectionState(peerId, WebRTCConnectionState.connected);
      } else if (state == RTCIceConnectionState.RTCIceConnectionStateFailed) {
        _logger.error('ICE connection failed for peer: $peerId');
        _setConnectionState(peerId, WebRTCConnectionState.error);
        _errorController.add('Connection failed with peer: $peerId');
      } else if (state ==
          RTCIceConnectionState.RTCIceConnectionStateDisconnected) {
        _logger.warning('Peer disconnected: $peerId');
        _setConnectionState(peerId, WebRTCConnectionState.disconnected);
      }
    };

    connection.onDataChannel = (channel) {
      _logger.success('Data channel received from $peerId');
      _dataChannels[peerId] = channel;
      _setupDataChannelHandlers(peerId, channel);
      _dataChannelsController.add({..._dataChannels});
    };

    connection.onConnectionState = (state) {
      _logger.info('Peer connection state for $peerId: $state');
    };

    connection.onSignalingState = (state) {
      _logger.debug('Signaling state for $peerId: $state');
    };

    connection.onIceGatheringState = (state) {
      _logger.debug('ICE gathering state for $peerId: $state');
    };
  }

  /// Set up data channel event handlers
  void _setupDataChannelHandlers(String peerId, RTCDataChannel channel) {
    channel.onDataChannelState = (state) {
      _logger.info('Data channel state for $peerId: $state');

      if (state == RTCDataChannelState.RTCDataChannelOpen) {
        _setConnectionState(peerId, WebRTCConnectionState.connected);
        _logger.success('Data channel OPENED with peer: $peerId');
        _dataChannelsController.add({..._dataChannels});
      } else if (state == RTCDataChannelState.RTCDataChannelClosed) {
        _setConnectionState(peerId, WebRTCConnectionState.disconnected);
        _logger.warning('Data channel closed with peer: $peerId');
      } else if (state == RTCDataChannelState.RTCDataChannelClosing) {
        _logger.info('Data channel closing with peer: $peerId');
      } else if (state == RTCDataChannelState.RTCDataChannelConnecting) {
        _logger.info('Data channel connecting with peer: $peerId');
      }
    };

    channel.onMessage = (message) {
      _logger.debug('Data received from $peerId');
      // Handled by FileTransferService
    };
  }

  /// Send data to a specific peer
  Future<bool> sendData(String peerId, dynamic data) async {
    final dataChannel = _dataChannels[peerId];

    if (dataChannel == null) {
      _logger.error('No data channel for peer: $peerId');
      _errorController.add('No data channel available for peer');
      return false;
    }

    if (dataChannel.state != RTCDataChannelState.RTCDataChannelOpen) {
      _logger.error('Data channel not open for peer: $peerId');
      _errorController.add('Data channel not ready for peer');
      return false;
    }

    try {
      if (data is String) {
        await dataChannel.send(RTCDataChannelMessage(data));
      } else if (data is List<int>) {
        await dataChannel.send(
          RTCDataChannelMessage.fromBinary(Uint8List.fromList(data)),
        );
      } else if (data is Uint8List) {
        await dataChannel.send(RTCDataChannelMessage.fromBinary(data));
      } else {
        _logger.error('Unsupported data type for peer: $peerId');
        _errorController.add('Unsupported data type');
        return false;
      }
      return true;
    } catch (error, stackTrace) {
      _logger.error('Error sending data to peer: $peerId', error, stackTrace);
      _errorController.add('Failed to send data: $error');
      return false;
    }
  }

  /// Close connection with a specific peer
  Future<void> closeConnection(String peerId) async {
    _logger.info('Closing connection with: $peerId');

    try {
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
      _logger.success('Connection closed with: $peerId');
    } catch (error, stackTrace) {
      _logger.error(
        'Error closing connection with: $peerId',
        error,
        stackTrace,
      );
      _errorController.add('Failed to close connection: $error');
    }
  }

  /// Get connection state for a specific peer
  WebRTCConnectionState? getConnectionState(String peerId) {
    return _connectionStates[peerId];
  }

  /// Set connection state and notify listeners
  void _setConnectionState(String peerId, WebRTCConnectionState state) {
    _connectionStates[peerId] = state;
    _connectionStatesController.add({..._connectionStates});
    _logger.info('Connection state changed: $peerId -> $state');
  }

  /// Destroy all connections
  Future<void> destroy() async {
    _logger.info('Destroying WebRTC manager - disabling reconnect');
    _shouldReconnect = false;

    try {
      for (final channel in _dataChannels.values) {
        await channel.close();
      }
      _dataChannels.clear();

      for (final connection in _peerConnections.values) {
        await connection.close();
      }
      _peerConnections.clear();

      if (_localPeer != null) {
        await _localPeer!.close();
        _localPeer = null;
      }

      _connectionStates.clear();
      _localPeerId = null;

      await _connectionStatesController.close();
      await _dataChannelsController.close();
      await _errorController.close();

      _logger.success('WebRTC manager destroyed successfully');
    } catch (error, stackTrace) {
      _logger.error('Error destroying WebRTC manager', error, stackTrace);
    }
  }
}
