// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chunk_data.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ChunkData _$ChunkDataFromJson(Map<String, dynamic> json) {
  return _ChunkData.fromJson(json);
}

/// @nodoc
mixin _$ChunkData {
  ChunkDataType get type => throw _privateConstructorUsedError;
  String? get transferId => throw _privateConstructorUsedError;
  @Uint8ListConverter()
  Uint8List? get data => throw _privateConstructorUsedError;
  FileMetadata? get metadata => throw _privateConstructorUsedError;
  int? get chunkIndex => throw _privateConstructorUsedError;
  int? get totalChunks => throw _privateConstructorUsedError;

  /// Serializes this ChunkData to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChunkData
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChunkDataCopyWith<ChunkData> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChunkDataCopyWith<$Res> {
  factory $ChunkDataCopyWith(ChunkData value, $Res Function(ChunkData) then) =
      _$ChunkDataCopyWithImpl<$Res, ChunkData>;
  @useResult
  $Res call({
    ChunkDataType type,
    String? transferId,
    @Uint8ListConverter() Uint8List? data,
    FileMetadata? metadata,
    int? chunkIndex,
    int? totalChunks,
  });

  $FileMetadataCopyWith<$Res>? get metadata;
}

/// @nodoc
class _$ChunkDataCopyWithImpl<$Res, $Val extends ChunkData>
    implements $ChunkDataCopyWith<$Res> {
  _$ChunkDataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChunkData
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? transferId = freezed,
    Object? data = freezed,
    Object? metadata = freezed,
    Object? chunkIndex = freezed,
    Object? totalChunks = freezed,
  }) {
    return _then(
      _value.copyWith(
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as ChunkDataType,
            transferId: freezed == transferId
                ? _value.transferId
                : transferId // ignore: cast_nullable_to_non_nullable
                      as String?,
            data: freezed == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                      as Uint8List?,
            metadata: freezed == metadata
                ? _value.metadata
                : metadata // ignore: cast_nullable_to_non_nullable
                      as FileMetadata?,
            chunkIndex: freezed == chunkIndex
                ? _value.chunkIndex
                : chunkIndex // ignore: cast_nullable_to_non_nullable
                      as int?,
            totalChunks: freezed == totalChunks
                ? _value.totalChunks
                : totalChunks // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }

  /// Create a copy of ChunkData
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $FileMetadataCopyWith<$Res>? get metadata {
    if (_value.metadata == null) {
      return null;
    }

    return $FileMetadataCopyWith<$Res>(_value.metadata!, (value) {
      return _then(_value.copyWith(metadata: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ChunkDataImplCopyWith<$Res>
    implements $ChunkDataCopyWith<$Res> {
  factory _$$ChunkDataImplCopyWith(
    _$ChunkDataImpl value,
    $Res Function(_$ChunkDataImpl) then,
  ) = __$$ChunkDataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    ChunkDataType type,
    String? transferId,
    @Uint8ListConverter() Uint8List? data,
    FileMetadata? metadata,
    int? chunkIndex,
    int? totalChunks,
  });

  @override
  $FileMetadataCopyWith<$Res>? get metadata;
}

/// @nodoc
class __$$ChunkDataImplCopyWithImpl<$Res>
    extends _$ChunkDataCopyWithImpl<$Res, _$ChunkDataImpl>
    implements _$$ChunkDataImplCopyWith<$Res> {
  __$$ChunkDataImplCopyWithImpl(
    _$ChunkDataImpl _value,
    $Res Function(_$ChunkDataImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChunkData
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? transferId = freezed,
    Object? data = freezed,
    Object? metadata = freezed,
    Object? chunkIndex = freezed,
    Object? totalChunks = freezed,
  }) {
    return _then(
      _$ChunkDataImpl(
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as ChunkDataType,
        transferId: freezed == transferId
            ? _value.transferId
            : transferId // ignore: cast_nullable_to_non_nullable
                  as String?,
        data: freezed == data
            ? _value.data
            : data // ignore: cast_nullable_to_non_nullable
                  as Uint8List?,
        metadata: freezed == metadata
            ? _value.metadata
            : metadata // ignore: cast_nullable_to_non_nullable
                  as FileMetadata?,
        chunkIndex: freezed == chunkIndex
            ? _value.chunkIndex
            : chunkIndex // ignore: cast_nullable_to_non_nullable
                  as int?,
        totalChunks: freezed == totalChunks
            ? _value.totalChunks
            : totalChunks // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChunkDataImpl implements _ChunkData {
  const _$ChunkDataImpl({
    required this.type,
    this.transferId,
    @Uint8ListConverter() this.data,
    this.metadata,
    this.chunkIndex,
    this.totalChunks,
  });

  factory _$ChunkDataImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChunkDataImplFromJson(json);

  @override
  final ChunkDataType type;
  @override
  final String? transferId;
  @override
  @Uint8ListConverter()
  final Uint8List? data;
  @override
  final FileMetadata? metadata;
  @override
  final int? chunkIndex;
  @override
  final int? totalChunks;

  @override
  String toString() {
    return 'ChunkData(type: $type, transferId: $transferId, data: $data, metadata: $metadata, chunkIndex: $chunkIndex, totalChunks: $totalChunks)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChunkDataImpl &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.transferId, transferId) ||
                other.transferId == transferId) &&
            const DeepCollectionEquality().equals(other.data, data) &&
            (identical(other.metadata, metadata) ||
                other.metadata == metadata) &&
            (identical(other.chunkIndex, chunkIndex) ||
                other.chunkIndex == chunkIndex) &&
            (identical(other.totalChunks, totalChunks) ||
                other.totalChunks == totalChunks));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    type,
    transferId,
    const DeepCollectionEquality().hash(data),
    metadata,
    chunkIndex,
    totalChunks,
  );

  /// Create a copy of ChunkData
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChunkDataImplCopyWith<_$ChunkDataImpl> get copyWith =>
      __$$ChunkDataImplCopyWithImpl<_$ChunkDataImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChunkDataImplToJson(this);
  }
}

abstract class _ChunkData implements ChunkData {
  const factory _ChunkData({
    required final ChunkDataType type,
    final String? transferId,
    @Uint8ListConverter() final Uint8List? data,
    final FileMetadata? metadata,
    final int? chunkIndex,
    final int? totalChunks,
  }) = _$ChunkDataImpl;

  factory _ChunkData.fromJson(Map<String, dynamic> json) =
      _$ChunkDataImpl.fromJson;

  @override
  ChunkDataType get type;
  @override
  String? get transferId;
  @override
  @Uint8ListConverter()
  Uint8List? get data;
  @override
  FileMetadata? get metadata;
  @override
  int? get chunkIndex;
  @override
  int? get totalChunks;

  /// Create a copy of ChunkData
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChunkDataImplCopyWith<_$ChunkDataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
