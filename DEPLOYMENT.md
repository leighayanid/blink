# Deployment Guide - Blink Turborepo Monorepo

This guide covers deploying the Blink app from a Turborepo monorepo structure.

## 📦 Monorepo Structure

```
blink-monorepo/
├── apps/
│   └── web/              # Main Nuxt app (what we're deploying)
├── packages/
│   ├── types/            # Shared types
│   └── config/           # Shared configs
├── Dockerfile            # Production Docker build
├── railway.json          # Railway configuration
└── turbo.json            # Turborepo config
```

## ⚠️ Critical Compatibility Notice

Your application uses a custom WebSocket server (`apps/web/server/routes/ws.ts`) for **Device Discovery**.

**Platforms that support WebSockets:**
- ✅ Railway (Recommended)
- ✅ Fly.io
- ✅ Render
- ✅ Any VPS/Docker platform

**Platforms that DO NOT support persistent WebSockets:**
- ❌ Vercel (serverless - WebSockets will fail)
- ❌ Netlify (serverless - WebSockets will fail)

---

## Option 1: Railway (Recommended) 🚂

Railway fully supports the Turborepo monorepo structure and WebSockets.

### Quick Deploy

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [Railway Dashboard](https://railway.app/)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect the Dockerfile

3. **Configuration (Automatic):**
   - Railway uses the `Dockerfile` at the root
   - Railway uses the `railway.json` configuration
   - Build: Uses Turborepo to build the monorepo
   - Start: Runs the Nuxt server

4. **Generate Domain:**
   - Settings → Networking → "Generate Domain"
   - You'll get a URL like: `blink.up.railway.app`

5. **Environment Variables (Optional):**

   Railway automatically handles WebSocket URLs, but you can override:

   ```bash
   # Optional - Railway handles this automatically
   WS_URL=wss://your-app.railway.app/ws
   SIGNALING_SERVER=https://your-app.railway.app
   ```

6. **Deploy!**
   - Railway will build and deploy automatically
   - Every push to `main` triggers a new deployment

### Verify Deployment

Visit your Railway URL and check:
- ✅ Landing page loads
- ✅ App page (`/app`) loads
- ✅ WebSocket connects (check browser console)
- ✅ Device discovery works

---

## Option 2: Docker (Universal) 🐳

Deploy the Docker container to any platform that supports Docker.

### Local Testing

```bash
# Build the image
docker build -t blink-app .

# Run locally
docker run -p 3000:3000 blink-app

# Visit http://localhost:3000
```

### Deploy to Cloud

**Compatible Platforms:**
- DigitalOcean App Platform
- AWS App Runner / ECS / Fargate
- Google Cloud Run
- Fly.io
- Azure Container Apps
- Any VPS with Docker

**Steps:**

1. **Build and push to registry:**
   ```bash
   # Docker Hub
   docker build -t yourusername/blink-app .
   docker push yourusername/blink-app

   # Or GitHub Container Registry
   docker build -t ghcr.io/yourusername/blink-app .
   docker push ghcr.io/yourusername/blink-app
   ```

2. **Deploy on your platform:**
   - Configure to pull your image
   - Expose port 3000
   - Set environment variables (if needed)

---

## Option 3: Fly.io

Fly.io supports Docker and WebSockets perfectly.

### Deploy

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (first time)
fly launch

# Follow prompts:
# - Choose app name
# - Select region
# - Fly will detect Dockerfile

# Deploy
fly deploy
```

Fly will:
- Use the root `Dockerfile`
- Build the Turborepo monorepo
- Deploy the Nuxt app
- Automatically handle HTTPS and WebSockets

---

## Option 4: Manual/VPS Deployment

For deploying to your own server:

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/blink-app.git
cd blink-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
# This runs: turbo run build
# Builds all packages and apps
```

### 4. Start Production Server

```bash
cd apps/web
npm run preview
# Or use PM2:
pm2 start npm --name "blink-app" -- run preview
```

### 5. Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## ⚠️ NOT Recommended: Vercel

Vercel does not support persistent WebSockets (serverless functions only).

**If you must use Vercel:**
- Device Discovery will NOT work
- You need to replace the WebSocket server with a third-party service:
  - Ably
  - Pusher
  - Supabase Realtime
  - Socket.io with external server

This requires significant refactoring of `apps/web/app/composables/useDeviceDiscovery.ts`.

---

## Environment Variables

The app works without environment variables (uses relative URLs), but you can override:

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_URL` | Auto-detected | WebSocket URL (e.g., `wss://app.com/ws`) |
| `SIGNALING_SERVER` | Auto-detected | Signaling server URL (e.g., `https://app.com`) |
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `NODE_ENV` | `production` | Node environment |

**Note:** The app automatically detects the correct WebSocket URL based on `window.location` in the browser, so you typically don't need to set these.

---

## Troubleshooting

### Build Fails

```bash
# Clear caches and rebuild
rm -rf .turbo node_modules apps/web/.nuxt apps/web/.output
npm install
npm run build
```

### WebSocket Connection Fails

1. Check browser console for connection errors
2. Verify your platform supports WebSockets
3. Ensure HTTPS/WSS on production (not HTTP/WS)
4. Check firewall/security group settings

### "Cannot find module @blink/types"

This means workspace dependencies aren't linked:

```bash
# Reinstall from root
npm install
```

---

## Production Checklist

Before deploying:

- [ ] Test build locally: `npm run build`
- [ ] Test Docker build: `docker build -t blink-app .`
- [ ] Test production mode: `cd apps/web && npm run preview`
- [ ] Verify WebSocket connects on localhost
- [ ] Check device discovery works
- [ ] Test file transfer between devices
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL/TLS (automatic on Railway/Fly.io)

---

## Railway-Specific Tips

### Custom Build Command

If you need to customize the build, add to `railway.json`:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

### Health Checks

Railway automatically monitors your app. No configuration needed.

### Logs

View logs in Railway dashboard or via CLI:

```bash
railway logs
```

### Scaling

Railway Pro supports autoscaling. Configure in Settings → Scaling.

---

## Summary

**Best Options:**

1. **Railway** - Easiest, one-click deploy, auto-detects everything
2. **Fly.io** - Great for global deployment, automatic HTTPS
3. **Docker** - Universal, works anywhere

**Avoid:**
- Vercel/Netlify (serverless doesn't support WebSockets)

Your Turborepo monorepo is fully configured for deployment! 🚀
