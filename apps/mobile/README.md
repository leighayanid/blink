# BLINK Flutter Mobile App

Cross-platform Flutter application for secure local file sharing.

## 🚀 Features

- **Cross-Platform**: Runs on Android, iOS, macOS, Windows, and Linux
- **P2P File Transfer**: Direct device-to-device file sharing via WebRTC
- **Device Discovery**: Automatic discovery of devices on the same network
- **Synthwave UI**: Beautiful cyberpunk-inspired design matching the web app
- **Real-time Progress**: Live file transfer progress with speed calculation
- **Responsive Design**: Adaptive layout for mobile and desktop

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
flutter test
```

## 📄 License

See the root LICENSE file for details.
