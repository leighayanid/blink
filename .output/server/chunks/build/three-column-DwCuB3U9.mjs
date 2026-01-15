import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc, e as useState } from './server.mjs';
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

const useColorMode = () => {
  return useState("color-mode").value;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "three-column",
  __ssrInlineRender: true,
  setup(__props) {
    const colorMode = useColorMode();
    ref(null);
    ref({
      left: 0,
      center: 0,
      right: 0
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "layout" }, _attrs))} data-v-7fee78e3><header class="app-header" data-v-7fee78e3><div class="header-content" data-v-7fee78e3><h1 data-v-7fee78e3>☀️ Hatid</h1><p class="subtitle" data-v-7fee78e3>Share files instantly on your local network</p></div><button class="theme-toggle"${ssrRenderAttr("title", unref(colorMode).value === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode")} data-v-7fee78e3>${ssrInterpolate(unref(colorMode).value === "dark" ? "☀️" : "🌙")}</button></header><div class="content-wrapper" data-v-7fee78e3><div class="autoresize-container" data-v-7fee78e3><div class="column left-column" data-v-7fee78e3>`);
      ssrRenderSlot(_ctx.$slots, "left", {}, null, _push, _parent);
      _push(`</div><div class="column center-column" data-v-7fee78e3>`);
      ssrRenderSlot(_ctx.$slots, "center", {}, null, _push, _parent);
      _push(`</div><div class="column right-column" data-v-7fee78e3>`);
      ssrRenderSlot(_ctx.$slots, "right", {}, null, _push, _parent);
      _push(`</div></div><div class="bottom-section" data-v-7fee78e3>`);
      ssrRenderSlot(_ctx.$slots, "bottom", {}, null, _push, _parent);
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/three-column.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const threeColumn = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7fee78e3"]]);

export { threeColumn as default };
//# sourceMappingURL=three-column-DwCuB3U9.mjs.map
