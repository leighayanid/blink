// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'signaling_message.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

SignalingMessage _$SignalingMessageFromJson(Map<String, dynamic> json) {
  return _SignalingMessage.fromJson(json);
}

/// @nodoc
mixin _$SignalingMessage {
  SignalingMessageType get type => throw _privateConstructorUsedError;
  Device? get deviceInfo => throw _privateConstructorUsedError;
  String? get peerId => throw _privateConstructorUsedError;
  Map<String, dynamic>? get signal => throw _privateConstructorUsedError;
  String? get targetPeer => throw _privateConstructorUsedError;
  String? get fromPeer => throw _privateConstructorUsedError;

  /// Serializes this SignalingMessage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SignalingMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SignalingMessageCopyWith<SignalingMessage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SignalingMessageCopyWith<$Res> {
  factory $SignalingMessageCopyWith(
    SignalingMessage value,
    $Res Function(SignalingMessage) then,
  ) = _$SignalingMessageCopyWithImpl<$Res, SignalingMessage>;
  @useResult
  $Res call({
    SignalingMessageType type,
    Device? deviceInfo,
    String? peerId,
    Map<String, dynamic>? signal,
    String? targetPeer,
    String? fromPeer,
  });

  $DeviceCopyWith<$Res>? get deviceInfo;
}

/// @nodoc
class _$SignalingMessageCopyWithImpl<$Res, $Val extends SignalingMessage>
    implements $SignalingMessageCopyWith<$Res> {
  _$SignalingMessageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SignalingMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? deviceInfo = freezed,
    Object? peerId = freezed,
    Object? signal = freezed,
    Object? targetPeer = freezed,
    Object? fromPeer = freezed,
  }) {
    return _then(
      _value.copyWith(
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as SignalingMessageType,
            deviceInfo: freezed == deviceInfo
                ? _value.deviceInfo
                : deviceInfo // ignore: cast_nullable_to_non_nullable
                      as Device?,
            peerId: freezed == peerId
                ? _value.peerId
                : peerId // ignore: cast_nullable_to_non_nullable
                      as String?,
            signal: freezed == signal
                ? _value.signal
                : signal // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            targetPeer: freezed == targetPeer
                ? _value.targetPeer
                : targetPeer // ignore: cast_nullable_to_non_nullable
                      as String?,
            fromPeer: freezed == fromPeer
                ? _value.fromPeer
                : fromPeer // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }

  /// Create a copy of SignalingMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $DeviceCopyWith<$Res>? get deviceInfo {
    if (_value.deviceInfo == null) {
      return null;
    }

    return $DeviceCopyWith<$Res>(_value.deviceInfo!, (value) {
      return _then(_value.copyWith(deviceInfo: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$SignalingMessageImplCopyWith<$Res>
    implements $SignalingMessageCopyWith<$Res> {
  factory _$$SignalingMessageImplCopyWith(
    _$SignalingMessageImpl value,
    $Res Function(_$SignalingMessageImpl) then,
  ) = __$$SignalingMessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    SignalingMessageType type,
    Device? deviceInfo,
    String? peerId,
    Map<String, dynamic>? signal,
    String? targetPeer,
    String? fromPeer,
  });

  @override
  $DeviceCopyWith<$Res>? get deviceInfo;
}

/// @nodoc
class __$$SignalingMessageImplCopyWithImpl<$Res>
    extends _$SignalingMessageCopyWithImpl<$Res, _$SignalingMessageImpl>
    implements _$$SignalingMessageImplCopyWith<$Res> {
  __$$SignalingMessageImplCopyWithImpl(
    _$SignalingMessageImpl _value,
    $Res Function(_$SignalingMessageImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SignalingMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? deviceInfo = freezed,
    Object? peerId = freezed,
    Object? signal = freezed,
    Object? targetPeer = freezed,
    Object? fromPeer = freezed,
  }) {
    return _then(
      _$SignalingMessageImpl(
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as SignalingMessageType,
        deviceInfo: freezed == deviceInfo
            ? _value.deviceInfo
            : deviceInfo // ignore: cast_nullable_to_non_nullable
                  as Device?,
        peerId: freezed == peerId
            ? _value.peerId
            : peerId // ignore: cast_nullable_to_non_nullable
                  as String?,
        signal: freezed == signal
            ? _value._signal
            : signal // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        targetPeer: freezed == targetPeer
            ? _value.targetPeer
            : targetPeer // ignore: cast_nullable_to_non_nullable
                  as String?,
        fromPeer: freezed == fromPeer
            ? _value.fromPeer
            : fromPeer // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SignalingMessageImpl implements _SignalingMessage {
  const _$SignalingMessageImpl({
    required this.type,
    this.deviceInfo,
    this.peerId,
    final Map<String, dynamic>? signal,
    this.targetPeer,
    this.fromPeer,
  }) : _signal = signal;

  factory _$SignalingMessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$SignalingMessageImplFromJson(json);

  @override
  final SignalingMessageType type;
  @override
  final Device? deviceInfo;
  @override
  final String? peerId;
  final Map<String, dynamic>? _signal;
  @override
  Map<String, dynamic>? get signal {
    final value = _signal;
    if (value == null) return null;
    if (_signal is EqualUnmodifiableMapView) return _signal;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final String? targetPeer;
  @override
  final String? fromPeer;

  @override
  String toString() {
    return 'SignalingMessage(type: $type, deviceInfo: $deviceInfo, peerId: $peerId, signal: $signal, targetPeer: $targetPeer, fromPeer: $fromPeer)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SignalingMessageImpl &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.deviceInfo, deviceInfo) ||
                other.deviceInfo == deviceInfo) &&
            (identical(other.peerId, peerId) || other.peerId == peerId) &&
            const DeepCollectionEquality().equals(other._signal, _signal) &&
            (identical(other.targetPeer, targetPeer) ||
                other.targetPeer == targetPeer) &&
            (identical(other.fromPeer, fromPeer) ||
                other.fromPeer == fromPeer));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    type,
    deviceInfo,
    peerId,
    const DeepCollectionEquality().hash(_signal),
    targetPeer,
    fromPeer,
  );

  /// Create a copy of SignalingMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SignalingMessageImplCopyWith<_$SignalingMessageImpl> get copyWith =>
      __$$SignalingMessageImplCopyWithImpl<_$SignalingMessageImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SignalingMessageImplToJson(this);
  }
}

abstract class _SignalingMessage implements SignalingMessage {
  const factory _SignalingMessage({
    required final SignalingMessageType type,
    final Device? deviceInfo,
    final String? peerId,
    final Map<String, dynamic>? signal,
    final String? targetPeer,
    final String? fromPeer,
  }) = _$SignalingMessageImpl;

  factory _SignalingMessage.fromJson(Map<String, dynamic> json) =
      _$SignalingMessageImpl.fromJson;

  @override
  SignalingMessageType get type;
  @override
  Device? get deviceInfo;
  @override
  String? get peerId;
  @override
  Map<String, dynamic>? get signal;
  @override
  String? get targetPeer;
  @override
  String? get fromPeer;

  /// Create a copy of SignalingMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SignalingMessageImplCopyWith<_$SignalingMessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
