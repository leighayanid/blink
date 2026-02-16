# Blink - Local Share App (Turborepo Monorepo)

Fast, secure, and peer-to-peer local file sharing directly between devices on your network.

## 🎉 Monorepo Structure

This project has been converted to a Turborepo monorepo for better code organization, faster builds, and easier scalability.

```
blink-monorepo/
├── apps/
│   ├── web/                 # Nuxt.js web application
│   │   ├── app/             # Nuxt app directory
│   │   ├── server/          # Nitro server routes
│   │   ├── public/          # Static assets
│   │   └── package.json
│   ├── mobile/              # Flutter mobile application
│   │   ├── lib/             # Flutter app code
│   │   ├── android/         # Android platform
│   │   ├── ios/             # iOS platform
│   │   ├── macos/           # macOS platform
│   │   ├── windows/         # Windows platform
│   │   ├── linux/           # Linux platform
│   │   ├── pubspec.yaml     # Flutter dependencies
│   │   └── package.json
│   └── docs/                # Documentation site
├── packages/
│   ├── types/               # Shared TypeScript types
│   │   └── src/index.ts
│   └── config/              # Shared configuration
│       ├── tailwind.config.ts
│       └── tsconfig.base.json
├── turbo.json               # Turborepo configuration
├── package.json             # Root workspace config
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0
- Flutter >= 3.38.0 (for mobile app)

### Installation

```bash
# Install all dependencies across the monorepo
npm install
```

### Development

```bash
# Run all apps in dev mode
npm run dev

# Or run specific apps
cd apps/web && npm run dev
```

### Building

```bash
# Build all apps and packages
npm run build

# Or build specific apps
cd apps/web && npm run build
```

### Type Checking

```bash
# Type check all packages
npm run typecheck
```

## 📦 Apps & Packages

### `@blink/web`
Nuxt.js web application with the file sharing UI and WebRTC functionality.

**Tech Stack:**
- Nuxt 4
- Vue 3 (Composition API)
- Pinia (State Management)
- Tailwind CSS (Synthwave theme)
- PeerJS (WebRTC)
- Socket.io (Signaling)

### `@blink/mobile`
Flutter cross-platform mobile application (Android, iOS, macOS, Windows, Linux).

**Tech Stack:**
- Flutter 3.38+
- Dart 3.10+
- Riverpod (State Management)
- flutter_webrtc (P2P connections)
- socket_io_client (Device discovery)
- Material Design 3 (Synthwave theme)

**Supported Platforms:**
- 📱 Android
- 📱 iOS
- 💻 macOS
- 💻 Windows
- 💻 Linux

### `@blink/types`
Shared TypeScript type definitions used across the monorepo.

**Exports:**
- `Device` - Device information interface
- `Transfer` - File transfer state interface
- `FileMetadata` - File metadata interface
- `ChunkData` - File chunk data interface
- `SignalingMessage` - WebSocket signaling messages

### `@blink/config`
Shared configuration files for Tailwind CSS and TypeScript.

**Exports:**
- `@blink/config/tailwind` - Base Tailwind configuration
- `@blink/config/typescript` - Base TypeScript configuration

## 🔧 Turborepo Features

### Task Caching
Turborepo intelligently caches task outputs to speed up builds:

```bash
# First build - builds everything
npm run build

# Second build - uses cache (much faster!)
npm run build

# Force rebuild without cache
npm run build -- --force
```

### Parallel Execution
Tasks run in parallel across packages when possible:

```bash
# Runs typecheck in all packages simultaneously
npm run typecheck
```

### Dependency Awareness
Turborepo understands package dependencies and runs tasks in the correct order:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // Builds dependencies first
    }
  }
}
```

## 🎨 Working with Types

Import shared types in any app or package:

```typescript
// Before (old monorepo)
import type { Device, Transfer } from '../types'

// After (new monorepo)
import type { Device, Transfer } from '@blink/types'
```

## 📝 Scripts

### Root Scripts (affects all packages)

- `npm run dev` - Start dev servers for all apps
- `npm run build` - Build all apps and packages
- `npm run typecheck` - Type check all packages
- `npm run clean` - Clean build artifacts and node_modules

### Package-Specific Scripts

**Web App:**
```bash
cd apps/web
npm run dev      # Dev server for web app
npm run build    # Build web app
npm run preview  # Preview production build
```

**Mobile App:**
```bash
cd apps/mobile
flutter run                    # Run on connected device/emulator
flutter build apk --release    # Build Android APK
flutter build ios --release    # Build iOS app
flutter build macos --release  # Build macOS app
flutter build windows --release # Build Windows app
flutter build linux --release  # Build Linux app
flutter test                   # Run tests
```

## 🔍 Troubleshooting

### Type Errors
If you see TypeScript errors related to Nuxt auto-imports:

```bash
# Regenerate Nuxt type definitions
cd apps/web
npx nuxt prepare
```

### Cache Issues
If builds behave unexpectedly:

```bash
# Clear Turborepo cache
rm -rf .turbo

# Clear Nuxt cache
rm -rf apps/web/.nuxt

# Rebuild
npm run build
```

### Dependency Issues
If packages aren't linking correctly:

```bash
# Clean and reinstall
npm run clean
npm install
```

## 🚢 Deployment

See [apps/web/DEPLOYMENT.md](apps/web/DEPLOYMENT.md) for deployment instructions.

## 📚 Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Nuxt Documentation](https://nuxt.com/docs)
- [PeerJS Documentation](https://peerjs.com/docs/)

## 🤝 Contributing

When adding new packages or apps:

1. Create the package in `packages/` or `apps/`
2. Add a `package.json` with a scoped name (`@blink/package-name`)
3. Update workspace dependencies in consuming packages
4. Run `npm install` at the root

## 📄 License

See individual package directories for license information.
