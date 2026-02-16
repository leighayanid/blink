# Migration Guide: Single App → Turborepo Monorepo

This document explains what changed during the conversion to a Turborepo monorepo.

## 🔄 What Changed

### Directory Structure

**Before:**
```
local-share-app/
├── app/
├── server/
├── public/
├── nuxt.config.ts
├── package.json
└── node_modules/
```

**After:**
```
local-share-app/
├── apps/
│   └── web/                 # Your Nuxt app (moved here)
│       ├── app/
│       ├── server/
│       ├── public/
│       ├── nuxt.config.ts
│       └── package.json
├── packages/
│   ├── types/               # Extracted from app/types
│   └── config/              # Shared configs
├── turbo.json               # NEW: Turborepo config
├── package.json             # NEW: Workspace root
└── node_modules/            # Shared dependencies
```

### Import Paths

**Before:**
```typescript
import type { Device, Transfer } from '../types'
import type { SignalingMessage } from '../types'
```

**After:**
```typescript
import type { Device, Transfer } from '@blink/types'
import type { SignalingMessage } from '@blink/types'
```

### Commands

**Before:**
```bash
npm run dev      # Start dev server
npm run build    # Build app
```

**After (Root Level):**
```bash
npm run dev      # Start all apps
npm run build    # Build all apps and packages
```

**After (App Specific):**
```bash
cd apps/web
npm run dev      # Start web app only
npm run build    # Build web app only
```

## 🎯 Benefits You Get Now

### 1. **Faster Builds with Caching**
```bash
# First build
npm run build  # Takes ~30s

# Second build (with cache)
npm run build  # Takes ~2s ⚡
```

### 2. **Easy Code Sharing**
```typescript
// Any app can import shared types
import type { Device } from '@blink/types'

// Any app can use shared config
import config from '@blink/config/tailwind'
```

### 3. **Parallel Task Execution**
```bash
# Runs typecheck in all packages simultaneously
npm run typecheck
```

### 4. **Clear Package Boundaries**
- Shared code lives in `packages/`
- Apps live in `apps/`
- No more spaghetti imports!

## 🚀 Adding More Apps/Packages

### Add a New App (e.g., Mobile)

```bash
mkdir -p apps/mobile
cd apps/mobile

# Create package.json
cat > package.json <<EOF
{
  "name": "@blink/mobile",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@blink/types": "*"
  }
}
EOF

# Install from root
cd ../..
npm install
```

### Add a New Package (e.g., Utils)

```bash
mkdir -p packages/utils/src
cd packages/utils

# Create package.json
cat > package.json <<EOF
{
  "name": "@blink/utils",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

# Create index.ts
echo "export const formatBytes = (bytes: number) => { /* ... */ }" > src/index.ts

# Install from root
cd ../..
npm install

# Use in any app
# import { formatBytes } from '@blink/utils'
```

## 📝 Important Notes

### Workspace Dependencies

When adding internal dependencies, use `*`:

```json
{
  "dependencies": {
    "@blink/types": "*",
    "@blink/utils": "*"
  }
}
```

### Always Install from Root

```bash
# ❌ Don't do this
cd apps/web
npm install some-package

# ✅ Do this instead
cd /path/to/monorepo
npm install some-package -w @blink/web
```

### Git Commits

All packages share the same git repository. You can commit changes across multiple packages in one commit:

```bash
git add .
git commit -m "feat: add user authentication across web and mobile"
```

## 🔍 Troubleshooting

### "Cannot find module '@blink/types'"

```bash
# Reinstall dependencies
npm install
```

### Build Cache Issues

```bash
# Clear Turbo cache
rm -rf .turbo
rm -rf apps/web/.turbo

# Clear Nuxt cache
rm -rf apps/web/.nuxt

# Rebuild
npm run build
```

### Type Errors

```bash
# Regenerate Nuxt types
cd apps/web
npx nuxt prepare
```

## 📚 Learn More

- [Turborepo Docs](https://turbo.build/repo/docs)
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Monorepo Best Practices](https://turbo.build/repo/docs/handbook)

## 🤝 Questions?

Open an issue or refer to the [README.md](./README.md) for more information.
