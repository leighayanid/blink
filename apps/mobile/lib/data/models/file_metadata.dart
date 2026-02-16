import 'package:freezed_annotation/freezed_annotation.dart';

part 'file_metadata.freezed.dart';
part 'file_metadata.g.dart';

/// File metadata for transfer protocol
@freezed
class FileMetadata with _$FileMetadata {
  const factory FileMetadata({
    required String name,
    required int size,
    required String type,
    required int lastModified,
  }) = _FileMetadata;

  factory FileMetadata.fromJson(Map<String, dynamic> json) =>
      _$FileMetadataFromJson(json);
}
