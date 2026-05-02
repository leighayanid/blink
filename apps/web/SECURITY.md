# Blink Web Security Notes

## Signaling Abuse Protection

The WebSocket signaling route includes app-level protections for public or semi-public deployments:

- Global WebSocket connection cap
- Per-IP WebSocket connection cap
- Per-socket message rate limiting
- Maximum message size
- Maximum announced-device cap
- Stale device cleanup
- Client heartbeat timeout
- Room isolation
- Optional signaling access token
- Targeted signaling relay for `signal`, `offer`, `answer`, and `ice-candidate`

## Environment Variables

Server-side controls:

```bash
SIGNALING_ACCESS_TOKEN=
SIGNALING_MAX_CONNECTIONS=200
SIGNALING_MAX_CONNECTIONS_PER_IP=20
SIGNALING_MAX_MESSAGES_PER_WINDOW=120
SIGNALING_MESSAGE_WINDOW_MS=60000
SIGNALING_MAX_MESSAGE_BYTES=16384
SIGNALING_MAX_ANNOUNCED_DEVICES=500
SIGNALING_DEVICE_TTL_MS=120000
SIGNALING_HEARTBEAT_TIMEOUT_MS=90000
SIGNALING_CLEANUP_INTERVAL_MS=30000
```

Client/public controls:

```bash
NUXT_PUBLIC_SIGNALING_ROOM=local
NUXT_PUBLIC_SIGNALING_ACCESS_TOKEN=
```

If `SIGNALING_ACCESS_TOKEN` is set, clients must provide the same value through `NUXT_PUBLIC_SIGNALING_ACCESS_TOKEN`. This is useful as a coarse deployment gate, but it is not a substitute for edge protection because public browser config can be inspected.

## Public Deployment Recommendation

For internet-facing deployments, put the app behind a layer that can absorb volumetric traffic, such as Cloudflare or a reverse proxy with connection and request limits. The in-app controls reduce signaling abuse, but they cannot stop raw bandwidth exhaustion before traffic reaches the server.
