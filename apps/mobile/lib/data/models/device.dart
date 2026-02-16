import 'package:freezed_annotation/freezed_annotation.dart';

part 'device.freezed.dart';
part 'device.g.dart';

/// Device model representing a discovered peer on the network
@freezed
class Device with _$Device {
  const factory Device({
    required String id,
    required String name,
    required String platform,
    String? ip,
    required int timestamp,
    String? peerId,
  }) = _Device;

  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
}
