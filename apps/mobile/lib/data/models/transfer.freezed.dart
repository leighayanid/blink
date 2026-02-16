// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'transfer.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Transfer _$TransferFromJson(Map<String, dynamic> json) {
  return _Transfer.fromJson(json);
}

/// @nodoc
mixin _$Transfer {
  String get id => throw _privateConstructorUsedError;
  String get fileName => throw _privateConstructorUsedError;
  int get fileSize => throw _privateConstructorUsedError;
  double get progress => throw _privateConstructorUsedError;
  TransferStatus get status => throw _privateConstructorUsedError;
  double? get speed => throw _privateConstructorUsedError;
  String? get fromDevice => throw _privateConstructorUsedError;
  String? get toDevice => throw _privateConstructorUsedError;
  int? get startTime => throw _privateConstructorUsedError;
  int? get endTime => throw _privateConstructorUsedError;

  /// Serializes this Transfer to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Transfer
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TransferCopyWith<Transfer> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TransferCopyWith<$Res> {
  factory $TransferCopyWith(Transfer value, $Res Function(Transfer) then) =
      _$TransferCopyWithImpl<$Res, Transfer>;
  @useResult
  $Res call({
    String id,
    String fileName,
    int fileSize,
    double progress,
    TransferStatus status,
    double? speed,
    String? fromDevice,
    String? toDevice,
    int? startTime,
    int? endTime,
  });
}

/// @nodoc
class _$TransferCopyWithImpl<$Res, $Val extends Transfer>
    implements $TransferCopyWith<$Res> {
  _$TransferCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Transfer
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? fileName = null,
    Object? fileSize = null,
    Object? progress = null,
    Object? status = null,
    Object? speed = freezed,
    Object? fromDevice = freezed,
    Object? toDevice = freezed,
    Object? startTime = freezed,
    Object? endTime = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            fileName: null == fileName
                ? _value.fileName
                : fileName // ignore: cast_nullable_to_non_nullable
                      as String,
            fileSize: null == fileSize
                ? _value.fileSize
                : fileSize // ignore: cast_nullable_to_non_nullable
                      as int,
            progress: null == progress
                ? _value.progress
                : progress // ignore: cast_nullable_to_non_nullable
                      as double,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as TransferStatus,
            speed: freezed == speed
                ? _value.speed
                : speed // ignore: cast_nullable_to_non_nullable
                      as double?,
            fromDevice: freezed == fromDevice
                ? _value.fromDevice
                : fromDevice // ignore: cast_nullable_to_non_nullable
                      as String?,
            toDevice: freezed == toDevice
                ? _value.toDevice
                : toDevice // ignore: cast_nullable_to_non_nullable
                      as String?,
            startTime: freezed == startTime
                ? _value.startTime
                : startTime // ignore: cast_nullable_to_non_nullable
                      as int?,
            endTime: freezed == endTime
                ? _value.endTime
                : endTime // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$TransferImplCopyWith<$Res>
    implements $TransferCopyWith<$Res> {
  factory _$$TransferImplCopyWith(
    _$TransferImpl value,
    $Res Function(_$TransferImpl) then,
  ) = __$$TransferImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String fileName,
    int fileSize,
    double progress,
    TransferStatus status,
    double? speed,
    String? fromDevice,
    String? toDevice,
    int? startTime,
    int? endTime,
  });
}

/// @nodoc
class __$$TransferImplCopyWithImpl<$Res>
    extends _$TransferCopyWithImpl<$Res, _$TransferImpl>
    implements _$$TransferImplCopyWith<$Res> {
  __$$TransferImplCopyWithImpl(
    _$TransferImpl _value,
    $Res Function(_$TransferImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Transfer
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? fileName = null,
    Object? fileSize = null,
    Object? progress = null,
    Object? status = null,
    Object? speed = freezed,
    Object? fromDevice = freezed,
    Object? toDevice = freezed,
    Object? startTime = freezed,
    Object? endTime = freezed,
  }) {
    return _then(
      _$TransferImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        fileName: null == fileName
            ? _value.fileName
            : fileName // ignore: cast_nullable_to_non_nullable
                  as String,
        fileSize: null == fileSize
            ? _value.fileSize
            : fileSize // ignore: cast_nullable_to_non_nullable
                  as int,
        progress: null == progress
            ? _value.progress
            : progress // ignore: cast_nullable_to_non_nullable
                  as double,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as TransferStatus,
        speed: freezed == speed
            ? _value.speed
            : speed // ignore: cast_nullable_to_non_nullable
                  as double?,
        fromDevice: freezed == fromDevice
            ? _value.fromDevice
            : fromDevice // ignore: cast_nullable_to_non_nullable
                  as String?,
        toDevice: freezed == toDevice
            ? _value.toDevice
            : toDevice // ignore: cast_nullable_to_non_nullable
                  as String?,
        startTime: freezed == startTime
            ? _value.startTime
            : startTime // ignore: cast_nullable_to_non_nullable
                  as int?,
        endTime: freezed == endTime
            ? _value.endTime
            : endTime // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$TransferImpl implements _Transfer {
  const _$TransferImpl({
    required this.id,
    required this.fileName,
    required this.fileSize,
    required this.progress,
    required this.status,
    this.speed,
    this.fromDevice,
    this.toDevice,
    this.startTime,
    this.endTime,
  });

  factory _$TransferImpl.fromJson(Map<String, dynamic> json) =>
      _$$TransferImplFromJson(json);

  @override
  final String id;
  @override
  final String fileName;
  @override
  final int fileSize;
  @override
  final double progress;
  @override
  final TransferStatus status;
  @override
  final double? speed;
  @override
  final String? fromDevice;
  @override
  final String? toDevice;
  @override
  final int? startTime;
  @override
  final int? endTime;

  @override
  String toString() {
    return 'Transfer(id: $id, fileName: $fileName, fileSize: $fileSize, progress: $progress, status: $status, speed: $speed, fromDevice: $fromDevice, toDevice: $toDevice, startTime: $startTime, endTime: $endTime)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TransferImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.fileName, fileName) ||
                other.fileName == fileName) &&
            (identical(other.fileSize, fileSize) ||
                other.fileSize == fileSize) &&
            (identical(other.progress, progress) ||
                other.progress == progress) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.speed, speed) || other.speed == speed) &&
            (identical(other.fromDevice, fromDevice) ||
                other.fromDevice == fromDevice) &&
            (identical(other.toDevice, toDevice) ||
                other.toDevice == toDevice) &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            (identical(other.endTime, endTime) || other.endTime == endTime));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    fileName,
    fileSize,
    progress,
    status,
    speed,
    fromDevice,
    toDevice,
    startTime,
    endTime,
  );

  /// Create a copy of Transfer
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TransferImplCopyWith<_$TransferImpl> get copyWith =>
      __$$TransferImplCopyWithImpl<_$TransferImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TransferImplToJson(this);
  }
}

abstract class _Transfer implements Transfer {
  const factory _Transfer({
    required final String id,
    required final String fileName,
    required final int fileSize,
    required final double progress,
    required final TransferStatus status,
    final double? speed,
    final String? fromDevice,
    final String? toDevice,
    final int? startTime,
    final int? endTime,
  }) = _$TransferImpl;

  factory _Transfer.fromJson(Map<String, dynamic> json) =
      _$TransferImpl.fromJson;

  @override
  String get id;
  @override
  String get fileName;
  @override
  int get fileSize;
  @override
  double get progress;
  @override
  TransferStatus get status;
  @override
  double? get speed;
  @override
  String? get fromDevice;
  @override
  String? get toDevice;
  @override
  int? get startTime;
  @override
  int? get endTime;

  /// Create a copy of Transfer
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TransferImplCopyWith<_$TransferImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
