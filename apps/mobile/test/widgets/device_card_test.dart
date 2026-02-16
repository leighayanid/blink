import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/presentation/widgets/device_card.dart';
import 'package:mobile/data/models/device.dart';
import 'package:mobile/core/network/webrtc_manager.dart';

void main() {
  group('DeviceCard', () {
    final testDevice = Device(
      id: 'test-device-id',
      name: 'Test Device',
      platform: 'Android',
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );

    testWidgets('should display device name', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DeviceCard(
              device: testDevice,
            ),
          ),
        ),
      );

      expect(find.text('Test Device'), findsOneWidget);
    });

    testWidgets('should show AVAILABLE status when not connected',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DeviceCard(
              device: testDevice,
              isConnected: false,
            ),
          ),
        ),
      );

      expect(find.text('AVAILABLE'), findsOneWidget);
    });

    testWidgets('should show CONNECTED status when connected',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DeviceCard(
              device: testDevice,
              isConnected: true,
            ),
          ),
        ),
      );

      expect(find.text('CONNECTED'), findsOneWidget);
    });

    testWidgets('should show ESTABLISHING status when connecting',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DeviceCard(
              device: testDevice,
              connectionState: WebRTCConnectionState.connecting,
            ),
          ),
        ),
      );

      expect(find.text('ESTABLISHING...'), findsOneWidget);
    });

    testWidgets('should call onTap when tapped', (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DeviceCard(
              device: testDevice,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(DeviceCard));
      expect(tapped, isTrue);
    });

    testWidgets('should show connect button when onConnect is provided',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DeviceCard(
              device: testDevice,
              onConnect: () {},
            ),
          ),
        ),
      );

      expect(find.text('CONNECT'), findsOneWidget);
    });
  });
}
