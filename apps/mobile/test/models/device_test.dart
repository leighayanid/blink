import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/models/device.dart';

void main() {
  group('Device Model Tests', () {
    test('Device should be created with required fields', () {
      final device = Device(
        id: 'test-id',
        name: 'Test Device',
        platform: 'Android',
        timestamp: DateTime.now().millisecondsSinceEpoch,
      );

      expect(device.id, 'test-id');
      expect(device.name, 'Test Device');
      expect(device.platform, 'Android');
    });

    test('Device should support copyWith', () {
      final device = Device(
        id: 'test-id',
        name: 'Test Device',
        platform: 'Android',
        timestamp: DateTime.now().millisecondsSinceEpoch,
      );

      final updatedDevice = device.copyWith(peerId: 'peer-123');

      expect(updatedDevice.id, device.id);
      expect(updatedDevice.peerId, 'peer-123');
    });

    test('Device should serialize to JSON', () {
      final device = Device(
        id: 'test-id',
        name: 'Test Device',
        platform: 'Android',
        timestamp: 1234567890,
        peerId: 'peer-123',
      );

      final json = device.toJson();

      expect(json['id'], 'test-id');
      expect(json['name'], 'Test Device');
      expect(json['platform'], 'Android');
      expect(json['timestamp'], 1234567890);
      expect(json['peerId'], 'peer-123');
    });

    test('Device should deserialize from JSON', () {
      final json = {
        'id': 'test-id',
        'name': 'Test Device',
        'platform': 'Android',
        'timestamp': 1234567890,
        'peerId': 'peer-123',
      };

      final device = Device.fromJson(json);

      expect(device.id, 'test-id');
      expect(device.name, 'Test Device');
      expect(device.platform, 'Android');
      expect(device.timestamp, 1234567890);
      expect(device.peerId, 'peer-123');
    });
  });
}
