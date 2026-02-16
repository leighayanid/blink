# BLINK Flutter Mobile App

Cross-platform Flutter application for secure local file sharing.

## 🚀 Features

### Core Functionality
- **Cross-Platform**: Runs on Android, iOS, macOS, Windows, and Linux
- **P2P File Transfer**: Direct device-to-device file sharing via WebRTC
- **Device Discovery**: Automatic discovery of devices on the same network
- **Chunked Transfers**: Efficient 64KB chunking for large files
- **Multi-Peer Support**: Send files to multiple devices simultaneously
- **Real-time Progress**: Live file transfer progress with speed calculation

### User Interface
- **Synthwave UI**: Beautiful cyberpunk-inspired design matching the web app
- **Responsive Design**: Adaptive layout for mobile and desktop
- **Smooth Animations**: Fade-in, slide-in, and pulse animations
- **Dark/Light Mode**: Toggle between themes
- **Pull-to-Refresh**: Refresh device discovery

### App Screens
- **Main Screen**: Device discovery, file transfer, and network management
- **Settings Screen**: Theme settings, device info, and network status
- **Transfer History**: View completed and failed transfers with statistics

### Reliability
- **Auto-Reconnection**: Automatic reconnection on network failures
- **Error Handling**: Comprehensive error handling with user feedback
- **Connection State Tracking**: Real-time WebRTC connection monitoring

## 📱 Supported Platforms

- ✅ Android (5.0+)
- ✅ iOS (12.0+)
- ✅ macOS (10.14+)
- ✅ Windows (10+)
- ✅ Linux

## 🏗️ Architecture

The app follows **Clean Architecture** principles:

```
lib/
├── core/                    # Core utilities and configuration
│   ├── constants/          # Colors, text styles, dimensions
│   ├── theme/              # App themes and neon effects
│   ├── network/            # WebRTC and signaling
│   └── utils/              # Platform detection, permissions
├── data/                   # Data layer
│   ├── models/             # Freezed data models
│   ├── repositories/       # Repository implementations
│   └── services/           # File transfer, storage services
├── domain/                 # Business logic layer
│   ├── usecases/          # Use cases
│   └── repositories/       # Repository interfaces
└── presentation/           # UI layer
    ├── providers/          # Riverpod state management
    ├── screens/            # App screens
    └── widgets/            # Reusable UI components
```

## 🎨 Design System

Exact match to the web app's synthwave/cyberpunk theme.

## 🛠️ Development

### Prerequisites

```bash
flutter --version  # Should be >= 3.38.0
dart --version     # Should be >= 3.10.0
```

### Install Dependencies

```bash
flutter pub get
```

### Run Code Generation

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Run the App (Web - Default)

```bash
# Using npm script (recommended)
npm run dev

# Or directly with Flutter (targets Chrome by default)
flutter run -d chrome --web-port=3001

# Use Edge browser
npm run dev:edge
```

### Build

```bash
# Web (default)
npm run build
# or
flutter build web --release

# Mobile/Desktop (requires platform-specific setup)
flutter build apk --release      # Android
flutter build ios --release      # iOS
flutter build macos --release    # macOS
flutter build windows --release  # Windows
flutter build linux --release    # Linux
```

## 🧪 Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test file
flutter test test/providers/device_provider_test.dart
```

## 📖 Documentation

- **IMPROVEMENTS.md**: Detailed list of all improvements made to the app
- **Inline documentation**: All public APIs are documented
- **Architecture**: Clean architecture with clear separation of concerns

## 🎨 UI/UX Highlights

### Animations
- Smooth page transitions with `AnimatedSwitcher`
- Staggered list item animations
- Pulsing empty state icons
- Animated progress bars with `TweenAnimationBuilder`

### User Feedback
- Success and error SnackBars
- Confirmation dialogs for critical actions
- Loading states with progress indicators
- Empty states with helpful messages

## 🏗️ Project Structure

```
lib/
├── core/                    # Core utilities and configuration
│   ├── constants/          # Colors, text styles, dimensions
│   ├── theme/              # App themes and neon effects
│   ├── network/            # WebRTC and signaling
│   └── utils/              # Logger, platform detection, permissions
├── data/                   # Data layer
│   ├── models/             # Freezed data models
│   └── services/           # File transfer service
└── presentation/           # UI layer
    ├── providers/          # Riverpod state management
    ├── screens/            # App screens (main, settings, history)
    └── widgets/            # Reusable UI components
```

## 🔧 Code Quality

- **Null Safety**: 100% null-safe codebase
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Centralized logger utility
- **State Management**: Riverpod for reactive state
- **Code Generation**: Freezed for immutable models

## 🚀 Recent Improvements

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for a comprehensive list of recent enhancements including:
- Complete file transfer implementation
- Robust error handling and auto-reconnection
- New Settings and History screens
- Smooth animations and transitions
- Comprehensive documentation

## 🤝 Contributing

When contributing to this package:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Run `flutter analyze` and fix any issues
5. Format code with `flutter format lib/`

## 📄 License

See the root LICENSE file for details.
