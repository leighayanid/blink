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

const announcedDevices = /* @__PURE__ */ new Map();
const ws = defineWebSocketHandler({
  open(peer) {
    console.log("[WebSocket] Client connected:", peer.id);
    peer.subscribe("discovery");
    peer.send(JSON.stringify({
      type: "init",
      peerId: peer.id
    }));
    for (const [peerId, deviceInfo] of announcedDevices.entries()) {
      peer.send(JSON.stringify({
        type: "peer-joined",
        deviceInfo
      }));
    }
  },
  message(peer, message) {
    var _a;
    try {
      const data = message.text();
      const parsed = JSON.parse(data);
      console.log("[WebSocket] Message received:", parsed.type);
      switch (parsed.type) {
        case "announce":
          console.log("[WebSocket] Device announced:", parsed.deviceInfo.name, "with peerId:", parsed.deviceInfo.peerId);
          const peerJsId = ((_a = parsed.deviceInfo) == null ? void 0 : _a.peerId) || null;
          const key = peerJsId || peer.id;
          const deviceWithWsId = {
            ...parsed.deviceInfo,
            wsId: peer.id
            // Track WebSocket connection separately
          };
          announcedDevices.set(key, deviceWithWsId);
          const peerJoinedMsg = JSON.stringify({
            type: "peer-joined",
            deviceInfo: parsed.deviceInfo
          });
          peer.send(peerJoinedMsg);
          peer.publish("discovery", peerJoinedMsg);
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
    let removedPeerJsId = null;
    for (const [key, deviceInfo] of announcedDevices.entries()) {
      if ((deviceInfo == null ? void 0 : deviceInfo.wsId) === peer.id) {
        removedPeerJsId = (deviceInfo == null ? void 0 : deviceInfo.peerId) || null;
        announcedDevices.delete(key);
        break;
      }
    }
    if (removedPeerJsId) {
      peer.publish("discovery", JSON.stringify({
        type: "peer-left",
        peerId: removedPeerJsId
      }));
    }
  },
  error(peer, error) {
    console.error("[WebSocket] Error:", error);
  }
});

export { ws as default };
//# sourceMappingURL=ws.mjs.map
