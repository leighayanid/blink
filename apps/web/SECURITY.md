# Blink Web Security Notes

## Signaling Abuse Protection

The WebSocket signaling route includes app-level protections for public or semi-public deployments:

- Global WebSocket connection cap
- Per-IP concurrent connection cap
- Per-IP connection *rate* cap with temporary blocking
- Per-IP and per-socket message rate limiting (token bucket)
- Dedicated announce throttle
- Maximum message size, measured in UTF-8 bytes
- Maximum announced-device cap
- One announced device per socket
- peerId ownership enforcement
- Stale device cleanup
- Client heartbeat timeout
- Room isolation
- Origin checking on the handshake
- Optional signaling access token
- Targeted signaling relay for `signal`, `offer`, `answer`, and `ice-candidate`

### Why limits are keyed to the IP, not the socket

Counters attached only to a connection are reset by opening a new one, which
makes them decorative: a client can spend its whole allowance, drop the socket,
reconnect and continue. Message and connection budgets therefore live in a
per-IP record that outlives the socket, and exhausting one blocks the IP for
`SIGNALING_IP_BLOCK_MS`.

The buckets are token buckets rather than fixed windows, so a client cannot
straddle a window boundary to spend twice the configured rate at once.

### Trusting X-Forwarded-For

`X-Forwarded-For` is appended to by each hop, so the **leftmost** entry is
whatever the client sent — reading it lets a client pick a fresh identity per
connection and walk past every per-IP limit. The client address is resolved
`SIGNALING_TRUSTED_PROXY_HOPS` entries from the right instead.

**Set this to the number of proxies actually in front of the process.** It must
be `0` when the app is reachable directly, or the header becomes spoofable
again. The default of `1` suits a single edge proxy (Railway, Fly, a single
nginx).

### peerId ownership

A peerId is an address: whoever holds it receives every signal routed to it.
An `announce` naming a peerId that another live socket already holds is
rejected, which prevents relay takeover, impersonation in other clients' device
lists, and evicting a peer by claiming and then dropping its id. A peerId whose
previous owner has disconnected can be reclaimed normally.

### Origin checking

Without an Origin check, any website can open a WebSocket to the signaling
server from a visitor's browser and enumerate or consume the room. Handshakes
carrying an `Origin` must match `SIGNALING_ALLOWED_ORIGINS`, or the request Host
when that is unset. Requests with no `Origin` are allowed, since they cannot be
cross-site browser requests — this is what lets the Flutter app connect.

## Device Trust

Pairing exchanges a **shared secret** over the DTLS-encrypted data channel, and
every later connection must prove possession of it before the peer counts as
trusted.

This matters because a peerId is not a credential. It is broadcast to everyone
in the signaling room on every announce, and anyone can register it with the
PeerJS broker once its owner goes offline. Treating a bare peerId as proof of
identity would let a stranger inherit a trusted device's privileges — including
silent file acceptance under "auto-accept".

- Pair codes are drawn with rejection sampling from `crypto.getRandomValues`,
  not `Math.random`.
- Codes and proofs are compared in constant time.
- The responder rotates its pair code as soon as one is used.
- Failed attempts are throttled and lock the peer out after five tries, so the
  10^6 code space cannot be walked over a data channel.
- Challenges are single-use and bound to the nonce actually issued, so a proof
  captured elsewhere cannot be replayed.
- Trust records from before secrets existed (`blink-trusted-peer-ids`) are
  discarded on load; those devices must pair again.

## File Transfer

Incoming chunks are buffered in memory until the file completes, so the
receiver enforces:

- Received bytes may not exceed the size the sender declared up front
- A ceiling on declared file size and on total buffered bytes per connection
- A cap on concurrent transfers and on queued accept prompts from one peer
- "Accept all" grants exactly the transfers listed when the user agreed — the
  sender controls `batch.index`, so a count-based window could otherwise be held
  open for its full lifetime
- Files with extensions that the OS may execute, or that a browser may render
  with script, are called out in the accept prompt before any bytes move

## Environment Variables

Server-side controls:

```bash
SIGNALING_ACCESS_TOKEN=
SIGNALING_ALLOWED_ORIGINS=
SIGNALING_TRUSTED_PROXY_HOPS=1
SIGNALING_MAX_CONNECTIONS=200
SIGNALING_MAX_CONNECTIONS_PER_IP=20
SIGNALING_MAX_CONNECTIONS_PER_WINDOW_PER_IP=30
SIGNALING_MAX_MESSAGES_PER_WINDOW=120
SIGNALING_MAX_MESSAGES_PER_WINDOW_PER_IP=600
SIGNALING_MAX_ANNOUNCES_PER_WINDOW=5
SIGNALING_MESSAGE_WINDOW_MS=60000
SIGNALING_IP_BLOCK_MS=60000
SIGNALING_IP_STATE_TTL_MS=600000
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

## Known Gaps

- **Rooms are not scoped to a network.** `NUXT_PUBLIC_SIGNALING_ROOM` defaults to
  `local` for every client, so a public deployment puts every user on the
  internet in one room. That is the blast radius for announce amplification and
  for anything that depends on room membership, and it means "nearby devices"
  is not actually scoped to a LAN. Deriving the default room from the client's
  network (as Snapdrop and PairDrop do) would fix this; `getPeerIp()` already
  resolves the address needed.
- **No TURN server.** Only STUN is configured, so peers behind symmetric NAT or
  carrier-grade NAT may fail to establish a data channel.
- The signaling access token ships to the browser and is therefore not a secret.

## Public Deployment Recommendation

For internet-facing deployments, put the app behind a layer that can absorb volumetric traffic, such as Cloudflare or a reverse proxy with connection and request limits. The in-app controls reduce signaling abuse, but they cannot stop raw bandwidth exhaustion before traffic reaches the server.

Set `SIGNALING_TRUSTED_PROXY_HOPS` to match that layer, and set
`SIGNALING_ALLOWED_ORIGINS` to the origins you actually serve.
