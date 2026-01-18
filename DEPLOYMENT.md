# Deployment Plan

## ⚠️ Critical Compatibility Notice

Your application uses a custom WebSocket server (`server/routes/ws.ts`) for **Device Discovery** (listing active users).

**Vercel Serverless Functions do not support persistent WebSockets.**
If you deploy to Vercel as-is:
- The **File Transfer** (PeerJS) might work (uses public cloud).
- The **Device Discovery** will **FAIL**. Users will not see each other in the list.

### Recommended Solution
Deploy to a platform that supports persistent servers (Node.js runtime) to keep the WebSocket server alive.
- **Railway** (Easiest, works out of the box)
- **Fly.io**
- **Render**

---

## Option 1: Railway (Recommended)
*Supports full WebSocket functionality.*

### 1. Prerequisites
- A [GitHub](https://github.com/) repository with your code.
- A [Railway](https://railway.app/) account.

### 2. Steps
1.  **Push to GitHub:** Ensure your project is pushed to a GitHub repository.
2.  **New Project on Railway:**
    - Go to Railway Dashboard -> "New Project" -> "Deploy from GitHub repo".
    - Select your `local-share-app` repository.
3.  **Configuration:**
    - Railway automatically detects `npm` and `nuxt`.
    - It will build using `npm run build` and start using `npm run start` (or similar).
    - **Important:** Go to "Settings" -> "Generate Domain" to get a public URL (e.g., `web-production-123.up.railway.app`).
4.  **Environment Variables:**
    - Set `NUXT_PUBLIC_WS_URL` to `wss://<your-railway-domain>/ws` (or just `/ws` if on same origin).
    - Set `NUXT_PUBLIC_SIGNALING_SERVER` to `https://<your-railway-domain>`.
5.  **Deploy:** Railway handles the rest.

---

## Option 2: Vercel (Requires Refactoring)
*Discovery will NOT work without changes.*

If you **must** use Vercel, you need to replace the custom WebSocket server (`server/routes/ws.ts`) with a third-party service for discovery (e.g., Pusher, Ably, or Supabase Realtime).

### Deployment Steps (As-Is / Broken Discovery)
1.  **Install Vercel CLI:** `npm i -g vercel`
2.  **Login:** `vercel login`
3.  **Deploy:** `vercel`
    - Set preset to `Nuxt`.
    - It will deploy, but the `/ws` route will 404 or disconnect immediately.

You would need to refactor `useDeviceDiscovery.ts` to use a service like **Ably** or **Pusher** instead of your local WebSocket server. This allows the static frontend on Vercel to communicate state (active users) via an external API.

---

## Option 3: Docker (Universal)
*Supports full WebSocket functionality. Runs anywhere Docker runs.*

This project includes a `Dockerfile` optimized for production. You can deploy this container to any provider that supports Docker (DigitalOcean App Platform, AWS App Runner, Fly.io, Google Cloud Run, etc.).

### 1. Build & Run Locally
To verify the container works:

```bash
# Build the image
docker build -t blink-app .

# Run the container (mapping port 3000)
docker run -p 3000:3000 blink-app
```

Access the app at `http://localhost:3000`.

### 2. Deploy to Cloud
1.  **Push to Registry:** Push your image to a container registry (Docker Hub, GHCR, etc.).
2.  **Deploy:** Configure your cloud provider to pull and run the image.
    - **Port:** Expose port `3000`.
    - **Environment Variables:**
        - `NUXT_PUBLIC_WS_URL`: `wss://<your-domain>/ws` (or `/ws` if same origin).
        - `NUXT_PUBLIC_SIGNALING_SERVER`: `https://<your-domain>`.

