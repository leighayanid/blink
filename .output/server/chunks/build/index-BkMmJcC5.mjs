import { defineComponent, ref, mergeProps, unref, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc, b as useRuntimeConfig } from './server.mjs';
import Peer from 'peerjs';
import '../nitro/nitro.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'pinia';
import 'vue-router';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "DeviceList",
  __ssrInlineRender: true,
  props: {
    devices: {},
    selectedDevice: {}
  },
  emits: ["select", "connect"],
  setup(__props) {
    const getPlatformIcon = (platform) => {
      const icons = {
        "Windows": "🪟",
        "macOS": "🍎",
        "Linux": "🐧",
        "Android": "🤖",
        "iOS": "📱",
        "Unknown": "💻"
      };
      return icons[platform] || "💻";
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "device-list" }, _attrs))} data-v-e3186169>`);
      if (__props.devices.length === 0) {
        _push(`<div class="empty-state" data-v-e3186169><p data-v-e3186169>No devices found on the network</p><p class="text-sm" data-v-e3186169>Make sure other devices are on the same network</p></div>`);
      } else {
        _push(`<div class="devices-grid" data-v-e3186169><!--[-->`);
        ssrRenderList(__props.devices, (device) => {
          _push(`<div class="${ssrRenderClass([{ selected: __props.selectedDevice?.id === device.id }, "device-card"])}" data-v-e3186169><div class="device-icon" data-v-e3186169><span data-v-e3186169>${ssrInterpolate(getPlatformIcon(device.platform))}</span></div><div class="device-info" data-v-e3186169><h3 data-v-e3186169>${ssrInterpolate(device.name)}</h3><p class="platform" data-v-e3186169>${ssrInterpolate(device.platform)}</p>`);
          if (device.ip) {
            _push(`<p class="ip" data-v-e3186169>${ssrInterpolate(device.ip)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (__props.selectedDevice?.id === device.id) {
            _push(`<button class="connect-btn" data-v-e3186169> Connect </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DeviceList.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-e3186169"]]), { __name: "DeviceList" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "FileUploader",
  __ssrInlineRender: true,
  props: {
    disabled: { type: Boolean }
  },
  emits: ["filesSelected"],
  setup(__props, { emit: __emit }) {
    ref();
    const selectedFiles = ref([]);
    const isDragging = ref(false);
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "file-uploader" }, _attrs))} data-v-d97eebeb><div class="${ssrRenderClass([{ "drag-over": isDragging.value, disabled: __props.disabled }, "drop-zone"])}" data-v-d97eebeb><input type="file" multiple${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""} style="${ssrRenderStyle({ "display": "none" })}" data-v-d97eebeb><div class="drop-zone-content" data-v-d97eebeb><div class="icon" data-v-d97eebeb>📁</div><p class="primary" data-v-d97eebeb>${ssrInterpolate(__props.disabled ? "Select a device first" : "Click or drag files here")}</p><p class="secondary" data-v-d97eebeb>${ssrInterpolate(__props.disabled ? "" : "Multiple files supported")}</p></div></div>`);
      if (selectedFiles.value.length > 0) {
        _push(`<div class="selected-files" data-v-d97eebeb><h4 data-v-d97eebeb>Selected Files (${ssrInterpolate(selectedFiles.value.length)})</h4><div class="file-list" data-v-d97eebeb><!--[-->`);
        ssrRenderList(selectedFiles.value, (file, index2) => {
          _push(`<div class="file-item" data-v-d97eebeb><span class="file-name" data-v-d97eebeb>${ssrInterpolate(file.name)}</span><span class="file-size" data-v-d97eebeb>${ssrInterpolate(formatFileSize(file.size))}</span><button class="remove-btn" data-v-d97eebeb>×</button></div>`);
        });
        _push(`<!--]--></div><div class="actions" data-v-d97eebeb><button class="send-btn" data-v-d97eebeb> Send ${ssrInterpolate(selectedFiles.value.length)} file(s) </button><button class="clear-btn" data-v-d97eebeb>Clear</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FileUploader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-d97eebeb"]]), { __name: "FileUploader" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TransferProgress",
  __ssrInlineRender: true,
  props: {
    transfers: {}
  },
  emits: ["clearCompleted"],
  setup(__props) {
    const props = __props;
    const activeCount = computed(
      () => props.transfers.filter(
        (t) => t.status === "sending" || t.status === "receiving"
      ).length
    );
    const completedCount = computed(
      () => props.transfers.filter((t) => t.status === "completed").length
    );
    const getStatusText = (status) => {
      const statusMap = {
        pending: "Pending",
        sending: "Sending",
        receiving: "Receiving",
        completed: "Completed",
        failed: "Failed"
      };
      return statusMap[status] || status;
    };
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };
    const formatSpeed = (bytesPerSecond) => {
      return formatFileSize(bytesPerSecond) + "/s";
    };
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.transfers.length > 0) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "transfer-progress" }, _attrs))} data-v-4c82ab51><h3 data-v-4c82ab51>Transfers (${ssrInterpolate(activeCount.value)} active)</h3><div class="transfers-list" data-v-4c82ab51><!--[-->`);
        ssrRenderList(__props.transfers, (transfer) => {
          _push(`<div class="${ssrRenderClass([transfer.status, "transfer-item"])}" data-v-4c82ab51><div class="transfer-header" data-v-4c82ab51><span class="file-name" data-v-4c82ab51>${ssrInterpolate(transfer.fileName)}</span><span class="${ssrRenderClass([transfer.status, "status-badge"])}" data-v-4c82ab51>${ssrInterpolate(getStatusText(transfer.status))}</span></div><div class="transfer-details" data-v-4c82ab51><span class="file-size" data-v-4c82ab51>${ssrInterpolate(formatFileSize(transfer.fileSize))}</span>`);
          if (transfer.speed) {
            _push(`<span class="speed" data-v-4c82ab51>${ssrInterpolate(formatSpeed(transfer.speed))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="progress-bar" data-v-4c82ab51><div style="${ssrRenderStyle({ width: transfer.progress + "%" })}" class="${ssrRenderClass([transfer.status, "progress-fill"])}" data-v-4c82ab51></div></div><div class="progress-text" data-v-4c82ab51>${ssrInterpolate(Math.round(transfer.progress))}% </div></div>`);
        });
        _push(`<!--]--></div>`);
        if (completedCount.value > 0) {
          _push(`<button class="clear-btn" data-v-4c82ab51> Clear Completed (${ssrInterpolate(completedCount.value)}) </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TransferProgress.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-4c82ab51"]]), { __name: "TransferProgress" });
const useDeviceDiscovery = () => {
  const devices = ref([]);
  const localDevice = ref(null);
  const socket = ref(null);
  const isConnected = ref(false);
  const generateDeviceId = () => {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  const getDeviceName = () => {
    return `Device-${Math.floor(Math.random() * 1e3)}`;
  };
  const getPlatform = () => {
    {
      return "Server";
    }
  };
  const initDevice = () => {
    localDevice.value = {
      id: generateDeviceId(),
      name: getDeviceName(),
      platform: getPlatform(),
      timestamp: Date.now()
    };
  };
  const connect = () => {
    const config = useRuntimeConfig();
    const wsUrl = config.public.wsUrl.replace("http", "ws");
    socket.value = new WebSocket(`${wsUrl}/ws`);
    socket.value.onopen = () => {
      console.log("[Discovery] Connected to signaling server");
      isConnected.value = true;
      announce();
    };
    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "init":
            if (localDevice.value) {
              localDevice.value.peerId = data.peerId;
            }
            break;
          case "peer-joined":
            if (data.deviceInfo && data.deviceInfo.id !== localDevice.value?.id) {
              addDevice(data.deviceInfo);
            }
            break;
          case "peer-left":
            if (data.peerId) {
              removeDevice(data.peerId);
            }
            break;
        }
      } catch (error) {
        console.error("[Discovery] Error parsing message:", error);
      }
    };
    socket.value.onerror = (error) => {
      console.error("[Discovery] WebSocket error:", error);
      isConnected.value = false;
    };
    socket.value.onclose = () => {
      console.log("[Discovery] Disconnected from signaling server");
      isConnected.value = false;
      setTimeout(() => {
        if (!isConnected.value) {
          connect();
        }
      }, 5e3);
    };
  };
  const announce = () => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        type: "announce",
        deviceInfo: localDevice.value
      }));
    }
  };
  const addDevice = (device) => {
    const existingIndex = devices.value.findIndex((d) => d.id === device.id);
    if (existingIndex >= 0) {
      devices.value[existingIndex] = device;
    } else {
      devices.value.push(device);
    }
  };
  const removeDevice = (peerId) => {
    devices.value = devices.value.filter((d) => d.peerId !== peerId);
  };
  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
    isConnected.value = false;
  };
  return {
    devices,
    localDevice,
    isConnected,
    connect,
    disconnect,
    initDevice,
    announce
  };
};
const useWebRTC = () => {
  const peer = ref(null);
  const connections = ref(/* @__PURE__ */ new Map());
  const localPeerId = ref("");
  const initPeer = (deviceId) => {
    return new Promise((resolve, reject) => {
      try {
        peer.value = new Peer(deviceId, {
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" }
            ]
          },
          debug: 2
          // Enable debug logging
        });
        peer.value.on("open", (id) => {
          console.log("[WebRTC] Peer initialized with ID:", id);
          localPeerId.value = id;
          resolve(id);
        });
        peer.value.on("connection", (conn) => {
          console.log("[WebRTC] Incoming connection from:", conn.peer);
          handleConnection(conn);
        });
        peer.value.on("error", (error) => {
          console.error("[WebRTC] Peer error:", error);
          reject(error);
        });
        peer.value.on("disconnected", () => {
          console.log("[WebRTC] Peer disconnected, attempting reconnect...");
          peer.value?.reconnect();
        });
      } catch (error) {
        console.error("[WebRTC] Failed to initialize peer:", error);
        reject(error);
      }
    });
  };
  const connectToPeer = (peerId) => {
    return new Promise((resolve, reject) => {
      if (!peer.value) {
        reject(new Error("Peer not initialized"));
        return;
      }
      console.log("[WebRTC] Connecting to peer:", peerId);
      const conn = peer.value.connect(peerId, {
        reliable: true,
        serialization: "binary"
      });
      conn.on("open", () => {
        console.log("[WebRTC] Connection opened with", conn.peer);
        handleConnection(conn);
        resolve(conn);
      });
      conn.on("error", (error) => {
        console.error("[WebRTC] Connection error:", error);
        reject(error);
      });
    });
  };
  const handleConnection = (conn) => {
    connections.value.set(conn.peer, conn);
    conn.on("data", (data) => {
      console.log("[WebRTC] Data received from", conn.peer);
    });
    conn.on("close", () => {
      console.log("[WebRTC] Connection closed with", conn.peer);
      connections.value.delete(conn.peer);
    });
    conn.on("error", (error) => {
      console.error("[WebRTC] Connection error with", conn.peer, error);
      connections.value.delete(conn.peer);
    });
  };
  const sendData = (peerId, data) => {
    const conn = connections.value.get(peerId);
    if (conn && conn.open) {
      conn.send(data);
      return true;
    }
    console.warn("[WebRTC] No open connection to", peerId);
    return false;
  };
  const closeConnection = (peerId) => {
    const conn = connections.value.get(peerId);
    if (conn) {
      conn.close();
      connections.value.delete(peerId);
    }
  };
  const destroy = () => {
    connections.value.forEach((conn) => conn.close());
    connections.value.clear();
    peer.value?.destroy();
    peer.value = null;
  };
  return {
    peer,
    connections,
    localPeerId,
    initPeer,
    connectToPeer,
    sendData,
    closeConnection,
    destroy
  };
};
const useFileTransfer = () => {
  const transfers = ref([]);
  const CHUNK_SIZE = 64 * 1024;
  const generateTransferId = () => {
    return `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  const sendFile = async (file, connection) => {
    const transferId = generateTransferId();
    const transfer = {
      id: transferId,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: "sending",
      startTime: Date.now()
    };
    transfers.value.push(transfer);
    try {
      connection.send(JSON.stringify({
        type: "file-meta",
        transferId,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      }));
      await new Promise((resolve) => setTimeout(resolve, 100));
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let chunkIndex = 0;
      for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await chunk.arrayBuffer();
        connection.send(JSON.stringify({
          type: "file-chunk",
          transferId,
          chunkIndex,
          totalChunks
        }));
        connection.send(arrayBuffer);
        chunkIndex++;
        transfer.progress = offset / file.size * 100;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      connection.send(JSON.stringify({
        type: "file-complete",
        transferId
      }));
      transfer.status = "completed";
      transfer.endTime = Date.now();
      transfer.progress = 100;
      console.log(`[FileTransfer] File sent successfully: ${file.name}`);
      return transferId;
    } catch (error) {
      console.error("[FileTransfer] Error sending file:", error);
      transfer.status = "failed";
      throw error;
    }
  };
  const receiveFile = (connection) => {
    let currentTransfer = null;
    connection.on("data", async (data) => {
      try {
        if (typeof data === "string") {
          const message = JSON.parse(data);
          if (message.type === "file-meta") {
            currentTransfer = {
              id: message.transferId,
              chunks: [],
              metadata: message.metadata,
              receivedChunks: 0,
              totalChunks: 0
            };
            const transfer = {
              id: message.transferId,
              fileName: message.metadata.name,
              fileSize: message.metadata.size,
              progress: 0,
              status: "receiving",
              startTime: Date.now()
            };
            transfers.value.push(transfer);
            console.log(`[FileTransfer] Receiving file: ${message.metadata.name}`);
          }
          if (message.type === "file-chunk" && currentTransfer) {
            currentTransfer.totalChunks = message.totalChunks;
          }
          if (message.type === "file-complete" && currentTransfer) {
            const blob = new Blob(currentTransfer.chunks, {
              type: currentTransfer.metadata?.type || "application/octet-stream"
            });
            downloadFile(blob, currentTransfer.metadata?.name || "download");
            const transfer = transfers.value.find((t) => t.id === message.transferId);
            if (transfer) {
              transfer.status = "completed";
              transfer.progress = 100;
              transfer.endTime = Date.now();
            }
            console.log(`[FileTransfer] File received successfully: ${currentTransfer.metadata?.name}`);
            currentTransfer = null;
          }
        } else if (data instanceof ArrayBuffer && currentTransfer) {
          currentTransfer.chunks.push(data);
          currentTransfer.receivedChunks++;
          const transfer = transfers.value.find((t) => t.id === currentTransfer?.id);
          if (transfer && currentTransfer.totalChunks > 0) {
            transfer.progress = currentTransfer.receivedChunks / currentTransfer.totalChunks * 100;
          }
        }
      } catch (error) {
        console.error("[FileTransfer] Error receiving data:", error);
      }
    });
  };
  const downloadFile = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = (void 0).createElement("a");
    a.href = url;
    a.download = fileName;
    (void 0).body.appendChild(a);
    a.click();
    (void 0).body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const clearTransfer = (transferId) => {
    transfers.value = transfers.value.filter((t) => t.id !== transferId);
  };
  const clearCompleted = () => {
    transfers.value = transfers.value.filter((t) => t.status !== "completed");
  };
  return {
    transfers,
    sendFile,
    receiveFile,
    clearTransfer,
    clearCompleted
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { devices, localDevice, isConnected } = useDeviceDiscovery();
    const { connectToPeer, connections } = useWebRTC();
    const { transfers, sendFile, receiveFile, clearCompleted } = useFileTransfer();
    const selectedDevice = ref(null);
    const connectedPeer = ref(null);
    const getPlatformIcon = (platform) => {
      const icons = {
        "Windows": "🪟",
        "macOS": "🍎",
        "Linux": "🐧",
        "Android": "🤖",
        "iOS": "📱",
        "Unknown": "💻"
      };
      return icons[platform] || "💻";
    };
    const handleDeviceSelect = (device) => {
      selectedDevice.value = device;
    };
    const handleDeviceConnect = async (device) => {
      try {
        if (!device.peerId) {
          console.error("Device has no peer ID");
          return;
        }
        const conn = await connectToPeer(device.peerId);
        connectedPeer.value = device.peerId;
        receiveFile(conn);
        console.log("Successfully connected to", device.name);
      } catch (error) {
        console.error("Failed to connect to device:", error);
      }
    };
    const handleFilesSelected = async (files) => {
      if (!connectedPeer.value) {
        console.error("No peer connected");
        return;
      }
      const connection = connections.value.get(connectedPeer.value);
      if (!connection) {
        console.error("Connection not found");
        return;
      }
      for (const file of files) {
        try {
          await sendFile(file, connection);
        } catch (error) {
          console.error("Failed to send file:", error);
        }
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DeviceList = __nuxt_component_0;
      const _component_FileUploader = __nuxt_component_1;
      const _component_TransferProgress = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-f5143b85><header class="app-header" data-v-f5143b85><h1 data-v-f5143b85>🚀 Local Share</h1><p class="subtitle" data-v-f5143b85>Share files instantly on your local network</p></header><div class="main-content" data-v-f5143b85><section class="section" data-v-f5143b85><h2 data-v-f5143b85>Your Device</h2>`);
      if (unref(localDevice)) {
        _push(`<div class="local-device" data-v-f5143b85><div class="device-badge" data-v-f5143b85><span class="icon" data-v-f5143b85>${ssrInterpolate(getPlatformIcon(unref(localDevice).platform))}</span><div data-v-f5143b85><div class="device-name" data-v-f5143b85>${ssrInterpolate(unref(localDevice).name)}</div><div class="device-platform" data-v-f5143b85>${ssrInterpolate(unref(localDevice).platform)}</div></div></div>`);
        if (unref(isConnected)) {
          _push(`<div class="status-indicator connected" data-v-f5143b85><span class="dot" data-v-f5143b85></span> Connected </div>`);
        } else {
          _push(`<div class="status-indicator disconnected" data-v-f5143b85><span class="dot" data-v-f5143b85></span> Disconnected </div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section class="section" data-v-f5143b85><h2 data-v-f5143b85>Available Devices (${ssrInterpolate(unref(devices).length)})</h2>`);
      _push(ssrRenderComponent(_component_DeviceList, {
        devices: unref(devices),
        "selected-device": selectedDevice.value,
        onSelect: handleDeviceSelect,
        onConnect: handleDeviceConnect
      }, null, _parent));
      _push(`</section><section class="section" data-v-f5143b85><h2 data-v-f5143b85>Send Files</h2>`);
      _push(ssrRenderComponent(_component_FileUploader, {
        disabled: !connectedPeer.value,
        onFilesSelected: handleFilesSelected
      }, null, _parent));
      _push(`</section>`);
      _push(ssrRenderComponent(_component_TransferProgress, {
        transfers: unref(transfers),
        onClearCompleted: unref(clearCompleted)
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f5143b85"]]);

export { index as default };
//# sourceMappingURL=index-BkMmJcC5.mjs.map
