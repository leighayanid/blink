// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'file_metadata.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FileMetadataImpl _$$FileMetadataImplFromJson(Map<String, dynamic> json) =>
    _$FileMetadataImpl(
      name: json['name'] as String,
      size: (json['size'] as num).toInt(),
      type: json['type'] as String,
      lastModified: (json['lastModified'] as num).toInt(),
    );

Map<String, dynamic> _$$FileMetadataImplToJson(_$FileMetadataImpl instance) =>
    <String, dynamic>{
      'name': instance.name,
      'size': instance.size,
      'type': instance.type,
      'lastModified': instance.lastModified,
    };
