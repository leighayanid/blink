import { d as defineWebSocketHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'stream';
import 'events';
import 'http';
import 'crypto';
import 'buffer';
import 'zlib';
import 'https';
import 'net';
import 'tls';
import 'url';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const ws = defineWebSocketHandler({
  open(peer) {
    console.log("[WebSocket] Client connected:", peer.id);
    peer.subscribe("discovery");
    peer.send(JSON.stringify({
      type: "init",
      peerId: peer.id
    }));
  },
  message(peer, message) {
    try {
      const data = message.text();
      const parsed = JSON.parse(data);
      console.log("[WebSocket] Message received:", parsed.type);
      switch (parsed.type) {
        case "announce":
          console.log("[WebSocket] Device announced:", parsed.deviceInfo.name);
          peer.publish("discovery", JSON.stringify({
            type: "peer-joined",
            deviceInfo: {
              ...parsed.deviceInfo,
              peerId: peer.id
            }
          }));
          break;
        case "signal":
          if (parsed.targetPeer) {
            peer.send(JSON.stringify({
              type: "signal",
              signal: parsed.signal,
              fromPeer: peer.id
            }));
          }
          break;
        case "offer":
        case "answer":
        case "ice-candidate":
          peer.publish("discovery", JSON.stringify(parsed));
          break;
      }
    } catch (error) {
      console.error("[WebSocket] Error handling message:", error);
    }
  },
  close(peer, event) {
    console.log("[WebSocket] Client disconnected:", peer.id);
    peer.publish("discovery", JSON.stringify({
      type: "peer-left",
      peerId: peer.id
    }));
  },
  error(peer, error) {
    console.error("[WebSocket] Error:", error);
  }
});

export { ws as default };
//# sourceMappingURL=ws.mjs.map
