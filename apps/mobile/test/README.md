# BLINK Flutter App Tests

This directory contains all tests for the BLINK Flutter mobile application.

## Test Structure

```
test/
├── utils/              # Utility tests (logger, platform detection, etc.)
├── services/           # Service tests (file transfer, etc.)
├── widgets/            # Widget tests (device card, transfer progress, etc.)
├── providers/          # Provider tests (device, transfer, theme, etc.)
└── integration/        # Integration tests (full user flows)
```

## Running Tests

### Run All Tests
```bash
flutter test
```

### Run Specific Test File
```bash
flutter test test/widgets/device_card_test.dart
```

### Run Tests with Coverage
```bash
flutter test --coverage
```

### View Coverage Report (requires lcov)
```bash
# Generate coverage
flutter test --coverage

# Generate HTML report
genhtml coverage/lcov.info -o coverage/html

# Open in browser
open coverage/html/index.html
```

## Test Categories

### Unit Tests
Located in:
- `test/utils/` - Testing utility functions
- `test/services/` - Testing business logic and services
- `test/providers/` - Testing state management

**Example:**
```dart
test('should log info messages', () {
  const logger = Logger('Test');
  logger.info('Test message');
  // Verify behavior
});
```

### Widget Tests
Located in: `test/widgets/`

Tests individual widgets in isolation.

**Example:**
```dart
testWidgets('should display device name', (WidgetTester tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: DeviceCard(device: testDevice),
    ),
  );

  expect(find.text('Test Device'), findsOneWidget);
});
```

### Integration Tests
Located in: `test/integration/`

Tests complete user flows and interactions.

**Example:**
```dart
testWidgets('complete file transfer flow', (WidgetTester tester) async {
  // 1. Launch app
  // 2. Discover device
  // 3. Connect to device
  // 4. Select file
  // 5. Transfer file
  // 6. Verify completion
});
```

## Writing Tests

### Best Practices

1. **One concept per test**: Each test should verify one specific behavior
2. **Descriptive names**: Test names should clearly state what is being tested
3. **AAA pattern**: Arrange, Act, Assert
   ```dart
   test('should do something', () {
     // Arrange - Set up test data
     final service = MyService();

     // Act - Execute the behavior
     final result = service.doSomething();

     // Assert - Verify the outcome
     expect(result, equals(expectedValue));
   });
   ```
4. **Clean up**: Use `setUp()` and `tearDown()` for initialization and cleanup
5. **Mock dependencies**: Use mocks for external dependencies

### Test Coverage Goals

- **Unit tests**: 80%+ coverage for services and providers
- **Widget tests**: 70%+ coverage for custom widgets
- **Integration tests**: Key user flows covered

## Current Test Status

### ✅ Implemented
- Logger utility tests
- DeviceCard widget tests
- FileTransferService basic tests

### 📝 To Be Implemented
- WebRTCManager tests
- SignalingClient tests
- Provider tests (device_provider, transfer_provider, etc.)
- Integration tests for complete flows
- Platform detection tests
- Theme provider tests

## Mocking

For testing components with dependencies, use the `mockito` package:

```yaml
dev_dependencies:
  mockito: ^5.4.0
  build_runner: ^2.4.0
```

Generate mocks:
```bash
flutter pub run build_runner build
```

## Continuous Integration

Tests should run automatically in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter test --coverage
```

## Debugging Tests

### Run in Debug Mode
```bash
flutter test --debug
```

### Print Debug Info
```dart
test('my test', () {
  debugPrint('Debug information');
  // test code
});
```

### Skip Tests Temporarily
```dart
test('my test', () {
  // test code
}, skip: true);
```

## Resources

- [Flutter Testing Documentation](https://docs.flutter.dev/testing)
- [Widget Testing](https://docs.flutter.dev/cookbook/testing/widget/introduction)
- [Integration Testing](https://docs.flutter.dev/cookbook/testing/integration/introduction)
- [Mockito Package](https://pub.dev/packages/mockito)
