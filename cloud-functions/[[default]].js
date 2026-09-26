var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/hono/dist/utils/url.js
var splitPath, splitRoutingPath, extractGroupsFromPath, replaceGroupMarks, patternCache, getPattern, tryDecode, tryDecodeURI, getPath, getPathNoStrict, mergePath, checkOptionalParameter, tryDecodeURIComponent, _decodeURI, _getQueryParam, getQueryParam, getQueryParams, decodeURIComponent_;
var init_url = __esm({
  "node_modules/hono/dist/utils/url.js"() {
    splitPath = (path) => {
      const paths = path.split("/");
      if (paths[0] === "") {
        paths.shift();
      }
      return paths;
    };
    splitRoutingPath = (routePath) => {
      const { groups, path } = extractGroupsFromPath(routePath);
      const paths = splitPath(path);
      return replaceGroupMarks(paths, groups);
    };
    extractGroupsFromPath = (path) => {
      const groups = [];
      path = path.replace(/\{[^}]+\}/g, (match2, index) => {
        const mark = `@${index}`;
        groups.push([mark, match2]);
        return mark;
      });
      return { groups, path };
    };
    replaceGroupMarks = (paths, groups) => {
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = paths.length - 1; j >= 0; j--) {
          if (paths[j].includes(mark)) {
            paths[j] = paths[j].replace(mark, groups[i][1]);
            break;
          }
        }
      }
      return paths;
    };
    patternCache = {};
    getPattern = (label, next) => {
      if (label === "*") {
        return "*";
      }
      const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      if (match2) {
        const cacheKey = `${label}#${next}`;
        if (!patternCache[cacheKey]) {
          if (match2[2]) {
            patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
          } else {
            patternCache[cacheKey] = [label, match2[1], true];
          }
        }
        return patternCache[cacheKey];
      }
      return null;
    };
    tryDecode = (str, decoder) => {
      try {
        return decoder(str);
      } catch {
        return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
          try {
            return decoder(match2);
          } catch {
            return match2;
          }
        });
      }
    };
    tryDecodeURI = (str) => tryDecode(str, decodeURI);
    getPath = (request) => {
      const url = request.url;
      const start = url.indexOf("/", url.indexOf(":") + 4);
      let i = start;
      for (; i < url.length; i++) {
        const charCode = url.charCodeAt(i);
        if (charCode === 37) {
          const queryIndex = url.indexOf("?", i);
          const hashIndex = url.indexOf("#", i);
          const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
          const path = url.slice(start, end);
          return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
        } else if (charCode === 63 || charCode === 35) {
          break;
        }
      }
      return url.slice(start, i);
    };
    getPathNoStrict = (request) => {
      const result = getPath(request);
      return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
    };
    mergePath = (base, sub, ...rest) => {
      if (rest.length) {
        sub = mergePath(sub, ...rest);
      }
      return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
    };
    checkOptionalParameter = (path) => {
      if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
        return null;
      }
      const segments = path.split("/");
      const results = [];
      let basePath = "";
      segments.forEach((segment) => {
        if (segment !== "" && !/\:/.test(segment)) {
          basePath += "/" + segment;
        } else if (/\:/.test(segment)) {
          if (segment.charCodeAt(segment.length - 1) === 63) {
            if (results.length === 0 && basePath === "") {
              results.push("/");
            } else {
              results.push(basePath);
            }
            const optionalSegment = segment.slice(0, -1);
            basePath += "/" + optionalSegment;
            results.push(basePath);
          } else {
            basePath += "/" + segment;
          }
        }
      });
      return results.filter((v, i, a) => a.indexOf(v) === i);
    };
    tryDecodeURIComponent = (str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str;
    _decodeURI = (value) => {
      if (value.indexOf("+") !== -1) {
        value = value.replace(/\+/g, " ");
      }
      return tryDecodeURIComponent(value);
    };
    _getQueryParam = (url, key, multiple) => {
      const hashIndex = url.indexOf("#", 8);
      if (hashIndex !== -1) {
        url = url.slice(0, hashIndex);
      }
      let encoded;
      if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
        let keyIndex2 = url.indexOf("?", 8);
        if (keyIndex2 === -1) {
          return void 0;
        }
        if (!url.startsWith(key, keyIndex2 + 1)) {
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        while (keyIndex2 !== -1) {
          const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
          if (trailingKeyCode === 61) {
            const valueIndex = keyIndex2 + key.length + 2;
            const endIndex = url.indexOf("&", valueIndex);
            return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
          } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
            return "";
          }
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) {
          return void 0;
        }
      }
      const results = /* @__PURE__ */ Object.create(null);
      encoded ??= /[%+]/.test(url);
      let keyIndex = url.indexOf("?", 8);
      while (keyIndex !== -1) {
        const nextKeyIndex = url.indexOf("&", keyIndex + 1);
        let valueIndex = url.indexOf("=", keyIndex);
        if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
          valueIndex = -1;
        }
        let name = url.slice(
          keyIndex + 1,
          valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
        );
        if (encoded) {
          name = _decodeURI(name);
        }
        keyIndex = nextKeyIndex;
        if (name === "") {
          continue;
        }
        let value;
        if (valueIndex === -1) {
          value = "";
        } else {
          value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
          if (encoded) {
            value = _decodeURI(value);
          }
        }
        if (multiple) {
          if (!(results[name] && Array.isArray(results[name]))) {
            results[name] = [];
          }
          ;
          results[name].push(value);
        } else {
          results[name] ??= value;
        }
      }
      return key ? results[key] : results;
    };
    getQueryParam = _getQueryParam;
    getQueryParams = (url, key) => {
      return _getQueryParam(url, key, true);
    };
    decodeURIComponent_ = decodeURIComponent;
  }
});

// node_modules/hono/dist/utils/cookie.js
var algorithm, getCryptoKey, makeSignature, verifySignature, validCookieNameRegEx, relaxedCookieNameRegEx, validCookieValueRegEx, trimCookieWhitespace, parse, parseSigned, _serialize, serialize, serializeSigned;
var init_cookie = __esm({
  "node_modules/hono/dist/utils/cookie.js"() {
    init_url();
    algorithm = { name: "HMAC", hash: "SHA-256" };
    getCryptoKey = async (secret) => {
      const secretBuf = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
      return await crypto.subtle.importKey("raw", secretBuf, algorithm, false, ["sign", "verify"]);
    };
    makeSignature = async (value, secret) => {
      const key = await getCryptoKey(secret);
      const signature = await crypto.subtle.sign(algorithm.name, key, new TextEncoder().encode(value));
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    };
    verifySignature = async (base64Signature, value, secret) => {
      try {
        const signatureBinStr = atob(base64Signature);
        const signature = new Uint8Array(signatureBinStr.length);
        for (let i = 0, len = signatureBinStr.length; i < len; i++) {
          signature[i] = signatureBinStr.charCodeAt(i);
        }
        return await crypto.subtle.verify(algorithm, secret, signature, new TextEncoder().encode(value));
      } catch {
        return false;
      }
    };
    validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
    relaxedCookieNameRegEx = /^[!#-:<>-[\]-~]+$/;
    validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
    trimCookieWhitespace = (value) => {
      let start = 0;
      let end = value.length;
      while (start < end) {
        const charCode = value.charCodeAt(start);
        if (charCode !== 32 && charCode !== 9) {
          break;
        }
        start++;
      }
      while (end > start) {
        const charCode = value.charCodeAt(end - 1);
        if (charCode !== 32 && charCode !== 9) {
          break;
        }
        end--;
      }
      return start === 0 && end === value.length ? value : value.slice(start, end);
    };
    parse = (cookie, name) => {
      if (name && cookie.indexOf(name) === -1) {
        return {};
      }
      const pairs = cookie.split(";");
      const parsedCookie = /* @__PURE__ */ Object.create(null);
      for (const pairStr of pairs) {
        const valueStartPos = pairStr.indexOf("=");
        if (valueStartPos === -1) {
          continue;
        }
        const cookieName = trimCookieWhitespace(pairStr.substring(0, valueStartPos));
        if (name && name !== cookieName || !relaxedCookieNameRegEx.test(cookieName) || cookieName in parsedCookie) {
          continue;
        }
        let cookieValue = trimCookieWhitespace(pairStr.substring(valueStartPos + 1));
        if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
          cookieValue = cookieValue.slice(1, -1);
        }
        if (validCookieValueRegEx.test(cookieValue)) {
          parsedCookie[cookieName] = tryDecodeURIComponent(cookieValue);
          if (name) {
            break;
          }
        }
      }
      return parsedCookie;
    };
    parseSigned = async (cookie, secret, name) => {
      const parsedCookie = /* @__PURE__ */ Object.create(null);
      const secretKey = await getCryptoKey(secret);
      for (const [key, value] of Object.entries(parse(cookie, name))) {
        const signatureStartPos = value.lastIndexOf(".");
        if (signatureStartPos < 0) {
          continue;
        }
        const signedValue = value.substring(0, signatureStartPos);
        const signature = value.substring(signatureStartPos + 1);
        if (signature.length !== 44 || !signature.endsWith("=")) {
          continue;
        }
        const isVerified = await verifySignature(signature, signedValue, secretKey);
        parsedCookie[key] = isVerified ? signedValue : false;
      }
      return parsedCookie;
    };
    _serialize = (name, value, opt = {}) => {
      if (!validCookieNameRegEx.test(name)) {
        throw new Error("Invalid cookie name");
      }
      let cookie = `${name}=${value}`;
      if (name.startsWith("__Secure-") && !opt.secure) {
        throw new Error("__Secure- Cookie must have Secure attributes");
      }
      if (name.startsWith("__Host-")) {
        if (!opt.secure) {
          throw new Error("__Host- Cookie must have Secure attributes");
        }
        if (opt.path !== "/") {
          throw new Error('__Host- Cookie must have Path attributes with "/"');
        }
        if (opt.domain) {
          throw new Error("__Host- Cookie must not have Domain attributes");
        }
      }
      for (const key of ["domain", "path", "sameSite", "priority"]) {
        if (opt[key] && /[;\r\n]/.test(opt[key])) {
          throw new Error(`${key} must not contain ";", "\\r", or "\\n"`);
        }
      }
      if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
        if (opt.maxAge > 3456e4) {
          throw new Error(
            "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
          );
        }
        cookie += `; Max-Age=${opt.maxAge | 0}`;
      }
      if (opt.domain && opt.prefix !== "host") {
        cookie += `; Domain=${opt.domain}`;
      }
      if (opt.path) {
        cookie += `; Path=${opt.path}`;
      }
      if (opt.expires) {
        if (opt.expires.getTime() - Date.now() > 3456e7) {
          throw new Error(
            "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
          );
        }
        cookie += `; Expires=${opt.expires.toUTCString()}`;
      }
      if (opt.httpOnly) {
        cookie += "; HttpOnly";
      }
      if (opt.secure) {
        cookie += "; Secure";
      }
      if (opt.sameSite) {
        cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
      }
      if (opt.priority) {
        cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
      }
      if (opt.partitioned) {
        if (!opt.secure) {
          throw new Error("Partitioned Cookie must have Secure attributes");
        }
        cookie += "; Partitioned";
      }
      return cookie;
    };
    serialize = (name, value, opt) => {
      value = encodeURIComponent(value);
      return _serialize(name, value, opt);
    };
    serializeSigned = async (name, value, secret, opt = {}) => {
      const signature = await makeSignature(value, secret);
      value = `${value}.${signature}`;
      value = encodeURIComponent(value);
      return _serialize(name, value, opt);
    };
  }
});

// node_modules/hono/dist/helper/cookie/index.js
var cookie_exports = {};
__export(cookie_exports, {
  deleteCookie: () => deleteCookie,
  generateCookie: () => generateCookie,
  generateSignedCookie: () => generateSignedCookie,
  getCookie: () => getCookie,
  getSignedCookie: () => getSignedCookie,
  setCookie: () => setCookie,
  setSignedCookie: () => setSignedCookie
});
var getCookie, getSignedCookie, generateCookie, setCookie, generateSignedCookie, setSignedCookie, deleteCookie;
var init_cookie2 = __esm({
  "node_modules/hono/dist/helper/cookie/index.js"() {
    init_cookie();
    getCookie = (c, key, prefix) => {
      const cookie = c.req.raw.headers.get("Cookie");
      if (typeof key === "string") {
        if (!cookie) {
          return void 0;
        }
        let finalKey = key;
        if (prefix === "secure") {
          finalKey = "__Secure-" + key;
        } else if (prefix === "host") {
          finalKey = "__Host-" + key;
        }
        const obj2 = parse(cookie, finalKey);
        return obj2[finalKey];
      }
      if (!cookie) {
        return {};
      }
      const obj = parse(cookie);
      return obj;
    };
    getSignedCookie = async (c, secret, key, prefix) => {
      const cookie = c.req.raw.headers.get("Cookie");
      if (typeof key === "string") {
        if (!cookie) {
          return void 0;
        }
        let finalKey = key;
        if (prefix === "secure") {
          finalKey = "__Secure-" + key;
        } else if (prefix === "host") {
          finalKey = "__Host-" + key;
        }
        const obj2 = await parseSigned(cookie, secret, finalKey);
        return obj2[finalKey];
      }
      if (!cookie) {
        return {};
      }
      const obj = await parseSigned(cookie, secret);
      return obj;
    };
    generateCookie = (name, value, opt) => {
      let cookie;
      if (opt?.prefix === "secure") {
        cookie = serialize("__Secure-" + name, value, { path: "/", ...opt, secure: true });
      } else if (opt?.prefix === "host") {
        cookie = serialize("__Host-" + name, value, {
          ...opt,
          path: "/",
          secure: true,
          domain: void 0
        });
      } else {
        cookie = serialize(name, value, { path: "/", ...opt });
      }
      return cookie;
    };
    setCookie = (c, name, value, opt) => {
      const cookie = generateCookie(name, value, opt);
      c.header("Set-Cookie", cookie, { append: true });
    };
    generateSignedCookie = async (name, value, secret, opt) => {
      let cookie;
      if (opt?.prefix === "secure") {
        cookie = await serializeSigned("__Secure-" + name, value, secret, {
          path: "/",
          ...opt,
          secure: true
        });
      } else if (opt?.prefix === "host") {
        cookie = await serializeSigned("__Host-" + name, value, secret, {
          ...opt,
          path: "/",
          secure: true,
          domain: void 0
        });
      } else {
        cookie = await serializeSigned(name, value, secret, { path: "/", ...opt });
      }
      return cookie;
    };
    setSignedCookie = async (c, name, value, secret, opt) => {
      const cookie = await generateSignedCookie(name, value, secret, opt);
      c.header("set-cookie", cookie, { append: true });
    };
    deleteCookie = (c, name, opt) => {
      const deletedCookie = getCookie(c, name, opt?.prefix);
      setCookie(c, name, "", { ...opt, maxAge: 0 });
      return deletedCookie;
    };
  }
});

// src/config.ts
var SITE_CONFIG, SESSION_TTL, PROXY_KEY_PREFIX, OPENCODE_DEFAULT_URL, KEY_HEALTH_COOLDOWN_MS, KEY_HEALTH_MAX_FAILURES, KV_KEYS, EXPIRY_OPTIONS, DEFAULT_PROVIDERS;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    SITE_CONFIG = {
      title: "AI Gateway",
      subtitle: "\u7EDF\u4E00\u7684 AI \u7BA1\u7406\u5E73\u53F0",
      author: "QingYun",
      authorUrl: "https://github.com/yutian81/ai-gateway",
      blogUrl: "https://blog.notett.com",
      description: "AI \u6E20\u9053 API \u4EE3\u7406\u7F51\u5173 \u2014 \u7EDF\u4E00 /v1 \u63A5\u53E3\u8F6C\u53D1",
      favicon: "https://pan.811520.xyz/icon/ai.webp",
      faCdn: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    };
    SESSION_TTL = 7 * 24 * 60 * 60;
    PROXY_KEY_PREFIX = "sk_cf_";
    OPENCODE_DEFAULT_URL = "https://opencode.ai/zen/v1";
    KEY_HEALTH_COOLDOWN_MS = 5 * 60 * 1e3;
    KEY_HEALTH_MAX_FAILURES = 5;
    KV_KEYS = {
      PROVIDERS: "providers",
      PROXY_KEYS: "proxy:keys",
      SESSION_PREFIX: "admin:session:",
      KEY_HEALTH_PREFIX: "key:health:",
      AG_HEALTH_PREFIX: "ag:health:",
      OPENCODE_MIGRATION: "migration:opencode-default:v1",
      USAGE_PREFIX: "usage:req:"
    };
    EXPIRY_OPTIONS = {
      "30d": 30 * 24 * 60 * 60,
      "90d": 90 * 24 * 60 * 60,
      "180d": 180 * 24 * 60 * 60,
      "1y": 365 * 24 * 60 * 60,
      "forever": null
    };
    DEFAULT_PROVIDERS = [
      {
        id: "opencode",
        name: "OpenCode",
        baseUrl: "https://opencode.ai/zen/v1",
        apiType: "openai",
        apiKeys: [],
        mirrorUrls: [
          "https://opencode.ai.cmliussss.net/zen/v1",
          "https://opencode.fastly.cmliussss.net/zen/v1",
          "https://opencode.gcore.cmliussss.net/zen/v1"
        ],
        models: [
          { id: "deepseek-v4-flash-free", enabled: true },
          { id: "mimo-v2.5-free", enabled: true },
          { id: "nemotron-3-ultra-free", enabled: true },
          { id: "hy3-free", enabled: true }
        ],
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "kilo",
        name: "Kilo",
        baseUrl: "https://api.kilo.ai/api/gateway",
        apiType: "openai",
        apiKeys: [],
        models: [
          { id: "kilo-auto/frontier", alias: "kilo-frontier", enabled: true },
          { id: "kilo-auto/balanced", alias: "kilo-balanced", enabled: true },
          { id: "kilo-auto/efficient", alias: "kilo-efficient", enabled: true },
          { id: "google/gemma-3-27b-it:free", enabled: true },
          { id: "stepfun/step-3.7-flash:free", enabled: true },
          { id: "tencent/hy3:free", enabled: true },
          { id: "microsoft/mai-ds-r1:free", enabled: true },
          { id: "z-ai/glm-4.5-air:free", enabled: true },
          { id: "inception/mercury:free", enabled: true },
          { id: "inception/mercury-2:free", enabled: true }
        ],
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "tts",
        name: "Azure TTS",
        baseUrl: "",
        type: "azure-tts",
        apiType: "openai",
        apiKeys: [],
        voice: "zh-CN-XiaoxiaoNeural",
        rate: "+0%",
        volume: "+0%",
        pitch: "+0Hz",
        models: [
          { id: "zh-CN-YunxiNeural", enabled: true },
          { id: "zh-CN-XiaoxiaoNeural", enabled: true },
          { id: "en-US-JennyNeural", enabled: true },
          { id: "ja-JP-NanamiNeural", enabled: true }
        ],
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
  }
});

// src/storage-adapter.ts
import { getStore } from "@edgeone/pages-blob";
function getBlobStore(env) {
  if (cachedBlobStore) return cachedBlobStore;
  try {
    cachedBlobStore = getStore({
      name: "ai-gateway",
      consistency: "strong"
    });
    return cachedBlobStore;
  } catch (err) {
    const token = env?.EDGEONE_TOKEN_NEW || env?.EDGEONE_TOKEN || process.env.EDGEONE_TOKEN_NEW || process.env.EDGEONE_TOKEN;
    if (token) {
      try {
        cachedBlobStore = getStore({
          name: "ai-gateway",
          token,
          consistency: "strong"
        });
        return cachedBlobStore;
      } catch {
      }
    }
    cachedBlobStore = createMemoryStore();
    return cachedBlobStore;
  }
}
function createMemoryStore() {
  const map = /* @__PURE__ */ new Map();
  return {
    async get(key, _opts) {
      return map.get(key) ?? null;
    },
    async setJSON(key, val) {
      map.set(key, val);
    },
    async delete(key) {
      map.delete(key);
    },
    async list(opts) {
      const prefix = opts?.prefix ?? "";
      const blobs = [];
      for (const k of map.keys()) {
        if (k.startsWith(prefix)) blobs.push({ key: k });
      }
      return { blobs };
    }
  };
}
function blobKVImpl(store) {
  return {
    async get(key) {
      try {
        const blobKey = `kv/${encodeURIComponent(key)}.json`;
        const item = await store.get(blobKey, { type: "json", consistency: "strong" });
        if (!item) return null;
        if (item.expiresAt && item.expiresAt < Math.floor(Date.now() / 1e3)) {
          await store.delete(blobKey).catch(() => {
          });
          return null;
        }
        return typeof item.value === "string" ? item.value : JSON.stringify(item.value);
      } catch (e) {
        console.error(`[BlobKV] get error for ${key}:`, e?.message);
        return null;
      }
    },
    async put(key, value, options) {
      const blobKey = `kv/${encodeURIComponent(key)}.json`;
      const expiresAt = options?.expirationTtl ? Math.floor(Date.now() / 1e3) + options.expirationTtl : null;
      await store.setJSON(blobKey, {
        key,
        value,
        expiresAt,
        updatedAt: Date.now()
      });
    },
    async delete(key) {
      const blobKey = `kv/${encodeURIComponent(key)}.json`;
      await store.delete(blobKey).catch(() => {
      });
    },
    async list(options) {
      const prefix = options?.prefix ?? "";
      const blobPrefix = `kv/${encodeURIComponent(prefix)}`;
      const res = await store.list({
        prefix: blobPrefix,
        cursor: options?.cursor,
        paginate: false,
        consistency: "strong"
      });
      const keys = [];
      for (const b of res.blobs || []) {
        if (!b.key.startsWith("kv/") || !b.key.endsWith(".json")) continue;
        const rawEncoded = b.key.slice(3, -5);
        try {
          const originalKey = decodeURIComponent(rawEncoded);
          keys.push({ name: originalKey });
        } catch {
          keys.push({ name: rawEncoded });
        }
      }
      return {
        keys,
        list_complete: !res.cursor,
        cursor: res.cursor
      };
    }
  };
}
function getKV(env) {
  const store = getBlobStore(env);
  return blobKVImpl(store);
}
function storageTypeLabel(_env) {
  return "EdgeOne Blob \u6570\u636E\u5E93";
}
async function addUsageRecordBlob(env, record) {
  const store = getBlobStore(env);
  const date = record.ts.slice(0, 10);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const recordKey = `usage/records/${date}/${id}.json`;
  await store.setJSON(recordKey, record).catch(() => {
  });
  const dailyKey = `usage/daily/${date}.json`;
  try {
    const cur = await store.get(dailyKey, { type: "json", consistency: "strong" }) ?? {
      date,
      requests: 0,
      successRequests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalLatencyMs: 0,
      byModel: {},
      byProvider: {}
    };
    cur.requests += 1;
    if (record.ok) cur.successRequests += 1;
    cur.promptTokens += record.promptTokens || 0;
    cur.completionTokens += record.completionTokens || 0;
    cur.totalLatencyMs += record.latencyMs || 0;
    const displayModel = (record.model || "").replace(/[:\/\-]free$/i, "") || record.model || "unknown";
    cur.byModel[displayModel] = cur.byModel[displayModel] || { requests: 0, promptTokens: 0, completionTokens: 0 };
    cur.byModel[displayModel].requests += 1;
    cur.byModel[displayModel].promptTokens += record.promptTokens || 0;
    cur.byModel[displayModel].completionTokens += record.completionTokens || 0;
    const provider = record.provider || "unknown";
    cur.byProvider[provider] = cur.byProvider[provider] || { requests: 0, promptTokens: 0, completionTokens: 0 };
    cur.byProvider[provider].requests += 1;
    cur.byProvider[provider].promptTokens += record.promptTokens || 0;
    cur.byProvider[provider].completionTokens += record.completionTokens || 0;
    await store.setJSON(dailyKey, cur);
  } catch (err) {
    console.warn("[Usage] Daily aggregation update failed:", err?.message);
  }
}
async function getUsageSummaryBlob(env, days) {
  const store = getBlobStore(env);
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    dates.push(d.toISOString().slice(0, 10));
  }
  const dailyResults = await Promise.all(
    dates.map(async (date) => {
      const dailyKey = `usage/daily/${date}.json`;
      const data = await store.get(dailyKey, { type: "json", consistency: "strong" }).catch(() => null);
      return { date, data };
    })
  );
  let totalRequests = 0;
  let successRequests = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalLatencyMs = 0;
  const byModelMap = /* @__PURE__ */ new Map();
  const byProviderMap = /* @__PURE__ */ new Map();
  const dailyArr = [];
  for (const { date, data } of dailyResults) {
    if (!data) {
      dailyArr.push({ date, requests: 0, promptTokens: 0, completionTokens: 0 });
      continue;
    }
    totalRequests += data.requests || 0;
    successRequests += data.successRequests || 0;
    totalPromptTokens += data.promptTokens || 0;
    totalCompletionTokens += data.completionTokens || 0;
    totalLatencyMs += data.totalLatencyMs || 0;
    dailyArr.push({
      date,
      requests: data.requests || 0,
      promptTokens: data.promptTokens || 0,
      completionTokens: data.completionTokens || 0
    });
    for (const [model, stats] of Object.entries(data.byModel || {})) {
      const prev = byModelMap.get(model) || { requests: 0, promptTokens: 0, completionTokens: 0 };
      byModelMap.set(model, {
        requests: prev.requests + stats.requests,
        promptTokens: prev.promptTokens + stats.promptTokens,
        completionTokens: prev.completionTokens + stats.completionTokens
      });
    }
    for (const [prov, stats] of Object.entries(data.byProvider || {})) {
      const prev = byProviderMap.get(prov) || { requests: 0, promptTokens: 0, completionTokens: 0 };
      byProviderMap.set(prov, {
        requests: prev.requests + stats.requests,
        promptTokens: prev.promptTokens + stats.promptTokens,
        completionTokens: prev.completionTokens + stats.completionTokens
      });
    }
  }
  const byModel = Array.from(byModelMap.entries()).map(([model, s]) => ({ model, ...s })).sort((a, b) => b.requests - a.requests);
  const byProvider = Array.from(byProviderMap.entries()).map(([provider, s]) => ({ provider, ...s })).sort((a, b) => b.requests - a.requests);
  const avgLatencyMs = totalRequests > 0 ? Math.round(totalLatencyMs / totalRequests) : 0;
  return {
    days,
    totalRequests,
    successRequests,
    totalPromptTokens,
    totalCompletionTokens,
    avgLatencyMs,
    byModel,
    byProvider,
    daily: dailyArr
  };
}
var cachedBlobStore;
var init_storage_adapter = __esm({
  "src/storage-adapter.ts"() {
    "use strict";
    cachedBlobStore = null;
  }
});

// src/storage.ts
async function getProviders(env) {
  const data = await getKV(env).get(KV_KEYS.PROVIDERS);
  return data ? JSON.parse(data) : [];
}
async function getProvider(env, id) {
  const providers = await getProviders(env);
  return providers.find((p) => p.id === id) ?? null;
}
async function setProviders(env, providers) {
  await getKV(env).put(KV_KEYS.PROVIDERS, JSON.stringify(providers));
}
async function addProvider(env, provider) {
  const providers = await getProviders(env);
  providers.push(provider);
  await setProviders(env, providers);
}
async function updateProvider(env, id, updates) {
  const providers = await getProviders(env);
  const index = providers.findIndex((p) => p.id === id);
  if (index === -1) return null;
  providers[index] = { ...providers[index], ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  await setProviders(env, providers);
  return providers[index];
}
async function deleteProvider(env, id) {
  const providers = await getProviders(env);
  const filtered = providers.filter((p) => p.id !== id);
  if (filtered.length === providers.length) return false;
  await setProviders(env, filtered);
  return true;
}
async function getAdminCredentials(env) {
  const data = await getKV(env).get(ADMIN_CRED_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
async function setAdminCredentials(env, username, passwordHash) {
  await getKV(env).put(ADMIN_CRED_KEY, JSON.stringify({ username, passwordHash }));
}
async function deleteAllSessions(env) {
  const store = getKV(env);
  let cursor;
  do {
    const page = await store.list({ prefix: KV_KEYS.SESSION_PREFIX, cursor });
    for (const k of page.keys) await store.delete(k.name);
    cursor = page.cursor;
  } while (cursor);
}
async function createSession(env, username, ttlSeconds) {
  const sessionId = crypto.randomUUID();
  const session = {
    username,
    expiresAt: Date.now() + ttlSeconds * 1e3
  };
  await getKV(env).put(KV_KEYS.SESSION_PREFIX + sessionId, JSON.stringify(session), {
    expirationTtl: ttlSeconds
  });
  return sessionId;
}
async function getSession(env, sessionId) {
  const data = await getKV(env).get(KV_KEYS.SESSION_PREFIX + sessionId);
  if (!data) return null;
  const session = JSON.parse(data);
  if (session.expiresAt < Date.now()) {
    await deleteSession(env, sessionId);
    return null;
  }
  return session;
}
async function deleteSession(env, sessionId) {
  await getKV(env).delete(KV_KEYS.SESSION_PREFIX + sessionId);
}
async function getProxyKeys(env) {
  const data = await getKV(env).get(KV_KEYS.PROXY_KEYS);
  return data ? JSON.parse(data) : [];
}
async function setProxyKeys(env, keys) {
  await getKV(env).put(KV_KEYS.PROXY_KEYS, JSON.stringify(keys));
}
async function addProxyKey(env, key) {
  const keys = await getProxyKeys(env);
  keys.push(key);
  await setProxyKeys(env, keys);
}
async function deleteProxyKey(env, id) {
  const keys = await getProxyKeys(env);
  const filtered = keys.filter((k) => k.id !== id);
  if (filtered.length === keys.length) return false;
  await setProxyKeys(env, filtered);
  return true;
}
async function updateProxyKey(env, id, updates) {
  const keys = await getProxyKeys(env);
  const idx = keys.findIndex((k) => k.id === id);
  if (idx === -1) return null;
  keys[idx] = { ...keys[idx], ...updates };
  await setProxyKeys(env, keys);
  return keys[idx];
}
async function validateProxyKey(env, key) {
  const keys = await getProxyKeys(env);
  return keys.some((k) => {
    if (k.key !== key || !k.enabled) return false;
    if (k.expiresAt) {
      const now = Date.now();
      const expires = new Date(k.expiresAt).getTime();
      if (now >= expires) return false;
    }
    return true;
  });
}
async function seedInitialData(env) {
  const providers = await getProviders(env);
  const migrationCompleted = await getKV(env).get(KV_KEYS.OPENCODE_MIGRATION);
  const opencode = DEFAULT_PROVIDERS.find((provider) => provider.id === "opencode");
  if (!migrationCompleted) {
    if (opencode && !providers.some((provider) => provider.id === opencode.id)) {
      await setProviders(env, [
        ...providers,
        {
          ...opencode,
          apiKeys: opencode.apiKeys.map((key) => ({ ...key })),
          models: opencode.models.map((model) => ({ ...model }))
        }
      ]);
    }
    await getKV(env).put(KV_KEYS.OPENCODE_MIGRATION, "1");
  }
  if (providers.length === 0 && !migrationCompleted) {
    const keys = await getProxyKeys(env);
    if (keys.length === 0) {
      const testKey = {
        id: crypto.randomUUID(),
        key: `${PROXY_KEY_PREFIX}${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`,
        name: "\u6D4B\u8BD5 Key",
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await addProxyKey(env, testKey);
    }
  }
}
async function addUsageRecord(env, record) {
  await addUsageRecordBlob(env, record);
}
async function getUsageSummary(env, days) {
  return await getUsageSummaryBlob(env, days);
}
var ADMIN_CRED_KEY;
var init_storage = __esm({
  "src/storage.ts"() {
    "use strict";
    init_config();
    init_storage_adapter();
    init_config();
    ADMIN_CRED_KEY = "admin:credentials";
  }
});

// src/video-proxy.ts
var video_proxy_exports = {};
__export(video_proxy_exports, {
  handleAgnesVideo: () => handleAgnesVideo,
  queryAgnesVideoStatus: () => queryAgnesVideoStatus
});
async function handleAgnesVideo(baseUrl, apiKey, requestBody) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  const submitBody = {
    model: requestBody.model,
    prompt: requestBody.prompt || requestBody.input || ""
  };
  if (requestBody.duration !== void 0) {
    submitBody.duration = typeof requestBody.duration === "number" ? Math.round(requestBody.duration) : parseInt(String(requestBody.duration), 10);
  }
  let submitResp;
  try {
    submitResp = await fetch(`${cleanBase}/videos`, {
      method: "POST",
      headers,
      body: JSON.stringify(submitBody)
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "video submit failed";
    return new Response(JSON.stringify({ error: { message: msg, type: "proxy_error" } }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!submitResp.ok) {
    const errText2 = await submitResp.text();
    return new Response(errText2, { status: submitResp.status, headers: { "content-type": submitResp.headers.get("content-type") || "application/json" } });
  }
  let taskData;
  try {
    taskData = await submitResp.json();
  } catch {
    return new Response(JSON.stringify({ error: { message: "Invalid task submit response", type: "proxy_error" } }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
  const taskId = taskData.task_id || taskData.video_id || taskData.id;
  if (!taskId) {
    return new Response(JSON.stringify({ error: { message: "No task_id in upstream response", type: "proxy_error" } }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
  const deadline = Date.now() + AGNES_MAX_WAIT_MS;
  let status = taskData.status || "queued";
  let latest = taskData;
  while (Date.now() < deadline) {
    if (status === "completed" || status === "succeeded" || status === "saved") break;
    if (status === "failed" || status === "error" || status === "cancelled") break;
    await new Promise((r) => setTimeout(r, AGNES_POLL_INTERVAL_MS));
    try {
      const pollResp = await fetch(`${cleanBase}/videos/${taskId}`, { headers });
      if (pollResp.ok) {
        latest = await pollResp.json();
        status = latest.status || status;
      }
    } catch {
    }
  }
  const videoUrl = latest?.metadata?.url || latest?.url || latest?.video_url || "";
  const responsePayload = {
    id: taskId,
    object: "video",
    model: latest?.model || requestBody.model,
    status,
    progress: latest?.progress ?? (status === "completed" ? 100 : 0),
    created_at: latest?.created_at,
    completed_at: latest?.completed_at
  };
  if (status === "completed" || status === "succeeded") {
    responsePayload.data = [{ url: videoUrl }];
  } else {
    responsePayload.task_id = taskId;
    if (latest?.error) responsePayload.error = latest.error;
  }
  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
async function queryAgnesVideoStatus(baseUrl, apiKey, taskId) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  try {
    const pollResp = await fetch(`${cleanBase}/videos/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!pollResp.ok) {
      const errText2 = await pollResp.text();
      return new Response(errText2, { status: pollResp.status, headers: { "content-type": "application/json" } });
    }
    const latest = await pollResp.json();
    const status = latest?.status || "unknown";
    const videoUrl = latest?.metadata?.url || latest?.url || latest?.video_url || "";
    const payload = {
      id: taskId,
      object: "video",
      model: latest?.model,
      status,
      progress: latest?.progress ?? (status === "completed" ? 100 : 0),
      created_at: latest?.created_at,
      completed_at: latest?.completed_at
    };
    if (status === "completed" || status === "succeeded") {
      payload.data = [{ url: videoUrl }];
    } else {
      payload.task_id = taskId;
      if (latest?.error) payload.error = latest.error;
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "video status query failed";
    return new Response(JSON.stringify({ error: { message: msg, type: "proxy_error" } }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var AGNES_MAX_WAIT_MS, AGNES_POLL_INTERVAL_MS;
var init_video_proxy = __esm({
  "src/video-proxy.ts"() {
    "use strict";
    AGNES_MAX_WAIT_MS = 120 * 1e3;
    AGNES_POLL_INTERVAL_MS = 4e3;
  }
});

// src/azure-tts.ts
var azure_tts_exports = {};
__export(azure_tts_exports, {
  handleAzureTtsSpeech: () => handleAzureTtsSpeech,
  synthesizeAzureTts: () => synthesizeAzureTts
});
async function handleAzureTtsSpeech(body) {
  try {
    const input = typeof body?.input === "string" ? body.input.trim() : "";
    if (!input) {
      return new Response(JSON.stringify({ error: { message: "Azure TTS: input text is required", type: "invalid_request_error" } }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const voice = typeof body?.voice === "string" && body.voice.trim() ? body.voice.trim() : DEFAULT_VOICE;
    const rate = typeof body?.rate === "string" && body.rate.trim() ? body.rate.trim() : "+0%";
    const volume = typeof body?.volume === "string" && body.volume.trim() ? body.volume.trim() : "+0%";
    const pitch = typeof body?.pitch === "string" && body.pitch.trim() ? body.pitch.trim() : "+0Hz";
    const { audio, usedVoice } = await synthesizeAzureTts(input, { voice, rate, volume, pitch });
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "X-Azure-TTS-Voice": usedVoice
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[azure-tts]", message);
    return new Response(JSON.stringify({ error: { message, type: "azure_tts_error" } }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var DEFAULT_VOICE, TOKEN_REFRESH_BEFORE_EXPIRY, ENDPOINT_URL, MT_SIGNING_KEY_B64, tokenInfo, uuid, hmacSha256, base64ToBytes, bytesToBase64, dateFormat, sign, getEndpoint, buildSsml, normalizeRate, normalizeVolume, normalizePitch, synthesizeAzureTts;
var init_azure_tts = __esm({
  "src/azure-tts.ts"() {
    "use strict";
    DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";
    TOKEN_REFRESH_BEFORE_EXPIRY = 5 * 60;
    ENDPOINT_URL = "https://dev.microsofttranslator.com/apps/endpoint?api-version=1.0";
    MT_SIGNING_KEY_B64 = "oik6PdDdMnOXemTbwvMn9de/h9lFnfBaCWbGMMZqqoSaQaqUOqjVGm5NqsmjcBI1x+sS9ugjB55HEJWRiFXYFw==";
    tokenInfo = null;
    uuid = () => crypto.randomUUID().replace(/-/g, "");
    hmacSha256 = async (key, data) => {
      const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
      return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data)));
    };
    base64ToBytes = (b64) => {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    };
    bytesToBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
    dateFormat = () => (/* @__PURE__ */ new Date()).toUTCString().replace(/GMT/, "").trim() + " GMT";
    sign = async (urlStr) => {
      const url = urlStr.split("://")[1];
      const encodedUrl = encodeURIComponent(url);
      const uuidStr = uuid();
      const d = dateFormat();
      const bytesToSign = `MSTranslatorAndroidApp${encodedUrl}${d}${uuidStr}`.toLowerCase();
      const key = base64ToBytes(MT_SIGNING_KEY_B64);
      const sig = await hmacSha256(key, bytesToSign);
      return `MSTranslatorAndroidApp::${bytesToBase64(sig)}::${d}::${uuidStr}`;
    };
    getEndpoint = async () => {
      const now = Date.now() / 1e3;
      if (tokenInfo && tokenInfo.t && tokenInfo.expiredAt && now < tokenInfo.expiredAt - TOKEN_REFRESH_BEFORE_EXPIRY) {
        return tokenInfo;
      }
      const clientId = uuid();
      const response = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Accept-Language": "zh-Hans",
          "X-ClientVersion": "4.0.530a 5fe1dc6c",
          "X-UserId": "0f04d16a175c411e",
          "X-HomeGeographicRegion": "zh-Hans-CN",
          "X-ClientTraceId": clientId,
          "X-MT-Signature": await sign(ENDPOINT_URL),
          "User-Agent": "okhttp/4.5.0",
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": "0",
          "Accept-Encoding": "gzip"
        }
      });
      if (!response.ok) {
        throw new Error(`Azure TTS: endpoint token failed (${response.status})`);
      }
      const data = await response.json();
      if (!data.t) {
        throw new Error("Azure TTS: endpoint token missing");
      }
      let expiredAt = now + 3600;
      try {
        const payload = JSON.parse(atob(data.t.split(".")[1]));
        if (typeof payload.exp === "number") expiredAt = payload.exp;
      } catch {
      }
      tokenInfo = { r: data.r || "eastus", t: data.t, expiredAt };
      return tokenInfo;
    };
    buildSsml = (text, voice, rate, volume, pitch) => {
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const locale = voice.split("-").slice(0, 2).join("-");
      return `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0" xml:lang="${locale}">
    <voice name="${voice}">
        <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
            ${escaped}
        </prosody>
    </voice>
</speak>`;
    };
    normalizeRate = (v) => {
      const s = (v || "").trim();
      if (!s) return "+0%";
      return /^[+-]?\d+%$/.test(s) || /^[+-]?\d+(\.\d+)?x$/.test(s) ? s : "+0%";
    };
    normalizeVolume = (v) => {
      const s = (v || "").trim();
      return /^[+-]?\d+%$/.test(s) ? s : "+0%";
    };
    normalizePitch = (v) => {
      const s = (v || "").trim();
      return /^[+-]?\d+(Hz|%)$/.test(s) ? s : "+0Hz";
    };
    synthesizeAzureTts = async (text, options = {}, timeoutMs = 3e4) => {
      const voice = options.voice || DEFAULT_VOICE;
      const rate = normalizeRate(options.rate);
      const volume = normalizeVolume(options.volume);
      const pitch = normalizePitch(options.pitch);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const endpoint = await getEndpoint();
        const url = `https://${endpoint.r}.tts.speech.microsoft.com/cognitiveservices/v1`;
        const ssml = buildSsml(text, voice, rate, volume, pitch);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": endpoint.t,
            "Content-Type": "application/ssml+xml",
            "User-Agent": "okhttp/4.5.0",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3"
          },
          body: ssml,
          signal: controller.signal
        });
        if (!response.ok) {
          const errorText = (await response.text()).slice(0, 300);
          throw new Error(`Azure TTS: upstream ${response.status} - ${errorText}`);
        }
        const buffer = await response.arrayBuffer();
        return { audio: new Uint8Array(buffer), usedVoice: voice };
      } catch (error) {
        if (error.name === "AbortError") {
          throw new Error("Azure TTS: synthesis timeout");
        }
        throw error;
      } finally {
        clearTimeout(timer);
      }
    };
  }
});

// src/azure-voices.ts
var azure_voices_exports = {};
__export(azure_voices_exports, {
  AZURE_TTS_VOICES: () => AZURE_TTS_VOICES,
  isAzureVoiceId: () => isAzureVoiceId,
  voiceGroup: () => voiceGroup
});
function voiceGroup(id) {
  if (id.startsWith("zh-CN")) return "\u4E2D\u6587";
  if (id.startsWith("zh-HK") || id.startsWith("zh-TW")) return "\u7CA4\u8BED/\u7E41\u4F53";
  if (id.startsWith("en-")) return "\u82F1\u8BED";
  if (id.startsWith("ja-")) return "\u65E5\u8BED";
  if (id.startsWith("ko-")) return "\u97E9\u8BED";
  if (id.startsWith("fr-")) return "\u6CD5\u8BED";
  if (id.startsWith("de-")) return "\u5FB7\u8BED";
  if (id.startsWith("ru-")) return "\u4FC4\u8BED";
  if (id.startsWith("es-")) return "\u897F\u73ED\u7259\u8BED";
  if (id.startsWith("it-")) return "\u610F\u5927\u5229\u8BED";
  if (id.startsWith("pt-")) return "\u8461\u8404\u7259\u8BED";
  return "\u5176\u4ED6";
}
function isAzureVoiceId(id) {
  return AZURE_TTS_VOICES.some((v) => v.id === id);
}
var AZURE_TTS_VOICES;
var init_azure_voices = __esm({
  "src/azure-voices.ts"() {
    "use strict";
    AZURE_TTS_VOICES = [
      // 中文(简体)
      { id: "zh-CN-XiaoxiaoNeural", label: "\u6653\u6653(\u5973\xB7\u6E29\u6696)" },
      { id: "zh-CN-XiaoyiNeural", label: "\u6653\u4F0A(\u5973\xB7\u53EF\u7231)" },
      { id: "zh-CN-YunjianNeural", label: "\u4E91\u5065(\u7537\xB7\u6C89\u7A33)" },
      { id: "zh-CN-YunxiNeural", label: "\u4E91\u5E0C(\u7537\xB7\u9633\u5149)" },
      { id: "zh-CN-YunxiaNeural", label: "\u4E91\u590F(\u7537\u7AE5\xB7\u6E05\u8106)" },
      { id: "zh-CN-YunyangNeural", label: "\u4E91\u626C(\u7537\xB7\u65B0\u95FB)" },
      { id: "zh-CN-liaoning-XiaobeiNeural", label: "\u6653\u5317(\u5973\xB7\u4E1C\u5317)" },
      { id: "zh-CN-shaanxi-XiaoniNeural", label: "\u6653\u59AE(\u5973\xB7\u9655\u897F)" },
      { id: "zh-CN-YunfengNeural", label: "\u4E91\u5CF0(\u7537\xB7\u6807\u51C6)" },
      { id: "zh-CN-YunhaoNeural", label: "\u4E91\u7693(\u7537\xB7\u5E7F\u544A)" },
      { id: "zh-CN-YunjieNeural", label: "\u4E91\u6770(\u7537\xB7\u6D3B\u529B)" },
      { id: "zh-CN-YunzeNeural", label: "\u4E91\u6CFD(\u7537\xB7\u89E3\u8BF4)" },
      { id: "zh-CN-YunfanNeural", label: "\u4E91\u5E06(\u7537\xB7\u65C1\u767D)" },
      { id: "zh-CN-XiaochenNeural", label: "\u6653\u8FB0(\u5973\xB7\u6B22\u5FEB)" },
      { id: "zh-CN-XiaohanNeural", label: "\u6653\u6DB5(\u5973\xB7\u6E29\u67D4)" },
      { id: "zh-CN-XiaomengNeural", label: "\u6653\u68A6(\u5973\xB7\u751C\u7F8E)" },
      { id: "zh-CN-XiaomoNeural", label: "\u6653\u58A8(\u5973\xB7\u64AD\u97F3)" },
      { id: "zh-CN-XiaoqiuNeural", label: "\u6653\u79CB(\u5973\xB7\u81EA\u7136)" },
      { id: "zh-CN-XiaoruiNeural", label: "\u6653\u777F(\u5973\xB7\u7AE5\u58F0)" },
      { id: "zh-CN-XiaoshuangNeural", label: "\u6653\u53CC(\u5973\xB7\u7AE5\u58F0)" },
      { id: "zh-CN-XiaoxuanNeural", label: "\u6653\u8431(\u5973\xB7\u5B66\u672F)" },
      { id: "zh-CN-XiaoyanNeural", label: "\u6653\u989C(\u5973\xB7\u8BAD\u7EC3)" },
      { id: "zh-CN-XiaoyouNeural", label: "\u6653\u60A0(\u5973\xB7\u7AE5\u58F0)" },
      { id: "zh-CN-XiaozhenNeural", label: "\u6653\u7504(\u5973\xB7\u6E29\u67D4)" },
      { id: "zh-CN-YunxiMultilingualNeural", label: "\u4E91\u5E0C(\u591A\u8BED\u8A00)" },
      { id: "zh-CN-XiaoxiaoMultilingualNeural", label: "\u6653\u6653(\u591A\u8BED\u8A00)" },
      // 中文(繁体/粤语/台湾)
      { id: "zh-HK-HiuGaaiNeural", label: "\u66C9\u4F73(\u7CA4\u8BED\xB7\u5973)" },
      { id: "zh-HK-HiuMaanNeural", label: "\u66C9\u66FC(\u7CA4\u8BED\xB7\u5973)" },
      { id: "zh-HK-WanLungNeural", label: "\u96F2\u9F8D(\u7CA4\u8BED\xB7\u7537)" },
      { id: "zh-TW-HsiaoChenNeural", label: "\u66C9\u81FB(\u53F0\u8BED\xB7\u5973)" },
      { id: "zh-TW-HsiaoYuNeural", label: "\u66C9\u96E8(\u53F0\u8BED\xB7\u5973)" },
      { id: "zh-TW-YunJheNeural", label: "\u96F2\u54F2(\u53F0\u8BED\xB7\u7537)" },
      // 英文(美国)
      { id: "en-US-AriaNeural", label: "Aria(\u5973)" },
      { id: "en-US-JennyNeural", label: "Jenny(\u5973)" },
      { id: "en-US-MichelleNeural", label: "Michelle(\u5973)" },
      { id: "en-US-AnaNeural", label: "Ana(\u5973\xB7\u7AE5\u58F0)" },
      { id: "en-US-SaraNeural", label: "Sara(\u5973)" },
      { id: "en-US-EmmaNeural", label: "Emma(\u5973)" },
      { id: "en-US-AvaNeural", label: "Ava(\u5973)" },
      { id: "en-US-GuyNeural", label: "Guy(\u7537)" },
      { id: "en-US-ChristopherNeural", label: "Christopher(\u7537)" },
      { id: "en-US-EricNeural", label: "Eric(\u7537)" },
      { id: "en-US-RogerNeural", label: "Roger(\u7537)" },
      { id: "en-US-SteffanNeural", label: "Steffan(\u7537)" },
      { id: "en-US-AndrewNeural", label: "Andrew(\u7537)" },
      { id: "en-US-BrianNeural", label: "Brian(\u7537)" },
      { id: "en-US-BrandonNeural", label: "Brandon(\u7537)" },
      { id: "en-US-DavisNeural", label: "Davis(\u7537)" },
      { id: "en-US-TonyNeural", label: "Tony(\u7537)" },
      { id: "en-US-AIGenerate1Neural", label: "AI Generate 1" },
      { id: "en-US-AIGenerate2Neural", label: "AI Generate 2" },
      { id: "en-US-BlueNeural", label: "Blue(\u7537\xB7\u6B4C\u5531)" },
      { id: "en-US-JasonNeural", label: "Jason(\u7537)" },
      { id: "en-US-NancyNeural", label: "Nancy(\u5973)" },
      { id: "en-US-ClaraNeural", label: "Clara(\u5973)" },
      // 英文(英国/澳洲/其他)
      { id: "en-GB-SoniaNeural", label: "Sonia(\u82F1\xB7\u5973)" },
      { id: "en-GB-LibbyNeural", label: "Libby(\u82F1\xB7\u5973)" },
      { id: "en-GB-MaisieNeural", label: "Maisie(\u82F1\xB7\u5973)" },
      { id: "en-GB-RyanNeural", label: "Ryan(\u82F1\xB7\u7537)" },
      { id: "en-GB-ThomasNeural", label: "Thomas(\u82F1\xB7\u7537)" },
      { id: "en-GB-OliverNeural", label: "Oliver(\u82F1\xB7\u7537)" },
      { id: "en-AU-NatashaNeural", label: "Natasha(\u6FB3\xB7\u5973)" },
      { id: "en-AU-WilliamNeural", label: "William(\u6FB3\xB7\u7537)" },
      { id: "en-AU-AnnetteNeural", label: "Annette(\u6FB3\xB7\u5973)" },
      { id: "en-AU-ElsieNeural", label: "Elsie(\u6FB3\xB7\u5973)" },
      { id: "en-AU-TimNeural", label: "Tim(\u6FB3\xB7\u7537)" },
      { id: "en-CA-ClaraNeural", label: "Clara(\u52A0\xB7\u5973)" },
      { id: "en-CA-LiamNeural", label: "Liam(\u52A0\xB7\u7537)" },
      { id: "en-IN-NeerjaNeural", label: "Neerja(\u5370\xB7\u5973)" },
      { id: "en-IN-PrabhatNeural", label: "Prabhat(\u5370\xB7\u7537)" },
      // 日语
      { id: "ja-JP-NanamiNeural", label: "Nanami(\u5973)" },
      { id: "ja-JP-KeitaNeural", label: "Keita(\u7537)" },
      { id: "ja-JP-AoiNeural", label: "Aoi(\u5973)" },
      { id: "ja-JP-DaichiNeural", label: "Daichi(\u7537)" },
      { id: "ja-JP-MayumiNeural", label: "Mayumi(\u5973)" },
      { id: "ja-JP-NaokiNeural", label: "Naoki(\u7537)" },
      { id: "ja-JP-ShioriNeural", label: "Shiori(\u5973)" },
      // 韩语
      { id: "ko-KR-SunHiNeural", label: "SunHi(\u5973)" },
      { id: "ko-KR-InJoonNeural", label: "InJoon(\u7537)" },
      { id: "ko-KR-HyunsuNeural", label: "Hyunsu(\u7537)" },
      { id: "ko-KR-JiMinNeural", label: "JiMin(\u5973)" },
      { id: "ko-KR-SeoHyeonNeural", label: "SeoHyeon(\u5973)" },
      // 法语
      { id: "fr-FR-DeniseNeural", label: "Denise(\u5973)" },
      { id: "fr-FR-EliseNeural", label: "Elise(\u5973)" },
      { id: "fr-FR-VivienneNeural", label: "Vivienne(\u5973)" },
      { id: "fr-FR-HenriNeural", label: "Henri(\u7537)" },
      { id: "fr-FR-RemyNeural", label: "Remy(\u7537)" },
      { id: "fr-CA-SylvieNeural", label: "Sylvie(\u52A0\xB7\u5973)" },
      { id: "fr-CA-AntoineNeural", label: "Antoine(\u52A0\xB7\u7537)" },
      // 德语
      { id: "de-DE-KatjaNeural", label: "Katja(\u5973)" },
      { id: "de-DE-LouisaNeural", label: "Louisa(\u5973)" },
      { id: "de-DE-AmalaNeural", label: "Amala(\u5973)" },
      { id: "de-DE-ConradNeural", label: "Conrad(\u7537)" },
      { id: "de-DE-BerndNeural", label: "Bernd(\u7537)" },
      { id: "de-DE-FlorianNeural", label: "Florian(\u7537)" },
      { id: "de-DE-ChristophNeural", label: "Christoph(\u7537)" },
      { id: "de-DE-GiselaNeural", label: "Gisela(\u5973)" },
      { id: "de-DE-LeniNeural", label: "Leni(\u5973)" },
      { id: "de-AT-IngridNeural", label: "Ingrid(\u5965\xB7\u5973)" },
      { id: "de-AT-JonasNeural", label: "Jonas(\u5965\xB7\u7537)" },
      // 俄语
      { id: "ru-RU-SvetlanaNeural", label: "Svetlana(\u5973)" },
      { id: "ru-RU-DariyaNeural", label: "Dariya(\u5973)" },
      { id: "ru-RU-DmitryNeural", label: "Dmitry(\u7537)" },
      { id: "ru-RU-PavelNeural", label: "Pavel(\u7537)" },
      // 西班牙语
      { id: "es-ES-ElviraNeural", label: "Elvira(\u897F\xB7\u5973)" },
      { id: "es-ES-AlvaroNeural", label: "Alvaro(\u897F\xB7\u7537)" },
      { id: "es-ES-AbrilNeural", label: "Abril(\u897F\xB7\u5973)" },
      { id: "es-ES-ArnauNeural", label: "Arnau(\u897F\xB7\u7537)" },
      { id: "es-MX-DaliaNeural", label: "Dalia(\u58A8\xB7\u5973)" },
      { id: "es-MX-JorgeNeural", label: "Jorge(\u58A8\xB7\u7537)" },
      { id: "es-AR-ElenaNeural", label: "Elena(\u963F\xB7\u5973)" },
      { id: "es-AR-TomasNeural", label: "Tomas(\u963F\xB7\u7537)" },
      // 意大利语
      { id: "it-IT-ElsaNeural", label: "Elsa(\u5973)" },
      { id: "it-IT-IsabellaNeural", label: "Isabella(\u5973)" },
      { id: "it-IT-DiegoNeural", label: "Diego(\u7537)" },
      { id: "it-IT-BenignoNeural", label: "Benigno(\u7537)" },
      // 葡萄牙语
      { id: "pt-BR-FranciscaNeural", label: "Francisca(\u5DF4\xB7\u5973)" },
      { id: "pt-BR-AntonioNeural", label: "Antonio(\u5DF4\xB7\u7537)" },
      { id: "pt-BR-ThalitaNeural", label: "Thalita(\u5DF4\xB7\u5973)" },
      { id: "pt-PT-RaquelNeural", label: "Raquel(\u8461\xB7\u5973)" },
      { id: "pt-PT-DuarteNeural", label: "Duarte(\u8461\xB7\u7537)" },
      // 其他语言
      { id: "ar-SA-ZariyahNeural", label: "Zariyah(\u963F\u8BED\xB7\u5973)" },
      { id: "ar-SA-HamedNeural", label: "Hamed(\u963F\u8BED\xB7\u7537)" },
      { id: "hi-IN-SwaraNeural", label: "Swara(\u5370\u5730\xB7\u5973)" },
      { id: "hi-IN-MadhurNeural", label: "Madhur(\u5370\u5730\xB7\u7537)" },
      { id: "id-ID-GadisNeural", label: "Gadis(\u5370\u5C3C\xB7\u5973)" },
      { id: "id-ID-ArdiNeural", label: "Ardi(\u5370\u5C3C\xB7\u7537)" },
      { id: "th-TH-PremwadeeNeural", label: "Premwadee(\u6CF0\xB7\u5973)" },
      { id: "th-TH-NiwatNeural", label: "Niwat(\u6CF0\xB7\u7537)" },
      { id: "vi-VN-HoaiMyNeural", label: "HoaiMy(\u8D8A\xB7\u5973)" },
      { id: "vi-VN-NamMinhNeural", label: "NamMinh(\u8D8A\xB7\u7537)" },
      { id: "tr-TR-EmelNeural", label: "Emel(\u571F\xB7\u5973)" },
      { id: "tr-TR-AhmetNeural", label: "Ahmet(\u571F\xB7\u7537)" },
      { id: "pl-PL-ZofiaNeural", label: "Zofia(\u6CE2\xB7\u5973)" },
      { id: "pl-PL-MarekNeural", label: "Marek(\u6CE2\xB7\u7537)" },
      { id: "nl-NL-ColetteNeural", label: "Colette(\u8377\xB7\u5973)" },
      { id: "nl-NL-FennaNeural", label: "Fenna(\u8377\xB7\u5973)" },
      { id: "nl-NL-MaartenNeural", label: "Maarten(\u8377\xB7\u7537)" },
      { id: "sv-SE-SofieNeural", label: "Sofie(\u745E\xB7\u5973)" },
      { id: "sv-SE-MattiasNeural", label: "Mattias(\u745E\xB7\u7537)" },
      { id: "uk-UA-PolinaNeural", label: "Polina(\u4E4C\xB7\u5973)" },
      { id: "uk-UA-OstapNeural", label: "Ostap(\u4E4C\xB7\u7537)" },
      { id: "cs-CZ-VlastaNeural", label: "Vlasta(\u6377\xB7\u5973)" },
      { id: "cs-CZ-AntoninNeural", label: "Antonin(\u6377\xB7\u7537)" },
      { id: "da-DK-ChristelNeural", label: "Christel(\u4E39\xB7\u5973)" },
      { id: "da-DK-JeppeNeural", label: "Jeppe(\u4E39\xB7\u7537)" },
      { id: "fi-FI-SelmaNeural", label: "Selma(\u82AC\xB7\u5973)" },
      { id: "fi-FI-HarriNeural", label: "Harri(\u82AC\xB7\u7537)" },
      { id: "el-GR-AthinaNeural", label: "Athina(\u5E0C\xB7\u5973)" },
      { id: "el-GR-NestorasNeural", label: "Nestoras(\u5E0C\xB7\u7537)" },
      { id: "he-IL-HilaNeural", label: "Hila(\u5E0C\u4F2F\u6765\xB7\u5973)" },
      { id: "he-IL-AvriNeural", label: "Avri(\u5E0C\u4F2F\u6765\xB7\u7537)" },
      { id: "nb-NO-PernilleNeural", label: "Pernille(\u632A\xB7\u5973)" },
      { id: "nb-NO-FinnNeural", label: "Finn(\u632A\xB7\u7537)" }
    ];
  }
});

// src/oauth-common.ts
async function sha256Hex(input) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
function randomHex(byteLength) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function base64UrlEncode(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function createPkcePair() {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: base64UrlEncode(new Uint8Array(digest)) };
}
function oauthErrorResponse(message, status, type = "oauth_error") {
  return new Response(JSON.stringify({ error: { message, type } }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
async function readErrorBody(res) {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    if (typeof json.error === "string") return json.error;
    return json.error?.message || json.message || text;
  } catch {
    return text;
  }
}
async function getCachedToken(env, prefix, refreshToken) {
  const cacheKey = prefix + await sha256Hex(refreshToken);
  const raw2 = await getKV(env).get(cacheKey);
  if (!raw2) return null;
  try {
    const parsed = JSON.parse(raw2);
    if (parsed.accessToken) return parsed;
  } catch {
  }
  return null;
}
async function putCachedToken(env, prefix, refreshToken, value, expiresIn) {
  const cacheKey = prefix + await sha256Hex(refreshToken);
  const ttl = Math.min(30 * 24 * 3600, Math.max(expiresIn * 2, 24 * 3600));
  await getKV(env).put(cacheKey, JSON.stringify(value), {
    expirationTtl: ttl
  }).catch(() => {
  });
}
async function resolveAccessToken(env, prefix, refreshToken, refresher) {
  const cached = await getCachedToken(env, prefix, refreshToken);
  if (cached && (cached.expiresAt || 0) - 3e5 > Date.now()) return cached;
  const effective = cached?.currentRefreshToken || refreshToken;
  const refreshed = await refresher(effective);
  const value = {
    accessToken: refreshed.accessToken,
    expiresAt: Date.now() + refreshed.expiresIn * 1e3,
    currentRefreshToken: refreshed.refreshToken || effective,
    extra: refreshed.extra
  };
  await putCachedToken(env, prefix, refreshToken, value, refreshed.expiresIn);
  return value;
}
async function recordOAuthUsage(p, usage, ok, status) {
  const record = {
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    provider: p.providerId,
    model: p.requestedModel,
    token: p.maskedToken,
    ok,
    status,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    latencyMs: Date.now() - p.startedAt
  };
  await addUsageRecord(p.env, record).catch(() => {
  });
}
function defer(p, task) {
  if (p.waitUntil) {
    try {
      p.waitUntil(task);
    } catch {
      task.catch(() => {
      });
    }
  } else {
    task.catch(() => {
    });
  }
}
var init_oauth_common = __esm({
  "src/oauth-common.ts"() {
    "use strict";
    init_storage_adapter();
    init_storage();
  }
});

// src/gemini-translate.ts
function randomId2() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
function sanitizeToolName(name) {
  const cleaned = (name || "").replace(/[^A-Za-z0-9_]/g, "_");
  if (!cleaned) return "tool";
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `t_${cleaned}`;
}
function encodeSigId(sig) {
  return SIG_ID_PREFIX + encodeURIComponent(sig);
}
function decodeSigId(id) {
  if (!id.startsWith(SIG_ID_PREFIX)) return null;
  try {
    return decodeURIComponent(id.slice(SIG_ID_PREFIX.length));
  } catch {
    return null;
  }
}
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function stripUnsupportedSchemaKeys(schema) {
  if (Array.isArray(schema)) return schema.map(stripUnsupportedSchemaKeys);
  if (!isPlainObject(schema)) return schema;
  const out = {};
  for (const [k, v] of Object.entries(schema)) {
    if (UNSUPPORTED_SCHEMA_KEYS.has(k)) continue;
    if (k === "properties" && isPlainObject(v)) {
      const props = {};
      for (const [pk, pv] of Object.entries(v)) props[pk] = stripUnsupportedSchemaKeys(pv);
      out.properties = props;
      continue;
    }
    out[k] = stripUnsupportedSchemaKeys(v);
  }
  return out;
}
function streamMaxOutputTokens(modelId) {
  const id = modelId || "";
  for (const [re, cap] of AG_STREAM_MAX_OUTPUT) if (re.test(id)) return cap;
  return void 0;
}
function requiresSignedThinking(modelId) {
  return /claude/i.test(modelId || "");
}
function compatSanitize(node) {
  if (Array.isArray(node)) return node.map(compatSanitize);
  if (!isPlainObject(node)) return node;
  let merged = { ...node };
  if (Array.isArray(merged.allOf)) {
    const branches = merged.allOf.map(compatSanitize).filter(isPlainObject);
    const props = { ...isPlainObject(merged.properties) ? merged.properties : {} };
    const req = new Set(Array.isArray(merged.required) ? merged.required : []);
    let hasProps = isPlainObject(merged.properties);
    for (const b of branches) {
      if (isPlainObject(b.properties)) {
        Object.assign(props, b.properties);
        hasProps = true;
      }
      if (Array.isArray(b.required)) for (const r of b.required) req.add(r);
      if (merged.items === void 0 && b.items !== void 0) merged.items = b.items;
      if (merged.type === void 0 && b.type !== void 0) merged.type = b.type;
      if (merged.description === void 0 && b.description !== void 0) merged.description = b.description;
    }
    delete merged.allOf;
    if (hasProps) merged.properties = props;
    if (req.size > 0) merged.required = [...req];
    else delete merged.required;
  }
  if (Array.isArray(merged.oneOf) && merged.anyOf === void 0) merged.anyOf = merged.oneOf;
  delete merged.oneOf;
  const out = {};
  for (const [key, value] of Object.entries(merged)) {
    if (ZCODE_STRIP.has(key)) continue;
    if (key === "properties" && isPlainObject(value)) {
      const props = {};
      for (const [pk, pv] of Object.entries(value)) props[pk] = compatSanitize(pv);
      out.properties = props;
      continue;
    }
    if (key === "type" && Array.isArray(value)) {
      const nonNull = value.filter((t) => t !== "null");
      if (value.includes("null")) out.nullable = true;
      out.type = nonNull[0] ?? "string";
      continue;
    }
    if (key === "items" && Array.isArray(value)) {
      if (out.anyOf === void 0) out.anyOf = value.map(compatSanitize);
      continue;
    }
    out[key] = isPlainObject(value) || Array.isArray(value) ? compatSanitize(value) : value;
  }
  if (out.type === void 0 && isPlainObject(out.properties)) out.type = "object";
  if (out.type === void 0 && isPlainObject(out.items)) out.type = "array";
  if (Array.isArray(out.required)) {
    const known = isPlainObject(out.properties) ? out.properties : {};
    const filtered = out.required.filter((r) => typeof r === "string" && r in known);
    if (filtered.length > 0) out.required = filtered;
    else delete out.required;
  }
  return out;
}
function contentToParts(content) {
  const parts = [];
  if (typeof content === "string") {
    if (content) parts.push({ text: content });
    return parts;
  }
  if (Array.isArray(content)) {
    for (const item of content) {
      if (!item || typeof item !== "object") continue;
      const it = item;
      switch (it.type) {
        case "text":
          if (typeof it.text === "string" && it.text) parts.push({ text: it.text });
          break;
        case "image_url": {
          const url = it.image_url?.url;
          if (typeof url === "string" && url.startsWith("data:")) {
            const comma = url.indexOf(",");
            const meta = url.slice(5, comma);
            const data = url.slice(comma + 1);
            const mime = meta.split(";")[0] || "image/png";
            if (data) parts.push({ inlineData: { mime_type: mime, data } });
          }
          break;
        }
        case "input_audio": {
          const data = it.input_audio?.data;
          if (typeof data === "string" && data) {
            const fmt = String(it.input_audio?.format || "wav");
            const mime = fmt === "mp3" ? "audio/mpeg" : `audio/${fmt}`;
            parts.push({ inlineData: { mime_type: mime, data } });
          }
          break;
        }
      }
    }
  } else if (content && typeof content === "object" && typeof content.text === "string") {
    parts.push({ text: content.text });
  }
  return parts;
}
function generationConfigFrom(body, modelId) {
  const cfg = {};
  const num2 = (v) => typeof v === "number" && Number.isFinite(v) ? v : void 0;
  const temperature = num2(body.temperature);
  const topP = num2(body.top_p);
  const topK = num2(body.top_k);
  const maxTokens = num2(body.max_tokens) ?? num2(body.max_completion_tokens);
  if (temperature !== void 0) cfg.temperature = temperature;
  if (topP !== void 0) cfg.topP = topP;
  if (topK !== void 0) cfg.topK = topK;
  if (maxTokens !== void 0) {
    const cap = streamMaxOutputTokens(modelId);
    cfg.maxOutputTokens = cap !== void 0 ? Math.min(maxTokens, cap) : maxTokens;
  }
  const n = num2(body.n);
  if (n !== void 0 && n > 1) cfg.candidateCount = n;
  if (!/gpt-oss/i.test(modelId || "")) {
    const effort = body.reasoning_effort;
    if (typeof effort === "number") {
      cfg.thinkingConfig = { thinkingBudget: effort };
    } else if (typeof effort === "string" && effort.trim()) {
      const e = effort.trim().toLowerCase();
      cfg.thinkingConfig = e === "auto" ? { thinkingBudget: -1 } : { thinkingLevel: e };
    }
  }
  const rf = body.response_format;
  if (rf && typeof rf === "object") {
    const type = String(rf.type || "").toLowerCase();
    if (type === "json_object") {
      cfg.responseMimeType = "application/json";
    } else if (type === "json_schema") {
      cfg.responseMimeType = "application/json";
      const schema = rf.json_schema?.schema;
      if (schema) cfg.responseSchema = compatSanitize(schema);
    }
  }
  return cfg;
}
function toolConfigFrom(body) {
  const tc = body.tool_choice;
  if (!tc) return void 0;
  if (typeof tc === "string") {
    const mode = tc === "none" ? "NONE" : tc === "required" ? "ANY" : "AUTO";
    return { functionCallingConfig: { mode } };
  }
  if (typeof tc === "object" && tc.type === "function" && tc.function?.name) {
    return {
      functionCallingConfig: {
        mode: "ANY",
        allowedFunctionNames: [sanitizeToolName(String(tc.function.name))]
      }
    };
  }
  return void 0;
}
function toolsFrom(body, nameMap) {
  const tools = body.tools;
  if (!Array.isArray(tools) || tools.length === 0) return void 0;
  const declarations = [];
  for (const t of tools) {
    if (!t || typeof t !== "object") continue;
    const tt = t;
    if (tt.type === "function" && tt.function?.name) {
      const original = String(tt.function.name);
      const sanitized = sanitizeToolName(original);
      if (sanitized !== original) nameMap[sanitized] = original;
      const decl = { name: sanitized };
      if (tt.function.description) decl.description = String(tt.function.description);
      if (tt.function.parameters) {
        const cleaned = compatSanitize(tt.function.parameters);
        decl.parameters = stripUnsupportedSchemaKeys(cleaned);
      }
      declarations.push(decl);
    }
  }
  const out = [];
  if (declarations.length > 0) out.push({ functionDeclarations: declarations });
  for (const t of tools) {
    const tt = t;
    if (tt?.google_search) out.push({ googleSearch: {} });
    if (tt?.code_execution) out.push({ codeExecution: {} });
    if (tt?.url_context) out.push({ urlContext: {} });
  }
  return out.length > 0 ? out : void 0;
}
function openAIToGeminiRequest(body, opts) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const nameMap = {};
  const needsToolId = /claude|gpt-oss/i.test(opts?.modelId || "");
  const altToolIds = /* @__PURE__ */ new Map();
  let altToolSeq = 0;
  const upstreamToolId = (rawId) => {
    if (typeof rawId !== "string" || !rawId) return void 0;
    const sig = decodeSigId(rawId);
    if (!sig) return rawId;
    if (!needsToolId) return void 0;
    let id = altToolIds.get(rawId);
    if (!id) {
      altToolSeq += 1;
      id = `toolu_${altToolSeq.toString(36).padStart(2, "0")}`;
      altToolIds.set(rawId, id);
    }
    return id;
  };
  const id2name = /* @__PURE__ */ new Map();
  for (const m of messages) {
    if (m?.role === "assistant" && Array.isArray(m.tool_calls)) {
      for (const tc of m.tool_calls) {
        if (tc?.type === "function" && tc.id && tc.function?.name) {
          id2name.set(String(tc.id), String(tc.function.name));
        }
      }
    }
  }
  const systemParts = [];
  const contents = [];
  const handledToolIds = /* @__PURE__ */ new Set();
  let encounteredConversation = false;
  for (const m of messages) {
    const role = m?.role;
    if ((role === "system" || role === "developer") && messages.length > 1 && !encounteredConversation) {
      for (const p of contentToParts(m.content)) {
        if (typeof p.text === "string") systemParts.push({ text: p.text });
      }
      continue;
    }
    if (role === "user" || role === "system" || role === "developer") {
      encounteredConversation = true;
      const parts = contentToParts(m.content);
      if (parts.length > 0) contents.push({ role: "user", parts });
      continue;
    }
    if (role === "assistant") {
      encounteredConversation = true;
      const parts = [];
      if (!requiresSignedThinking(opts?.modelId) && typeof m.reasoning_content === "string" && m.reasoning_content) {
        parts.push({ text: m.reasoning_content, thought: true });
      }
      parts.push(...contentToParts(m.content));
      const toolCalls = Array.isArray(m.tool_calls) ? m.tool_calls : [];
      for (const tc of toolCalls) {
        if (tc?.type !== "function") continue;
        const original = String(tc.function?.name || "");
        if (!original) continue;
        const sanitized = sanitizeToolName(original);
        if (sanitized !== original) nameMap[sanitized] = original;
        let args = {};
        try {
          args = typeof tc.function?.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function?.arguments || {};
        } catch {
          args = {};
        }
        const part = { functionCall: { name: sanitized, args } };
        const sig = typeof tc.id === "string" ? decodeSigId(tc.id) : null;
        if (sig) part.thoughtSignature = sig;
        const toolId = upstreamToolId(tc.id);
        if (toolId) part.functionCall.id = toolId;
        parts.push(part);
      }
      if (parts.length > 0) contents.push({ role: "model", parts });
      if (toolCalls.length > 0) {
        const responseParts = [];
        for (const tc of toolCalls) {
          if (tc?.type !== "function") continue;
          const original = id2name.get(String(tc.id)) || String(tc.function?.name || "");
          if (!original) continue;
          const toolMsg = messages.find((x) => x?.role === "tool" && String(x.tool_call_id) === String(tc.id));
          if (toolMsg) handledToolIds.add(String(tc.id));
          const raw2 = toolMsg ? toolMsg.content : "{}";
          const result = typeof raw2 === "string" ? raw2 : JSON.stringify(raw2 ?? {});
          const respPart = {
            functionResponse: { name: sanitizeToolName(original), response: { result } }
          };
          const respToolId = upstreamToolId(tc.id);
          if (respToolId) respPart.functionResponse.id = respToolId;
          responseParts.push(respPart);
        }
        if (responseParts.length > 0) contents.push({ role: "user", parts: responseParts });
      }
      continue;
    }
    if (role === "tool") {
      if (m.tool_call_id && handledToolIds.has(String(m.tool_call_id))) continue;
      const name = sanitizeToolName(String(m.name || "tool"));
      const raw2 = m.content;
      const result = typeof raw2 === "string" ? raw2 : JSON.stringify(raw2 ?? {});
      const orphan = { functionResponse: { name, response: { result } } };
      if (typeof m.tool_call_id === "string" && m.tool_call_id) orphan.functionResponse.id = m.tool_call_id;
      contents.push({ role: "user", parts: [orphan] });
    }
  }
  if (contents.length > 0 && contents[0].role !== "user") {
    contents.unshift({ role: "user", parts: [{ text: "" }] });
  }
  const request = { contents };
  if (systemParts.length > 0) request.systemInstruction = { role: "user", parts: systemParts };
  const generationConfig = generationConfigFrom(body, opts?.modelId);
  if (Object.keys(generationConfig).length > 0) request.generationConfig = generationConfig;
  const tools = toolsFrom(body, nameMap);
  if (tools) request.tools = tools;
  const toolConfig = toolConfigFrom(body);
  if (toolConfig) request.toolConfig = toolConfig;
  request.safetySettings = SAFETY_SETTINGS;
  return { request, nameMap };
}
function unwrap(body) {
  if (body && typeof body === "object" && "response" in body) {
    return body.response;
  }
  return body || {};
}
function extractUsage(meta) {
  const n = (v) => Number(v) || 0;
  return {
    promptTokens: n(meta?.promptTokenCount),
    completionTokens: n(meta?.candidatesTokenCount),
    totalTokens: n(meta?.totalTokenCount),
    reasoningTokens: n(meta?.thoughtsTokenCount),
    cachedTokens: n(meta?.cachedContentTokenCount)
  };
}
function usageToOpenAI(u) {
  const usage = {
    prompt_tokens: u.promptTokens,
    completion_tokens: u.completionTokens,
    total_tokens: u.totalTokens || u.promptTokens + u.completionTokens
  };
  if (u.reasoningTokens > 0) usage.completion_tokens_details = { reasoning_tokens: u.reasoningTokens };
  if (u.cachedTokens > 0) usage.prompt_tokens_details = { cached_tokens: u.cachedTokens };
  return usage;
}
function finishReasonToOpenAI(reason, hasToolCall) {
  if (hasToolCall) return "tool_calls";
  switch ((reason || "").toUpperCase()) {
    case "MAX_TOKENS":
    case "MAX_OUTPUT_TOKENS":
      return "length";
    case "SAFETY":
    case "RECITATION":
    case "BLOCKLIST":
    case "PROHIBITED_CONTENT":
    case "SPII":
    case "IMAGE_SAFETY":
      return "content_filter";
    case "":
    case "STOP":
    case "FINISH_REASON_UNSPECIFIED":
    default:
      return "stop";
  }
}
function restoreName(nameMap, name) {
  if (!name) return "";
  return nameMap[name] || name;
}
function geminiResponseToOpenAI(body, requestedModel, nameMap, opts) {
  const data = unwrap(body);
  const candidate = Array.isArray(data.candidates) ? data.candidates[0] : void 0;
  const parts = candidate?.content?.parts || [];
  let content = "";
  let reasoning = "";
  const toolCalls = [];
  let hasToolCall = false;
  for (const part of parts) {
    if (typeof part.text === "string") {
      if (part.thought) reasoning += part.text;
      else content += part.text;
    } else if (part.functionCall) {
      hasToolCall = true;
      const name = restoreName(nameMap, part.functionCall.name);
      let args = "";
      try {
        args = JSON.stringify(part.functionCall.args ?? {});
      } catch {
        args = "{}";
      }
      const id = part.thoughtSignature ? encodeSigId(part.thoughtSignature) : part.functionCall.id || `call_${randomId2().replace(/-/g, "").slice(0, 24)}`;
      toolCalls.push({
        id,
        type: "function",
        function: { name, arguments: args }
      });
    }
  }
  const usage = extractUsage(data.usageMetadata);
  const message = { role: "assistant", content: content || (toolCalls.length > 0 ? null : "") };
  if (reasoning) message.reasoning_content = reasoning;
  if (toolCalls.length > 0) message.tool_calls = toolCalls;
  return {
    id: data.responseId || `chatcmpl-${randomId2().replace(/-/g, "").slice(0, 24)}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1e3),
    model: data.modelVersion || requestedModel,
    choices: [
      {
        index: candidate?.index ?? 0,
        message,
        finish_reason: finishReasonToOpenAI(candidate?.finishReason, hasToolCall),
        native_finish_reason: (candidate?.finishReason || "").toLowerCase() || null
      }
    ],
    usage: usageToOpenAI(usage)
  };
}
function createOpenAIStream(upstream, requestedModel, nameMap, onUsage, onEnd, opts) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let sentRole = false;
  let toolIndex = 0;
  let finishReason = "";
  let hasToolCall = false;
  let model = requestedModel;
  let id = `chatcmpl-${randomId2().replace(/-/g, "").slice(0, 24)}`;
  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, reasoningTokens: 0, cachedTokens: 0 };
  const emit = (controller, payload) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}

`));
  };
  const emitDelta = (controller, delta, finish) => {
    if (!sentRole && !("role" in delta)) delta = { role: "assistant", ...delta };
    if ("role" in delta) sentRole = true;
    emit(controller, {
      id,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1e3),
      model,
      choices: [{ index: 0, delta, finish_reason: finish }]
    });
  };
  const handleChunk = (controller, raw2) => {
    let parsed;
    try {
      parsed = JSON.parse(raw2);
    } catch {
      return;
    }
    const data = unwrap(parsed);
    if (data.responseId) id = data.responseId;
    if (data.modelVersion) model = data.modelVersion;
    if (data.usageMetadata) {
      usage = extractUsage(data.usageMetadata);
      onUsage(usage);
    }
    const candidate = Array.isArray(data.candidates) ? data.candidates[0] : void 0;
    if (!candidate) return;
    if (candidate.finishReason) finishReason = candidate.finishReason;
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (typeof part.text === "string" && part.text) {
        if (part.thought) emitDelta(controller, { reasoning_content: part.text }, null);
        else emitDelta(controller, { content: part.text }, null);
      } else if (part.functionCall) {
        hasToolCall = true;
        const name = restoreName(nameMap, part.functionCall.name);
        let args = "";
        try {
          args = JSON.stringify(part.functionCall.args ?? {});
        } catch {
          args = "{}";
        }
        const id2 = part.thoughtSignature ? encodeSigId(part.thoughtSignature) : part.functionCall.id || `call_${randomId2().replace(/-/g, "").slice(0, 24)}`;
        emitDelta(controller, {
          tool_calls: [
            {
              index: toolIndex++,
              id: id2,
              type: "function",
              function: { name, arguments: args }
            }
          ]
        }, null);
      }
    }
  };
  const processLine = (controller, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) return;
    if (!trimmed.startsWith("data:")) return;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    handleChunk(controller, payload);
  };
  return upstream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) processLine(controller, line);
      },
      flush(controller) {
        if (buffer) processLine(controller, buffer);
        emit(controller, {
          id,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1e3),
          model,
          choices: [{ index: 0, delta: {}, finish_reason: finishReasonToOpenAI(finishReason, hasToolCall) }]
        });
        emit(controller, {
          id,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1e3),
          model,
          choices: [],
          usage: usageToOpenAI(usage)
        });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        if (onEnd) onEnd(usage);
      }
    })
  );
}
var SAFETY_SETTINGS, SIG_ID_PREFIX, ZCODE_STRIP, UNSUPPORTED_SCHEMA_KEYS, AG_STREAM_MAX_OUTPUT;
var init_gemini_translate = __esm({
  "src/gemini-translate.ts"() {
    "use strict";
    SAFETY_SETTINGS = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
      { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
    ];
    SIG_ID_PREFIX = "csg1_";
    ZCODE_STRIP = /* @__PURE__ */ new Set([
      "$schema",
      "$id",
      "$ref",
      "$defs",
      "definitions",
      "$comment",
      "$anchor",
      "$dynamicRef",
      "$dynamicAnchor",
      "$vocabulary",
      "propertyNames",
      "patternProperties",
      "unevaluatedProperties",
      "unevaluatedItems",
      "contains",
      "dependencies",
      "dependentSchemas",
      "dependentRequired",
      "if",
      "then",
      "else",
      "not",
      "allOf",
      "oneOf",
      "additionalItems",
      "prefixItems",
      "uniqueItems",
      "exclusiveMinimum",
      "exclusiveMaximum",
      "multipleOf",
      "contentEncoding",
      "contentMediaType",
      "contentSchema",
      "title",
      "examples",
      "example",
      "default",
      "const",
      "deprecated",
      "readOnly",
      "writeOnly",
      "additionalProperties"
    ]);
    UNSUPPORTED_SCHEMA_KEYS = /* @__PURE__ */ new Set([
      "minItems",
      "maxItems",
      "minLength",
      "maxLength",
      "oneOf",
      "anyOf",
      "allOf",
      "not"
    ]);
    AG_STREAM_MAX_OUTPUT = [
      [/gpt-oss/i, 32768],
      [/gemini-3\.(6|7|8)-flash/i, 65536],
      [/gemini-3-flash|gemini-3\.1-flash-image/i, 65536],
      [/claude|gemini/i, 64e3]
    ];
  }
});

// src/antigravity.ts
var antigravity_exports = {};
__export(antigravity_exports, {
  agTierInfo: () => agTierInfo,
  buildAntigravityAuthUrl: () => buildAntigravityAuthUrl,
  exchangeAntigravityCode: () => exchangeAntigravityCode,
  fetchAntigravityModels: () => fetchAntigravityModels,
  fetchAntigravityQuota: () => fetchAntigravityQuota,
  handleAntigravityRequest: () => handleAntigravityRequest,
  orderByCooldown: () => orderByCooldown,
  parseAgAccount: () => parseAgAccount,
  parseQuotaResetMs: () => parseQuotaResetMs,
  testAntigravity: () => testAntigravity,
  testAntigravityRotating: () => testAntigravityRotating
});
function agClientCredential(env, key) {
  const value = env[key];
  if (!value) throw new Error(`\u672A\u914D\u7F6E ${key}\uFF0C\u8BF7\u5148\u6267\u884C wrangler secret put ${key} \u518D\u90E8\u7F72`);
  return value;
}
async function sha256Hex2(input) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomId3() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
function randomHex2(byteLength) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function errorResponse(message, status, type = "antigravity_error") {
  return new Response(JSON.stringify({ error: { message, type } }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
function agHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    Accept: "*/*",
    "User-Agent": AG_UA,
    "X-Goog-Api-Client": AG_GOOG_API_CLIENT
  };
}
async function buildAntigravityAuthUrl(env) {
  const state = randomHex2(32);
  await getKV(env).put(AG_STATE_PREFIX + state, "1", { expirationTtl: 600 });
  const params = new URLSearchParams({
    access_type: "offline",
    client_id: agClientCredential(env, "AG_CLIENT_ID"),
    prompt: "consent",
    redirect_uri: AG_REDIRECT_URI,
    response_type: "code",
    scope: AG_SCOPES.join(" "),
    state
  });
  return { url: `${AG_AUTH_ENDPOINT}?${params.toString()}`, state };
}
function extractCode(input) {
  const text = (input || "").trim();
  const match2 = text.match(/[?&]code=([^&\s]+)/);
  if (match2) return decodeURIComponent(match2[1]);
  return text;
}
async function exchangeAntigravityCode(env, codeOrUrl, state) {
  const kv = getKV(env);
  const marker = await kv.get(AG_STATE_PREFIX + state);
  if (!marker) {
    throw new Error("\u6388\u6743\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0810 \u5206\u949F\uFF09\uFF0C\u8BF7\u91CD\u65B0\u70B9\u51FB\u300C\u7528 Google \u8D26\u53F7\u6388\u6743\u300D");
  }
  const code = extractCode(codeOrUrl);
  if (!code) throw new Error("\u672A\u8BC6\u522B\u5230 code\uFF0C\u8BF7\u7C98\u8D34 Google \u8FD4\u56DE\u7684 code \u6216\u6574\u6BB5\u56DE\u8C03\u5730\u5740");
  const form = new URLSearchParams({
    code,
    client_id: agClientCredential(env, "AG_CLIENT_ID"),
    client_secret: agClientCredential(env, "AG_CLIENT_SECRET"),
    redirect_uri: AG_REDIRECT_URI,
    grant_type: "authorization_code"
  });
  const res = await fetch(OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`\u6362\u53D6 token \u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u6362\u53D6 token \u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!json.refresh_token) throw new Error("Google \u672A\u8FD4\u56DE refresh_token\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743\u5E76\u5728\u540C\u610F\u9875\u786E\u8BA4");
  await kv.delete(AG_STATE_PREFIX + state).catch(() => {
  });
  return { refreshToken: json.refresh_token };
}
async function getAccessToken(env, refreshToken) {
  const cached = await resolveAccessToken(env, AG_AT_PREFIX, refreshToken, (token) => refreshAntigravityToken(env, token));
  return cached.accessToken;
}
async function refreshAntigravityToken(env, refreshToken) {
  const form = new URLSearchParams({
    client_id: agClientCredential(env, "AG_CLIENT_ID"),
    client_secret: agClientCredential(env, "AG_CLIENT_SECRET"),
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });
  const res = await fetch(OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Antigravity OAuth \u5237\u65B0\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`OAuth \u5237\u65B0\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!json.access_token) throw new Error(`OAuth \u5237\u65B0\u672A\u8FD4\u56DE access_token: ${text.slice(0, 200)}`);
  return {
    accessToken: json.access_token,
    expiresIn: Number(json.expires_in) || 3600,
    refreshToken: json.refresh_token || void 0
  };
}
function extractProject(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") {
    const id = value.id;
    if (typeof id === "string" && id.trim()) return id.trim();
  }
  return "";
}
function extractProjectFromLoad(load) {
  for (const key of ["cloudaicompanionProject", "projectId", "project"]) {
    const found = extractProject(load?.[key]);
    if (found) return found;
  }
  return "";
}
function defaultTierId(load) {
  const tiers = Array.isArray(load?.allowedTiers) ? load.allowedTiers : [];
  const preferred = tiers.find((t) => t?.isDefault) || tiers[0];
  if (preferred?.id) return String(preferred.id);
  if (load?.currentTier?.id) return String(load.currentTier.id);
  return "free-tier";
}
async function resolveProjectId(env, accessToken, tokenHash, hint) {
  if (hint) return hint;
  const kv = getKV(env);
  const cacheKey = AG_PJ_PREFIX + tokenHash;
  const cached = await kv.get(cacheKey);
  if (cached) return cached;
  const loadRes = await fetch(`${AG_PROD_BASE}/${AG_API_VERSION}:loadCodeAssist`, {
    method: "POST",
    headers: agHeaders(accessToken),
    body: JSON.stringify({ metadata: { ideType: "ANTIGRAVITY" } }),
    signal: AbortSignal.timeout(3e4)
  });
  const loadText = await loadRes.text();
  if (!loadRes.ok) throw new Error(`loadCodeAssist \u5931\u8D25 HTTP ${loadRes.status}: ${loadText.slice(0, 200)}`);
  let load;
  try {
    load = JSON.parse(loadText);
  } catch {
    throw new Error(`loadCodeAssist \u8FD4\u56DE\u975E JSON: ${loadText.slice(0, 200)}`);
  }
  let projectId = extractProjectFromLoad(load);
  if (!projectId) {
    const tierId = defaultTierId(load);
    let op = await fetch(`${AG_GEN_BASE}/${AG_API_VERSION}:onboardUser`, {
      method: "POST",
      headers: agHeaders(accessToken),
      body: JSON.stringify({ tier_id: tierId, metadata: { ide_type: "ANTIGRAVITY", ide_version: AG_IDE_VERSION, ide_name: "antigravity" } }),
      signal: AbortSignal.timeout(3e4)
    }).then((r) => r.json()).catch(() => null);
    for (let i = 0; i < 5 && op && op.done !== true; i++) {
      await sleep(800);
      op = await fetch(`${AG_GEN_BASE}/${AG_API_VERSION}:onboardUser`, {
        method: "POST",
        headers: agHeaders(accessToken),
        body: JSON.stringify({ tier_id: tierId, metadata: { ide_type: "ANTIGRAVITY", ide_version: AG_IDE_VERSION, ide_name: "antigravity" } }),
        signal: AbortSignal.timeout(3e4)
      }).then((r) => r.json()).catch(() => null);
    }
    projectId = extractProject(op?.response?.cloudaicompanionProject);
  }
  if (!projectId) throw new Error("\u672A\u80FD\u89E3\u6790 Antigravity \u9879\u76EE ID\uFF08\u53EF\u5728\u6E20\u9053\u914D\u7F6E\u91CC\u624B\u52A8\u586B\u5199 project\uFF09");
  await kv.put(cacheKey, projectId, { expirationTtl: 86400 }).catch(() => {
  });
  return projectId;
}
function buildEnvelope(modelId, projectId, geminiRequest) {
  const request = { ...geminiRequest };
  delete request.safetySettings;
  const isImage = /image/i.test(modelId);
  request.sessionId = isImage ? void 0 : `-${randomHex2(8)}`;
  if (request.sessionId === void 0) delete request.sessionId;
  return {
    model: modelId,
    project: projectId,
    userAgent: "antigravity",
    requestType: isImage ? "image_gen" : "agent",
    requestId: isImage ? `image_gen/${Date.now()}/${randomId3()}/12` : `agent-${randomId3()}`,
    request
  };
}
async function readErrorBody2(res) {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    return json.error?.message || json.message || text;
  } catch {
    return text;
  }
}
async function recordUsage(p, usage, ok, status) {
  const record = {
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    provider: p.providerId,
    model: p.requestedModel,
    token: p.maskedToken,
    ok,
    status,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    latencyMs: Date.now() - p.startedAt
  };
  await addUsageRecord(p.env, record).catch(() => {
  });
}
function parseAgAccount(raw2) {
  const text = (raw2 || "").trim();
  const sep = text.indexOf("|");
  if (sep < 0) return { token: text };
  const project = text.slice(sep + 1).trim();
  return { token: text.slice(0, sep).trim(), project: project || void 0 };
}
function shuffleAccounts(list) {
  const arr = list.map((raw2, i) => {
    const { token, project } = parseAgAccount(raw2);
    return { token, project, index: i + 1 };
  }).filter((a) => a.token);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
async function readAgHealth(env, providerId) {
  try {
    const raw2 = await getKV(env).get(AG_HEALTH_KEY(providerId));
    return raw2 ? JSON.parse(raw2) : {};
  } catch {
    return {};
  }
}
async function writeAgHealth(env, providerId, health) {
  const now = Date.now();
  const kept = {};
  for (const [k, v] of Object.entries(health)) {
    if (v && v.cooldownUntil > now) kept[k] = v;
  }
  try {
    if (Object.keys(kept).length > 0) {
      await getKV(env).put(AG_HEALTH_KEY(providerId), JSON.stringify(kept));
    } else {
      await getKV(env).delete(AG_HEALTH_KEY(providerId));
    }
  } catch {
  }
}
function parseQuotaResetMs(text) {
  const m = /reset[s]?\s+in\s+(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i.exec(text || "");
  if (!m) return null;
  const h = Number(m[1] || 0);
  const mi = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  const ms = ((h * 60 + mi) * 60 + s) * 1e3;
  return ms > 0 ? ms : null;
}
function orderByCooldown(accounts, health) {
  const now = Date.now();
  const healthy = [];
  const probation = [];
  const cooling = [];
  for (const a of accounts) {
    const h = health[a.hash];
    if (!h?.cooldownUntil) healthy.push(a);
    else if (now >= h.cooldownUntil) probation.push(a);
    else cooling.push(a);
  }
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  };
  shuffle(healthy);
  shuffle(probation);
  shuffle(cooling);
  return [...healthy, ...probation, ...cooling];
}
async function handleAntigravityRequest(p) {
  const parsed = shuffleAccounts((p.refreshTokens || []).filter((t) => t && t.trim()));
  if (parsed.length === 0) {
    return errorResponse("\u8BE5 antigravity \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Key\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A Google \u8D26\u53F7\u7684 Antigravity refresh_token\uFF08\u53EF\u70B9\u300C\u7528 Google \u8D26\u53F7\u6388\u6743\u300D\u83B7\u53D6\uFF1B\u9700\u8981\u7ED9\u67D0\u4E2A\u8D26\u53F7\u5355\u72EC\u6307\u5B9A\u9879\u76EE ID \u65F6\u5199\u6210 refresh_token|\u9879\u76EEID\uFF09", 400, "configuration_error");
  }
  const accounts = await Promise.all(
    parsed.map(async (a) => ({ ...a, hash: await sha256Hex2(a.token) }))
  );
  const health = await readAgHealth(p.env, p.providerId);
  const ordered = orderByCooldown(accounts, health);
  let healthChanged = false;
  const coolingCount = ordered.filter((a) => {
    const h = health[a.hash];
    return !!h?.cooldownUntil && Date.now() < h.cooldownUntil;
  }).length;
  if (coolingCount > 0) {
    console.log(`[antigravity] ${p.providerId}: ${coolingCount}/${ordered.length} account(s) in cooldown, tried last`);
  }
  const markFailed = (hash, reason, cooldownMs) => {
    health[hash] = { cooldownUntil: Date.now() + cooldownMs, reason };
    healthChanged = true;
  };
  const markOk = (hash) => {
    if (health[hash]) {
      delete health[hash];
      healthChanged = true;
    }
  };
  const persistHealth = async () => {
    if (healthChanged) {
      healthChanged = false;
      await writeAgHealth(p.env, p.providerId, health);
    }
  };
  const wantStream = p.body?.stream === true;
  const translateOpts = { modelId: p.modelId };
  const { request: geminiRequest, nameMap } = openAIToGeminiRequest(p.body, translateOpts);
  let lastError = "";
  let lastStatus = 502;
  for (let i = 0; i < ordered.length; i++) {
    const { token: refreshToken, project: accountProject, index: accountIndex, hash } = ordered[i];
    try {
      const accessToken = await getAccessToken(p.env, refreshToken);
      const projectId = await resolveProjectId(p.env, accessToken, hash, accountProject || p.project);
      const envelope = buildEnvelope(p.modelId, projectId, geminiRequest);
      const url = `${AG_GEN_BASE}/${AG_API_VERSION}:${wantStream ? "streamGenerateContent?alt=sse" : "generateContent"}`;
      const upstream = await fetch(url, {
        method: "POST",
        headers: agHeaders(accessToken),
        body: JSON.stringify(envelope),
        signal: AbortSignal.timeout(3e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        const detail = (await readErrorBody2(upstream)).slice(0, 300);
        lastError = `HTTP ${upstream.status}: ${detail}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) {
          if (upstream.status === 429) {
            const reset = parseQuotaResetMs(detail);
            markFailed(hash, `429 ${detail.slice(0, 120)}`, reset ? reset + 6e4 : AG_COOLDOWN_QUOTA_MS);
          } else if (upstream.status === 401 || upstream.status === 403) {
            markFailed(hash, `${upstream.status} ${detail.slice(0, 120)}`, AG_COOLDOWN_AUTH_MS);
          } else {
            markFailed(hash, `${upstream.status} ${detail.slice(0, 120)}`, AG_COOLDOWN_TRANSIENT_MS);
          }
          continue;
        }
        await persistHealth();
        return errorResponse(lastError, upstream.status, "upstream_error");
      }
      markOk(hash);
      await persistHealth();
      if (wantStream && upstream.body) {
        const stream = createOpenAIStream(upstream.body, p.requestedModel, nameMap, () => {
        }, (finalUsage) => {
          const task = recordUsage(p, finalUsage, true, 200);
          if (p.waitUntil) {
            try {
              p.waitUntil(task);
            } catch {
              task.catch(() => {
              });
            }
          } else {
            task.catch(() => {
            });
          }
        }, translateOpts);
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive", "x-ag-account": String(accountIndex), "x-ag-cooldown": String(coolingCount) }
        });
      }
      const rawText = await upstream.text();
      let json;
      try {
        json = JSON.parse(rawText);
      } catch {
        return errorResponse(`\u4E0A\u6E38\u8FD4\u56DE\u975E JSON: ${rawText.slice(0, 200)}`, 502, "upstream_error");
      }
      const openai = geminiResponseToOpenAI(json, p.requestedModel, nameMap, translateOpts);
      const usage = extractUsage2(json);
      await recordUsage(p, usage, true, 200);
      return new Response(JSON.stringify(openai), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "x-ag-account": String(accountIndex), "x-ag-cooldown": String(coolingCount) }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      markFailed(hash, `exception ${lastError.slice(0, 120)}`, AG_COOLDOWN_TRANSIENT_MS);
      continue;
    }
  }
  await persistHealth();
  return errorResponse(`\u6240\u6709 Antigravity \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
function extractUsage2(body) {
  const data = body && typeof body === "object" && "response" in body ? body.response : body;
  const meta = data?.usageMetadata || {};
  const n = (v) => Number(v) || 0;
  return { promptTokens: n(meta.promptTokenCount), completionTokens: n(meta.candidatesTokenCount) };
}
async function testAntigravity(env, refreshToken, modelId, project) {
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
  try {
    const { token, project: accountProject } = parseAgAccount(refreshToken);
    if (!token) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
    const hash = await sha256Hex2(token);
    const accessToken = await getAccessToken(env, token);
    const projectId = await resolveProjectId(env, accessToken, hash, accountProject || project);
    const { request: geminiRequest } = openAIToGeminiRequest({ messages: [{ role: "user", content: "hi" }], max_tokens: 1 });
    const envelope = buildEnvelope(modelId, projectId, geminiRequest);
    const res = await fetch(`${AG_GEN_BASE}/${AG_API_VERSION}:generateContent`, {
      method: "POST",
      headers: agHeaders(accessToken),
      body: JSON.stringify(envelope),
      signal: AbortSignal.timeout(3e4)
    });
    if (res.ok) return { success: true, message: `\u8FDE\u63A5\u6210\u529F\uFF08project: ${projectId}\uFF09`, statusCode: 200 };
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody2(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
async function testAntigravityRotating(env, refreshTokens, modelId, project) {
  const list = (refreshTokens || []).filter((t) => t && t.trim());
  if (list.length === 0) return { success: false, message: "\u8BE5\u6E20\u9053\u672A\u914D\u7F6E\u4EFB\u4F55 refresh_token", statusCode: 0 };
  let last = { success: false, message: "\u8FDE\u63A5\u5931\u8D25", statusCode: 0 };
  for (let i = 0; i < list.length; i++) {
    const r = await testAntigravity(env, list[i].trim(), modelId, project);
    if (r.success) {
      return { ...r, keyIndex: i, message: list.length > 1 ? `${r.message} (\u8D26\u53F7 #${i + 1}/${list.length})` : r.message };
    }
    last = r;
    const st = r.statusCode || 0;
    if (st === 429 || st === 401 || st === 403 || st >= 500) continue;
    break;
  }
  return last;
}
async function fetchAntigravityModels(env, refreshToken) {
  try {
    const { token } = parseAgAccount(refreshToken);
    if (!token) return { success: false, models: [], message: "\u672A\u586B\u5199 refresh_token" };
    const accessToken = await getAccessToken(env, token);
    const res = await fetch(`${AG_GEN_BASE}/${AG_API_VERSION}:fetchAvailableModels`, {
      method: "POST",
      headers: agHeaders(accessToken),
      body: "{}",
      signal: AbortSignal.timeout(3e4)
    });
    const text = await res.text();
    if (!res.ok) return { success: false, models: [], message: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return { success: false, models: [], message: "\u8FD4\u56DE\u975E JSON" };
    }
    const ids = /* @__PURE__ */ new Set();
    const modelsObj = json?.models;
    if (modelsObj && typeof modelsObj === "object" && !Array.isArray(modelsObj)) {
      for (const key of Object.keys(modelsObj)) {
        if (/^(chat_|tab_)/i.test(key)) continue;
        if (/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(key)) ids.add(key);
      }
    }
    if (ids.size === 0) {
      const visit = (node, depth = 0) => {
        if (depth > 6 || node == null) return;
        if (Array.isArray(node)) {
          for (const v of node) visit(v, depth + 1);
          return;
        }
        if (typeof node === "object") {
          for (const [k, v] of Object.entries(node)) {
            if (typeof v === "string" && /^(id|name|model|modelId|model_id)$/.test(k) && /^[a-z0-9][a-z0-9._-]*$/i.test(v) && /gemini|claude|gpt|image|flash|pro/i.test(v)) {
              ids.add(v);
            } else {
              visit(v, depth + 1);
            }
          }
        }
      };
      visit(json);
    }
    return { success: true, models: [...ids].sort(), raw: ids.size === 0 ? json : void 0 };
  } catch (err) {
    return { success: false, models: [], message: err.message || "\u62C9\u53D6\u5931\u8D25" };
  }
}
function agTierInfo(load) {
  const cur = load?.currentTier;
  const paid = load?.paidTier;
  const allowed = Array.isArray(load?.allowedTiers) ? load.allowedTiers : [];
  const fallback = allowed.find((t) => t?.isDefault) || allowed[0];
  const inelig = Array.isArray(load?.ineligibleTiers) ? load.ineligibleTiers[0] : void 0;
  const str = (v) => typeof v === "string" && v.trim() ? v.trim() : void 0;
  const tierId = str(cur?.id) || str(fallback?.id);
  const paidTierId = str(paid?.id);
  const subscribed = !!paidTierId && paidTierId !== "free-tier" && paidTierId !== tierId;
  return {
    tier: str(cur?.name) || str(fallback?.name),
    tierId,
    paidTier: str(paid?.name),
    paidTierId,
    tierNote: subscribed ? void 0 : str(paid?.upgradeSubscriptionText),
    tierNoteUrl: subscribed ? void 0 : str(paid?.upgradeSubscriptionUri),
    ineligible: inelig ? `${str(inelig.reasonCode) || "INELIGIBLE"}: ${str(inelig.reasonMessage) || ""}`.trim() : void 0
  };
}
async function fetchAntigravityQuota(env, refreshTokens, project) {
  const entries = (refreshTokens || []).map((raw2) => parseAgAccount(raw2)).filter((e) => e.token);
  const withIdentity = entries.length <= 10;
  const out = new Array(entries.length);
  const CHUNK = 5;
  for (let start = 0; start < entries.length; start += CHUNK) {
    const group = entries.slice(start, start + CHUNK);
    const results = await Promise.all(group.map((entry, k) => fetchOneAgQuota(env, entry, start + k, project, withIdentity)));
    results.forEach((r, k) => {
      out[start + k] = r;
    });
  }
  return out;
}
async function fetchOneAgQuota(env, entry, index, channelProject, withIdentity) {
  const account = { index, ok: false, models: [] };
  try {
    const accessToken = await getAccessToken(env, entry.token);
    const hash = await sha256Hex2(entry.token);
    if (withIdentity) {
      try {
        const loadRes = await fetch(`${AG_PROD_BASE}/${AG_API_VERSION}:loadCodeAssist`, {
          method: "POST",
          headers: agHeaders(accessToken),
          body: JSON.stringify({ metadata: { ideType: "ANTIGRAVITY" } }),
          signal: AbortSignal.timeout(3e4)
        });
        if (loadRes.ok) {
          Object.assign(account, agTierInfo(await loadRes.json().catch(() => null)));
        }
      } catch {
      }
      try {
        const ui = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
          signal: AbortSignal.timeout(15e3)
        });
        if (ui.ok) {
          const info = await ui.json().catch(() => null);
          if (typeof info?.email === "string" && info.email.trim()) account.email = info.email.trim();
        }
      } catch {
      }
    }
    account.project = await resolveProjectId(env, accessToken, hash, entry.project || channelProject).catch(() => void 0);
    const res = await fetch(`${AG_GEN_BASE}/${AG_API_VERSION}:fetchAvailableModels`, {
      method: "POST",
      headers: agHeaders(accessToken),
      body: "{}",
      signal: AbortSignal.timeout(3e4)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 150)}`);
    const json = JSON.parse(await res.text());
    const modelsObj = json?.models;
    if (modelsObj && typeof modelsObj === "object" && !Array.isArray(modelsObj)) {
      for (const [id, m] of Object.entries(modelsObj)) {
        if (/^(chat_|tab_)/i.test(id)) continue;
        const qi = m?.quotaInfo || {};
        account.models.push({
          id,
          name: typeof m?.displayName === "string" ? m.displayName : void 0,
          remaining: typeof qi.remainingFraction === "number" ? qi.remainingFraction : null,
          resetTime: typeof qi.resetTime === "string" ? qi.resetTime : void 0,
          recommended: !!m?.recommended,
          supportsThinking: !!m?.supportsThinking
        });
      }
      account.models.sort((a, b) => a.id.localeCompare(b.id));
    }
    account.ok = true;
  } catch (err) {
    account.error = err.message || "\u67E5\u8BE2\u5931\u8D25";
  }
  return account;
}
var AG_HEALTH_PREFIX, AG_SCOPES, AG_AUTH_ENDPOINT, OAUTH_TOKEN_ENDPOINT, AG_REDIRECT_URI, AG_GEN_BASE, AG_PROD_BASE, AG_API_VERSION, AG_UA, AG_IDE_VERSION, AG_GOOG_API_CLIENT, AG_AT_PREFIX, AG_PJ_PREFIX, AG_STATE_PREFIX, AG_HEALTH_KEY, AG_COOLDOWN_QUOTA_MS, AG_COOLDOWN_AUTH_MS, AG_COOLDOWN_TRANSIENT_MS;
var init_antigravity = __esm({
  "src/antigravity.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    init_storage();
    init_gemini_translate();
    init_config();
    AG_HEALTH_PREFIX = KV_KEYS.AG_HEALTH_PREFIX;
    AG_SCOPES = [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/cclog",
      "https://www.googleapis.com/auth/experimentsandconfigs"
    ];
    AG_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    OAUTH_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    AG_REDIRECT_URI = "http://localhost:51121/oauth-callback";
    AG_GEN_BASE = "https://daily-cloudcode-pa.googleapis.com";
    AG_PROD_BASE = "https://cloudcode-pa.googleapis.com";
    AG_API_VERSION = "v1internal";
    AG_UA = "antigravity/hub/2.9.1 darwin/arm64";
    AG_IDE_VERSION = "2.9.1";
    AG_GOOG_API_CLIENT = "gl-node/22.21.1";
    AG_AT_PREFIX = "antigravity:at:";
    AG_PJ_PREFIX = "antigravity:pj:";
    AG_STATE_PREFIX = "antigravity:oauth:";
    AG_HEALTH_KEY = (providerId) => AG_HEALTH_PREFIX + providerId;
    AG_COOLDOWN_QUOTA_MS = 30 * 60 * 1e3;
    AG_COOLDOWN_AUTH_MS = 60 * 60 * 1e3;
    AG_COOLDOWN_TRANSIENT_MS = 5 * 60 * 1e3;
  }
});

// src/vertex.ts
var vertex_exports = {};
__export(vertex_exports, {
  buildVertexUrl: () => buildVertexUrl,
  handleVertexRequest: () => handleVertexRequest,
  parseVertexCredential: () => parseVertexCredential,
  signVertexJwt: () => signVertexJwt,
  testVertex: () => testVertex
});
function parseVertexCredential(raw2) {
  const text = (raw2 || "").trim();
  if (!text) return null;
  if (!text.startsWith("{")) {
    return { raw: text, apiKeyMode: true };
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    try {
      json = JSON.parse(text.replace(/\r?\n/g, "\\n"));
    } catch {
      return null;
    }
  }
  const privateKey = String(json.private_key || "").replace(/\\n/g, "\n").trim();
  const clientEmail = String(json.client_email || "").trim();
  const projectId = String(json.project_id || "").trim();
  if (!privateKey || !clientEmail || !projectId) return null;
  return { raw: text.replace(/\r?\n/g, "\\n"), clientEmail, privateKey, projectId, apiKeyMode: false };
}
async function sha256Hex3(input) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function base64Url(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function importServiceAccountKey(pem) {
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}
async function signVertexJwt(cred) {
  if (!cred.clientEmail || !cred.privateKey) throw new Error("\u670D\u52A1\u8D26\u53F7\u7F3A\u5C11 client_email / private_key");
  const now = Math.floor(Date.now() / 1e3);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: cred.clientEmail,
    scope: VERTEX_SCOPE,
    aud: OAUTH_TOKEN_ENDPOINT2,
    iat: now,
    exp: now + 3600
  }));
  const signingInput = `${header}.${claims}`;
  const key = await importServiceAccountKey(cred.privateKey);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64Url(new Uint8Array(signature))}`;
}
async function getVertexAccessToken(env, cred) {
  const cacheKey = AT_PREFIX + await sha256Hex3(cred.raw);
  const kv = getKV(env);
  const cached = await kv.get(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.accessToken && (parsed.expiresAt || 0) - 3e5 > Date.now()) return parsed.accessToken;
    } catch {
    }
  }
  const assertion = await signVertexJwt(cred);
  const res = await fetch(OAUTH_TOKEN_ENDPOINT2, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }).toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`\u6362\u53D6 access_token \u5931\u8D25: HTTP ${res.status}: ${text.slice(0, 200)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`access_token \u54CD\u5E94\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!json.access_token) throw new Error(`access_token \u7F3A\u5931: ${text.slice(0, 200)}`);
  const expiresAt = Date.now() + (Number(json.expires_in) || 3600) * 1e3;
  await kv.put(cacheKey, JSON.stringify({ accessToken: json.access_token, expiresAt }), { expirationTtl: 3500 }).catch(() => {
  });
  return json.access_token;
}
function normalizeLocation(location) {
  const loc = (location || "").trim() || DEFAULT_LOCATION;
  return loc;
}
function buildVertexUrl(model, location, action, apiKeyMode) {
  const loc = normalizeLocation(location);
  const suffix = action === "streamGenerateContent" ? ":streamGenerateContent?alt=sse" : ":generateContent";
  if (apiKeyMode) return `https://aiplatform.googleapis.com/${VERTEX_API_VERSION}/publishers/google/models/${model}${suffix}`;
  const host = loc === "global" ? "https://aiplatform.googleapis.com" : `https://${loc}-aiplatform.googleapis.com`;
  return `${host}/${VERTEX_API_VERSION}/publishers/google/models/${model}${suffix}`;
}
function errorResponse2(message, status, type = "vertex_error") {
  return new Response(JSON.stringify({ error: { message, type } }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
async function readErrorBody3(res) {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    return json.error?.message || json.message || text;
  } catch {
    return text;
  }
}
function extractUsage3(json) {
  const meta = json?.usageMetadata || {};
  const n = (v) => Number(v) || 0;
  return { promptTokens: n(meta.promptTokenCount), completionTokens: n(meta.candidatesTokenCount) };
}
function shuffleCredentials(list) {
  const arr = list.map((cred, i) => ({ cred, index: i + 1 }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
async function recordUsage2(p, usage, ok, status) {
  const record = {
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    provider: p.providerId,
    model: p.requestedModel,
    token: p.maskedToken,
    ok,
    status,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    latencyMs: Date.now() - p.startedAt
  };
  await addUsageRecord(p.env, record).catch(() => {
  });
}
async function handleVertexRequest(p) {
  const accounts = shuffleCredentials((p.credentials || []).map((c) => (c || "").trim()).filter(Boolean));
  if (accounts.length === 0) {
    return errorResponse2("\u8BE5 vertex \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Keys\u300D\u91CC\u586B\u5165 GCP \u670D\u52A1\u8D26\u53F7 JSON\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u53EF\u8F6E\u6362\uFF09\uFF0C\u6216 Vertex Express \u6A21\u5F0F\u7684 API Key", 400, "configuration_error");
  }
  const wantStream = p.body?.stream === true;
  const translateOpts = { modelId: p.modelId };
  const { request: geminiRequest, nameMap } = openAIToGeminiRequest(p.body, translateOpts);
  let lastError = "";
  let lastStatus = 502;
  for (let i = 0; i < accounts.length; i++) {
    const { cred: raw2, index: accountIndex } = accounts[i];
    try {
      const cred = parseVertexCredential(raw2);
      if (!cred) throw new Error("\u51ED\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u65E2\u4E0D\u662F\u670D\u52A1\u8D26\u53F7 JSON\uFF0C\u4E5F\u4E0D\u662F\u6709\u6548\u7684 API Key");
      const action = wantStream ? "streamGenerateContent" : "generateContent";
      const url = buildVertexUrl(p.modelId, p.location, action, cred.apiKeyMode);
      const headers = { "Content-Type": "application/json", Accept: "*/*" };
      if (cred.apiKeyMode) {
        headers["x-goog-api-key"] = cred.raw;
      } else {
        headers.Authorization = `Bearer ${await getVertexAccessToken(p.env, cred)}`;
      }
      const upstream = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(geminiRequest),
        signal: AbortSignal.timeout(3e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await readErrorBody3(upstream)).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        await recordUsage2(p, { promptTokens: 0, completionTokens: 0 }, false, upstream.status);
        return errorResponse2(lastError, upstream.status, "upstream_error");
      }
      if (wantStream && upstream.body) {
        const stream = createOpenAIStream(upstream.body, p.requestedModel, nameMap, () => {
        }, (finalUsage) => {
          const usage = finalUsage;
          const task = recordUsage2(p, { promptTokens: Number(usage?.promptTokens) || 0, completionTokens: Number(usage?.completionTokens) || 0 }, true, 200);
          if (p.waitUntil) {
            try {
              p.waitUntil(task);
            } catch {
              task.catch(() => {
              });
            }
          } else {
            task.catch(() => {
            });
          }
        }, translateOpts);
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive", "x-vertex-account": String(accountIndex) }
        });
      }
      const rawText = await upstream.text();
      let json;
      try {
        json = JSON.parse(rawText);
      } catch {
        return errorResponse2(`\u4E0A\u6E38\u8FD4\u56DE\u975E JSON: ${rawText.slice(0, 200)}`, 502, "upstream_error");
      }
      const openai = geminiResponseToOpenAI(json, p.requestedModel, nameMap, translateOpts);
      await recordUsage2(p, extractUsage3(json), true, 200);
      return new Response(JSON.stringify(openai), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "x-vertex-account": String(accountIndex) }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return errorResponse2(`\u6240\u6709 Vertex \u51ED\u636E\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function testVertex(env, raw2, model, location) {
  const cred = parseVertexCredential(raw2);
  if (!cred) return { success: false, message: "\u51ED\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u9700\u8981\u670D\u52A1\u8D26\u53F7 JSON\uFF08\u542B project_id / client_email / private_key\uFF09\u6216 API Key", statusCode: 0 };
  try {
    const headers = { "Content-Type": "application/json" };
    let who = "";
    if (cred.apiKeyMode) {
      headers["x-goog-api-key"] = cred.raw;
      who = "Express API Key";
    } else {
      const token = await getVertexAccessToken(env, cred);
      headers.Authorization = `Bearer ${token}`;
      who = `${cred.clientEmail} (project ${cred.projectId})`;
    }
    if (!model) return { success: true, message: `\u51ED\u636E\u6709\u6548\uFF1A${who}`, statusCode: 200 };
    const url = buildVertexUrl(model, location, "generateContent", cred.apiKeyMode);
    const body = openAIToGeminiRequest({ messages: [{ role: "user", content: "hi" }], max_tokens: 1 }).request;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(3e4) });
    if (res.ok) return { success: true, message: `\u8FDE\u63A5\u6210\u529F\uFF1A${who} \xB7 \u6A21\u578B ${model}`, statusCode: 200 };
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody3(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u6821\u9A8C\u5931\u8D25" };
  }
}
var OAUTH_TOKEN_ENDPOINT2, VERTEX_SCOPE, VERTEX_API_VERSION, DEFAULT_LOCATION, AT_PREFIX;
var init_vertex = __esm({
  "src/vertex.ts"() {
    "use strict";
    init_storage_adapter();
    init_storage();
    init_gemini_translate();
    OAUTH_TOKEN_ENDPOINT2 = "https://oauth2.googleapis.com/token";
    VERTEX_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
    VERTEX_API_VERSION = "v1";
    DEFAULT_LOCATION = "us-central1";
    AT_PREFIX = "vertex:at:";
  }
});

// src/devin-wire.ts
function parseError(n) {
  if (n >= 0) return null;
  switch (n) {
    case ERR_TRUNCATED:
      return new Error("unexpected EOF");
    case ERR_FIELD_NUMBER:
      return new Error("proto: invalid field number");
    case ERR_OVERFLOW:
      return new Error("proto: variable length integer overflow");
    case ERR_RESERVED:
      return new Error("proto: cannot parse reserved wire type");
    case ERR_END_GROUP:
      return new Error("proto: mismatching end group marker");
    default:
      return new Error("proto: parse error");
  }
}
function errText(n) {
  const e = parseError(n);
  return e === null ? "" : e.message;
}
function encodeTag(num2, typ) {
  return BigInt(num2) << 3n | BigInt(typ);
}
function decodeTag(x) {
  return [Number(BigInt.asIntN(32, x >> 3n)), Number(x & 7n)];
}
function utf8Encode(s) {
  return textEncoder.encode(s);
}
function utf8Decode(b) {
  return textDecoder.decode(b);
}
function toHex(b) {
  let out = "";
  for (let i = 0; i < b.length; i++) out += HEX_TABLE[b[i]];
  return out;
}
function consumeVarint(b, offset = 0) {
  let v = 0n;
  for (let i = 0; i < 10; i++) {
    if (offset + i >= b.length) return [0n, ERR_TRUNCATED];
    const c = b[offset + i];
    if (i === 9 && c > 1) return [0n, ERR_OVERFLOW];
    v |= BigInt(c & 127) << BigInt(7 * i);
    if (c < 128) return [v, i + 1];
  }
  return [0n, ERR_OVERFLOW];
}
function consumeTag(b, offset = 0) {
  const [v, n] = consumeVarint(b, offset);
  if (n < 0) return [0, 0, n];
  const [num2, typ] = decodeTag(v);
  if (num2 < 1) return [0, 0, ERR_FIELD_NUMBER];
  return [num2, typ, n];
}
function consumeBytes(b, offset = 0) {
  const [m, n] = consumeVarint(b, offset);
  if (n < 0) return [new Uint8Array(0), n];
  const start = offset + n;
  const remain = b.length - start;
  if (m > BigInt(remain)) return [new Uint8Array(0), ERR_TRUNCATED];
  const size = Number(m);
  return [b.subarray(start, start + size), n + size];
}
function consumeFixed32(b, offset = 0) {
  if (b.length - offset < 4) return [0, ERR_TRUNCATED];
  const dv = new DataView(b.buffer, b.byteOffset + offset, 4);
  return [dv.getUint32(0, true), 4];
}
function consumeFixed64(b, offset = 0) {
  if (b.length - offset < 8) return [0n, ERR_TRUNCATED];
  const dv = new DataView(b.buffer, b.byteOffset + offset, 8);
  const lo = BigInt(dv.getUint32(0, true));
  const hi = BigInt(dv.getUint32(4, true));
  return [hi << 32n | lo, 8];
}
function consumeFieldValue(num2, typ, b, offset = 0) {
  switch (typ) {
    case WIRE_VARINT: {
      const [, n] = consumeVarint(b, offset);
      return n;
    }
    case WIRE_FIXED32: {
      const [, n] = consumeFixed32(b, offset);
      return n;
    }
    case WIRE_FIXED64: {
      const [, n] = consumeFixed64(b, offset);
      return n;
    }
    case WIRE_BYTES: {
      const [, n] = consumeBytes(b, offset);
      return n;
    }
    case WIRE_START_GROUP:
      return consumeGroup(num2, b, offset);
    case WIRE_END_GROUP:
      return ERR_END_GROUP;
    default:
      return ERR_RESERVED;
  }
}
function consumeGroup(num2, b, offset) {
  let n = 0;
  while (offset + n < b.length) {
    const [fnum, ftyp, fn] = consumeTag(b, offset + n);
    if (fn < 0) return fn;
    n += fn;
    if (ftyp === WIRE_END_GROUP) {
      return fnum === num2 ? n : ERR_END_GROUP;
    }
    const vn = consumeFieldValue(fnum, ftyp, b, offset + n);
    if (vn < 0) return vn;
    n += vn;
  }
  return ERR_TRUNCATED;
}
function float64FromBits(bits) {
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setUint32(0, Number(bits & 0xffffffffn), true);
  dv.setUint32(4, Number(bits >> 32n & 0xffffffffn), true);
  return dv.getFloat64(0, true);
}
function float32FromBits(bits) {
  const buf = new ArrayBuffer(4);
  const dv = new DataView(buf);
  dv.setUint32(0, bits >>> 0, true);
  return dv.getFloat32(0, true);
}
function equalFold(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}
function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function concatBytes(a, b) {
  if (a.length === 0) return b.slice();
  if (b.length === 0) return a;
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}
function randomBytes(n) {
  try {
    const b = new Uint8Array(n);
    crypto.getRandomValues(b);
    return b;
  } catch {
    return null;
  }
}
function newUuid() {
  try {
    return crypto.randomUUID();
  } catch {
    const b = new Uint8Array(16);
    for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    b[6] = b[6] & 15 | 64;
    b[8] = b[8] & 63 | 128;
    const h = toHex(b);
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
}
function rotr(x, n) {
  return (x >>> n | x << 32 - n) >>> 0;
}
function sha256Bytes(data) {
  const h = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  const len = data.length;
  const total = (len + 8 >> 6) + 1 << 6;
  const bytes = new Uint8Array(total);
  bytes.set(data);
  bytes[len] = 128;
  const dv = new DataView(bytes.buffer);
  const bitLen = BigInt(len) * 8n;
  dv.setUint32(total - 8, Number(bitLen >> 32n & 0xffffffffn));
  dv.setUint32(total - 4, Number(bitLen & 0xffffffffn));
  const w = new Uint32Array(64);
  for (let off = 0; off < total; off += 64) {
    for (let t = 0; t < 16; t++) w[t] = dv.getUint32(off + t * 4);
    for (let t = 16; t < 64; t++) {
      const x = w[t - 15];
      const y = w[t - 2];
      const s0 = rotr(x, 7) ^ rotr(x, 18) ^ x >>> 3;
      const s1 = rotr(y, 17) ^ rotr(y, 19) ^ y >>> 10;
      w[t] = w[t - 16] + s0 + w[t - 7] + s1 >>> 0;
    }
    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e = h[4];
    let f = h[5];
    let g = h[6];
    let hh = h[7];
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = e & f ^ ~e & g;
      const t1 = hh + S1 + ch + SHA256_K[t] + w[t] >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj >>> 0;
      hh = g;
      g = f;
      f = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    h[0] = h[0] + a >>> 0;
    h[1] = h[1] + b >>> 0;
    h[2] = h[2] + c >>> 0;
    h[3] = h[3] + d >>> 0;
    h[4] = h[4] + e >>> 0;
    h[5] = h[5] + f >>> 0;
    h[6] = h[6] + g >>> 0;
    h[7] = h[7] + hh >>> 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setUint32(i * 4, h[i]);
  return out;
}
function generateDevinDeviceFingerprint(seed) {
  if (seed === "") {
    const b = randomBytes(DEVIN_FINGERPRINT_HEX_LEN / 2);
    if (b !== null) return toHex(b);
    seed = newUuid();
  }
  let out = "";
  let counter = 0;
  while (out.length < DEVIN_FINGERPRINT_HEX_LEN) {
    out += toHex(sha256Bytes(utf8Encode(`${seed}-${counter}`)));
    counter++;
  }
  return out.slice(0, DEVIN_FINGERPRINT_HEX_LEN);
}
function nextDevinSessionTurnIndex(sessionId) {
  const cleanId = sessionId.trim();
  if (cleanId === "") return 0;
  const current = sessionTurnCounters.get(cleanId) ?? 0;
  sessionTurnCounters.delete(cleanId);
  sessionTurnCounters.set(cleanId, current + 1);
  while (sessionTurnCounters.size > DEFAULT_MAX_SESSION_TURN_COUNTERS) {
    const oldest = sessionTurnCounters.keys().next().value;
    if (oldest === void 0) break;
    sessionTurnCounters.delete(oldest);
  }
  return current;
}
function wrapConnectEnvelope(protoBytes) {
  return wrapConnectEnvelopeWithFlag(CONNECT_FLAG_DATA, protoBytes);
}
function wrapConnectEnvelopeWithFlag(flag, protoBytes) {
  const out = new Uint8Array(5 + protoBytes.length);
  out[0] = flag & 255;
  new DataView(out.buffer).setUint32(1, protoBytes.length, false);
  out.set(protoBytes, 5);
  return out;
}
function readConnectFrame(buffer) {
  if (buffer.length < 5) return null;
  const flag = buffer[0];
  if (flag !== CONNECT_FLAG_DATA && flag !== CONNECT_FLAG_COMPRESSED && flag !== CONNECT_FLAG_END_STREAM && flag !== (CONNECT_FLAG_COMPRESSED | CONNECT_FLAG_END_STREAM)) {
    throw new Error(`invalid connect frame flag: 0x${flag.toString(16).padStart(2, "0")}`);
  }
  const length = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength).getUint32(1, false);
  if (length > MAX_CONNECT_FRAME_SIZE) {
    throw new Error(
      `connect frame length ${length} exceeds maximum limit (${MAX_CONNECT_FRAME_SIZE})`
    );
  }
  if (buffer.length < 5 + length) return null;
  return { flag, payload: buffer.slice(5, 5 + length), consumed: 5 + length };
}
async function gunzipBytes(data) {
  let ds;
  try {
    ds = new DecompressionStream("gzip");
  } catch (e) {
    throw new Error(`decompress gzip connect frame: ${String(e)}`);
  }
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();
  const pump = (async () => {
    try {
      await writer.write(data);
      await writer.close();
    } catch {
    }
  })();
  const chunks = [];
  let total = 0;
  let failure = null;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_DECOMPRESSED_FRAME_SIZE) {
        failure = new Error(
          `decompressed frame size exceeds maximum limit (${MAX_DECOMPRESSED_FRAME_SIZE})`
        );
        await reader.cancel().catch(() => void 0);
        break;
      }
      chunks.push(value);
    }
  } catch (e) {
    failure = new Error(`decompress gzip connect frame: ${String(e)}`);
  }
  await pump;
  if (failure) throw failure;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}
function buildDevinClientMetadataBytes(sessionToken, deviceSeed, osName) {
  const os = osName === "" ? DEVIN_DEFAULT_OS_NAME : osName;
  const deviceFingerprint = generateDevinDeviceFingerprint(deviceSeed);
  const w = new ProtoWriter(1024);
  w.appendTag(1, WIRE_BYTES);
  w.appendString("devin-cli");
  w.appendTag(2, WIRE_BYTES);
  w.appendString(DEVIN_DEFAULT_CLIENT_VERSION);
  w.appendTag(3, WIRE_BYTES);
  w.appendString(sessionToken);
  w.appendTag(4, WIRE_BYTES);
  w.appendString("en");
  w.appendTag(5, WIRE_BYTES);
  w.appendString(os);
  w.appendTag(7, WIRE_BYTES);
  w.appendString(DEVIN_DEFAULT_CLIENT_VERSION);
  w.appendTag(12, WIRE_BYTES);
  w.appendString(DEVIN_DEFAULT_CLIENT_NAME);
  w.appendTag(28, WIRE_BYTES);
  w.appendString(DEVIN_DEFAULT_CLIENT_NAME);
  w.appendTag(31, WIRE_BYTES);
  w.appendString(deviceFingerprint);
  return w.bytes();
}
function buildDevinGetChatMessageRequest(args) {
  let maxTokens = args.maxTokens;
  if (maxTokens <= 0) maxTokens = DEVIN_DEFAULT_MAX_TOKENS;
  let sessionID = args.sessionId ?? "";
  if (sessionID === "") sessionID = newUuid();
  let cascadeID = args.cascadeId ?? "";
  if (cascadeID === "") cascadeID = sessionID;
  const osName = args.osName && args.osName !== "" ? args.osName : DEVIN_DEFAULT_OS_NAME;
  const prompts = args.prompts ?? [];
  const tools = args.tools ?? [];
  const matcher = args.matcher ?? (args.sensitiveWords && args.sensitiveWords.length > 0 ? buildSensitiveWordMatcher(args.sensitiveWords) : null);
  const w = new ProtoWriter(4096);
  const f1Bytes = buildDevinClientMetadataBytes(args.sessionToken, args.deviceSeed, osName);
  w.appendTag(1, WIRE_BYTES);
  w.appendBytes(f1Bytes);
  if (args.systemPrompt !== "") {
    const sanitized = sanitizeDevinSystemPrompt(args.systemPrompt, matcher);
    if (sanitized !== "") {
      w.appendTag(2, WIRE_BYTES);
      w.appendString(sanitized);
    }
  }
  for (const p of prompts) {
    const pw = new ProtoWriter(1024);
    let msgId = p.messageId ?? "";
    if (msgId === "") msgId = newUuid();
    pw.appendTag(1, WIRE_BYTES);
    pw.appendString(msgId);
    let source = p.source ?? 0;
    if (source <= 0) source = 1;
    pw.appendTag(2, WIRE_VARINT);
    pw.appendVarint(source);
    pw.appendTag(3, WIRE_BYTES);
    pw.appendString(p.content ?? p.text ?? "");
    for (const tc of p.toolCalls ?? []) {
      const tw = new ProtoWriter(256);
      if (tc.id !== void 0 && tc.id !== "") {
        tw.appendTag(1, WIRE_BYTES);
        tw.appendString(tc.id);
      }
      if (tc.name !== void 0 && tc.name !== "") {
        tw.appendTag(2, WIRE_BYTES);
        tw.appendString(tc.name);
      }
      if (tc.arguments !== void 0 && tc.arguments !== "") {
        tw.appendTag(3, WIRE_BYTES);
        tw.appendString(tc.arguments);
      }
      pw.appendTag(6, WIRE_BYTES);
      pw.appendBytes(tw.bytes());
    }
    if (p.toolCallId !== void 0 && p.toolCallId !== "") {
      pw.appendTag(7, WIRE_BYTES);
      pw.appendString(p.toolCallId);
    }
    for (const img of p.images ?? []) {
      const data = (img.base64Data ?? img.data ?? "").trim();
      if (data === "") continue;
      const iw = new ProtoWriter(256);
      iw.appendTag(1, WIRE_BYTES);
      iw.appendString(data);
      let mime = (img.mimeType ?? img.mime ?? "").trim();
      if (mime === "") mime = "image/png";
      iw.appendTag(2, WIRE_BYTES);
      iw.appendString(mime);
      pw.appendTag(10, WIRE_BYTES);
      pw.appendBytes(iw.bytes());
    }
    if (p.thinking !== void 0 && p.thinking !== "") {
      pw.appendTag(11, WIRE_BYTES);
      pw.appendString(p.thinking);
    }
    if (p.signature !== void 0 && p.signature.length > 0) {
      pw.appendTag(12, WIRE_BYTES);
      pw.appendBytes(p.signature);
    }
    if (p.signatureType !== void 0 && p.signatureType !== "") {
      pw.appendTag(18, WIRE_BYTES);
      pw.appendString(p.signatureType);
    }
    w.appendTag(3, WIRE_BYTES);
    w.appendBytes(pw.bytes());
  }
  w.appendTag(7, WIRE_VARINT);
  w.appendVarint(5);
  const f8 = new ProtoWriter(64);
  f8.appendTag(1, WIRE_VARINT);
  f8.appendVarint(1);
  f8.appendTag(2, WIRE_VARINT);
  f8.appendVarint(maxTokens);
  f8.appendTag(3, WIRE_VARINT);
  f8.appendVarint(400);
  const tempVal = args.temperature === void 0 || args.temperature === null ? 1 : args.temperature;
  f8.appendTag(5, WIRE_FIXED64);
  f8.appendFixed64(tempVal);
  f8.appendTag(7, WIRE_VARINT);
  f8.appendVarint(40);
  f8.appendTag(8, WIRE_FIXED64);
  f8.appendFixed64(Math.fround(0.95));
  w.appendTag(8, WIRE_BYTES);
  w.appendBytes(f8.bytes());
  for (const tool of tools) {
    const tw = new ProtoWriter(512);
    if (tool.name !== "") {
      tw.appendTag(1, WIRE_BYTES);
      tw.appendString(tool.name);
    }
    let desc = tool.description ?? "";
    if (desc.includes("Takes a task_id parameter identifying the task")) {
      desc = desc.split("Takes a task_id parameter identifying the task").join("Takes a taskId parameter identifying the task");
    }
    if (desc !== "") {
      tw.appendTag(2, WIRE_BYTES);
      tw.appendString(desc);
    }
    const params = tool.parameters ?? (tool.parametersJson ? utf8Encode(tool.parametersJson) : new Uint8Array(0));
    if (params.length > 0) {
      tw.appendTag(3, WIRE_BYTES);
      tw.appendBytes(params);
    }
    w.appendTag(10, WIRE_BYTES);
    w.appendBytes(tw.bytes());
  }
  const turnIndex = nextDevinSessionTurnIndex(sessionID);
  const f15 = new ProtoWriter(128);
  f15.appendTag(1, WIRE_BYTES);
  f15.appendString(sessionID);
  if (turnIndex > 0) {
    f15.appendTag(2, WIRE_VARINT);
    f15.appendVarint(turnIndex);
  }
  f15.appendTag(3, WIRE_VARINT);
  f15.appendVarint(4);
  const lastSource = prompts.length > 0 ? prompts[prompts.length - 1].source ?? 0 : 0;
  if (prompts.length > 0 && lastSource === 1) {
    const prevSource = prompts.length >= 2 ? prompts[prompts.length - 2].source ?? 0 : 0;
    if (turnIndex === 0 || prompts.length < 2 || prevSource !== 1) {
      f15.appendTag(4, WIRE_VARINT);
      f15.appendVarint(14);
    }
  }
  w.appendTag(15, WIRE_BYTES);
  w.appendBytes(f15.bytes());
  w.appendTag(16, WIRE_BYTES);
  w.appendString(cascadeID);
  w.appendTag(20, WIRE_VARINT);
  w.appendVarint(1);
  w.appendTag(21, WIRE_BYTES);
  w.appendString(args.chatModelUid);
  return w.bytes();
}
function compileSensitiveRegex(words) {
  if (words.length === 0) return null;
  const valid = [];
  for (const raw2 of words) {
    const word = raw2.trim();
    if (Array.from(word).length >= 2 && !word.includes(ZERO_WIDTH_SPACE)) valid.push(word);
  }
  if (valid.length === 0) return null;
  valid.sort((a, b) => b.length - a.length);
  const pattern = valid.map(escapeRegExp).join("|");
  try {
    return new RegExp(pattern, "gi");
  } catch {
    return null;
  }
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function obfuscateWord(word) {
  if (word.includes(ZERO_WIDTH_SPACE)) return word;
  const runes = Array.from(word);
  if (runes.length < 2) return word;
  return runes[0] + ZERO_WIDTH_SPACE + runes.slice(1).join("");
}
function buildSensitiveWordMatcher(words) {
  return new SensitiveWordMatcher(words);
}
function isClaudeCodeAttributionSystemText(text) {
  return text.replace(/^\s+/, "").startsWith("x-anthropic-billing-header:");
}
function sanitizeDevinSystemPrompt(prompt, matcher) {
  if (prompt === "") return "";
  let m = null;
  if (matcher instanceof SensitiveWordMatcher) m = matcher;
  else if (Array.isArray(matcher) && matcher.length > 0) m = buildSensitiveWordMatcher(matcher);
  const normalized = prompt.split("\r\n").join("\n");
  const lines = normalized.split("\n");
  const kept = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (isClaudeCodeAttributionSystemText(trimmed)) continue;
    if (trimmed.startsWith("You are Claude Code")) continue;
    if (trimmed.includes("authorized security testing") || trimmed.includes("destructive techniques, DoS attacks")) continue;
    if (trimmed.includes("Claude Code is available as a CLI")) continue;
    if (trimmed.includes("Fast mode for Claude Code")) continue;
    if (m !== null && m.matches(trimmed)) continue;
    kept.push(line);
  }
  let res = kept.join("\n").trim();
  if (m !== null && res !== "") res = m.obfuscateText(res);
  return res;
}
function emptyFrameResult() {
  return {
    outputId: "",
    timestamp: 0,
    contentText: "",
    deltaTokens: 0,
    stopReason: 0,
    toolCallDeltas: [],
    thinkingText: "",
    deltaSignature: new Uint8Array(0),
    deltaSignatureType: "",
    latency: 0,
    messageId: "",
    usage: null,
    responseDimensionGroups: [],
    unknownFieldNumbers: []
  };
}
function parseDevinFrame(payload) {
  const res = emptyFrameResult();
  const textParts = [];
  const thinkingParts = [];
  let pos = 0;
  while (pos < payload.length) {
    const [num2, typ, n] = consumeTag(payload, pos);
    if (n <= 0) {
      throw new DevinWireError(
        `consume tag error at offset ${pos}: ${errText(n)}`,
        finalizeFrame(res, textParts, thinkingParts)
      );
    }
    pos += n;
    switch (typ) {
      case WIRE_VARINT: {
        const [v, vn] = consumeVarint(payload, pos);
        if (vn <= 0) {
          throw new DevinWireError(
            `consume varint error at offset ${pos}: ${errText(vn)}`,
            finalizeFrame(res, textParts, thinkingParts)
          );
        }
        pos += vn;
        switch (num2) {
          case 2:
            res.timestamp = Number(v);
            break;
          case 4:
            res.deltaTokens = Number(v);
            break;
          case 5:
            res.stopReason = Number(v);
            break;
        }
        break;
      }
      case WIRE_FIXED64: {
        const [v, fn] = consumeFixed64(payload, pos);
        if (fn <= 0) {
          throw new DevinWireError(
            `consume fixed64 error at offset ${pos}: ${errText(fn)}`,
            finalizeFrame(res, textParts, thinkingParts)
          );
        }
        pos += fn;
        if (num2 === 12) res.latency = float64FromBits(v);
        break;
      }
      case WIRE_FIXED32: {
        const [, fn] = consumeFixed32(payload, pos);
        if (fn <= 0) {
          throw new DevinWireError(
            `consume fixed32 error at offset ${pos}: ${errText(fn)}`,
            finalizeFrame(res, textParts, thinkingParts)
          );
        }
        pos += fn;
        break;
      }
      case WIRE_BYTES: {
        const [val, bn] = consumeBytes(payload, pos);
        if (bn <= 0) {
          throw new DevinWireError(
            `consume bytes error at offset ${pos}: ${errText(bn)}`,
            finalizeFrame(res, textParts, thinkingParts)
          );
        }
        pos += bn;
        switch (num2) {
          case 1:
            res.outputId = utf8Decode(val);
            break;
          case 2:
            res.timestamp = parseDevinTimestamp(val);
            break;
          case 3:
            textParts.push(utf8Decode(val));
            break;
          case 6: {
            const tc = parseDevinToolCallDelta(val);
            if (tc.error === void 0) res.toolCallDeltas.push(tc);
            break;
          }
          case 7:
            res.usage = parseDevinUsageField(val);
            break;
          case 9:
            thinkingParts.push(utf8Decode(val));
            break;
          case 10:
            res.deltaSignature = concatBytes(res.deltaSignature, val);
            break;
          case 17:
            res.messageId = utf8Decode(val);
            break;
          case 21:
            res.deltaSignatureType = utf8Decode(val);
            break;
          case 28:
            res.responseDimensionGroups.push(val);
            break;
          default:
            res.unknownFieldNumbers.push(num2);
            break;
        }
        break;
      }
      default:
        throw new DevinWireError(
          `unsupported wire type ${typ} at offset ${pos}`,
          finalizeFrame(res, textParts, thinkingParts)
        );
    }
  }
  return finalizeFrame(res, textParts, thinkingParts);
}
function finalizeFrame(res, textParts, thinkingParts) {
  if (textParts.length > 0) res.contentText = textParts.join("");
  if (thinkingParts.length > 0) res.thinkingText = thinkingParts.join("");
  res.text = res.contentText;
  res.thinking = res.thinkingText;
  res.toolCalls = res.toolCallDeltas;
  res.dimensionGroups = res.responseDimensionGroups;
  return res;
}
function parseDevinToolCallDelta(data) {
  const tc = { id: "", name: "", arguments: "", index: 0 };
  let pos = 0;
  while (pos < data.length) {
    const [num2, typ, n] = consumeTag(data, pos);
    if (n <= 0) {
      tc.error = errText(n);
      return tc;
    }
    pos += n;
    switch (typ) {
      case WIRE_VARINT: {
        const [v, vn] = consumeVarint(data, pos);
        if (vn <= 0) {
          tc.error = errText(vn);
          return tc;
        }
        pos += vn;
        if (num2 === 4) tc.index = Number(v);
        break;
      }
      case WIRE_BYTES: {
        const [val, bn] = consumeBytes(data, pos);
        if (bn <= 0) {
          tc.error = errText(bn);
          return tc;
        }
        pos += bn;
        switch (num2) {
          case 1:
            tc.id = utf8Decode(val);
            break;
          case 2:
            tc.name = utf8Decode(val);
            break;
          case 3:
            tc.arguments = utf8Decode(val);
            break;
        }
        break;
      }
      default: {
        const nSkip = consumeFieldValue(num2, typ, data, pos);
        if (nSkip <= 0) {
          tc.error = errText(nSkip);
          return tc;
        }
        pos += nSkip;
        break;
      }
    }
  }
  return tc;
}
function parseDevinTimestamp(data) {
  let pos = 0;
  let secs = 0;
  while (pos < data.length) {
    const [num2, typ, n] = consumeTag(data, pos);
    if (n <= 0) break;
    pos += n;
    if (typ === WIRE_VARINT) {
      const [v, vn] = consumeVarint(data, pos);
      if (vn <= 0) break;
      pos += vn;
      if (num2 === 1) secs = Number(v);
    } else {
      break;
    }
  }
  return secs;
}
function parseDevinHeaderField(data) {
  let key = "";
  let val = "";
  let pos = 0;
  while (pos < data.length) {
    const [num2, typ, n] = consumeTag(data, pos);
    if (n <= 0) break;
    pos += n;
    switch (typ) {
      case WIRE_BYTES: {
        const [b, bn] = consumeBytes(data, pos);
        if (bn <= 0) return { key, val };
        pos += bn;
        if (num2 === 1) key = utf8Decode(b);
        else if (num2 === 2) val = utf8Decode(b);
        break;
      }
      default: {
        const nSkip = consumeFieldValue(num2, typ, data, pos);
        if (nSkip <= 0) return { key, val };
        pos += nSkip;
        break;
      }
    }
  }
  return { key, val };
}
function parseDevinUsageField(data) {
  const u = {
    promptTokens: 0,
    completionTokens: 0,
    cachedTokens: 0,
    statusCode: 0,
    requestId: "",
    modelName: "",
    headers: null
  };
  let pos = 0;
  while (pos < data.length) {
    const [num2, typ, n] = consumeTag(data, pos);
    if (n <= 0) break;
    pos += n;
    switch (typ) {
      case WIRE_VARINT: {
        const [v, vn] = consumeVarint(data, pos);
        if (vn <= 0) return u;
        pos += vn;
        switch (num2) {
          case 2:
            u.promptTokens += Number(v);
            break;
          case 3:
            u.completionTokens = Number(v);
            break;
          case 4:
            u.promptTokens += Number(v);
            break;
          case 5:
            u.cachedTokens = Number(v);
            break;
          case 6:
            u.statusCode = Number(v);
            break;
        }
        break;
      }
      case WIRE_BYTES: {
        const [val, bn] = consumeBytes(data, pos);
        if (bn <= 0) return u;
        pos += bn;
        if (num2 === 8) {
          const { key, val: headerVal } = parseDevinHeaderField(val);
          if (key !== "") {
            if (u.headers === null) u.headers = {};
            u.headers[key] = headerVal;
            if ((equalFold(key, "x-request-id") || equalFold(key, "request-id")) && headerVal !== "") {
              u.requestId = headerVal;
            }
          } else if (val.length > 0 && isPrintableASCII(val) && u.requestId === "") {
            u.requestId = utf8Decode(val);
          }
        } else if (num2 === 9) {
          u.modelName = utf8Decode(val);
        }
        break;
      }
      case WIRE_FIXED64: {
        const [, fn] = consumeFixed64(data, pos);
        if (fn <= 0) return u;
        pos += fn;
        break;
      }
      case WIRE_FIXED32: {
        const [, fn] = consumeFixed32(data, pos);
        if (fn <= 0) return u;
        pos += fn;
        break;
      }
      default: {
        const nSkip = consumeFieldValue(num2, typ, data, pos);
        if (nSkip <= 0) return u;
        pos += nSkip;
        break;
      }
    }
  }
  return u;
}
function isPrintableASCII(b) {
  for (let i = 0; i < b.length; i++) {
    const c = b[i];
    if (c < 32 || c > 126) return false;
  }
  return true;
}
function parseDevinResponseDimensionGroups(groups) {
  let promptTokens = 0;
  let completionTokens = 0;
  let cachedTokens = 0;
  let found = false;
  for (let gBytes of groups) {
    if (gBytes.length === 0) continue;
    const [envelopeNum, envelopeTyp, envelopeN] = consumeTag(gBytes, 0);
    if (envelopeN > 0 && envelopeNum === 28 && envelopeTyp === WIRE_BYTES) {
      const [inner, bn] = consumeBytes(gBytes, envelopeN);
      if (bn > 0) gBytes = inner;
    }
    let gPos = 0;
    let title = "";
    const metrics = [];
    while (gPos < gBytes.length) {
      const [gNum, gTyp, gn] = consumeTag(gBytes, gPos);
      if (gn <= 0) break;
      gPos += gn;
      if (gTyp !== WIRE_BYTES) {
        const gSkip = consumeFieldValue(gNum, gTyp, gBytes, gPos);
        if (gSkip <= 0) break;
        gPos += gSkip;
        continue;
      }
      const [gb, gbn] = consumeBytes(gBytes, gPos);
      if (gbn <= 0) break;
      gPos += gbn;
      if (gNum === 1) {
        title = utf8Decode(gb);
      } else if (gNum === 2) {
        let mPos = 0;
        let mKey = "";
        let mVal = 0;
        while (mPos < gb.length) {
          const [mNum, mTyp, mn] = consumeTag(gb, mPos);
          if (mn <= 0) break;
          mPos += mn;
          if (mTyp !== WIRE_BYTES) {
            const mSkip = consumeFieldValue(mNum, mTyp, gb, mPos);
            if (mSkip <= 0) break;
            mPos += mSkip;
            continue;
          }
          const [mb, mbn] = consumeBytes(gb, mPos);
          if (mbn <= 0) break;
          mPos += mbn;
          if (mNum === 5) {
            mKey = utf8Decode(mb);
          } else if (mNum === 4) {
            let dPos = 0;
            while (dPos < mb.length) {
              const [dNum, dTyp, dn] = consumeTag(mb, dPos);
              if (dn <= 0) break;
              dPos += dn;
              if (dTyp === WIRE_FIXED32) {
                const [dv, dfn] = consumeFixed32(mb, dPos);
                if (dfn <= 0) break;
                dPos += dfn;
                if (dNum === 2) mVal = float32FromBits(dv);
              } else {
                const dSkip = consumeFieldValue(dNum, dTyp, mb, dPos);
                if (dSkip <= 0) break;
                dPos += dSkip;
              }
            }
          }
        }
        if (mKey !== "") metrics.push({ key: mKey, val: mVal });
      }
    }
    if (equalFold(title, "Token Usage")) {
      for (const m of metrics) {
        switch (m.key) {
          case "input_tokens":
            promptTokens = Math.trunc(m.val);
            found = true;
            break;
          case "output_tokens":
            completionTokens = Math.trunc(m.val);
            found = true;
            break;
          case "cached_input_tokens":
            cachedTokens = Math.trunc(m.val);
            found = true;
            break;
        }
      }
      if (found) return { promptTokens, completionTokens, cachedTokens, found: true };
    }
  }
  return { promptTokens, completionTokens, cachedTokens, found };
}
function parseDevinTrailerError(payload) {
  const trimmed = trimBytes(payload);
  if (trimmed.length === 0 || bytesEqual(trimmed, utf8Encode("{}"))) return { statusCode: 0 };
  let parsed;
  try {
    parsed = JSON.parse(utf8Decode(trimmed));
  } catch {
    return { statusCode: 0 };
  }
  if (typeof parsed !== "object" || parsed === null) return { statusCode: 0 };
  const errField = parsed.error;
  if (typeof errField !== "object" || errField === null) return { statusCode: 0 };
  const errObj = errField;
  const codeRaw = errObj.code;
  const msgRaw = errObj.message;
  if (codeRaw !== void 0 && typeof codeRaw !== "string" || msgRaw !== void 0 && typeof msgRaw !== "string") {
    return { statusCode: 0 };
  }
  const code = typeof codeRaw === "string" ? codeRaw : "";
  const message = typeof msgRaw === "string" ? msgRaw : "";
  const codeStr = code.toLowerCase();
  const msgLower = message.toLowerCase();
  let httpCode = 502;
  switch (codeStr) {
    case "invalid_argument":
      httpCode = msgLower.includes("internal error") ? 502 : 400;
      break;
    case "internal":
      httpCode = 502;
      break;
    case "unauthenticated":
      httpCode = 401;
      break;
    case "permission_denied":
      httpCode = 403;
      break;
    case "resource_exhausted":
      httpCode = 429;
      break;
    case "unavailable":
      httpCode = 503;
      break;
    case "canceled":
      httpCode = 499;
      break;
    case "deadline_exceeded":
      httpCode = 504;
      break;
    case "failed_precondition":
      httpCode = msgLower.includes("quota") || msgLower.includes("credit") || msgLower.includes("acu") || msgLower.includes("exhausted") || msgLower.includes("limit") ? 429 : 400;
      break;
  }
  return {
    statusCode: httpCode,
    message: `devin upstream error (${code}): ${message}`,
    code
  };
}
function trimBytes(b) {
  let start = 0;
  let end = b.length;
  while (start < end && isBytesSpace(b[start])) start++;
  while (end > start && isBytesSpace(b[end - 1])) end--;
  return b.subarray(start, end);
}
function isBytesSpace(c) {
  return c === 32 || c >= 9 && c <= 13 || c === 133 || c === 160;
}
function decodeRunePartial(b, offset) {
  if (offset >= b.length) return { rune: RUNE_ERROR, size: 0 };
  const b0 = b[offset];
  if (b0 < 128) return { rune: b0, size: 1 };
  let n;
  let lo = 128;
  let hi = 191;
  if (b0 >= 194 && b0 <= 223) {
    n = 2;
  } else if (b0 === 224) {
    n = 3;
    lo = 160;
  } else if (b0 >= 225 && b0 <= 236) {
    n = 3;
  } else if (b0 === 237) {
    n = 3;
    hi = 159;
  } else if (b0 >= 238 && b0 <= 239) {
    n = 3;
  } else if (b0 === 240) {
    n = 4;
    lo = 144;
  } else if (b0 >= 241 && b0 <= 243) {
    n = 4;
  } else if (b0 === 244) {
    n = 4;
    hi = 143;
  } else {
    return { rune: RUNE_ERROR, size: 1 };
  }
  for (let i = 1; i < n; i++) {
    if (offset + i >= b.length) return { rune: RUNE_ERROR, size: 0 };
    const c = b[offset + i];
    const l = i === 1 ? lo : 128;
    const h = i === 1 ? hi : 191;
    if (c < l || c > h) return { rune: RUNE_ERROR, size: 1 };
  }
  let r = b0 & 255 >> n + 1;
  for (let i = 1; i < n; i++) r = r << 6 | b[offset + i] & 63;
  return { rune: r, size: n };
}
function setDevinModelCatalog(catalog) {
  devinModelCatalog = catalog ?? {};
}
function lookupDevinModel(baseModel, catalog = devinModelCatalog) {
  return catalog[baseModel] ?? null;
}
function hasDevinEffortSuffix(model) {
  const lower = model.trim().toLowerCase();
  return KNOWN_DEVIN_SUFFIXES.some((s) => lower.endsWith(s));
}
function normalizeThinkingLevel(level, budgetTokens) {
  const normalized = level.trim().toLowerCase();
  switch (normalized) {
    case "minimal":
    case "low":
    case "medium":
    case "high":
    case "xhigh":
    case "max":
    case "fast":
      return normalized;
    case "none":
    case "off":
    case "disabled":
      return "none";
    case "auto":
    case "adaptive":
      return "high";
  }
  if (budgetTokens > 0) {
    if (budgetTokens <= 4096) return "low";
    if (budgetTokens <= 16384) return "medium";
    if (budgetTokens <= 32768) return "high";
    return "max";
  }
  return "";
}
function parseSuffix(model) {
  const lastOpen = model.lastIndexOf("(");
  if (lastOpen === -1) return { modelName: model, hasSuffix: false, rawSuffix: "" };
  if (!model.endsWith(")")) return { modelName: model, hasSuffix: false, rawSuffix: "" };
  return {
    modelName: model.slice(0, lastOpen),
    hasSuffix: true,
    rawSuffix: model.slice(lastOpen + 1, model.length - 1)
  };
}
function selectDefaultDevinEffort(baseModel, levels) {
  if (baseModel.includes("swe-2")) return "high";
  let hasNone = false;
  let hasLow = false;
  let hasMedium = false;
  let hasHigh = false;
  for (const l of levels) {
    switch (l) {
      case "none":
        hasNone = true;
        break;
      case "low":
        hasLow = true;
        break;
      case "medium":
        hasMedium = true;
        break;
      case "high":
        hasHigh = true;
        break;
    }
  }
  if (hasNone && hasLow && baseModel.startsWith("gpt-5")) return "low";
  if (hasHigh && (baseModel.includes("gemini") || baseModel.includes("grok") || baseModel.includes("glm") || baseModel.includes("deepseek") || baseModel.includes("kimi") || baseModel.includes("nemotron"))) {
    return "high";
  }
  if (hasMedium) return "medium";
  if (hasHigh) return "high";
  if (hasLow) return "low";
  return levels[0];
}
function devinLevelIndex(level) {
  const lower = level.trim().toLowerCase();
  return DEVIN_STANDARD_LEVEL_ORDER.indexOf(lower);
}
function clampEffort(requested, allowed, defaultEffort) {
  if (requested === "") return defaultEffort;
  const reqLower = requested.trim().toLowerCase();
  for (const a of allowed) {
    if (reqLower === a.trim().toLowerCase()) return a;
  }
  if (reqLower === "none") return defaultEffort;
  const reqIdx = devinLevelIndex(reqLower);
  if (reqIdx === -1) return defaultEffort;
  let bestMatch = defaultEffort;
  let bestDist = 999;
  let bestIdx = -1;
  for (const a of allowed) {
    const aIdx = devinLevelIndex(a);
    if (aIdx === -1) continue;
    let dist = reqIdx - aIdx;
    if (dist < 0) dist = -dist;
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = a;
      bestIdx = aIdx;
    } else if (dist === bestDist && aIdx > bestIdx) {
      bestMatch = a;
      bestIdx = aIdx;
    }
  }
  return bestMatch;
}
function resolveDevinChatModelUid(rawModel, thinkingLevel = "", budgetTokens = 0, catalog = devinModelCatalog) {
  const model = rawModel.trim();
  if (model === "") return "swe-2-high";
  let cleanModel = model;
  if (cleanModel.toLowerCase().startsWith("devin/")) cleanModel = cleanModel.slice(6);
  if (hasDevinEffortSuffix(cleanModel)) return cleanModel;
  const parsedSuffix = parseSuffix(cleanModel);
  let baseModel = parsedSuffix.modelName.trim();
  let level = thinkingLevel;
  if (parsedSuffix.hasSuffix) {
    level = parsedSuffix.rawSuffix;
  } else {
    const colonIdx = cleanModel.lastIndexOf(":");
    if (colonIdx !== -1) {
      baseModel = cleanModel.slice(0, colonIdx).trim();
      level = cleanModel.slice(colonIdx + 1).trim();
    }
  }
  const effort = normalizeThinkingLevel(level, budgetTokens);
  const lowerBase = baseModel.toLowerCase();
  let canonicalBase = lowerBase.split(".").join("-");
  const alias = SPECIAL_DEVIN_ALIASES[canonicalBase];
  if (alias !== void 0) return alias;
  if (canonicalBase === "claude-sonnet-4-5" || canonicalBase.includes("sonnet-4-5")) {
    if (effort !== "" && effort !== "none") return "MODEL_PRIVATE_3";
    return "MODEL_PRIVATE_2";
  }
  if (canonicalBase === "gemini-3-flash") canonicalBase = "gemini-3-8-flash";
  let modelInfo = lookupDevinModel(canonicalBase, catalog);
  if (modelInfo === null && canonicalBase !== lowerBase) modelInfo = lookupDevinModel(lowerBase, catalog);
  let allowedLevels = [];
  if (modelInfo !== null && modelInfo.thinking != null && modelInfo.thinking.levels.length > 0) {
    allowedLevels = modelInfo.thinking.levels;
  }
  switch (canonicalBase) {
    case "swe-1-7":
      if (effort === "medium") return "swe-1-7-medium";
      return "swe-1-7";
    case "swe-1-6":
      if (effort === "fast") return "swe-1-6-fast";
      return "swe-1-6";
    case "glm-5-2":
      if (effort === "none") return "glm-5-2-none";
      if (effort === "max") return "glm-5-2-max";
      return "glm-5-2";
  }
  if (allowedLevels.length === 0) return canonicalBase;
  const defaultEffort = selectDefaultDevinEffort(canonicalBase, allowedLevels);
  const clamped = clampEffort(effort, allowedLevels, defaultEffort);
  return `${canonicalBase}-${clamped}`;
}
var CONNECT_FLAG_DATA, CONNECT_FLAG_COMPRESSED, CONNECT_FLAG_END_STREAM, DEVIN_DEFAULT_BASE_URL, DEVIN_CHAT_PATH, DEVIN_DEFAULT_CLIENT_NAME, DEVIN_DEFAULT_CLIENT_VERSION, DEVIN_FINGERPRINT_HEX_LEN, DEVIN_DEFAULT_MAX_TOKENS, MAX_CONNECT_FRAME_SIZE, MAX_DECOMPRESSED_FRAME_SIZE, DEVIN_DEFAULT_OS_NAME, DEFAULT_MAX_SESSION_TURN_COUNTERS, WIRE_VARINT, WIRE_FIXED64, WIRE_BYTES, WIRE_START_GROUP, WIRE_END_GROUP, WIRE_FIXED32, ERR_TRUNCATED, ERR_FIELD_NUMBER, ERR_OVERFLOW, ERR_RESERVED, ERR_END_GROUP, textEncoder, textDecoder, HEX_TABLE, ProtoWriter, SHA256_K, sessionTurnCounters, ZERO_WIDTH_SPACE, SensitiveWordMatcher, DevinWireError, RUNE_ERROR, Utf8SplitBuffer, KNOWN_DEVIN_SUFFIXES, SPECIAL_DEVIN_ALIASES, DEVIN_STANDARD_LEVEL_ORDER, devinModelCatalog;
var init_devin_wire = __esm({
  "src/devin-wire.ts"() {
    "use strict";
    CONNECT_FLAG_DATA = 0;
    CONNECT_FLAG_COMPRESSED = 1;
    CONNECT_FLAG_END_STREAM = 2;
    DEVIN_DEFAULT_BASE_URL = "https://server.codeium.com";
    DEVIN_CHAT_PATH = "/exa.api_server_pb.ApiServerService/GetChatMessage";
    DEVIN_DEFAULT_CLIENT_NAME = "chisel";
    DEVIN_DEFAULT_CLIENT_VERSION = "3000.10.21";
    DEVIN_FINGERPRINT_HEX_LEN = 732;
    DEVIN_DEFAULT_MAX_TOKENS = 128e3;
    MAX_CONNECT_FRAME_SIZE = 16 * 1024 * 1024;
    MAX_DECOMPRESSED_FRAME_SIZE = 64 * 1024 * 1024;
    DEVIN_DEFAULT_OS_NAME = "linux";
    DEFAULT_MAX_SESSION_TURN_COUNTERS = 5e3;
    WIRE_VARINT = 0;
    WIRE_FIXED64 = 1;
    WIRE_BYTES = 2;
    WIRE_START_GROUP = 3;
    WIRE_END_GROUP = 4;
    WIRE_FIXED32 = 5;
    ERR_TRUNCATED = -1;
    ERR_FIELD_NUMBER = -2;
    ERR_OVERFLOW = -3;
    ERR_RESERVED = -4;
    ERR_END_GROUP = -5;
    textEncoder = new TextEncoder();
    textDecoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });
    HEX_TABLE = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    ProtoWriter = class {
      buf;
      len = 0;
      scratch = new ArrayBuffer(8);
      constructor(initialCapacity = 256) {
        this.buf = new Uint8Array(initialCapacity > 0 ? initialCapacity : 256);
      }
      ensure(extra) {
        const need = this.len + extra;
        if (need <= this.buf.length) return;
        let cap = this.buf.length * 2;
        while (cap < need) cap *= 2;
        const next = new Uint8Array(cap);
        next.set(this.buf.subarray(0, this.len));
        this.buf = next;
      }
      /** protowire.AppendTag */
      appendTag(num2, typ) {
        this.appendVarint(encodeTag(num2, typ));
      }
      /** protowire.AppendVarint（uint64 用 bigint 表达） */
      appendVarint(v) {
        let x = typeof v === "bigint" ? v : BigInt(v);
        if (x < 0n) x &= 0xffffffffffffffffn;
        for (; ; ) {
          const byte = Number(x & 0x7fn);
          x >>= 7n;
          if (x === 0n) {
            this.appendRawByte(byte);
            return;
          }
          this.appendRawByte(byte | 128);
        }
      }
      /** protowire.AppendBytes */
      appendBytes(v) {
        this.appendVarint(v.length);
        this.appendRawBytes(v);
      }
      /** protowire.AppendString */
      appendString(s) {
        this.appendBytes(utf8Encode(s));
      }
      /** protowire.AppendFixed64（这里只用于 double，故直接按 bit pattern 写 double） */
      appendFixed64(v) {
        const dv = new DataView(this.scratch);
        dv.setFloat64(0, v, true);
        this.appendRawBytes(new Uint8Array(this.scratch));
      }
      /** protowire.AppendFixed32 */
      appendFixed32(v) {
        const dv = new DataView(this.scratch);
        dv.setFloat32(0, v, true);
        this.appendRawBytes(new Uint8Array(this.scratch));
      }
      appendRawByte(b) {
        this.ensure(1);
        this.buf[this.len++] = b & 255;
      }
      appendRawBytes(v) {
        if (v.length === 0) return;
        this.ensure(v.length);
        this.buf.set(v, this.len);
        this.len += v.length;
      }
      get length() {
        return this.len;
      }
      /** 取出已写入字节（拷贝，避免暴露内部缓冲区）。 */
      bytes() {
        return this.buf.slice(0, this.len);
      }
    };
    SHA256_K = new Uint32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    sessionTurnCounters = /* @__PURE__ */ new Map();
    ZERO_WIDTH_SPACE = "\u200B";
    SensitiveWordMatcher = class {
      regex;
      constructor(words) {
        this.regex = compileSensitiveRegex(words);
      }
      matches(text) {
        if (this.regex === null || text === "") return false;
        return this.regex.test(text);
      }
      obfuscateText(text) {
        if (this.regex === null || text === "") return text;
        return text.replace(this.regex, obfuscateWord);
      }
    };
    DevinWireError = class extends Error {
      partial;
      constructor(message, partial) {
        super(message);
        this.name = "DevinWireError";
        this.partial = partial;
      }
    };
    RUNE_ERROR = 65533;
    Utf8SplitBuffer = class {
      remainder = new Uint8Array(0);
      /** 对应 (*UTF8SplitBuffer).Feed。 */
      feed(chunk) {
        const combined = new Uint8Array(this.remainder.length + chunk.length);
        combined.set(this.remainder, 0);
        combined.set(chunk, this.remainder.length);
        this.remainder = new Uint8Array(0);
        if (combined.length === 0) return "";
        let validUntil = 0;
        while (validUntil < combined.length) {
          const { rune, size } = decodeRunePartial(combined, validUntil);
          if (size === 0) {
            break;
          }
          if (rune === RUNE_ERROR && size === 1) {
            validUntil++;
            continue;
          }
          validUntil += size;
        }
        const validBytes = combined.subarray(0, validUntil);
        this.remainder = combined.slice(validUntil);
        return utf8Decode(validBytes);
      }
    };
    KNOWN_DEVIN_SUFFIXES = [
      "-none",
      "-low",
      "-medium",
      "-high",
      "-xhigh",
      "-max",
      "-fast",
      "-priority",
      "-low-priority",
      "-medium-priority",
      "-high-priority",
      "-xhigh-priority",
      "-max-priority"
    ];
    SPECIAL_DEVIN_ALIASES = {
      "claude-haiku-4-5": "MODEL_PRIVATE_11",
      "gpt-4-1": "MODEL_CHAT_GPT_4_1_2025_04_14"
    };
    DEVIN_STANDARD_LEVEL_ORDER = ["minimal", "low", "medium", "high", "xhigh", "max"];
    devinModelCatalog = {};
  }
});

// src/devin.ts
var devin_exports = {};
__export(devin_exports, {
  completeDevinOAuth: () => completeDevinOAuth,
  formatDevinSessionToken: () => formatDevinSessionToken,
  handleDevinRequest: () => handleDevinRequest,
  loadDevinCatalog: () => loadDevinCatalog,
  startDevinOAuth: () => startDevinOAuth,
  testDevin: () => testDevin,
  toDevinPrompts: () => toDevinPrompts,
  toDevinTools: () => toDevinTools
});
function errorResponse3(message, status, type = "devin_error") {
  return new Response(JSON.stringify({ error: { message, type } }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
function randomId4() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
function base64Url2(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomBytes2(length) {
  const out = new Uint8Array(length);
  crypto.getRandomValues(out);
  return out;
}
function formatDevinSessionToken(raw2) {
  const t = (raw2 || "").trim();
  if (!t) return "";
  return t.startsWith(DEVIN_TOKEN_PREFIX) ? t : DEVIN_TOKEN_PREFIX + t;
}
async function normalizeDevinUuid(raw2) {
  const text = (raw2 || "").trim();
  if (!text) return randomId4();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)) return text.toLowerCase();
  const ns = new Uint8Array([107, 167, 184, 17, 157, 173, 17, 209, 128, 180, 0, 192, 79, 212, 48, 200]);
  const nameBytes = new TextEncoder().encode(text);
  const buf = new Uint8Array(ns.length + nameBytes.length);
  buf.set(ns, 0);
  buf.set(nameBytes, ns.length);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-1", buf));
  const h = new Uint8Array(digest.slice(0, 16));
  h[6] = h[6] & 15 | 80;
  h[8] = h[8] & 63 | 128;
  const hex = [...h].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function shuffleCredentials2(list) {
  const arr = list.map((cred, i) => ({ cred, index: i + 1 }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
async function startDevinOAuth(env) {
  const verifier = base64Url2(randomBytes2(48));
  const challenge = base64Url2(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  const state = randomId4();
  await getKV(env).put(PKCE_PREFIX + state, JSON.stringify({ verifier }), { expirationTtl: 900 });
  const query = [
    `state=${encodeURIComponent(state)}`,
    "prompt=select_account",
    `code_challenge=${encodeURIComponent(challenge)}`,
    "code_challenge_method=S256",
    "cli_pkce_marker=1"
  ].join("&");
  return { url: `${DEVIN_APP_BASE}/auth/cli/continue?${query}`, state };
}
async function completeDevinOAuth(env, code, state) {
  const trimmedCode = (code || "").trim();
  if (!trimmedCode) throw new Error("\u8BF7\u586B\u5199\u4ECE\u6388\u6743\u9875\u590D\u5236\u7684 code");
  const kv = getKV(env);
  let verifier = "";
  if (state) {
    const cached = await kv.get(PKCE_PREFIX + state);
    if (cached) {
      try {
        verifier = String(JSON.parse(cached).verifier || "");
      } catch {
      }
      await kv.delete(PKCE_PREFIX + state).catch(() => {
      });
    }
  }
  if (!verifier) throw new Error("\u6388\u6743\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u70B9\u51FB\u300C\u7528 Devin \u8D26\u53F7\u6388\u6743\u300D");
  const res = await fetch(`${DEVIN_API_BASE}/auth/cli/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ code: trimmedCode, code_verifier: verifier }),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`\u6362\u53D6 session token \u5931\u8D25: HTTP ${res.status}: ${text.slice(0, 200)}`);
  let token = "";
  try {
    token = String(JSON.parse(text).token || "").trim();
  } catch {
  }
  if (!token) throw new Error(`\u54CD\u5E94\u91CC\u6CA1\u6709 token: ${text.slice(0, 200)}`);
  const sessionToken = formatDevinSessionToken(token);
  const profile = await fetchDevinProfile(sessionToken);
  return { sessionToken, userName: profile.userName, userId: profile.userId, orgId: profile.orgId };
}
async function fetchDevinProfile(sessionToken) {
  try {
    const res = await fetch(`${DEVIN_API_BASE}/v3/self`, {
      headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" },
      signal: AbortSignal.timeout(2e4)
    });
    if (!res.ok) return {};
    const json = await res.json();
    return {
      userName: typeof json.user_name === "string" ? json.user_name : void 0,
      userId: typeof json.user_id === "string" ? json.user_id : void 0,
      orgId: typeof json.org_id === "string" ? json.org_id : void 0
    };
  } catch {
    return {};
  }
}
async function loadDevinCatalog(env) {
  const kv = getKV(env);
  const cached = await kv.get(CATALOG_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.catalog) {
        setDevinModelCatalog(parsed.catalog);
        return;
      }
    } catch {
    }
  }
  for (const url of CATALOG_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15e3) });
      if (!res.ok) continue;
      const json = await res.json();
      const list = Array.isArray(json?.devin) ? json.devin : [];
      if (list.length === 0) continue;
      const catalog = {};
      for (const m of list) {
        const id = (m.id || "").trim();
        if (!id) continue;
        catalog[id] = { thinking: m.thinking?.levels ? { levels: m.thinking.levels } : null };
      }
      setDevinModelCatalog(catalog);
      await kv.put(CATALOG_KEY, JSON.stringify({ catalog }), { expirationTtl: CATALOG_TTL_SECONDS }).catch(() => {
      });
      return;
    } catch {
    }
  }
}
function textFromContent(content) {
  if (typeof content === "string") return { text: content, images: [] };
  if (!Array.isArray(content)) return { text: "", images: [] };
  let text = "";
  const images = [];
  for (const part of content) {
    if (!part || typeof part !== "object") continue;
    const p = part;
    if (p.type === "text" && typeof p.text === "string") text += p.text;
    else if (p.type === "image_url") {
      const url = String(p.image_url?.url || p.image_url || "");
      const m = /^data:([^;,]+);base64,(.*)$/s.exec(url);
      if (m) images.push({ mimeType: m[1], base64Data: m[2] });
    }
  }
  return { text, images };
}
function toDevinPrompts(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const systems = [];
  const prompts = [];
  for (const raw2 of list) {
    if (!raw2 || typeof raw2 !== "object") continue;
    const m = raw2;
    const role = String(m.role || "");
    if (role === "system" || role === "developer") {
      const { text } = textFromContent(m.content);
      if (text) systems.push(text);
      continue;
    }
    if (role === "user") {
      const { text, images } = textFromContent(m.content);
      prompts.push({ source: 1, content: text, images: images.length ? images : void 0 });
      continue;
    }
    if (role === "assistant") {
      const { text, images } = textFromContent(m.content);
      const toolCalls = Array.isArray(m.tool_calls) ? m.tool_calls.map((tc) => ({
        id: String(tc?.id || ""),
        name: String(tc?.function?.name || ""),
        arguments: typeof tc?.function?.arguments === "string" ? tc.function.arguments : JSON.stringify(tc?.function?.arguments ?? {})
      })).filter((tc) => tc.name) : void 0;
      prompts.push({
        source: 2,
        content: text || void 0,
        images: images.length ? images : void 0,
        toolCalls: toolCalls && toolCalls.length ? toolCalls : void 0,
        thinking: typeof m.reasoning_content === "string" && m.reasoning_content ? m.reasoning_content : void 0
      });
      continue;
    }
    if (role === "tool") {
      const { text } = textFromContent(m.content);
      prompts.push({ source: 4, content: text || "{}", toolCallId: String(m.tool_call_id || "") });
      continue;
    }
  }
  return { systemPrompt: systems.join("\n\n"), prompts };
}
function toDevinTools(tools) {
  const list = Array.isArray(tools) ? tools : [];
  const out = [];
  for (const raw2 of list) {
    if (!raw2 || typeof raw2 !== "object") continue;
    const t = raw2;
    const fn = t.type === "function" ? t.function : t;
    const name = String(fn?.name || "");
    if (!name) continue;
    out.push({
      name,
      description: typeof fn?.description === "string" ? fn.description : void 0,
      parametersJson: JSON.stringify(fn?.parameters ?? { type: "object", properties: {} })
    });
  }
  return out;
}
function devinHeaders(sessionToken) {
  return {
    // Codeium/Devin 的 Connect-RPC 上游用 Basic <token>-<token> 作为线认证头
    Authorization: `Basic ${sessionToken}-${sessionToken}`,
    "Content-Type": "application/connect+proto",
    "Connect-Protocol-Version": "1",
    Accept: "*/*",
    "Sentry-Trace": randomId4().replace(/-/g, "")
  };
}
async function readErrorBody4(res) {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    return String(json.message || json.error?.message || json.error || text).slice(0, 300);
  } catch {
    return text.slice(0, 300);
  }
}
async function* connectFrames(body) {
  const reader = body.getReader();
  let pending = new Uint8Array(0);
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.length === 0) continue;
    const merged = new Uint8Array(pending.length + value.length);
    merged.set(pending, 0);
    merged.set(value, pending.length);
    pending = merged;
    for (; ; ) {
      const frame = readConnectFrame(pending);
      if (!frame) break;
      pending = pending.slice(frame.consumed);
      const payload = frame.flag & CONNECT_FLAG_COMPRESSED ? await gunzipBytes(frame.payload) : frame.payload;
      yield { flag: frame.flag, payload };
    }
  }
}
function handleDevinFrame(frame, state, emit) {
  if (frame.flag & CONNECT_FLAG_END_STREAM) {
    const trailer = parseDevinTrailerError(frame.payload);
    if (trailer?.statusCode) {
      throw new DevinUpstreamError(trailer.statusCode, trailer.message || "\u4E0A\u6E38\u8FD4\u56DE trailer \u9519\u8BEF");
    }
    return false;
  }
  let parsed;
  try {
    parsed = parseDevinFrame(frame.payload);
  } catch {
    return true;
  }
  if (parsed.usage) {
    state.usage = state.usage ? {
      ...state.usage,
      promptTokens: parsed.usage.promptTokens || state.usage.promptTokens,
      completionTokens: parsed.usage.completionTokens || state.usage.completionTokens,
      cachedTokens: parsed.usage.cachedTokens || state.usage.cachedTokens
    } : parsed.usage;
  }
  if (parsed.responseDimensionGroups?.length) state.dimensionGroups.push(...parsed.responseDimensionGroups);
  if (parsed.thinkingText) {
    const text = state.thinkingBuf.feed(new TextEncoder().encode(parsed.thinkingText));
    if (text) emit({ type: "thinking", text });
  }
  if (parsed.contentText) {
    const text = state.contentBuf.feed(new TextEncoder().encode(parsed.contentText));
    if (text) emit({ type: "content", text });
  }
  for (const tc of parsed.toolCallDeltas || []) {
    state.sawToolCall = true;
    const idx = Number.isFinite(tc.index) ? tc.index : 0;
    const slot = state.toolSlots.get(idx) || { id: "", name: "" };
    if (tc.id) slot.id = tc.id;
    if (tc.name) slot.name = tc.name;
    state.toolSlots.set(idx, slot);
    emit({ type: "tool", toolIndex: idx, toolId: tc.id || slot.id, toolName: tc.name || slot.name, toolArguments: tc.arguments || void 0 });
  }
  return true;
}
async function consumeDevinFrames(frames, pre, onChunk) {
  const chunks = [];
  const state = {
    usage: null,
    dimensionGroups: [],
    toolSlots: /* @__PURE__ */ new Map(),
    thinkingBuf: new Utf8SplitBuffer(),
    contentBuf: new Utf8SplitBuffer(),
    sawToolCall: false
  };
  const emit = (chunk) => {
    chunks.push(chunk);
    if (onChunk) onChunk(chunk);
  };
  if (pre && !handleDevinFrame(pre, state, emit)) {
    return { chunks, usage: state.usage, finishReason: state.sawToolCall ? "tool_calls" : "stop" };
  }
  for await (const frame of frames) {
    if (!handleDevinFrame(frame, state, emit)) break;
  }
  if (state.dimensionGroups.length > 0 && (!state.usage || !state.usage.promptTokens || !state.usage.completionTokens)) {
    const dims = parseDevinResponseDimensionGroups(state.dimensionGroups);
    if (dims.found) {
      state.usage = {
        ...state.usage || {},
        promptTokens: state.usage?.promptTokens || Number(dims.promptTokens) || 0,
        completionTokens: state.usage?.completionTokens || Number(dims.completionTokens) || 0,
        cachedTokens: state.usage?.cachedTokens || Number(dims.cachedTokens) || 0
      };
    }
  }
  return { chunks, usage: state.usage, finishReason: state.sawToolCall ? "tool_calls" : "stop" };
}
async function recordUsage3(p, usage, ok, status) {
  const record = {
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    provider: p.providerId,
    model: p.requestedModel,
    token: p.maskedToken,
    ok,
    status,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    latencyMs: Date.now() - p.startedAt
  };
  await addUsageRecord(p.env, record).catch(() => {
  });
}
async function handleDevinRequest(p) {
  const accounts = shuffleCredentials2((p.credentials || []).map((c) => (c || "").trim()).filter(Boolean));
  if (accounts.length === 0) {
    return errorResponse3("\u8BE5 devin \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Keys\u300D\u91CC\u586B\u5165 Devin session token\uFF08\u53EF\u70B9\u300C\u7528 Devin \u8D26\u53F7\u6388\u6743\u300D\u83B7\u53D6\uFF09\uFF0C\u6BCF\u884C\u4E00\u4E2A", 400, "configuration_error");
  }
  await loadDevinCatalog(p.env).catch(() => {
  });
  const wantStream = p.body?.stream === true;
  const includeUsage = !!p.body?.stream_options?.include_usage;
  const { systemPrompt, prompts } = toDevinPrompts(p.body?.messages);
  const tools = toDevinTools(p.body?.tools);
  const temperature = typeof p.body?.temperature === "number" ? p.body.temperature : null;
  const maxTokens = Number(p.body?.max_tokens || p.body?.max_completion_tokens || 0) || 128e3;
  const thinkingLevel = typeof p.body?.reasoning_effort === "string" ? p.body.reasoning_effort : "";
  const chatModelUid = resolveDevinChatModelUid(p.modelId, thinkingLevel || void 0, 0);
  const sessionId = await normalizeDevinUuid(p.sessionHint);
  const cascadeId = sessionId;
  const responseId = `chatcmpl-${randomId4().replace(/-/g, "").slice(0, 24)}`;
  const created = Math.floor(Date.now() / 1e3);
  let lastError = "";
  let lastStatus = 502;
  for (let i = 0; i < accounts.length; i++) {
    const { cred, index: accountIndex } = accounts[i];
    const sessionToken = formatDevinSessionToken(cred);
    try {
      const payload = buildDevinGetChatMessageRequest({
        sessionToken,
        deviceSeed: sessionToken.slice(0, 64),
        chatModelUid,
        systemPrompt,
        prompts,
        tools,
        temperature,
        maxTokens,
        sessionId,
        cascadeId
      });
      const upstream = await fetch(`${DEVIN_DEFAULT_BASE_URL}${DEVIN_CHAT_PATH}`, {
        method: "POST",
        headers: devinHeaders(sessionToken),
        body: wrapConnectEnvelope(payload),
        signal: AbortSignal.timeout(3e5)
      });
      if (!upstream.ok || !upstream.body) {
        lastStatus = upstream.status || 502;
        lastError = `HTTP ${lastStatus}: ${await readErrorBody4(upstream)}`;
        await recordUsage3(p, { promptTokens: 0, completionTokens: 0 }, false, lastStatus);
        if ([401, 403, 404, 429].includes(lastStatus) || lastStatus >= 500) continue;
        return errorResponse3(lastError, lastStatus, "upstream_error");
      }
      const frames = connectFrames(upstream.body);
      const firstRead = await frames.next();
      const firstFrame = firstRead.done ? null : firstRead.value;
      if (firstFrame && firstFrame.flag & CONNECT_FLAG_END_STREAM) {
        const trailer = parseDevinTrailerError(firstFrame.payload);
        if (trailer?.statusCode) throw new DevinUpstreamError(trailer.statusCode, trailer.message || "\u4E0A\u6E38\u8FD4\u56DE trailer \u9519\u8BEF");
      }
      if (wantStream) {
        const encoder = new TextEncoder();
        const model = p.requestedModel;
        const stream = new ReadableStream({
          async start(controller) {
            const send = (obj) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}

`));
            const deltaChunk = (delta, finish = null) => ({
              id: responseId,
              object: "chat.completion.chunk",
              created,
              model,
              choices: [{ index: 0, delta, finish_reason: finish }]
            });
            send(deltaChunk({ role: "assistant", content: "" }));
            let usage = null;
            let finishReason = "stop";
            try {
              const result2 = await consumeDevinFrames(frames, firstFrame, (chunk) => {
                if (chunk.type === "thinking") send(deltaChunk({ reasoning_content: chunk.text }));
                else if (chunk.type === "content") send(deltaChunk({ content: chunk.text }));
                else {
                  send(deltaChunk({
                    tool_calls: [{
                      index: chunk.toolIndex ?? 0,
                      id: chunk.toolId || `call_${randomId4().replace(/-/g, "").slice(0, 24)}`,
                      type: "function",
                      function: { name: chunk.toolName || "", arguments: chunk.toolArguments || "" }
                    }]
                  }));
                }
              });
              usage = result2.usage;
              finishReason = result2.finishReason;
            } catch (err) {
              send({ error: { message: err.message || "\u4E0A\u6E38\u6D41\u4E2D\u65AD", type: "upstream_error" } });
            }
            send(deltaChunk({}, finishReason));
            if (includeUsage) {
              send({
                id: responseId,
                object: "chat.completion.chunk",
                created,
                model,
                choices: [],
                usage: {
                  prompt_tokens: usage?.promptTokens || 0,
                  completion_tokens: usage?.completionTokens || 0,
                  total_tokens: (usage?.promptTokens || 0) + (usage?.completionTokens || 0),
                  ...usage?.cachedTokens ? { prompt_tokens_details: { cached_tokens: usage.cachedTokens } } : {}
                }
              });
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            const task = recordUsage3(p, { promptTokens: usage?.promptTokens || 0, completionTokens: usage?.completionTokens || 0 }, true, 200);
            if (p.waitUntil) {
              try {
                p.waitUntil(task);
              } catch {
                task.catch(() => {
                });
              }
            } else {
              task.catch(() => {
              });
            }
          }
        });
        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
            "x-devin-account": String(accountIndex)
          }
        });
      }
      const result = await consumeDevinFrames(frames, firstFrame);
      const content = result.chunks.filter((c) => c.type === "content").map((c) => c.text || "").join("");
      const reasoning = result.chunks.filter((c) => c.type === "thinking").map((c) => c.text || "").join("");
      const toolCalls = result.chunks.filter((c) => c.type === "tool").map((c) => ({
        id: c.toolId || `call_${randomId4().replace(/-/g, "").slice(0, 24)}`,
        type: "function",
        function: { name: c.toolName || "", arguments: c.toolArguments || "" }
      }));
      const message = { role: "assistant", content: content || (toolCalls.length ? null : "") };
      if (reasoning) message.reasoning_content = reasoning;
      if (toolCalls.length) message.tool_calls = toolCalls;
      await recordUsage3(p, { promptTokens: result.usage?.promptTokens || 0, completionTokens: result.usage?.completionTokens || 0 }, true, 200);
      return new Response(JSON.stringify({
        id: responseId,
        object: "chat.completion",
        created,
        model: p.requestedModel,
        choices: [{ index: 0, message, finish_reason: result.finishReason }],
        usage: {
          prompt_tokens: result.usage?.promptTokens || 0,
          completion_tokens: result.usage?.completionTokens || 0,
          total_tokens: (result.usage?.promptTokens || 0) + (result.usage?.completionTokens || 0)
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "x-devin-account": String(accountIndex) }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      if (err instanceof DevinUpstreamError) {
        lastStatus = err.statusCode;
        if (![401, 403, 404, 429].includes(err.statusCode) && err.statusCode < 500) {
          await recordUsage3(p, { promptTokens: 0, completionTokens: 0 }, false, err.statusCode);
          return errorResponse3(`HTTP ${err.statusCode}: ${err.message}`, err.statusCode, "upstream_error");
        }
        continue;
      }
      lastStatus = 502;
      continue;
    }
  }
  return errorResponse3(`\u6240\u6709 Devin \u51ED\u636E\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function testDevin(env, credential, model) {
  const sessionToken = formatDevinSessionToken(credential);
  if (!sessionToken) return { success: false, message: "\u8BF7\u586B\u5199 Devin session token", statusCode: 0 };
  try {
    const res = await fetch(`${DEVIN_API_BASE}/v3/self`, {
      headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" },
      signal: AbortSignal.timeout(2e4)
    });
    if (!res.ok) return { success: false, message: `HTTP ${res.status}: ${await readErrorBody4(res)}`, statusCode: res.status };
    const json = await res.json();
    const who = [json.user_name, json.email].filter((v) => typeof v === "string" && v).join(" \xB7 ") || "\u51ED\u636E\u6709\u6548";
    const modelHint = model ? `\uFF08\u6A21\u578B ${model} \u8BF7\u5728\u5BF9\u8BDD\u4E2D\u5B9E\u6D4B\uFF09` : "";
    return { success: true, message: `\u51ED\u636E\u6709\u6548\uFF1A${who}${modelHint}`, statusCode: 200 };
  } catch (err) {
    return { success: false, message: err.message || "\u6821\u9A8C\u5931\u8D25" };
  }
}
var DEVIN_APP_BASE, DEVIN_API_BASE, DEVIN_TOKEN_PREFIX, PKCE_PREFIX, CATALOG_KEY, CATALOG_URLS, CATALOG_TTL_SECONDS, DevinUpstreamError;
var init_devin = __esm({
  "src/devin.ts"() {
    "use strict";
    init_storage_adapter();
    init_storage();
    init_devin_wire();
    DEVIN_APP_BASE = "https://app.devin.ai";
    DEVIN_API_BASE = "https://api.devin.ai";
    DEVIN_TOKEN_PREFIX = "devin-session-token$";
    PKCE_PREFIX = "devin:pkce:";
    CATALOG_KEY = "devin:models-catalog";
    CATALOG_URLS = [
      "https://models.router-for.me/devin_models.json",
      "https://raw.githubusercontent.com/router-for-me/models/refs/heads/main/devin_models.json"
    ];
    CATALOG_TTL_SECONDS = 3 * 3600;
    DevinUpstreamError = class extends Error {
      statusCode;
      constructor(statusCode, message) {
        super(message);
        this.name = "DevinUpstreamError";
        this.statusCode = statusCode;
      }
    };
  }
});

// src/anthropic-translate.ts
function randomId5() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
function contentToBlocks(content) {
  const blocks = [];
  if (typeof content === "string") {
    if (content) blocks.push({ type: "text", text: content });
    return blocks;
  }
  if (Array.isArray(content)) {
    for (const item of content) {
      if (!item || typeof item !== "object") continue;
      const it = item;
      if (it.type === "text" && typeof it.text === "string") {
        if (it.text) blocks.push({ type: "text", text: it.text });
      } else if (it.type === "image_url") {
        const url = it.image_url?.url;
        if (typeof url !== "string" || !url) continue;
        if (url.startsWith("data:")) {
          const comma = url.indexOf(",");
          const meta = url.slice(5, comma);
          const data = url.slice(comma + 1);
          const mime = meta.split(";")[0] || "image/png";
          if (data) blocks.push({ type: "image", source: { type: "base64", media_type: mime, data } });
        } else if (/^https?:\/\//.test(url)) {
          blocks.push({ type: "image", source: { type: "url", url } });
        }
      }
    }
  } else if (content && typeof content === "object" && typeof content.text === "string") {
    blocks.push({ type: "text", text: content.text });
  }
  return blocks;
}
function translateTools(tools) {
  if (!Array.isArray(tools)) return void 0;
  const out = [];
  for (const t of tools) {
    const fn = t?.function;
    if (!fn?.name) continue;
    out.push({
      name: fn.name,
      description: typeof fn.description === "string" ? fn.description : "",
      input_schema: fn.parameters && typeof fn.parameters === "object" ? fn.parameters : { type: "object" }
    });
  }
  return out.length > 0 ? out : void 0;
}
function translateToolChoice(body) {
  const tc = body.tool_choice;
  if (!tc) return void 0;
  if (tc === "auto") return { type: "auto" };
  if (tc === "required") return { type: "any" };
  if (tc === "none") return void 0;
  if (typeof tc === "object") {
    const name = tc.function?.name || tc.name;
    if (name) return { type: "tool", name };
  }
  return void 0;
}
function openAIToAnthropicRequest(body) {
  const messages = [];
  const systemParts = [];
  for (const msg of Array.isArray(body.messages) ? body.messages : []) {
    const role = msg?.role;
    if (role === "system" || role === "developer") {
      const blocks = contentToBlocks(msg.content);
      for (const b of blocks) if (b.type === "text" && b.text) systemParts.push(b.text);
      continue;
    }
    if (role === "user") {
      const blocks = contentToBlocks(msg.content);
      if (blocks.length > 0) messages.push({ role: "user", content: blocks });
      continue;
    }
    if (role === "assistant") {
      const blocks = contentToBlocks(msg.content);
      for (const tc of Array.isArray(msg.tool_calls) ? msg.tool_calls : []) {
        const fn = tc?.function;
        if (!fn?.name) continue;
        let input = {};
        if (typeof fn.arguments === "string" && fn.arguments.trim()) {
          try {
            input = JSON.parse(fn.arguments);
          } catch {
            input = { _raw: fn.arguments };
          }
        }
        blocks.push({ type: "tool_use", id: tc.id || `toolu_${randomId5().replace(/-/g, "").slice(0, 20)}`, name: fn.name, input });
      }
      if (blocks.length > 0) messages.push({ role: "assistant", content: blocks });
      continue;
    }
    if (role === "tool") {
      const toolUseId = msg.tool_call_id || `toolu_${randomId5().replace(/-/g, "").slice(0, 20)}`;
      const blocks = contentToBlocks(msg.content);
      const resultContent = blocks.length > 0 ? blocks : [{ type: "text", text: "" }];
      messages.push({ role: "user", content: [{ type: "tool_result", tool_use_id: toolUseId, content: resultContent }] });
      continue;
    }
  }
  const request = {
    model: body.model,
    max_tokens: Number(body.max_completion_tokens ?? body.max_tokens) || 16384,
    messages
  };
  if (systemParts.length > 0) request.system = systemParts.join("\n\n");
  const tools = translateTools(body.tools);
  if (tools) {
    request.tools = tools;
    const choice = translateToolChoice(body);
    if (choice) request.tool_choice = choice;
  }
  if (typeof body.temperature === "number") request.temperature = Math.max(0, Math.min(1, body.temperature));
  if (typeof body.top_p === "number") request.top_p = body.top_p;
  const stop = body.stop;
  if (typeof stop === "string" && stop) request.stop_sequences = [stop];
  else if (Array.isArray(stop) && stop.length > 0) request.stop_sequences = stop.filter((s) => typeof s === "string");
  if (body.stream === true) request.stream = true;
  return { request };
}
function finishReasonFromAnthropic(stopReason) {
  switch (stopReason) {
    case "max_tokens":
      return "length";
    case "tool_use":
      return "tool_calls";
    case "refusal":
      return "content_filter";
    default:
      return "stop";
  }
}
function anthropicResponseToOpenAI(json, requestedModel) {
  const blocks = Array.isArray(json?.content) ? json.content : [];
  let text = "";
  const toolCalls = [];
  for (const b of blocks) {
    if (b?.type === "text" && typeof b.text === "string") text += b.text;
    else if (b?.type === "tool_use") {
      toolCalls.push({
        id: b.id || `call_${randomId5().replace(/-/g, "").slice(0, 24)}`,
        type: "function",
        function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) }
      });
    }
  }
  const message = { role: "assistant", content: text || null, refusal: null };
  if (toolCalls.length > 0) message.tool_calls = toolCalls;
  const usage = json?.usage || {};
  return {
    id: json?.id || `chatcmpl-${randomId5()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1e3),
    model: requestedModel,
    choices: [{
      index: 0,
      message,
      finish_reason: finishReasonFromAnthropic(json?.stop_reason),
      logprobs: null
    }],
    usage: {
      prompt_tokens: Number(usage.input_tokens) || 0,
      completion_tokens: Number(usage.output_tokens) || 0,
      total_tokens: (Number(usage.input_tokens) || 0) + (Number(usage.output_tokens) || 0)
    }
  };
}
function createSseParser() {
  let buffer = "";
  let currentEvent = "";
  let currentData = "";
  const finish = (out) => {
    if (currentData) out.push({ event: currentEvent, data: currentData });
    currentEvent = "";
    currentData = "";
  };
  return {
    feed(chunk) {
      buffer += chunk;
      const out = [];
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).replace(/\r$/, "");
        buffer = buffer.slice(idx + 1);
        if (line === "") {
          finish(out);
          currentEvent = "";
        } else if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData += (currentData ? "\n" : "") + line.slice(5).trim();
        }
      }
      return out;
    }
  };
}
function createOpenAIStreamFromAnthropic(upstream, requestedModel, onUsage) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const parser = createSseParser();
  let firstChunkSent = false;
  let toolIndex = -1;
  let emittedFinish = null;
  let promptTokens = 0;
  let completionTokens = 0;
  const sendChunk = (controller, delta, finish = null, withUsage = false) => {
    const chunk = {
      id: `chatcmpl-anthropic-${randomId5()}`,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1e3),
      model: requestedModel,
      choices: [{ index: 0, delta, finish_reason: finish, logprobs: null }]
    };
    if (withUsage) chunk.usage = { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}

`));
  };
  const handleEvent = (controller, ev) => {
    if (!ev.data || ev.data === "[DONE]") return;
    let payload;
    try {
      payload = JSON.parse(ev.data);
    } catch {
      return;
    }
    const type = payload?.type || ev.event;
    switch (type) {
      case "message_start": {
        promptTokens = Number(payload?.message?.usage?.input_tokens) || 0;
        completionTokens = Number(payload?.message?.usage?.output_tokens) || 0;
        break;
      }
      case "content_block_start": {
        const block = payload?.content_block || {};
        if (block.type === "tool_use") {
          toolIndex += 1;
          sendChunk(controller, {
            tool_calls: [{
              index: toolIndex,
              id: block.id || `call_${randomId5().replace(/-/g, "").slice(0, 24)}`,
              type: "function",
              function: { name: block.name || "", arguments: "" }
            }]
          });
        }
        break;
      }
      case "content_block_delta": {
        const delta = payload?.delta || {};
        if (delta.type === "text_delta" && typeof delta.text === "string" && delta.text) {
          sendChunk(controller, { content: delta.text });
        } else if (delta.type === "thinking_delta" && typeof delta.thinking === "string" && delta.thinking) {
          sendChunk(controller, { reasoning_content: delta.thinking });
        } else if (delta.type === "input_json_delta" && typeof delta.partial_json === "string" && delta.partial_json && toolIndex >= 0) {
          sendChunk(controller, { tool_calls: [{ index: toolIndex, function: { arguments: delta.partial_json } }] });
        }
        break;
      }
      case "message_delta": {
        const stop = payload?.delta?.stop_reason;
        completionTokens = Math.max(completionTokens, Number(payload?.usage?.output_tokens) || 0);
        if (stop) emittedFinish = finishReasonFromAnthropic(stop);
        break;
      }
      case "message_stop": {
        sendChunk(controller, {}, emittedFinish || "stop", true);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        if (onUsage) onUsage({ promptTokens, completionTokens });
        break;
      }
      case "error": {
        const msg = payload?.error?.message || "\u4E0A\u6E38\u6D41\u9519\u8BEF";
        sendChunk(controller, { content: `[claude] ${msg}` }, "stop", true);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        break;
      }
      default:
        break;
    }
  };
  return new ReadableStream({
    start(controller) {
      const pump = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (!firstChunkSent) sendChunk(controller, { role: "assistant", content: "" }, "stop", true);
            controller.close();
            return;
          }
          const text = decoder.decode(value, { stream: true });
          for (const ev of parser.feed(text)) {
            if (!firstChunkSent) {
              firstChunkSent = true;
              sendChunk(controller, { role: "assistant", content: "" });
            }
            handleEvent(controller, ev);
          }
          pump();
        }).catch(() => {
          try {
            controller.close();
          } catch {
          }
        });
      };
      const reader = upstream.getReader();
      pump();
    }
  });
}
var init_anthropic_translate = __esm({
  "src/anthropic-translate.ts"() {
    "use strict";
  }
});

// src/claude.ts
var claude_exports = {};
__export(claude_exports, {
  buildClaudeAuthUrl: () => buildClaudeAuthUrl,
  exchangeClaudeCode: () => exchangeClaudeCode,
  fetchClaudeModels: () => fetchClaudeModels,
  handleClaudeRequest: () => handleClaudeRequest,
  testClaude: () => testClaude
});
function oauthHeaders() {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "User-Agent": OAUTH_UA
  };
}
async function buildClaudeAuthUrl(env) {
  const state = randomHex(16);
  const { verifier, challenge } = await createPkcePair();
  await getKV(env).put(STATE_PREFIX + state, JSON.stringify({ verifier }), { expirationTtl: 600 }).catch(() => {
  });
  const params = new URLSearchParams({
    code: "true",
    client_id: CLAUDE_CLIENT_ID,
    response_type: "code",
    redirect_uri: CLAUDE_REDIRECT_URI,
    scope: CLAUDE_SCOPE,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state
  });
  return { url: `${CLAUDE_AUTH_URL}?${params.toString()}`, state };
}
function extractCodeAndState(input) {
  const text = (input || "").trim();
  const urlMatch = text.match(/[?&]code=([^&\s]+)/);
  let raw2 = urlMatch ? decodeURIComponent(urlMatch[1]) : text;
  let state;
  const hashIndex = raw2.indexOf("#");
  if (hashIndex !== -1) {
    state = raw2.slice(hashIndex + 1);
    raw2 = raw2.slice(0, hashIndex);
  }
  return { code: raw2, state };
}
async function exchangeClaudeCode(env, codeOrUrl, state) {
  const raw2 = await getKV(env).get(STATE_PREFIX + state);
  if (!raw2) throw new Error("\u6388\u6743\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0810 \u5206\u949F\uFF09\uFF0C\u8BF7\u91CD\u65B0\u70B9\u51FB\u300C\u7528 Claude \u8D26\u53F7\u6388\u6743\u300D");
  await getKV(env).delete(STATE_PREFIX + state).catch(() => {
  });
  const { verifier } = JSON.parse(raw2);
  const { code, state: codeState } = extractCodeAndState(codeOrUrl);
  if (!code) throw new Error("\u672A\u8BC6\u522B\u5230 code\uFF0C\u8BF7\u7C98\u8D34 Claude \u8FD4\u56DE\u7684 code \u6216\u6574\u6BB5\u56DE\u8C03\u5730\u5740");
  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: CLAUDE_REDIRECT_URI,
    client_id: CLAUDE_CLIENT_ID,
    code_verifier: verifier,
    state: codeState || state
  };
  const res = await fetch(CLAUDE_TOKEN_URL, {
    method: "POST",
    headers: oauthHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u6362\u53D6 token \u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.access_token) {
    const msg = typeof json.error === "object" ? json.error?.message : json.error || text;
    throw new Error(`\u6362\u53D6 token \u5931\u8D25 HTTP ${res.status}: ${String(msg).slice(0, 300)}`);
  }
  if (!json.refresh_token) throw new Error("Claude \u672A\u8FD4\u56DE refresh_token\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743");
  return { refreshToken: json.refresh_token, accessToken: json.access_token, expiresIn: Number(json.expires_in) || 3600 };
}
async function refreshClaudeToken(refreshToken) {
  const res = await fetch(CLAUDE_TOKEN_URL, {
    method: "POST",
    headers: oauthHeaders(),
    body: JSON.stringify({
      client_id: CLAUDE_CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: CLAUDE_SCOPE
    }),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Claude OAuth \u5237\u65B0\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.access_token) {
    const msg = typeof json.error === "object" ? json.error?.message : json.error || text;
    throw new Error(`Claude OAuth \u5237\u65B0\u5931\u8D25 HTTP ${res.status}: ${String(msg).slice(0, 300)}`);
  }
  return { accessToken: json.access_token, expiresIn: Number(json.expires_in) || 3600, refreshToken: json.refresh_token || void 0 };
}
async function getAccessToken2(env, refreshToken) {
  const token = await resolveAccessToken(env, AT_PREFIX2, refreshToken, refreshClaudeToken);
  return token.accessToken;
}
function apiHeaders(accessToken, stream) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    "Accept": stream ? "text/event-stream" : "application/json",
    "anthropic-version": "2023-06-01",
    "anthropic-beta": CLAUDE_BETAS,
    "anthropic-dangerous-direct-browser-access": "true",
    "User-Agent": CLAUDE_CLI_UA,
    "X-App": "cli"
  };
}
function extractUsage4(body) {
  const usage = body?.usage || {};
  return { promptTokens: Number(usage.input_tokens) || 0, completionTokens: Number(usage.output_tokens) || 0 };
}
async function handleClaudeRequest(p, subPath) {
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0) {
    return oauthErrorResponse("\u8BE5 claude \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Key\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A Anthropic OAuth refresh_token\uFF08\u53EF\u70B9\u300C\u7528 Claude \u8D26\u53F7\u6388\u6743\u300D\u83B7\u53D6\uFF09", 400, "configuration_error");
  }
  const wantStream = p.body?.stream === true;
  if (subPath === "messages-passthrough") {
    return forwardAnthropicNative(p, tokens[0].trim(), wantStream);
  }
  const { request } = openAIToAnthropicRequest({ ...p.body, model: p.modelId });
  let lastError = "";
  let lastStatus = 502;
  for (const refreshToken of tokens) {
    try {
      const accessToken = await getAccessToken2(p.env, refreshToken);
      const upstream = await fetch(`${CLAUDE_API_BASE}/v1/messages`, {
        method: "POST",
        headers: apiHeaders(accessToken, wantStream),
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(6e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (wantStream && upstream.body) {
        const stream = createOpenAIStreamFromAnthropic(upstream.body, p.requestedModel, (usage) => {
          defer(p, recordOAuthUsage(p, usage, true, 200));
        });
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" }
        });
      }
      const rawText = await upstream.text();
      let json;
      try {
        json = JSON.parse(rawText);
      } catch {
        return oauthErrorResponse(`\u4E0A\u6E38\u8FD4\u56DE\u975E JSON: ${rawText.slice(0, 200)}`, 502, "upstream_error");
      }
      const openai = anthropicResponseToOpenAI(json, p.requestedModel);
      defer(p, recordOAuthUsage(p, extractUsage4(json), true, 200));
      return new Response(JSON.stringify(openai), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 Claude \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function forwardAnthropicNative(p, refreshToken, wantStream) {
  try {
    const accessToken = await getAccessToken2(p.env, refreshToken);
    const upstream = await fetch(`${CLAUDE_API_BASE}/v1/messages`, {
      method: "POST",
      headers: apiHeaders(accessToken, wantStream),
      body: JSON.stringify(p.body),
      signal: AbortSignal.timeout(6e5)
    });
    if (!upstream.ok) {
      return oauthErrorResponse(`HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`, upstream.status, "upstream_error");
    }
    const headers = {
      "Content-Type": upstream.headers.get("Content-Type") || (wantStream ? "text/event-stream" : "application/json"),
      "Cache-Control": "no-store"
    };
    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    return oauthErrorResponse(err.message || "\u900F\u4F20\u5931\u8D25", 502, "proxy_error");
  }
}
async function testClaude(env, refreshToken, modelId) {
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
  try {
    const accessToken = await getAccessToken2(env, refreshToken);
    const { request } = openAIToAnthropicRequest({ messages: [{ role: "user", content: "hi" }], max_tokens: 1, model: modelId });
    const res = await fetch(`${CLAUDE_API_BASE}/v1/messages`, {
      method: "POST",
      headers: apiHeaders(accessToken, false),
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(3e4)
    });
    if (res.ok) return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: 200 };
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
async function fetchClaudeModels(env, refreshToken) {
  try {
    const accessToken = await getAccessToken2(env, refreshToken);
    const res = await fetch(`${CLAUDE_API_BASE}/v1/models?limit=100`, {
      method: "GET",
      headers: apiHeaders(accessToken, false),
      signal: AbortSignal.timeout(3e4)
    });
    const text = await res.text();
    if (!res.ok) return { success: false, models: [], message: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return { success: false, models: [], message: "\u8FD4\u56DE\u975E JSON" };
    }
    const rows = Array.isArray(json?.data) ? json.data : [];
    const models = rows.map((m) => String(m?.id || "")).filter((id) => id && /^[\w.:-]+$/.test(id));
    return { success: true, models: [...new Set(models)] };
  } catch (err) {
    return { success: false, models: [], message: err.message || "\u62C9\u53D6\u5931\u8D25" };
  }
}
var CLAUDE_CLIENT_ID, CLAUDE_AUTH_URL, CLAUDE_TOKEN_URL, CLAUDE_REDIRECT_URI, CLAUDE_SCOPE, OAUTH_UA, CLAUDE_CLI_UA, CLAUDE_API_BASE, CLAUDE_BETAS, AT_PREFIX2, STATE_PREFIX;
var init_claude = __esm({
  "src/claude.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    init_anthropic_translate();
    CLAUDE_CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
    CLAUDE_AUTH_URL = "https://claude.ai/oauth/authorize";
    CLAUDE_TOKEN_URL = "https://platform.claude.com/v1/oauth/token";
    CLAUDE_REDIRECT_URI = "http://localhost:54545/callback";
    CLAUDE_SCOPE = "user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload";
    OAUTH_UA = "axios/1.15.2";
    CLAUDE_CLI_UA = "claude-cli/2.1.258 (external, cli)";
    CLAUDE_API_BASE = "https://api.anthropic.com";
    CLAUDE_BETAS = "claude-code-20250219,oauth-2025-04-20";
    AT_PREFIX2 = "claude:at:";
    STATE_PREFIX = "claude:oauth:";
  }
});

// src/responses-translate.ts
function randomId6() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
function isReasoningModel(model) {
  return /gpt-5|gpt-6|codex|^o[134]/i.test(model || "");
}
function contentToInputParts(content, role) {
  const textType = role === "assistant" ? "output_text" : "input_text";
  if (typeof content === "string") {
    return content ? [{ type: textType, text: content }] : [];
  }
  const parts = [];
  if (Array.isArray(content)) {
    for (const item of content) {
      if (!item || typeof item !== "object") continue;
      const it = item;
      if (it.type === "text" && typeof it.text === "string" && it.text) {
        parts.push({ type: textType, text: it.text });
      } else if (it.type === "image_url") {
        const url = it.image_url?.url;
        if (typeof url === "string" && url) parts.push({ type: "input_image", image_url: url });
      }
    }
  } else if (content && typeof content === "object" && typeof content.text === "string") {
    parts.push({ type: textType, text: content.text });
  }
  return parts;
}
function openAIToResponsesRequest(body, opts) {
  const input = [];
  const systemParts = [];
  for (const msg of Array.isArray(body.messages) ? body.messages : []) {
    const role = msg?.role;
    if (role === "system" || role === "developer") {
      const parts = contentToInputParts(msg.content, "user");
      for (const p of parts) if (p.text) systemParts.push(p.text);
      continue;
    }
    if (role === "user") {
      const parts = contentToInputParts(msg.content, "user");
      input.push({ role: "user", content: parts.length > 0 ? parts : [{ type: "input_text", text: "" }] });
      continue;
    }
    if (role === "assistant") {
      const parts = contentToInputParts(msg.content, "assistant");
      if (parts.length > 0) input.push({ role: "assistant", content: parts });
      for (const tc2 of Array.isArray(msg.tool_calls) ? msg.tool_calls : []) {
        const fn = tc2?.function;
        if (!fn?.name) continue;
        input.push({
          type: "function_call",
          call_id: tc2.id || `call_${randomId6().replace(/-/g, "").slice(0, 24)}`,
          name: fn.name,
          arguments: typeof fn.arguments === "string" ? fn.arguments : JSON.stringify(fn.arguments ?? {})
        });
      }
      continue;
    }
    if (role === "tool") {
      input.push({
        type: "function_call_output",
        call_id: msg.tool_call_id || `call_${randomId6().replace(/-/g, "").slice(0, 24)}`,
        output: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "")
      });
      continue;
    }
  }
  const model = String(body.model || "");
  const request = {
    model,
    input,
    // Codex 后端要求 instructions 字段存在；系统消息合并进来
    instructions: systemParts.length > 0 ? systemParts.join("\n\n") : opts?.defaultInstructions ?? "",
    store: false
  };
  const tools = [];
  for (const t of Array.isArray(body.tools) ? body.tools : []) {
    const fn = t?.function;
    if (!fn?.name) continue;
    tools.push({
      type: "function",
      name: fn.name,
      description: typeof fn.description === "string" ? fn.description : "",
      parameters: fn.parameters && typeof fn.parameters === "object" ? fn.parameters : { type: "object" },
      strict: false
    });
  }
  if (tools.length > 0) request.tools = tools;
  const tc = body.tool_choice;
  if (tc === "auto" || tc === "none" || tc === "required") request.tool_choice = tc;
  else if (tc && typeof tc === "object" && (tc.function?.name || tc.name)) request.tool_choice = { type: "function", name: tc.function?.name || tc.name };
  if (body.parallel_tool_calls !== void 0 && tools.length > 0) request.parallel_tool_calls = !!body.parallel_tool_calls;
  if (!isReasoningModel(model)) {
    if (typeof body.temperature === "number") request.temperature = body.temperature;
    if (typeof body.top_p === "number") request.top_p = body.top_p;
  } else {
    const effort = body.reasoning_effort;
    request.reasoning = {
      effort: ["minimal", "low", "medium", "high"].includes(effort) ? effort : "medium",
      summary: "auto"
    };
  }
  const maxTokens = Number(body.max_completion_tokens ?? body.max_tokens);
  if (maxTokens > 0) request.max_output_tokens = maxTokens;
  const stop = body.stop;
  if (typeof stop === "string" && stop) request.stop = [stop];
  else if (Array.isArray(stop) && stop.length > 0) request.stop = stop;
  if (body.stream === true) {
    request.stream = true;
  }
  return { request };
}
function responsesResponseToOpenAI(json, requestedModel) {
  const output = Array.isArray(json?.output) ? json.output : [];
  let text = "";
  const toolCalls = [];
  for (const item of output) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (part?.type === "output_text" && typeof part.text === "string") text += part.text;
      }
    } else if (item?.type === "function_call") {
      toolCalls.push({
        id: item.call_id || item.id || `call_${randomId6().replace(/-/g, "").slice(0, 24)}`,
        type: "function",
        function: { name: item.name || "", arguments: typeof item.arguments === "string" ? item.arguments : JSON.stringify(item.arguments ?? {}) }
      });
    }
  }
  const message = { role: "assistant", content: text || null, refusal: null };
  if (toolCalls.length > 0) message.tool_calls = toolCalls;
  const usage = json?.usage || {};
  const promptTokens = Number(usage.input_tokens) || 0;
  const completionTokens = Number(usage.output_tokens) || 0;
  let finish = "stop";
  if (toolCalls.length > 0) finish = "tool_calls";
  else if (json?.status === "incomplete" && json?.incomplete_details?.reason === "max_output_tokens") finish = "length";
  return {
    id: json?.id || `chatcmpl-${randomId6()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1e3),
    model: requestedModel,
    choices: [{ index: 0, message, finish_reason: finish, logprobs: null }],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: Number(usage.total_tokens) || promptTokens + completionTokens
    }
  };
}
function createOpenAIStreamFromResponses(upstream, requestedModel, onUsage) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const parser = createSseParser2();
  let firstChunkSent = false;
  let toolIndex = -1;
  const toolItems = /* @__PURE__ */ new Set();
  let promptTokens = 0;
  let completionTokens = 0;
  let streamError = "";
  const sendChunk = (controller, delta, finish = null, withUsage = false) => {
    const chunk = {
      id: `chatcmpl-resp-${randomId6()}`,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1e3),
      model: requestedModel,
      choices: [{ index: 0, delta, finish_reason: finish, logprobs: null }]
    };
    if (withUsage) chunk.usage = { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}

`));
  };
  const handleEvent = (controller, ev) => {
    if (!ev.data || ev.data === "[DONE]") return;
    let payload;
    try {
      payload = JSON.parse(ev.data);
    } catch {
      return;
    }
    const type = payload?.type || ev.event;
    if (!type || !type.startsWith("response.")) return;
    switch (type) {
      case "response.created":
      case "response.in_progress": {
        break;
      }
      case "response.output_item.added": {
        const item = payload?.item || {};
        if (item.type === "function_call") {
          toolItems.add(Number(payload.output_index ?? -1));
          toolIndex += 1;
          sendChunk(controller, {
            tool_calls: [{
              index: toolIndex,
              id: item.call_id || item.id || `call_${randomId6().replace(/-/g, "").slice(0, 24)}`,
              type: "function",
              function: { name: item.name || "", arguments: "" }
            }]
          });
        }
        break;
      }
      case "response.output_text.delta": {
        if (typeof payload.delta === "string" && payload.delta) sendChunk(controller, { content: payload.delta });
        break;
      }
      case "response.reasoning_summary_text.delta":
      case "response.reasoning_text.delta": {
        if (typeof payload.delta === "string" && payload.delta) sendChunk(controller, { reasoning_content: payload.delta });
        break;
      }
      case "response.function_call_arguments.delta": {
        if (typeof payload.delta === "string" && payload.delta && toolItems.has(Number(payload.output_index ?? -1))) {
          sendChunk(controller, { tool_calls: [{ index: toolIndex, function: { arguments: payload.delta } }] });
        }
        break;
      }
      case "response.completed":
      case "response.incomplete": {
        const usage = payload?.response?.usage || {};
        promptTokens = Number(usage.input_tokens) || 0;
        completionTokens = Number(usage.output_tokens) || 0;
        const finish = type === "response.incomplete" ? "length" : "stop";
        sendChunk(controller, {}, toolIndex >= 0 ? "tool_calls" : finish, true);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        if (onUsage) onUsage({ promptTokens, completionTokens });
        break;
      }
      case "response.failed": {
        const msg = payload?.response?.error?.message || "\u4E0A\u6E38\u54CD\u5E94\u5931\u8D25";
        sendChunk(controller, { content: `[codex] ${msg}` }, "stop", true);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        break;
      }
      case "error": {
        streamError = payload?.message || payload?.error?.message || "\u4E0A\u6E38\u6D41\u9519\u8BEF";
        break;
      }
      default:
        break;
    }
  };
  return new ReadableStream({
    start(controller) {
      const reader = upstream.getReader();
      const pump = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (streamError) sendChunk(controller, { content: `[codex] ${streamError}` }, "stop", true);
            if (!firstChunkSent) sendChunk(controller, { role: "assistant", content: "" }, "stop", true);
            controller.close();
            return;
          }
          const text = decoder.decode(value, { stream: true });
          for (const ev of parser.feed(text)) {
            if (!firstChunkSent) {
              firstChunkSent = true;
              sendChunk(controller, { role: "assistant", content: "" });
            }
            handleEvent(controller, ev);
          }
          pump();
        }).catch(() => {
          try {
            controller.close();
          } catch {
          }
        });
      };
      pump();
    }
  });
}
async function collectResponsesStreamToOpenAI(upstream, requestedModel) {
  const decoder = new TextDecoder();
  const parser = createSseParser2();
  const reader = upstream.getReader();
  let text = "";
  let reasoning = "";
  const toolCalls = [];
  const toolIndexByOutput = /* @__PURE__ */ new Map();
  let promptTokens = 0;
  let completionTokens = 0;
  let finish = "stop";
  let failed = "";
  const handle = (ev) => {
    if (!ev.data || ev.data === "[DONE]") return;
    let payload;
    try {
      payload = JSON.parse(ev.data);
    } catch {
      return;
    }
    const type = payload?.type || ev.event;
    if (!type || !type.startsWith("response.")) return;
    switch (type) {
      case "response.output_item.added": {
        const item = payload?.item || {};
        if (item.type === "function_call") {
          toolIndexByOutput.set(Number(payload.output_index ?? -1), toolCalls.length);
          toolCalls.push({
            id: item.call_id || item.id || `call_${randomId6().replace(/-/g, "").slice(0, 24)}`,
            name: item.name || "",
            args: ""
          });
        }
        break;
      }
      case "response.output_text.delta": {
        if (typeof payload.delta === "string") text += payload.delta;
        break;
      }
      case "response.reasoning_summary_text.delta":
      case "response.reasoning_text.delta": {
        if (typeof payload.delta === "string") reasoning += payload.delta;
        break;
      }
      case "response.function_call_arguments.delta": {
        const idx = toolIndexByOutput.get(Number(payload.output_index ?? -1));
        if (idx !== void 0 && typeof payload.delta === "string") toolCalls[idx].args += payload.delta;
        break;
      }
      case "response.completed":
      case "response.incomplete": {
        const usage = payload?.response?.usage || {};
        promptTokens = Number(usage.input_tokens) || 0;
        completionTokens = Number(usage.output_tokens) || 0;
        if (toolCalls.length > 0) finish = "tool_calls";
        else if (type === "response.incomplete") finish = "length";
        break;
      }
      case "response.failed": {
        failed = payload?.response?.error?.message || "\u4E0A\u6E38\u54CD\u5E94\u5931\u8D25";
        break;
      }
      case "error": {
        failed = payload?.message || payload?.error?.message || "\u4E0A\u6E38\u6D41\u9519\u8BEF";
        break;
      }
      default:
        break;
    }
  };
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const ev of parser.feed(decoder.decode(value, { stream: true }))) handle(ev);
  }
  if (failed) throw new Error(failed);
  const message = { role: "assistant", content: text || null, refusal: null };
  if (reasoning) message.reasoning_content = reasoning;
  if (toolCalls.length > 0) {
    message.tool_calls = toolCalls.map((t) => ({
      id: t.id,
      type: "function",
      function: { name: t.name, arguments: t.args || "{}" }
    }));
  }
  return {
    id: `chatcmpl-resp-${randomId6()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1e3),
    model: requestedModel,
    choices: [{ index: 0, message, finish_reason: finish, logprobs: null }],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens
    }
  };
}
function createSseParser2() {
  let buffer = "";
  let currentEvent = "";
  let currentData = "";
  const finish = (out) => {
    if (currentData) out.push({ event: currentEvent, data: currentData });
    currentEvent = "";
    currentData = "";
  };
  return {
    feed(chunk) {
      buffer += chunk;
      const out = [];
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).replace(/\r$/, "");
        buffer = buffer.slice(idx + 1);
        if (line === "") {
          finish(out);
          currentEvent = "";
        } else if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData += (currentData ? "\n" : "") + line.slice(5).trim();
        }
      }
      return out;
    }
  };
}
var init_responses_translate = __esm({
  "src/responses-translate.ts"() {
    "use strict";
  }
});

// src/codex.ts
var codex_exports = {};
__export(codex_exports, {
  buildCodexAuthUrl: () => buildCodexAuthUrl,
  exchangeCodexCode: () => exchangeCodexCode,
  getCodexUpstreamRelay: () => getCodexUpstreamRelay,
  handleCodexRequest: () => handleCodexRequest,
  testCodex: () => testCodex
});
async function getCodexUpstreamRelay(env) {
  try {
    const raw2 = await getKV(env).get(UPSTREAM_RELAY_KEY);
    if (!raw2) return null;
    const cfg = JSON.parse(raw2);
    const url = String(cfg?.url || "").trim().replace(/\/+$/, "");
    const key = String(cfg?.key || "").trim();
    return url && key ? { url, key } : null;
  } catch {
    return null;
  }
}
function relayHeaders(relay, stream) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${relay.key}`,
    "Accept": stream ? "text/event-stream" : "application/json"
  };
}
function relayModelId(p) {
  return `${p.providerId}/${p.modelId}`;
}
function base64UrlDecode(data) {
  const pad = data.length % 4 === 0 ? "" : "=".repeat(4 - data.length % 4);
  return atob(data.replace(/-/g, "+").replace(/_/g, "/") + pad);
}
function parseJwtClaim(token, claim) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return "";
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const value = payload?.[claim];
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
}
async function buildCodexAuthUrl(env) {
  const state = randomHex(16);
  const { verifier, challenge } = await createPkcePair();
  await getKV(env).put(STATE_PREFIX2 + state, JSON.stringify({ verifier }), { expirationTtl: 600 }).catch(() => {
  });
  const params = new URLSearchParams({
    client_id: CODEX_CLIENT_ID,
    response_type: "code",
    redirect_uri: CODEX_REDIRECT_URI,
    scope: CODEX_SCOPE,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "login",
    id_token_add_organizations: "true",
    codex_cli_simplified_flow: "true"
  });
  return { url: `${CODEX_AUTH_URL}?${params.toString()}`, state };
}
function extractCode2(input) {
  const text = (input || "").trim();
  const match2 = text.match(/[?&]code=([^&\s]+)/);
  return match2 ? decodeURIComponent(match2[1]) : text;
}
async function exchangeCodexCode(env, codeOrUrl, state) {
  const raw2 = await getKV(env).get(STATE_PREFIX2 + state);
  if (!raw2) throw new Error("\u6388\u6743\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0810 \u5206\u949F\uFF09\uFF0C\u8BF7\u91CD\u65B0\u70B9\u51FB\u300C\u7528 ChatGPT \u8D26\u53F7\u6388\u6743\u300D");
  await getKV(env).delete(STATE_PREFIX2 + state).catch(() => {
  });
  const { verifier } = JSON.parse(raw2);
  const code = extractCode2(codeOrUrl);
  if (!code) throw new Error("\u672A\u8BC6\u522B\u5230 code\uFF0C\u8BF7\u7C98\u8D34 OpenAI \u8FD4\u56DE\u7684 code \u6216\u6574\u6BB5\u56DE\u8C03\u5730\u5740");
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CODEX_CLIENT_ID,
    code,
    redirect_uri: CODEX_REDIRECT_URI,
    code_verifier: verifier
  });
  const res = await fetch(CODEX_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u6362\u53D6 token \u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.access_token) throw new Error(`\u6362\u53D6 token \u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  if (!json.refresh_token) throw new Error("OpenAI \u672A\u8FD4\u56DE refresh_token\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743");
  const accessToken = json.access_token;
  const accountId = parseJwtClaim(accessToken, "chatgpt_account_id");
  return { refreshToken: json.refresh_token, accessToken, expiresIn: Number(json.expires_in) || 3600, accountId };
}
async function refreshCodexToken(refreshToken) {
  const form = new URLSearchParams({
    client_id: CODEX_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: CODEX_SCOPE
  });
  const res = await fetch(CODEX_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new CodexAuthError(`Codex OAuth \u5237\u65B0\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.access_token) throw new CodexAuthError(`Codex OAuth \u5237\u65B0\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  const accountId = parseJwtClaim(json.access_token, "chatgpt_account_id");
  return {
    accessToken: json.access_token,
    expiresIn: Number(json.expires_in) || 3600,
    refreshToken: json.refresh_token || void 0,
    extra: accountId ? { accountId } : void 0
  };
}
async function getAccessToken3(env, refreshToken) {
  const cached = await resolveAccessToken(env, AT_PREFIX3, refreshToken, refreshCodexToken);
  const accountId = cached.extra?.accountId || "";
  return { token: cached.accessToken, accountId };
}
function apiHeaders2(accessToken, accountId, stream) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    "Accept": stream ? "text/event-stream" : "application/json",
    "User-Agent": CODEX_UA,
    "Originator": CODEX_ORIGINATOR,
    "Version": "0.154.0",
    "Session_id": randomId()
  };
  if (accountId) headers["Chatgpt-Account-Id"] = accountId;
  return headers;
}
async function handleCodexRequest(p, subPath) {
  const relay = await getCodexUpstreamRelay(p.env);
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0 && !relay) {
    return oauthErrorResponse("\u8BE5 codex \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Key\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A OpenAI OAuth refresh_token\uFF08\u53EF\u70B9\u300C\u7528 ChatGPT \u8D26\u53F7\u6388\u6743\u300D\u83B7\u53D6\uFF09", 400, "configuration_error");
  }
  const wantStream = p.body?.stream === true;
  if (subPath === "responses-passthrough") {
    return forwardResponsesNative(p, tokens[0]?.trim() || "", wantStream, relay);
  }
  const { request } = openAIToResponsesRequest({ ...p.body, model: relay ? relayModelId(p) : p.modelId });
  delete request.max_output_tokens;
  request.stream = true;
  let lastError = "";
  let lastStatus = 502;
  const attempts = relay ? [""] : tokens;
  for (const refreshToken of attempts) {
    try {
      let endpoint = `${CODEX_API_BASE}/responses`;
      let headers;
      if (relay) {
        endpoint = `${relay.url}/v1/responses`;
        headers = relayHeaders(relay, true);
      } else {
        const { token, accountId } = await getAccessToken3(p.env, refreshToken);
        headers = apiHeaders2(token, accountId, true);
      }
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(6e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (wantStream && upstream.body) {
        const stream = createOpenAIStreamFromResponses(upstream.body, p.requestedModel, (usage) => {
          defer(p, recordOAuthUsage(p, usage, true, 200));
        });
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" }
        });
      }
      if (!upstream.body) return oauthErrorResponse("\u4E0A\u6E38\u672A\u8FD4\u56DE\u54CD\u5E94\u4F53", 502, "upstream_error");
      let openai;
      try {
        openai = await collectResponsesStreamToOpenAI(upstream.body, p.requestedModel);
      } catch (err) {
        return oauthErrorResponse(err.message || "\u4E0A\u6E38\u6D41\u89E3\u6790\u5931\u8D25", 502, "upstream_error");
      }
      defer(p, recordOAuthUsage(p, {
        promptTokens: Number(openai.usage?.prompt_tokens) || 0,
        completionTokens: Number(openai.usage?.completion_tokens) || 0
      }, true, 200));
      return new Response(JSON.stringify(openai), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = err instanceof CodexAuthError ? 401 : 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 Codex \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, lastStatus === 401 ? "authentication_error" : "key_exhausted");
}
async function forwardResponsesNative(p, refreshToken, wantStream, relay) {
  try {
    const body = { ...p.body };
    if (body.store === void 0) body.store = false;
    let endpoint = `${CODEX_API_BASE}/responses`;
    let headers;
    if (relay) {
      endpoint = `${relay.url}/v1/responses`;
      headers = relayHeaders(relay, wantStream);
      body.model = relayModelId(p);
    } else {
      const { token, accountId } = await getAccessToken3(p.env, refreshToken);
      headers = apiHeaders2(token, accountId, wantStream);
    }
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6e5)
    });
    if (!upstream.ok) {
      return oauthErrorResponse(`HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`, upstream.status, "upstream_error");
    }
    const responseHeaders = {
      "Content-Type": upstream.headers.get("Content-Type") || (wantStream ? "text/event-stream" : "application/json"),
      "Cache-Control": "no-store"
    };
    return new Response(upstream.body, { status: 200, headers: responseHeaders });
  } catch (err) {
    const authFailed = err instanceof CodexAuthError;
    return oauthErrorResponse(err.message || "\u900F\u4F20\u5931\u8D25", authFailed ? 401 : 502, authFailed ? "authentication_error" : "proxy_error");
  }
}
async function testCodex(env, refreshToken, modelId, providerId) {
  const relay = await getCodexUpstreamRelay(env);
  if (relay) {
    if (!providerId) return { success: false, message: "\u672A\u786E\u5B9A\u6E20\u9053 ID\uFF0C\u65E0\u6CD5\u7ECF\u4E2D\u7EE7\u6D4B\u8BD5", statusCode: 0 };
    try {
      const res = await fetch(`${relay.url}/v1/responses`, {
        method: "POST",
        headers: relayHeaders(relay, true),
        body: JSON.stringify({
          model: `${providerId}/${modelId}`,
          input: [{ role: "user", content: [{ type: "input_text", text: "hi" }] }],
          instructions: "",
          store: false,
          stream: true
        }),
        signal: AbortSignal.timeout(3e4)
      });
      if (res.ok) return { success: true, message: "\u8FDE\u63A5\u6210\u529F\uFF08\u7ECF\u4E2D\u7EE7\uFF09", statusCode: 200 };
      return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
    } catch (err) {
      return { success: false, message: err.message || "\u4E2D\u7EE7\u8FDE\u63A5\u5931\u8D25" };
    }
  }
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
  try {
    const { token, accountId } = await getAccessToken3(env, refreshToken);
    const { request } = openAIToResponsesRequest({ model: modelId, messages: [{ role: "user", content: "hi" }], stream: true });
    request.stream = true;
    let res = await fetch(`${CODEX_API_BASE}/responses`, {
      method: "POST",
      headers: apiHeaders2(token, accountId, true),
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(3e4)
    });
    if (!res.ok) {
      const altRequest = { ...request };
      delete altRequest.stream;
      const altRes = await fetch(`${CODEX_API_BASE}/responses`, {
        method: "POST",
        headers: apiHeaders2(token, accountId, false),
        body: JSON.stringify(altRequest),
        signal: AbortSignal.timeout(3e4)
      }).catch(() => null);
      if (altRes && altRes.ok) res = altRes;
    }
    if (res.ok) return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: 200 };
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
var CODEX_CLIENT_ID, CODEX_AUTH_URL, CODEX_TOKEN_URL, CODEX_REDIRECT_URI, CODEX_SCOPE, CODEX_API_BASE, CODEX_UA, CODEX_ORIGINATOR, AT_PREFIX3, STATE_PREFIX2, UPSTREAM_RELAY_KEY, CodexAuthError;
var init_codex = __esm({
  "src/codex.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    init_responses_translate();
    CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
    CODEX_AUTH_URL = "https://auth.openai.com/oauth/authorize";
    CODEX_TOKEN_URL = "https://auth.openai.com/oauth/token";
    CODEX_REDIRECT_URI = "http://localhost:1455/auth/callback";
    CODEX_SCOPE = "openid email profile offline_access";
    CODEX_API_BASE = "https://chatgpt.com/backend-api/codex";
    CODEX_UA = "codex-tui/0.154.0 (Mac OS 26.5.2; arm64) iTerm.app/3.6.11 (codex-tui; 0.154.0)";
    CODEX_ORIGINATOR = "codex-tui";
    AT_PREFIX3 = "codex:at:";
    STATE_PREFIX2 = "codex:oauth:";
    UPSTREAM_RELAY_KEY = "codex:upstream";
    CodexAuthError = class extends Error {
    };
  }
});

// src/kimi.ts
var kimi_exports = {};
__export(kimi_exports, {
  fetchKimiModels: () => fetchKimiModels,
  handleKimiRequest: () => handleKimiRequest,
  normalizeKimiModel: () => normalizeKimiModel,
  pollKimiDeviceFlow: () => pollKimiDeviceFlow,
  startKimiDeviceFlow: () => startKimiDeviceFlow,
  testKimi: () => testKimi
});
function kimiRegion(baseUrl) {
  return /kimi\.com/i.test(baseUrl || "") ? KIMI_CN : KIMI_DEFAULT;
}
function mshHeaders(deviceId) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json",
    "X-Msh-Platform": "CLIProxyAPI",
    "X-Msh-Version": "2.9.1",
    "X-Msh-Device-Name": "ai-gateway",
    "X-Msh-Device-Model": "Cloudflare Workers",
    "X-Msh-Device-Id": deviceId
  };
}
async function startKimiDeviceFlow(env, baseUrl) {
  const region = kimiRegion(baseUrl);
  const deviceId = randomId();
  const form = new URLSearchParams({ client_id: KIMI_CLIENT_ID });
  const res = await fetch(`${region.auth}/api/oauth/device_authorization`, {
    method: "POST",
    headers: mshHeaders(deviceId),
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u8BBE\u5907\u7801\u8BF7\u6C42\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.device_code) throw new Error(`\u8BBE\u5907\u7801\u8BF7\u6C42\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  const state = randomId();
  try {
    await getKV(env).put(DEVICE_PREFIX + state, JSON.stringify({
      deviceCode: json.device_code,
      deviceId,
      auth: region.auth
    }), { expirationTtl: Math.max(300, Number(json.expires_in) || 900) });
    console.log("[kimi] start stored", state.slice(0, 8), "expires_in=", json.expires_in);
  } catch (e) {
    console.error("[kimi] start store failed", state.slice(0, 8), String(e));
    throw new Error("\u8BBE\u5907\u7801\u4F1A\u8BDD\u5199\u5165\u5931\u8D25(\u5B58\u50A8\u5F02\u5E38)\uFF0C\u8BF7\u91CD\u8BD5");
  }
  return {
    state,
    verificationUri: String(json.verification_uri || "https://auth.kimi.com/device"),
    verificationUriComplete: json.verification_uri_complete ? String(json.verification_uri_complete) : void 0,
    userCode: String(json.user_code || ""),
    expiresIn: Number(json.expires_in) || 900,
    interval: Number(json.interval) || 5
  };
}
async function pollKimiDeviceFlow(env, state) {
  const raw2 = await getKV(env).get(DEVICE_PREFIX + state);
  if (!raw2) {
    console.log("[kimi] poll miss", state.slice(0, 8));
    return { status: "error", message: "\u8BBE\u5907\u7801\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
  }
  const session = JSON.parse(raw2);
  if (session.done && session.refreshToken) {
    return { status: "ok", refreshToken: session.refreshToken };
  }
  const { deviceCode, deviceId, auth } = session;
  const form = new URLSearchParams({
    client_id: KIMI_CLIENT_ID,
    device_code: deviceCode,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code"
  });
  const res = await fetch(`${auth || KIMI_DEFAULT.auth}/api/oauth/token`, {
    method: "POST",
    headers: mshHeaders(deviceId),
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: "error", message: `\u8F6E\u8BE2\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}` };
  }
  if (json.error) {
    console.log("[kimi] poll upstream", state.slice(0, 8), json.error);
    if (json.error === "authorization_pending" || json.error === "slow_down") return { status: "pending" };
    if (json.error === "expired_token") {
      await getKV(env).delete(DEVICE_PREFIX + state).catch(() => {
      });
      return { status: "error", message: `\u8BBE\u5907\u7801\u5DF2\u8FC7\u671F\uFF08\u6709\u6548\u671F ${KIMI_DEVICE_TTL_MIN} \u5206\u949F\uFF09\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743` };
    }
    if (json.error === "access_denied") {
      await getKV(env).delete(DEVICE_PREFIX + state).catch(() => {
      });
      return { status: "error", message: "\u7528\u6237\u62D2\u7EDD\u4E86\u6388\u6743" };
    }
    return { status: "error", message: `Kimi OAuth \u9519\u8BEF: ${json.error} ${json.error_description || ""}`.trim() };
  }
  if (!json.access_token) return { status: "error", message: "Kimi \u672A\u8FD4\u56DE access_token" };
  if (!json.refresh_token) return { status: "error", message: "Kimi \u672A\u8FD4\u56DE refresh_token\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743" };
  await getKV(env).put(DEVICE_PREFIX + state, JSON.stringify({
    deviceCode,
    deviceId,
    auth,
    done: true,
    refreshToken: json.refresh_token
  }), { expirationTtl: 3600 }).catch(() => {
  });
  console.log("[kimi] poll ok", state.slice(0, 8));
  return { status: "ok", refreshToken: json.refresh_token };
}
async function refreshKimiToken(region, refreshToken) {
  const deviceId = randomId();
  const form = new URLSearchParams({
    client_id: KIMI_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  const res = await fetch(`${region.auth}/api/oauth/token`, {
    method: "POST",
    headers: mshHeaders(deviceId),
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Kimi OAuth \u5237\u65B0\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (res.status === 401 || res.status === 403) throw new Error(`Kimi refresh_token \u5DF2\u5931\u6548 (HTTP ${res.status})`);
  if (!res.ok || !json.access_token) throw new Error(`Kimi OAuth \u5237\u65B0\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  return { accessToken: json.access_token, expiresIn: Number(json.expires_in) || 3600, refreshToken: json.refresh_token || void 0 };
}
async function getAccessToken4(env, region, refreshToken) {
  return (await resolveAccessToken(env, AT_PREFIX4, refreshToken, (token) => refreshKimiToken(region, token))).accessToken;
}
function normalizeKimiModel(model) {
  const base = (model || "").trim().toLowerCase().replace(/\[1m\]$/i, "");
  return KIMI_MODEL_ALIASES[base] || base || model;
}
async function handleKimiRequest(p, baseUrl) {
  const region = kimiRegion(baseUrl);
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0) {
    return oauthErrorResponse("\u8BE5 kimi \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Key\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A Kimi OAuth refresh_token\uFF08\u53EF\u901A\u8FC7\u8BBE\u5907\u7801\u6388\u6743\u83B7\u53D6\uFF09", 400, "configuration_error");
  }
  const forwardBody = { ...p.body, model: normalizeKimiModel(p.modelId) };
  let lastError = "";
  let lastStatus = 502;
  for (const refreshToken of tokens) {
    try {
      const accessToken = await getAccessToken4(p.env, region, refreshToken);
      const upstream = await fetch(`${region.api}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Accept": p.body?.stream === true ? "text/event-stream" : "application/json"
        },
        body: JSON.stringify(forwardBody),
        signal: AbortSignal.timeout(6e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (p.body?.stream === true && upstream.body) {
        const [toClient, forUsage] = upstream.body.tee();
        defer(p, scanOpenAiStreamUsage(forUsage, (usage) => recordOAuthUsage(p, usage, true, 200)));
        return new Response(toClient, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" }
        });
      }
      const rawText = await upstream.text();
      let json;
      try {
        json = JSON.parse(rawText);
      } catch {
        return oauthErrorResponse(`\u4E0A\u6E38\u8FD4\u56DE\u975E JSON: ${rawText.slice(0, 200)}`, 502, "upstream_error");
      }
      defer(p, recordOAuthUsage(p, {
        promptTokens: Number(json?.usage?.prompt_tokens) || 0,
        completionTokens: Number(json?.usage?.completion_tokens) || 0
      }, true, 200));
      return new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 Kimi \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function scanOpenAiStreamUsage(stream, onUsage) {
  try {
    const text = await new Response(stream).text();
    let usage = { promptTokens: 0, completionTokens: 0 };
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        if (json?.usage) {
          usage = {
            promptTokens: Number(json.usage.prompt_tokens) || 0,
            completionTokens: Number(json.usage.completion_tokens) || 0
          };
        }
      } catch {
      }
    }
    await onUsage(usage);
  } catch {
  }
}
async function testKimi(env, refreshToken, modelId, baseUrl) {
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
  const region = kimiRegion(baseUrl);
  try {
    const accessToken = await getAccessToken4(env, region, refreshToken);
    const res = await fetch(`${region.api}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ model: normalizeKimiModel(modelId), messages: [{ role: "user", content: "hi" }], max_tokens: 1 }),
      signal: AbortSignal.timeout(3e4)
    });
    if (res.ok) return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: 200 };
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
async function fetchKimiModels(env, refreshToken, baseUrl) {
  const region = kimiRegion(baseUrl);
  try {
    const accessToken = await getAccessToken4(env, region, refreshToken);
    const res = await fetch(`${region.api}/v1/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      signal: AbortSignal.timeout(3e4)
    });
    const text = await res.text();
    if (!res.ok) return { success: false, models: [], message: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return { success: false, models: [], message: "\u8FD4\u56DE\u975E JSON" };
    }
    const rows = Array.isArray(json?.data) ? json.data : [];
    const models = rows.map((m) => String(typeof m === "string" ? m : m?.id || "")).filter((id) => id);
    if (models.length === 0) return { success: false, models: [], message: "\u4E0A\u6E38\u672A\u8FD4\u56DE\u6A21\u578B\u5217\u8868\uFF0C\u8BF7\u624B\u52A8\u586B\u5199\uFF08kimi-for-coding \u7B49\uFF09" };
    return { success: true, models: [...new Set(models)] };
  } catch (err) {
    return { success: false, models: [], message: err.message || "\u62C9\u53D6\u5931\u8D25" };
  }
}
var KIMI_CLIENT_ID, KIMI_INTL, KIMI_CN, KIMI_DEFAULT, AT_PREFIX4, DEVICE_PREFIX, KIMI_DEVICE_TTL_MIN, KIMI_MODEL_ALIASES;
var init_kimi = __esm({
  "src/kimi.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    KIMI_CLIENT_ID = "17e5f671-d194-4dfb-9706-5516cb48c098";
    KIMI_INTL = { auth: "https://auth.kimi.ai", api: "https://api.kimi.ai/coding" };
    KIMI_CN = { auth: "https://auth.kimi.com", api: "https://api.kimi.com/coding" };
    KIMI_DEFAULT = KIMI_INTL;
    AT_PREFIX4 = "kimi:at:";
    DEVICE_PREFIX = "kimi:device:";
    KIMI_DEVICE_TTL_MIN = 30;
    KIMI_MODEL_ALIASES = {
      "kimi-k2.8": "kimi-for-coding",
      "kimi-k2.8-code": "kimi-for-coding",
      "kimi-k2.8-preview": "kimi-for-coding",
      "kimi-k2.7-code": "kimi-for-coding",
      "kimi-k2.5": "kimi-for-coding",
      "kimi-k2-thinking": "kimi-for-coding",
      "kimi-k2": "kimi-for-coding",
      "k2.8": "kimi-for-coding",
      "kimi-for-coding-highspeed": "kimi-for-coding-highspeed",
      "kimi-k2.7-code-highspeed": "kimi-for-coding-highspeed",
      "kimi-k2.8-highspeed": "kimi-for-coding-highspeed"
    };
  }
});

// src/qwen.ts
var qwen_exports = {};
__export(qwen_exports, {
  QWEN_DEFAULT_MODELS: () => QWEN_DEFAULT_MODELS,
  fetchQwenModels: () => fetchQwenModels,
  handleQwenRequest: () => handleQwenRequest,
  pollQwenDeviceFlow: () => pollQwenDeviceFlow,
  startQwenDeviceFlow: () => startQwenDeviceFlow,
  testQwen: () => testQwen
});
function qwenApiHeaders(accessToken, stream) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    "Accept": stream ? "text/event-stream" : "application/json",
    "User-Agent": QWEN_UA,
    "X-DashScope-AuthType": "qwen-oauth",
    "X-DashScope-CacheControl": "enable",
    "X-DashScope-UserAgent": QWEN_UA
  };
}
function normalizeResourceBase(resourceUrl) {
  const raw2 = (resourceUrl || "").trim();
  if (!raw2) return QWEN_DEFAULT_BASE;
  const withScheme = /^https?:\/\//i.test(raw2) ? raw2 : `https://${raw2}`;
  return withScheme.replace(/\/$/, "").endsWith("/v1") ? withScheme.replace(/\/$/, "") : `${withScheme.replace(/\/$/, "")}/v1`;
}
async function startQwenDeviceFlow(env) {
  const state = randomId();
  const { verifier, challenge } = await createPkcePair();
  const form = new URLSearchParams({
    client_id: QWEN_CLIENT_ID,
    scope: QWEN_SCOPE,
    code_challenge: challenge,
    code_challenge_method: "S256"
  });
  const res = await fetch(QWEN_DEVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", "User-Agent": QWEN_UA },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Qwen \u8BBE\u5907\u7801\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.device_code) throw new Error(`Qwen \u8BBE\u5907\u7801\u8BF7\u6C42\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  await getKV(env).put(DEVICE_PREFIX2 + state, JSON.stringify({ deviceCode: json.device_code, verifier }), {
    expirationTtl: Math.max(300, Number(json.expires_in) || 900)
  }).catch(() => {
  });
  return {
    state,
    verificationUri: String(json.verification_uri || "https://chat.qwen.ai/authorize"),
    verificationUriComplete: json.verification_uri_complete ? String(json.verification_uri_complete) : void 0,
    userCode: String(json.user_code || ""),
    expiresIn: Number(json.expires_in) || 900,
    // Qwen 设备码响应不含 interval，官方客户端按 2s 轮询
    interval: Number(json.interval) || 2
  };
}
async function pollQwenDeviceFlow(env, state) {
  const raw2 = await getKV(env).get(DEVICE_PREFIX2 + state);
  if (!raw2) return { status: "error", message: "\u8BBE\u5907\u7801\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
  const { deviceCode, verifier } = JSON.parse(raw2);
  const form = new URLSearchParams({
    grant_type: QWEN_DEVICE_GRANT,
    client_id: QWEN_CLIENT_ID,
    device_code: deviceCode,
    code_verifier: verifier
  });
  const res = await fetch(QWEN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", "User-Agent": QWEN_UA },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: "error", message: `Qwen \u6388\u6743\u670D\u52A1\u4E0D\u53EF\u7528\uFF1Atoken \u7AEF\u70B9\u8FD4\u56DE HTTP ${res.status} \u975E JSON\uFF08\u5B98\u65B9\u514D\u8D39 OAuth \u53EF\u80FD\u5DF2\u505C\u6B62\uFF0C\u793E\u533A\u53CD\u9988 2026 \u5E74\u514D\u8D39\u989D\u5EA6\u5DF2\u4E0B\u7EBF\uFF09\u3002\u5982\u4ECD\u9700\u8981 Qwen\uFF0C\u8BF7\u6539\u7528\u300COpenAI \u517C\u5BB9\u300D\u6E20\u9053 + DashScope API Key\u3002` };
  }
  if (json.error) {
    if (json.error === "authorization_pending" || json.error === "slow_down") return { status: "pending" };
    if (json.error === "expired_token") {
      await getKV(env).delete(DEVICE_PREFIX2 + state).catch(() => {
      });
      return { status: "error", message: "\u8BBE\u5907\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
    }
    if (json.error === "access_denied") {
      await getKV(env).delete(DEVICE_PREFIX2 + state).catch(() => {
      });
      return { status: "error", message: "\u7528\u6237\u62D2\u7EDD\u4E86\u6388\u6743" };
    }
    return { status: "error", message: `Qwen OAuth \u9519\u8BEF: ${json.error} ${json.error_description || ""}`.trim() };
  }
  if (!json.access_token) return { status: "error", message: "Qwen \u672A\u8FD4\u56DE access_token" };
  if (!json.refresh_token) return { status: "error", message: "Qwen \u672A\u8FD4\u56DE refresh_token\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743" };
  await getKV(env).delete(DEVICE_PREFIX2 + state).catch(() => {
  });
  return { status: "ok", refreshToken: json.refresh_token };
}
async function refreshQwenToken(refreshToken) {
  const form = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: QWEN_CLIENT_ID
  });
  const res = await fetch(QWEN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", "User-Agent": QWEN_UA },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Qwen \u6388\u6743\u670D\u52A1\u4E0D\u53EF\u7528\uFF1Atoken \u7AEF\u70B9\u8FD4\u56DE HTTP ${res.status} \u975E JSON\uFF08\u5B98\u65B9\u514D\u8D39 OAuth \u53EF\u80FD\u5DF2\u505C\u6B62\uFF09\u3002\u5982\u4ECD\u9700\u8981 Qwen\uFF0C\u8BF7\u6539\u7528\u300COpenAI \u517C\u5BB9\u300D\u6E20\u9053 + DashScope API Key\u3002`);
  }
  if (res.status === 400 || res.status === 401) throw new Error(`Qwen refresh_token \u5DF2\u5931\u6548 (HTTP ${res.status})\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743`);
  if (!res.ok || !json.access_token) throw new Error(`Qwen OAuth \u5237\u65B0\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  return {
    accessToken: json.access_token,
    expiresIn: Number(json.expires_in) || 3600,
    refreshToken: json.refresh_token || void 0,
    extra: json.resource_url ? { resourceUrl: String(json.resource_url) } : void 0
  };
}
async function getAccessTokenWithBase(env, refreshToken) {
  const cached = await resolveAccessToken(env, AT_PREFIX5, refreshToken, refreshQwenToken);
  const base = normalizeResourceBase(cached.extra?.resourceUrl);
  return { token: cached.accessToken, base };
}
async function handleQwenRequest(p) {
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0) {
    return oauthErrorResponse("\u8BE5 qwen \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Key\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A Qwen OAuth refresh_token\uFF08\u53EF\u70B9\u300C\u6388\u6743\u767B\u5F55\u300D\u7528\u8BBE\u5907\u7801\u83B7\u53D6\uFF09", 400, "configuration_error");
  }
  const wantStream = p.body?.stream === true;
  let lastError = "";
  let lastStatus = 502;
  for (const refreshToken of tokens) {
    try {
      const { token, base } = await getAccessTokenWithBase(p.env, refreshToken);
      const upstream = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: qwenApiHeaders(token, wantStream),
        // 上游只认裸模型 ID(带 providerId/ 前缀会被拒绝)
        body: JSON.stringify({ ...p.body, model: p.modelId }),
        signal: AbortSignal.timeout(6e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (wantStream && upstream.body) {
        const [toClient, forUsage] = upstream.body.tee();
        defer(p, scanOpenAiStreamUsage2(forUsage, (usage) => recordOAuthUsage(p, usage, true, 200)));
        return new Response(toClient, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" }
        });
      }
      const rawText = await upstream.text();
      let json;
      try {
        json = JSON.parse(rawText);
      } catch {
        return oauthErrorResponse(`\u4E0A\u6E38\u8FD4\u56DE\u975E JSON: ${rawText.slice(0, 200)}`, 502, "upstream_error");
      }
      defer(p, recordOAuthUsage(p, {
        promptTokens: Number(json?.usage?.prompt_tokens) || 0,
        completionTokens: Number(json?.usage?.completion_tokens) || 0
      }, true, 200));
      return new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 Qwen \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function scanOpenAiStreamUsage2(stream, onUsage) {
  try {
    const text = await new Response(stream).text();
    let usage = { promptTokens: 0, completionTokens: 0 };
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        if (json?.usage) {
          usage = { promptTokens: Number(json.usage.prompt_tokens) || 0, completionTokens: Number(json.usage.completion_tokens) || 0 };
        }
      } catch {
      }
    }
    await onUsage(usage);
  } catch {
  }
}
async function testQwen(env, refreshToken, modelId) {
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
  try {
    const { token, base } = await getAccessTokenWithBase(env, refreshToken);
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: qwenApiHeaders(token, false),
      body: JSON.stringify({ model: modelId || "coder-model", messages: [{ role: "user", content: "hi" }], max_tokens: 1 }),
      signal: AbortSignal.timeout(3e4)
    });
    if (res.ok) return { success: true, message: `\u8FDE\u63A5\u6210\u529F\uFF08${base}\uFF09`, statusCode: 200 };
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
function fetchQwenModels() {
  return { success: true, models: [...QWEN_DEFAULT_MODELS] };
}
var QWEN_CLIENT_ID, QWEN_DEVICE_URL, QWEN_TOKEN_URL, QWEN_SCOPE, QWEN_DEVICE_GRANT, QWEN_DEFAULT_BASE, QWEN_DEFAULT_MODELS, QWEN_UA, AT_PREFIX5, DEVICE_PREFIX2;
var init_qwen = __esm({
  "src/qwen.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    QWEN_CLIENT_ID = "f0304373b74a44d2b584a3fb70ca9e56";
    QWEN_DEVICE_URL = "https://chat.qwen.ai/api/v1/oauth2/device/code";
    QWEN_TOKEN_URL = "https://chat.qwen.ai/api/v1/oauth2/token";
    QWEN_SCOPE = "openid profile email model.completion";
    QWEN_DEVICE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";
    QWEN_DEFAULT_BASE = "https://portal.qwen.ai/v1";
    QWEN_DEFAULT_MODELS = ["coder-model", "qwen3-coder-plus", "qwen3-coder-flash", "vision-model"];
    QWEN_UA = "QwenCode/0.9.1 (darwin; arm64)";
    AT_PREFIX5 = "qwen:at:";
    DEVICE_PREFIX2 = "qwen:device:";
  }
});

// src/deepseek-pow.ts
function keccakF(lo, hi, startRound = 1) {
  const cLo = new Uint32Array(5), cHi = new Uint32Array(5);
  const dLo = new Uint32Array(5), dHi = new Uint32Array(5);
  const bLo = new Uint32Array(25), bHi = new Uint32Array(25);
  for (let r = startRound; r < 24; r++) {
    for (let x = 0; x < 5; x++) {
      cLo[x] = lo[x] ^ lo[x + 5] ^ lo[x + 10] ^ lo[x + 15] ^ lo[x + 20];
      cHi[x] = hi[x] ^ hi[x + 5] ^ hi[x + 10] ^ hi[x + 15] ^ hi[x + 20];
    }
    for (let x = 0; x < 5; x++) {
      const n = (x + 1) % 5, p = (x + 4) % 5;
      dLo[x] = cLo[p] ^ (cLo[n] << 1 | cHi[n] >>> 31);
      dHi[x] = cHi[p] ^ (cHi[n] << 1 | cLo[n] >>> 31);
    }
    for (let i = 0; i < 25; i++) {
      lo[i] ^= dLo[i % 5];
      hi[i] ^= dHi[i % 5];
    }
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const src = x + 5 * y;
        const dest = y + 5 * ((2 * x + 3 * y) % 5);
        const k = RHO[src];
        if (k === 0) {
          bLo[dest] = lo[src];
          bHi[dest] = hi[src];
        } else if (k < 32) {
          bLo[dest] = lo[src] << k | hi[src] >>> 32 - k;
          bHi[dest] = hi[src] << k | lo[src] >>> 32 - k;
        } else {
          const kk = k - 32;
          bLo[dest] = kk === 0 ? hi[src] : hi[src] << kk | lo[src] >>> 32 - kk;
          bHi[dest] = kk === 0 ? lo[src] : lo[src] << kk | hi[src] >>> 32 - kk;
        }
      }
    }
    for (let y = 0; y < 5; y++) {
      const o = 5 * y;
      for (let x = 0; x < 5; x++) {
        const n1 = o + (x + 1) % 5, n2 = o + (x + 2) % 5;
        lo[o + x] = bLo[o + x] ^ ~bLo[n1] & bLo[n2];
        hi[o + x] = bHi[o + x] ^ ~bHi[n1] & bHi[n2];
      }
    }
    lo[0] ^= RC_LO[r];
    hi[0] ^= RC_HI[r];
  }
}
function absorbBlock(lo, hi, buf, off, startRound) {
  for (let i = 0; i < RATE / 8; i++) {
    const p = off + i * 8;
    lo[i] ^= buf[p] | buf[p + 1] << 8 | buf[p + 2] << 16 | buf[p + 3] << 24;
    hi[i] ^= buf[p + 4] | buf[p + 5] << 8 | buf[p + 6] << 16 | buf[p + 7] << 24;
  }
  keccakF(lo, hi, startRound);
}
function buildPowPrefix(salt, expireAt) {
  return `${salt}_${expireAt}_`;
}
function solveDeepseekPow(prefix, challengeHex, difficulty, maxMs = 25e3) {
  if (!challengeHex || challengeHex.length !== 64) return null;
  const target = new Uint8Array(32);
  for (let i = 0; i < 32; i++) target[i] = parseInt(challengeHex.substr(i * 2, 2), 16);
  const T = new Uint32Array(8);
  for (let i = 0; i < 8; i++) T[i] = target[i * 4] | target[i * 4 + 1] << 8 | target[i * 4 + 2] << 16 | target[i * 4 + 3] << 24;
  const prefixBytes = new TextEncoder().encode(prefix);
  const lo = new Uint32Array(25), hi = new Uint32Array(25);
  let off = 0;
  while (off + RATE <= prefixBytes.length) {
    absorbBlock(lo, hi, prefixBytes, off, 1);
    off += RATE;
  }
  const tailLen = prefixBytes.length - off;
  const tail = prefixBytes.subarray(off);
  const numBuf = new Uint8Array(20);
  const block = new Uint8Array(RATE);
  const sLo = new Uint32Array(25), sHi = new Uint32Array(25);
  const started = Date.now();
  for (let n = 0; n < difficulty; n++) {
    if ((n & 1023) === 0 && Date.now() - started > maxMs) return null;
    let v = n, pos = 20;
    if (v === 0) {
      pos--;
      numBuf[pos] = 48;
    } else {
      while (v > 0) {
        pos--;
        numBuf[pos] = 48 + v % 10;
        v = v / 10 | 0;
      }
    }
    const numLen = 20 - pos;
    sLo.set(lo);
    sHi.set(hi);
    block.fill(0);
    block.set(tail, 0);
    block.set(numBuf.subarray(pos, 20), tailLen);
    const total = tailLen + numLen;
    block[total] = 6;
    block[RATE - 1] |= 128;
    absorbBlock(sLo, sHi, block, 0, 1);
    if (sLo[0] === T[0] && sHi[0] === T[1] && sLo[1] === T[2] && sHi[1] === T[3] && sLo[2] === T[4] && sHi[2] === T[5] && sLo[3] === T[6] && sHi[3] === T[7]) return n;
  }
  return null;
}
function buildPowHeader(c, answer) {
  const payload = JSON.stringify({
    algorithm: c.algorithm,
    challenge: c.challenge,
    salt: c.salt,
    answer,
    signature: c.signature || "",
    target_path: c.target_path || "/api/v0/chat/completion"
  });
  const bytes = new TextEncoder().encode(payload);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function solveAndBuildPowHeader(c, maxMs = 25e3) {
  if (c.algorithm !== "DeepSeekHashV1") return null;
  const difficulty = Number(c.difficulty) > 0 ? Number(c.difficulty) : 144e3;
  const answer = solveDeepseekPow(buildPowPrefix(c.salt, c.expire_at), c.challenge, difficulty, maxMs);
  if (answer === null) return null;
  return buildPowHeader(c, answer);
}
var RC_LO, RC_HI, RHO, RATE;
var init_deepseek_pow = __esm({
  "src/deepseek-pow.ts"() {
    "use strict";
    RC_LO = new Uint32Array([
      1,
      32898,
      32906,
      2147516416,
      32907,
      2147483649,
      2147516545,
      32777,
      138,
      136,
      2147516425,
      2147483658,
      2147516555,
      139,
      32905,
      32771,
      32770,
      128,
      32778,
      2147483658,
      2147516545,
      32896,
      2147483649,
      2147516424
    ]);
    RC_HI = new Uint32Array([
      0,
      0,
      2147483648,
      2147483648,
      0,
      0,
      2147483648,
      2147483648,
      0,
      0,
      0,
      0,
      0,
      2147483648,
      2147483648,
      2147483648,
      2147483648,
      2147483648,
      0,
      2147483648,
      2147483648,
      2147483648,
      0,
      2147483648
    ]);
    RHO = new Uint8Array([0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14]);
    RATE = 136;
  }
});

// src/deepseek-tools.ts
function normTagChar(c) {
  if (c === "\uFF5C") return "|";
  if (c === "\u2581") return "_";
  return c;
}
function eqTagChar(a, b) {
  return a === b || normTagChar(a) === normTagChar(b);
}
function fuzzyMatchTag(haystack, partial) {
  const n = [...partial];
  const h = [...haystack];
  if (n.length === 0 || h.length < n.length) return null;
  for (let start = 0; start <= h.length - n.length; start++) {
    let matched = true;
    for (let j = 0; j < n.length; j++) {
      if (!eqTagChar(n[j], h[start + j])) {
        matched = false;
        break;
      }
    }
    if (!matched) continue;
    const bytePos = h.slice(0, start).join("").length;
    const text = h.slice(start, start + n.length).join("");
    return { index: bytePos, text };
  }
  return null;
}
function findStartTag(s, tag = TOOL_CALL_START) {
  const partial = tag.replace(/>+$/, "");
  const pos = s.indexOf(partial);
  if (pos >= 0) return { index: pos, text: s.slice(pos, pos + partial.length) };
  return fuzzyMatchTag(s, partial);
}
function findEndTag(s, tag = TOOL_CALL_END) {
  const partial = tag.replace(/>+$/, "");
  const pos = s.indexOf(partial);
  if (pos >= 0) return { index: pos, text: s.slice(pos, pos + partial.length) };
  return fuzzyMatchTag(s, partial);
}
function exampleArgs(name) {
  const args = {
    Read: '"file_path": "/path/to/file"',
    read_file: '"file_path": "/path/to/file"',
    Bash: '"command": "ls -la"',
    execute_command: '"command": "ls -la"',
    exec_command: '"command": "ls -la"',
    Write: '"file_path": "/path/to/file", "content": "hello"',
    write_to_file: '"file_path": "/path/to/file", "content": "hello"',
    Edit: '"file_path": "/path/to/file", "old_string": "foo", "new_string": "bar"',
    Glob: '"pattern": "**/*.rs", "path": "."',
    search_files: '"query": "TODO", "path": "."',
    list_files: '"path": "."',
    get_weather: '"city": "Beijing"',
    get_time: '"timezone": "Asia/Shanghai"'
  };
  return "{" + (args[name] || '"key": "value"') + "}";
}
function exampleNestedArgs(name) {
  if (name === "Edit") {
    return '{"file_path": "/path/to/file", "edits": [{"old_string": "foo", "new_string": "bar"}, {"old_string": "x", "new_string": "y"}]}';
  }
  return '{"config": {"enabled": true, "items": ["a", "b"]}}';
}
function formatFunction(func) {
  const name = (func.name || "").trim();
  if (!name) throw new Error("tools \u4E2D function \u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5 'name'");
  const params = JSON.stringify(func.parameters ?? {});
  const callExample = `${TOOL_CALL_START}[{"name": "${name}", "arguments": ${params}}]${TOOL_CALL_END}`;
  const desc = (func.description || "").trim();
  const descBlock = desc ? "~~~markdown\n  " + desc + "\n~~~\n" : "  \u65E0\u63CF\u8FF0";
  return `- **${name}** (function):
  - \u8C03\u7528\u65B9\u6CD5: \`${callExample}\`
  - \u7B80\u8981\u8BF4\u660E:
${descBlock}`;
}
function formatCustom(custom) {
  const name = (custom.name || "").trim();
  const desc = (custom.description || "").trim();
  let method = "\u65E0\u7EA6\u675F";
  const fmt = custom.format;
  if (fmt) {
    if (fmt.type === "text") method = "text";
    else if (fmt.syntax) method = `grammar(syntax: ${fmt.syntax})`;
    else if (fmt.grammar?.syntax) method = `grammar(syntax: ${fmt.grammar.syntax})`;
  }
  return `- **${name}** (custom):
  - \u8C03\u7528\u65B9\u6CD5: \`${method}\`
  - \u7B80\u8981\u8BF4\u660E: ${desc || "\u65E0\u63CF\u8FF0"}`;
}
function formatTool(tool, idx) {
  if (tool.type === "function") {
    if (!tool.function) throw new Error(`tools[${idx}] \u7C7B\u578B\u4E3A 'function' \u65F6\u5FC5\u987B\u63D0\u4F9B function \u5B9A\u4E49`);
    return formatFunction(tool.function);
  }
  if (tool.type === "custom") {
    if (!tool.custom) throw new Error(`tools[${idx}] \u7C7B\u578B\u4E3A 'custom' \u65F6\u5FC5\u987B\u63D0\u4F9B custom \u5B9A\u4E49`);
    return formatCustom(tool.custom);
  }
  throw new Error(`tools[${idx}] \u4E0D\u652F\u6301\u7684\u7C7B\u578B: ${tool.type}`);
}
function buildToolInstructionBlock(tools) {
  const L = [];
  L.push("**\u5DE5\u5177\u8C03\u7528\u683C\u5F0F \u2014 \u8BF7\u4E25\u683C\u9075\u5B88\uFF1A**");
  L.push("");
  L.push("\u5C06 JSON \u6570\u7EC4\u5305\u88F9\u5728\u5DE5\u5177\u8C03\u7528\u6807\u8BB0\u4E2D\uFF1A");
  L.push("");
  L.push(`${TOOL_CALL_START}[{"name": "\u5DE5\u5177\u540D", "arguments": {\u53C2\u6570JSON}}]${TOOL_CALL_END}`);
  L.push("");
  L.push("**\u89C4\u5219\uFF1A**");
  L.push("");
  L.push("**\u6838\u5FC3\uFF1A\u51B3\u5B9A\u8C03\u7528\u5DE5\u5177\u65F6\uFF0C\u4F60\u7684\u54CD\u5E94\u4E2D\u53EA\u5141\u8BB8\u51FA\u73B0\u5DE5\u5177\u8C03\u7528\u6587\u672C\u672C\u8EAB\uFF0C\u7981\u6B62\u4EFB\u4F55\u89E3\u91CA\u3001\u524D\u7F00\u3001\u603B\u7ED3\u3001\u95EE\u5019\u8BED\u7B49\u989D\u5916\u5185\u5BB9\u3002**");
  L.push("");
  L.push(`1. JSON \u6570\u7EC4\u5FC5\u987B\u4EE5 \`${TOOL_CALL_START}\` \u5F00\u5934\u3001\u4EE5 \`${TOOL_CALL_END}\` \u7ED3\u5C3E\uFF0C\u5C06\u6570\u7EC4**\u5B8C\u6574\u5305\u88F9**\u5728\u6807\u8BB0\u5185\u3002`);
  L.push("2. \u6240\u6709\u5DE5\u5177\u8C03\u7528\u5FC5\u987B\u653E\u5728**\u4E00\u4E2A** JSON \u6570\u7EC4\u4E2D\uFF0C\u591A\u4E2A\u8C03\u7528\u7528\u9017\u53F7\u5206\u9694\u3002");
  L.push(`3. \u8F93\u51FA \`${TOOL_CALL_END}\` \u540E**\u7ACB\u5373\u505C\u6B62**\uFF0C\u4E0D\u5F97\u6DFB\u52A0\u540E\u7EED\u6587\u672C\u3001XML \u6807\u7B7E\u6216\u8BF4\u660E\u6587\u5B57\u3002`);
  L.push("4. \u4E0D\u8981\u5C06\u5DE5\u5177\u8C03\u7528\u5305\u88F9\u5728 markdown \u4EE3\u7801\u5757\u4E2D\u3002");
  L.push("5. \u5B57\u7B26\u4E32\u53C2\u6570\u503C\u5FC5\u987B\u7528**\u53CC\u5F15\u53F7**\u5305\u88F9\uFF08JSON \u6807\u51C6\uFF09\u3002");
  L.push(`6. \u51B3\u5B9A\u8C03\u7528\u5DE5\u5177\u65F6\uFF0C\u8F93\u51FA\u7684**\u7B2C\u4E00\u4E2A\u975E\u7A7A\u767D\u5B57\u7B26**\u5FC5\u987B\u662F \`${TOOL_CALL_START}\`\u3002`);
  L.push(`7. \u6574\u4E2A\u54CD\u5E94\u4E2D**\u53EA\u80FD\u51FA\u73B0\u4E00\u4E2A \`${TOOL_CALL_START}\` \u5757**\uFF0C\u4E0D\u8981\u91CD\u590D\u8F93\u51FA\u591A\u4E2A \`${TOOL_CALL_START}\` \u5757\u3002`);
  L.push(`8. **\u91CD\u590D\uFF1A** \u6574\u4E2A\u54CD\u5E94\u4E2D\u53EA\u80FD\u51FA\u73B0\u4E00\u4E2A \`${TOOL_CALL_START}\` \u5757\uFF0C\u4E0D\u8981\u91CD\u590D\u8F93\u51FA\u3002\u5982\u679C\u4F60\u5DF2\u7ECF\u8F93\u51FA\u4E86\u4E00\u4E2A \`${TOOL_CALL_START}\` \u5757\uFF0C\u7EDD\u5BF9\u4E0D\u8981\u518D\u8F93\u51FA\u7B2C\u4E8C\u4E2A\u3002`);
  L.push(`9. **\u91CD\u590D\uFF1A** \u7981\u6B62\u5728 \`${TOOL_CALL_START}\` \u4E4B\u524D\u8F93\u51FA\u4EFB\u4F55\u6587\u5B57\uFF0C\u5305\u62EC\u4F46\u4E0D\u9650\u4E8E\u89E3\u91CA\u3001\u786E\u8BA4\u3001\u603B\u7ED3\u3001\u95EE\u5019\u8BED\u3002`);
  L.push("10. \u4E0D\u8981\u628A\u56DE\u590D\u548C\u5DE5\u5177\u8C03\u7528\u7F6E\u4E8E\u601D\u8003\u5185\u5BB9\u4E2D\u3002");
  L.push("11. **\u91CD\u590D\uFF1A** \u601D\u8003\u5185\u5BB9\uFF08<think> \u6807\u7B7E\u5185\uFF09\u4EC5\u7528\u4E8E\u5185\u90E8\u63A8\u7406\u8FC7\u7A0B\uFF0C\u4E0D\u8981\u5C06\u6700\u7EC8\u56DE\u590D\u6216\u5DE5\u5177\u8C03\u7528\u653E\u5728 <think> \u6807\u7B7E\u4E2D\u3002");
  L.push("");
  const names = tools.map((t) => t.function?.name || t.custom?.name || "").filter(Boolean);
  const a = names[0] || "tool_a";
  L.push("**\u6B63\u786E\u793A\u4F8B\uFF1A**");
  L.push("");
  L.push("**\u793A\u4F8BA** \u2014 \u8C03\u7528\u4E00\u4E2A\u5DE5\u5177\uFF1A");
  L.push(`${TOOL_CALL_START}[{"name": "${a}", "arguments": ${exampleArgs(a)}}]${TOOL_CALL_END}`);
  L.push("");
  if (names.length >= 2) {
    L.push("**\u793A\u4F8BB** \u2014 \u540C\u65F6\u8C03\u7528\u591A\u4E2A\u5DE5\u5177\uFF08\u4E00\u4E2A\u6570\u7EC4\u5305\u542B\u5168\u90E8\u8C03\u7528\uFF09\uFF1A");
    L.push(`${TOOL_CALL_START}[${names.slice(0, 2).map((n) => `{"name": "${n}", "arguments": ${exampleArgs(n)}}`).join(", ")}]${TOOL_CALL_END}`);
    L.push("");
  }
  if (names.length >= 3) {
    L.push("**\u793A\u4F8BC** \u2014 \u540C\u65F6\u8C03\u7528\u4E09\u4E2A\u5DE5\u5177\uFF08\u6240\u6709\u8C03\u7528\u5728\u4E00\u4E2A\u6570\u7EC4\u4E2D\uFF09\uFF1A");
    L.push(`${TOOL_CALL_START}[${names.slice(0, 3).map((n) => `{"name": "${n}", "arguments": ${exampleArgs(n)}}`).join(", ")}]${TOOL_CALL_END}`);
    L.push("");
  }
  L.push("**\u793A\u4F8BD** \u2014 \u53C2\u6570\u503C\u4E3A\u5D4C\u5957\u5BF9\u8C61/\u6570\u7EC4\uFF08\u4ECD\u7136\u662F\u6807\u51C6 JSON\uFF09\uFF1A");
  L.push(`${TOOL_CALL_START}[{"name": "${a}", "arguments": ${exampleNestedArgs(a)}}]${TOOL_CALL_END}`);
  L.push("");
  return L.join("\n");
}
function buildInstructionText(body, tools) {
  const lines = [];
  const tcRaw = body.tool_choice;
  const mode = typeof tcRaw === "string" ? tcRaw : tcRaw && typeof tcRaw === "object" ? tcRaw.type : void 0;
  if (mode === "required") {
    lines.push("**\u6CE8\u610F\uFF1A\u4F60\u5FC5\u987B\u8C03\u7528\u4E00\u4E2A\u6216\u591A\u4E2A\u5DE5\u5177\u3002**");
  } else if (tcRaw && typeof tcRaw === "object" && (tcRaw.type === "function" || tcRaw.function)) {
    const name = tcRaw.function?.name || tcRaw.name;
    if (name) lines.push(`**\u6CE8\u610F\uFF1A\u4F60\u5FC5\u987B\u8C03\u7528 '${name}' \u5DE5\u5177\u3002**`);
  } else if (tcRaw && typeof tcRaw === "object" && Array.isArray(tcRaw.allowed_tools)) {
    const allowed = tcRaw.allowed_tools.map((t) => t?.function?.name || t?.name).filter((s) => typeof s === "string" && s);
    if (allowed.length) lines.push(`**\u6CE8\u610F\uFF1A**\u4F60\u53EA\u80FD\u4ECE\u4EE5\u4E0B\u5141\u8BB8\u7684\u5DE5\u5177\u4E2D\u9009\u62E9\uFF1A${allowed.join(", ")}\u3002`);
    if (tcRaw.mode === "required") lines.push("**\u6CE8\u610F\uFF1A\u4F60\u5FC5\u987B\u8C03\u7528\u4E00\u4E2A\u6216\u591A\u4E2A\u5DE5\u5177\u3002**");
  }
  if (body.parallel_tool_calls === false && tools.length > 1) {
    lines.push("**\u6CE8\u610F\uFF1A**\u6BCF\u6B21\u53EA\u80FD\u8C03\u7528**\u4E00\u4E2A**\u5DE5\u5177\uFF0C\u4E0D\u8981\u5728\u4E00\u4E2A\u6570\u7EC4\u4E2D\u653E\u591A\u4E2A\u8C03\u7528\u3002");
  }
  return lines.length ? lines.join("\n") : void 0;
}
function formatResponseFormatText(rf) {
  if (!rf || typeof rf !== "object") return "";
  const r = rf;
  if (r.type === "json_object") {
    return "**\u8F93\u51FA\u683C\u5F0F\u8981\u6C42\uFF1A** \u4F60\u7684\u56DE\u590D\u5FC5\u987B\u662F\u4E00\u4E2A\u5408\u6CD5\u7684 JSON \u5BF9\u8C61\u3002\u4E0D\u8981\u8F93\u51FA\u4EFB\u4F55 JSON \u4E4B\u5916\u7684\u6587\u5B57\uFF0C\u4E5F\u4E0D\u8981\u7528 markdown \u4EE3\u7801\u5757\u5305\u88F9\u3002";
  }
  if (r.type === "json_schema" && r.json_schema) {
    const schema = JSON.stringify(r.json_schema.schema ?? r.json_schema, null, 2);
    return `**\u8F93\u51FA\u683C\u5F0F\u8981\u6C42\uFF1A** \u4F60\u7684\u56DE\u590D\u5FC5\u987B\u4E25\u683C\u7B26\u5408\u4E0B\u9762\u7684 JSON Schema\uFF0C\u4E14\u4E0D\u5F97\u8F93\u51FA\u4EFB\u4F55\u989D\u5916\u6587\u5B57\u6216 markdown \u4EE3\u7801\u5757\uFF1A

\`\`\`json
${schema}
\`\`\``;
  }
  return "";
}
function injectTools(body) {
  const tools = Array.isArray(body.tools) ? body.tools : [];
  const hasTools = tools.length > 0;
  const tcRaw = body.tool_choice;
  const mode = typeof tcRaw === "string" ? tcRaw : tcRaw && typeof tcRaw === "object" ? tcRaw.type ?? tcRaw.mode : void 0;
  if (!hasTools || mode === "none") return {};
  const defsLines = ["\u4F60\u53EF\u4EE5\u4F7F\u7528\u4EE5\u4E0B\u5DE5\u5177\uFF1A"];
  tools.forEach((t, i) => defsLines.push(formatTool(t, i)));
  return {
    defsText: defsLines.join("\n"),
    formatBlock: buildToolInstructionBlock(tools),
    instructionText: buildInstructionText(body, tools)
  };
}
function repairInvalidBackslashes(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== "\\") {
      out += c;
      continue;
    }
    const next = s[i + 1];
    if (next === void 0) {
      out += "\\\\";
      continue;
    }
    if ('"\\/bfnrt'.includes(next)) {
      out += c + next;
      i++;
      continue;
    }
    if (next === "u") {
      const hex = s.slice(i + 2, i + 6);
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        out += s.slice(i, i + 6);
        i += 5;
        continue;
      }
      out += "\\\\";
      continue;
    }
    out += "\\\\";
  }
  return out;
}
function repairUnquotedKeys(s) {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      out += c;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_$]/.test(s[j])) j++;
      const word = s.slice(i, j);
      let k = j;
      while (k < s.length && /\s/.test(s[k])) k++;
      let p = out.length - 1;
      while (p >= 0 && /\s/.test(out[p])) p--;
      const prevCh = p >= 0 ? out[p] : "";
      if (s[k] === ":" && (prevCh === "{" || prevCh === "," || prevCh === "")) {
        out += '"' + word + '"';
        i = j - 1;
        continue;
      }
    }
    out += c;
  }
  return out;
}
function repairJson(s) {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const candidates = [
    trimmed,
    repairInvalidBackslashes(trimmed),
    repairUnquotedKeys(trimmed),
    repairUnquotedKeys(repairInvalidBackslashes(trimmed))
  ];
  for (const c of candidates) {
    try {
      JSON.parse(c);
      return c;
    } catch {
    }
  }
  return null;
}
function isInsideCodeFence(xml, tagPos) {
  const before = xml.slice(0, tagPos);
  const fences = before.match(/```/g);
  return !!fences && fences.length % 2 === 1;
}
function nextCallId() {
  const n = callIdCounter++;
  return `call_${n.toString(16).padStart(8, "0")}${Math.random().toString(16).slice(2, 10)}`;
}
function normalizeCall(raw2) {
  if (!raw2 || typeof raw2 !== "object") return null;
  const name = raw2.name ?? raw2.function?.name ?? raw2.tool ?? raw2.tool_name;
  if (typeof name !== "string" || !name.trim()) return null;
  let args = raw2.arguments ?? raw2.function?.arguments ?? raw2.parameters ?? raw2.args ?? {};
  if (typeof args === "string") {
    const trimmed = args.trim();
    if (!trimmed) args = "{}";
    else if (trimmed.length > MAX_ARG_CHARS) args = JSON.stringify({ _truncated: true });
    else {
      const fixed = repairJson(trimmed);
      args = fixed ?? JSON.stringify({ _raw: trimmed });
    }
  } else {
    args = JSON.stringify(args ?? {});
  }
  return { id: nextCallId(), type: "function", function: { name: name.trim(), arguments: args } };
}
function parseToolCalls(inner) {
  const trimmed = (inner || "").trim();
  if (!trimmed) return { calls: [], failed: [], trailing: "" };
  const fixed = repairJson(trimmed);
  if (fixed) {
    try {
      const v = JSON.parse(fixed);
      if (Array.isArray(v)) {
        const calls2 = v.map(normalizeCall).filter(Boolean);
        if (calls2.length) return { calls: calls2, failed: [], trailing: "" };
      } else if (v && typeof v === "object") {
        const arr = v.tool_calls ?? v.calls;
        const calls2 = Array.isArray(arr) ? arr.map(normalizeCall).filter(Boolean) : [normalizeCall(v)].filter(Boolean);
        if (calls2.length) return { calls: calls2, failed: [], trailing: "" };
      }
    } catch {
    }
  }
  const calls = [];
  const failed = [];
  let i = 0;
  while (i < trimmed.length) {
    const start = trimmed.indexOf("{", i);
    if (start < 0) break;
    const end = findBalancedEnd(trimmed, start);
    if (end < 0) {
      failed.push(trimmed.slice(start));
      break;
    }
    const chunk = trimmed.slice(start, end + 1);
    const fixedChunk = repairJson(chunk);
    if (fixedChunk) {
      try {
        const call = normalizeCall(JSON.parse(fixedChunk));
        if (call) calls.push(call);
        else failed.push(chunk);
      } catch {
        failed.push(chunk);
      }
    } else {
      failed.push(chunk);
    }
    i = end + 1;
  }
  return { calls, failed, trailing: "" };
}
function findBalancedEnd(s, start) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") {
      depth--;
      if (depth === 0) return i;
      if (depth < 0) return -1;
    }
  }
  return -1;
}
function composeSystemSections(toolCtx, responseFormatText) {
  const sections = [];
  if (toolCtx.defsText) sections.push(toolCtx.defsText);
  if (toolCtx.formatBlock) sections.push(toolCtx.formatBlock);
  if (toolCtx.instructionText) sections.push(toolCtx.instructionText);
  if (responseFormatText) sections.push(responseFormatText);
  return sections.join("\n\n");
}
var TOOL_CALL_START, TOOL_CALL_END, SCAN_WINDOW, MAX_XML_BUF_LEN, MAX_ARG_CHARS, callIdCounter, ToolCallDetector;
var init_deepseek_tools = __esm({
  "src/deepseek-tools.ts"() {
    "use strict";
    TOOL_CALL_START = "<|tool\u2581calls\u2581begin|>";
    TOOL_CALL_END = "<|tool\u2581calls\u2581end|>";
    SCAN_WINDOW = 71;
    MAX_XML_BUF_LEN = 64 * 1024;
    MAX_ARG_CHARS = 1e5;
    callIdCounter = 1;
    ToolCallDetector = class {
      buf = "";
      collecting = false;
      collected = "";
      done = false;
      /** 喂入一个文本增量 */
      push(text) {
        if (this.done) return [];
        const out = [];
        this.buf += text;
        if (this.collecting) {
          this.collected += this.buf;
          this.buf = "";
          const end2 = findEndTag(this.collected);
          if (end2) {
            const raw2 = this.collected.slice(0, end2.index).slice(0, MAX_XML_BUF_LEN);
            this.collected = "";
            this.done = true;
            return [{ kind: "tool_block", raw: raw2 }];
          }
          if (this.collected.length > MAX_XML_BUF_LEN) {
            const text2 = this.collected;
            this.collected = "";
            this.collecting = false;
            this.done = true;
            return text2 ? [{ kind: "content", text: text2 }] : [];
          }
          return out;
        }
        let start = findStartTag(this.buf);
        while (start && isInsideCodeFence(this.buf, start.index)) {
          const past = start.index + start.text.length;
          const next = findStartTag(this.buf.slice(past));
          start = next ? { index: past + next.index, text: next.text } : null;
        }
        if (!start) {
          if (this.buf.length > SCAN_WINDOW) {
            const keep = SCAN_WINDOW;
            let cut = this.buf.length - keep;
            const safe = this.buf.slice(0, cut);
            const lastMark = Math.max(safe.lastIndexOf("|"), safe.lastIndexOf("<"), safe.lastIndexOf("\u2581"));
            if (lastMark >= 0) cut = lastMark;
            if (cut > 0) {
              out.push({ kind: "content", text: this.buf.slice(0, cut) });
              this.buf = this.buf.slice(cut);
            }
          }
          return out;
        }
        const before = this.buf.slice(0, start.index);
        if (before) out.push({ kind: "content", text: before });
        let rest = this.buf.slice(start.index + start.text.length);
        if (rest.startsWith(">")) rest = rest.slice(1);
        this.buf = "";
        const end = findEndTag(rest);
        if (end) {
          this.done = true;
          return out.concat([{ kind: "tool_block", raw: rest.slice(0, end.index).slice(0, MAX_XML_BUF_LEN) }]);
        }
        this.collecting = true;
        this.collected = rest;
        return out;
      }
      /** 流结束时冲掉缓冲 */
      flush() {
        if (this.done) return [];
        const out = [];
        if (this.collecting) {
          const text = this.collected + this.buf;
          this.collected = "";
          this.buf = "";
          this.done = true;
          if (text.trim()) out.push({ kind: "content", text });
          return out;
        }
        if (this.buf) {
          out.push({ kind: "content", text: this.buf });
          this.buf = "";
        }
        return out;
      }
      get isDone() {
        return this.done;
      }
      get isCollecting() {
        return this.collecting;
      }
    };
  }
});

// src/deepseek.ts
var deepseek_exports = {};
__export(deepseek_exports, {
  DEEPSEEK_DEFAULT_MODELS: () => DEEPSEEK_DEFAULT_MODELS,
  fetchDeepSeekModels: () => fetchDeepSeekModels,
  handleDeepSeekRequest: () => handleDeepSeekRequest,
  modelOptions: () => modelOptions,
  testDeepSeek: () => testDeepSeek
});
function dsHeaders(userToken, powHeader) {
  const h = {
    "Content-Type": "application/json",
    "Accept": "*/*",
    "Authorization": `Bearer ${userToken}`,
    "User-Agent": "DeepSeek/2.0.4 Android/35",
    "x-client-platform": "android",
    "x-client-version": "2.0.4",
    "x-client-locale": "zh_CN",
    "x-app-version": "2.0.4"
  };
  if (powHeader) h["x-ds-pow-response"] = powHeader;
  return h;
}
function renderPrompt(messages, extraSystem) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return extraSystem ? `\u7CFB\u7EDF\u6307\u4EE4\uFF1A${extraSystem}` : "";
  }
  const text = (c) => {
    if (typeof c === "string") return c;
    if (Array.isArray(c)) {
      return c.map((p) => p && typeof p === "object" && typeof p.text === "string" ? p.text : "").join("");
    }
    return "";
  };
  const users = messages.filter((m) => m?.role === "user");
  const single = messages.length === 1 || users.length === 1 && messages.every((m) => m?.role === "user" || m?.role === "system");
  if (single && users.length === 1 && !messages.some((m) => m?.role === "system") && !extraSystem) {
    return text(users[0].content);
  }
  const parts = [];
  if (extraSystem) parts.push(`\u7CFB\u7EDF\u6307\u4EE4\uFF1A${extraSystem}`);
  for (const m of messages) {
    const body = text(m?.content);
    if (!body) continue;
    if (m.role === "system" || m.role === "developer") parts.push(`\u7CFB\u7EDF\u6307\u4EE4\uFF1A${body}`);
    else if (m.role === "assistant") parts.push(`\u52A9\u624B\uFF1A${body}`);
    else if (m.role === "tool") parts.push(`\u5DE5\u5177\u7ED3\u679C\uFF1A${body}`);
    else parts.push(`\u7528\u6237\uFF1A${body}`);
  }
  return parts.join("\n\n");
}
function modelOptions(modelId) {
  const m = (modelId || "").toLowerCase();
  return {
    modelType: /pro|expert|reasoner/.test(m) ? "expert" : "default",
    thinking: !/nothinking|no-think|-fast-|noreason/.test(m),
    search: /search/.test(m)
  };
}
function isPlainObject2(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function mergeDelta(target, add) {
  if (add.content) target.content = (target.content || "") + add.content;
  if (add.reasoning) target.reasoning = (target.reasoning || "") + add.reasoning;
  if (add.tokens) target.tokens = add.tokens;
  if (add.error) target.error = add.error;
  if (add.done) target.done = true;
}
function createSseParser3() {
  let buffer = "";
  let currentEvent = "";
  let currentData = "";
  const flush = (out) => {
    if (currentData) out.push({ event: currentEvent, data: currentData });
    currentEvent = "";
    currentData = "";
  };
  return {
    feed(chunk) {
      buffer += chunk;
      const out = [];
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).replace(/\r$/, "");
        buffer = buffer.slice(idx + 1);
        if (line === "") {
          flush(out);
          currentEvent = "";
        } else if (line.startsWith("event:")) currentEvent = line.slice(6).trim();
        else if (line.startsWith("data:")) currentData += (currentData ? "\n" : "") + line.slice(5).trim();
      }
      return out;
    }
  };
}
function createOpenAIStreamFromDeepSeek(upstream, requestedModel, onUsage, useTools = false) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const parser = createSseParser3();
  const state = new DeepSeekDeltaParser();
  const detector = useTools ? new ToolCallDetector() : null;
  let firstSent = false;
  let finished = false;
  let promptTokens = 0;
  let toolCallIndex = 0;
  const chatcmplId = `chatcmpl-ds-${randomId()}`;
  const send = (controller, delta, finish = null, withUsage = false) => {
    const chunk = {
      id: chatcmplId,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1e3),
      model: requestedModel,
      choices: [{ index: 0, delta, finish_reason: finish, logprobs: null }]
    };
    if (withUsage) chunk.usage = { prompt_tokens: promptTokens, completion_tokens: state.usageTokens, total_tokens: promptTokens + state.usageTokens };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}

`));
  };
  const emitDetect = (controller, outs) => {
    for (const o of outs) {
      if (o.kind === "content") {
        if (o.text) send(controller, { content: o.text });
        continue;
      }
      const { calls, failed } = parseToolCalls(o.raw);
      if (failed.length) {
        send(controller, { content: `
[tool-call \u89E3\u6790\u5931\u8D25] ${failed.join("\n")}
` });
      }
      for (const call of calls) {
        const idx = toolCallIndex++;
        send(controller, { tool_calls: [{ index: idx, id: call.id, type: "function", function: { name: call.function.name, arguments: "" } }] });
        send(controller, { tool_calls: [{ index: idx, function: { arguments: call.function.arguments } }] });
      }
      if (calls.length) {
        send(controller, {}, "tool_calls", true);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        finished = true;
        if (onUsage) onUsage({ promptTokens, completionTokens: state.usageTokens });
      }
    }
  };
  const handle = (controller, ev) => {
    if (!ev.data || ev.data === "[DONE]") return;
    let payload;
    try {
      payload = JSON.parse(ev.data);
    } catch {
      return;
    }
    const d = state.apply(ev.event, payload);
    if (d.reasoning) send(controller, { reasoning_content: d.reasoning });
    if (d.content) {
      if (detector) emitDetect(controller, detector.push(d.content));
      else send(controller, { content: d.content });
    }
    if (d.error) {
      send(controller, { content: `[deepseek] ${d.error}` }, "stop", true);
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      finished = true;
      if (onUsage) onUsage({ promptTokens, completionTokens: state.usageTokens });
    } else if (d.done && !finished) {
      if (detector && !detector.isDone) emitDetect(controller, detector.flush());
      if (finished) return;
      finished = true;
      send(controller, {}, "stop", true);
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      if (onUsage) onUsage({ promptTokens, completionTokens: state.usageTokens });
    }
  };
  return new ReadableStream({
    start(controller) {
      const reader = upstream.getReader();
      const pump = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (detector && !detector.isDone) emitDetect(controller, detector.flush());
            if (!firstSent) send(controller, { role: "assistant", content: "" }, "stop", true);
            else if (!finished) {
              send(controller, {}, "stop", true);
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
            controller.close();
            return;
          }
          for (const ev of parser.feed(decoder.decode(value, { stream: true }))) {
            if (!firstSent) {
              firstSent = true;
              send(controller, { role: "assistant", content: "" });
            }
            handle(controller, ev);
          }
          pump();
        }).catch(() => {
          try {
            controller.close();
          } catch {
          }
        });
      };
      pump();
    }
  });
}
function deepseekTextToOpenAI(text, requestedModel, promptTokens, useTools = false) {
  const parser = createSseParser3();
  const state = new DeepSeekDeltaParser();
  const detector = useTools ? new ToolCallDetector() : null;
  let content = "";
  let reasoning = "";
  let error = "";
  const toolCalls = [];
  const failedBlocks = [];
  let toolParsed = false;
  const collect = (raw2) => {
    const { calls, failed } = parseToolCalls(raw2);
    if (calls.length) {
      toolCalls.push(...calls);
      toolParsed = true;
    }
    failedBlocks.push(...failed);
  };
  for (const ev of parser.feed(text)) {
    if (!ev.data || ev.data === "[DONE]") continue;
    let payload;
    try {
      payload = JSON.parse(ev.data);
    } catch {
      continue;
    }
    const d = state.apply(ev.event, payload);
    if (d.content) {
      if (detector) {
        for (const o of detector.push(d.content)) {
          if (o.kind === "content") content += o.text;
          else collect(o.raw);
        }
      } else content += d.content;
    }
    if (d.reasoning) reasoning += d.reasoning;
    if (d.error) error = d.error;
  }
  if (detector && !detector.isDone) {
    for (const o of detector.flush()) {
      if (o.kind === "content") content += o.text;
      else collect(o.raw);
    }
  }
  if (failedBlocks.length) content += `
[tool-call \u89E3\u6790\u5931\u8D25] ${failedBlocks.join("\n")}
`;
  const message = { role: "assistant", content: error ? `[deepseek] ${error}` : content || null, refusal: null };
  if (reasoning) message.reasoning_content = reasoning;
  if (toolCalls.length) message.tool_calls = toolCalls;
  return {
    body: {
      id: `chatcmpl-ds-${randomId()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1e3),
      model: requestedModel,
      choices: [{ index: 0, message, finish_reason: toolParsed ? "tool_calls" : "stop", logprobs: null }],
      usage: { prompt_tokens: promptTokens, completion_tokens: state.usageTokens, total_tokens: promptTokens + state.usageTokens }
    },
    usage: { promptTokens, completionTokens: state.usageTokens }
  };
}
async function getOrCreateSession(env, userToken, forceNew = false) {
  const cacheKey = SESSION_PREFIX + await sha256Hex(userToken);
  const kv = getKV(env);
  if (!forceNew) {
    const cached = await kv.get(cacheKey).catch(() => null);
    if (cached) return cached;
  }
  const res = await fetch(`${DS_BASE}/chat_session/create`, {
    method: "POST",
    headers: dsHeaders(userToken),
    body: "{}",
    signal: AbortSignal.timeout(3e4)
  });
  const json = await res.json().catch(() => null);
  const id = json?.data?.biz_data?.chat_session?.id;
  if (!id) throw new Error(`\u521B\u5EFA DeepSeek \u4F1A\u8BDD\u5931\u8D25: ${JSON.stringify(json).slice(0, 200)}`);
  await kv.put(cacheKey, String(id), { expirationTtl: 3600 }).catch(() => {
  });
  return String(id);
}
async function fetchPowChallenge(userToken, targetPath) {
  const res = await fetch(`${DS_BASE}/chat/create_pow_challenge`, {
    method: "POST",
    headers: dsHeaders(userToken),
    body: JSON.stringify({ target_path: targetPath }),
    signal: AbortSignal.timeout(3e4)
  });
  const json = await res.json().catch(() => null);
  const challenge = json?.data?.biz_data?.challenge;
  if (!challenge?.challenge) throw new Error(`\u83B7\u53D6 PoW challenge \u5931\u8D25: ${JSON.stringify(json).slice(0, 200)}`);
  return challenge;
}
function isOfficialApiKey(credential) {
  return /^sk-[A-Za-z0-9]/.test(credential.trim());
}
async function handleOfficialApiRequest(p, credential) {
  const wantStream = p.body?.stream === true;
  const upstream = await fetch(`${DS_OFFICIAL_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credential}`,
      Accept: wantStream ? "text/event-stream" : "application/json"
    },
    body: JSON.stringify({ ...p.body, model: p.modelId }),
    signal: AbortSignal.timeout(6e5)
  });
  if (!upstream.ok) {
    const detail = (await upstream.text().catch(() => "")).slice(0, 300);
    return oauthErrorResponse(`HTTP ${upstream.status}: ${detail}`, upstream.status, "upstream_error");
  }
  if (wantStream && upstream.body) {
    const [toClient, forUsage] = upstream.body.tee();
    defer(p, (async () => {
      let usage = { promptTokens: 0, completionTokens: 0 };
      try {
        const text = await new Response(forUsage).text();
        for (const line of text.split("\n")) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const j = JSON.parse(payload);
            if (j?.usage) usage = { promptTokens: Number(j.usage.prompt_tokens) || 0, completionTokens: Number(j.usage.completion_tokens) || 0 };
          } catch {
          }
        }
      } catch {
      }
      await recordOAuthUsage(p, usage, true, 200);
    })());
    return new Response(toClient, {
      status: 200,
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" }
    });
  }
  const raw2 = await upstream.text();
  let json;
  try {
    json = JSON.parse(raw2);
  } catch {
    return oauthErrorResponse(`\u4E0A\u6E38\u8FD4\u56DE\u975E JSON: ${raw2.slice(0, 200)}`, 502, "upstream_error");
  }
  defer(p, recordOAuthUsage(p, {
    promptTokens: Number(json?.usage?.prompt_tokens) || 0,
    completionTokens: Number(json?.usage?.completion_tokens) || 0
  }, true, 200));
  return new Response(JSON.stringify(json), { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
async function handleDeepSeekRequest(p, _subPath) {
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0) {
    return oauthErrorResponse("\u8BE5 deepseek \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u53EF\u586B DeepSeek \u5B98\u65B9 API Key\uFF08sk- \u5F00\u5934\uFF0C\u8D70\u5B98\u65B9 API\uFF0C\u514D\u8D39\u7248\u53EF\u7528\uFF09\u6216 chat.deepseek.com \u7684 userToken\uFF08\u7F51\u9875\u53CD\u4EE3\uFF0C\u9700 Workers Paid\uFF09", 400, "configuration_error");
  }
  const apiKey = tokens.find(isOfficialApiKey);
  if (apiKey) return handleOfficialApiRequest(p, apiKey.trim());
  const toolCtx = injectTools(p.body || {});
  const extraSystem = composeSystemSections(toolCtx, formatResponseFormatText(p.body?.response_format));
  const useTools = !!(toolCtx.defsText || toolCtx.formatBlock);
  const prompt = renderPrompt(p.body?.messages, extraSystem);
  if (!prompt) return oauthErrorResponse("\u8BF7\u6C42\u7F3A\u5C11\u53EF\u7528\u5185\u5BB9\uFF08messages \u4E3A\u7A7A\uFF09", 400, "invalid_request_error");
  const wantStream = p.body?.stream === true;
  const { modelType, thinking, search } = modelOptions(p.modelId);
  const promptTokens = Math.ceil(prompt.length / 4);
  const thinkingFinal = useTools ? true : thinking;
  let lastError = "";
  let lastStatus = 502;
  for (const userToken of tokens) {
    try {
      let sessionId = await getOrCreateSession(p.env, userToken);
      const runCompletion = async (sid) => {
        const challenge = await fetchPowChallenge(userToken, "/api/v0/chat/completion");
        const powHeader = solveAndBuildPowHeader(challenge, DS_POW_MAX_MS);
        if (!powHeader) {
          throw new Error("PoW \u89E3\u7B97\u8D85\u65F6\uFF08CPU \u9884\u7B97\u4E0D\u8DB3\uFF09\uFF1ADeepSeek \u7F51\u9875\u53CD\u4EE3\u9700\u8981 Cloudflare Workers Paid \u5957\u9910\uFF08\u514D\u8D39\u7248 CPU \u4E0A\u9650 10ms\uFF09\uFF0C\u6216\u964D\u4F4E\u96BE\u5EA6/\u7A0D\u540E\u91CD\u8BD5");
        }
        return fetch(`${DS_BASE}/chat/completion`, {
          method: "POST",
          headers: dsHeaders(userToken, powHeader),
          body: JSON.stringify({
            chat_session_id: sid,
            parent_message_id: null,
            model_type: modelType,
            prompt,
            ref_file_ids: [],
            thinking_enabled: thinkingFinal,
            search_enabled: search,
            preempt: false
          }),
          signal: AbortSignal.timeout(6e5)
        });
      };
      let upstream = await runCompletion(sessionId);
      if (!upstream.ok && (upstream.status === 400 || upstream.status === 404)) {
        sessionId = await getOrCreateSession(p.env, userToken, true);
        upstream = await runCompletion(sessionId);
      }
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await upstream.text().catch(() => "")).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (wantStream && upstream.body) {
        const stream = createOpenAIStreamFromDeepSeek(upstream.body, p.requestedModel, (usage2) => {
          defer(p, recordOAuthUsage(p, usage2, true, 200));
        }, useTools);
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" }
        });
      }
      const text = await upstream.text();
      if (/value="captcha"|__cf_chl|CloudFront|Request blocked/i.test(text.slice(0, 500))) {
        return oauthErrorResponse("\u4E0A\u6E38\u8FD4\u56DE\u62E6\u622A\u9875\u9762\uFF08WAF/\u98CE\u63A7\uFF09\uFF1A\u5F53\u524D Worker \u51FA\u53E3 IP \u53EF\u80FD\u88AB DeepSeek \u62E6\u622A", 502, "waf_blocked");
      }
      const { body, usage } = deepseekTextToOpenAI(text, p.requestedModel, promptTokens, useTools);
      defer(p, recordOAuthUsage(p, usage, true, 200));
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 DeepSeek \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function testDeepSeek(_env, userToken, modelId) {
  if (!userToken) return { success: false, message: "\u672A\u586B\u5199\u51ED\u636E", statusCode: 0 };
  if (isOfficialApiKey(userToken)) {
    try {
      const res = await fetch(`${DS_OFFICIAL_BASE}/models`, {
        headers: { Authorization: `Bearer ${userToken.trim()}`, Accept: "application/json" },
        signal: AbortSignal.timeout(3e4)
      });
      if (res.ok) return { success: true, message: "\u5B98\u65B9 API Key \u6709\u6548\uFF08\u8D70 api.deepseek.com\uFF0C\u514D\u8D39\u7248\u53EF\u7528\uFF09", statusCode: 200 };
      return { success: false, message: `HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`, statusCode: res.status };
    } catch (err) {
      return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
    }
  }
  try {
    const res = await fetch(`${DS_BASE}/users/current`, {
      method: "GET",
      headers: dsHeaders(userToken),
      signal: AbortSignal.timeout(3e4)
    });
    const json = await res.json().catch(() => null);
    if (json?.code === 0 && json?.data?.biz_data) {
      const user = json.data.biz_data;
      const name = user?.email || user?.mobile_number || user?.id || "\u672A\u77E5\u8D26\u53F7";
      return { success: true, message: `\u51ED\u636E\u6709\u6548\uFF08${name}\uFF09\uFF0C\u6A21\u578B ${modelId || DEEPSEEK_DEFAULT_MODELS[0]}\uFF1B\u6CE8\u610F PoW \u9700\u8981 Workers Paid \u5957\u9910`, statusCode: 200 };
    }
    return { success: false, message: `\u51ED\u636E\u65E0\u6548: ${JSON.stringify(json).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
function fetchDeepSeekModels() {
  return { success: true, models: [...DEEPSEEK_DEFAULT_MODELS] };
}
var DS_BASE, DS_POW_MAX_MS, SESSION_PREFIX, DEEPSEEK_DEFAULT_MODELS, DeepSeekDeltaParser, DS_OFFICIAL_BASE;
var init_deepseek = __esm({
  "src/deepseek.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    init_deepseek_pow();
    init_deepseek_tools();
    DS_BASE = "https://chat.deepseek.com/api/v0";
    DS_POW_MAX_MS = 2e4;
    SESSION_PREFIX = "deepseek:sess:";
    DEEPSEEK_DEFAULT_MODELS = [
      "deepseek-v4-flash",
      "deepseek-v4-pro",
      "deepseek-v4-flash-search",
      "deepseek-v4-pro-search"
    ];
    DeepSeekDeltaParser = class {
      op = "SET";
      path = "";
      fragments = [];
      usageTokens = 0;
      error = "";
      done = false;
      lastFragment() {
        return this.fragments[this.fragments.length - 1];
      }
      appendContent(path, value) {
        if (typeof value !== "string") return {};
        const m = /^response\/fragments\/(-?\d+)\/content$/.exec(path);
        if (!m) return {};
        const idxRaw = Number(m[1]);
        const idx = idxRaw < 0 ? this.fragments.length + idxRaw : idxRaw;
        const frag = this.fragments[idx];
        if (!frag) return {};
        frag.content += value;
        return frag.type === "THINK" ? { reasoning: value } : { content: value };
      }
      /** 处理一条已解析的事件；返回需要下发的内容增量 */
      apply(eventName, payload) {
        if (eventName === "hint" && payload) {
          if (payload.type === "error") {
            this.error = payload.content || payload.finish_reason || "\u4E0A\u6E38\u63D0\u793A\u9519\u8BEF";
            this.done = true;
            return { error: this.error, done: true };
          }
          return {};
        }
        if (!payload || typeof payload !== "object") return {};
        if (payload.v !== void 0 && isPlainObject2(payload.v) && payload.v.response) {
          const frags = payload.v.response.fragments;
          if (Array.isArray(frags)) {
            this.fragments = frags.map((f) => ({ type: String(f?.type || "RESPONSE"), content: String(f?.content || "") }));
          }
          return {};
        }
        const path = typeof payload.p === "string" ? this.path = payload.p : this.path;
        const op = typeof payload.o === "string" ? this.op = payload.o : this.op;
        if (op === "BATCH") {
          const out = {};
          if (Array.isArray(payload.v)) {
            const savedPath = this.path, savedOp = this.op;
            for (const item of payload.v) {
              const sub = { ...item };
              if (typeof sub.p === "string" && path) sub.p = `${path}/${sub.p}`;
              const d = this.apply("", sub);
              mergeDelta(out, d);
            }
            this.path = savedPath;
            this.op = savedOp;
          }
          return out;
        }
        if (!path) return {};
        if (path === "response/status" || path === "response/quasi_status") {
          const v = String(payload.v || "");
          if (v === "FINISHED" || v === "INCOMPLETE") {
            this.done = true;
            return { done: true };
          }
          return {};
        }
        if (path === "response/accumulated_token_usage") {
          const n = Number(payload.v) || 0;
          if (n > this.usageTokens) this.usageTokens = n;
          return { tokens: this.usageTokens };
        }
        if (path === "response/fragments" && Array.isArray(payload.v)) {
          for (const f of payload.v) this.fragments.push({ type: String(f?.type || "RESPONSE"), content: String(f?.content || "") });
          return {};
        }
        if (/^response\/fragments\/-?\d+\/content$/.test(path)) {
          return this.appendContent(path, payload.v);
        }
        return {};
      }
    };
    DS_OFFICIAL_BASE = "https://api.deepseek.com";
  }
});

// src/codebuddy.ts
var codebuddy_exports = {};
__export(codebuddy_exports, {
  cbRegion: () => cbRegion,
  checkinCodebuddy: () => checkinCodebuddy,
  codebuddyCronToken: () => codebuddyCronToken,
  fetchCodebuddyModels: () => fetchCodebuddyModels,
  fetchCodebuddyStatus: () => fetchCodebuddyStatus,
  handleCodebuddyRequest: () => handleCodebuddyRequest,
  pollCodebuddyDeviceFlow: () => pollCodebuddyDeviceFlow,
  rewriteCodebuddyPayload: () => rewriteCodebuddyPayload,
  startCodebuddyDeviceFlow: () => startCodebuddyDeviceFlow,
  testCodebuddy: () => testCodebuddy
});
function cbBillingTargets(region, path) {
  if (region.global) {
    return [
      { base: "https://www.workbuddy.ai", path: "/billing" + path },
      { base: "https://www.workbuddy.ai", path: "/v2/billing" + path }
    ];
  }
  return [
    { base: "https://www.codebuddy.cn", path: "/v2/billing" + path },
    { base: "https://copilot.tencent.com", path: "/v2/billing" + path }
  ];
}
function cbRegion(baseUrl, region) {
  if (region === "global") return CB_GLOBAL;
  if (region === "cn") return CB_CN;
  return /workbuddy\.ai/i.test(baseUrl || "") ? CB_GLOBAL : CB_CN;
}
function cbFallbackDomain(region) {
  return region.global ? "www.workbuddy.ai" : "copilot.tencent.com";
}
function cbUA(region) {
  const platform = region.global ? "WorkBuddy AI" : "WorkBuddy";
  return `WorkBuddy/${CB_CLIENT_VERSION} ${platform}/${CB_CLIENT_VERSION} CLI/${CB_CLI_VERSION}`;
}
function cbLoginHeaders(origin) {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": origin,
    "Referer": origin + "/",
    "User-Agent": CB_LOGIN_UA
  };
}
async function cbStableId(uid, purpose) {
  return (await sha256Hex(`wb2a:${purpose}:${uid}`)).slice(0, 36);
}
async function saveCbAccount(env, refreshToken, acct) {
  await getKV(env).put(CB_ACCT_PREFIX + await sha256Hex(refreshToken), JSON.stringify(acct), { expirationTtl: CB_ACCT_TTL }).catch(() => {
  });
}
async function getCbAccount(env, refreshToken) {
  const raw2 = await getKV(env).get(CB_ACCT_PREFIX + await sha256Hex(refreshToken)).catch(() => null);
  if (!raw2) return {};
  try {
    return JSON.parse(raw2);
  } catch {
    return {};
  }
}
async function startCodebuddyDeviceFlow(env, baseUrl, region) {
  const reg = cbRegion(baseUrl, region);
  const res = await fetch(reg.base + CB_STATE_PATH, {
    method: "POST",
    headers: cbLoginHeaders(reg.origin),
    body: "{}",
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u6388\u6743\u53D1\u8D77\u8FD4\u56DE\u975E JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  const state = String(json?.data?.state || "");
  let authUrl = String(json?.data?.authUrl || "");
  if (json?.code !== 0 || !state) {
    throw new Error(`\u6388\u6743\u53D1\u8D77\u5931\u8D25 code=${json?.code} msg=${json?.msg || text.slice(0, 200)}`);
  }
  if (!authUrl) authUrl = `${reg.base}/login?state=${encodeURIComponent(state)}&platform=CLI`;
  const realm = reg.global ? "global" : "cn";
  try {
    await getKV(env).put(
      CB_AUTH_PREFIX + state,
      JSON.stringify({ realm, base: reg.base, origin: reg.origin, fallbackDomain: cbFallbackDomain(reg) }),
      { expirationTtl: CB_AUTH_TTL }
    );
  } catch (e) {
    console.error("[codebuddy] start store failed", String(e));
    throw new Error("\u6388\u6743\u4F1A\u8BDD\u5199\u5165\u5931\u8D25(\u5B58\u50A8\u5F02\u5E38)\uFF0C\u8BF7\u91CD\u8BD5");
  }
  return { state, authUrl, realm };
}
async function pollCodebuddyDeviceFlow(env, state) {
  const raw2 = await getKV(env).get(CB_AUTH_PREFIX + state).catch(() => null);
  if (!raw2) return { status: "error", message: "\u6388\u6743\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
  let sess;
  try {
    sess = JSON.parse(raw2);
  } catch {
    return { status: "error", message: "\u6388\u6743\u4F1A\u8BDD\u6570\u636E\u635F\u574F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
  }
  if (sess.done && sess.refreshToken) {
    return { status: "ok", refreshToken: sess.refreshToken, account: sess.account };
  }
  let res;
  try {
    res = await fetch(`${sess.base}${CB_TOKEN_PATH}?state=${encodeURIComponent(state)}`, {
      headers: cbLoginHeaders(sess.origin),
      signal: AbortSignal.timeout(3e4)
    });
  } catch (e) {
    return { status: "error", message: `\u8F6E\u8BE2\u8BF7\u6C42\u5931\u8D25: ${e.message}` };
  }
  const text = await res.text();
  if (res.status >= 500) return { status: "error", message: `\u4E0A\u6E38\u9519\u8BEF HTTP ${res.status}: ${text.slice(0, 200)}` };
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: "error", message: `\u8F6E\u8BE2\u8FD4\u56DE\u975E JSON (HTTP ${res.status}): ${text.slice(0, 200)}` };
  }
  if (json?.code !== 0) return { status: "pending" };
  const data = json?.data || {};
  const accessToken = String(data.accessToken || "");
  const refreshToken = String(data.refreshToken || "");
  if (!accessToken || !refreshToken) return { status: "pending" };
  const account = { domain: String(data.domain || "") };
  if (!account.domain) account.domain = sess.fallbackDomain || "";
  try {
    const ar = await fetch(`${sess.base}${CB_ACCOUNT_PATH}?state=${encodeURIComponent(state)}`, {
      headers: { ...cbLoginHeaders(sess.origin), Authorization: "Bearer " + accessToken },
      signal: AbortSignal.timeout(2e4)
    });
    const aj = await ar.json().catch(() => null);
    if (aj && aj.code === 0 && aj.data) {
      account.uid = String(aj.data.uid || "");
      account.enterpriseId = String(aj.data.enterpriseId || "");
      account.nickname = String(aj.data.nickname || "");
    }
  } catch {
  }
  await saveCbAccount(env, refreshToken, account);
  const expiresIn = Number(data.expiresIn) || 0;
  if (expiresIn > 0) {
    await putCachedToken(env, CB_AT_PREFIX, refreshToken, {
      accessToken,
      expiresAt: Date.now() + expiresIn * 1e3,
      currentRefreshToken: refreshToken
    }, expiresIn).catch(() => {
    });
  }
  await getKV(env).put(CB_AUTH_PREFIX + state, JSON.stringify({ ...sess, done: true, refreshToken, account }), { expirationTtl: CB_AUTH_TTL }).catch(() => {
  });
  return { status: "ok", refreshToken, account };
}
async function refreshCodebuddyToken(region, refreshToken, acct) {
  const headers = cbLoginHeaders(region.origin);
  headers["X-Refresh-Token"] = refreshToken;
  headers["X-Auth-Refresh-Source"] = "plugin";
  if (acct.enterpriseId) headers["X-Enterprise-Id"] = acct.enterpriseId;
  const res = await fetch(region.base + CB_REFRESH_PATH, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  if (res.status === 401 || res.status === 403) {
    throw new Error(`refresh_token \u5DF2\u5931\u6548 (HTTP ${res.status})\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u5237\u65B0\u8FD4\u56DE\u975E JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  if (json?.code !== 0) throw new Error(`\u5237\u65B0\u5931\u8D25 code=${json?.code} msg=${json?.msg || text.slice(0, 160)}`);
  const d = json?.data || {};
  if (!d.accessToken) throw new Error("\u5237\u65B0\u672A\u8FD4\u56DE accessToken\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743");
  return {
    accessToken: String(d.accessToken),
    expiresIn: Number(d.expiresIn) || 3600,
    refreshToken: d.refreshToken ? String(d.refreshToken) : void 0
  };
}
async function getCbAccess(env, refreshToken, region) {
  const account = await getCbAccount(env, refreshToken);
  const tok = await resolveAccessToken(env, CB_AT_PREFIX, refreshToken, (t) => refreshCodebuddyToken(region, t, account));
  return { accessToken: tok.accessToken, account };
}
async function cbChatHeaders(region, accessToken, acct, stream) {
  const h = {
    "Content-Type": "application/json",
    "Accept": stream ? "application/json, text/event-stream" : "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": region.origin,
    "Referer": region.origin + "/",
    "User-Agent": cbUA(region),
    "X-CodeBuddy-Request": "1",
    "Accept-Language": region.global ? "en-US" : "zh-CN",
    "X-Agent-Purpose": "conversation",
    "X-IDE-Name": "WorkBuddy",
    "X-IDE-Type": "WorkBuddy",
    "X-IDE-Version": CB_CLIENT_VERSION,
    "X-Product": "WorkBuddy"
  };
  if (accessToken) h["Authorization"] = "Bearer " + accessToken;
  else h["X-No-Authorization"] = "1";
  if (acct.uid) {
    h["X-User-Id"] = acct.uid;
    h["X-Machine-ID"] = await cbStableId(acct.uid, "machine");
    h["X-Session-ID"] = await cbStableId(acct.uid, "session");
  } else {
    h["X-No-User-Id"] = "1";
  }
  if (region.global) {
    h["X-No-Enterprise-Id"] = "1";
    h["X-Domain"] = "www.workbuddy.ai";
  } else {
    if (acct.enterpriseId) h["X-Enterprise-Id"] = acct.enterpriseId;
    else h["X-No-Enterprise-Id"] = "1";
    if (acct.domain) h["X-Domain"] = acct.domain;
    else h["X-No-Department-Info"] = "1";
  }
  const convReqId = randomHex(16);
  const messageId = randomHex(16);
  h["X-Conversation-Request-ID"] = convReqId;
  h["X-Conversation-Message-ID"] = messageId;
  h["X-Request-ID"] = messageId;
  h["X-Root-Request-ID"] = convReqId;
  h["X-Trace-ID"] = convReqId;
  h["X-B3-TraceId"] = convReqId;
  h["X-B3-SpanId"] = messageId.slice(0, 16);
  h["X-B3-Sampled"] = "1";
  return h;
}
function cbBillingHeaders(region, accessToken, acct) {
  const h = {
    "Authorization": "Bearer " + accessToken,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-CodeBuddy-Request": "1",
    "Accept-Language": region.global ? "en-US" : "zh-CN",
    "User-Agent": `WorkBuddy/${CB_CLIENT_VERSION}`
  };
  if (acct.uid) h["X-User-Id"] = acct.uid;
  if (acct.enterpriseId) {
    h["X-Enterprise-Id"] = acct.enterpriseId;
    h["X-Tenant-Id"] = acct.enterpriseId;
  }
  if (acct.domain) h["X-Domain"] = acct.domain;
  return h;
}
function isDeepSeekModel(model) {
  return String(model || "").trim().toLowerCase().startsWith("deepseek");
}
function rewriteCodebuddyPayload(body, modelId) {
  const obj = { ...body || {}, model: modelId };
  obj.stream = true;
  translateMaxCompletionTokens(obj);
  if (!("stream_options" in obj)) obj.stream_options = { include_usage: true };
  normalizeToolChoice(obj);
  normalizeRoles(obj);
  normalizeImageUrl(obj);
  if (Array.isArray(obj.messages)) {
    obj.messages = cleanupOrphanToolCalls(repackToolResultBlocks(obj.messages));
  }
  injectThinking(obj);
  backfillReasoningContent(obj);
  return obj;
}
function translateMaxCompletionTokens(obj) {
  if (!("max_completion_tokens" in obj)) return;
  const alias = obj.max_completion_tokens;
  delete obj.max_completion_tokens;
  if ("max_tokens" in obj) return;
  if (typeof alias === "number" && alias > 0 && Number.isInteger(alias)) obj.max_tokens = alias;
}
function normalizeToolChoice(obj) {
  if (!("tool_choice" in obj)) return;
  const tc = obj.tool_choice;
  const suppress = () => {
    delete obj.tools;
    delete obj.functions;
  };
  if (typeof tc === "string") {
    if (tc.trim().toLowerCase() === "none") {
      delete obj.tool_choice;
      suppress();
    }
    return;
  }
  if (tc && typeof tc === "object" && !Array.isArray(tc)) {
    const typ = String(tc.type || "").trim().toLowerCase();
    if (typ === "none") {
      delete obj.tool_choice;
      suppress();
      return;
    }
    if (typ === "auto" || typ === "required") {
      obj.tool_choice = typ;
      return;
    }
    if (typ === "function") {
      const name = String(tc?.function?.name || tc.name || "").trim();
      obj.tool_choice = name || "auto";
      return;
    }
  }
  delete obj.tool_choice;
}
function normalizeRoles(obj) {
  if (!Array.isArray(obj.messages)) return;
  for (const m of obj.messages) {
    if (!m || typeof m !== "object") continue;
    if (typeof m.role === "string" && m.role.trim().toLowerCase() === "developer") m.role = "system";
  }
}
function normalizeImageUrl(obj) {
  if (!Array.isArray(obj.messages)) return;
  for (const m of obj.messages) {
    if (!m || typeof m !== "object" || !Array.isArray(m.content)) continue;
    for (const part of m.content) {
      if (!part || typeof part !== "object" || part.type !== "image_url") continue;
      if (typeof part.image_url === "string" && part.image_url) part.image_url = { url: part.image_url };
    }
  }
}
function repackToolResultBlocks(messages) {
  if (!Array.isArray(messages) || messages.length < 3) return messages;
  const out = [];
  let changed = false;
  let i = 0;
  while (i < messages.length) {
    const m = messages[i];
    if (!m || typeof m !== "object" || m.role !== "assistant" || !Array.isArray(m.tool_calls) || m.tool_calls.length === 0) {
      out.push(messages[i]);
      i++;
      continue;
    }
    const want = /* @__PURE__ */ new Set();
    for (const tc of m.tool_calls) {
      if (tc && typeof tc === "object" && typeof tc.id === "string" && tc.id) want.add(tc.id);
    }
    out.push(messages[i]);
    i++;
    const results = [];
    const between = [];
    let sawNonTool = false;
    while (i < messages.length) {
      const mm = messages[i];
      if (!mm || typeof mm !== "object") break;
      const role = typeof mm.role === "string" ? mm.role : "";
      if (role === "tool") {
        const id = typeof mm.tool_call_id === "string" ? mm.tool_call_id : "";
        if (!want.has(id)) break;
        results.push(messages[i]);
        if (sawNonTool) changed = true;
        i++;
        continue;
      }
      if (results.length === 0) break;
      if (role === "assistant" && Array.isArray(mm.tool_calls) && mm.tool_calls.length > 0) break;
      between.push(messages[i]);
      sawNonTool = true;
      i++;
    }
    out.push(...results);
    out.push(...between);
  }
  return changed ? out : messages;
}
function cleanupOrphanToolCalls(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;
  const callIDs = /* @__PURE__ */ new Set();
  const resultIDs = /* @__PURE__ */ new Set();
  let hasTraffic = false;
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    if (m.role === "tool") {
      if (typeof m.tool_call_id === "string" && m.tool_call_id) {
        resultIDs.add(m.tool_call_id);
        hasTraffic = true;
      }
    } else if (m.role === "assistant" && Array.isArray(m.tool_calls)) {
      for (const tc of m.tool_calls) {
        if (tc && typeof tc === "object" && typeof tc.id === "string" && tc.id) {
          callIDs.add(tc.id);
          hasTraffic = true;
        }
      }
    }
  }
  if (!hasTraffic) return messages;
  const keep = /* @__PURE__ */ new Set();
  for (const id of callIDs) if (resultIDs.has(id)) keep.add(id);
  let changed = false;
  for (const m of messages) {
    if (!m || typeof m !== "object" || m.role !== "assistant" || !Array.isArray(m.tool_calls) || m.tool_calls.length === 0) continue;
    const kept = m.tool_calls.filter((tc) => tc && typeof tc === "object" && typeof tc.id === "string" && keep.has(tc.id));
    if (kept.length === m.tool_calls.length) continue;
    changed = true;
    if (kept.length === 0) delete m.tool_calls;
    else m.tool_calls = kept;
  }
  const keptMsgs = [];
  for (const m of messages) {
    if (m && typeof m === "object" && m.role === "tool") {
      const id = typeof m.tool_call_id === "string" ? m.tool_call_id : "";
      if (!keep.has(id)) {
        changed = true;
        continue;
      }
    }
    keptMsgs.push(m);
  }
  return changed ? keptMsgs : messages;
}
function ensureDeepSeekEffort(obj) {
  if ("reasoning_effort" in obj || "reasoningEffort" in obj) return;
  obj.reasoning_effort = DEEPSEEK_DEFAULT_EFFORT;
}
function injectThinking(obj) {
  if (!isDeepSeekModel(obj.model)) return;
  const th = obj.thinking;
  const isObj = !!th && typeof th === "object" && !Array.isArray(th);
  const typ = isObj ? String(th.type || "").trim() : "";
  if (typ) {
    if (typ.toLowerCase() === "disabled") {
      delete obj.reasoning_effort;
      delete obj.reasoningEffort;
      return;
    }
    ensureDeepSeekEffort(obj);
    return;
  }
  if (!isObj) obj.thinking = { type: "enabled" };
  else th.type = "enabled";
  ensureDeepSeekEffort(obj);
}
function backfillReasoningContent(obj) {
  if (!isDeepSeekModel(obj.model)) return;
  const msgs = obj.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) return;
  let thinkingEnabled = false;
  if (obj.thinking && typeof obj.thinking === "object") {
    if (String(obj.thinking.type || "").trim().toLowerCase() === "enabled") thinkingEnabled = true;
  }
  let hasTrace = false;
  for (const m of msgs) {
    if (!m || typeof m !== "object") continue;
    if (typeof m.reasoning === "string" && m.reasoning) {
      hasTrace = true;
      break;
    }
    if ("reasoning_content" in m) {
      hasTrace = true;
      break;
    }
  }
  if (!thinkingEnabled && !hasTrace) return;
  for (const m of msgs) {
    if (!m || typeof m !== "object" || m.role !== "assistant") continue;
    let rc;
    if (typeof m.reasoning_content === "string") rc = m.reasoning_content;
    else if (typeof m.reasoning === "string") {
      rc = m.reasoning;
      m.reasoning_content = rc;
    } else {
      rc = "";
      m.reasoning_content = rc;
    }
    if (typeof m.reasoning === "string" && m.reasoning) continue;
    m.reasoning = rc || " ";
  }
}
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function ensureUsageTotal(u) {
  if (!u || typeof u !== "object") return u;
  if ("total_tokens" in u) return u;
  if ("prompt_tokens" in u && "completion_tokens" in u) {
    return { ...u, total_tokens: num(u.prompt_tokens) + num(u.completion_tokens) };
  }
  return u;
}
function dropTruncatedToolCalls(calls) {
  return calls.filter((c) => {
    const a = c?.function?.arguments;
    if (typeof a !== "string" || a === "") return true;
    try {
      JSON.parse(a);
      return true;
    } catch {
      return false;
    }
  });
}
async function aggregateCodebuddyStream(body) {
  const text = await new Response(body).text();
  let id = "";
  let model = "";
  let created = 0;
  let content = "";
  let reasoning = "";
  let role = "assistant";
  let finishReason = "stop";
  let usage = null;
  let gotAnyContent = false;
  let validEvents = 0;
  let sawDone = false;
  const toolCalls = /* @__PURE__ */ new Map();
  const toolOrder = [];
  let toolSeq = 0;
  const idIndex = /* @__PURE__ */ new Map();
  const nextToolIndex = () => {
    for (; ; ) {
      const i = toolSeq++;
      if (!toolCalls.has(i)) return i;
    }
  };
  const appendContent = (t) => {
    if (!t) return;
    content += t;
    gotAnyContent = true;
  };
  const mergeToolCallDelta = (merged, delta) => {
    if (typeof delta.id === "string" && delta.id) merged.id = delta.id;
    if (typeof delta.type === "string" && delta.type) merged.type = delta.type;
    const df = delta.function;
    if (!df || typeof df !== "object") return;
    if (!merged.function || typeof merged.function !== "object") merged.function = {};
    const mf = merged.function;
    if (typeof df.name === "string" && df.name) mf.name = df.name;
    if (typeof df.arguments === "string" && df.arguments) mf.arguments = (mf.arguments || "") + df.arguments;
  };
  const mergeToolCallsChunk = (tcs) => {
    for (const call of tcs) {
      if (!call || typeof call !== "object") continue;
      let idx = -1;
      if (typeof call.index === "number") idx = call.index;
      else if (typeof call.id === "string" && call.id) {
        if (idIndex.has(call.id)) idx = idIndex.get(call.id);
        else idx = nextToolIndex();
      } else if (toolOrder.length > 0) idx = toolOrder[toolOrder.length - 1];
      else idx = nextToolIndex();
      let merged = toolCalls.get(idx);
      if (!merged) {
        merged = { index: idx };
        toolCalls.set(idx, merged);
        toolOrder.push(idx);
      }
      if (typeof call.id === "string" && call.id) idIndex.set(call.id, idx);
      if (typeof merged.id === "string" && merged.id) idIndex.set(merged.id, idx);
      mergeToolCallDelta(merged, call);
    }
  };
  const mergeMessageFields = (msg) => {
    if (typeof msg.role === "string" && msg.role) role = msg.role;
    if (typeof msg.content === "string") appendContent(msg.content);
    if (typeof msg.reasoning_content === "string") reasoning += msg.reasoning_content;
    if (Array.isArray(msg.tool_calls)) mergeToolCallsChunk(msg.tool_calls);
  };
  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6);
    if (payload === "[DONE]") {
      sawDone = true;
      break;
    }
    let chunk;
    try {
      chunk = JSON.parse(payload);
    } catch {
      continue;
    }
    validEvents++;
    if (typeof chunk.id === "string" && chunk.id && !id) id = chunk.id;
    if (typeof chunk.model === "string" && chunk.model && !model) model = chunk.model;
    if (typeof chunk.created === "number" && !created) created = chunk.created;
    if (chunk.usage && typeof chunk.usage === "object") usage = chunk.usage;
    if (Array.isArray(chunk.choices)) {
      for (const c of chunk.choices) {
        if (!c || typeof c !== "object") continue;
        if (typeof c.finish_reason === "string" && c.finish_reason) finishReason = c.finish_reason;
        if (c.delta && typeof c.delta === "object") {
          if (typeof c.delta.role === "string" && c.delta.role) role = c.delta.role;
          if (typeof c.delta.content === "string") appendContent(c.delta.content);
          if (typeof c.delta.reasoning_content === "string") reasoning += c.delta.reasoning_content;
          if (Array.isArray(c.delta.tool_calls)) mergeToolCallsChunk(c.delta.tool_calls);
        }
        if (c.message && typeof c.message === "object" && !gotAnyContent) mergeMessageFields(c.message);
      }
    }
  }
  if (validEvents === 0) throw new Error("\u4E0A\u6E38\u8FD4\u56DE\u7A7A\u6D41\uFF08\u65E0\u6709\u6548 SSE \u6570\u636E\u5E27\uFF09");
  const message = { role, content };
  if (reasoning) message.reasoning_content = reasoning;
  if (toolOrder.length > 0) {
    toolOrder.sort((a, b) => a - b);
    let calls = toolOrder.map((i) => toolCalls.get(i)).filter(Boolean);
    if (finishReason === "length" || !sawDone) calls = dropTruncatedToolCalls(calls);
    if (calls.length > 0) message.tool_calls = calls;
  }
  const resp = {
    id: id || `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(created || Date.now() / 1e3),
    model,
    choices: [{ index: 0, message, finish_reason: finishReason }]
  };
  if (usage) resp.usage = ensureUsageTotal(usage);
  return {
    response: resp,
    usage: { promptTokens: num(usage?.prompt_tokens ?? usage?.input_tokens), completionTokens: num(usage?.completion_tokens ?? usage?.output_tokens) }
  };
}
function stripToolCallNames(obj, seen) {
  if (!Array.isArray(obj?.choices)) return;
  for (const c of obj.choices) {
    const tcs = c?.delta?.tool_calls;
    if (!Array.isArray(tcs)) continue;
    for (const tc of tcs) {
      if (!tc || typeof tc !== "object") continue;
      const idx = typeof tc.index === "number" ? tc.index : 0;
      if (seen.has(idx)) {
        if (tc.function && typeof tc.function === "object") delete tc.function.name;
        continue;
      }
      seen.add(idx);
    }
  }
}
function normalizeFrame(obj) {
  const out = {};
  for (const k of ["id", "object", "created", "model", "system_fingerprint", "service_tier"]) {
    if (obj[k] !== void 0 && obj[k] !== null) out[k] = obj[k];
  }
  if (!out.object) out.object = "chat.completion.chunk";
  if (!out.id) out.id = "chatcmpl-codebuddy";
  if (Array.isArray(obj.choices)) {
    out.choices = obj.choices.map((c) => {
      const nc = {};
      if (c?.index !== void 0) nc.index = c.index;
      const delta = {};
      const d = c?.delta;
      if (d && typeof d === "object") {
        if (typeof d.role === "string" && d.role) delta.role = d.role;
        if (typeof d.content === "string" && d.content) delta.content = d.content;
        if (typeof d.reasoning_content === "string" && d.reasoning_content) delta.reasoning_content = d.reasoning_content;
        if (typeof d.refusal === "string" && d.refusal) delta.refusal = d.refusal;
        if (Array.isArray(d.tool_calls) && d.tool_calls.length > 0) delta.tool_calls = d.tool_calls;
        if (d.function_call != null) {
          const fc = d.function_call;
          const keep = typeof fc === "object" ? !!(fc.name || fc.arguments) : true;
          if (keep) delta.function_call = fc;
        }
      }
      nc.delta = delta;
      nc.finish_reason = typeof c?.finish_reason === "string" && c.finish_reason ? c.finish_reason : null;
      return nc;
    });
  }
  out.usage = obj.usage !== void 0 ? obj.usage : null;
  return out;
}
function normalizeCodebuddyStream(src) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";
  const toolSeen = /* @__PURE__ */ new Set();
  let firstId = "";
  let validFrames = 0;
  let sawDone = false;
  let usage = { promptTokens: 0, completionTokens: 0 };
  let resolveDone = () => {
  };
  const done = new Promise((res) => {
    resolveDone = res;
  });
  const handleLine = (line) => {
    if (sawDone) return "";
    if (line.startsWith("data: [DONE]")) {
      sawDone = true;
      return "";
    }
    if (line.startsWith("data: ")) {
      const payload = line.slice(6);
      let obj;
      try {
        obj = JSON.parse(payload);
      } catch {
        return "data: " + payload + "\n\n";
      }
      if (obj && typeof obj === "object" && obj.error) {
        validFrames++;
        return "data: " + payload + "\n\n";
      }
      if (obj?.usage && typeof obj.usage === "object") {
        usage = {
          promptTokens: num(obj.usage.prompt_tokens ?? obj.usage.input_tokens),
          completionTokens: num(obj.usage.completion_tokens ?? obj.usage.output_tokens)
        };
      }
      stripToolCallNames(obj, toolSeen);
      if (!firstId) {
        if (typeof obj?.id === "string" && obj.id) firstId = obj.id;
      } else if (typeof obj?.id !== "string" || !obj.id) {
        obj.id = firstId;
      }
      validFrames++;
      return "data: " + JSON.stringify(normalizeFrame(obj)) + "\n\n";
    }
    if (line !== "") return line + "\n";
    return "";
  };
  const stream = src.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        buf += decoder.decode(chunk, { stream: true });
        let nl = buf.indexOf("\n");
        while (nl >= 0) {
          const line = buf.slice(0, nl).replace(/\r$/, "");
          buf = buf.slice(nl + 1);
          const out = handleLine(line);
          if (out) controller.enqueue(encoder.encode(out));
          nl = buf.indexOf("\n");
        }
      },
      flush(controller) {
        if (buf) {
          const out = handleLine(buf.replace(/\r$/, ""));
          if (out) controller.enqueue(encoder.encode(out));
          buf = "";
        }
        if (validFrames === 0) {
          controller.enqueue(encoder.encode("data: " + JSON.stringify({
            error: { message: "empty upstream stream", type: "upstream_error", code: "upstream_parse" }
          }) + "\n\n"));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        resolveDone(usage);
      }
    })
  );
  return { stream, done };
}
async function handleCodebuddyRequest(p, baseUrl, regionCode) {
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0) {
    return oauthErrorResponse(
      "\u8BE5 codebuddy \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Keys\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A refresh_token\uFF08\u53EF\u70B9\u300C\u6388\u6743\u767B\u5F55\u300D\u81EA\u52A8\u83B7\u53D6\uFF09",
      400,
      "configuration_error"
    );
  }
  const region = cbRegion(baseUrl, regionCode);
  const wantStream = p.body?.stream === true;
  const upstreamBody = rewriteCodebuddyPayload(p.body, p.modelId);
  let lastError = "";
  let lastStatus = 502;
  for (const refreshToken of tokens) {
    try {
      const { accessToken, account } = await getCbAccess(p.env, refreshToken, region);
      const headers = await cbChatHeaders(region, accessToken, account, wantStream);
      const upstream = await fetch(region.base + CB_CHAT_PATH, {
        method: "POST",
        headers,
        body: JSON.stringify(upstreamBody),
        signal: AbortSignal.timeout(6e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (!upstream.body) {
        lastError = "\u4E0A\u6E38\u672A\u8FD4\u56DE\u54CD\u5E94\u4F53";
        lastStatus = 502;
        continue;
      }
      if (wantStream) {
        const { stream, done } = normalizeCodebuddyStream(upstream.body);
        defer(p, done.then((u) => recordOAuthUsage(p, u, true, 200)));
        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-store",
            Connection: "keep-alive"
          }
        });
      }
      const agg = await aggregateCodebuddyStream(upstream.body);
      defer(p, recordOAuthUsage(p, agg.usage, true, 200));
      return new Response(JSON.stringify(agg.response), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 CodeBuddy \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function testCodebuddy(env, refreshToken, modelId, baseUrl, regionCode) {
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
  const region = cbRegion(baseUrl, regionCode);
  try {
    const { accessToken, account } = await getCbAccess(env, refreshToken, region);
    const headers = await cbChatHeaders(region, accessToken, account, true);
    const res = await fetch(region.base + CB_CHAT_PATH, {
      method: "POST",
      headers,
      body: JSON.stringify(rewriteCodebuddyPayload({ messages: [{ role: "user", content: "hi" }], max_tokens: 1 }, modelId)),
      signal: AbortSignal.timeout(6e4)
    });
    if (res.ok) {
      await res.text().catch(() => "");
      return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: 200 };
    }
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
async function fetchCodebuddyModels(env, refreshToken, baseUrl, regionCode) {
  const region = cbRegion(baseUrl, regionCode);
  try {
    const { accessToken, account } = await getCbAccess(env, refreshToken, region);
    const headers = await cbChatHeaders(region, accessToken, account, false);
    const primary = region.global ? CB_MODELS_PATH_GLOBAL : CB_MODELS_PATH_CN;
    const tried = [primary, CB_V3_CONFIG_PATH];
    let lastMsg = "";
    for (const path of tried) {
      const res = await fetch(region.base + path, { method: "GET", headers, signal: AbortSignal.timeout(3e4) });
      const text = await res.text();
      if (!res.ok) {
        lastMsg = `HTTP ${res.status}: ${text.slice(0, 160)}`;
        continue;
      }
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        lastMsg = "\u8FD4\u56DE\u975E JSON";
        continue;
      }
      const models = extractModelIds(json);
      if (models.length > 0) return { success: true, models };
      lastMsg = "\u4E0A\u6E38\u672A\u8FD4\u56DE\u6A21\u578B\u5217\u8868";
    }
    return { success: false, models: [], message: `${lastMsg}\uFF0C\u8BF7\u624B\u52A8\u586B\u5199\u6A21\u578B ID\uFF08\u5982 deepseek-v4.1-flash\uFF09` };
  } catch (err) {
    return { success: false, models: [], message: err.message || "\u62C9\u53D6\u5931\u8D25" };
  }
}
function extractModelIds(json) {
  const data = json?.data;
  if (!data || typeof data !== "object") return [];
  const out = [];
  const push = (v) => {
    const s = String(v ?? "").trim();
    if (s && !out.includes(s)) out.push(s);
  };
  const agents = Array.isArray(data.agents) ? data.agents : [];
  const cli = agents.find((a) => a && typeof a === "object" && a.name === "cli");
  if (cli && Array.isArray(cli.models)) for (const m of cli.models) push(m);
  const models = Array.isArray(data.models) ? data.models : [];
  const disabled = /* @__PURE__ */ new Set();
  for (const m of models) {
    if (m && typeof m === "object" && m.disabled) {
      const id = String(m.id ?? m.model ?? m.name ?? "").trim();
      if (id) disabled.add(id);
    }
  }
  for (const m of models) {
    const id = typeof m === "string" ? m : String(m?.id ?? m?.model ?? m?.modelName ?? m?.name ?? "").trim();
    if (id && !disabled.has(id)) push(id);
  }
  return out;
}
function packageRemainUsed(a) {
  const n = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const cycleSize = n(a.CycleCapacitySize);
  if (cycleSize > 0) {
    let remain2 = n(a.CycleCapacityRemain);
    const size2 = cycleSize;
    if (remain2 < 0) remain2 = 0;
    if (remain2 > size2) remain2 = size2;
    let used2 = size2 - remain2;
    const cycleUsed = n(a.CycleCapacityUsed);
    if (cycleUsed > used2) {
      used2 = cycleUsed;
      if (size2 >= used2) remain2 = size2 - used2;
    }
    return { remain: remain2, used: used2, size: size2 };
  }
  const remain = n(a.CapacityRemain);
  let used = n(a.CapacityUsed);
  const size = n(a.CapacitySize);
  if (used === 0 && size > remain) used = size - remain;
  return { remain, used, size };
}
async function fetchCodebuddyStatus(env, refreshToken, baseUrl, regionCode) {
  if (!refreshToken) return { ok: false, message: "\u672A\u586B\u5199 refresh_token" };
  const region = cbRegion(baseUrl, regionCode);
  try {
    const { accessToken, account } = await getCbAccess(env, refreshToken, region);
    const headers = cbBillingHeaders(region, accessToken, account);
    const now = /* @__PURE__ */ new Date();
    const pad = (x) => String(x).padStart(2, "0");
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const body = {
      PageNumber: 1,
      PageSize: 100,
      ProductCode: "p_tcaca",
      Status: [0, 3],
      PackageEndTimeRangeBegin: fmt(now),
      PackageEndTimeRangeEnd: fmt(new Date(now.getTime() + 365 * 101 * 24 * 3600 * 1e3))
    };
    const targets = region.global ? CB_METER_CANDIDATES_GLOBAL : CB_METER_CANDIDATES_CN;
    let lastMsg = "";
    for (const target of targets) {
      const res = await fetch(target.base + target.path, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3e4)
      });
      const text = await res.text();
      if (res.status === 404) {
        lastMsg = `HTTP 404: ${text.slice(0, 120)}`;
        continue;
      }
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return { ok: false, message: `\u8FD4\u56DE\u975E JSON (HTTP ${res.status}): ${text.slice(0, 200)}` };
      }
      if (!res.ok || json?.code !== 0) {
        return { ok: false, message: `HTTP ${res.status} code=${json?.code} msg=${json?.msg || text.slice(0, 160)}` };
      }
      const inner = json?.data?.Response?.Data || json?.data?.data || json?.data || {};
      const accounts = Array.isArray(inner.Accounts) ? inner.Accounts : [];
      let remain = 0;
      let used = 0;
      let size = 0;
      const packages = [];
      for (const a of accounts) {
        const r = packageRemainUsed(a);
        remain += r.remain;
        used += r.used;
        size += r.size;
        packages.push({
          name: String(a?.PackageName || "\u5957\u9910"),
          remain: r.remain,
          used: r.used,
          size: r.size,
          endTime: String(a?.CycleEndTime || "")
        });
      }
      const dosage = Number(inner.TotalDosage) || 0;
      if (size > 0 && size - remain > used) used = size - remain;
      if (dosage > size) {
        size = dosage;
        if (size - remain > used) used = size - remain;
      }
      return {
        ok: true,
        nickname: account.nickname,
        uid: account.uid,
        enterpriseId: account.enterpriseId,
        realm: region.global ? "global" : "cn",
        remain,
        used,
        size,
        packs: packages.length,
        packages: packages.slice(0, 20)
      };
    }
    return { ok: false, message: lastMsg || "\u67E5\u8BE2\u5931\u8D25" };
  } catch (err) {
    return { ok: false, message: err.message || "\u67E5\u8BE2\u5931\u8D25" };
  }
}
function isAlreadyCheckedIn(msg) {
  const s = (msg || "").toLowerCase();
  return ["\u5DF2\u7B7E\u5230", "\u7B7E\u5230\u8FC7", "\u91CD\u590D\u7B7E\u5230", "already", "code=10001"].some((m) => s.includes(m.toLowerCase()));
}
async function attachBalance(env, refreshToken, baseUrl, regionCode, res) {
  try {
    const st = await fetchCodebuddyStatus(env, refreshToken, baseUrl, regionCode);
    if (st.ok) {
      if (typeof st.remain === "number") res.remain = st.remain;
      if (!res.nickname && st.nickname) res.nickname = st.nickname;
      if (!res.uid && st.uid) res.uid = st.uid;
    }
  } catch {
  }
  return res;
}
async function checkinCodebuddy(env, refreshToken, baseUrl, regionCode) {
  if (!refreshToken) return { ok: false, message: "\u672A\u586B\u5199 refresh_token" };
  const region = cbRegion(baseUrl, regionCode);
  const realm = region.global ? "global" : "cn";
  try {
    const { accessToken, account } = await getCbAccess(env, refreshToken, region);
    const headers = cbBillingHeaders(region, accessToken, account);
    const targets = region.global ? CB_CHECKIN_CANDIDATES_GLOBAL : CB_CHECKIN_CANDIDATES_CN;
    let lastMsg = "";
    for (const target of targets) {
      const res = await fetch(target.base + target.path, {
        method: "POST",
        headers,
        body: "{}",
        signal: AbortSignal.timeout(3e4)
      });
      const text = await res.text();
      if (res.status === 404) {
        lastMsg = `HTTP 404: ${text.slice(0, 120)}`;
        continue;
      }
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
      const bizMsg = String(json?.msg || json?.message || "");
      if (!res.ok || json && json.code !== 0) {
        if (isAlreadyCheckedIn(bizMsg) || isAlreadyCheckedIn(text)) {
          return attachBalance(env, refreshToken, baseUrl, regionCode, {
            ok: true,
            already: true,
            message: "\u4ECA\u65E5\u5DF2\u7B7E\u5230",
            realm,
            nickname: account.nickname,
            uid: account.uid
          });
        }
        return { ok: false, message: `HTTP ${res.status} code=${json?.code} msg=${bizMsg || text.slice(0, 160)}` };
      }
      const inner = json?.data?.Response?.Data || json?.data?.data || json?.data || {};
      const reward = Number(inner?.Reward ?? inner?.Dosage ?? inner?.Credit ?? json?.data?.reward ?? 0) || 0;
      return attachBalance(env, refreshToken, baseUrl, regionCode, {
        ok: true,
        message: reward > 0 ? `\u7B7E\u5230\u6210\u529F\uFF0C\u83B7\u5F97 ${reward} \u79EF\u5206` : "\u7B7E\u5230\u6210\u529F",
        realm,
        nickname: account.nickname,
        uid: account.uid,
        ...reward > 0 ? { reward } : {}
      });
    }
    return { ok: false, message: lastMsg || "\u7B7E\u5230\u5931\u8D25" };
  } catch (err) {
    return { ok: false, message: err.message || "\u7B7E\u5230\u5931\u8D25" };
  }
}
async function codebuddyCronToken(env) {
  const secret = env.ADMIN_PASSWORD || "";
  if (!secret) return "";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(CB_CRON_TOKEN_LABEL));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
var CB_CN, CB_GLOBAL, CB_CLIENT_VERSION, CB_CLI_VERSION, CB_LOGIN_UA, CB_STATE_PATH, CB_TOKEN_PATH, CB_ACCOUNT_PATH, CB_REFRESH_PATH, CB_CHAT_PATH, CB_MODELS_PATH_CN, CB_MODELS_PATH_GLOBAL, CB_V3_CONFIG_PATH, CB_METER_PATH, CB_CHECKIN_PATH, CB_METER_CANDIDATES_CN, CB_METER_CANDIDATES_GLOBAL, CB_CHECKIN_CANDIDATES_CN, CB_CHECKIN_CANDIDATES_GLOBAL, CB_CRON_TOKEN_LABEL, CB_AT_PREFIX, CB_AUTH_PREFIX, CB_ACCT_PREFIX, CB_AUTH_TTL, CB_ACCT_TTL, DEEPSEEK_DEFAULT_EFFORT;
var init_codebuddy = __esm({
  "src/codebuddy.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    CB_CN = {
      base: "https://copilot.tencent.com",
      billingBase: "https://www.codebuddy.cn",
      origin: "https://www.codebuddy.cn",
      global: false
    };
    CB_GLOBAL = {
      base: "https://www.workbuddy.ai",
      billingBase: "https://www.workbuddy.ai",
      origin: "https://www.workbuddy.ai",
      global: true
    };
    CB_CLIENT_VERSION = "5.5.4";
    CB_CLI_VERSION = "2.137.1";
    CB_LOGIN_UA = "CLI/2.63.2 CodeBuddy/2.63.2";
    CB_STATE_PATH = "/v2/plugin/auth/state?platform=CLI";
    CB_TOKEN_PATH = "/v2/plugin/auth/token";
    CB_ACCOUNT_PATH = "/v2/plugin/login/account";
    CB_REFRESH_PATH = "/v2/plugin/auth/token/refresh";
    CB_CHAT_PATH = "/v2/chat/completions";
    CB_MODELS_PATH_CN = "/console/enterprises/personal/models";
    CB_MODELS_PATH_GLOBAL = "/v2/enterprises/personal/models";
    CB_V3_CONFIG_PATH = "/v3/config";
    CB_METER_PATH = "/meter/get-user-resource";
    CB_CHECKIN_PATH = "/meter/daily-checkin";
    CB_METER_CANDIDATES_CN = cbBillingTargets(CB_CN, CB_METER_PATH);
    CB_METER_CANDIDATES_GLOBAL = cbBillingTargets(CB_GLOBAL, CB_METER_PATH);
    CB_CHECKIN_CANDIDATES_CN = cbBillingTargets(CB_CN, CB_CHECKIN_PATH);
    CB_CHECKIN_CANDIDATES_GLOBAL = cbBillingTargets(CB_GLOBAL, CB_CHECKIN_PATH);
    CB_CRON_TOKEN_LABEL = "codebuddy-checkin-cron-v1";
    CB_AT_PREFIX = "codebuddy:at:";
    CB_AUTH_PREFIX = "codebuddy:auth:";
    CB_ACCT_PREFIX = "codebuddy:acct:";
    CB_AUTH_TTL = 3600;
    CB_ACCT_TTL = 90 * 24 * 3600;
    DEEPSEEK_DEFAULT_EFFORT = "high";
  }
});

// src/cline.ts
var cline_exports = {};
__export(cline_exports, {
  CLINE_DEFAULT_MODEL: () => CLINE_DEFAULT_MODEL,
  fetchClineModels: () => fetchClineModels,
  handleClineRequest: () => handleClineRequest,
  pollClineDeviceFlow: () => pollClineDeviceFlow,
  startClineDeviceFlow: () => startClineDeviceFlow,
  testCline: () => testCline
});
async function refreshClineToken(refreshToken) {
  const res = await fetch(CLINE_API_BASE + "/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken, grantType: "refresh_token" }),
    signal: AbortSignal.timeout(3e4)
  });
  if (!res.ok) {
    throw new Error(`refresh HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`);
  }
  const json = await res.json().catch(() => null);
  const accessToken = json?.data?.accessToken;
  if (!accessToken) throw new Error("refresh \u54CD\u5E94\u672A\u5305\u542B accessToken");
  let expiresIn = 600;
  const exp = json?.data?.expiresAt;
  if (typeof exp === "number" && exp > Date.now()) expiresIn = Math.floor((exp - Date.now()) / 1e3);
  else if (typeof exp === "string") {
    const t = Date.parse(exp);
    if (!Number.isNaN(t) && t > Date.now()) expiresIn = Math.floor((t - Date.now()) / 1e3);
  }
  return { accessToken, expiresIn: Math.max(60, expiresIn - 60) };
}
function getClineAccess(env, refreshToken) {
  return resolveAccessToken(env, CLINE_AT_PREFIX, refreshToken, async () => {
    const { accessToken, expiresIn } = await refreshClineToken(refreshToken);
    return { accessToken, expiresIn };
  });
}
function cooldownKey(refreshToken, modelId) {
  return sha256Hex(refreshToken).then((h) => h.slice(0, 16) + "|" + modelId);
}
function parseCooldownMs(text, status) {
  const m = (text || "").match(/try again in (?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i);
  if (m) {
    const ms = (parseInt(m[1] || "0", 10) * 3600 + parseInt(m[2] || "0", 10) * 60 + parseInt(m[3] || "0", 10)) * 1e3;
    if (ms > 0) return Math.min(ms, 6 * 3600 * 1e3);
  }
  if (status === 429) return 5 * 60 * 1e3;
  return 60 * 1e3;
}
function rewriteClinePayload(body, modelId, wantStream) {
  const upstream = {
    model: modelId,
    session_id: "sess_" + Date.now(),
    reasoning_effort: body.reasoning_effort || body.reasoningEffort || "high",
    messages: body.messages || []
  };
  const forceStream = FREE_CHANNEL_PREFIXES.some((p) => modelId.startsWith(p));
  if (wantStream || forceStream) upstream.stream = true;
  for (const k of ["temperature", "top_p", "tools", "tool_choice", "stop", "presence_penalty", "frequency_penalty", "response_format", "user", "n", "seed"]) {
    if (body[k] !== void 0) upstream[k] = body[k];
  }
  return upstream;
}
function clineChatHeaders(accessToken, sessionId) {
  return {
    Authorization: "Bearer workos:" + accessToken,
    "Content-Type": "application/json",
    ...CLINE_FINGERPRINT_HEADERS,
    "X-Task-ID": sessionId
  };
}
function enqueue(fn) {
  const run = queueTail.then(() => new Promise((r) => setTimeout(r, MIN_GAP_MS))).then(fn);
  queueTail = run.catch(() => {
  });
  return run;
}
function unwrapData(obj) {
  if (obj && typeof obj === "object" && obj.data && typeof obj.data === "object") {
    const d = obj.data;
    if (d.choices || d.id || d.usage || d.model) return d;
  }
  return obj;
}
function normalizeClineStream(src) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const usage = { promptTokens: 0, completionTokens: 0 };
  let resolveDone;
  const done = new Promise((r) => {
    resolveDone = r;
  });
  let buf = "";
  const handleLine = (line, controller) => {
    if (line.endsWith("\r")) line = line.slice(0, -1);
    if (!line.startsWith("data:")) {
      controller.enqueue(encoder.encode(line + "\n"));
      return;
    }
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") {
      controller.enqueue(encoder.encode(line + "\n\n"));
      return;
    }
    try {
      const obj = unwrapData(JSON.parse(payload));
      const u = obj?.usage;
      if (u) {
        usage.promptTokens = Number(u.prompt_tokens ?? 0) || 0;
        usage.completionTokens = Number(u.completion_tokens ?? 0) || 0;
      }
      controller.enqueue(encoder.encode("data: " + JSON.stringify(obj) + "\n\n"));
    } catch {
      controller.enqueue(encoder.encode(line + "\n"));
    }
  };
  const stream = src.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      buf += decoder.decode(chunk, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        handleLine(line, controller);
      }
    },
    flush(controller) {
      if (buf) handleLine(buf, controller);
      resolveDone(usage);
    }
  }));
  return { stream, done };
}
async function aggregateClineStream(body, fallbackModel) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let content = "";
  let reasoning = "";
  let finishReason = null;
  let id = "";
  let model = "";
  let usage = null;
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const obj = unwrapData(JSON.parse(payload));
        const choice = obj?.choices?.[0];
        if (!choice) {
          if (obj?.usage) usage = obj.usage;
          continue;
        }
        const delta = choice.delta || {};
        if (delta.content) content += delta.content;
        if (delta.reasoning) reasoning += delta.reasoning;
        if (choice.finish_reason) finishReason = choice.finish_reason;
        if (obj.id) id = obj.id;
        if (obj.model) model = obj.model;
        if (obj.usage) usage = obj.usage;
      } catch {
      }
    }
  }
  const message = { role: "assistant", content };
  if (reasoning) message.reasoning = reasoning;
  return {
    response: {
      id: id || "gen_" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1e3),
      model: model || fallbackModel,
      choices: [{
        index: 0,
        message,
        finish_reason: finishReason || "stop",
        logprobs: null,
        native_finish_reason: finishReason || "stop"
      }],
      usage: usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    },
    usage: {
      promptTokens: Number(usage?.prompt_tokens ?? 0) || 0,
      completionTokens: Number(usage?.completion_tokens ?? 0) || 0
    }
  };
}
async function handleClineRequest(p) {
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0) {
    return oauthErrorResponse(
      "\u8BE5 cline \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Keys\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A Cline refreshToken\uFF08\u53EF\u70B9\u300C\u6388\u6743\u767B\u5F55\u300D\u81EA\u52A8\u83B7\u53D6\uFF09",
      400,
      "configuration_error"
    );
  }
  const wantStream = p.body?.stream === true;
  const upstreamBody = rewriteClinePayload(p.body, p.modelId, wantStream);
  const ordered = [];
  for (const t of tokens) {
    const key = await cooldownKey(t, p.modelId);
    const until = cooldowns.get(key) || 0;
    if (until <= Date.now()) ordered.push(t);
  }
  for (const t of tokens) {
    if (!ordered.includes(t)) ordered.push(t);
  }
  let lastError = "";
  let lastStatus = 502;
  for (const refreshToken of ordered) {
    const key = await cooldownKey(refreshToken, p.modelId);
    try {
      const { accessToken } = await getClineAccess(p.env, refreshToken);
      const upstream = await enqueue(() => fetch(CLINE_API_BASE + "/chat/completions", {
        method: "POST",
        headers: clineChatHeaders(accessToken, upstreamBody.session_id),
        body: JSON.stringify(upstreamBody),
        signal: AbortSignal.timeout(6e5)
      }));
      if (!upstream.ok) {
        const errText2 = await readErrorBody(upstream);
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${errText2.slice(0, 300)}`;
        if (upstream.status === 401 || upstream.status === 403) {
          cooldowns.set(key, Date.now() + 60 * 1e3);
          continue;
        }
        if (upstream.status === 429 || upstream.status >= 500 || errText2.includes("empty response content")) {
          cooldowns.set(key, Date.now() + parseCooldownMs(errText2, upstream.status));
          continue;
        }
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (!upstream.body) {
        lastError = "\u4E0A\u6E38\u672A\u8FD4\u56DE\u54CD\u5E94\u4F53";
        lastStatus = 502;
        continue;
      }
      if (wantStream) {
        const { stream, done } = normalizeClineStream(upstream.body);
        defer(p, done.then((u2) => recordOAuthUsage(p, u2, true, 200)));
        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-store",
            Connection: "keep-alive"
          }
        });
      }
      const contentType = upstream.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream")) {
        const agg = await aggregateClineStream(upstream.body, p.modelId);
        defer(p, recordOAuthUsage(p, agg.usage, true, 200));
        return new Response(JSON.stringify(agg.response), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      }
      const raw2 = await upstream.json().catch(() => null);
      if (!raw2) {
        lastError = "\u4E0A\u6E38\u8FD4\u56DE\u975E JSON \u54CD\u5E94";
        lastStatus = 502;
        continue;
      }
      const normalized = unwrapData(raw2);
      const u = normalized?.usage;
      defer(p, recordOAuthUsage(p, {
        promptTokens: Number(u?.prompt_tokens ?? 0) || 0,
        completionTokens: Number(u?.completion_tokens ?? 0) || 0
      }, true, 200));
      return new Response(JSON.stringify(normalized), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 Cline \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function testCline(env, refreshToken, modelId) {
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refreshToken", statusCode: 0 };
  try {
    const { accessToken } = await getClineAccess(env, refreshToken);
    const sessionId = "sess_" + Date.now();
    const res = await fetch(CLINE_API_BASE + "/chat/completions", {
      method: "POST",
      headers: clineChatHeaders(accessToken, sessionId),
      body: JSON.stringify({
        model: modelId || CLINE_DEFAULT_MODEL,
        session_id: sessionId,
        reasoning_effort: "high",
        messages: [{ role: "user", content: "hi" }],
        stream: true
      }),
      signal: AbortSignal.timeout(6e4)
    });
    if (res.ok) {
      await res.text().catch(() => "");
      return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: 200 };
    }
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
function fetchClineModels() {
  return { success: true, models: CLINE_BUILTIN_MODELS.slice() };
}
async function startClineDeviceFlow(env) {
  const form = new URLSearchParams({ client_id: WORKOS_CLIENT_ID });
  const res = await fetch(WORKOS_DEVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u8BBE\u5907\u7801\u8BF7\u6C42\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.device_code) throw new Error(`\u8BBE\u5907\u7801\u8BF7\u6C42\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  const state = randomId();
  try {
    await getKV(env).put(CLINE_DEVICE_PREFIX + state, JSON.stringify({
      deviceCode: json.device_code
    }), { expirationTtl: Math.max(300, Number(json.expires_in) || 600) });
  } catch (e) {
    console.error("[cline] start store failed", state.slice(0, 8), String(e));
    throw new Error("\u8BBE\u5907\u7801\u4F1A\u8BDD\u5199\u5165\u5931\u8D25(\u5B58\u50A8\u5F02\u5E38)\uFF0C\u8BF7\u91CD\u8BD5");
  }
  return {
    state,
    verificationUri: String(json.verification_uri || "https://cline.bot"),
    verificationUriComplete: json.verification_uri_complete ? String(json.verification_uri_complete) : void 0,
    userCode: String(json.user_code || ""),
    expiresIn: Number(json.expires_in) || 600,
    interval: Math.max(5, Number(json.interval) || 5)
  };
}
async function pollClineDeviceFlow(env, state) {
  const raw2 = await getKV(env).get(CLINE_DEVICE_PREFIX + state);
  if (!raw2) return { status: "error", message: "\u8BBE\u5907\u7801\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
  const session = JSON.parse(raw2);
  if (session.done && session.refreshToken) {
    return { status: "ok", refreshToken: session.refreshToken };
  }
  const form = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    device_code: session.deviceCode,
    client_id: WORKOS_CLIENT_ID
  });
  const res = await fetch(WORKOS_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: "error", message: `\u8F6E\u8BE2\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}` };
  }
  if (json.error) {
    if (json.error === "authorization_pending" || json.error === "slow_down") return { status: "pending" };
    await getKV(env).delete(CLINE_DEVICE_PREFIX + state).catch(() => {
    });
    if (json.error === "access_denied") return { status: "error", message: "\u7528\u6237\u62D2\u7EDD\u4E86\u6388\u6743" };
    if (json.error === "expired_token" || json.error === "invalid_grant") return { status: "error", message: "\u8BBE\u5907\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
    return { status: "error", message: `WorkOS \u9519\u8BEF: ${json.error} ${json.error_description || ""}`.trim() };
  }
  if (!json.access_token) return { status: "error", message: "WorkOS \u672A\u8FD4\u56DE access_token" };
  const regRes = await fetch(CLINE_API_BASE + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: json.access_token, refreshToken: json.refresh_token }),
    signal: AbortSignal.timeout(3e4)
  });
  const regText = await regRes.text();
  let reg;
  try {
    reg = JSON.parse(regText);
  } catch {
    return { status: "error", message: `Cline \u6CE8\u518C\u8FD4\u56DE\u975E JSON: ${regText.slice(0, 200)}` };
  }
  const rt = reg?.data?.refreshToken;
  if (!rt) return { status: "error", message: `Cline \u6CE8\u518C\u5931\u8D25: ${regText.slice(0, 200)}` };
  await getKV(env).put(CLINE_DEVICE_PREFIX + state, JSON.stringify({
    deviceCode: session.deviceCode,
    done: true,
    refreshToken: rt
  }), { expirationTtl: 3600 }).catch(() => {
  });
  return { status: "ok", refreshToken: rt };
}
var CLINE_API_BASE, WORKOS_DEVICE_URL, WORKOS_AUTH_URL, WORKOS_CLIENT_ID, CLINE_FINGERPRINT_HEADERS, CLINE_AT_PREFIX, CLINE_DEVICE_PREFIX, FREE_CHANNEL_PREFIXES, CLINE_DEFAULT_MODEL, CLINE_BUILTIN_MODELS, cooldowns, queueTail, MIN_GAP_MS;
var init_cline = __esm({
  "src/cline.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    CLINE_API_BASE = "https://api.cline.bot/api/v1";
    WORKOS_DEVICE_URL = "https://api.workos.com/user_management/authorize/device";
    WORKOS_AUTH_URL = "https://api.workos.com/user_management/authenticate";
    WORKOS_CLIENT_ID = "client_01K3A541FN8TA3EPPHTD2325AR";
    CLINE_FINGERPRINT_HEADERS = {
      "User-Agent": "Cline/3.0.47",
      "HTTP-Referer": "https://cline.bot",
      "X-Title": "Cline",
      "X-IS-MULTIROOT": "false",
      "X-CLIENT-TYPE": "cline-sdk",
      "X-CLIENT-VERSION": "3.0.47",
      "X-PLATFORM": "terminal",
      "X-PLATFORM-VERSION": "3.0.47",
      "X-CORE-VERSION": "0.0.66"
    };
    CLINE_AT_PREFIX = "cline:at:";
    CLINE_DEVICE_PREFIX = "cline:dev:";
    FREE_CHANNEL_PREFIXES = ["deepseek/", "cline-free/", "cline-pass/"];
    CLINE_DEFAULT_MODEL = "cline-free/deepseek-v4.1-flash";
    CLINE_BUILTIN_MODELS = [
      CLINE_DEFAULT_MODEL,
      "deepseek/deepseek-v4-flash",
      "z-ai/glm-5.3-flash",
      "poolside/laguna-s-2.1:free"
    ];
    cooldowns = /* @__PURE__ */ new Map();
    queueTail = Promise.resolve();
    MIN_GAP_MS = 800;
  }
});

// src/grok.ts
var grok_exports = {};
__export(grok_exports, {
  handleGrokRequest: () => handleGrokRequest,
  pollGrokDeviceFlow: () => pollGrokDeviceFlow,
  startGrokDeviceFlow: () => startGrokDeviceFlow,
  testGrok: () => testGrok
});
async function discoverEndpoints(env) {
  const kv = getKV(env);
  const cached = await kv.get(EP_PREFIX + "v1").catch(() => null);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
    }
  }
  const res = await fetch(XAI_DISCOVERY_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`xAI OIDC \u53D1\u73B0\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 200)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("xAI OIDC \u53D1\u73B0\u8FD4\u56DE\u975E JSON");
  }
  const deviceAuthorization = String(json?.device_authorization_endpoint || "");
  const token = String(json?.token_endpoint || "");
  if (!deviceAuthorization || !token) throw new Error("xAI OIDC \u53D1\u73B0\u7F3A\u5C11\u7AEF\u70B9\u5B57\u6BB5");
  const endpoints = { deviceAuthorization, token };
  await kv.put(EP_PREFIX + "v1", JSON.stringify(endpoints), { expirationTtl: 86400 }).catch(() => {
  });
  return endpoints;
}
async function startGrokDeviceFlow(env) {
  const endpoints = await discoverEndpoints(env);
  const form = new URLSearchParams({ client_id: XAI_CLIENT_ID, scope: XAI_SCOPE });
  const res = await fetch(endpoints.deviceAuthorization, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`\u8BBE\u5907\u7801\u8BF7\u6C42\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.device_code) throw new Error(`\u8BBE\u5907\u7801\u8BF7\u6C42\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  const state = randomId();
  await getKV(env).put(DEVICE_PREFIX3 + state, JSON.stringify({ deviceCode: json.device_code }), {
    expirationTtl: Math.max(300, Number(json.expires_in) || 1800)
  }).catch(() => {
  });
  return {
    state,
    verificationUri: String(json.verification_uri || "https://x.ai/device"),
    verificationUriComplete: json.verification_uri_complete ? String(json.verification_uri_complete) : void 0,
    userCode: String(json.user_code || ""),
    expiresIn: Number(json.expires_in) || 1800,
    interval: Number(json.interval) || 5
  };
}
async function pollGrokDeviceFlow(env, state) {
  const raw2 = await getKV(env).get(DEVICE_PREFIX3 + state);
  if (!raw2) return { status: "error", message: "\u8BBE\u5907\u7801\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
  const { deviceCode } = JSON.parse(raw2);
  const endpoints = await discoverEndpoints(env);
  const form = new URLSearchParams({
    grant_type: XAI_DEVICE_GRANT,
    device_code: deviceCode,
    client_id: XAI_CLIENT_ID
  });
  const res = await fetch(endpoints.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: "error", message: `\u8F6E\u8BE2\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}` };
  }
  if (json.error) {
    if (json.error === "authorization_pending" || json.error === "slow_down") return { status: "pending" };
    if (json.error === "expired_token") {
      await getKV(env).delete(DEVICE_PREFIX3 + state).catch(() => {
      });
      return { status: "error", message: "\u8BBE\u5907\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u6388\u6743" };
    }
    if (json.error === "access_denied") {
      await getKV(env).delete(DEVICE_PREFIX3 + state).catch(() => {
      });
      return { status: "error", message: "\u7528\u6237\u62D2\u7EDD\u4E86\u6388\u6743" };
    }
    return { status: "error", message: `xAI OAuth \u9519\u8BEF: ${json.error} ${json.error_description || ""}`.trim() };
  }
  if (!json.access_token) return { status: "error", message: "xAI \u672A\u8FD4\u56DE access_token" };
  if (!json.refresh_token) return { status: "error", message: "xAI \u672A\u8FD4\u56DE refresh_token\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743" };
  await getKV(env).delete(DEVICE_PREFIX3 + state).catch(() => {
  });
  return { status: "ok", refreshToken: json.refresh_token };
}
async function refreshGrokToken(env, refreshToken) {
  const endpoints = await discoverEndpoints(env);
  const form = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: XAI_CLIENT_ID,
    refresh_token: refreshToken
  });
  const res = await fetch(endpoints.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form.toString(),
    signal: AbortSignal.timeout(3e4)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Grok OAuth \u5237\u65B0\u8FD4\u56DE\u975E JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.access_token) throw new Error(`Grok OAuth \u5237\u65B0\u5931\u8D25 HTTP ${res.status}: ${text.slice(0, 300)}`);
  return { accessToken: json.access_token, expiresIn: Number(json.expires_in) || 3600, refreshToken: json.refresh_token || void 0 };
}
async function getAccessToken5(env, refreshToken) {
  return (await resolveAccessToken(env, AT_PREFIX6, refreshToken, (token) => refreshGrokToken(env, token))).accessToken;
}
function apiHeaders3(accessToken, stream) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    "Accept": stream ? "text/event-stream" : "application/json",
    "User-Agent": XAI_UA,
    "X-XAI-Token-Auth": "xai-grok-cli",
    "x-grok-client-version": XAI_CLIENT_VERSION,
    "x-grok-client-identifier": "grok-shell",
    "x-authenticateresponse": "authenticate-response",
    "x-grok-conv-id": randomId()
  };
}
async function handleGrokRequest(p, subPath) {
  const tokens = (p.refreshTokens || []).filter((t) => t && t.trim());
  if (tokens.length === 0) {
    return oauthErrorResponse("\u8BE5 grok \u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E\uFF1A\u8BF7\u5728\u300CAPI Key\u300D\u91CC\u6BCF\u884C\u586B\u5165\u4E00\u4E2A xAI OAuth refresh_token\uFF08\u53EF\u901A\u8FC7\u8BBE\u5907\u7801\u6388\u6743\u83B7\u53D6\uFF09", 400, "configuration_error");
  }
  const wantStream = p.body?.stream === true;
  if (subPath === "responses-passthrough") {
    return forwardResponsesNative2(p, tokens[0].trim(), wantStream);
  }
  const { request } = openAIToResponsesRequest({ ...p.body, model: p.modelId });
  let lastError = "";
  let lastStatus = 502;
  for (const refreshToken of tokens) {
    try {
      const accessToken = await getAccessToken5(p.env, refreshToken);
      const upstream = await fetch(`${XAI_CHAT_PROXY_BASE}/responses`, {
        method: "POST",
        headers: apiHeaders3(accessToken, wantStream),
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(6e5)
      });
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = `HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`;
        if ([401, 403, 429].includes(upstream.status) || upstream.status >= 500) continue;
        return oauthErrorResponse(lastError, upstream.status, "upstream_error");
      }
      if (wantStream && upstream.body) {
        const stream = createOpenAIStreamFromResponses(upstream.body, p.requestedModel, (usage) => {
          defer(p, recordOAuthUsage(p, usage, true, 200));
        });
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" }
        });
      }
      const rawText = await upstream.text();
      let json;
      try {
        json = JSON.parse(rawText);
      } catch {
        return oauthErrorResponse(`\u4E0A\u6E38\u8FD4\u56DE\u975E JSON: ${rawText.slice(0, 200)}`, 502, "upstream_error");
      }
      const openai = responsesResponseToOpenAI(json, p.requestedModel);
      defer(p, recordOAuthUsage(p, {
        promptTokens: Number(json?.usage?.input_tokens) || 0,
        completionTokens: Number(json?.usage?.output_tokens) || 0
      }, true, 200));
      return new Response(JSON.stringify(openai), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch (err) {
      lastError = err.message || "\u672A\u77E5\u9519\u8BEF";
      lastStatus = 502;
      continue;
    }
  }
  return oauthErrorResponse(`\u6240\u6709 Grok \u8D26\u53F7\u5747\u5931\u8D25\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: ${lastError || "\u672A\u77E5"}`, lastStatus, "key_exhausted");
}
async function forwardResponsesNative2(p, refreshToken, wantStream) {
  try {
    const accessToken = await getAccessToken5(p.env, refreshToken);
    const upstream = await fetch(`${XAI_CHAT_PROXY_BASE}/responses`, {
      method: "POST",
      headers: apiHeaders3(accessToken, wantStream),
      body: JSON.stringify(p.body),
      signal: AbortSignal.timeout(6e5)
    });
    if (!upstream.ok) {
      return oauthErrorResponse(`HTTP ${upstream.status}: ${(await readErrorBody(upstream)).slice(0, 300)}`, upstream.status, "upstream_error");
    }
    const headers = {
      "Content-Type": upstream.headers.get("Content-Type") || (wantStream ? "text/event-stream" : "application/json"),
      "Cache-Control": "no-store"
    };
    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    return oauthErrorResponse(err.message || "\u900F\u4F20\u5931\u8D25", 502, "proxy_error");
  }
}
async function testGrok(env, refreshToken, modelId) {
  if (!refreshToken) return { success: false, message: "\u672A\u586B\u5199 refresh_token", statusCode: 0 };
  try {
    const accessToken = await getAccessToken5(env, refreshToken);
    const { request } = openAIToResponsesRequest({ model: modelId, messages: [{ role: "user", content: "hi" }], max_tokens: 16 });
    const res = await fetch(`${XAI_CHAT_PROXY_BASE}/responses`, {
      method: "POST",
      headers: apiHeaders3(accessToken, false),
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(3e4)
    });
    if (res.ok) return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: 200 };
    return { success: false, message: `HTTP ${res.status}: ${(await readErrorBody(res)).slice(0, 200)}`, statusCode: res.status };
  } catch (err) {
    return { success: false, message: err.message || "\u8FDE\u63A5\u5931\u8D25" };
  }
}
var XAI_DISCOVERY_URL, XAI_CLIENT_ID, XAI_SCOPE, XAI_DEVICE_GRANT, XAI_CHAT_PROXY_BASE, XAI_UA, XAI_CLIENT_VERSION, AT_PREFIX6, DEVICE_PREFIX3, EP_PREFIX;
var init_grok = __esm({
  "src/grok.ts"() {
    "use strict";
    init_storage_adapter();
    init_oauth_common();
    init_responses_translate();
    XAI_DISCOVERY_URL = "https://auth.x.ai/.well-known/openid-configuration";
    XAI_CLIENT_ID = "b1a00492-073a-47ea-816f-4c329264a828";
    XAI_SCOPE = "openid profile email offline_access grok-cli:access api:access";
    XAI_DEVICE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";
    XAI_CHAT_PROXY_BASE = "https://cli-chat-proxy.grok.com/v1";
    XAI_UA = "xai-grok-workspace/0.2.120";
    XAI_CLIENT_VERSION = "0.2.120";
    AT_PREFIX6 = "grok:at:";
    DEVICE_PREFIX3 = "grok:device:";
    EP_PREFIX = "grok:endpoints:";
  }
});

// src/edgeone-entry.ts
import crypto2 from "node:crypto";

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
};

// node_modules/hono/dist/utils/body.js
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = (request) => "headers" in request;
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".", MAX_NESTING_DEPTH + 2);
  if (keys.length > MAX_NESTING_DEPTH + 1) {
    throwNestingLimitExceeded();
  }
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) {
          throwNestingLimitExceeded();
        }
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var throwNestingLimitExceeded = () => {
  throw new Error("Nesting limit exceeded");
};

// node_modules/hono/dist/request.js
init_url();
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
        return new Response(body, {
          headers: contentType ? { "Content-Type": contentType } : void 0
        })[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   // Append multiple headers using the append option (e.g. Vary)
   *   c.header('Vary', 'Accept-Encoding', { append: true })
   *   c.header('Vary', 'User-Agent', { append: true })
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) {
          if (++count > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibytes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
init_url();
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(methodName, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) {
            this.#addRoute(methodName, this.#path, handler);
          }
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/router.js
init_url();

// node_modules/hono/dist/router/utils.js
var createNullObject = () => /* @__PURE__ */ Object.create(null);

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    `^${path.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
    this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap[METHOD_NAME_ALL]) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") {
      path = "*";
    }
    const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) {
        if (!middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      }
      for (const handlerMap of [middleware, routes]) {
        for (const m of methods) {
          for (const p in handlerMap[m]) {
            re.test(p) && handlerMap[m][p].push([handler, path]);
          }
        }
      }
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) {
      for (const m of methods) {
        if (!routes[m][path2]) {
          this.#insertPath(m, path2);
          routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        }
        routes[m][path2].push([handler, path2]);
      }
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) {
      matchers[method] = this.#buildMatcher(method);
    }
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
          continue;
        }
        handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
          h,
          trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())
        ]);
      }
    }
    return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
init_url();

// node_modules/hono/dist/router/trie-router/node.js
init_url();
var emptyParams = createNullObject();
var order = 0;
var Node2 = class _Node2 {
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new _Node2();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) {
        possibleKeys.add(pattern[1]);
      }
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      }
    });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) {
            continue;
          }
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node = new Node2();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) {
      this.#node.insert(method, result, handler);
    }
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const opts = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "QUERY"],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
    } else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else {
      return () => "";
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (exposeHeadersStr) {
      set("Access-Control-Expose-Headers", exposeHeadersStr);
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        c.res.headers.append("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods) {
        set("Access-Control-Allow-Methods", allowMethods);
      }
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
        }
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// node_modules/hono/dist/utils/color.js
function getColorEnabled() {
  const { process: process2, Deno } = globalThis;
  const isNoColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : process2 !== void 0 ? (
    // eslint-disable-next-line no-unsafe-optional-chaining
    "NO_COLOR" in process2?.env
  ) : false;
  return !isNoColor;
}
async function getColorEnabledAsync() {
  const { navigator } = globalThis;
  const cfWorkers = "cloudflare:workers";
  const isNoColor = navigator !== void 0 && navigator.userAgent === "Cloudflare-Workers" ? await (async () => {
    try {
      return "NO_COLOR" in ((await import(cfWorkers)).env ?? {});
    } catch {
      return false;
    }
  })() : !getColorEnabled();
  return !isNoColor;
}

// node_modules/hono/dist/middleware/logger/index.js
var humanize = (times) => {
  const [delimiter, separator] = [",", "."];
  const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));
  return orderTimes.join(separator);
};
var time = (start) => {
  const delta = Date.now() - start;
  return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"]);
};
var colorStatus = async (status) => {
  const colorEnabled = await getColorEnabledAsync();
  if (colorEnabled) {
    switch (status / 100 | 0) {
      case 5:
        return `\x1B[31m${status}\x1B[0m`;
      case 4:
        return `\x1B[33m${status}\x1B[0m`;
      case 3:
        return `\x1B[36m${status}\x1B[0m`;
      case 2:
        return `\x1B[32m${status}\x1B[0m`;
    }
  }
  return `${status}`;
};
async function log(fn, prefix, method, path, status = 0, elapsed) {
  const out = prefix === "<--" ? `${prefix} ${method} ${path}` : `${prefix} ${method} ${path} ${await colorStatus(status)} ${elapsed}`;
  fn(out);
}
var logger = (fn = console.log) => {
  return async function logger2(c, next) {
    const { method, url } = c.req;
    const path = url.slice(url.indexOf("/", 8));
    await log(fn, "<--", method, path);
    const start = Date.now();
    await next();
    await log(fn, "-->", method, path, c.res.status, time(start));
  };
};

// src/auth.ts
init_cookie2();
init_storage();
init_config();
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function adminAuthMiddleware(c, next) {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId) {
    const url = new URL(c.req.url);
    if (url.pathname === "/admin/login") return next();
    if (url.pathname.startsWith("/admin/api/")) {
      return c.json({ success: false, message: "\u672A\u767B\u5F55" }, 401);
    }
    return c.redirect("/admin/login");
  }
  const session = await getSession(c.env, sessionId);
  if (!session) {
    deleteCookie(c, "session_id");
    const url = new URL(c.req.url);
    if (url.pathname.startsWith("/admin/api/")) {
      return c.json({ success: false, message: "Session \u5DF2\u8FC7\u671F" }, 401);
    }
    return c.redirect("/admin/login");
  }
  ;
  c.set("username", session.username);
  return next();
}
async function handleLogin(c) {
  const { username, password } = await c.req.json();
  const adminUser = c.env.ADMIN_USERNAME;
  const adminPass = c.env.ADMIN_PASSWORD;
  if (!username || !password) {
    return c.json({ success: false, message: "\u8BF7\u8F93\u5165\u7528\u6237\u540D\u548C\u5BC6\u7801" }, 400);
  }
  let cred = null;
  if (adminUser && adminPass) {
    const passwordHash2 = await hashPassword(adminPass);
    cred = { username: adminUser, passwordHash: passwordHash2 };
  } else {
    cred = await getAdminCredentials(c.env);
  }
  if (!cred) {
    return c.json({
      success: false,
      message: "\u672A\u914D\u7F6E\u7BA1\u7406\u5458\u8D26\u53F7\uFF0C\u8BF7\u5728 Cloudflare \u73AF\u5883\u53D8\u91CF\u4E2D\u8BBE\u7F6E ADMIN_USERNAME \u548C ADMIN_PASSWORD"
    }, 500);
  }
  if (username !== cred.username) {
    return c.json({ success: false, message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" }, 401);
  }
  const passwordHash = await hashPassword(password);
  if (passwordHash !== cred.passwordHash) {
    return c.json({ success: false, message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" }, 401);
  }
  await setAdminCredentials(c.env, cred.username, cred.passwordHash);
  const sessionId = await createSession(c.env, username, SESSION_TTL);
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL
  });
  return c.json({ success: true, message: "\u767B\u5F55\u6210\u529F" });
}
async function handleLogout(c) {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) {
    await deleteSession(c.env, sessionId);
    deleteCookie(c, "session_id");
  }
  return c.redirect("/");
}
async function proxyKeyAuthMiddleware(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({
      error: { message: "\u7F3A\u5C11\u6216\u65E0\u6548\u7684 Authorization \u5934\uFF0C\u683C\u5F0F: Bearer sk_cf_*", type: "authentication_error" }
    }, 401);
  }
  const token = authHeader.slice(7);
  const isValid = await validateProxyKey(c.env, token);
  if (!isValid) {
    return c.json({
      error: { message: "API Key \u65E0\u6548\u6216\u5DF2\u7981\u7528", type: "authentication_error" }
    }, 401);
  }
  return next();
}

// src/llm-proxy.ts
init_storage();
init_storage_adapter();
init_config();

// src/opencode.ts
var OPENCODE_PROVIDER_ID = "opencode";
var OPENCODE_VERSION = "1.18.31";
var OPENCODE_TIMEOUT_MS = 3e5;
var BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function randomBase62(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[bytes[i] % 62];
  }
  return result;
}
var lastTimestamp = 0;
var idCounter = 0;
function createOpenCodeId(prefix) {
  const currentTimestamp = Date.now();
  if (currentTimestamp !== lastTimestamp) {
    lastTimestamp = currentTimestamp;
    idCounter = 0;
  }
  idCounter++;
  const now = BigInt(currentTimestamp) * BigInt(4096) + BigInt(idCounter);
  let hex = "";
  for (let i = 0; i < 6; i++) {
    const byte = Number(now >> BigInt(40 - 8 * i) & BigInt(255));
    hex += byte.toString(16).padStart(2, "0");
  }
  return `${prefix}_${hex}${randomBase62(14)}`;
}
var OPENCODE_CORE_TOOL_NAMES = ["read", "write", "edit", "shell", "glob", "grep"];
var OPENCODE_PLACEHOLDER_TOOL_DESCRIPTION = "Do not call this tool. It exists only for API compatibility and must never be invoked.";
var OPENCODE_CORE_TOOLS = OPENCODE_CORE_TOOL_NAMES.map((name) => ({
  type: "function",
  function: {
    name,
    description: OPENCODE_PLACEHOLDER_TOOL_DESCRIPTION,
    parameters: { type: "object", properties: {} }
  }
}));
function isOpenCodeProvider(providerId) {
  return providerId === OPENCODE_PROVIDER_ID;
}
function filterOpenCodeModels(models) {
  return models.filter((model) => typeof model.id === "string" && /^[A-Za-z0-9._:/-]+$/.test(model.id) && (model.id === "big-pickle" || model.id.endsWith("-free")));
}
function resolveOpenCodeUrls(env) {
  const raw2 = env.OPENCODE_MIRRORS_URL || "";
  const parts = raw2.split("\n").flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);
  return [...new Set(parts)];
}
function resolveProviderMirrorUrls(env, provider) {
  if (provider?.mirrorUrls && provider.mirrorUrls.length > 0) {
    return [...new Set(provider.mirrorUrls.map((s) => s.trim()).filter(Boolean))];
  }
  return resolveOpenCodeUrls(env);
}
function getMirrorOrder(urls, random) {
  if (urls.length === 0) return [];
  const start = Math.floor(random() * urls.length);
  return [
    ...urls.slice(start),
    ...urls.slice(0, start)
  ];
}
function buildUrl(baseUrl, subPath, search = "") {
  return `${baseUrl.replace(/\/+$/, "")}/${subPath.replace(/^\/+/, "")}${search}`;
}
function createRequestHeaders(apiKey, requestId, sessionId) {
  return new Headers({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "User-Agent": `opencode/${OPENCODE_VERSION} ai-sdk/provider-utils/4.0.23 runtime/bun/1.3.13`,
    "x-opencode-client": "cli",
    "x-opencode-project": "global",
    "x-opencode-request": requestId,
    "x-opencode-session": sessionId
  });
}
async function storeFailure(response) {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
    body: await response.arrayBuffer()
  };
}
function restoreFailure(failure) {
  return new Response(failure.body, {
    status: failure.status,
    statusText: failure.statusText,
    headers: failure.headers
  });
}
function transportErrorResponse(error) {
  const message = error instanceof Error && error.message ? error.message : "OpenCode \u4E0A\u6E38\u8BF7\u6C42\u5931\u8D25";
  return new Response(JSON.stringify({
    error: { message, type: "proxy_error" }
  }), {
    status: 502,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
async function requestUpstream(fetcher, url, apiKey, options, requestId, sessionId) {
  return fetcher(url, {
    method: options.method,
    headers: createRequestHeaders(apiKey, requestId, sessionId),
    body: options.method === "GET" || options.method === "HEAD" ? void 0 : options.body,
    signal: AbortSignal.timeout(OPENCODE_TIMEOUT_MS)
  });
}
async function aggregateOpenCodeStream(response, modelId) {
  const rawText = await response.text();
  let content = "";
  let reasoning = "";
  let id = "";
  let finishReason = "stop";
  let promptTokens = 0;
  let completionTokens = 0;
  const toolCallsMap = /* @__PURE__ */ new Map();
  for (const rawLine of rawText.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("data:")) continue;
    const dataStr = line.slice(5).trim();
    if (!dataStr || dataStr === "[DONE]") continue;
    try {
      const chunk = JSON.parse(dataStr);
      if (chunk.id) id = chunk.id;
      const choice = chunk.choices?.[0];
      const delta = choice?.delta;
      if (delta?.content) content += delta.content;
      if (delta?.reasoning_content) reasoning += delta.reasoning_content;
      if (choice?.finish_reason) finishReason = choice.finish_reason;
      if (Array.isArray(delta?.tool_calls)) {
        for (const tc of delta.tool_calls) {
          const idx = typeof tc.index === "number" ? tc.index : 0;
          if (!toolCallsMap.has(idx)) {
            toolCallsMap.set(idx, {
              id: tc.id || `call_${idx}`,
              type: tc.type || "function",
              function: {
                name: tc.function?.name || "",
                arguments: tc.function?.arguments || ""
              }
            });
          } else {
            const existing = toolCallsMap.get(idx);
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.function.name += tc.function.name;
            if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
          }
        }
      }
      if (chunk.usage) {
        promptTokens = chunk.usage.prompt_tokens || promptTokens;
        completionTokens = chunk.usage.completion_tokens || completionTokens;
      }
    } catch {
    }
  }
  const toolCalls = Array.from(toolCallsMap.values());
  const jsonResp = {
    id: id || `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1e3),
    model: modelId,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: content || null,
          ...reasoning ? { reasoning_content: reasoning } : {},
          ...toolCalls.length > 0 ? { tool_calls: toolCalls } : {}
        },
        finish_reason: toolCalls.length > 0 ? "tool_calls" : finishReason
      }
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens
    }
  };
  return new Response(JSON.stringify(jsonResp), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
async function proxyOpenCodeRequest(options) {
  const fetcher = options.fetcher ?? fetch;
  const random = options.random ?? Math.random;
  const requestId = createOpenCodeId("msg");
  const sessionId = createOpenCodeId("ses");
  let officialFailure = null;
  let mirrorFailure = null;
  let lastTransportError = null;
  let clientWantsStream = true;
  let upstreamBody = options.body;
  let requestedModel = "";
  if (options.body && options.method === "POST" && options.subPath.includes("chat/completions")) {
    try {
      const parsed = JSON.parse(options.body);
      if (parsed && typeof parsed === "object") {
        requestedModel = typeof parsed.model === "string" ? parsed.model : "";
        clientWantsStream = parsed.stream !== false && parsed.stream !== void 0;
        parsed.stream = true;
        if (!Array.isArray(parsed.tools) || parsed.tools.length === 0) {
          parsed.tools = OPENCODE_CORE_TOOLS;
        } else {
          const existingNames = new Set(
            parsed.tools.map((t) => t?.function?.name || t?.name).filter(Boolean)
          );
          const missingTools = OPENCODE_CORE_TOOLS.filter((t) => !existingNames.has(t.function.name));
          parsed.tools = [...parsed.tools, ...missingTools];
        }
        upstreamBody = JSON.stringify(parsed);
      }
    } catch {
    }
  }
  const upstreamOptions = {
    ...options,
    body: upstreamBody
  };
  const enabledKeys = options.apiKeys.filter((entry) => entry.enabled && entry.key);
  const officialUrl = buildUrl(options.baseUrl, options.subPath, options.search);
  for (const entry of enabledKeys) {
    try {
      const response = await requestUpstream(
        fetcher,
        officialUrl,
        entry.key,
        upstreamOptions,
        requestId,
        sessionId
      );
      if (response.ok) {
        if (!clientWantsStream && (response.headers.get("content-type") || "").includes("text/event-stream")) {
          return aggregateOpenCodeStream(response, requestedModel);
        }
        return response;
      }
      officialFailure = await storeFailure(response);
      if (response.status !== 401 && response.status !== 403 && response.status !== 429) break;
    } catch (error) {
      lastTransportError = error;
      break;
    }
  }
  for (const mirror of getMirrorOrder(options.mirrorUrls, random)) {
    try {
      const response = await requestUpstream(
        fetcher,
        buildUrl(mirror, options.subPath, options.search),
        "public",
        upstreamOptions,
        requestId,
        sessionId
      );
      if (response.ok) {
        if (!clientWantsStream && (response.headers.get("content-type") || "").includes("text/event-stream")) {
          return aggregateOpenCodeStream(response, requestedModel);
        }
        return response;
      }
      mirrorFailure = await storeFailure(response);
    } catch (error) {
      lastTransportError = error;
    }
  }
  if (officialFailure) return restoreFailure(officialFailure);
  if (mirrorFailure) return restoreFailure(mirrorFailure);
  return transportErrorResponse(lastTransportError);
}
async function testOpenCodeModel(baseUrl, apiKeys, modelId, mirrorUrls, fetcher) {
  const response = await proxyOpenCodeRequest({
    baseUrl,
    apiKeys,
    mirrorUrls,
    method: "POST",
    subPath: "chat/completions",
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 1
    }),
    fetcher
  });
  if (response.ok) {
    return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: response.status };
  }
  const body = await response.text();
  return {
    success: false,
    message: `HTTP ${response.status}: ${body.substring(0, 200)}`,
    statusCode: response.status
  };
}
async function fetchOpenCodeModels(baseUrl, apiKeys, mirrorUrls, fetcher) {
  const response = await proxyOpenCodeRequest({
    baseUrl,
    apiKeys,
    mirrorUrls,
    method: "GET",
    subPath: "models",
    fetcher
  });
  if (!response.ok) {
    return {
      success: false,
      message: `HTTP ${response.status}: ${(await response.text()).substring(0, 200)}`,
      statusCode: response.status
    };
  }
  const data = await response.json();
  return {
    success: true,
    message: "\u8FDE\u63A5\u6210\u529F",
    statusCode: response.status,
    data: {
      ...data,
      data: Array.isArray(data.data) ? filterOpenCodeModels(data.data) : []
    }
  };
}

// src/llm-proxy.ts
init_storage();
function extractUsage5(body) {
  try {
    const data = body;
    const usage = data?.usage;
    if (usage) {
      const prompt = Number(usage.prompt_tokens ?? usage.input_tokens ?? 0) || 0;
      const completion = Number(usage.completion_tokens ?? usage.output_tokens ?? 0) || 0;
      return { promptTokens: prompt, completionTokens: completion };
    }
  } catch {
  }
  return { promptTokens: 0, completionTokens: 0 };
}
function passthroughEventStream(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream") || !response.body) return null;
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
async function readResponseWithUsage(response) {
  const buf = await response.arrayBuffer();
  const body = new TextDecoder().decode(buf);
  let json = null;
  try {
    json = JSON.parse(body);
  } catch {
    for (const rawLine of body.split("\n")) {
      const line = rawLine.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload);
        if (parsed && typeof parsed === "object" && parsed.usage) json = parsed;
      } catch {
      }
    }
  }
  return { body, json };
}
var HEALTH_KEY = (providerId) => KV_KEYS.KEY_HEALTH_PREFIX + providerId;
async function readHealth(env, providerId) {
  const raw2 = await getKV(env).get(HEALTH_KEY(providerId));
  return raw2 ? JSON.parse(raw2) : {};
}
async function writeHealth(env, providerId, health) {
  const filtered = {};
  for (const [k, v] of Object.entries(health)) {
    if (v.failures > 0) filtered[k] = v;
  }
  if (Object.keys(filtered).length > 0) {
    await getKV(env).put(HEALTH_KEY(providerId), JSON.stringify(filtered));
  } else {
    await getKV(env).delete(HEALTH_KEY(providerId)).catch(() => {
    });
  }
}
function parseModelId(model) {
  const slashIndex = model.indexOf("/");
  if (slashIndex === -1) return null;
  return {
    providerId: model.substring(0, slashIndex),
    modelId: model.substring(slashIndex + 1)
  };
}
function findModelConfig(models, requested) {
  const byId = models.find((m) => m.id === requested);
  if (byId) return byId;
  const byAlias = models.find((m) => m.alias && m.alias === requested);
  if (byAlias) return byAlias;
  const withFreeSuffix = models.find((m) => m.alias === requested || m.id === requested || `${requested}:free` === m.id || `${requested}/free` === m.id || `${requested}-free` === m.id);
  return withFreeSuffix;
}
async function testModelConnection(baseUrl, apiKey, modelId, apiType) {
  try {
    const cleanBase = baseUrl.replace(/\/$/, "");
    const endpoint = apiType === "anthropic" ? "messages" : "chat/completions";
    const url = `${cleanBase}/${endpoint}`;
    const headers = {
      "Content-Type": "application/json"
    };
    if (apiKey) {
      if (apiType === "anthropic") {
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
      } else {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
    } else if (apiType === "anthropic") {
      headers["anthropic-version"] = "2023-06-01";
    }
    let response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 1,
        stream: true
      }),
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) {
      const altResponse = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1
        }),
        signal: AbortSignal.timeout(15e3)
      }).catch(() => null);
      if (altResponse && altResponse.ok) {
        response = altResponse;
      }
    }
    if (response.ok) {
      return { success: true, message: "\u8FDE\u63A5\u6210\u529F", statusCode: response.status };
    }
    const rawBody = await response.text();
    let errorBody = rawBody;
    try {
      const errorData = JSON.parse(rawBody);
      errorBody = errorData?.error?.message || errorData?.message || rawBody;
    } catch {
    }
    return {
      success: false,
      message: `HTTP ${response.status}: ${errorBody.substring(0, 200)}`,
      statusCode: response.status
    };
  } catch (err) {
    const error = err;
    return {
      success: false,
      message: `\u8FDE\u63A5\u5931\u8D25: ${error.message?.substring(0, 200) || "\u672A\u77E5\u9519\u8BEF"}`
    };
  }
}
async function testModelConnectionRotating(baseUrl, keys, modelId, apiType) {
  const list = (keys || []).filter((k) => k && k.trim());
  if (list.length === 0) {
    return { success: false, message: "\u8BE5\u6E20\u9053\u672A\u542F\u7528\u4EFB\u4F55 API Key", statusCode: 0 };
  }
  let last = null;
  for (let i = 0; i < list.length; i++) {
    const r = await testModelConnection(baseUrl, list[i], modelId, apiType);
    if (r.success) {
      return {
        ...r,
        keyIndex: i,
        message: list.length > 1 ? `${r.message} (key #${i + 1}/${list.length})` : r.message
      };
    }
    last = r;
    const st = r.statusCode || 0;
    if (st === 429 || st === 401 || st === 403 || st >= 500) continue;
    break;
  }
  return last || { success: false, message: "\u8FDE\u63A5\u5931\u8D25", statusCode: 0 };
}
async function handleProxy(c) {
  const startedAt = Date.now();
  try {
    const contentType = c.req.header("content-type") || "";
    const isMultipart = contentType.toLowerCase().includes("multipart/form-data");
    let body;
    let rawForm = null;
    let rawBodyArray = null;
    if (isMultipart) {
      try {
        rawForm = await c.req.formData();
        rawBodyArray = await c.req.arrayBuffer();
      } catch {
        return c.json({ error: { message: "Invalid multipart form body", type: "invalid_request_error" } }, 400);
      }
      body = { model: String(rawForm.get("model") || "") };
    } else if (c.req.method === "GET" || c.req.method === "HEAD") {
      body = { model: c.req.query("model") || "" };
    } else {
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: { message: "Invalid JSON body", type: "invalid_request_error" } }, 400);
      }
    }
    const model = body.model;
    const subPathRaw = c.req.url.includes("/v1/") ? c.req.url.split("/v1/")[1]?.split("?")[0] || "" : "";
    if (!model && !(c.req.method === "GET" && subPathRaw === "videos/status")) {
      return c.json({ error: { message: "\u7F3A\u5C11 model \u53C2\u6570", type: "invalid_request_error" } }, 400);
    }
    const modelSafe = model;
    if (c.req.method === "GET" && subPathRaw === "videos/status") {
      const statusProviderId = c.req.query("channel") || c.req.query("provider");
      if (!statusProviderId) {
        return c.json({ error: { message: "\u8BF7\u6307\u5B9A channel \u53C2\u6570(\u5982 /v1/videos/status?channel=myvideo&task_id=xxx)", type: "invalid_request_error" } }, 400);
      }
      const statusProvider = await getProvider(c.env, statusProviderId);
      if (!statusProvider) {
        return c.json({ error: { message: `\u6E20\u9053 "${statusProviderId}" \u4E0D\u5B58\u5728`, type: "invalid_request_error" } }, 404);
      }
      if ((statusProvider.type || "openai") !== "agnes-video") {
        return c.json({ error: { message: `\u6E20\u9053 "${statusProviderId}" \u4E0D\u662F agnes-video \u7C7B\u578B`, type: "invalid_request_error" } }, 400);
      }
      const { queryAgnesVideoStatus: queryAgnesVideoStatus2 } = await Promise.resolve().then(() => (init_video_proxy(), video_proxy_exports));
      const statusKeys = statusProvider.apiKeys.filter((k) => k.enabled);
      const statusApiKey = statusKeys[0]?.key || "public";
      const statusTaskId = c.req.query("task_id") || "";
      if (!statusTaskId) {
        return c.json({ error: { message: "task_id is required", type: "invalid_request_error" } }, 400);
      }
      return queryAgnesVideoStatus2(statusProvider.baseUrl, statusApiKey, statusTaskId);
    }
    const parsed = parseModelId(model);
    if (!parsed) {
      return c.json({
        error: {
          message: `\u6A21\u578B\u683C\u5F0F\u9519\u8BEF "${model}"\uFF0C\u8BF7\u4F7F\u7528 \u63D0\u4F9B\u5546ID/\u6A21\u578BID \u683C\u5F0F`,
          type: "invalid_request_error"
        }
      }, 400);
    }
    const { providerId, modelId } = parsed;
    const provider = await getProvider(c.env, providerId);
    if (!provider) {
      return c.json({
        error: { message: `\u63D0\u4F9B\u5546 "${providerId}" \u4E0D\u5B58\u5728`, type: "invalid_request_error" }
      }, 404);
    }
    if (!provider.enabled) {
      return c.json({
        error: { message: `\u63D0\u4F9B\u5546 "${provider.name}" \u5DF2\u7981\u7528`, type: "provider_disabled" }
      }, 403);
    }
    const modelConfig = findModelConfig(provider.models, modelId);
    if (!modelConfig) {
      return c.json({
        error: { message: `\u6A21\u578B "${modelId}" \u672A\u5728\u63D0\u4F9B\u5546 "${provider.name}" \u4E2D\u914D\u7F6E`, type: "invalid_request_error" }
      }, 404);
    }
    if (!modelConfig.enabled) {
      return c.json({
        error: { message: `\u6A21\u578B "${modelId}" \u5DF2\u7981\u7528`, type: "model_disabled" }
      }, 403);
    }
    const enabledKeys = provider.apiKeys.filter((k) => k.enabled);
    const forwardBody = { ...body, model: modelConfig.id };
    const url = new URL(c.req.url);
    const subPath = url.pathname.replace(/^\/v1\//, "") || "chat/completions";
    const isMultipartRequest = isMultipart && rawBodyArray !== null;
    const forwardPayload = isMultipartRequest ? rawBodyArray : JSON.stringify(forwardBody);
    const forwardContentType = isMultipartRequest ? contentType : "application/json";
    const authHeader = c.req.header("Authorization") || "";
    const rawToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const maskedToken = rawToken.length > 8 ? rawToken.slice(0, 8) + "***" : rawToken || "unknown";
    const providerType = provider.type || "openai";
    if (providerType === "azure-tts" && subPath === "audio/speech") {
      const { handleAzureTtsSpeech: handleAzureTtsSpeech2 } = await Promise.resolve().then(() => (init_azure_tts(), azure_tts_exports));
      const { isAzureVoiceId: isAzureVoiceId2 } = await Promise.resolve().then(() => (init_azure_voices(), azure_voices_exports));
      let voice = body.voice || provider.voice || "zh-CN-XiaoxiaoNeural";
      if (!body.voice && modelConfig.id && isAzureVoiceId2(modelConfig.id)) {
        voice = modelConfig.id;
      }
      const ttsBody = {
        ...body,
        voice,
        rate: body.rate || provider.rate || "+0%",
        volume: body.volume || provider.volume || "+0%",
        pitch: body.pitch || provider.pitch || "+0Hz"
      };
      const audioResp = await handleAzureTtsSpeech2(ttsBody);
      const record = {
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        provider: providerId,
        model: modelSafe,
        token: maskedToken,
        ok: audioResp.ok,
        status: audioResp.status,
        promptTokens: Math.ceil(String(body.input || "").length / 4),
        completionTokens: 0,
        latencyMs: Date.now() - startedAt
      };
      await addUsageRecord(c.env, record).catch(() => {
      });
      return audioResp;
    }
    const hasAgnesVideoModel = provider.models.some(
      (m) => m.enabled && /^agnes-video/i.test(m.id)
    );
    if ((providerType === "agnes-video" || providerType === "openai" && hasAgnesVideoModel) && subPath === "videos/generations") {
      const { handleAgnesVideo: handleAgnesVideo2 } = await Promise.resolve().then(() => (init_video_proxy(), video_proxy_exports));
      const apiKey = enabledKeys[0]?.key || "public";
      const videoResp = await handleAgnesVideo2(provider.baseUrl, apiKey, forwardBody);
      const record = {
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        provider: providerId,
        model: modelSafe,
        token: maskedToken,
        ok: videoResp.ok,
        status: videoResp.status,
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: Date.now() - startedAt
      };
      await addUsageRecord(c.env, record).catch(() => {
      });
      return videoResp;
    }
    if (providerType === "antigravity") {
      const supported = ["chat/completions", "completions", "messages", "responses", ""];
      if (!supported.includes(subPath)) {
        return c.json({
          error: { message: `antigravity \u6E20\u9053\u6682\u4E0D\u652F\u6301\u7AEF\u70B9 /v1/${subPath}`, type: "invalid_request_error" }
        }, 400);
      }
      const { handleAntigravityRequest: handleAntigravityRequest2 } = await Promise.resolve().then(() => (init_antigravity(), antigravity_exports));
      return handleAntigravityRequest2({
        env: c.env,
        providerId,
        modelId: modelConfig.id,
        requestedModel: modelSafe,
        body,
        refreshTokens: enabledKeys.map((k) => k.key),
        project: provider.project,
        maskedToken,
        startedAt,
        waitUntil: (promise) => {
          try {
            c.executionCtx?.waitUntil(promise);
          } catch {
          }
        }
      });
    }
    if (providerType === "vertex") {
      const supported = ["chat/completions", "completions", "messages", "responses", ""];
      if (!supported.includes(subPath)) {
        return c.json({
          error: { message: `vertex \u6E20\u9053\u6682\u4E0D\u652F\u6301\u7AEF\u70B9 /v1/${subPath}`, type: "invalid_request_error" }
        }, 400);
      }
      const { handleVertexRequest: handleVertexRequest2 } = await Promise.resolve().then(() => (init_vertex(), vertex_exports));
      return handleVertexRequest2({
        env: c.env,
        providerId,
        modelId: modelConfig.id,
        requestedModel: modelSafe,
        body,
        credentials: enabledKeys.map((k) => k.key),
        location: provider.location,
        maskedToken,
        startedAt,
        waitUntil: (promise) => {
          try {
            c.executionCtx?.waitUntil(promise);
          } catch {
          }
        }
      });
    }
    if (providerType === "devin") {
      const supported = ["chat/completions", "completions", "messages", "responses", ""];
      if (!supported.includes(subPath)) {
        return c.json({
          error: { message: `devin \u6E20\u9053\u6682\u4E0D\u652F\u6301\u7AEF\u70B9 /v1/${subPath}`, type: "invalid_request_error" }
        }, 400);
      }
      const { handleDevinRequest: handleDevinRequest2 } = await Promise.resolve().then(() => (init_devin(), devin_exports));
      return handleDevinRequest2({
        env: c.env,
        providerId,
        modelId: modelConfig.id,
        requestedModel: modelSafe,
        body,
        credentials: enabledKeys.map((k) => k.key),
        sessionHint: c.req.header("x-session-id") || c.req.header("x-conversation-id") || c.req.header("x-request-id") || "",
        maskedToken,
        startedAt,
        waitUntil: (promise) => {
          try {
            c.executionCtx?.waitUntil(promise);
          } catch {
          }
        }
      });
    }
    const OAUTH_TYPES = ["claude", "codex", "kimi", "grok", "qwen", "deepseek", "codebuddy", "cline"];
    if (OAUTH_TYPES.includes(providerType)) {
      const supported = providerType === "claude" ? ["chat/completions", "messages"] : providerType === "kimi" || providerType === "qwen" || providerType === "deepseek" || providerType === "codebuddy" || providerType === "cline" ? ["chat/completions"] : ["chat/completions", "responses"];
      if (!supported.includes(subPath)) {
        return c.json({
          error: { message: `${providerType} \u6E20\u9053\u6682\u4E0D\u652F\u6301\u7AEF\u70B9 /v1/${subPath}\uFF08\u652F\u6301: ${supported.map((s) => `/v1/${s}`).join("\u3001")}\uFF09`, type: "invalid_request_error" }
        }, 400);
      }
      const oauthParams = {
        env: c.env,
        providerId,
        modelId: modelConfig.id,
        requestedModel: modelSafe,
        body,
        refreshTokens: enabledKeys.map((k) => k.key),
        maskedToken,
        startedAt,
        waitUntil: (promise) => {
          try {
            c.executionCtx?.waitUntil(promise);
          } catch {
          }
        }
      };
      const nativeBody = { ...body, model: modelConfig.id };
      if (providerType === "claude") {
        const { handleClaudeRequest: handleClaudeRequest2 } = await Promise.resolve().then(() => (init_claude(), claude_exports));
        return handleClaudeRequest2({ ...oauthParams, body: subPath === "messages" ? nativeBody : body }, subPath === "messages" ? "messages-passthrough" : "translate");
      }
      if (providerType === "codex") {
        const { handleCodexRequest: handleCodexRequest2 } = await Promise.resolve().then(() => (init_codex(), codex_exports));
        return handleCodexRequest2({ ...oauthParams, body: subPath === "responses" ? nativeBody : body }, subPath === "responses" ? "responses-passthrough" : "translate");
      }
      if (providerType === "kimi") {
        const { handleKimiRequest: handleKimiRequest2 } = await Promise.resolve().then(() => (init_kimi(), kimi_exports));
        return handleKimiRequest2(oauthParams, provider.baseUrl);
      }
      if (providerType === "qwen") {
        const { handleQwenRequest: handleQwenRequest2 } = await Promise.resolve().then(() => (init_qwen(), qwen_exports));
        return handleQwenRequest2(oauthParams);
      }
      if (providerType === "deepseek") {
        const { handleDeepSeekRequest: handleDeepSeekRequest2 } = await Promise.resolve().then(() => (init_deepseek(), deepseek_exports));
        return handleDeepSeekRequest2(oauthParams, subPath);
      }
      if (providerType === "codebuddy") {
        const { handleCodebuddyRequest: handleCodebuddyRequest2 } = await Promise.resolve().then(() => (init_codebuddy(), codebuddy_exports));
        return handleCodebuddyRequest2(oauthParams, provider.baseUrl, provider.region);
      }
      if (providerType === "cline") {
        const { handleClineRequest: handleClineRequest2 } = await Promise.resolve().then(() => (init_cline(), cline_exports));
        return handleClineRequest2(oauthParams);
      }
      const { handleGrokRequest: handleGrokRequest2 } = await Promise.resolve().then(() => (init_grok(), grok_exports));
      return handleGrokRequest2({ ...oauthParams, body: subPath === "responses" ? nativeBody : body }, subPath === "responses" ? "responses-passthrough" : "translate");
    }
    if (isOpenCodeProvider(providerId)) {
      const response = await proxyOpenCodeRequest({
        baseUrl: provider.baseUrl,
        apiKeys: enabledKeys,
        method: c.req.method,
        subPath,
        search: url.search,
        body: forwardPayload,
        mirrorUrls: resolveProviderMirrorUrls(c.env, provider)
      });
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store");
      const isEventStream = (response.headers.get("content-type") || "").includes("text/event-stream");
      if (isEventStream && response.body) {
        const record2 = {
          ts: (/* @__PURE__ */ new Date()).toISOString(),
          provider: providerId,
          model: modelSafe,
          token: maskedToken,
          ok: response.ok,
          status: response.status,
          promptTokens: 0,
          completionTokens: 0,
          latencyMs: Date.now() - startedAt
        };
        await addUsageRecord(c.env, record2).catch(() => {
        });
        headers.delete("content-length");
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }
      const { body: responseBody, json } = await readResponseWithUsage(response);
      const { promptTokens, completionTokens } = extractUsage5(json);
      const record = {
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        provider: providerId,
        model: modelSafe,
        token: maskedToken,
        ok: response.ok,
        status: response.status,
        promptTokens,
        completionTokens,
        latencyMs: Date.now() - startedAt
      };
      await addUsageRecord(c.env, record).catch(() => {
      });
      return new Response(responseBody, { status: response.status, statusText: response.statusText, headers });
    }
    let upstreamApiType = provider.apiType;
    let upstreamBase = provider.baseUrl;
    if (providerType === "zai") {
      if (subPath === "messages") {
        upstreamApiType = "anthropic";
        upstreamBase = "https://api.z.ai/api/anthropic/v1";
      } else {
        upstreamApiType = "openai";
        upstreamBase = /\/api\/paas\//.test(provider.baseUrl) ? provider.baseUrl : "https://api.z.ai/api/coding/paas/v4";
      }
    }
    const cleanBase = upstreamBase.replace(/\/$/, "");
    const forwardUrl = `${cleanBase}/${subPath}${url.search}`;
    if (enabledKeys.length === 0) {
      const forwardHeaders = {
        "Content-Type": forwardContentType
      };
      if (upstreamApiType === "anthropic") {
        forwardHeaders["anthropic-version"] = "2023-06-01";
      }
      try {
        const response = await fetch(forwardUrl, {
          method: c.req.method,
          headers: forwardHeaders,
          body: forwardPayload,
          signal: AbortSignal.timeout(6e4)
        });
        const passthrough = passthroughEventStream(response);
        if (passthrough) {
          const record2 = {
            ts: (/* @__PURE__ */ new Date()).toISOString(),
            provider: providerId,
            model: modelSafe,
            token: maskedToken,
            ok: response.ok,
            status: response.status,
            promptTokens: 0,
            completionTokens: 0,
            latencyMs: Date.now() - startedAt
          };
          await addUsageRecord(c.env, record2).catch(() => {
          });
          return passthrough;
        }
        const { body: responseBody, json } = await readResponseWithUsage(response);
        const { promptTokens, completionTokens } = extractUsage5(json);
        const record = {
          ts: (/* @__PURE__ */ new Date()).toISOString(),
          provider: providerId,
          model: modelSafe,
          token: maskedToken,
          ok: response.ok,
          status: response.status,
          promptTokens,
          completionTokens,
          latencyMs: Date.now() - startedAt
        };
        await addUsageRecord(c.env, record).catch(() => {
        });
        const responseHeaders = {
          "Content-Type": response.headers.get("Content-Type") || "application/json",
          "Cache-Control": "no-store"
        };
        return new Response(responseBody, {
          status: response.status,
          headers: responseHeaders
        });
      } catch (err) {
        const error = err;
        return c.json({
          error: { message: error.message || "\u4EE3\u7406\u8F6C\u53D1\u5185\u90E8\u9519\u8BEF", type: "proxy_error" }
        }, 502);
      }
    }
    const healthData = await readHealth(c.env, providerId);
    const healthy = [];
    const unhealthy = [];
    const probation = [];
    const demoted = [];
    if (enabledKeys.length === 1) {
      healthy.push(0);
    } else {
      for (let i = 0; i < enabledKeys.length; i++) {
        const h = healthData[enabledKeys[i].key];
        if (h && h.failures >= KEY_HEALTH_MAX_FAILURES) {
          if (!h.demotedAt) {
            h.demotedAt = Date.now();
          }
          if (Date.now() - h.demotedAt >= KEY_HEALTH_COOLDOWN_MS) {
            probation.push(i);
          } else {
            demoted.push(i);
          }
        } else if (h && h.lastFailed) {
          unhealthy.push(i);
        } else {
          healthy.push(i);
        }
      }
    }
    for (let i = healthy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [healthy[i], healthy[j]] = [healthy[j], healthy[i]];
    }
    const keyOrder = [...healthy, ...unhealthy, ...probation];
    if (keyOrder.length === 0 && demoted.length > 0) {
      keyOrder.push(...demoted);
      console.log(`[proxy] ${providerId}: all keys demoted, falling back to ${demoted.length} key(s)`);
    }
    if (demoted.length > 0 || probation.length > 0) {
      console.log(`[proxy] ${providerId}: ${demoted.length} key(s) demoted, ${probation.length} key(s) on probation (cooldown expired)`);
    }
    let lastError = null;
    let healthUpdated = false;
    for (const keyIndex of keyOrder) {
      const apiKey = enabledKeys[keyIndex].key;
      try {
        const forwardHeaders = {
          "Content-Type": forwardContentType
        };
        if (upstreamApiType === "anthropic") {
          forwardHeaders["x-api-key"] = apiKey;
          forwardHeaders["anthropic-version"] = "2023-06-01";
        } else {
          forwardHeaders["Authorization"] = `Bearer ${apiKey}`;
        }
        const response = await fetch(forwardUrl, {
          method: c.req.method,
          headers: forwardHeaders,
          body: forwardPayload,
          signal: AbortSignal.timeout(6e4)
        });
        if (response.ok) {
          if (healthData[apiKey]?.failures > 0) {
            delete healthData[apiKey];
            healthUpdated = true;
          }
          if (healthUpdated) await writeHealth(c.env, providerId, healthData);
          const passthrough = passthroughEventStream(response);
          if (passthrough) {
            const record2 = {
              ts: (/* @__PURE__ */ new Date()).toISOString(),
              provider: providerId,
              model: modelSafe,
              token: maskedToken,
              ok: true,
              status: response.status,
              promptTokens: 0,
              completionTokens: 0,
              latencyMs: Date.now() - startedAt
            };
            await addUsageRecord(c.env, record2).catch(() => {
            });
            return passthrough;
          }
          const { body: responseBody, json } = await readResponseWithUsage(response);
          const { promptTokens, completionTokens } = extractUsage5(json);
          const record = {
            ts: (/* @__PURE__ */ new Date()).toISOString(),
            provider: providerId,
            model: modelSafe,
            token: maskedToken,
            ok: true,
            status: response.status,
            promptTokens,
            completionTokens,
            latencyMs: Date.now() - startedAt
          };
          await addUsageRecord(c.env, record).catch(() => {
          });
          const responseHeaders = {
            "Content-Type": response.headers.get("Content-Type") || "application/json",
            "Cache-Control": "no-store"
          };
          return new Response(responseBody, {
            status: response.status,
            headers: responseHeaders
          });
        }
        if (response.status === 429) {
          lastError = response;
          continue;
        }
        if (response.status === 401 || response.status === 403 || response.status >= 500) {
          const h = healthData[apiKey] || { failures: 0, lastFailed: false };
          h.failures++;
          h.lastFailed = true;
          if (h.failures >= KEY_HEALTH_MAX_FAILURES) {
            h.demotedAt = Date.now();
          }
          healthData[apiKey] = h;
          healthUpdated = true;
          lastError = response;
          continue;
        }
        const errorData = await response.json().catch(async () => ({ error: { message: await response.text() } }));
        return c.json(errorData, response.status);
      } catch (err) {
        const error = err;
        const h = healthData[apiKey] || { failures: 0, lastFailed: false };
        h.failures++;
        h.lastFailed = true;
        if (h.failures >= KEY_HEALTH_MAX_FAILURES) {
          h.demotedAt = Date.now();
        }
        healthData[apiKey] = h;
        healthUpdated = true;
        lastError = new Response(JSON.stringify({
          error: { message: error.message || "\u8BF7\u6C42\u5931\u8D25", type: "proxy_error" }
        }), { status: 502 });
        continue;
      }
    }
    if (healthUpdated) await writeHealth(c.env, providerId, healthData);
    if (lastError) {
      const errorBody = await lastError.text().catch(() => "\u6240\u6709 API Key \u5747\u5931\u8D25");
      return c.json({
        error: {
          message: `\u6240\u6709 API Key \u5DF2\u7528\u5B8C\uFF0C\u6700\u540E\u4E00\u6B21\u9519\u8BEF: HTTP ${lastError.status}`,
          type: "key_exhausted",
          detail: errorBody.substring(0, 500)
        }
      }, lastError.status || 502);
    }
    return c.json({
      error: { message: "\u6CA1\u6709\u53EF\u7528\u7684 API Key", type: "configuration_error" }
    }, 500);
  } catch (err) {
    const error = err;
    return c.json({
      error: { message: error.message || "\u4EE3\u7406\u8F6C\u53D1\u5185\u90E8\u9519\u8BEF", type: "server_error" }
    }, 500);
  }
}
async function handleModels(c) {
  const providers = await getProviders(c.env);
  const models = [];
  for (const provider of providers) {
    if (!provider.enabled) continue;
    for (const model of provider.models) {
      if (!model.enabled) continue;
      models.push({
        id: `${provider.id}/${model.alias || model.id}`,
        provider: provider.id,
        provider_name: provider.name,
        object: "model",
        created: Math.floor(Date.now() / 1e3),
        owned_by: provider.id
      });
    }
  }
  return c.json({
    object: "list",
    data: models
  });
}

// src/admin.ts
init_storage();
init_storage_adapter();

// src/request-utils.ts
function isInternalHost(host) {
  return /qcloudteo\.com$|pages-scf-|pages-pro-/i.test(host);
}
function getExternalOrigin(c) {
  const candidates = [
    c.req.header("eo-pages-host"),
    c.req.header("x-forwarded-host"),
    c.req.header("host")
  ];
  for (const candidate of candidates) {
    const host = candidate?.split(",")[0].trim();
    if (host && !isInternalHost(host)) {
      return `https://${host}`;
    }
  }
  try {
    return new URL(c.req.url).origin;
  } catch {
    return "https://localhost";
  }
}

// src/admin.ts
init_antigravity();
init_claude();
init_codex();

// src/deepseek-account.ts
var HKDF_LABEL = "deepseek-account-password-v1";
var IV_BYTES = 12;
async function deriveKey(env) {
  const secret = env.ADMIN_PASSWORD || "";
  if (!secret) return null;
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(secret), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: enc.encode(HKDF_LABEL), info: enc.encode("aes-gcm-256") },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
function toBase64(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function fromBase64(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function encryptSecret(env, plain) {
  if (!plain) return null;
  try {
    const key = await deriveKey(env);
    if (!key) return null;
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
    return `v1.${toBase64(iv)}.${toBase64(new Uint8Array(ct))}`;
  } catch {
    return null;
  }
}
async function decryptSecret(env, blob) {
  if (!blob || !blob.startsWith("v1.")) return null;
  const parts = blob.split(".");
  if (parts.length !== 3) return null;
  try {
    const key = await deriveKey(env);
    if (!key) return null;
    const iv = fromBase64(parts[1]);
    const ct = fromBase64(parts[2]);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(pt);
  } catch {
    return null;
  }
}

// src/deepseek-auth-probe.ts
var DS_API_BASE = "https://chat.deepseek.com/api/v0";
var DS_USER_AGENT = "DeepSeek/2.5.0 Android/35";
var DS_CLIENT_VERSION = "2.5.0";
var DS_CLIENT_PLATFORM = "android";
var DS_CLIENT_LOCALE = "zh_CN";
var DS_CLIENT_BUNDLE_ID = "com.deepseek.chat";
var DS_DEVICE_MODEL = "Pixel 8";
var DS_CLIENT_OS = "android";
var DS_TIMEZONE_OFFSET = "28800";
function fnv1a(bytes, offset) {
  const PRIME = 0x00000100000001b3n;
  const MASK = 0xffffffffffffffffn;
  let hash = 0xcbf29ce484222325n ^ offset;
  for (const b of bytes) {
    hash = (hash ^ BigInt(b)) & MASK;
    hash = hash * PRIME & MASK;
  }
  return hash;
}
function deriveDeviceUuid(seed) {
  const bytes = new TextEncoder().encode(seed);
  const hi = fnv1a(bytes, 0n);
  const lo = fnv1a(bytes, 0x9e3779b97f4a7c15n);
  const b = new Uint8Array(16);
  for (let i = 0; i < 8; i++) b[i] = Number(hi >> BigInt((7 - i) * 8) & 0xffn);
  for (let i = 0; i < 8; i++) b[8 + i] = Number(lo >> BigInt((7 - i) * 8) & 0xffn);
  b[6] = b[6] & 15 | 64;
  b[8] = b[8] & 63 | 128;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
  return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
}
function deviceIdFor(apiBase = DS_API_BASE) {
  return deriveDeviceUuid(apiBase);
}
function clientHeaders(deviceId) {
  return {
    "User-Agent": DS_USER_AGENT,
    "X-Client-Version": DS_CLIENT_VERSION,
    "X-Client-Platform": DS_CLIENT_PLATFORM,
    "X-Client-Locale": DS_CLIENT_LOCALE,
    "X-Client-Bundle-Id": DS_CLIENT_BUNDLE_ID,
    "X-Device-Id": deviceId,
    "X-Device-Model": DS_DEVICE_MODEL,
    "X-Client-Timezone-Offset": DS_TIMEZONE_OFFSET
  };
}
function isWafChallenge(status, headers) {
  return status === 202 && headers.get("x-amzn-waf-action") !== null;
}
async function probeDeepSeek() {
  const deviceId = deviceIdFor();
  const deterministic = deviceIdFor() === deviceId;
  const wellFormed = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(deviceId);
  const targets = [
    // 1) 首页：最轻量，用来判断 CloudFront/WAF 是否直接拦 Cloudflare 出口
    { name: "DeepSeek \u7AD9\u70B9\u9996\u9875", url: "https://chat.deepseek.com/", method: "GET" },
    // 2) 无凭据的受保护接口：应返回业务错误码而非 WAF 挑战
    { name: "users/current\uFF08\u65E0\u51ED\u636E\uFF09", url: `${DS_API_BASE}/users/current`, method: "GET" },
    // 3) PoW challenge 端点：真实调用链的第一步，且不需要凭据即可试探
    {
      name: "create_pow_challenge",
      url: `${DS_API_BASE}/chat/create_pow_challenge`,
      method: "POST",
      body: JSON.stringify({ target_path: "/api/v0/chat/completion" })
    }
  ];
  const network = [];
  for (const t of targets) {
    const started = Date.now();
    try {
      const res = await fetch(t.url, {
        method: t.method,
        headers: {
          ...clientHeaders(deviceId),
          ...t.body ? { "Content-Type": "application/json" } : {}
        },
        body: t.body,
        signal: AbortSignal.timeout(2e4)
      });
      const text = await res.text().catch(() => "");
      const pick = {};
      for (const k of ["server", "x-amzn-waf-action", "x-amzn-requestid", "cf-ray", "content-type"]) {
        const v = res.headers.get(k);
        if (v) pick[k] = v;
      }
      network.push({
        name: t.name,
        url: t.url,
        method: t.method,
        ok: res.ok,
        status: res.status,
        wafChallenge: isWafChallenge(res.status, res.headers),
        headers: pick,
        bodySnippet: text.slice(0, 300),
        ms: Date.now() - started
      });
    } catch (err) {
      network.push({
        name: t.name,
        url: t.url,
        method: t.method,
        ok: false,
        error: err.message || "\u8BF7\u6C42\u5931\u8D25",
        ms: Date.now() - started
      });
    }
  }
  const anyWaf = network.some((n) => n.wafChallenge);
  const homeOk = network[0]?.ok && !network[0]?.wafChallenge;
  const apiResponded = network.slice(1).some((n) => (n.status ?? 0) > 0 && !n.wafChallenge);
  let verdict;
  const suggestions = [];
  if (anyWaf) {
    verdict = "\u51FA\u53E3 IP \u88AB AWS WAF \u6311\u6218 \u2014\u2014 \u7F51\u5173\u4EE3\u767B\u5F55\u8FD9\u6761\u8DEF\u5F53\u524D\u4E0D\u53EF\u884C\u3002";
    suggestions.push("\u5F39\u7A97\u53EA\u63D0\u4F9B\u300C\u7C98\u8D34 userToken\u300D\u5355\u9009\u9879\uFF1B\u4EE3\u767B\u5F55\u6309\u94AE\u5148\u4E0D\u4E0A\u3002");
    suggestions.push("\u5982\u4ECD\u8981\u4EE3\u767B\u5F55\uFF0C\u9700\u6362\u7528**\u975E\u7F8E\u56FD\u51FA\u53E3**\u7684\u5916\u90E8\u5237\u65B0\u8282\u70B9\uFF08\u5171\u4EAB\u8D26\u53F7\u6C60\u65B9\u6848\uFF09\u3002");
  } else if (homeOk && apiResponded) {
    verdict = "Cloudflare \u51FA\u53E3 IP \u672A\u88AB WAF \u62E6\u622A \u2014\u2014 \u7F51\u5173\u4EE3\u767B\u5F55\u5177\u5907\u6280\u672F\u53EF\u884C\u6027\u3002";
    suggestions.push("\u4E0B\u4E00\u6B65\uFF1A\u7528\u4E00\u5BF9\u6D4B\u8BD5\u8D26\u53F7\u5B9E\u6D4B POST /users/login\uFF08\u9700\u51ED\u636E\uFF09\u3002");
    suggestions.push("\u767B\u5F55\u6210\u529F\u540E\u8981\u63A5 check_device \u4E0E token \u8F6E\u6362\uFF08ds-free-api \u7684 check_device \u903B\u8F91\uFF09\u3002");
    suggestions.push("\u6CE8\u610F\uFF1A\u5373\u4FBF\u8FDE\u901A\uFF0C\u5171\u4EAB/\u591A\u8D26\u53F7\u4ECD\u53EF\u80FD\u89E6\u53D1 biz_code \u98CE\u63A7\uFF0C\u9700\u4FDD\u7559\u964D\u7EA7\u5230\u7C98\u8D34\u7684\u51FA\u53E3\u3002");
  } else {
    verdict = "\u7ED3\u679C\u4E0D\u660E\u786E\uFF1A\u90E8\u5206\u76EE\u6807\u65E0\u54CD\u5E94\uFF0C\u9700\u770B\u4E0B\u65B9\u660E\u7EC6\u9010\u6761\u5224\u65AD\u3002";
    suggestions.push("\u68C0\u67E5\u662F\u5426\u7F51\u7EDC\u4E0D\u901A\u3001DNS \u53D7\u9650\uFF0C\u6216\u76EE\u6807\u63A5\u53E3\u5DF2\u53D8\u66F4\u3002");
  }
  return { device: { deviceId, apiBase: DS_API_BASE, deterministic, wellFormed }, network, verdict, suggestions };
}
async function probeDeepSeekLogin(account) {
  const deviceId = deviceIdFor();
  const payload = {
    password: account.password,
    device_id: deviceId,
    os: DS_CLIENT_OS
  };
  if (account.email) payload.email = account.email;
  if (account.mobile) {
    payload.mobile = account.mobile;
    payload.area_code = account.areaCode || "+86";
  }
  try {
    const res = await fetch(`${DS_API_BASE}/users/login`, {
      method: "POST",
      headers: { ...clientHeaders(deviceId), "Content-Type": "application/json", Referer: "https://chat.deepseek.com/sign_in" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3e4)
    });
    const text = await res.text().catch(() => "");
    if (isWafChallenge(res.status, res.headers)) {
      return { ok: false, status: res.status, wafChallenge: true, msg: "\u88AB AWS WAF \u6311\u6218", raw: text.slice(0, 300) };
    }
    let j = null;
    try {
      j = JSON.parse(text);
    } catch {
    }
    const biz = j?.data?.biz_data;
    return {
      ok: res.ok && j?.code === 0,
      status: res.status,
      code: j?.code,
      bizCode: biz?.biz_code ?? j?.biz_code,
      msg: biz?.biz_msg || j?.msg || "",
      gotToken: !!(biz?.user?.token || biz?.token),
      raw: j ? void 0 : text.slice(0, 300)
    };
  } catch (err) {
    return { ok: false, error: err.message || "\u767B\u5F55\u8BF7\u6C42\u5931\u8D25" };
  }
}

// src/deepseek-login.ts
function extractRotateToken(rotate) {
  if (typeof rotate === "string") return rotate.length > 0 ? rotate : null;
  if (rotate && typeof rotate === "object") {
    const t = rotate.token;
    return typeof t === "string" && t.length > 0 ? t : null;
  }
  return null;
}
function isMuted(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return false;
}
var defaultFetcher = async (url, init) => {
  const res = await fetch(url, init);
  return { status: res.status, headers: res.headers, text: await res.text().catch(() => "") };
};
function parseEnvelope(text) {
  try {
    const j = JSON.parse(text);
    return j && typeof j === "object" ? j : null;
  } catch {
    return null;
  }
}
function envelopeError(env, fallback) {
  if (!env) return fallback;
  const bizMsg = env.data?.biz_msg;
  if (bizMsg) return bizMsg;
  if (env.msg) return env.msg;
  const bc = env.data?.biz_code;
  if (typeof bc === "number") return `\u4E1A\u52A1\u7801 ${bc}`;
  return fallback;
}
async function loginWithPassword(account, opts = {}) {
  const apiBase = opts.apiBase || DS_API_BASE;
  const fetcher = opts.fetcher || defaultFetcher;
  const deviceId = deviceIdFor(apiBase);
  if (!account.email && !account.mobile) {
    return { ok: false, error: "\u9700\u8981 email \u6216 mobile \u4E4B\u4E00" };
  }
  if (!account.password) return { ok: false, error: "\u9700\u8981 password" };
  const payload = {
    password: account.password,
    device_id: deviceId,
    os: DS_CLIENT_OS
  };
  if (account.email) payload.email = account.email;
  if (account.mobile) {
    payload.mobile = account.mobile;
    payload.area_code = account.areaCode || "+86";
  }
  let raw2;
  try {
    raw2 = await fetcher(`${apiBase}/users/login`, {
      method: "POST",
      headers: {
        ...clientHeaders(deviceId),
        "Content-Type": "application/json",
        Referer: "https://chat.deepseek.com/sign_in"
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3e4)
    });
  } catch (err) {
    return { ok: false, error: err.message || "\u767B\u5F55\u8BF7\u6C42\u5931\u8D25" };
  }
  if (isWafChallenge(raw2.status, raw2.headers)) {
    return {
      ok: false,
      status: raw2.status,
      wafChallenge: true,
      msg: "\u51FA\u53E3 IP \u88AB AWS WAF \u6311\u6218\uFF0C\u65E0\u6CD5\u5B8C\u6210\u4EE3\u767B\u5F55\uFF08\u9700\u6362\u975E\u7F8E\u56FD\u51FA\u53E3\u7684\u8282\u70B9\uFF09"
    };
  }
  const env = parseEnvelope(raw2.text);
  const bizCode = env?.data?.biz_code;
  const topCode = env?.code;
  const httpOk = raw2.status >= 200 && raw2.status < 300;
  const codeOk = typeof topCode === "number" ? topCode === 0 : httpOk;
  const bizOk = typeof bizCode === "number" ? bizCode === 0 : true;
  if (!codeOk || !bizOk) {
    return {
      ok: false,
      status: raw2.status,
      code: topCode,
      bizCode,
      msg: envelopeError(env, `\u767B\u5F55\u5931\u8D25\uFF08HTTP ${raw2.status}\uFF09`)
    };
  }
  const user = env?.data?.biz_data?.user;
  const userToken = user?.token;
  if (!userToken) {
    return {
      ok: false,
      status: raw2.status,
      code: topCode,
      bizCode,
      msg: "\u767B\u5F55\u8FD4\u56DE\u6210\u529F\u4F46\u672A\u62FF\u5230 token\uFF08\u63A5\u53E3\u5F62\u6001\u53EF\u80FD\u5DF2\u53D8\u66F4\uFF09"
    };
  }
  const muted = isMuted(user?.chat?.is_muted);
  const muteUntil = user?.chat?.mute_until ?? null;
  let token = userToken;
  let rotated = false;
  let checkDeviceFailed = false;
  if (opts.checkDevice !== false) {
    const cd = await checkDevice(token, { apiBase, fetcher });
    if (cd.ok) {
      if (cd.rotate !== void 0 && cd.rotate !== null) {
        const next = extractRotateToken(cd.rotate);
        if (next) {
          token = next;
          rotated = true;
        }
      }
    } else {
      checkDeviceFailed = true;
    }
  }
  return {
    ok: true,
    status: raw2.status,
    code: topCode,
    bizCode,
    userToken: token,
    muted,
    muteUntil,
    rotated,
    checkDeviceFailed
  };
}
async function checkDevice(token, opts = {}) {
  const apiBase = opts.apiBase || DS_API_BASE;
  const fetcher = opts.fetcher || defaultFetcher;
  const deviceId = deviceIdFor(apiBase);
  try {
    const raw2 = await fetcher(`${apiBase}/users/auth_token/check_device`, {
      method: "POST",
      headers: {
        ...clientHeaders(deviceId),
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ device_id: deviceId, device_model: DS_DEVICE_MODEL }),
      signal: AbortSignal.timeout(2e4)
    });
    if (isWafChallenge(raw2.status, raw2.headers)) {
      return { ok: false, error: "WAF \u6311\u6218" };
    }
    const env = parseEnvelope(raw2.text);
    if (!env || typeof env.code === "number" && env.code !== 0) {
      return { ok: false, error: envelopeError(env, `check_device \u5931\u8D25\uFF08HTTP ${raw2.status}\uFF09`) };
    }
    return { ok: true, rotate: env?.data?.biz_data?.rotate };
  } catch (err) {
    return { ok: false, error: err.message || "check_device \u8BF7\u6C42\u5931\u8D25" };
  }
}

// src/admin.ts
init_kimi();
init_grok();
init_qwen();
init_deepseek();
init_codebuddy();
init_cline();

// src/zai.ts
var ZAI_DEFAULT_MODELS = [
  "glm-5.3",
  "glm-5.3-flash",
  "glm-4.7",
  "glm-4.7-flash",
  "glm-4.6",
  "glm-4.5-air"
];
function fetchZaiModels() {
  return { success: true, models: [...ZAI_DEFAULT_MODELS] };
}

// src/admin.ts
init_config();
function normalizeArray(items, mapFn) {
  if (!Array.isArray(items)) return [];
  if (items.length === 0 || typeof items[0] === "string") {
    return items.map(mapFn);
  }
  return items;
}
function normalizeMirrorUrls(value) {
  if (value === void 0 || value === null) return void 0;
  const parts = Array.isArray(value) ? value : String(value).split("\n").flatMap((s) => s.split(",")).map((s) => s.trim());
  const cleaned = [...new Set(parts.map((s) => String(s).trim()).filter(Boolean))];
  return cleaned.length > 0 ? cleaned : void 0;
}
function normalizeRegion(value) {
  return value === "cn" || value === "global" ? value : void 0;
}
function defaultModelAlias(id) {
  return id.replace(/:(free)$/i, "").replace(/\/(free)$/i, "").replace(/-(free)$/i, "");
}
function normalizeModels(value) {
  if (!Array.isArray(value)) return [];
  if (value.length === 0) return [];
  if (typeof value[0] === "string") {
    return value.map((id) => ({ id, enabled: true, alias: defaultModelAlias(id) }));
  }
  return value.filter((m) => m && m.id).map((m) => ({
    id: m.id,
    enabled: m.enabled !== void 0 ? m.enabled : true,
    alias: m.alias !== void 0 && m.alias !== "" ? m.alias : defaultModelAlias(m.id)
  }));
}
async function handleStatus(c) {
  const providers = await getProviders(c.env);
  const proxyKeys = await getProxyKeys(c.env);
  const totalModels = providers.reduce((sum, p) => sum + p.models.length, 0);
  const enabledModels = providers.reduce(
    (sum, p) => sum + p.models.filter((m) => m.enabled).length,
    0
  );
  return c.json({
    success: true,
    data: {
      providersCount: providers.length,
      enabledProvidersCount: providers.filter((p) => p.enabled).length,
      modelsCount: totalModels,
      enabledModelsCount: enabledModels,
      proxyKeysCount: proxyKeys.filter((k) => k.enabled).length,
      adminConfigured: !!(c.env.ADMIN_USERNAME && c.env.ADMIN_PASSWORD) || await getAdminCredentials(c.env) !== null,
      baseUrl: getExternalOrigin(c)
    }
  });
}
function redactProvider(p) {
  if (!p.dsAccount) return p;
  const { passwordEnc, userToken, ...rest } = p.dsAccount;
  return {
    ...p,
    dsAccount: {
      ...rest,
      hasPassword: !!passwordEnc,
      tokenPreview: userToken ? `${userToken.slice(0, 8)}\u2026${userToken.slice(-4)}` : "",
      tokenSet: !!userToken
    }
  };
}
async function handleGetProviders(c) {
  const providers = await getProviders(c.env);
  return c.json({ success: true, data: providers.map(redactProvider) });
}
async function handleSaveDsAccount(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const provider = await getProvider(c.env, id);
  if (!provider) return c.json({ success: false, message: "\u6E20\u9053\u4E0D\u5B58\u5728" }, 404);
  if (provider.type !== "deepseek") {
    return c.json({ success: false, message: "\u4EC5 DeepSeek \u6E20\u9053\u652F\u6301\u8D26\u53F7\u6258\u7BA1" }, 400);
  }
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ success: false, message: "\u8BF7\u6C42\u4F53\u9700\u4E3A JSON" }, 400);
  const prev = provider.dsAccount || {};
  const next = { ...prev };
  if (body.email !== void 0) next.email = String(body.email || "").trim() || void 0;
  if (body.mobile !== void 0) next.mobile = String(body.mobile || "").trim() || void 0;
  if (body.areaCode !== void 0) next.areaCode = String(body.areaCode || "").trim() || void 0;
  if (body.password !== void 0) {
    const plain = String(body.password || "");
    if (!plain) {
      delete next.passwordEnc;
    } else {
      const enc = await encryptSecret(c.env, plain);
      if (!enc) {
        return c.json(
          { success: false, message: "\u5BC6\u7801\u52A0\u5BC6\u5931\u8D25\uFF1A\u7F51\u5173\u672A\u914D\u7F6E ADMIN_PASSWORD\uFF0C\u6216\u52A0\u5BC6\u4E0D\u53EF\u7528" },
          503
        );
      }
      next.passwordEnc = enc;
    }
  }
  if (!next.email && !next.mobile) {
    return c.json({ success: false, message: "\u9700\u8981\u586B\u5199\u90AE\u7BB1\u6216\u624B\u673A\u53F7\u4E4B\u4E00" }, 400);
  }
  const updated = await updateProvider(c.env, id, { dsAccount: next });
  return c.json({
    success: true,
    data: redactProvider(updated),
    message: "\u8D26\u53F7\u5DF2\u4FDD\u5B58\uFF08\u5BC6\u7801\u52A0\u5BC6\u5B58\u50A8\uFF09"
  });
}
async function handleDsLogin(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const provider = await getProvider(c.env, id);
  if (!provider) return c.json({ success: false, message: "\u6E20\u9053\u4E0D\u5B58\u5728" }, 404);
  if (provider.type !== "deepseek") {
    return c.json({ success: false, message: "\u4EC5 DeepSeek \u6E20\u9053\u652F\u6301\u4EE3\u767B\u5F55" }, 400);
  }
  const body = await c.req.json().catch(() => ({}));
  const saved = provider.dsAccount || {};
  const email = (body?.email !== void 0 ? String(body.email || "") : saved.email || "").trim() || void 0;
  const mobile = (body?.mobile !== void 0 ? String(body.mobile || "") : saved.mobile || "").trim() || void 0;
  const areaCode = (body?.areaCode !== void 0 ? String(body.areaCode || "") : saved.areaCode || "").trim() || void 0;
  let password = "";
  if (body?.password) {
    password = String(body.password);
  } else if (saved.passwordEnc) {
    const dec = await decryptSecret(c.env, saved.passwordEnc);
    if (!dec) {
      return c.json(
        {
          success: false,
          message: "\u5DF2\u5B58\u5BC6\u7801\u65E0\u6CD5\u89E3\u5BC6\uFF08\u53EF\u80FD\u6539\u8FC7 ADMIN_PASSWORD\uFF09\u3002\u8BF7\u91CD\u65B0\u586B\u5199\u5BC6\u7801\u540E\u91CD\u8BD5\u3002"
        },
        409
      );
    }
    password = dec;
  }
  if (!password) {
    return c.json({ success: false, message: "\u6CA1\u6709\u53EF\u7528\u5BC6\u7801\uFF1A\u8BF7\u5148\u586B\u5199\u8D26\u53F7\u5BC6\u7801" }, 400);
  }
  if (!email && !mobile) {
    return c.json({ success: false, message: "\u9700\u8981\u586B\u5199\u90AE\u7BB1\u6216\u624B\u673A\u53F7\u4E4B\u4E00" }, 400);
  }
  const result = await loginWithPassword({ email, mobile, password, areaCode });
  const next = {
    ...saved,
    email,
    mobile,
    areaCode,
    lastLoginAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastLoginResult: result.ok ? "ok" : result.msg || result.error || "\u767B\u5F55\u5931\u8D25",
    lastRotated: result.rotated
  };
  if (result.ok && result.userToken) next.userToken = result.userToken;
  if (body?.password && password) {
    const enc = await encryptSecret(c.env, password);
    if (enc) next.passwordEnc = enc;
  }
  await updateProvider(c.env, id, { dsAccount: next });
  if (!result.ok) {
    return c.json({ success: false, message: result.msg || result.error || "\u767B\u5F55\u5931\u8D25", data: result }, 200);
  }
  return c.json({
    success: true,
    data: redactProvider(await getProvider(c.env, id)),
    message: result.muted ? "\u767B\u5F55\u6210\u529F\uFF0C\u4F46\u8BE5\u8D26\u53F7\u5F53\u524D\u5904\u4E8E\u7981\u8A00/\u53D7\u9650\u72B6\u6001" : result.rotated ? "\u767B\u5F55\u6210\u529F\uFF0C\u5DF2\u6309\u670D\u52A1\u7AEF\u8981\u6C42\u8F6E\u6362\u4EE4\u724C" : "\u767B\u5F55\u6210\u529F\uFF0CuserToken \u5DF2\u4FDD\u5B58"
  });
}
async function handleClearDsAccount(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const updated = await updateProvider(c.env, id, { dsAccount: void 0 });
  if (!updated) return c.json({ success: false, message: "\u6E20\u9053\u4E0D\u5B58\u5728" }, 404);
  return c.json({ success: true, data: redactProvider(updated), message: "\u5DF2\u6E05\u9664\u6258\u7BA1\u8D26\u53F7" });
}
async function handleCreateProvider(c) {
  const body = await c.req.json();
  if (body.id === "opencode" && !body.baseUrl) {
    body.baseUrl = OPENCODE_DEFAULT_URL;
  }
  if (!body.id || !body.name || !body.baseUrl) {
    return c.json({ success: false, message: "id\u3001name\u3001baseUrl \u4E3A\u5FC5\u586B\u9879" }, 400);
  }
  const providers = await getProviders(c.env);
  if (providers.some((p) => p.id === body.id)) {
    return c.json({ success: false, message: `\u6E20\u9053 id "${body.id}" \u5DF2\u5B58\u5728` }, 409);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const provider = {
    id: body.id,
    name: body.name,
    baseUrl: body.baseUrl.replace(/\/$/, ""),
    apiType: body.apiType || "openai",
    type: body.type || "openai",
    apiKeys: normalizeArray(body.apiKeys, (k) => ({ key: k, enabled: true })),
    models: body.models ? normalizeModels(body.models) : [],
    mirrorUrls: normalizeMirrorUrls(body.mirrorUrls),
    project: body.project,
    location: body.location,
    region: normalizeRegion(body.region),
    voice: body.voice,
    rate: body.rate,
    volume: body.volume,
    pitch: body.pitch,
    enabled: body.enabled !== void 0 ? body.enabled : true,
    createdAt: now,
    updatedAt: now
  };
  await addProvider(c.env, provider);
  return c.json({ success: true, data: provider }, 201);
}
async function handleUpdateProvider(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const body = await c.req.json();
  const updates = {};
  if (body.name !== void 0) updates.name = body.name;
  if (body.baseUrl !== void 0) updates.baseUrl = body.baseUrl.replace(/\/$/, "");
  if (body.apiType !== void 0) updates.apiType = body.apiType;
  if (body.type !== void 0) updates.type = body.type;
  if (body.voice !== void 0) updates.voice = body.voice;
  if (body.rate !== void 0) updates.rate = body.rate;
  if (body.volume !== void 0) updates.volume = body.volume;
  if (body.pitch !== void 0) updates.pitch = body.pitch;
  if (body.mirrorUrls !== void 0) updates.mirrorUrls = normalizeMirrorUrls(body.mirrorUrls);
  if (body.project !== void 0) updates.project = body.project;
  if (body.location !== void 0) updates.location = body.location;
  if (body.region !== void 0) updates.region = normalizeRegion(body.region);
  if (body.apiKeys !== void 0) {
    updates.apiKeys = normalizeArray(body.apiKeys, (k) => ({ key: k, enabled: true }));
  }
  if (body.enabled !== void 0) updates.enabled = body.enabled;
  if (body.models !== void 0) {
    updates.models = normalizeModels(body.models);
  }
  const updated = await updateProvider(c.env, id, updates);
  if (!updated) {
    return c.json({ success: false, message: "\u6E20\u9053\u4E0D\u5B58\u5728" }, 404);
  }
  if (body.newId && body.newId !== id) {
    if (!/^[a-zA-Z0-9_-]+$/.test(body.newId)) {
      return c.json({ success: false, message: "ID \u53EA\u80FD\u5305\u542B\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF/\u8FDE\u5B57\u7B26" }, 400);
    }
    const existing = await getProvider(c.env, body.newId);
    if (existing) {
      return c.json({ success: false, message: `\u6E20\u9053 ID "${body.newId}" \u5DF2\u5B58\u5728` }, 400);
    }
    const renamed = { ...updated, id: body.newId, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await deleteProvider(c.env, id);
    await addProvider(c.env, renamed);
    return c.json({ success: true, data: renamed, message: "\u6E20\u9053 ID \u5DF2\u66F4\u65B0" });
  }
  return c.json({ success: true, data: updated });
}
async function handleDeleteProvider(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const deleted = await deleteProvider(c.env, id);
  if (!deleted) {
    return c.json({ success: false, message: "\u6E20\u9053\u4E0D\u5B58\u5728" }, 404);
  }
  return c.json({ success: true, message: "\u6E20\u9053\u5DF2\u5220\u9664" });
}
async function handleTestModel(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const { modelId } = await c.req.json();
  if (!modelId) {
    return c.json({ success: false, message: "modelId \u4E3A\u5FC5\u586B\u9879" }, 400);
  }
  const provider = await getProvider(c.env, id);
  if (!provider) {
    return c.json({ success: false, message: "\u6E20\u9053\u4E0D\u5B58\u5728" }, 404);
  }
  const modelConfig = provider.models.find((m) => m.id === modelId);
  if (!modelConfig) {
    return c.json({ success: false, message: `\u6A21\u578B "${modelId}" \u4E0D\u5B58\u5728\u4E8E\u6E20\u9053 "${provider.name}"` }, 404);
  }
  const enabledKeys = provider.apiKeys.filter((k) => k.enabled);
  const ptype = provider.type || "openai";
  const result = isOpenCodeProvider(provider.id) ? await testOpenCodeModel(provider.baseUrl, enabledKeys, modelId, resolveProviderMirrorUrls(c.env, provider)) : ptype === "antigravity" ? await testAntigravityRotating(c.env, enabledKeys.map((k) => k.key), modelId, provider.project) : ["claude", "codex", "kimi", "grok", "qwen", "deepseek", "codebuddy", "cline"].includes(ptype) ? await testOAuthProviderRotating(c.env, ptype, enabledKeys.map((k) => k.key), modelId, provider.baseUrl, provider.id, provider.region) : await testModelConnectionRotating(provider.baseUrl, enabledKeys.map((k) => k.key), modelId, provider.apiType);
  return c.json({
    success: true,
    data: result
  });
}
function buildAuthHeaders(apiKey, apiType) {
  if (apiType === "anthropic") {
    const h = { "anthropic-version": "2023-06-01" };
    if (apiKey) h["x-api-key"] = apiKey;
    return h;
  }
  if (!apiKey) return {};
  return { "Authorization": `Bearer ${apiKey}` };
}
async function handleTestKeyNew(c) {
  const { url, apiKey, apiType, providerType, providerId, mirrorUrls, freeOnly, model, project } = await c.req.json();
  if (providerType === "antigravity") {
    const r = await testAntigravity(c.env, apiKey, model || "gemini-3.5-flash", project);
    return c.json({
      success: true,
      data: { success: r.success, statusCode: r.statusCode || 0, message: r.message }
    });
  }
  if (providerType && ["claude", "codex", "kimi", "grok", "qwen", "deepseek", "codebuddy", "cline"].includes(providerType)) {
    const r = await testOAuthProvider(c.env, providerType, apiKey, model || OAUTH_DEFAULT_MODELS[providerType], url, providerId);
    return c.json({
      success: true,
      data: { success: r.success, statusCode: r.statusCode || 0, message: r.message }
    });
  }
  if (providerType === "zai") {
    const models = fetchZaiModels().models;
    const list = (freeOnly ? models.filter((m) => /flash|air/i.test(m)) : models).map((id) => ({ id }));
    return c.json({
      success: true,
      data: { success: true, statusCode: 200, data: { object: "list", data: list } }
    });
  }
  if (!url) {
    return c.json({ success: false, message: "url \u4E3A\u5FC5\u586B\u9879" }, 400);
  }
  if (providerId && isOpenCodeProvider(providerId)) {
    if (!apiKey) {
      const mirrors = normalizeMirrorUrls(mirrorUrls) ?? resolveOpenCodeUrls(c.env);
      if (mirrors.length === 0) {
        return c.json({
          success: true,
          data: { success: false, statusCode: 0, message: "\u8BF7\u5148\u586B\u5199 API Key \u6216\u914D\u7F6E\u955C\u50CF\u5730\u5740" }
        });
      }
    }
    const result = await fetchOpenCodeModels(url, [{ key: apiKey, enabled: true }], normalizeMirrorUrls(mirrorUrls) ?? resolveOpenCodeUrls(c.env));
    return c.json({
      success: true,
      data: {
        success: result.success,
        statusCode: result.statusCode || 0,
        message: result.message,
        data: freeOnly ? filterFreeModels(result.data) : result.data
      }
    });
  }
  const cleanBase = url.replace(/\/$/, "");
  try {
    const response = await fetch(`${cleanBase}/models`, {
      method: "GET",
      headers: buildAuthHeaders(apiKey, apiType),
      signal: AbortSignal.timeout(15e3)
    });
    let data = null;
    if (response.ok) {
      try {
        data = await response.json();
      } catch {
      }
    }
    return c.json({
      success: true,
      data: { success: response.ok, statusCode: response.status, data: freeOnly ? filterFreeModels(data) : data }
    });
  } catch (err) {
    return c.json({
      success: true,
      data: { success: false, statusCode: 0, message: err.message || "\u8FDE\u63A5\u5931\u8D25" }
    });
  }
}
function filterFreeModels(data) {
  if (!data || typeof data !== "object") return data;
  const arr = data.data;
  if (!Array.isArray(arr)) return data;
  const isFree = (m) => {
    const id = String(m.id || "").toLowerCase();
    if (id.endsWith(":free") || id.endsWith("/free") || id.includes("free")) return true;
    const pricing = m.pricing;
    if (pricing) {
      const prompt = pricing.prompt;
      if (prompt === 0 || prompt === "0" || prompt === "0.000000000000" || Number(prompt) === 0) return true;
    }
    return false;
  };
  return { ...data, data: arr.filter((m) => m && typeof m === "object" && isFree(m)) };
}
async function handleTestModelNew(c) {
  const { url, apiKey, apiType, providerType, model, providerId, mirrorUrls, project } = await c.req.json();
  if (providerType === "antigravity") {
    const r = await testAntigravity(c.env, apiKey, model, project);
    return c.json({
      success: true,
      data: { success: r.success, statusCode: r.statusCode || 0, message: r.message }
    });
  }
  if (providerType && ["claude", "codex", "kimi", "grok", "qwen", "deepseek", "codebuddy", "cline"].includes(providerType)) {
    const r = await testOAuthProvider(c.env, providerType, apiKey, model, url, providerId);
    return c.json({
      success: true,
      data: { success: r.success, statusCode: r.statusCode || 0, message: r.message }
    });
  }
  if (!url || !model) {
    return c.json({ success: false, message: "url\u3001model \u4E3A\u5FC5\u586B\u9879" }, 400);
  }
  if (providerId && isOpenCodeProvider(providerId)) {
    const apiKeys = apiKey ? [{ key: apiKey, enabled: true }] : [];
    const result = await testOpenCodeModel(url, apiKeys, model, normalizeMirrorUrls(mirrorUrls) ?? resolveOpenCodeUrls(c.env));
    return c.json({
      success: true,
      data: { success: result.success, statusCode: result.statusCode || 0, message: result.message }
    });
  }
  const cleanBase = url.replace(/\/$/, "");
  const endpoint = apiType === "anthropic" ? "messages" : "chat/completions";
  try {
    let response = await fetch(`${cleanBase}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders(apiKey, apiType) },
      body: JSON.stringify({ model, messages: [{ role: "user", content: "hi" }], max_tokens: 1, stream: true }),
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) {
      const altResponse = await fetch(`${cleanBase}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders(apiKey, apiType) },
        body: JSON.stringify({ model, messages: [{ role: "user", content: "hi" }], max_tokens: 1 }),
        signal: AbortSignal.timeout(15e3)
      }).catch(() => null);
      if (altResponse && altResponse.ok) {
        response = altResponse;
      }
    }
    let message;
    if (!response.ok) {
      try {
        const errJson = await response.json();
        message = errJson.detail || errJson.error?.message || errJson.message;
      } catch {
        try {
          message = await response.text();
        } catch {
        }
      }
    }
    return c.json({
      success: true,
      data: { success: response.ok, statusCode: response.status, message }
    });
  } catch (err) {
    return c.json({
      success: true,
      data: { success: false, statusCode: 0, message: err.message || "\u8FDE\u63A5\u5931\u8D25" }
    });
  }
}
async function handleAntigravityOAuthStart(c) {
  try {
    const { url, state } = await buildAntigravityAuthUrl(c.env);
    return c.json({ success: true, data: { url, state } });
  } catch (err) {
    return c.json({ success: false, message: err.message || "\u751F\u6210\u6388\u6743\u94FE\u63A5\u5931\u8D25" }, 500);
  }
}
async function handleAntigravityOAuthComplete(c) {
  const { code, state } = await c.req.json();
  if (!code || !state) {
    return c.json({ success: false, message: "code\u3001state \u4E3A\u5FC5\u586B\u9879" }, 400);
  }
  try {
    const { refreshToken } = await exchangeAntigravityCode(c.env, code, state);
    return c.json({ success: true, data: { refresh_token: refreshToken } });
  } catch (err) {
    return c.json({ success: false, message: err.message || "\u6362\u53D6 token \u5931\u8D25" }, 400);
  }
}
async function handleAntigravityModels(c) {
  const { apiKey } = await c.req.json();
  if (!apiKey) {
    return c.json({ success: false, message: "\u8BF7\u5148\u586B\u5199 refresh_token" }, 400);
  }
  const r = await fetchAntigravityModels(c.env, apiKey);
  return c.json({
    success: r.success,
    data: { models: r.models, message: r.message, raw: r.raw },
    message: r.message
  });
}
async function handleAntigravityAccounts(c) {
  const providers = await getProviders(c.env);
  const channels = providers.filter((p) => (p.type || "") === "antigravity" && p.enabled).map((p) => ({
    id: p.id,
    name: p.name,
    accountCount: p.apiKeys.filter((k) => k.enabled && k.key && k.key.trim()).length
  }));
  return c.json({ success: true, data: { channels } });
}
async function handleAntigravityQuotaAll(c) {
  const body = await c.req.json().catch(() => ({}));
  const providers = await getProviders(c.env);
  const ags = providers.filter((p) => (p.type || "") === "antigravity" && p.enabled);
  if (body.channelId) {
    const p = ags.find((x) => x.id === body.channelId);
    if (!p) return c.json({ success: false, message: `\u6E20\u9053 "${body.channelId}" \u4E0D\u5B58\u5728` }, 404);
    const keys = p.apiKeys.filter((k) => k.enabled).map((k) => k.key).filter((k) => k && k.trim());
    const idx = Math.max(0, Number(body.index) || 0);
    if (!keys[idx]) return c.json({ success: false, message: `\u8BE5\u6E20\u9053\u7B2C ${idx + 1} \u4E2A\u8D26\u53F7\u4E0D\u5B58\u5728` }, 404);
    const accounts = await fetchAntigravityQuota(c.env, [keys[idx]], p.project);
    if (accounts[0]) accounts[0].index = idx;
    return c.json({ success: true, data: { accounts } });
  }
  const channels = [];
  for (const p of ags) {
    const keys = p.apiKeys.filter((k) => k.enabled).map((k) => k.key).filter((k) => k && k.trim());
    if (keys.length === 0) {
      channels.push({ id: p.id, name: p.name, accounts: [] });
      continue;
    }
    const accounts = await fetchAntigravityQuota(c.env, keys, p.project);
    channels.push({ id: p.id, name: p.name, accounts });
  }
  return c.json({ success: true, data: { channels } });
}
var OAUTH_PROVIDERS = /* @__PURE__ */ new Set(["claude", "codex", "kimi", "grok", "qwen", "codebuddy", "cline"]);
var OAUTH_DEFAULT_MODELS = {
  claude: "claude-sonnet-4-5-20250929",
  codex: "gpt-5.5",
  kimi: "kimi-for-coding",
  grok: "grok-4.6",
  qwen: "coder-model",
  deepseek: "deepseek-v4-flash",
  codebuddy: "deepseek-v4.1-flash",
  cline: "cline-free/deepseek-v4.1-flash"
};
async function handleOAuthStart(c) {
  const provider = c.req.param("provider") || "";
  const body = await c.req.json().catch(() => ({}));
  if (!OAUTH_PROVIDERS.has(provider)) {
    return c.json({ success: false, message: `\u4E0D\u652F\u6301\u7684 OAuth \u6E20\u9053\u7C7B\u578B: ${provider}` }, 400);
  }
  try {
    if (provider === "claude") {
      const { url, state } = await buildClaudeAuthUrl(c.env);
      return c.json({ success: true, data: { mode: "redirect", url, state } });
    }
    if (provider === "codex") {
      const { url, state } = await buildCodexAuthUrl(c.env);
      return c.json({ success: true, data: { mode: "redirect", url, state } });
    }
    if (provider === "codebuddy") {
      const flow2 = await startCodebuddyDeviceFlow(c.env, body.baseUrl, body.region);
      return c.json({
        success: true,
        data: { mode: "redirect-poll", url: flow2.authUrl, state: flow2.state, realm: flow2.realm }
      });
    }
    const flow = provider === "kimi" ? await startKimiDeviceFlow(c.env, body.baseUrl) : provider === "qwen" ? await startQwenDeviceFlow(c.env) : provider === "cline" ? await startClineDeviceFlow(c.env) : await startGrokDeviceFlow(c.env);
    return c.json({
      success: true,
      data: { mode: "device", state: flow.state, verification_uri: flow.verificationUri, verification_uri_complete: flow.verificationUriComplete, user_code: flow.userCode, interval: flow.interval }
    });
  } catch (err) {
    return c.json({ success: false, message: err.message || "\u53D1\u8D77\u6388\u6743\u5931\u8D25" }, 500);
  }
}
async function handleOAuthComplete(c) {
  const provider = c.req.param("provider") || "";
  const { code, state } = await c.req.json();
  if (!code || !state) {
    return c.json({ success: false, message: "code\u3001state \u4E3A\u5FC5\u586B\u9879" }, 400);
  }
  try {
    if (provider === "claude") {
      const { refreshToken } = await exchangeClaudeCode(c.env, code, state);
      return c.json({ success: true, data: { refresh_token: refreshToken } });
    }
    if (provider === "codex") {
      const { refreshToken } = await exchangeCodexCode(c.env, code, state);
      return c.json({ success: true, data: { refresh_token: refreshToken } });
    }
    return c.json({ success: false, message: `${provider} \u6E20\u9053\u4F7F\u7528\u8BBE\u5907\u7801\u6388\u6743\uFF0C\u8BF7\u7528\u8F6E\u8BE2\u63A5\u53E3` }, 400);
  } catch (err) {
    return c.json({ success: false, message: err.message || "\u6362\u53D6 token \u5931\u8D25" }, 400);
  }
}
async function handleOAuthPoll(c) {
  const provider = c.req.param("provider") || "";
  const { state } = await c.req.json();
  if (!state) {
    return c.json({ success: false, message: "state \u4E3A\u5FC5\u586B\u9879" }, 400);
  }
  try {
    let r = null;
    if (provider === "kimi") r = await pollKimiDeviceFlow(c.env, state);
    else if (provider === "qwen") r = await pollQwenDeviceFlow(c.env, state);
    else if (provider === "grok") r = await pollGrokDeviceFlow(c.env, state);
    else if (provider === "codebuddy") r = await pollCodebuddyDeviceFlow(c.env, state);
    else if (provider === "cline") r = await pollClineDeviceFlow(c.env, state);
    if (!r) {
      return c.json({ success: false, message: `${provider} \u6E20\u9053\u4F7F\u7528\u6388\u6743\u94FE\u63A5\uFF0C\u8BF7\u7528 complete \u63A5\u53E3` }, 400);
    }
    const data = { ...r, refresh_token: r.refreshToken };
    return c.json({ success: true, data });
  } catch (err) {
    return c.json({ success: false, message: err.message || "\u8F6E\u8BE2\u5931\u8D25" }, 500);
  }
}
async function handleOAuthModels(c) {
  const provider = c.req.param("provider") || "";
  const { apiKey, baseUrl, region } = await c.req.json();
  if (!apiKey) {
    return c.json({ success: false, message: "\u8BF7\u5148\u586B\u5199 refresh_token" }, 400);
  }
  if (provider === "claude") {
    const r = await fetchClaudeModels(c.env, apiKey);
    return c.json({ success: r.success, data: { models: r.models, message: r.message }, message: r.message });
  }
  if (provider === "kimi") {
    const r = await fetchKimiModels(c.env, apiKey, baseUrl);
    return c.json({ success: r.success, data: { models: r.models, message: r.message }, message: r.message });
  }
  if (provider === "qwen") {
    const r = fetchQwenModels();
    return c.json({ success: true, data: { models: r.models } });
  }
  if (provider === "deepseek") {
    const r = fetchDeepSeekModels();
    return c.json({ success: true, data: { models: r.models } });
  }
  if (provider === "codebuddy") {
    const r = await fetchCodebuddyModels(c.env, apiKey, baseUrl, region);
    return c.json({ success: r.success, data: { models: r.models, message: r.message }, message: r.message });
  }
  if (provider === "cline") {
    const r = fetchClineModels();
    return c.json({ success: true, data: { models: r.models } });
  }
  return c.json({ success: false, message: `${provider} \u6E20\u9053\u8BF7\u624B\u52A8\u586B\u5199\u6A21\u578B\u5217\u8868` }, 400);
}
async function testOAuthProvider(env, provider, refreshToken, modelId, baseUrl, providerId, region) {
  if (provider === "claude") return testClaude(env, refreshToken, modelId);
  if (provider === "codex") return testCodex(env, refreshToken, modelId, providerId);
  if (provider === "kimi") return testKimi(env, refreshToken, modelId, baseUrl);
  if (provider === "grok") return testGrok(env, refreshToken, modelId);
  if (provider === "qwen") return testQwen(env, refreshToken, modelId);
  if (provider === "deepseek") return testDeepSeek(env, refreshToken, modelId);
  if (provider === "codebuddy") return testCodebuddy(env, refreshToken, modelId, baseUrl, region);
  if (provider === "cline") return testCline(env, refreshToken, modelId);
  return { success: false, message: `\u672A\u77E5 OAuth \u6E20\u9053\u7C7B\u578B: ${provider}` };
}
async function testOAuthProviderRotating(env, provider, refreshTokens, modelId, baseUrl, providerId, region) {
  const list = (refreshTokens || []).filter((t) => t && t.trim());
  if (list.length === 0) {
    if (provider === "codex") return testOAuthProvider(env, provider, "", modelId, baseUrl, providerId, region);
    return { success: false, message: "\u8BE5\u6E20\u9053\u672A\u914D\u7F6E\u4EFB\u4F55 refresh_token", statusCode: 0 };
  }
  let last = { success: false, message: "\u8FDE\u63A5\u5931\u8D25", statusCode: 0 };
  for (let i = 0; i < list.length; i++) {
    const r = await testOAuthProvider(env, provider, list[i].trim(), modelId, baseUrl, providerId, region);
    if (r.success) {
      return { ...r, message: list.length > 1 ? `${r.message} (\u8D26\u53F7 #${i + 1}/${list.length})` : r.message };
    }
    last = r;
    const st = r.statusCode || 0;
    if (st === 429 || st === 401 || st === 403 || st >= 500) continue;
    break;
  }
  return last;
}
async function handleCodebuddyStatus(c) {
  const body = await c.req.json().catch(() => ({}));
  let refreshToken = (body.refreshToken || "").trim();
  let baseUrl = body.baseUrl || "";
  let region = body.region;
  if (!refreshToken && body.providerId) {
    const provider = await getProvider(c.env, body.providerId);
    if (!provider) return c.json({ success: false, message: `\u6E20\u9053 "${body.providerId}" \u4E0D\u5B58\u5728` }, 404);
    const keys = provider.apiKeys.filter((k) => k.enabled);
    const idx = Number.isInteger(body.index) ? body.index : 0;
    refreshToken = (keys[idx]?.key || "").trim();
    baseUrl = baseUrl || provider.baseUrl;
    region = region || provider.region;
  }
  if (!refreshToken) {
    return c.json({ success: false, message: "\u8BF7\u5148\u586B\u5199 refresh_token\uFF0C\u6216\u5148\u4FDD\u5B58\u6E20\u9053\u518D\u67E5\u8BE2" }, 400);
  }
  const r = await fetchCodebuddyStatus(c.env, refreshToken, baseUrl, region);
  return c.json({ success: r.ok, data: r, message: r.message });
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
var CRON_CHECKIN_STATE_KEY = "cron:checkin:state";
var CRON_CHECKIN_RETRY_COOLDOWN_MS = 30 * 60 * 1e3;
function shanghaiDate(d = /* @__PURE__ */ new Date()) {
  return new Date(d.getTime() + 8 * 3600 * 1e3).toISOString().slice(0, 10);
}
async function readCronState(env) {
  try {
    const raw2 = await getKV(env).get(CRON_CHECKIN_STATE_KEY);
    return raw2 ? JSON.parse(raw2) : null;
  } catch {
    return null;
  }
}
async function writeCronState(env, state) {
  try {
    await getKV(env).put(CRON_CHECKIN_STATE_KEY, JSON.stringify(state));
  } catch {
  }
}
async function runCodebuddyCheckinAll(env) {
  const providers = (await getProviders(env)).filter((p) => p.type === "codebuddy");
  const results = [];
  let ok = 0;
  let already = 0;
  let failed = 0;
  let done = 0;
  for (const p of providers) {
    const keys = p.apiKeys.filter((k) => k.enabled && (k.key || "").trim());
    for (let i = 0; i < keys.length; i++) {
      if (done > 0) await new Promise((res) => setTimeout(res, 200));
      const r = await checkinCodebuddy(env, keys[i].key.trim(), p.baseUrl, p.region);
      done++;
      if (r.ok) {
        if (r.already) already++;
        else ok++;
      } else {
        failed++;
      }
      results.push({
        providerId: p.id,
        providerName: p.name,
        index: i,
        ok: r.ok,
        already: !!r.already,
        message: r.message,
        realm: r.realm,
        nickname: r.nickname,
        remain: r.remain
      });
    }
  }
  return { total: results.length, ok, already, failed, results };
}
async function handleCronCheckin(c) {
  const expected = await codebuddyCronToken(c.env);
  if (!expected) {
    return c.json({ success: false, message: "\u7F51\u5173\u672A\u914D\u7F6E ADMIN_PASSWORD\uFF0C\u5B9A\u65F6\u7B7E\u5230\u4E0D\u53EF\u7528" }, 503);
  }
  const body = await c.req.json().catch(() => ({}));
  const provided = (c.req.header("X-Cron-Token") || c.req.query("token") || body.token || "").trim();
  if (!provided || !timingSafeEqual(provided, expected)) {
    return c.json({ success: false, message: "\u4EE4\u724C\u65E0\u6548" }, 401);
  }
  const today = shanghaiDate();
  const prev = await readCronState(c.env);
  if (c.req.query("status") === "1") {
    return c.json({
      success: true,
      data: { action: "status", date: today, last: prev },
      message: prev ? `\u6700\u8FD1\u4E00\u6B21\u7B7E\u5230\uFF1A${prev.date}\uFF08\u5171 ${prev.total} \u4E2A\u8D26\u53F7\uFF0C\u65B0\u7B7E\u5230 ${prev.ok}\u3001\u5DF2\u7B7E\u5230 ${prev.already}\u3001\u5931\u8D25 ${prev.failed}\uFF09` : "\u8FD8\u6CA1\u6709\u6267\u884C\u8FC7\u7B7E\u5230"
    });
  }
  const force = c.req.query("force") === "1";
  if (!force && prev && prev.date === today) {
    const cooling = prev.failed > 0 && Date.now() - Date.parse(prev.at) < CRON_CHECKIN_RETRY_COOLDOWN_MS;
    if (prev.failed === 0 || cooling) {
      return c.json({
        success: true,
        data: { action: "skipped", ...prev, date: today, results: [] },
        message: prev.failed === 0 ? `\u4ECA\u65E5\uFF08${today}\uFF09\u5DF2\u7B7E\u5230\uFF0C\u8DF3\u8FC7\u3002\u5171 ${prev.total} \u4E2A\u8D26\u53F7\uFF1A\u65B0\u7B7E\u5230 ${prev.ok}\u3001\u5DF2\u7B7E\u5230 ${prev.already}` : `\u4ECA\u65E5\u5DF2\u5C1D\u8BD5\u8FC7\u4E14\u521A\u5931\u8D25\u8FC7\uFF0C${Math.ceil(CRON_CHECKIN_RETRY_COOLDOWN_MS / 6e4)} \u5206\u949F\u5185\u4E0D\u518D\u91CD\u8BD5`
      });
    }
  }
  const data = await runCodebuddyCheckinAll(c.env);
  if (data.total > 0) {
    await writeCronState(c.env, {
      date: today,
      at: (/* @__PURE__ */ new Date()).toISOString(),
      total: data.total,
      ok: data.ok,
      already: data.already,
      failed: data.failed
    });
  }
  return c.json({
    success: true,
    data: { action: "checkin", date: today, ...data },
    message: data.total === 0 ? "\u6CA1\u6709\u5DF2\u914D\u7F6E\u7684 CodeBuddy \u6E20\u9053\uFF08\u8DF3\u8FC7\uFF09" : `\u5171 ${data.total} \u4E2A\u8D26\u53F7\uFF1A\u65B0\u7B7E\u5230 ${data.ok}\u3001\u5DF2\u7B7E\u5230 ${data.already}\u3001\u5931\u8D25 ${data.failed}`
  });
}
async function handleCodebuddyCheckin(c) {
  const body = await c.req.json().catch(() => ({}));
  if (body.all) {
    const data = await runCodebuddyCheckinAll(c.env);
    return c.json({
      success: true,
      data,
      message: data.total === 0 ? "\u6CA1\u6709\u5DF2\u914D\u7F6E\u7684 CodeBuddy \u6E20\u9053\uFF08\u8DF3\u8FC7\uFF09" : `\u5171 ${data.total} \u4E2A\u8D26\u53F7\uFF1A\u65B0\u7B7E\u5230 ${data.ok}\u3001\u5DF2\u7B7E\u5230 ${data.already}\u3001\u5931\u8D25 ${data.failed}`
    });
  }
  let refreshToken = (body.refreshToken || "").trim();
  let baseUrl = body.baseUrl || "";
  let region = normalizeRegion(body.region);
  if (!refreshToken && body.providerId) {
    const provider = await getProvider(c.env, body.providerId);
    if (!provider) return c.json({ success: false, message: `\u6E20\u9053 "${body.providerId}" \u4E0D\u5B58\u5728` }, 404);
    const keys = provider.apiKeys.filter((k) => k.enabled);
    const idx = Number.isInteger(body.index) ? body.index : 0;
    refreshToken = (keys[idx]?.key || "").trim();
    baseUrl = baseUrl || provider.baseUrl;
    region = region || provider.region;
  }
  if (!refreshToken) {
    return c.json({ success: false, message: "\u8BF7\u5148\u586B\u5199 refresh_token\uFF0C\u6216\u5148\u4FDD\u5B58\u6E20\u9053\u518D\u7B7E\u5230" }, 400);
  }
  const r = await checkinCodebuddy(c.env, refreshToken, baseUrl, region);
  return c.json({ success: r.ok, data: r, message: r.message });
}
async function handleGetProxyKeys(c) {
  const keys = await getProxyKeys(c.env);
  const maskedKeys = keys.map((k) => ({
    ...k,
    key: k.key.length > 12 ? k.key.substring(0, 8) + "****" + k.key.substring(k.key.length - 4) : k.key
  }));
  return c.json({ success: true, data: maskedKeys });
}
async function handleCreateProxyKey(c) {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const randomPart = crypto.randomUUID().replace(/-/g, "");
  const key = `${PROXY_KEY_PREFIX}${randomPart}`;
  let expiresAt = null;
  if (body.expiresIn && body.expiresIn !== "forever") {
    const ttl = EXPIRY_OPTIONS[body.expiresIn];
    if (ttl) {
      expiresAt = new Date(Date.now() + ttl * 1e3).toISOString();
    }
  }
  const proxyKey = {
    id,
    key,
    name: body.name || `Key-${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
    enabled: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt
  };
  await addProxyKey(c.env, proxyKey);
  return c.json({
    success: true,
    data: proxyKey,
    message: "\u8BF7\u7ACB\u5373\u4FDD\u5B58\u6B64 Key\uFF0C\u5173\u95ED\u540E\u5C06\u4E0D\u518D\u663E\u793A"
  }, 201);
}
async function handleDeleteProxyKey(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const deleted = await deleteProxyKey(c.env, id);
  if (!deleted) {
    return c.json({ success: false, message: "\u4EE4\u724C\u4E0D\u5B58\u5728" }, 404);
  }
  return c.json({ success: true, message: "\u4EE4\u724C\u5DF2\u5220\u9664" });
}
async function handleUpdateProxyKey(c) {
  const id = c.req.param("id");
  if (!id) return c.json({ success: false, message: "\u7F3A\u5C11 id \u53C2\u6570" }, 400);
  const body = await c.req.json();
  const updates = {};
  if (body.enabled !== void 0) updates.enabled = body.enabled;
  if (body.regenerate) {
    const randomPart = crypto.randomUUID().replace(/-/g, "");
    updates.key = `${PROXY_KEY_PREFIX}${randomPart}`;
    updates.createdAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  const updated = await updateProxyKey(c.env, id, updates);
  if (!updated) {
    return c.json({ success: false, message: "\u4EE4\u724C\u4E0D\u5B58\u5728" }, 404);
  }
  return c.json({ success: true, data: updated });
}
async function handleTtsPreview(c) {
  const body = await c.req.json().catch(() => ({}));
  const providerId = body.provider || "tts";
  const provider = await getProvider(c.env, providerId);
  if (!provider) return c.json({ success: false, message: `\u6E20\u9053 "${providerId}" \u4E0D\u5B58\u5728` }, 404);
  if ((provider.type || "openai") !== "azure-tts") {
    return c.json({ success: false, message: `\u6E20\u9053 "${providerId}" \u4E0D\u662F azure-tts \u7C7B\u578B` }, 400);
  }
  const { synthesizeAzureTts: synthesizeAzureTts2 } = await Promise.resolve().then(() => (init_azure_tts(), azure_tts_exports));
  const voice = body.voice || provider.voice || "zh-CN-XiaoxiaoNeural";
  const previewText = (v) => {
    if (v.startsWith("zh-")) return "\u4F60\u597D,\u8FD9\u662F\u8BED\u97F3\u8BD5\u542C,\u6B22\u8FCE\u4F7F\u7528\u3002";
    if (v.startsWith("ja-")) return "\u3053\u3093\u306B\u3061\u306F\u3001\u3053\u308C\u306F\u97F3\u58F0\u30D7\u30EC\u30D3\u30E5\u30FC\u3067\u3059\u3002";
    if (v.startsWith("ko-")) return "\uC548\uB155\uD558\uC138\uC694, \uC74C\uC131 \uBBF8\uB9AC\uBCF4\uAE30\uC785\uB2C8\uB2E4.";
    if (v.startsWith("fr-")) return "Bonjour, ceci est un aper\xE7u vocal.";
    if (v.startsWith("de-")) return "Hallo, dies ist eine Sprachvorschau.";
    if (v.startsWith("ru-")) return "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, \u044D\u0442\u043E \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u043F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440.";
    if (v.startsWith("es-")) return "Hola, esta es una vista previa de voz.";
    if (v.startsWith("it-")) return "Ciao, questa \xE8 un'anteprima vocale.";
    if (v.startsWith("pt-")) return "Ol\xE1, esta \xE9 uma pr\xE9via de voz.";
    if (v.startsWith("ar-")) return "\u0645\u0631\u062D\u0628\u0627\u064B\u060C \u0647\u0630\u0647 \u0645\u0639\u0627\u064A\u0646\u0629 \u0635\u0648\u062A\u064A\u0629.";
    if (v.startsWith("hi-")) return "\u0928\u092E\u0938\u094D\u0924\u0947, \u092F\u0939 \u090F\u0915 \u0906\u0935\u093E\u091C\u093C \u092A\u0942\u0930\u094D\u0935\u093E\u0935\u0932\u094B\u0915\u0928 \u0939\u0948\u0964";
    if (v.startsWith("id-")) return "Halo, ini adalah pratinjau suara.";
    if (v.startsWith("th-")) return "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35 \u0E19\u0E35\u0E48\u0E04\u0E37\u0E2D\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E07";
    if (v.startsWith("vi-")) return "Xin ch\xE0o, \u0111\xE2y l\xE0 b\u1EA3n xem tr\u01B0\u1EDBc gi\u1ECDng n\xF3i.";
    if (v.startsWith("tr-")) return "Merhaba, bu bir ses \xF6nizlemesidir.";
    if (v.startsWith("pl-")) return "Cze\u015B\u0107, to jest podgl\u0105d g\u0142osu.";
    if (v.startsWith("nl-")) return "Hallo, dit is een spraakvoorbeeld.";
    if (v.startsWith("sv-")) return "Hej, detta \xE4r en r\xF6stf\xF6rhandsvisning.";
    if (v.startsWith("uk-")) return "\u041F\u0440\u0438\u0432\u0456\u0442, \u0446\u0435 \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u0438\u0439 \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0439 \u043F\u0435\u0440\u0435\u0433\u043B\u044F\u0434.";
    if (v.startsWith("cs-")) return "Ahoj, toto je hlasov\xE1 uk\xE1zka.";
    if (v.startsWith("da-")) return "Hej, dette er en stemmepr\xF8ve.";
    if (v.startsWith("fi-")) return "Hei, t\xE4m\xE4 on \xE4\xE4niesikatselu.";
    if (v.startsWith("el-")) return "\u0393\u03B5\u03B9\u03B1 \u03C3\u03B1\u03C2, \u03B1\u03C5\u03C4\u03AE \u03B5\u03AF\u03BD\u03B1\u03B9 \u03BC\u03B9\u03B1 \u03C0\u03C1\u03BF\u03B5\u03C0\u03B9\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 \u03C6\u03C9\u03BD\u03AE\u03C2.";
    if (v.startsWith("he-")) return "\u05E9\u05DC\u05D5\u05DD, \u05D6\u05D5\u05D4\u05D9 \u05EA\u05E6\u05D5\u05D2\u05D4 \u05DE\u05E7\u05D3\u05D9\u05DE\u05D4 \u05E9\u05DC \u05E7\u05D5\u05DC.";
    if (v.startsWith("nb-")) return "Hei, dette er en talepr\xF8ve.";
    if (v.startsWith("en-")) return "Hello, this is a voice preview.";
    return "\u4F60\u597D,\u8FD9\u662F\u8BED\u97F3\u8BD5\u542C,\u6B22\u8FCE\u4F7F\u7528\u3002";
  };
  const text = (body.text || previewText(voice)).slice(0, 100);
  try {
    const { audio, usedVoice } = await synthesizeAzureTts2(text, {
      voice,
      rate: provider.rate || "+0%",
      volume: provider.volume || "+0%",
      pitch: provider.pitch || "+0Hz"
    });
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "X-Azure-TTS-Voice": usedVoice
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, message: `\u8BD5\u542C\u5931\u8D25: ${message}` }, 502);
  }
}
async function handleGetUsage(c) {
  const q = c.req.query("days");
  const days = Math.min(Math.max(parseInt(q || "1") || 1, 1), 30);
  const summary = await getUsageSummary(c.env, days);
  return c.json({ success: true, data: summary });
}
async function handleVertexVerify(c) {
  const body = await c.req.json().catch(() => ({}));
  const credential = (body.credential || "").trim();
  if (!credential) return c.json({ success: false, message: "\u8BF7\u5148\u586B\u5199\u670D\u52A1\u8D26\u53F7 JSON \u6216 API Key" }, 400);
  const { testVertex: testVertex2 } = await Promise.resolve().then(() => (init_vertex(), vertex_exports));
  const result = await testVertex2(c.env, credential, body.model?.trim() || void 0, body.location?.trim() || void 0);
  return c.json(
    result.success ? { success: true, data: { message: result.message, statusCode: result.statusCode } } : { success: false, message: result.message },
    result.success ? 200 : 400
  );
}
async function handleDevinOAuthStart(c) {
  try {
    const { startDevinOAuth: startDevinOAuth2 } = await Promise.resolve().then(() => (init_devin(), devin_exports));
    const { url, state } = await startDevinOAuth2(c.env);
    return c.json({ success: true, data: { url, state } });
  } catch (err) {
    return c.json({ success: false, message: err.message || "\u751F\u6210\u6388\u6743\u94FE\u63A5\u5931\u8D25" }, 500);
  }
}
async function handleDevinOAuthComplete(c) {
  const { code, state } = await c.req.json().catch(() => ({}));
  if (!code) return c.json({ success: false, message: "\u8BF7\u586B\u5199\u6388\u6743\u7801 code" }, 400);
  try {
    const { completeDevinOAuth: completeDevinOAuth2 } = await Promise.resolve().then(() => (init_devin(), devin_exports));
    const result = await completeDevinOAuth2(c.env, code, state || "");
    return c.json({
      success: true,
      data: { session_token: result.sessionToken, user_name: result.userName, user_id: result.userId, org_id: result.orgId }
    });
  } catch (err) {
    return c.json({ success: false, message: err.message || "\u6362\u53D6 token \u5931\u8D25" }, 400);
  }
}
async function handleDevinVerify(c) {
  const body = await c.req.json().catch(() => ({}));
  const credential = (body.credential || "").trim();
  if (!credential) return c.json({ success: false, message: "\u8BF7\u5148\u586B\u5199 session token\uFF0C\u6216\u70B9\u300C\u7528 Devin \u8D26\u53F7\u6388\u6743\u300D" }, 400);
  const { testDevin: testDevin2 } = await Promise.resolve().then(() => (init_devin(), devin_exports));
  const result = await testDevin2(c.env, credential, body.model?.trim() || void 0);
  return c.json(
    result.success ? { success: true, data: { message: result.message } } : { success: false, message: result.message },
    result.success ? 200 : 400
  );
}

// src/pages.ts
init_storage();
init_codex();
init_config();

// src/pages.css.ts
var CSS_CONTENT = `
/* \u4E2D\u6587\u8BF4\u660E\uFF1A\u65B9\u6848 A\u300CCloud Workbench\u300D\u7EDF\u4E00\u9996\u9875\u3001\u767B\u5F55\u9875\u548C\u7BA1\u7406\u9875\u7684\u8BBE\u8BA1\u8BED\u8A00\uFF1B\u4E0D\u6D89\u53CA\u540E\u7AEF\u903B\u8F91\u3002 */
/* Hallmark \xB7 genre: modern-minimal \xB7 macrostructure: Workbench \xB7 design-system: design.md \xB7 designed-as-app
 * Hallmark \xB7 pre-emit critique: P5 H5 E4 S5 R5 V5
 */
:root {
  --color-paper: oklch(98.5% 0.004 250);
  --color-paper-a: oklch(98.5% 0.004 250 / .94);
  --color-paper-2: oklch(96.7% 0.006 250);
  --color-paper-3: oklch(94.8% 0.008 250);
  --color-ink: oklch(22% 0.020 258);
  --color-ink-2: oklch(34% 0.018 257);
  --color-muted: oklch(49% 0.016 255);
  --color-rule: oklch(89% 0.010 252);
  --color-rule-2: oklch(82% 0.014 252);
  --color-accent: oklch(52% 0.205 256);
  --color-accent-hover: oklch(46% 0.195 256);
  --color-accent-soft: oklch(94% 0.030 256);
  --color-accent-ink: oklch(99% 0.003 250);
  --color-focus: oklch(44% 0.180 256);
  --color-success: oklch(45% 0.120 158);
  --color-success-soft: oklch(95% 0.025 158);
  --color-success-ink: oklch(34% 0.092 158);
  --color-danger: oklch(50% 0.185 25);
  --color-danger-hover: oklch(45% 0.175 25);
  --color-danger-soft: oklch(96% 0.022 25);
  --color-danger-ink: oklch(38% 0.145 25);
  --color-graphite: oklch(22% 0.016 260);
  --color-graphite-2: oklch(28% 0.018 260);
  --color-graphite-rule: oklch(38% 0.020 258);
  --color-graphite-ink: oklch(92% 0.010 250);
  --color-overlay: oklch(18% 0.020 258 / .48);
  --shadow-panel: 0 18px 48px oklch(20% 0.020 258 / .10);
  --shadow-float: 0 8px 24px oklch(20% 0.020 258 / .12);

  --font-display: 'Space Grotesk', 'SF Pro Display', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;

  --space-3xs: .25rem;
  --space-2xs: .5rem;
  --space-xs: .75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 8rem;

  --text-xs: .75rem;
  --text-sm: .875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.75rem;
  --text-2xl: clamp(2.25rem, 5vw, 4.5rem);

  --radius-control: .375rem;
  --radius-panel: .625rem;
  --radius-round: 999px;
  --control-h: 2.75rem;
  --control-h-sm: 2rem;
  --shell: 74rem;
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --dur-fast: 160ms;
  --dur-panel: 260ms;

  /* compatibility aliases for existing management scripts */
  --c-primary: var(--color-accent);
  --c-primary-hover: var(--color-accent-hover);
  --c-primary-glow: var(--color-accent-soft);
  --c-text: var(--color-ink-2);
  --c-text-dark: var(--color-ink);
  --c-text-secondary: var(--color-ink-2);
  --c-text-muted: var(--color-muted);
  --c-text-light: var(--color-muted);
  --c-bg: var(--color-paper-2);
  --c-bg-white: var(--color-paper);
  --c-bg-light: var(--color-paper-2);
  --c-bg-alt: var(--color-paper-2);
  --c-border: var(--color-rule);
  --c-border-dark: var(--color-rule-2);
  --c-success: var(--color-success);
  --c-success-bg: var(--color-success-soft);
  --c-success-text: var(--color-success-ink);
  --c-danger: var(--color-danger);
  --c-danger-bg: var(--color-danger-soft);
  --c-danger-text: var(--color-danger-ink);
  --c-info-bg: var(--color-accent-soft);
  --c-info-text: var(--color-focus);
  --c-overlay: var(--color-overlay);
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; min-width: 0; overflow-x: clip; scroll-behavior: smooth; }
body {
  min-height: 100dvh;
  background: var(--color-paper-2);
  color: var(--color-ink-2);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: 1.6;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
button, input, textarea, select { font: inherit; }
button, a, input, select, textarea { -webkit-tap-highlight-color: transparent; }
a { color: inherit; }
h1, h2, h3, p, figure, dl, dd { margin: 0; }
h1, h2, h3 { color: var(--color-ink); font-family: var(--font-display); font-style: normal; font-weight: 600; letter-spacing: -.025em; line-height: 1.12; overflow-wrap: anywhere; min-width: 0; }
code, pre { font-family: var(--font-mono); }
fieldset { min-width: 0; }
html:focus-within { scroll-behavior: smooth; }
:target { scroll-margin-top: var(--space-lg); }
:focus { outline: 0; }
:focus-visible { outline: .125rem solid var(--color-focus); outline-offset: .125rem; }
::selection { background: var(--color-accent-soft); color: var(--color-ink); }

.shell { width: min(100% - calc(var(--space-sm) * 2), var(--shell)); margin-inline: auto; }
.site-page { display: flex; min-height: 100dvh; flex-direction: column; }
.site-page > main { flex: 1; }
.hd { display: none !important; }
.sr-only { position: absolute; width: .0625rem; height: .0625rem; padding: 0; margin: -.0625rem; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* shared navigation */
.topbar { position: sticky; inset-block-start: 0; z-index: 100; min-height: 4rem; border-block-end: .0625rem solid var(--color-rule); background: var(--color-paper-a); color: var(--color-ink); backdrop-filter: blur(.75rem); }
.topbar__inner { min-height: 4rem; display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.brand { min-width: 0; display: inline-flex; align-items: center; gap: var(--space-2xs); color: var(--color-ink); text-decoration: none; white-space: nowrap; }
.brand__mark { width: 2rem; height: 2rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper); color: var(--color-accent); }
.brand__name, .brand strong { font-family: var(--font-display); font-size: var(--text-md); font-weight: 600; letter-spacing: -.02em; }
.brand__descriptor, .brand small { color: var(--color-muted); font-family: var(--font-mono); font-size: .625rem; font-weight: 500; letter-spacing: .08em; }
.topbar__actions { display: flex; align-items: center; gap: var(--space-2xs); }

/* buttons and controls */
.btn, .icon-btn, .model-token, .password-toggle, .admin-nav__link, .ps {
  border: .0625rem solid transparent;
  border-radius: var(--radius-control);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--dur-fast) ease, border-color var(--dur-fast) ease, color var(--dur-fast) ease, transform var(--dur-fast) ease;
}
.btn { min-height: var(--control-h-sm); padding-inline: var(--space-sm); display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2xs); font-size: var(--text-sm); font-weight: 600; line-height: 1; }
.btn-p { border-color: var(--color-accent); background: var(--color-accent); color: var(--color-accent-ink); }
.btn-s { border-color: var(--color-rule-2); background: var(--color-paper); color: var(--color-ink-2); }
.btn-gh { border-color: transparent; background: transparent; color: var(--color-muted); }
.btn-g { border-color: var(--color-success-soft); background: var(--color-success-soft); color: var(--color-success-ink); }
.btn-d { border-color: var(--color-danger-soft); background: var(--color-danger-soft); color: var(--color-danger-ink); }
.icon-btn, .password-toggle { width: var(--control-h-sm); height: var(--control-h-sm); flex: 0 0 var(--control-h-sm); display: inline-grid; place-items: center; border-color: transparent; background: transparent; color: var(--color-muted); }
.icon-btn span { font-family: var(--font-body); font-size: var(--text-xs); }
.copy-control[data-state='success'] { border-color: var(--color-success); color: var(--color-success-ink); }
.copy-control[data-state='error'] { border-color: var(--color-danger); color: var(--color-danger-ink); }
.btn:active, .icon-btn:active, .model-token:active, .password-toggle:active, .ps:active { transform: translateY(.0625rem); }
.btn:disabled, .btn[aria-disabled='true'], .icon-btn:disabled, input:disabled, select:disabled { opacity: .55; cursor: not-allowed; }
.btn[data-state='loading'] .button-label { display: none; }
.btn:not([data-state='loading']) .button-loading { display: none; }
.btn[data-state='success'] { border-color: var(--color-success); background: var(--color-success); color: var(--color-paper); }
.button-loading { display: inline-flex; align-items: center; gap: var(--space-2xs); }

/* form controls */
input, textarea, select {
  width: 100%; height: var(--control-h); padding-inline: var(--space-xs); border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); outline: .125rem solid transparent; outline-offset: .0625rem; background: var(--color-paper); color: var(--color-ink); transition: background-color var(--dur-fast) ease, border-color var(--dur-fast) ease;
}
input::placeholder, textarea::placeholder { color: var(--color-muted); opacity: .82; }
input:focus-visible, textarea:focus-visible, select:focus-visible { border-color: var(--color-ink-2); outline: .125rem solid var(--color-focus); outline-offset: .0625rem; }
input[aria-invalid='true'], textarea[aria-invalid='true'], select[aria-invalid='true'] { border-color: var(--color-danger); background: var(--color-danger-soft); }
textarea { min-height: 6rem; padding-block: var(--space-xs); resize: vertical; }
label, legend { color: var(--color-ink-2); font-size: var(--text-xs); font-weight: 600; }
.fg { min-width: 0; margin-block-end: var(--space-sm); }
.fg > label { display: block; margin-block-end: var(--space-2xs); }
.form-helper { min-height: 1lh; margin-block-start: var(--space-3xs); color: var(--color-muted); font-size: var(--text-xs); }
.fg-tag { color: var(--color-accent); font-size: var(--text-2xs); border: .0625rem solid color-mix(in srgb, var(--color-accent) 35%, transparent); border-radius: 999px; padding: .0625rem .4rem; margin-inline-start: .4rem; vertical-align: middle; white-space: nowrap; }
.input-wrap { position: relative; }
.input-wrap > i { position: absolute; inset-inline-start: var(--space-xs); inset-block-start: 50%; z-index: 1; color: var(--color-muted); transform: translateY(-50%); }
.input-wrap input { padding-inline-start: var(--space-xl); padding-inline-end: var(--space-xl); }
.password-toggle { position: absolute; inset-inline-end: 0; inset-block-start: 0; }
.select-sm { height: var(--control-h); }
.tts-voice-row { display: flex; gap: var(--space-2xs); align-items: center; }
.tts-voice-row .select-sm { flex: 1; min-width: 0; }
.tts-voice-row .btn { white-space: nowrap; }
.fr, .fr3 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 var(--space-sm); }
.form-group { margin: 0 0 var(--space-md); padding: var(--space-sm); border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); }
.form-group legend { padding-inline: var(--space-2xs); }
.field-row { min-width: 0; flex-wrap: nowrap; }
.field-row input { min-width: 0; }
/* \u7EAF\u56FE\u6807\u6309\u94AE\u76F8\u90BB\u65F6\u6536\u7D27\u95F4\u8DDD\uFF08\u8D1F\u5916\u8FB9\u8DDD\u62B5\u6D88 .fc \u7684 gap\uFF09 */
.fc > .icon-btn + .icon-btn { margin-inline-start: calc(var(--space-3xs) - var(--space-2xs)); }

/* switch */
.tg { position: relative; display: inline-block; width: 2.5rem; height: var(--control-h); flex: 0 0 2.5rem; margin: 0; }
.tg input { position: absolute; opacity: 0; width: .0625rem; height: .0625rem; }
.tg .sl { position: absolute; inset-inline: 0; inset-block-start: .8125rem; height: 1.125rem; border-radius: var(--radius-round); background: var(--color-rule-2); cursor: pointer; transition: background-color var(--dur-fast) ease; }
.tg .sl::before { content: ''; position: absolute; width: .75rem; height: .75rem; inset-inline-start: .1875rem; inset-block-start: .1875rem; border-radius: 50%; background: var(--color-paper); box-shadow: 0 .0625rem .125rem var(--color-overlay); transition: transform var(--dur-fast) var(--ease-out); }
.tg input:checked + .sl { background: var(--color-accent); }
.tg input:checked + .sl::before { transform: translateX(1.375rem); }
.tg input:focus-visible + .sl { outline: .125rem solid var(--color-focus); outline-offset: .125rem; }
.tg input:disabled + .sl { opacity: .55; cursor: not-allowed; }

/* home workbench */
.home-page { background: var(--color-paper); }
.home-hero { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-xl); padding-block: var(--space-2xl); }
.home-hero__copy { align-self: center; min-width: 0; }
.eyebrow { margin-block-end: var(--space-sm); display: flex; align-items: center; gap: var(--space-2xs); color: var(--color-muted); font-family: var(--font-mono); font-size: .6875rem; font-weight: 600; letter-spacing: .08em; }
.eyebrow > span { width: .75rem; height: .125rem; background: var(--color-accent); }
.home-hero h1 { max-width: 12ch; font-size: var(--text-2xl); }
.home-hero__lede { max-width: 60ch; margin-block-start: var(--space-md); color: var(--color-muted); font-size: var(--text-md); }
.endpoint-box { max-width: 40rem; margin-block-start: var(--space-lg); display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); }
.endpoint-box__label { grid-column: 1 / -1; padding: var(--space-2xs) var(--space-xs) 0; color: var(--color-muted); font-family: var(--font-mono); font-size: .625rem; font-weight: 600; letter-spacing: .08em; }
.endpoint-box code { min-width: 0; padding: var(--space-2xs) var(--space-xs) var(--space-xs); overflow: hidden; color: var(--color-ink); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.endpoint-box .icon-btn { width: auto; padding-inline: var(--space-sm); display: flex; gap: var(--space-2xs); border-inline-start-color: var(--color-rule); border-radius: 0; }
.endpoint-box--list { max-width: none; grid-column: 1 / -1; grid-template-columns: 1fr; }
.endpoint-box--list .endpoint-box__label { padding-block-end: var(--space-2xs); }
.endpoint-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-2xs); padding: 0 var(--space-xs) var(--space-xs); }
@media (min-width: 40rem) {
  .endpoint-list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2xs) var(--space-sm); }
}
.ep-item { display: flex; align-items: baseline; gap: var(--space-2xs); min-width: 0; padding: var(--space-2xs); overflow: hidden; border-radius: var(--radius-control); background: var(--color-paper); }
.ep-item code { display: inline; padding: 0; overflow: hidden; color: var(--color-ink); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.ep-item small { flex-shrink: 0; color: var(--color-muted); font-size: .6875rem; white-space: nowrap; }
.endpoint-method { flex-shrink: 0; color: var(--color-accent); font-weight: 600; }
.request-panel { min-width: 0; overflow: clip; border: .0625rem solid var(--color-graphite-rule); border-radius: var(--radius-panel); background: var(--color-graphite); color: var(--color-graphite-ink); box-shadow: var(--shadow-panel); }
.request-panel figcaption, .request-panel__foot { min-height: 3rem; padding-inline: var(--space-sm); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); border-block-end: .0625rem solid var(--color-graphite-rule); color: var(--color-graphite-ink); font-family: var(--font-mono); font-size: .625rem; letter-spacing: .04em; }
.protocol-state { display: inline-flex; align-items: center; gap: var(--space-2xs); color: var(--color-graphite-ink); white-space: nowrap; }
.protocol-state i { width: .4375rem; height: .4375rem; border-radius: 50%; background: var(--color-success); }
.request-panel pre { margin: 0; min-height: 18rem; padding: var(--space-md); overflow: auto; background: var(--color-graphite); color: var(--color-graphite-ink); font-size: clamp(.6875rem, 2vw, .8125rem); line-height: 1.8; }
.request-panel pre code { white-space: pre; }
.syntax-command, .syntax-key { color: oklch(75% 0.130 256); }
.syntax-string { color: oklch(83% 0.060 154); }
.request-panel__foot { border-block-start: .0625rem solid var(--color-graphite-rule); border-block-end: 0; color: oklch(72% 0.012 250); }
.request-panel__foot code { color: var(--color-graphite-ink); }
.metrics-strip { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-block: .0625rem solid var(--color-rule); }
.metric { min-width: 0; padding-block: var(--space-md); display: flex; flex-direction: column; gap: var(--space-3xs); border-inline-end: .0625rem solid var(--color-rule); }
.metric:nth-child(even) { border-inline-end: 0; }
.metric:nth-child(n+3) { border-block-start: .0625rem solid var(--color-rule); }
.metric__value { color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; line-height: 1; }
.metric__label { color: var(--color-muted); font-size: var(--text-xs); }
.directory { padding-block: var(--space-2xl) var(--space-3xl); }
.section-heading { margin-block-end: var(--space-lg); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); align-items: end; }
.section-heading h2 { font-size: var(--text-xl); }
.section-heading p { max-width: 65ch; margin-block-start: var(--space-2xs); color: var(--color-muted); }
.search-field { position: relative; width: 100%; }
.search-field > i { position: absolute; inset-inline-start: var(--space-xs); inset-block-start: 50%; color: var(--color-muted); transform: translateY(-50%); }
.search-field input { padding-inline-start: var(--space-lg); }
.provider-index { border-block-start: .0625rem solid var(--color-rule-2); }
.provider-row { min-width: 0; padding-block: var(--space-md); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); align-items: start; border-block-end: .0625rem solid var(--color-rule); }
.provider-row__identity { min-width: 0; display: flex; align-items: center; gap: var(--space-xs); }
.provider-row__mark, .provider-avatar { width: 2.5rem; height: 2.5rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-ink); font-family: var(--font-display); font-weight: 600; }
.provider-row h3 { font-size: var(--text-md); }
.provider-row__identity p { margin-block-start: var(--space-3xs); display: flex; flex-wrap: wrap; gap: var(--space-2xs); color: var(--color-muted); font-size: var(--text-xs); }
.provider-row__identity code { color: var(--color-ink-2); }
.provider-row__models { min-width: 0; display: flex; flex-wrap: wrap; gap: var(--space-2xs); }
.model-token { max-width: 100%; min-height: var(--control-h-sm); padding-inline: var(--space-xs); display: inline-flex; align-items: center; gap: var(--space-2xs); border-color: var(--color-rule); background: var(--color-paper-2); color: var(--color-ink-2); }
.model-token code { overflow: hidden; font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.model-token i { color: var(--color-muted); }
.status-badge, .bd, .protocol-chip, .status-dot { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2xs); width: max-content; min-height: 1.75rem; padding-inline: var(--space-xs); border-radius: var(--radius-round); font-size: var(--text-xs); font-weight: 600; white-space: nowrap; }
.status-badge i, .status-dot i { width: .4375rem; height: .4375rem; border-radius: 50%; background: currentColor; }
.status-badge--on, .bd-on, .status-dot--online { background: var(--color-success-soft); color: var(--color-success-ink); }
.bd-off { background: var(--color-paper-3); color: var(--color-muted); }
.bd-info, .protocol-chip { background: var(--color-accent-soft); color: var(--color-focus); }
/* \u5220\u9664\u7C7B\u5FBD\u6807\u6309\u94AE\uFF1A\u5F62\u72B6\u540C .bd \u80F6\u56CA\uFF0C\u989C\u8272\u4FDD\u6301\u5371\u9669\u6001 */
.bd-del { border: .0625rem solid transparent; background: var(--color-danger-soft); color: var(--color-danger-ink); font-family: inherit; cursor: pointer; transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease; }
.bd-del:hover { background: var(--color-danger); color: var(--color-paper); }
.empty-inline { color: var(--color-muted); font-size: var(--text-xs); }
.empty-state { padding: var(--space-xl) var(--space-sm); display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); border: .0625rem dashed var(--color-rule-2); border-radius: var(--radius-panel); background: var(--color-paper-2); color: var(--color-muted); text-align: center; }
.empty-state > i { font-size: var(--text-lg); color: var(--color-muted); }
.empty-state h3 { font-size: var(--text-md); }
.empty-state p { max-width: 55ch; }
.site-footer { border-block-start: .0625rem solid var(--color-rule); background: var(--color-paper-2); color: var(--color-muted); }
.admin-main > .site-footer { margin-block-start: auto; }
.site-footer__inner { padding-block: var(--space-md); display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2xs); font-size: var(--text-xs); }
.site-footer a { text-underline-offset: .125rem; }
.site-footer__link { color: inherit; text-decoration: none; }

/* authentication split */
.auth-page { background: var(--color-paper); }
.auth-shell { width: min(100%, var(--shell)); min-height: calc(100dvh - 4rem); margin-inline: auto; display: grid; grid-template-columns: minmax(0, 1fr); }
.auth-context, .auth-form-wrap { min-width: 0; padding: var(--space-xl) var(--space-sm); }
.auth-context { display: flex; flex-direction: column; justify-content: center; border-block-end: .0625rem solid var(--color-rule); background: var(--color-paper-2); color: var(--color-ink-2); }
.auth-context h1 { max-width: 11ch; font-size: clamp(2.25rem, 6vw, 4rem); }
.auth-context > p:not(.eyebrow) { max-width: 58ch; margin-block-start: var(--space-md); color: var(--color-muted); font-size: var(--text-md); }
.auth-facts { margin-block-start: var(--space-xl); border-block-start: .0625rem solid var(--color-rule); }
.auth-facts > div { padding-block: var(--space-sm); display: grid; grid-template-columns: minmax(7rem, .7fr) minmax(0, 1.3fr); gap: var(--space-sm); border-block-end: .0625rem solid var(--color-rule); }
.auth-facts dt { color: var(--color-muted); font-size: var(--text-xs); }
.auth-facts dd { min-width: 0; color: var(--color-ink); font-size: var(--text-xs); overflow-wrap: anywhere; }
.auth-form-wrap { display: grid; place-items: center; background: var(--color-paper); color: var(--color-ink-2); }
.auth-form { width: min(100%, 27rem); }
.auth-form__heading { margin-block-end: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
.auth-form__icon, .panel-heading__mark { width: 2.75rem; height: 2.75rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-accent); }
.auth-form h2 { font-size: var(--text-xl); }
.auth-form__heading p { margin-block-start: var(--space-3xs); color: var(--color-muted); }
.auth-form .al { margin-block-end: var(--space-sm); }
.btn-submit { width: 100%; margin-block-start: var(--space-sm); }

/* admin control plane */
.admin-page { background: var(--color-paper-2); }
.admin-shell { min-height: 100dvh; }
.admin-rail { display: none; }
.admin-main { min-width: 0; min-height: 100dvh; display: flex; flex-direction: column; }
.admin-topbar { position: sticky; inset-block-start: 0; z-index: 90; min-height: 4rem; padding-inline: var(--space-sm); display: flex; align-items: center; justify-content: space-between; gap: var(--space-2xs); border-block-end: .0625rem solid var(--color-rule); background: var(--color-paper-a); backdrop-filter: blur(.75rem); }
.admin-topbar nav { min-width: 0; display: flex; align-items: center; gap: var(--space-3xs); overflow-x: auto; }
.admin-topbar nav a { min-height: var(--control-h); padding-inline: var(--space-xs); display: inline-flex; align-items: center; color: var(--color-muted); font-size: var(--text-xs); font-weight: 600; text-decoration: none; white-space: nowrap; }
.admin-content { width: 100%; max-width: 82rem; margin-inline: auto; padding: var(--space-lg) var(--space-sm) var(--space-3xl); }
.admin-overview { margin-block-end: var(--space-xl); }
.admin-heading { margin-block-end: var(--space-lg); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); align-items: end; }
.admin-heading h1 { font-size: clamp(2rem, 5vw, 3rem); }
.admin-heading > div > p:not(.eyebrow) { max-width: 65ch; margin-block-start: var(--space-2xs); color: var(--color-muted); }
.admin-heading__actions { display: flex; flex-wrap: wrap; gap: var(--space-2xs); }
.admin-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); background: var(--color-paper); }
.admin-metrics > div { min-width: 0; padding: var(--space-sm); border-inline-end: .0625rem solid var(--color-rule); border-block-end: .0625rem solid var(--color-rule); }
.admin-metrics > div:nth-child(even) { border-inline-end: 0; }
.admin-metrics > div:nth-child(n+3) { border-block-end: 0; }
.admin-metrics > div > span:not(.status-dot) { color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; line-height: 1; }
.admin-metrics p { margin-block-start: var(--space-xs); color: var(--color-ink); font-weight: 600; }
.admin-metrics small { color: var(--color-muted); font-size: var(--text-xs); }
.workspace-section { margin-block-start: var(--space-xl); }
.section-heading--admin { padding-block-end: var(--space-md); border-block-end: .0625rem solid var(--color-rule); }
.section-heading--admin code { font-size: var(--text-xs); }
.af-w { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); margin-block-end: var(--space-md); }
.add-form-panel, .mdl-list-panel { min-width: 0; padding: var(--space-md); border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-panel); background: var(--color-paper-2); }
.panel-heading { margin-block-end: var(--space-md); display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-sm); }
.panel-heading > div { min-width: 0; display: flex; align-items: center; gap: var(--space-xs); }
.panel-heading h3 { font-size: var(--text-md); }
.panel-heading p { color: var(--color-muted); font-size: var(--text-xs); }
.mdl-list-panel { max-height: 36rem; overflow-y: auto; margin-bottom: 20px;}
.panel-actions, .detail-actions { display: flex; flex-direction: column; align-items: stretch; gap: var(--space-sm); }
.panel-actions > div, .detail-actions > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2xs); }
.switch-label { min-height: var(--control-h); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.gp, .provider-list, .key-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-xs); }
.quota-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); }
.quota-models { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 var(--space-lg); margin-block-start: var(--space-2xs); }
.quota-card { padding: var(--space-sm); border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); background: var(--color-paper); min-width: 0; }
.pi, .ki { min-width: 0; border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper); }
.ps { min-height: 4.75rem; padding: var(--space-xs); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); cursor: pointer; }
.ps .l { min-width: 0; display: flex; align-items: center; gap: var(--space-xs); }
.ps .l > div { min-width: 0; }
.ps h3 { font-size: var(--text-md); }
.provider-chevron { width: 1rem; flex: 0 0 auto; color: var(--color-muted); transition: transform var(--dur-fast) var(--ease-out); }
.pu { margin-block-start: var(--space-3xs); display: flex; flex-wrap: wrap; gap: var(--space-2xs); color: var(--color-muted); font-size: var(--text-xs); }
.pu > *:not(:last-child)::after { content: '\xB7'; margin-inline-start: var(--space-2xs); color: var(--color-rule-2); }
.pd { display: none; padding: var(--space-md); border-block-start: .0625rem solid var(--color-rule); background: var(--color-paper-2); }
.pd.open { display: block; }
.detail-heading { margin-block-end: var(--space-md); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.detail-heading h3 { font-size: var(--text-lg); }
.detail-heading p { margin-block-start: var(--space-3xs); color: var(--color-muted); font-size: var(--text-xs); }
.detail-actions { padding-block-start: var(--space-sm); border-block-start: .0625rem solid var(--color-rule); }
.detail-actions > div:first-child { flex: 1; justify-content: flex-start; }
.ki { padding: var(--space-sm); display: flex; flex-direction: column; gap: var(--space-sm); }
.key-main { min-width: 0; display: flex; align-items: flex-start; gap: var(--space-xs); }
.key-main > div { min-width: 0; }
.key-icon { width: 2.5rem; height: 2.5rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-accent); }
.kv { min-width: 0; display: flex; align-items: center; gap: var(--space-3xs); color: var(--color-ink-2); font-family: var(--font-mono); font-size: var(--text-xs); }
.kv > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kv .icon-btn { width: var(--control-h-sm); }
.key-main h3 { margin-block-start: var(--space-3xs); font-size: var(--text-sm); }
.key-main p { color: var(--color-muted); font-size: var(--text-xs); }
/* Key \u540D\u79F0\u4E0E\u521B\u5EFA\u65F6\u95F4\u4E00\u884C\u663E\u793A */
.key-meta { min-width: 0; display: flex; align-items: baseline; gap: var(--space-2xs); }
.key-meta h3 { margin-block-start: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.key-meta p { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.key-meta__sep { color: var(--color-muted); flex: 0 0 auto; }
.key-actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-2xs); }

/* feedback, model list and modal */
.al { min-height: var(--control-h); padding: var(--space-xs); display: flex; align-items: center; gap: var(--space-2xs); border: .0625rem solid transparent; border-radius: var(--radius-control); font-size: var(--text-xs); }
.al-s { border-color: var(--color-success); background: var(--color-success-soft); color: var(--color-success-ink); margin-top: 20px; }
.al-e { border-color: var(--color-danger); background: var(--color-danger-soft); color: var(--color-danger-ink); }
.al-i { border-color: var(--color-accent); background: var(--color-accent-soft); color: var(--color-focus); }
.toast { position: fixed; inset-block-start: var(--space-sm); inset-inline-end: var(--space-sm); z-index: 9998; width: min(calc(100% - calc(var(--space-sm) * 2)), 24rem); box-shadow: var(--shadow-float); }
.modal-o { position: fixed; inset: 0; z-index: 9999; padding: var(--space-sm); display: grid; place-items: center; background: var(--color-overlay); color: var(--color-ink-2); }
.modal { width: min(100%, 27rem); max-height: min(80dvh, 40rem); overflow-y: auto; padding: var(--space-md); border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-panel); background: var(--color-paper); color: var(--color-ink-2); box-shadow: var(--shadow-panel); animation: modal-in var(--dur-panel) var(--ease-out); }
.modal h3 { margin-block-end: var(--space-xs); font-size: var(--text-lg); }
.modal p { margin-block-end: var(--space-sm); color: var(--color-muted); }
.modal .fa { margin-block-start: var(--space-sm); display: flex; justify-content: flex-end; gap: var(--space-2xs); }
/* DeepSeek \u53D6 userToken \u7684\u5206\u6B65\u5F15\u5BFC\uFF08\u5F39\u7A97\u5185\uFF09 */
.ds-steps { margin: 0 0 var(--space-sm); padding-inline-start: 1.25em; color: var(--color-ink-2); font-size: var(--text-sm); line-height: 1.7; }
.ds-steps li { margin-block-end: var(--space-3xs); }
.ds-steps a { color: var(--color-focus); text-decoration: underline; }
.ds-steps code { padding: .1em .35em; border-radius: var(--radius-control); background: var(--color-paper-2); font-family: var(--font-mono); font-size: .92em; }
.ds-steps kbd { padding: .1em .4em; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); font-family: var(--font-mono); font-size: .88em; }
.ds-alt { margin-block-end: var(--space-2xs); border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper-2); }
.ds-alt > summary { padding: var(--space-2xs) var(--space-xs); cursor: pointer; color: var(--color-muted); font-size: var(--text-xs); }
.ds-alt > summary:hover { color: var(--color-ink-2); }
.ds-alt > p { margin-inline: var(--space-xs); }
.ds-code { display: block; margin: 0 var(--space-xs) var(--space-xs); padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-control); background: var(--color-paper); color: var(--color-ink); font-family: var(--font-mono); font-size: var(--text-xs); overflow-wrap: anywhere; user-select: all; }
.ds-warn { margin-block-end: var(--space-xs); padding: var(--space-2xs) var(--space-xs); display: flex; gap: var(--space-2xs); align-items: flex-start; border: .0625rem solid var(--color-danger-soft); border-inline-start: .1875rem solid var(--color-danger); border-radius: var(--radius-control); background: var(--color-danger-soft); color: var(--color-danger-ink); font-size: var(--text-xs); line-height: 1.6; }
.ds-warn i { margin-block-start: .15em; flex: 0 0 auto; }
.ds-warn code { padding: .1em .35em; border-radius: var(--radius-control); background: var(--color-paper); font-family: var(--font-mono); }
.mk { margin-block: var(--space-xs); padding: var(--space-sm); border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-ink); font-family: var(--font-mono); font-size: var(--text-xs); overflow-wrap: anywhere; user-select: all; }
.mdl-item { min-width: 0; min-height: var(--control-h-sm); padding-inline: var(--space-2xs); display: flex; align-items: center; gap: var(--space-2xs); border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper); color: var(--color-ink-2); font-size: var(--text-xs); }
.mdl-item .fx1 { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.mdl-item i:first-child { color: var(--color-muted); }
.mdl-add-btn { flex-shrink: 0; width: var(--control-h-sm); min-height: 0; font-size: var(--text-md); line-height: 2; }
.grid-2-gap6 { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-2xs); }
@keyframes modal-in { from { opacity: 0; transform: translateY(var(--space-xs)); } to { opacity: 1; transform: none; } }

/* compatibility utilities used by existing interaction code */
.fc { display: flex; align-items: center; gap: var(--space-2xs); }
.fx1 { flex: 1; min-width: 0; }
.fx-s0 { flex-shrink: 0; }
.flex-col { display: flex; flex-direction: column; }
.jc-c { justify-content: center; }
.gap-8, .gp8 { gap: var(--space-2xs); }
.gp3, .gp4 { gap: var(--space-3xs); }
.gp6 { gap: var(--space-2xs); }
.mt-1 { margin-block-start: var(--space-3xs); }
.mt-2, .mt-8 { margin-block-start: var(--space-2xs); }
.mt-3, .mt-6 { margin-block-start: var(--space-2xs); }
.mb-2, .mb-10 { margin-block-end: var(--space-2xs); }
.mb-3, .mb-4 { margin-block-end: var(--space-3xs); }
.m-16-0 { margin-block: var(--space-sm); }
.input-mt-6 { margin-block-start: var(--space-2xs); }
.p-14, .p-10-12 { padding: var(--space-xs); }
.fw { width: 100%; }
.fw-4 { font-weight: 400; }
.fw-6 { font-weight: 600; }
.fw-7 { font-weight: 700; }
.fs-xs, .fs-65, .fs-77 { font-size: var(--text-xs); }
.fs-sm, .fs-s, .fs-88 { font-size: var(--text-sm); }
.fs-1 { font-size: var(--text-md); }
.fs-xxs { font-size: .625rem; }
.w12, .w14, .w16 { width: 1rem; }
.c-p { color: var(--color-accent); }
.c-l, .c-muted, .mu { color: var(--color-muted); }
.c-s { color: var(--color-success); }

/* \u590D\u5236\u6210\u529F\u6001\u9700\u538B\u8FC7 .model-token i / .mdl-item i:first-child \u7684 muted \u8272\uFF080,2,0 > 0,1,1\uFF09 */
.model-token i.c-s, .mdl-item i.c-s, .mdl-item i:first-child.c-s { color: var(--color-success); }
.c-d { color: var(--color-danger); }
.mu { font-size: var(--text-xs); }
.tc { text-align: center; }
.va-m { vertical-align: middle; }
.ov { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp { cursor: pointer; user-select: none; }
.cd { padding: var(--space-3xs) var(--space-2xs); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-ink); font-family: var(--font-mono); font-size: var(--text-xs); }
.copy-icon { color: var(--color-muted); font-size: var(--text-xs); }

@media (hover: hover) and (pointer: fine) {
  .btn-p:hover { border-color: var(--color-accent-hover); background: var(--color-accent-hover); }
  .btn-s:hover, .btn-gh:hover, .icon-btn:hover, .password-toggle:hover { border-color: var(--color-rule-2); background: var(--color-paper-2); color: var(--color-ink); }
  .btn-g:hover { border-color: var(--color-success); }
  .btn-d:hover { border-color: var(--color-danger); background: var(--color-danger); color: var(--color-paper); }
  input:hover, textarea:hover, select:hover { background: var(--color-paper-2); }
  .model-token:hover { border-color: var(--color-accent); color: var(--color-focus); }
  .provider-row:hover, .pi:hover, .ki:hover { border-color: var(--color-rule-2); }
  .ps:hover { background: var(--color-paper-2); }
  .admin-nav__link:hover { background: var(--color-paper-2); color: var(--color-ink); }
}

@media (min-width: 40rem) {
  .shell { width: min(100% - calc(var(--space-lg) * 2), var(--shell)); }
  .home-hero { padding-block: var(--space-3xl); }
  .metrics-strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .metric { padding-inline: var(--space-md); }
  .metric:first-child { padding-inline-start: 0; }
  .metric:last-child { border-inline-end: 0; }
  .metric:nth-child(even) { border-inline-end: .0625rem solid var(--color-rule); }
  .metric:nth-child(n+3) { border-block-start: 0; }
  .section-heading { grid-template-columns: minmax(0, 1fr) minmax(16rem, .45fr); }
  .provider-row { grid-template-columns: minmax(13rem, .7fr) minmax(0, 1.5fr) auto; align-items: center; }
  .site-footer__inner { flex-direction: row; align-items: center; justify-content: space-between; }
  .auth-context, .auth-form-wrap { padding: var(--space-2xl); }
  .fr { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fr3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .admin-content { padding-inline: var(--space-lg); }
  .admin-heading, .section-heading--admin { grid-template-columns: minmax(0, 1fr) auto; }
  .admin-heading__actions { justify-content: flex-end; }
  .admin-metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .admin-metrics > div { border-block-end: 0; }
  .admin-metrics > div:nth-child(even) { border-inline-end: .0625rem solid var(--color-rule); }
  .admin-metrics > div:last-child { border-inline-end: 0; }
  .panel-actions, .detail-actions { flex-direction: row; align-items: center; justify-content: space-between; }
  .ki { flex-direction: row; align-items: center; justify-content: space-between; }
  .grid-2-gap6 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .quota-models { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 60rem) {
  .home-hero { grid-template-columns: minmax(0, .9fr) minmax(28rem, 1.1fr); align-items: center; gap: var(--space-2xl); }
  .auth-shell { grid-template-columns: minmax(0, 1.05fr) minmax(25rem, .95fr); }
  .auth-context { border-block-end: 0; border-inline-end: .0625rem solid var(--color-rule); }
  .admin-shell { display: grid; grid-template-columns: 15rem minmax(0, 1fr); transition: grid-template-columns .18s ease; }
  .admin-rail { position: sticky; inset-block-start: 0; height: 100dvh; padding: var(--space-md) var(--space-sm); display: flex; flex-direction: column; border-inline-end: .0625rem solid var(--color-rule); background: var(--color-paper); color: var(--color-ink-2); overflow: hidden; transition: padding .18s ease; }
  .admin-rail__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2xs); }
  .admin-rail__brand { padding-inline: var(--space-xs); min-width: 0; }
  .admin-rail__brand > span:last-child { display: flex; flex-direction: column; line-height: 1.2; white-space: nowrap; overflow: hidden; }
  .rail-toggle { cursor: pointer; background: none; border: 0; font: inherit; text-align: start; }
  /* \u6536\u7F29\u6001: \u53EA\u5269\u56FE\u6807 */
  .admin-shell.is-collapsed { grid-template-columns: 4.25rem minmax(0, 1fr); }
  .admin-shell.is-collapsed .admin-rail { padding-inline: .5rem; }
  .admin-shell.is-collapsed .admin-rail__head { justify-content: center; }
  .admin-shell.is-collapsed .admin-rail__brand { width: 100%; justify-content: center; padding-inline: 0; }
  .admin-shell.is-collapsed .admin-rail__brand > span:last-child,
  .admin-shell.is-collapsed .admin-nav__link span,
  .admin-shell.is-collapsed .admin-nav__link b { display: none; }
  .admin-shell.is-collapsed .admin-nav__link { padding-inline: 0; grid-template-columns: 1fr; justify-items: center; }
  .admin-shell.is-collapsed .rail-toggle i { transform: rotate(180deg); }
  .admin-nav { margin-block-start: var(--space-xl); display: grid; gap: var(--space-3xs); }
  .admin-nav__link { min-height: var(--control-h); padding-inline: var(--space-xs); display: grid; grid-template-columns: 1.25rem minmax(0, 1fr) auto; align-items: center; gap: var(--space-2xs); color: var(--color-muted); font-weight: 600; }
  .admin-nav__link b { min-width: 1.5rem; padding-inline: var(--space-3xs); border-radius: var(--radius-round); background: var(--color-paper-3); color: var(--color-muted); font-family: var(--font-mono); font-size: .625rem; text-align: center; }
  .admin-nav__link.is-active { background: var(--color-accent-soft); color: var(--color-focus); }
  .admin-rail__foot { margin-block-start: auto; display: grid; gap: var(--space-3xs); }
  .admin-topbar { display: none; }
  .admin-content { padding-block-start: var(--space-xl); }
  .grid-2-gap6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pd { padding: var(--space-lg); }
}

@media (min-width: 80rem) {
  .admin-content { padding-inline: var(--space-xl); }
}

@media (max-width: 24rem) {
  .brand__descriptor { display: none; }
  .topbar__actions .btn-gh { display: none; }
  .topbar__actions .btn, .topbar--auth .btn { padding-inline: var(--space-xs); }
  .request-panel figcaption { align-items: flex-start; flex-direction: column; justify-content: center; gap: 0; }
  .protocol-state { font-size: .5625rem; }
  .workspace-section { padding: 0; }
  .provider-avatar { display: none; }
  .ps { align-items: flex-start; }
  .ps > .fc { flex-direction: column; align-items: flex-end; }
  .field-row { flex-wrap: wrap; }
  .field-row input { flex-basis: calc(100% - 3.5rem); }
  .field-row .btn { flex: 1; }
  .admin-topbar .brand__name { display: none; }
  .admin-heading__actions .btn { flex: 1; }
}

@media (pointer: coarse) {
  .btn, .model-token, .password-toggle, input, select { min-height: var(--control-h); }
  .icon-btn, .password-toggle { width: var(--control-h); height: var(--control-h); flex-basis: var(--control-h); }
}

@media (prefers-reduced-motion: reduce) {
  html, body { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  .modal { transform: none; }
}
/* ===== \u7528\u91CF\u7EDF\u8BA1 ===== */
.rank-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--space-sm); }
.rank-card { min-width: 0; border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); padding: var(--space-sm); background: var(--color-paper); }
.rank-card .panel-heading { margin-block-end: var(--space-xs); }
.rank-card code { font-family: var(--font-mono); }
.trend-fill { transition: width .3s ease; }
`;

// src/shared.js.ts
var SITE_REPO_URL = "https://github.com/wimdaw/ai-gateway";
function renderSiteFooter(title, platform) {
  return `<footer class="site-footer">
  <div class="shell site-footer__inner">
    <span>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} <a class="site-footer__link" href="${SITE_REPO_URL}" target="_blank" rel="noreferrer">${title}</a></span>
    <span>${platform || "EdgeOne \xB7 Blob"}</span>
  </div>
</footer>`;
}
var SHARED_JS = `
// \u2500\u2500 \u5DE5\u5177\u51FD\u6570 \u2500\u2500
function normalizeUrl(url) {
    return url.replace(/\\/$/, '')
  }
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
function buildAuthHeaders(apiType, key) {
  return apiType === 'anthropic'
    ? { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
    : { 'Authorization': 'Bearer ' + key }
}

// \u2500\u2500 UI \u51FD\u6570 \u2500\u2500
function showSpinner(el) {
  el.innerHTML = '<span class="mu"><i class="fas fa-spinner fa-spin"></i> \u6D4B\u8BD5\u4E2D...</span>'
}
function showResult(el, success, msg) {
  el.innerHTML = success
    ? '<div class="al al-s"><i class="fas fa-check-circle"></i> \u8FDE\u63A5\u6210\u529F</div>'
    : '<div class="al al-e"><i class="fas fa-times-circle"></i> ' + escapeHtml(msg || '\u8FDE\u63A5\u5931\u8D25') + '</div>'
}

// \u2500\u2500 API \u8BF7\u6C42\u51FD\u6570 \u2500\u2500
async function testKeyConnection(url, apiType, key, providerId, mirrorUrls, freeOnly, providerType, project) {
  try {
    var r = await fetch('/admin/api/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, apiKey: key, apiType: apiType, providerId: providerId, mirrorUrls: mirrorUrls || undefined, freeOnly: freeOnly || undefined, providerType: providerType || undefined, project: project || undefined })
    })
    var d = await r.json()
    if (d.success && d.data) {
      return { success: d.data.success, status: d.data.statusCode, data: d.data.data, message: d.data.message }
    }
    return { success: false, status: 0, data: null }
  } catch (e) {
    return { success: false, status: 0, data: null }
  }
}
async function testModelConnection(url, apiType, key, modelId, providerId, mirrorUrls, providerType, project) {
  try {
    var r = await fetch('/admin/api/test-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, apiKey: key, apiType: apiType, model: modelId, providerId: providerId, mirrorUrls: mirrorUrls || undefined, providerType: providerType || undefined, project: project || undefined })
    })
    var d = await r.json()
    if (d.success && d.data) {
      return { success: d.data.success, status: d.data.statusCode, message: d.data.message }
    }
    return { success: false, status: 0 }
  } catch (e) {
    return { success: false, status: 0 }
  }
}
`;

// src/pages.ts
init_storage_adapter();
init_azure_voices();
function getPlatformLabel(_env, _host) {
  return "EdgeOne \xB7 Blob";
}
var AZURE_VOICE_OPTIONS = (() => {
  const groups = /* @__PURE__ */ new Map();
  for (const v of AZURE_TTS_VOICES) {
    const g = v.group || voiceGroup(v.id);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(`<option value="${v.id}">${v.label} (${v.id})</option>`);
  }
  return Array.from(groups.entries()).map(([g, opts]) => `<optgroup label="${g}">${opts.join("")}</optgroup>`).join("");
})();
var azureVoiceOptions = (selected) => {
  const groups = /* @__PURE__ */ new Map();
  for (const v of AZURE_TTS_VOICES) {
    const g = v.group || voiceGroup(v.id);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(`<option value="${v.id}" ${v.id === selected ? "selected" : ""}>${v.label} (${v.id})</option>`);
  }
  return Array.from(groups.entries()).map(([g, opts]) => `<optgroup label="${g}">${opts.join("")}</optgroup>`).join("");
};
var escapePageHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
var cbRealmOf = (p) => {
  if (p.region === "global") return "global";
  if (p.region === "cn") return "cn";
  return /workbuddy\.ai/i.test(p.baseUrl || "") ? "global" : "cn";
};
var H = (title) => `
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="oklch(98.5% 0.004 250)">
  <title>${title} \u2014 ${SITE_CONFIG.title}</title>
  <link rel="icon" href="${SITE_CONFIG.favicon}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${SITE_CONFIG.faCdn}">
  <style>${CSS_CONTENT}</style>
</head>`;
async function renderHomePage(c, isLoggedIn) {
  const providers = await getProviders(c.env);
  const apiBase = `${getExternalOrigin(c)}/v1`;
  const enabledProviders = providers.filter((provider) => provider.enabled);
  const allModelsCount = providers.reduce((total, provider) => total + provider.models.length, 0);
  const enabledModelsCount = enabledProviders.reduce((total, provider) => total + provider.models.filter((model) => model.enabled).length, 0);
  const sampleProvider = enabledProviders.find((p) => p.models.some((m) => m.enabled));
  const sampleModel = sampleProvider ? `${sampleProvider.id}/${sampleProvider.models.find((m) => m.enabled)?.alias || sampleProvider.models.find((m) => m.enabled)?.id || "model"}` : "provider/model";
  return c.html(`<!DOCTYPE html><html lang="zh-CN">
${H("\u9996\u9875")}
<body class="site-page home-page">
<header class="topbar">
  <div class="shell topbar__inner">
    <a class="brand" href="/" aria-label="AI Gateway \u9996\u9875">
      <span class="brand__mark" aria-hidden="true"><i class="fas fa-cloud"></i></span>
      <span class="brand__name">${SITE_CONFIG.title}</span>
      <span class="brand__descriptor">API CONTROL PANEL</span>
    </a>
    <nav class="topbar__actions" aria-label="\u4E3B\u5BFC\u822A">
      ${isLoggedIn ? `<a href="/admin" class="btn btn-p"><i class="fas fa-sliders-h" aria-hidden="true"></i>\u7BA1\u7406\u63A7\u5236\u53F0</a><a href="/admin/logout" class="btn btn-gh"><i class="fas fa-sign-out-alt" aria-hidden="true"></i>\u9000\u51FA</a>` : `<a href="/admin/login" class="btn btn-p"><i class="fas fa-sign-in-alt" aria-hidden="true"></i>\u7BA1\u7406\u5458\u767B\u5F55</a>`}
    </nav>
  </div>
</header>

<main>
  <section class="shell home-hero" aria-labelledby="home-title">
    <div class="home-hero__copy">
      <p class="eyebrow"><span aria-hidden="true"></span>UNIFIED AI GATEWAY</p>
      <h1 id="home-title">\u4E00\u4E2A API\uFF0C\u8C03\u7528\u5DF2\u914D\u7F6E\u7684\u6240\u6709\u6A21\u578B\u3002</h1>
      <p class="home-hero__lede">\u7EDF\u4E00\u7684 OpenAI / Anthropic \u517C\u5BB9\u5165\u53E3\u3002\u6A21\u578B\u6309\u6E20\u9053\u5F52\u6863\uFF0C\u4EE4\u724C\u3001\u542F\u7528\u72B6\u6001\u548C\u6545\u969C\u8F6C\u79FB\u96C6\u4E2D\u7BA1\u7406\u3002</p>
      <div class="endpoint-box" aria-label="API \u63A5\u5165\u5730\u5740">
        <span class="endpoint-box__label">BASE URL</span>
        <code>${escapePageHtml(apiBase)}</code>
        <button class="icon-btn copy-control" type="button" data-copy="${escapePageHtml(apiBase)}" aria-label="\u590D\u5236 API \u5730\u5740">
          <i class="far fa-copy" aria-hidden="true"></i><span>\u590D\u5236</span>
        </button>
      </div>
    </div>

    <figure class="request-panel" aria-labelledby="request-caption">
      <figcaption id="request-caption">
        <span>POST /chat/completions</span>
        <span class="protocol-state"><i aria-hidden="true"></i>OPENAI COMPATIBLE</span>
      </figcaption>
      <pre><code><span class="syntax-command">curl</span> ${escapePageHtml(apiBase)}/chat/completions \\
  <span class="syntax-key">-H</span> <span class="syntax-string">"Authorization: Bearer ***"</span> \\
  <span class="syntax-key">-H</span> <span class="syntax-string">"Content-Type: application/json"</span> \\
  <span class="syntax-key">-d</span> <span class="syntax-string">'{
    "model": "${escapePageHtml(sampleModel)}",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'</span></code></pre>
      <div class="request-panel__foot">
        <span>\u6A21\u578B\u683C\u5F0F</span>
        <code>provider/model</code>
      </div>
    </figure>

    <div class="endpoint-box endpoint-box--list" aria-label="\u652F\u6301\u7684 API \u7AEF\u70B9">
      <span class="endpoint-box__label">ENDPOINTS \xB7 \u652F\u6301\u4EE5\u4E0B\u63A5\u53E3</span>
      <div class="endpoint-list">
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/chat/completions</code><small>\u5BF9\u8BDD\u8865\u5168</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/completions</code><small>\u6587\u672C\u8865\u5168</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/embeddings</code><small>\u5411\u91CF\u5D4C\u5165</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/audio/speech</code><small>\u8BED\u97F3\u5408\u6210</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/audio/transcriptions</code><small>\u8BED\u97F3\u8F6C\u6587\u5B57</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/audio/translations</code><small>\u8BED\u97F3\u7FFB\u8BD1</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/images/generations</code><small>\u6587\u751F\u56FE</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/images/edits</code><small>\u56FE\u7247\u7F16\u8F91</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/images/variations</code><small>\u56FE\u7247\u53D8\u4F53</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/videos/generations</code><small>\u6587\u751F\u89C6\u9891</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/video/generations</code><small>\u6587\u751F\u89C6\u9891(\u522B\u540D)</small></div>
        <div class="ep-item"><code><span class="endpoint-method">GET</span> /v1/videos/status</code><small>\u89C6\u9891\u4EFB\u52A1\u72B6\u6001</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/messages</code><small>Anthropic \u6D88\u606F</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/responses</code><small>\u54CD\u5E94\u63A5\u53E3</small></div>
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /v1/moderations</code><small>\u5185\u5BB9\u5BA1\u6838</small></div>
        <div class="ep-item"><code><span class="endpoint-method">GET</span> /v1/models</code><small>\u6A21\u578B\u5217\u8868</small></div>
      </div>
    </div>
  </section>

  <section class="shell metrics-strip" aria-label="\u7F51\u5173\u914D\u7F6E\u6982\u89C8">
    <div class="metric"><span class="metric__value">${providers.length}</span><span class="metric__label">\u6E20\u9053\u603B\u8BA1</span></div>
    <div class="metric"><span class="metric__value">${enabledProviders.length}</span><span class="metric__label">\u5DF2\u542F\u7528\u6E20\u9053</span></div>
    <div class="metric"><span class="metric__value">${allModelsCount}</span><span class="metric__label">\u6A21\u578B\u603B\u8BA1</span></div>
    <div class="metric"><span class="metric__value">${enabledModelsCount}</span><span class="metric__label">\u53EF\u7528\u6A21\u578B</span></div>
  </section>

  <section class="shell directory" aria-labelledby="directory-title">
    <div class="section-heading">
      <div>
        <h2 id="directory-title">\u6A21\u578B\u5217\u8868</h2>
        <p>\u70B9\u51FB\u6A21\u578B ID \u5373\u53EF\u590D\u5236\uFF1B\u8FD9\u91CC\u53EA\u5C55\u793A\u5DF2\u542F\u7528\u7684\u6E20\u9053\u4E0E\u6A21\u578B\u3002</p>
      </div>
      <label class="search-field" for="model-search">
        <i class="fas fa-search" aria-hidden="true"></i>
        <span class="sr-only">\u641C\u7D22\u6E20\u9053\u6216\u6A21\u578B</span>
        <input id="model-search" type="search" placeholder="\u641C\u7D22\u6E20\u9053\u6216\u6A21\u578B" autocomplete="off">
      </label>
    </div>

    <div class="provider-index" id="provider-index">
      ${enabledProviders.length ? enabledProviders.map((provider) => {
    const models = provider.models.filter((model) => model.enabled);
    return `<article class="provider-row" data-search="${escapePageHtml(`${provider.name} ${provider.id} ${models.map((model) => model.id).join(" ")}`.toLowerCase())}">
          <div class="provider-row__identity">
            <span class="provider-row__mark" aria-hidden="true">${escapePageHtml(provider.name.charAt(0).toUpperCase() || "A")}</span>
            <div>
              <h3>${escapePageHtml(provider.name)}</h3>
              <p><span>${(provider.apiType || "openai") === "anthropic" ? "Anthropic" : "OpenAI"} \u517C\u5BB9</span></p>
            </div>
          </div>
          <div class="provider-row__models">
            ${models.length ? models.map((model) => {
      const fullModel = `${provider.id}/${model.alias || model.id}`;
      return `<button class="model-token copy-control" type="button" data-copy="${escapePageHtml(fullModel)}"><code>${escapePageHtml(fullModel)}</code><i class="far fa-copy" aria-hidden="true"></i></button>`;
    }).join("") : '<span class="empty-inline">\u6682\u65E0\u542F\u7528\u6A21\u578B</span>'}
          </div>
          <span class="status-badge status-badge--on"><i aria-hidden="true"></i>\u5DF2\u542F\u7528</span>
        </article>`;
  }).join("") : `<div class="empty-state"><i class="fas fa-cubes" aria-hidden="true"></i><h3>\u5C1A\u65E0\u53EF\u7528\u6A21\u578B</h3><p>\u7BA1\u7406\u5458\u542F\u7528\u6E20\u9053\u548C\u6A21\u578B\u540E\uFF0C\u5B83\u4EEC\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002</p>${isLoggedIn ? '<a class="btn btn-p" href="/admin">\u524D\u5F80\u7BA1\u7406\u63A7\u5236\u53F0</a>' : ""}</div>`}
    </div>
    <div id="search-empty" class="empty-state hd"><i class="fas fa-search" aria-hidden="true"></i><h3>\u6CA1\u6709\u5339\u914D\u7ED3\u679C</h3><p>\u8BF7\u5C1D\u8BD5\u8F93\u5165\u6E20\u9053\u540D\u79F0\u3001ID \u6216\u6A21\u578B\u540D\u79F0\u3002</p></div>
  </section>
</main>

${renderSiteFooter(SITE_CONFIG.title, getPlatformLabel(c.env, c.req.header("host")))}

<script>
(function () {
  var status = document.getElementById('copy-status')
  document.querySelectorAll('.copy-control').forEach(function (button) {
    button.addEventListener('click', async function () {
      var text = button.getAttribute('data-copy') || ''
      var icon = button.querySelector('i')
      var label = button.querySelector('span')
      try {
        await navigator.clipboard.writeText(text)
        button.setAttribute('data-state', 'success')
        if (icon) icon.className = 'fas fa-check c-s'
        if (label) label.textContent = '\u5DF2\u590D\u5236'
        if (status) status.textContent = '\u5DF2\u590D\u5236 ' + text
        window.setTimeout(function () {
          button.removeAttribute('data-state')
          if (icon) icon.className = 'far fa-copy'
          if (label) label.textContent = '\u590D\u5236'
        }, 1800)
      } catch (error) {
        button.setAttribute('data-state', 'error')
        if (status) status.textContent = '\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u6587\u672C\u3002'
      }
    })
  })

  var search = document.getElementById('model-search')
  var rows = Array.from(document.querySelectorAll('.provider-row'))
  var empty = document.getElementById('search-empty')
  if (search) search.addEventListener('input', function () {
    var query = search.value.trim().toLowerCase()
    var visible = 0
    rows.forEach(function (row) {
      var matched = !query || (row.getAttribute('data-search') || '').includes(query)
      row.classList.toggle('hd', !matched)
      if (matched) visible++
    })
    if (empty) empty.classList.toggle('hd', visible > 0 || !query)
  })
})()
</script>
</body></html>`);
}
async function renderLoginPage(c) {
  return c.html(`<!DOCTYPE html><html lang="zh-CN">
${H("\u767B\u5F55")}
<body class="site-page auth-page">
<header class="topbar topbar--auth">
  <div class="shell topbar__inner">
    <a class="brand" href="/" aria-label="AI Gateway \u9996\u9875">
      <span class="brand__mark" aria-hidden="true"><i class="fas fa-cloud"></i></span>
      <span class="brand__name">${SITE_CONFIG.title}</span>
    </a>
    <a href="/" class="btn btn-gh"><i class="fas fa-arrow-left" aria-hidden="true"></i>\u8FD4\u56DE\u9996\u9875</a>
  </div>
</header>

<main class="auth-shell">
  <section class="auth-context" aria-labelledby="auth-context-title">
    <p class="eyebrow"><span aria-hidden="true"></span>CONTROL PANEL ACCESS</p>
    <h1 id="auth-context-title">\u7BA1\u7406\u6E20\u9053\u3001\u6A21\u578B\u548C\u4EE4\u724C\u3002</h1>
  </section>

  <section class="auth-form-wrap" aria-labelledby="login-title">
    <form class="auth-form" id="login-form" novalidate>
      <div class="auth-form__heading">
        <span class="auth-form__icon" aria-hidden="true"><i class="fas fa-lock"></i></span>
        <div><h2 id="login-title">\u7BA1\u7406\u5458\u767B\u5F55</h2><p>\u4F7F\u7528\u90E8\u7F72\u65F6\u914D\u7F6E\u7684\u8D26\u53F7\u7EE7\u7EED\u3002</p></div>
      </div>

      <div id="er" class="al al-e hd" role="alert" aria-live="assertive">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i><span id="em"></span>
      </div>

      <div class="fg">
        <label for="u">\u7528\u6237\u540D</label>
        <div class="input-wrap"><i class="far fa-user" aria-hidden="true"></i><input type="text" id="u" name="username" placeholder="admin" autocomplete="username" aria-required="true" aria-describedby="login-helper"></div>
      </div>
      <div class="fg">
        <label for="p">\u5BC6\u7801</label>
        <div class="input-wrap"><i class="fas fa-key" aria-hidden="true"></i><input type="password" id="p" name="password" placeholder="\u90E8\u7F72\u73AF\u5883\u53D8\u91CF\u4E2D\u7684\u5BC6\u7801" autocomplete="current-password" aria-required="true" aria-describedby="login-helper"><button class="password-toggle" id="password-toggle" type="button" aria-label="\u663E\u793A\u5BC6\u7801"><i class="far fa-eye" aria-hidden="true"></i></button></div>
      </div>
      <p id="login-helper" class="form-helper">\u767B\u5F55\u6210\u529F\u540E\u5C06\u8FDB\u5165\u7BA1\u7406\u63A7\u5236\u53F0\u3002</p>
      <button class="btn btn-p btn-submit" id="login-button" type="submit"><span class="button-label"><i class="fas fa-sign-in-alt" aria-hidden="true"></i>\u767B\u5F55\u7BA1\u7406\u63A7\u5236\u53F0</span><span class="button-loading"><i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i>\u6B63\u5728\u9A8C\u8BC1</span></button>
    </form>
  </section>
</main>

<script>
(function () {
  var form = document.getElementById('login-form')
  var username = document.getElementById('u')
  var password = document.getElementById('p')
  var errorBox = document.getElementById('er')
  var errorMessage = document.getElementById('em')
  var submit = document.getElementById('login-button')
  var toggle = document.getElementById('password-toggle')

  function showError(message) {
    errorMessage.textContent = message
    errorBox.classList.remove('hd')
    username.setAttribute('aria-invalid', 'true')
    password.setAttribute('aria-invalid', 'true')
  }
  function clearError() {
    errorBox.classList.add('hd')
    username.removeAttribute('aria-invalid')
    password.removeAttribute('aria-invalid')
  }

  toggle.addEventListener('click', function () {
    var show = password.type === 'password'
    password.type = show ? 'text' : 'password'
    toggle.setAttribute('aria-label', show ? '\u9690\u85CF\u5BC6\u7801' : '\u663E\u793A\u5BC6\u7801')
    toggle.querySelector('i').className = show ? 'far fa-eye-slash' : 'far fa-eye'
    password.focus({ preventScroll: true })
  })

  form.addEventListener('submit', async function (event) {
    event.preventDefault()
    clearError()
    var u = username.value.trim()
    var p = password.value
    if (!u || !p) {
      showError('\u8BF7\u586B\u5199\u7528\u6237\u540D\u548C\u5BC6\u7801\u540E\u518D\u767B\u5F55\u3002')
      ;(!u ? username : password).focus()
      return
    }
    submit.disabled = true
    submit.setAttribute('data-state', 'loading')
    try {
      var response = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      })
      var data = await response.json()
      if (data.success) {
        submit.setAttribute('data-state', 'success')
        window.location.href = '/admin'
        return
      }
      showError(data.message || '\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u8D26\u53F7\u914D\u7F6E\u3002')
    } catch (error) {
      showError('\u65E0\u6CD5\u8FDE\u63A5\u670D\u52A1\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5\u3002')
    }
    submit.disabled = false
    submit.removeAttribute('data-state')
  })
})()
</script>
</body></html>`);
}
async function renderAdminPage(c) {
  const providers = await getProviders(c.env);
  const proxyKeys = await getProxyKeys(c.env);
  const codexRelay = await getCodexUpstreamRelay(c.env).catch(() => null);
  const codexRelayHost = codexRelay ? codexRelay.url.replace(/^https?:\/\//, "") : "";
  const enabledProvidersCount = providers.filter((provider) => provider.enabled).length;
  const modelsCount = providers.reduce((total, provider) => total + provider.models.length, 0);
  const enabledModelsCount = providers.reduce((total, provider) => total + provider.models.filter((model) => model.enabled).length, 0);
  const enabledProxyKeysCount = proxyKeys.filter((key) => key.enabled).length;
  const agChannels = providers.filter((provider) => (provider.type || "") === "antigravity" && provider.enabled).map((provider) => ({
    id: provider.id,
    name: provider.name,
    accountCount: provider.apiKeys.filter((key) => key.enabled && key.key && key.key.trim()).length
  }));
  const agAccountCount = agChannels.reduce((total, ch) => total + ch.accountCount, 0);
  const storageLabel = storageTypeLabel(c.env);
  return c.html(`<!DOCTYPE html><html lang="zh-CN">
${H("\u7BA1\u7406")}
<body class="site-page admin-page">
<div class="admin-shell">
  <aside class="admin-rail" aria-label="\u63A7\u5236\u53F0\u5BFC\u822A">
    <div class="admin-rail__head">
      <a class="brand admin-rail__brand" href="/">
        <span class="brand__mark" aria-hidden="true"><i class="fas fa-cloud"></i></span>
        <span><strong>${SITE_CONFIG.title}</strong><small>CONTROL PANEL</small></span>
      </a>
    </div>
    <nav class="admin-nav">
      <a class="admin-nav__link is-active" href="#overview"><i class="fas fa-chart-pie" aria-hidden="true"></i><span>\u6982\u89C8</span></a>
      <a class="admin-nav__link" href="#providers"><i class="fas fa-server" aria-hidden="true"></i><span>\u6E20\u9053</span><b>${providers.length}</b></a>
      <a class="admin-nav__link" href="#quota"><i class="fas fa-gauge-high" aria-hidden="true"></i><span>\u989D\u5EA6</span><b>${agAccountCount}</b></a>
      <a class="admin-nav__link" href="#proxy-keys"><i class="fas fa-key" aria-hidden="true"></i><span>\u4EE4\u724C</span><b>${proxyKeys.length}</b></a>
      <a class="admin-nav__link" href="#usage"><i class="fas fa-chart-line" aria-hidden="true"></i><span>\u7528\u91CF</span></a>
      <a class="admin-nav__link" href="#backup"><i class="fas fa-database" aria-hidden="true"></i><span>\u5907\u4EFD</span></a>
    </nav>
    <div class="admin-rail__foot">
      <button class="admin-nav__link rail-toggle" type="button" onclick="toggleRail()" title="\u6536\u7F29\u4FA7\u8FB9\u680F" aria-label="\u6536\u7F29/\u5C55\u5F00\u4FA7\u8FB9\u680F"><i class="fas fa-angles-left" aria-hidden="true"></i><span>\u6536\u7F29\u4FA7\u8FB9\u680F</span></button>
      <a href="/" class="admin-nav__link"><i class="fas fa-arrow-left" aria-hidden="true"></i><span>\u8FD4\u56DE\u9996\u9875</span></a>
      <a href="/admin/logout" class="admin-nav__link"><i class="fas fa-sign-out-alt" aria-hidden="true"></i><span>\u9000\u51FA\u767B\u5F55</span></a>
    </div>
  </aside>

  <div class="admin-main">
    <header class="admin-topbar">
      <a class="brand" href="/"><span class="brand__mark" aria-hidden="true"><i class="fas fa-cloud"></i></span><span class="brand__name">${SITE_CONFIG.title}</span></a>
      <nav aria-label="\u79FB\u52A8\u7AEF\u63A7\u5236\u53F0\u5BFC\u822A"><a href="#overview">\u6982\u89C8</a><a href="#providers">\u6E20\u9053</a><a href="#quota">\u989D\u5EA6</a><a href="#proxy-keys">\u4EE4\u724C</a><a href="#usage">\u7528\u91CF</a><a href="#backup">\u5907\u4EFD</a></nav>
      <a class="icon-btn" href="/admin/logout" aria-label="\u9000\u51FA\u767B\u5F55"><i class="fas fa-sign-out-alt" aria-hidden="true"></i></a>
    </header>

    <main class="admin-content">
      <div id="toast" class="hd toast" role="status" aria-live="polite"></div>

      <section id="overview" class="admin-overview" aria-labelledby="admin-title">
        <div class="admin-heading">
          <div><p class="eyebrow"><span aria-hidden="true"></span>GATEWAY STATUS</p><h1 id="admin-title">\u7BA1\u7406\u63A7\u5236\u53F0</h1><p>\u914D\u7F6E\u6E20\u9053\u3001\u6A21\u578B\u4E0E\u5BA2\u6237\u7AEF\u8BBF\u95EE\u51ED\u636E\u3002\u53D8\u66F4\u5C06\u5199\u5165 ${storageLabel}\u3002</p></div>
          <div class="admin-heading__actions"><a href="/" class="btn btn-s"><i class="fas fa-external-link-alt" aria-hidden="true"></i>\u67E5\u770B\u6A21\u578B\u5217\u8868</a></div>
        </div>
        <div class="admin-metrics" aria-label="\u914D\u7F6E\u7EDF\u8BA1">
          <div onclick="location.hash='#providers'" style="cursor:pointer" title="\u70B9\u51FB\u7BA1\u7406\u6E20\u9053"><span>${providers.length}</span><p>\u6E20\u9053</p><small>${enabledProvidersCount} \u4E2A\u5DF2\u542F\u7528</small></div>
          <div onclick="location.hash='#providers'" style="cursor:pointer" title="\u70B9\u51FB\u7BA1\u7406\u6A21\u578B"><span>${modelsCount}</span><p>\u6A21\u578B</p><small>${enabledModelsCount} \u4E2A\u53EF\u7528</small></div>
          <div onclick="location.hash='#proxy-keys'" style="cursor:pointer" title="\u70B9\u51FB\u7BA1\u7406\u4EE4\u724C"><span>${proxyKeys.length}</span><p>\u4EE4\u724C</p><small>${enabledProxyKeysCount} \u4E2A\u53EF\u7528</small></div>
          <div onclick="location.hash='#usage'" style="cursor:pointer" title="\u70B9\u51FB\u67E5\u770B\u7528\u91CF"><span class="status-dot status-dot--online"><i aria-hidden="true"></i>\u5DF2\u914D\u7F6E</span><p>\u5B58\u50A8</p><small>${storageLabel}</small></div>
        </div>
      </section>

      <section id="providers" class="workspace-section" aria-labelledby="providers-title">
        <div class="section-heading section-heading--admin">
          <div><h2 id="providers-title">\u6E20\u9053</h2><p>\u7BA1\u7406\u4E0A\u6E38\u5730\u5740\u3001\u534F\u8BAE\u3001API Key \u548C\u6A21\u578B\u3002</p></div>
          <button class="btn btn-p" onclick="showAdd()"><i class="fas fa-plus" aria-hidden="true"></i>\u6DFB\u52A0\u6E20\u9053</button>
        </div>

        <div class="af-w">
          <div id="af" class="hd add-form-panel">
            <div class="panel-heading"><div><span class="panel-heading__mark"><i class="fas fa-plus" aria-hidden="true"></i></span><div><h3>\u6DFB\u52A0\u65B0\u6E20\u9053</h3><p>\u5148\u914D\u7F6E\u57FA\u672C\u4FE1\u606F\uFF0C\u518D\u6D4B\u8BD5 Key \u4E0E\u6A21\u578B\u8FDE\u63A5\u3002</p></div></div><button class="icon-btn" type="button" onclick="hideAdd()" aria-label="\u5173\u95ED\u6DFB\u52A0\u8868\u5355"><i class="fas fa-times" aria-hidden="true"></i></button></div>
            <div class="fr">
              <div class="fg"><label for="anm">\u540D\u79F0</label><input type="text" id="anm" placeholder="DeepSeek"></div>
              <div class="fg"><label for="aid">\u6E20\u9053 ID</label><input type="text" id="aid" placeholder="deepseek"><span class="form-helper">\u7528\u4E8E\u6A21\u578B\u524D\u7F00\uFF0C\u521B\u5EFA\u540E\u4E0D\u53EF\u4FEE\u6539\u3002</span></div>
            </div>
            <div class="fg"><label for="aurl">API \u5730\u5740</label><input type="url" id="aurl" placeholder="https://api.deepseek.com"></div>
            <div class="fg" data-hide-ag><label for="amirror">\u955C\u50CF\u5730\u5740</label><textarea id="amirror" rows="3" placeholder="https://opencode.ai.cmliussss.net/zen/v1&#10;\u6BCF\u884C\u4E00\u4E2A, \u7559\u7A7A\u4F7F\u7528 OPENCODE_MIRRORS_URL \u73AF\u5883\u53D8\u91CF"></textarea><span class="form-helper">\u5B98\u65B9\u5730\u5740\u5931\u8D25\u540E\u81EA\u52A8\u6545\u969C\u8F6C\u79FB\u5230\u7684\u955C\u50CF\u5730\u5740\uFF0C\u6BCF\u884C\u4E00\u4E2A URL\u3002</span></div>
            <div class="fg"><label for="apt">\u6E20\u9053\u7C7B\u578B</label><select id="apt" class="select-sm" onchange="onTypeChange(this, 'new')"><option value="openai">OpenAI \u517C\u5BB9</option><option value="anthropic">Anthropic \u517C\u5BB9</option><option value="openai-video">OpenAI \u89C6\u9891</option><option value="agnes-video">Agnes \u5F02\u6B65\u89C6\u9891</option><option value="azure-tts">Azure TTS \u8BED\u97F3</option><option value="antigravity">Antigravity \u53CD\u4EE3</option><option value="claude">Claude OAuth \u53CD\u4EE3</option><option value="codex">ChatGPT (Codex) \u53CD\u4EE3</option><option value="kimi">Kimi OAuth \u53CD\u4EE3</option><option value="grok">Grok OAuth \u53CD\u4EE3</option><option value="qwen">Qwen OAuth \u53CD\u4EE3</option><option value="deepseek">DeepSeek \u53CD\u4EE3</option><option value="vertex">Vertex AI \u53CD\u4EE3</option><option value="devin">Devin \u53CD\u4EE3</option><option value="zai">Z.AI (GLM \u56FD\u9645)</option><option value="codebuddy">CodeBuddy (\u817E\u8BAF) \u53CD\u4EE3</option><option value="cline">Cline \u53CD\u4EE3</option></select><span class="form-helper" id="apt-hint-new">Agnes \u7B49\u805A\u5408\u5E73\u53F0\u5EFA\u8BAE\u9009 OpenAI \u517C\u5BB9, \u89C6\u9891\u6A21\u578B\u81EA\u52A8\u8D70\u5F02\u6B65\u9002\u914D\u3002</span></div>
            <div class="ag-config" id="ag-new" style="display:none"><div class="fg"><label>\u83B7\u53D6 refresh_token</label><button class="btn btn-s" type="button" onclick="antigravityOAuth('new')"><i class="fas fa-key" aria-hidden="true"></i>\u7528 Google \u8D26\u53F7\u6388\u6743</button><span class="form-helper">\u70B9\u5F00\u6388\u6743\uFF1AGoogle \u767B\u5F55\u5E76\u540C\u610F\u540E\u6D4F\u89C8\u5668\u4F1A\u8DF3\u5230 localhost:51121 \u63D0\u793A\u300C\u65E0\u6CD5\u8BBF\u95EE\u300D\uFF08\u6B63\u5E38\uFF09\uFF0C\u628A\u5730\u5740\u680F code= \u540E\u9762\u90A3\u6BB5\u7C98\u56DE\u5F39\u7A97\uFF0C\u7F51\u5173\u81EA\u52A8\u6362\u53D6 refresh_token \u5E76\u586B\u5165\u4E0B\u65B9 API Keys\u3002\u591A\u8D26\u53F7\uFF1A\u4E00\u884C\u4E00\u4E2A refresh_token\uFF1B\u82E5\u67D0\u4E2A\u8D26\u53F7\u9700\u8981\u7528\u522B\u7684\u9879\u76EE ID\uFF0C\u5199\u6210 refresh_token|\u9879\u76EEID\uFF08\u6CA1\u5199 project \u7684\u8D26\u53F7\u7EDF\u4E00\u7528\u6E20\u9053\u7EA7 project\uFF09\u3002</span></div><div class="fg"><label>\u53EF\u7528\u6A21\u578B</label><button class="btn btn-s" type="button" onclick="fetchAgModels('new')"><i class="fas fa-download" aria-hidden="true"></i>\u83B7\u53D6\u6A21\u578B\u5217\u8868</button><span class="form-helper">\u7528 refresh_token \u62C9\u53D6 Antigravity \u53EF\u7528\u6A21\u578B\u540D\uFF0C\u8FFD\u52A0\u5230\u4E0B\u65B9\u6A21\u578B\u5217\u8868\u3002</span></div></div>
            <div class="ag-config" id="ds-new" style="display:none"><div class="fg"><label>\u83B7\u53D6 userToken</label><div class="fc field-row" style="gap:8px;flex-wrap:wrap"><button class="btn btn-p btn-s" type="button" onclick="openDeepseekTokenDialog('new')"><i class="fas fa-key" aria-hidden="true"></i>\u7C98\u8D34 userToken</button><button class="btn btn-s" type="button" onclick="openDeepseekAccountDialog('new')"><i class="fas fa-user-shield" aria-hidden="true"></i>\u8D26\u53F7\u4EE3\u767B\u5F55</button><button class="btn btn-s" type="button" onclick="verifyDeepseek('new')"><i class="fas fa-plug" aria-hidden="true"></i>\u9A8C\u8BC1\u5DF2\u586B\u51ED\u636E</button></div><span class="form-helper">\u4E24\u6761\u8DEF\u4EFB\u9009\uFF1A<b>\u2460 \u7C98\u8D34 userToken</b> \u2014\u2014 \u81EA\u5DF1\u4ECE\u6D4F\u89C8\u5668\u62A0\uFF0C\u7F51\u5173\u4E0D\u7ECF\u624B\u5BC6\u7801\uFF08\u66F4\u5B89\u5168\uFF0C\u4F46\u7EA6 24h \u540E\u8981\u91CD\u8D34\uFF09\uFF1B<b>\u2461 \u8D26\u53F7\u4EE3\u767B\u5F55</b> \u2014\u2014 \u586B\u90AE\u7BB1/\u624B\u673A\u53F7+\u5BC6\u7801\uFF0C\u7F51\u5173\u81EA\u52A8\u6362\u53D6 userToken\uFF0C\u5BC6\u7801 AES-GCM \u52A0\u5BC6\u5B58\u50A8\uFF08\u66F4\u7701\u4E8B\uFF0C\u4F46\u5BC6\u7801\u6258\u7BA1\u5728\u7F51\u5173\uFF09\u3002\u4E24\u79CD\u51ED\u636E\u5F62\u6001\uFF1A<code>sk-</code> \u5B98\u65B9 API Key \u76F4\u8FDE\u3001<code>eyJ</code> \u7F51\u9875 userToken \u8D70\u53CD\u4EE3\uFF08PoW \u7EA6 0.3~0.7s CPU\uFF0C\u9700 Workers Paid\uFF09\u3002</span></div></div>
            <div class="ag-config" id="oa-new" style="display:none"><div class="fg"><label>\u83B7\u53D6\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="oauthChannel('new')"><i class="fas fa-key" aria-hidden="true"></i>\u6388\u6743\u767B\u5F55\u83B7\u53D6 refresh_token</button><span class="form-helper">Claude/ChatGPT \u8DF3\u8F6C\u5B98\u65B9\u6388\u6743\u9875\uFF08\u56DE\u8C03\u5230 localhost \u5C5E\u6B63\u5E38\uFF0C\u590D\u5236\u5730\u5740\u680F code\uFF09\uFF1BKimi/Grok/Cline \u5F39\u51FA\u8BBE\u5907\u7801\u9A8C\u8BC1\u9875\u5E76\u81EA\u52A8\u7B49\u5F85\u6388\u6743\uFF1BCodeBuddy \u6253\u5F00\u6240\u9009\u533A\u57DF(\u56FD\u5185\u7248/\u56FD\u9645\u7248)\u7684\u767B\u5F55\u9875\uFF0C\u767B\u5F55\u5B8C\u6210\u540E\u7F51\u5173\u81EA\u52A8\u8F6E\u8BE2\u6362\u53D6\u51ED\u636E\u3002</span></div><div class="fg"><label>\u53EF\u7528\u6A21\u578B</label><button class="btn btn-s" type="button" onclick="fetchOAuthModels('new')"><i class="fas fa-download" aria-hidden="true"></i>\u83B7\u53D6\u6A21\u578B\u5217\u8868</button><span class="form-helper">Claude/Kimi/CodeBuddy \u652F\u6301\u81EA\u52A8\u62C9\u53D6\u6A21\u578B\uFF1BCodex/Grok \u8BF7\u624B\u52A8\u586B\u5199\uFF08\u5982 gpt-5.5\u3001grok-4.6\uFF09\u3002</span></div></div>
            <div class="cb-config" id="cb-new" style="display:none"><div class="fg"><label for="cbr-new">\u7248\u672C / \u533A\u57DF</label><select id="cbr-new" class="select-sm" onchange="cbRegionChange('new')"><option value="cn">\u56FD\u5185\u7248 \xB7 copilot.tencent.com</option><option value="global">\u56FD\u9645\u7248 \xB7 workbuddy.ai</option></select><span class="form-helper">\u56FD\u5185\u7248\u4E0E\u56FD\u9645\u7248\u662F\u4E24\u5957\u4E92\u76F8\u72EC\u7ACB\u7684\u8D26\u53F7\u4F53\u7CFB\uFF0C\u51ED\u636E\u4E0D\u53EF\u6DF7\u7528\uFF1B\u5207\u6362\u540E\u4E0A\u65B9\u300CAPI \u5730\u5740\u300D\u4F1A\u81EA\u52A8\u6539\u6210\u5BF9\u5E94\u57DF\u540D\uFF0C\u6388\u6743\u4E0E\u8F6C\u53D1\u90FD\u6309\u6B64\u533A\u57DF\u8D70\u3002</span></div><div class="fg"><label>\u8D26\u53F7\u72B6\u6001</label><button class="btn btn-s" type="button" onclick="codebuddyStatus('new')"><i class="fas fa-coins" aria-hidden="true"></i>\u67E5\u8BE2\u79EF\u5206/\u5957\u9910</button><button class="btn btn-s" type="button" style="margin-left:6px" onclick="codebuddyCheckin('new')"><i class="fas fa-calendar-check" aria-hidden="true"></i>\u7B7E\u5230</button><span class="form-helper">\u300C\u67E5\u8BE2\u79EF\u5206/\u5957\u9910\u300D\u8BFB\u53D6\u5269\u4F59\u79EF\u5206\u4E0E\u5957\u9910\u660E\u7EC6\uFF1B\u300C\u7B7E\u5230\u300D\u6267\u884C\u6BCF\u65E5\u7B7E\u5230\uFF08\u91CD\u590D\u7B7E\u5230\u4E0A\u6E38\u4F1A\u8FD4\u56DE\u300C\u4ECA\u65E5\u5DF2\u7B7E\u5230\u300D\uFF0C\u6309\u6210\u529F\u5904\u7406\uFF09\u3002\u4E24\u8005\u90FD\u53D6\u8BE5\u6E20\u9053\u7B2C\u4E00\u4E2A\u542F\u7528\u51ED\u636E\uFF0C\u9700\u5148\u5728\u4E0B\u65B9 API Keys \u586B\u5165 refresh_token\uFF0C\u6216\u70B9\u4E0A\u65B9\u300C\u6388\u6743\u767B\u5F55\u300D\u81EA\u52A8\u83B7\u53D6\u3002</span></div><div class="mt-1" id="cbst-new" aria-live="polite"></div></div>
            <div class="tts-config" id="tts-new" style="display:none"><fieldset class="form-group"><legend>Azure TTS \u97F3\u8272\u914D\u7F6E\uFF08\u8BF7\u6C42\u4F53\u53EF\u4E34\u65F6\u8986\u76D6\uFF09</legend><div class="fr"><div class="fg"><label>\u97F3\u8272 Voice</label><div class="tts-voice-row"><select id="av" class="select-sm"><option value="">\u81EA\u5B9A\u4E49\u2026</option>${AZURE_VOICE_OPTIONS}</select><button class="btn btn-s" type="button" onclick="previewTts('new')" title="\u8BD5\u542C\u5F53\u524D\u97F3\u8272"><i class="fas fa-play" aria-hidden="true"></i>\u8BD5\u542C</button></div></div><div class="fg"><label>\u8BED\u901F Rate</label><input type="text" id="ar" value="+0%" placeholder="+0%"></div></div><div class="fr"><div class="fg"><label>\u97F3\u91CF Volume</label><input type="text" id="avol" value="+0%" placeholder="+0%"></div><div class="fg"><label>\u97F3\u8C03 Pitch</label><input type="text" id="ap" value="+0Hz" placeholder="+0Hz"></div></div><div class="tts-preview" id="ttp-new"></div><button class="btn btn-s" type="button" onclick="addAllTtsModels('new')"><i class="fas fa-microphone" aria-hidden="true"></i>\u6DFB\u52A0\u5168\u90E8\u97F3\u8272\u4E3A\u6A21\u578B</button></fieldset></div>
            <fieldset class="form-group"><legend>\u4E0A\u6E38 API Keys</legend><div id="akeys"><div class="fc mb-4 field-row"><input type="text" placeholder="sk-xxx" class="fx1 aki" aria-label="\u4E0A\u6E38 API Key"><label class="tg" title="\u542F\u7528 Key"><input type="checkbox" checked class="ake" aria-label="\u542F\u7528 Key"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236 Key" aria-label="\u590D\u5236 Key"><i class="far fa-copy" aria-hidden="true"></i></button><button class="icon-btn" onclick="testNewAKey(this)" title="\u6D4B\u8BD5 Key" aria-label="\u6D4B\u8BD5 Key"><i class="fas fa-plug" aria-hidden="true"></i></button><button class="icon-btn" onclick="this.parentElement.remove()" title="\u79FB\u9664 Key" aria-label="\u79FB\u9664 Key"><i class="fas fa-times" aria-hidden="true"></i></button></div></div><div class="fc" style="gap:8px;flex-wrap:wrap"><button class="btn btn-s" onclick="addAKeyRow()"><i class="fas fa-plus" aria-hidden="true"></i>\u6DFB\u52A0 Key</button><button class="btn btn-s" onclick="batchAddKeys()"><i class="fas fa-list" aria-hidden="true"></i>\u6279\u91CF\u6DFB\u52A0</button><button class="btn btn-s" onclick="batchTestKeys()"><i class="fas fa-plug" aria-hidden="true"></i>\u6279\u91CF\u6D4B\u8BD5</button></div></fieldset>
            <aside id="amc" class="hd mdl-list-panel"><div class="panel-heading"><div><span class="panel-heading__mark"><i class="fas fa-cube" aria-hidden="true"></i></span><div><h3>\u53EF\u7528\u6A21\u578B</h3><p>\u70B9\u51FB\u201C+\u201D\u6DFB\u52A0\u5230\u914D\u7F6E\u3002</p></div></div><button class="icon-btn" type="button" onclick="hideMdlPanel('amc')" title="\u5173\u95ED\u53EF\u7528\u6A21\u578B" aria-label="\u5173\u95ED\u53EF\u7528\u6A21\u578B"><i class="fas fa-times" aria-hidden="true"></i></button></div><div id="amcl"></div></aside>
            <div class="fc" data-hide-ag style="gap:8px;margin-block-end:var(--space-sm)"><button class="btn btn-s" type="button" onclick="fetchNewModels(true)"><i class="fas fa-gift" aria-hidden="true"></i>\u83B7\u53D6\u514D\u8D39\u6A21\u578B</button><button class="btn btn-s" type="button" onclick="fetchNewModels(false)"><i class="fas fa-download" aria-hidden="true"></i>\u83B7\u53D6\u5168\u90E8\u6A21\u578B</button></div>
            <fieldset class="form-group"><legend>\u6A21\u578B ID</legend><div id="amodels"><div class="fc mb-4 field-row"><input type="text" placeholder="deepseek-chat" class="fx1 ami" aria-label="\u6A21\u578B ID"><input type="text" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" class="fx1 amal" aria-label="\u5BF9\u5916\u540D" title="\u5BF9\u5916\u663E\u793A\u540D, \u7559\u7A7A\u81EA\u52A8\u53BB:free\u540E\u7F00"><label class="tg" title="\u542F\u7528\u6A21\u578B"><input type="checkbox" checked class="ame" aria-label="\u542F\u7528\u6A21\u578B"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236\u6A21\u578B ID" aria-label="\u590D\u5236\u6A21\u578B ID"><i class="far fa-copy" aria-hidden="true"></i></button><button class="icon-btn" onclick="testNewMdl(this)" title="\u6D4B\u8BD5\u6A21\u578B" aria-label="\u6D4B\u8BD5\u6A21\u578B"><i class="fas fa-plug" aria-hidden="true"></i></button><button class="icon-btn" onclick="this.parentElement.remove()" title="\u79FB\u9664\u6A21\u578B" aria-label="\u79FB\u9664\u6A21\u578B"><i class="fas fa-times" aria-hidden="true"></i></button></div></div><button class="btn btn-s" onclick="addMdlRow()"><i class="fas fa-plus" aria-hidden="true"></i>\u6DFB\u52A0\u6A21\u578B</button></fieldset>
            <div class="panel-actions"><label class="switch-label"><span>\u521B\u5EFA\u540E\u7ACB\u5373\u542F\u7528</span><span class="tg"><input type="checkbox" checked id="aen"><span class="sl"></span></span></label><div><button class="btn btn-s" onclick="hideAdd()">\u53D6\u6D88</button><button class="btn btn-p" onclick="createProv()"><i class="fas fa-check" aria-hidden="true"></i>\u521B\u5EFA\u6E20\u9053</button></div></div>
            <div id="atestR" class="mt-1" aria-live="polite"></div>
            <div class="vx-config" id="vx-new" style="display:none"><div class="fg"><label>\u670D\u52A1\u8D26\u53F7 JSON</label><textarea id="vxs" rows="4" class="fx1" placeholder='{"type":"service_account","project_id":"my-project","private_key":"-----BEGIN PRIVATE KEY-----
...","client_email":"svc@my-project.iam.gserviceaccount.com"}'></textarea><span class="form-helper">GCP \u63A7\u5236\u53F0 \u2192 IAM \u4E0E\u7BA1\u7406 \u2192 \u670D\u52A1\u8D26\u53F7 \u2192 \u5BC6\u94A5 \u2192 \u65B0\u5EFA JSON \u5BC6\u94A5\uFF0C\u6574\u6BB5\u7C98\u8D34\uFF08\u56DE\u8F66\u6362\u884C\u6CA1\u95EE\u9898\uFF09\uFF1B\u591A\u4E2A\u8D26\u53F7\u4E4B\u95F4\u7A7A\u4E00\u884C\u5373\u8F6E\u6D41\u4F7F\u7528\u3002Express \u6A21\u5F0F\u7684 API Key \u5728\u901A\u7528\u7AEF\u70B9\u4F1A\u88AB Google \u62D2\u7EDD\uFF0C\u5EFA\u8BAE\u7528\u670D\u52A1\u8D26\u53F7\u3002</span></div><div class="fr"><div class="fg"><label>\u533A\u57DF Location</label><input type="text" id="vxl" placeholder="us-central1"></div><div class="fg"><label>\u6821\u9A8C\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="verifyVertex('new')"><i class="fas fa-plug" aria-hidden="true"></i>\u9A8C\u8BC1</button></div></div></div><div class="dv-config" id="dv-new" style="display:none"><div class="fg"><label>\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="devinOAuth('new')"><i class="fas fa-key" aria-hidden="true"></i>\u7528 Devin \u8D26\u53F7\u6388\u6743</button><span class="form-helper">\u70B9\u5F00\u6388\u6743\u9875\u540E\u7528 Devin \u8D26\u53F7\u767B\u5F55\uFF0C\u9875\u9762\u4F1A\u76F4\u63A5\u7ED9\u51FA\u6388\u6743\u7801\uFF0C\u590D\u5236\u56DE\u6765\u7C98\u8D34\u5373\u53EF\u81EA\u52A8\u586B\u5165\u4E0B\u65B9\u51ED\u636E\uFF1B\u4E5F\u53EF\u624B\u52A8\u586B\u5DF2\u6709\u7684 session token\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u591A\u4E2A\u51ED\u636E\u8F6E\u6D41\u4F7F\u7528\uFF09\u3002</span></div><div class="fg"><label>Session Token</label><textarea id="dvt" rows="3" class="fx1" placeholder="devin-session-token$...\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u53EF\u591A\u8D26\u53F7\u8F6E\u6362\uFF09"></textarea><span class="form-helper">\u4FDD\u5B58\u65F6\u4EE5\u672C\u6846\u5185\u5BB9\u4F5C\u4E3A\u6E20\u9053\u51ED\u636E\uFF1B\u591A\u4E2A\u4E4B\u95F4\u6362\u884C\u5206\u9694\u3002</span></div><div class="fg"><label>\u6821\u9A8C\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="verifyDevin('new')"><i class="fas fa-plug" aria-hidden="true"></i>\u9A8C\u8BC1</button></div></div>
            
            
        </div>

        <div class="gp provider-list" id="plist">
          ${providers.length ? providers.map((p) => `
          <article class="pi" data-id="${escapePageHtml(p.id)}">
            <div class="ps" onclick="tog('${p.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();tog('${p.id}')}" aria-controls="dt-${escapePageHtml(p.id)}">
              <div class="l"><i class="fas fa-chevron-right provider-chevron" aria-hidden="true" id="ch-${escapePageHtml(p.id)}"></i><span class="provider-avatar" aria-hidden="true">${escapePageHtml(p.name.charAt(0).toUpperCase() || "A")}</span><div><h3>${escapePageHtml(p.name)}</h3><div class="pu"><code>${escapePageHtml(p.id)}</code><span>${p.type === "antigravity" ? "Antigravity" : p.type === "claude" ? "Claude" : p.type === "codex" ? "Codex" : p.type === "kimi" ? "Kimi" : p.type === "grok" ? "Grok" : p.type === "qwen" ? "Qwen" : p.type === "deepseek" ? "DeepSeek" : p.type === "vertex" ? "Vertex" : p.type === "devin" ? "Devin" : p.type === "codebuddy" ? "CodeBuddy" : p.type === "cline" ? "Cline" : p.type === "zai" ? "Z.AI" : (p.apiType || "openai") === "anthropic" ? "Anthropic" : "OpenAI"}</span><span>${p.apiKeys.length} Keys</span><span>${p.models.length} \u6A21\u578B</span></div></div></div>
              <div class="fc fx-s0" onclick="event.stopPropagation()"><label class="tg"><input type="checkbox" ${p.enabled ? "checked" : ""} id="en-${escapePageHtml(p.id)}" onchange="togglePb('${p.id}',this.checked)" aria-label="\u542F\u7528 ${escapePageHtml(p.name)}"><span class="sl"></span></label><span class="bd ${p.enabled ? "bd-on" : "bd-off"}">${p.enabled ? "\u5DF2\u542F\u7528" : "\u672A\u542F\u7528"}</span>${(p.type || "") === "codex" && codexRelayHost ? `<span class="bd bd-info" title="\u8BF7\u6C42\u7ECF ${escapePageHtml(codexRelayHost)} \u4E2D\u7EE7\u8F6C\u53D1\uFF0C\u672A\u76F4\u8FDE chatgpt.com">\u7ECF\u4E2D\u7EE7</span>` : ""}</div>
            </div>
            <div class="pd" id="dt-${escapePageHtml(p.id)}">
              <div class="detail-heading"><div><h3>\u7F16\u8F91 ${escapePageHtml(p.name)}</h3><p>\u4FDD\u5B58\u540E\uFF0C\u65B0\u914D\u7F6E\u4F1A\u7528\u4E8E\u540E\u7EED\u8F6C\u53D1\u8BF7\u6C42\u3002${(p.type || "") === "codex" && codexRelayHost ? `\u8BE5\u6E20\u9053\u7ECF <code>${escapePageHtml(codexRelayHost)}</code> \u4E2D\u7EE7\u8F6C\u53D1\uFF08\u672C\u673A\u51FA\u53E3\u65E0\u6CD5\u76F4\u8FDE chatgpt.com\uFF09\u3002` : ""}</p></div><span class="protocol-chip">${p.type === "antigravity" ? "ANTIGRAVITY" : p.type === "claude" ? "CLAUDE" : p.type === "codex" ? "CODEX" : p.type === "kimi" ? "KIMI" : p.type === "grok" ? "GROK" : p.type === "qwen" ? "QWEN" : p.type === "deepseek" ? "DEEPSEEK" : p.type === "vertex" ? "VERTEX" : p.type === "devin" ? "DEVIN" : p.type === "codebuddy" ? "CODEBUDDY" : p.type === "cline" ? "CLINE" : p.type === "zai" ? "Z.AI" : (p.apiType || "openai") === "anthropic" ? "ANTHROPIC" : "OPENAI"}</span></div>
              <div class="fr"><div class="fg"><label>\u540D\u79F0</label><input type="text" id="nm-${escapePageHtml(p.id)}" value="${escapePageHtml(p.name)}"></div><div class="fg"><label>ID</label><input type="text" id="pid-${escapePageHtml(p.id)}" value="${escapePageHtml(p.id)}" title="\u6E20\u9053\u552F\u4E00\u6807\u8BC6, \u4FEE\u6539\u540E\u65E7 ID \u5931\u6548"></div></div>
              <div class="fg"><label>API \u5730\u5740</label><input type="url" id="url-${escapePageHtml(p.id)}" value="${escapePageHtml(p.baseUrl)}" ${(p.type || "openai") === "azure-tts" ? 'disabled placeholder="Azure TTS \u4E3A\u5185\u7F6E\u670D\u52A1\uFF0C\u65E0\u9700 API \u5730\u5740"' : ""}></div>
              <div class="fr"><div class="fg"><label>\u6E20\u9053\u7C7B\u578B</label><select id="pt-${escapePageHtml(p.id)}" class="select-sm" onchange="onTypeChange(this, '${escapePageHtml(p.id)}')"><option value="openai" ${(p.type || "openai") === "openai" ? "selected" : ""}>OpenAI \u517C\u5BB9</option><option value="anthropic" ${p.type === "anthropic" ? "selected" : ""}>Anthropic \u517C\u5BB9</option><option value="openai-video" ${p.type === "openai-video" ? "selected" : ""}>OpenAI \u89C6\u9891</option><option value="agnes-video" ${p.type === "agnes-video" ? "selected" : ""}>Agnes \u5F02\u6B65\u89C6\u9891</option><option value="azure-tts" ${p.type === "azure-tts" ? "selected" : ""}>Azure TTS \u8BED\u97F3</option><option value="antigravity" ${p.type === "antigravity" ? "selected" : ""}>Antigravity \u53CD\u4EE3</option><option value="claude" ${p.type === "claude" ? "selected" : ""}>Claude OAuth \u53CD\u4EE3</option><option value="codex" ${p.type === "codex" ? "selected" : ""}>ChatGPT (Codex) \u53CD\u4EE3</option><option value="kimi" ${p.type === "kimi" ? "selected" : ""}>Kimi OAuth \u53CD\u4EE3</option><option value="grok" ${p.type === "grok" ? "selected" : ""}>Grok OAuth \u53CD\u4EE3</option><option value="qwen" ${p.type === "qwen" ? "selected" : ""}>Qwen OAuth \u53CD\u4EE3</option><option value="deepseek" ${p.type === "deepseek" ? "selected" : ""}>DeepSeek \u53CD\u4EE3</option><option value="vertex" ${p.type === "vertex" ? "selected" : ""}>Vertex AI \u53CD\u4EE3</option><option value="devin" ${p.type === "devin" ? "selected" : ""}>Devin \u53CD\u4EE3</option><option value="zai" ${p.type === "zai" ? "selected" : ""}>Z.AI (GLM \u56FD\u9645)</option><option value="codebuddy" ${p.type === "codebuddy" ? "selected" : ""}>CodeBuddy (\u817E\u8BAF) \u53CD\u4EE3</option><option value="cline" ${p.type === "cline" ? "selected" : ""}>Cline \u53CD\u4EE3</option></select></div></div>
              <div class="ag-config" id="ag-${escapePageHtml(p.id)}" ${p.type === "antigravity" ? "" : 'style="display:none"'}><div class="fg"><label>\u83B7\u53D6 refresh_token</label><button class="btn btn-s" type="button" onclick="antigravityOAuth('${escapePageHtml(p.id)}')"><i class="fas fa-key" aria-hidden="true"></i>\u7528 Google \u8D26\u53F7\u6388\u6743</button><span class="form-helper">\u6388\u6743\u540E\u6D4F\u89C8\u5668\u8DF3\u8F6C localhost:51121 \u663E\u793A\u300C\u65E0\u6CD5\u8BBF\u95EE\u300D\u5C5E\u6B63\u5E38\uFF0C\u590D\u5236\u5730\u5740\u680F code= \u540E\u9762\u90A3\u4E00\u6BB5\u56DE\u6765\uFF0Crefresh_token \u4F1A\u81EA\u52A8\u8FFD\u52A0\u5230\u4E0B\u65B9 API Keys\u3002\u591A\u8D26\u53F7\uFF1A\u4E00\u884C\u4E00\u4E2A refresh_token\uFF1B\u82E5\u67D0\u4E2A\u8D26\u53F7\u9700\u8981\u7528\u522B\u7684\u9879\u76EE ID\uFF0C\u5199\u6210 refresh_token|\u9879\u76EEID\uFF08\u6CA1\u5199 project \u7684\u8D26\u53F7\u7EDF\u4E00\u7528\u6E20\u9053\u7EA7 project\uFF09\u3002</span></div><div class="fg"><label>\u53EF\u7528\u6A21\u578B</label><button class="btn btn-s" type="button" onclick="fetchAgModels('${escapePageHtml(p.id)}')"><i class="fas fa-download" aria-hidden="true"></i>\u83B7\u53D6\u6A21\u578B\u5217\u8868</button></div></div><div class="vx-config" id="vx-${escapePageHtml(p.id)}" style="display:none"><div class="fg"><label>\u670D\u52A1\u8D26\u53F7 JSON</label><textarea id="vxs-${escapePageHtml(p.id)}" rows="4" class="fx1">${escapePageHtml((p.apiKeys || []).map((k) => k.key).join("\n\n"))}</textarea><span class="form-helper">\u4FDD\u5B58\u65F6\u4EE5\u672C\u6846\u5185\u5BB9\u4E3A\u51C6\uFF08\u591A\u4E2A\u8D26\u53F7\u7A7A\u884C\u5206\u9694\uFF09\uFF1B\u4E5F\u53EF\u586B Express API Key\u3002</span></div><div class="fr"><div class="fg"><label>\u533A\u57DF Location</label><input type="text" id="vxl-${escapePageHtml(p.id)}" value="${escapePageHtml(p.location || "")}" placeholder="us-central1"></div><div class="fg"><label>\u6821\u9A8C\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="verifyVertex('${escapePageHtml(p.id)}')"><i class="fas fa-plug" aria-hidden="true"></i>\u9A8C\u8BC1</button></div></div></div><div class="dv-config" id="dv-${escapePageHtml(p.id)}" style="display:none"><div class="fg"><label>\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="devinOAuth('${escapePageHtml(p.id)}')"><i class="fas fa-key" aria-hidden="true"></i>\u7528 Devin \u8D26\u53F7\u6388\u6743</button><span class="form-helper">\u6388\u6743\u6210\u529F\u4F1A\u81EA\u52A8\u628A session token \u8FFD\u52A0\u5230\u4E0B\u65B9\u51ED\u636E\u6846\u3002</span></div><div class="fg"><label>Session Token</label><textarea id="dvt-${escapePageHtml(p.id)}" rows="3" class="fx1">${escapePageHtml((p.apiKeys || []).map((k) => k.key).join("\n"))}</textarea><span class="form-helper">\u4FDD\u5B58\u65F6\u4EE5\u672C\u6846\u5185\u5BB9\u4E3A\u51C6\uFF08\u6BCF\u884C\u4E00\u4E2A session token\uFF09\u3002</span></div><div class="fg"><label>\u6821\u9A8C\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="verifyDevin('${escapePageHtml(p.id)}')"><i class="fas fa-plug" aria-hidden="true"></i>\u9A8C\u8BC1</button></div></div>
            
            
              <div class="ag-config" id="ds-${escapePageHtml(p.id)}" ${p.type === "deepseek" ? "" : 'style="display:none"'}><div class="fg"><label>\u83B7\u53D6 userToken</label><div class="fc field-row" style="gap:8px;flex-wrap:wrap"><button class="btn btn-p btn-s" type="button" onclick="openDeepseekTokenDialog('${escapePageHtml(p.id)}')"><i class="fas fa-key" aria-hidden="true"></i>\u7C98\u8D34 userToken</button><button class="btn btn-s" type="button" onclick="openDeepseekAccountDialog('${escapePageHtml(p.id)}')"><i class="fas fa-user-shield" aria-hidden="true"></i>\u8D26\u53F7\u4EE3\u767B\u5F55</button><button class="btn btn-s" type="button" onclick="verifyDeepseek('${escapePageHtml(p.id)}')"><i class="fas fa-plug" aria-hidden="true"></i>\u9A8C\u8BC1\u5DF2\u586B\u51ED\u636E</button></div><span class="form-helper">\u4E24\u6761\u8DEF\u4EFB\u9009\uFF1A<b>\u2460 \u7C98\u8D34 userToken</b> \u2014\u2014 \u81EA\u5DF1\u4ECE\u6D4F\u89C8\u5668\u62A0\uFF0C\u7F51\u5173\u4E0D\u7ECF\u624B\u5BC6\u7801\uFF1B<b>\u2461 \u8D26\u53F7\u4EE3\u767B\u5F55</b> \u2014\u2014 \u586B\u90AE\u7BB1/\u624B\u673A\u53F7+\u5BC6\u7801\uFF0C\u7F51\u5173\u81EA\u52A8\u6362\u53D6 userToken\uFF0C\u5BC6\u7801\u52A0\u5BC6\u5B58\u50A8\u3002${p.dsAccount && (p.dsAccount.email || p.dsAccount.mobile) ? '<br><b class="c-s">\u5F53\u524D\u5DF2\u6258\u7BA1\u8D26\u53F7\uFF1A' + escapePageHtml(p.dsAccount.mobile || p.dsAccount.email || "") + (p.dsAccount.hasPassword ? "\uFF08\u542B\u5BC6\u7801\uFF09" : "\uFF08\u65E0\u5BC6\u7801\uFF09") + (p.dsAccount.tokenSet ? " \xB7 \u6301\u6709 token " + escapePageHtml(p.dsAccount.tokenPreview || "") : "") + (p.dsAccount.lastLoginAt ? " \xB7 \u4E0A\u6B21\u767B\u5F55 " + escapePageHtml(String(p.dsAccount.lastLoginAt).slice(0, 16).replace("T", " ")) : "") + "</b>" : ""}</span><script type="application/json" id="dsacc-${escapePageHtml(p.id)}">${JSON.stringify(p.dsAccount || {}).replace(/</g, "\\u003c")}</script></div></div>
              <div class="ag-config" id="oa-${escapePageHtml(p.id)}" ${["claude", "codex", "kimi", "grok", "qwen", "codebuddy", "cline"].includes(p.type || "") ? "" : 'style="display:none"'}><div class="fg"><label>\u83B7\u53D6\u51ED\u636E</label><button class="btn btn-s" type="button" onclick="oauthChannel('${escapePageHtml(p.id)}')"><i class="fas fa-key" aria-hidden="true"></i>\u6388\u6743\u767B\u5F55\u83B7\u53D6 refresh_token</button><span class="form-helper">Claude/ChatGPT \u8DF3\u8F6C\u5B98\u65B9\u6388\u6743\u9875\uFF08\u56DE\u8C03\u5230 localhost \u5C5E\u6B63\u5E38\uFF0C\u590D\u5236\u5730\u5740\u680F code\uFF09\uFF1BKimi/Grok/Cline \u5F39\u51FA\u8BBE\u5907\u7801\u9A8C\u8BC1\u9875\u5E76\u81EA\u52A8\u7B49\u5F85\u6388\u6743\u3002refresh_token \u4F1A\u8FFD\u52A0\u5230\u4E0B\u65B9 API Keys\u3002</span></div><div class="fg"><label>\u53EF\u7528\u6A21\u578B</label><button class="btn btn-s" type="button" onclick="fetchOAuthModels('${escapePageHtml(p.id)}')"><i class="fas fa-download" aria-hidden="true"></i>\u83B7\u53D6\u6A21\u578B\u5217\u8868</button></div></div>
              <div class="cb-config" id="cb-${escapePageHtml(p.id)}" ${p.type === "codebuddy" ? "" : 'style="display:none"'}><div class="fg"><label for="cbr-${escapePageHtml(p.id)}">\u7248\u672C / \u533A\u57DF</label><select id="cbr-${escapePageHtml(p.id)}" class="select-sm" onchange="cbRegionChange('${escapePageHtml(p.id)}')"><option value="cn" ${cbRealmOf(p) === "cn" ? "selected" : ""}>\u56FD\u5185\u7248 \xB7 copilot.tencent.com</option><option value="global" ${cbRealmOf(p) === "global" ? "selected" : ""}>\u56FD\u9645\u7248 \xB7 workbuddy.ai</option></select><span class="form-helper">\u56FD\u5185\u7248\u4E0E\u56FD\u9645\u7248\u662F\u4E24\u5957\u4E92\u76F8\u72EC\u7ACB\u7684\u8D26\u53F7\u4F53\u7CFB\uFF0C\u51ED\u636E\u4E0D\u53EF\u6DF7\u7528\uFF1B\u5207\u6362\u540E\u4E0A\u65B9\u300CAPI \u5730\u5740\u300D\u4F1A\u81EA\u52A8\u6539\u6210\u5BF9\u5E94\u57DF\u540D\u3002\u82E5\u5DF2\u6709\u51ED\u636E\u5C5E\u4E8E\u53E6\u4E00\u533A\u57DF\uFF0C\u9700\u91CD\u65B0\u6388\u6743\u3002</span></div><div class="fg"><label>\u8D26\u53F7\u72B6\u6001</label><button class="btn btn-s" type="button" onclick="codebuddyStatus('${escapePageHtml(p.id)}')"><i class="fas fa-coins" aria-hidden="true"></i>\u67E5\u8BE2\u79EF\u5206/\u5957\u9910</button><button class="btn btn-s" type="button" style="margin-left:6px" onclick="codebuddyCheckin('${escapePageHtml(p.id)}')"><i class="fas fa-calendar-check" aria-hidden="true"></i>\u7B7E\u5230</button><span class="form-helper">\u300C\u67E5\u8BE2\u79EF\u5206/\u5957\u9910\u300D\u8BFB\u53D6\u5269\u4F59\u79EF\u5206\u4E0E\u5957\u9910\u660E\u7EC6\uFF1B\u300C\u7B7E\u5230\u300D\u6267\u884C\u6BCF\u65E5\u7B7E\u5230\uFF08\u91CD\u590D\u7B7E\u5230\u6309\u300C\u4ECA\u65E5\u5DF2\u7B7E\u5230\u300D\u5904\u7406\uFF0C\u4E0D\u7B97\u5931\u8D25\uFF09\u3002\u4E24\u8005\u90FD\u53D6\u8BE5\u6E20\u9053\u7B2C\u4E00\u4E2A\u542F\u7528\u7684\u51ED\u636E\u3002</span></div><div class="mt-1" id="cbst-${escapePageHtml(p.id)}" aria-live="polite"></div></div>
              <div class="tts-config" id="tts-${escapePageHtml(p.id)}" ${(p.type || "openai") === "azure-tts" ? "" : 'style="display:none"'}><fieldset class="form-group"><legend>Azure TTS \u97F3\u8272\u914D\u7F6E\uFF08\u8BF7\u6C42\u4F53\u53EF\u4E34\u65F6\u8986\u76D6\uFF09</legend><div class="fr"><div class="fg"><label>\u97F3\u8272 Voice</label><div class="tts-voice-row"><select id="pv-${escapePageHtml(p.id)}" class="select-sm"><option value="">\u81EA\u5B9A\u4E49\u2026</option>${azureVoiceOptions(p.voice || "zh-CN-XiaoxiaoNeural")}</select><button class="btn btn-s" type="button" onclick="previewTts('${escapePageHtml(p.id)}')" title="\u8BD5\u542C\u5F53\u524D\u97F3\u8272"><i class="fas fa-play" aria-hidden="true"></i>\u8BD5\u542C</button></div></div><div class="fg"><label>\u8BED\u901F Rate</label><input type="text" id="pr-${escapePageHtml(p.id)}" value="${escapePageHtml(p.rate || "+0%")}" placeholder="+0%"></div></div><div class="fr"><div class="fg"><label>\u97F3\u91CF Volume</label><input type="text" id="pvol-${escapePageHtml(p.id)}" value="${escapePageHtml(p.volume || "+0%")}" placeholder="+0%"></div><div class="fg"><label>\u97F3\u8C03 Pitch</label><input type="text" id="pp-${escapePageHtml(p.id)}" value="${escapePageHtml(p.pitch || "+0Hz")}" placeholder="+0Hz"></div></div><div class="tts-preview" id="ttp-${escapePageHtml(p.id)}"></div><div class="fc" style="gap:8px;flex-wrap:wrap"><button class="btn btn-s" type="button" onclick="addTtsModel('${escapePageHtml(p.id)}')" title="\u628A\u5F53\u524D\u9009\u4E2D\u7684\u97F3\u8272\u6DFB\u52A0\u5230\u6A21\u578B\u5217\u8868"><i class="fas fa-plus" aria-hidden="true"></i>\u6DFB\u52A0\u6A21\u578B</button><button class="btn btn-s" type="button" onclick="addAllTtsModels('${escapePageHtml(p.id)}')"><i class="fas fa-microphone" aria-hidden="true"></i>\u6DFB\u52A0\u5168\u90E8\u97F3\u8272\u4E3A\u6A21\u578B</button></div></fieldset></div>
              <div class="fg" data-hide-ag ${p.type === "antigravity" ? 'style="display:none"' : ""}><label>\u955C\u50CF\u5730\u5740</label><textarea id="mir-${escapePageHtml(p.id)}" rows="3" placeholder="\u6BCF\u884C\u4E00\u4E2A, \u7559\u7A7A\u4F7F\u7528 OPENCODE_MIRRORS_URL \u73AF\u5883\u53D8\u91CF">${(p.mirrorUrls || []).map(escapePageHtml).join("\n")}</textarea><span class="form-helper">\u5B98\u65B9\u5730\u5740\u5931\u8D25\u540E\u81EA\u52A8\u6545\u969C\u8F6C\u79FB\u5230\u7684\u955C\u50CF\u5730\u5740\uFF0C\u6BCF\u884C\u4E00\u4E2A URL\u3002</span></div>
              <fieldset class="form-group"><legend>\u4E0A\u6E38 API Keys</legend><div id="keys-${escapePageHtml(p.id)}">${p.apiKeys.map((k, ki) => `<div class="fc mb-3 field-row" data-kidx="${ki}"><input type="text" value="${escapePageHtml(k.key)}" class="fx1" id="k-${escapePageHtml(p.id)}-${ki}" placeholder="API Key" aria-label="API Key"><label class="tg"><input type="checkbox" ${k.enabled ? "checked" : ""} id="ken-${escapePageHtml(p.id)}-${ki}" aria-label="\u542F\u7528 Key"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236 Key" aria-label="\u590D\u5236 Key"><i class="far fa-copy" aria-hidden="true"></i></button><button class="icon-btn" onclick="testKeyRow('${p.id}',${ki})" title="\u6D4B\u8BD5 Key" aria-label="\u6D4B\u8BD5 Key"><i class="fas fa-plug" aria-hidden="true"></i></button><button class="icon-btn" onclick="rmKeyRow('${p.id}',${ki})" title="\u79FB\u9664 Key" aria-label="\u79FB\u9664 Key"><i class="fas fa-times" aria-hidden="true"></i></button></div>`).join("")}</div><div class="fc mt-1 field-row"><input type="text" id="nk-${escapePageHtml(p.id)}" placeholder="\u65B0\u7684 API Key" class="fx1"><button class="btn btn-s" onclick="addKeyRow('${p.id}')"><i class="fas fa-plus" aria-hidden="true"></i>\u6DFB\u52A0</button></div></fieldset>
              <fieldset class="form-group"><legend>\u6A21\u578B</legend><div id="ml-${escapePageHtml(p.id)}">${p.models.map((m, mi) => `<div class="fc mb-3 field-row" data-idx="${mi}"><input type="text" value="${escapePageHtml(m.id)}" class="fx1" id="mid-${escapePageHtml(p.id)}-${mi}" placeholder="\u6A21\u578B ID" title="\u4E0A\u6E38\u771F\u5B9E\u6A21\u578B ID"><input type="text" value="${escapePageHtml(m.alias || "")}" class="fx1" id="mal-${escapePageHtml(p.id)}-${mi}" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" title="\u5BF9\u5916\u663E\u793A\u540D, \u7559\u7A7A\u81EA\u52A8\u53BB:free\u540E\u7F00"><label class="tg"><input type="checkbox" ${m.enabled ? "checked" : ""} id="men-${escapePageHtml(p.id)}-${mi}" aria-label="\u542F\u7528\u6A21\u578B"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236\u6A21\u578B ID" aria-label="\u590D\u5236\u6A21\u578B ID"><i class="far fa-copy" aria-hidden="true"></i></button><button class="icon-btn" onclick="testMdl('${p.id}','${m.id}',${mi})" title="\u6D4B\u8BD5\u6A21\u578B" aria-label="\u6D4B\u8BD5\u6A21\u578B"><i class="fas fa-plug" aria-hidden="true"></i></button><button class="icon-btn" onclick="rmMdl('${p.id}',${mi})" title="\u79FB\u9664\u6A21\u578B" aria-label="\u79FB\u9664\u6A21\u578B"><i class="fas fa-times" aria-hidden="true"></i></button></div>`).join("")}</div><div class="fc mt-1 field-row"><input type="text" id="nmid-${escapePageHtml(p.id)}" placeholder="\u65B0\u7684\u6A21\u578B ID" class="fx1"><input type="text" id="nmal-${escapePageHtml(p.id)}" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" class="fx1"><button class="btn btn-s" onclick="addMdl('${p.id}')"><i class="fas fa-plus" aria-hidden="true"></i>\u6DFB\u52A0</button></div></fieldset>
              <div class="detail-actions"><div id="tr-${escapePageHtml(p.id)}" aria-live="polite"></div><div><button class="btn btn-s" data-hide-ag ${p.type === "antigravity" ? 'style="display:none"' : ""} onclick="fetchEditModels('${p.id}', false)"><i class="fas fa-download" aria-hidden="true"></i>\u83B7\u53D6\u6A21\u578B</button><button class="btn btn-s" data-hide-ag ${p.type === "antigravity" ? 'style="display:none"' : ""} onclick="fetchEditModels('${p.id}', true)"><i class="fas fa-gift" aria-hidden="true"></i>\u83B7\u53D6\u514D\u8D39\u6A21\u578B</button><button class="btn btn-d" onclick="del('${p.id}')"><i class="fas fa-trash" aria-hidden="true"></i>\u5220\u9664</button><button class="btn btn-p" onclick="save('${p.id}')"><i class="fas fa-save" aria-hidden="true"></i>\u4FDD\u5B58\u66F4\u6539</button></div></div>
            </div>
          </article>`).join("") : `<div class="empty-state"><i class="fas fa-server" aria-hidden="true"></i><h3>\u8FD8\u6CA1\u6709\u6E20\u9053</h3><p>\u6DFB\u52A0\u7B2C\u4E00\u4E2A\u4E0A\u6E38\u6E20\u9053\uFF0C\u914D\u7F6E API \u5730\u5740\u3001Key \u548C\u6A21\u578B\u3002</p><button class="btn btn-p" onclick="showAdd()">\u6DFB\u52A0\u6E20\u9053</button></div>`}
        </div>
      </section>

      <section id="quota" class="workspace-section" aria-labelledby="quota-title">
        <div class="section-heading section-heading--admin"><div><h2 id="quota-title">\u989D\u5EA6</h2><p>Antigravity \u5404\u8D26\u53F7\u7684\u6A21\u578B\u5269\u4F59\u989D\u5EA6\u4E0E\u91CD\u7F6E\u65F6\u95F4\uFF0C\u5171 ${agAccountCount} \u4E2A\u8D26\u53F7\u3002\u8D26\u53F7\u5361\u7247\u91CC\u7684\u90AE\u7BB1\u4E0E\u8BA2\u9605\u5C42\uFF08Google AI Pro \u7B49\uFF09\u6765\u81EA Google\uFF0C\u53EF\u7528\u6765\u786E\u8BA4\u67D0\u4E2A token \u5C5E\u4E8E\u54EA\u4E2A\u8D26\u53F7\u3001\u5957\u9910\u662F\u5426\u771F\u7684\u751F\u6548\u3002</p></div><div class="fc" style="gap:8px;flex-wrap:wrap"><button class="btn btn-p" onclick="queryAllAgQuota()"><i class="fas fa-gauge-high" aria-hidden="true"></i>\u67E5\u8BE2\u5168\u90E8\u989D\u5EA6</button><button class="btn btn-s" onclick="refreshAgAccounts()"><i class="fas fa-sync-alt" aria-hidden="true"></i>\u5237\u65B0\u8D26\u53F7</button></div></div>
        <div id="quotaBody" class="quota-grid"><div class="form-helper" style="padding:12px 0;grid-column:1/-1">\u70B9\u53F3\u4E0A\u89D2\u300C\u5237\u65B0\u8D26\u53F7\u300D\u91CD\u65B0\u8BFB\u53D6\u8D26\u53F7\uFF1B\u70B9\u8D26\u53F7\u53F3\u4FA7\u300C\u67E5\u8BE2\u300D\u83B7\u53D6\u8BE5\u8D26\u53F7\u989D\u5EA6\u3002</div></div>
      </section>

      <section id="proxy-keys" class="workspace-section" aria-labelledby="proxy-keys-title">
        <div class="section-heading section-heading--admin"><div><h2 id="proxy-keys-title">\u4EE4\u724C</h2><p>\u5BA2\u6237\u7AEF\u4F7F\u7528\u8FD9\u4E9B Key \u8BBF\u95EE\u7EDF\u4E00\u7684 <code>/v1</code> \u63A5\u53E3\u3002</p></div><button class="btn btn-p" onclick="genKey()"><i class="fas fa-plus" aria-hidden="true"></i>\u751F\u6210\u4EE4\u724C</button></div>
        <div class="key-list">
          ${proxyKeys.length === 0 ? '<div class="empty-state"><i class="fas fa-key" aria-hidden="true"></i><h3>\u6682\u65E0\u4EE4\u724C</h3><p>\u751F\u6210\u4E00\u4E2A Key \u540E\uFF0C\u5BA2\u6237\u7AEF\u624D\u80FD\u8BBF\u95EE\u7F51\u5173\u3002</p><button class="btn btn-p" onclick="genKey()">\u751F\u6210\u4EE4\u724C</button></div>' : ""}
          ${proxyKeys.map((k) => `<article class="ki" data-id="${escapePageHtml(k.id)}"><div class="key-main"><span class="key-icon" aria-hidden="true"><i class="fas fa-key"></i></span><div><div class="kv"><span id="kv-${escapePageHtml(k.id)}" data-full="${escapePageHtml(k.key)}" data-vis="0">${escapePageHtml(k.key.length > 12 ? k.key.substring(0, 8) + "*****" + k.key.substring(k.key.length - 4) : k.key)}</span><button class="icon-btn" onclick="toggleKeyVis('${k.id}')" title="\u663E\u793A\u6216\u9690\u85CF" aria-label="\u663E\u793A\u6216\u9690\u85CF Key"><i class="far fa-eye" aria-hidden="true"></i></button><button class="icon-btn" onclick='copyText("${escapePageHtml(k.key)}",this)' title="\u590D\u5236" aria-label="\u590D\u5236 Key"><i class="far fa-copy" aria-hidden="true"></i></button><button class="icon-btn" onclick="regenerateKey('${k.id}')" title="\u91CD\u65B0\u751F\u6210" aria-label="\u91CD\u65B0\u751F\u6210 Key"><i class="fas fa-sync-alt" aria-hidden="true"></i></button></div><div class="key-meta"><h3>${escapePageHtml(k.name)}</h3><span class="key-meta__sep" aria-hidden="true">-</span><p>\u521B\u5EFA\u4E8E ${new Date(k.createdAt).toLocaleDateString()} \xB7 ${k.expiresAt ? "\u6709\u6548\u81F3 " + new Date(k.expiresAt).toLocaleDateString() : "\u6C38\u4E45\u6709\u6548"}</p></div></div></div><div class="key-actions"><label class="tg"><input type="checkbox" ${k.enabled ? "checked" : ""} onchange="toggleProxyKey('${k.id}',this.checked)" aria-label="\u542F\u7528 ${escapePageHtml(k.name)}"><span class="sl"></span></label><span class="bd ${k.enabled ? "bd-on" : "bd-off"}">${k.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u7981\u7528"}</span><button class="bd bd-del" onclick="rmKey('${k.id}')"><i class="fas fa-trash" aria-hidden="true"></i>\u5220\u9664</button></div></article>`).join("")}
        </div>
      </section>

      <section id="usage" class="workspace-section" aria-labelledby="usage-title">
        <div class="section-heading section-heading--admin">
          <div><h2 id="usage-title">\u7528\u91CF\u7EDF\u8BA1</h2><p>\u805A\u5408\u7EDF\u8BA1 Token \u6D88\u8017\u4E0E\u8BF7\u6C42\u5206\u5E03\uFF0C\u6570\u636E\u4FDD\u7559 30 \u5929\u3002</p></div>
          <select id="usage-days" class="select-sm" onchange="loadUsage()" aria-label="\u65F6\u95F4\u8303\u56F4">
            <option value="1" selected>\u4ECA\u5929</option>
            <option value="7">\u8FD1 7 \u5929</option>
            <option value="14">\u8FD1 14 \u5929</option>
            <option value="30">\u8FD1 30 \u5929</option>
          </select>
        </div>
        <div class="admin-metrics metrics-4" aria-label="\u7528\u91CF\u7EDF\u8BA1">
          <div><span id="u-req">-</span><p>\u8BF7\u6C42\u603B\u6570</p><small id="u-ok">- \u6210\u529F</small></div>
          <div><span id="u-in">-</span><p>\u8F93\u5165 Tokens</p><small>\u63D0\u793A\u8BCD\u6D88\u8017</small></div>
          <div><span id="u-out">-</span><p>\u8F93\u51FA Tokens</p><small>\u751F\u6210\u6D88\u8017</small></div>
          <div><span id="u-lat">-</span><p>\u5E73\u5747\u8017\u65F6</p><small>\u6BEB\u79D2</small></div>
        </div>
        <div id="u-trend-wrap" class="hd add-form-panel" style="margin-top:16px">
          <div class="panel-heading"><div><span class="panel-heading__mark"><i class="fas fa-chart-bar" aria-hidden="true"></i></span><div><h3>\u6BCF\u65E5\u8BF7\u6C42\u8D8B\u52BF</h3></div></div></div>
          <div id="u-trend" style="padding:16px"></div>
        </div>
        <div class="rank-grid" style="margin-top:16px">
          <div class="rank-card">
            <div class="panel-heading" style="border:none;padding:0;margin-bottom:10px"><div><span class="panel-heading__mark"><i class="fas fa-cube" aria-hidden="true"></i></span><div><h3>\u6A21\u578B\u6392\u884C</h3></div></div></div>
            <div id="u-models"></div>
          </div>
          <div class="rank-card">
            <div class="panel-heading" style="border:none;padding:0;margin-bottom:10px"><div><span class="panel-heading__mark"><i class="fas fa-server" aria-hidden="true"></i></span><div><h3>\u6E20\u9053\u6392\u884C</h3></div></div></div>
            <div id="u-providers"></div>
          </div>
        </div>
      </section>

      <section id="backup" class="workspace-section" aria-labelledby="backup-title">
        <div class="section-heading section-heading--admin">
          <div><h2 id="backup-title">\u5907\u4EFD\u4E0E\u6062\u590D</h2><p>\u5BFC\u51FA/\u5BFC\u5165\u5168\u91CF\u6570\u636E\uFF0C\u6216\u5907\u4EFD\u5230 R2 \u4E91\u7AEF\u5FEB\u7167\u3002\u8986\u76D6\u6E20\u9053\u914D\u7F6E\u3001\u4EE4\u724C\u4E0E\u7528\u91CF\u7EDF\u8BA1\u3002</p></div>
        </div>
        <div class="rank-grid">
          <div class="rank-card" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
            <div class="panel-heading" style="border:none;padding:0;margin-bottom:10px;justify-content:center"><div style="flex-direction:column;align-items:center"><span class="panel-heading__mark"><i class="fas fa-download" aria-hidden="true"></i></span><div><h3>\u5BFC\u51FA / \u5BFC\u5165</h3><p>\u5BFC\u51FA\u5B8C\u6574\u6570\u636E\u4E3A JSON \u6587\u4EF6\uFF0C\u6216\u4ECE\u6587\u4EF6\u6062\u590D\u3002</p></div></div></div>
            <div class="fc" style="gap:8px;flex-wrap:wrap;justify-content:center">
              <button class="btn btn-p" onclick="backupExport()"><i class="fas fa-download" aria-hidden="true"></i>\u5BFC\u51FA\u6570\u636E\u5E93</button>
              <button class="btn btn-s" onclick="backupImportPick()"><i class="fas fa-upload" aria-hidden="true"></i>\u5BFC\u5165\u6570\u636E\u5E93</button>
            </div>
            <div id="bk-io-result" class="mt-1" aria-live="polite"></div>
          </div>
          <div class="rank-card" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
            <div class="panel-heading" style="border:none;padding:0;margin-bottom:10px;justify-content:center"><div style="flex-direction:column;align-items:center"><span class="panel-heading__mark"><i class="fas fa-cloud-upload-alt" aria-hidden="true"></i></span><div><h3>R2 \u4E91\u7AEF\u5907\u4EFD</h3><p>\u5FEB\u7167\u5B58\u5165 R2 \u6876(\u81EA\u52A8\u4FDD\u7559\u6700\u65B0 30 \u4EFD)\u3002</p></div></div></div>
            <div class="fc" style="gap:8px;flex-wrap:wrap;justify-content:center">
              <button class="btn btn-p" onclick="backupToR2()"><i class="fas fa-cloud-upload-alt" aria-hidden="true"></i>\u5907\u4EFD\u5230 R2</button>
              <button class="btn btn-s" onclick="backupList()"><i class="fas fa-sync-alt" aria-hidden="true"></i>\u5237\u65B0\u5217\u8868</button>
            </div>
            <div id="bk-r2-result" class="mt-1" aria-live="polite"></div>
          </div>
          <div class="rank-card" >
            <div class="panel-heading" style="border:none;padding:0;margin-bottom:10px"><div><span class="panel-heading__mark"><i class="fas fa-paper-plane" aria-hidden="true"></i></span><div><h3>Telegram \u5907\u4EFD</h3><p>\u901A\u8FC7 Bot \u53D1\u9001\u5907\u4EFD\u6587\u4EF6\u5230\u81EA\u5DF1\u7684 Telegram\u3002\u9700\u5148\u6D4B\u8BD5\u901A\u9053\u3002</p></div></div></div>
            <div class="fg"><label>Telegram Bot Token</label><input type="password" id="tgToken" class="fx1" placeholder="123456:ABC-DEF..." autocomplete="off"></div>
            <div class="fg"><label>Telegram USER ID</label><input type="text" id="tgChat" class="fx1" placeholder="123456789"></div>
            <div class="fc" style="gap:8px;flex-wrap:wrap;margin-top:8px">
              <button class="btn btn-s" onclick="telegramTest()"><i class="fas fa-paper-plane" aria-hidden="true"></i>\u6D4B\u8BD5\u901A\u9053</button>
              <button class="btn btn-p" onclick="backupToTelegram()"><i class="fas fa-arrow-circle-up" aria-hidden="true"></i>\u5907\u4EFD\u5230 Telegram</button>
            </div>
            <div id="bk-tg-result" class="mt-1" aria-live="polite"></div>
          </div>
        </div>
      </section>
    </main>

    ${renderSiteFooter(SITE_CONFIG.title, getPlatformLabel(c.env, c.req.header("host")))}
  </div>
</div>

<div id="modal" class="modal-o hd" role="presentation" onclick="if(event.target===this)closeM()"><div class="modal" id="mc" role="dialog" aria-modal="true" aria-live="polite"></div></div>

<script>${SHARED_JS}
// copy
function copyText(t, el) {
  const i = el.tagName === 'I' ? el : (el.querySelector('i') || el.parentElement?.querySelector('i'))
  if (!i) { navigator.clipboard.writeText(t).catch(() => {}); return }
  const oc = i.className
  navigator.clipboard.writeText(t).then(() => {
    i.className = 'fas fa-check c-s'
    el.setAttribute('data-state', 'success')
    setTimeout(() => {
      i.className = oc
      el.removeAttribute('data-state')
    }, 1800)
  }).catch(() => {
    el.setAttribute('data-state', 'error')
  })
}

// \u4ECE\u5F53\u524D\u884C\u8BFB\u53D6\u5B9E\u65F6\u8F93\u5165\u503C\u5E76\u590D\u5236\uFF08Key \u884C\u4E0E\u6A21\u578B ID \u884C\u5171\u7528\uFF09
function copyRowVal(btn) {
  const inp = btn.parentElement.querySelector('input[type=text]')
  if (inp) copyText(inp.value, btn)
}

// modal
function showM(h) { document.getElementById('mc').innerHTML = h; document.getElementById('modal').classList.remove('hd') }
function closeM() { document.getElementById('modal').classList.add('hd') }
function cM(msg) {
  return new Promise(r => {
    showM('<h3><i class="fas fa-question-circle c-p"></i> \u786E\u8BA4</h3><p>' + msg + '</p><div class="fa"><button class="btn btn-s" onclick="closeM();r(false)">\u53D6\u6D88</button><button class="btn btn-p" onclick="closeM();r(true)">\u786E\u5B9A</button></div>')
    window.r = r
  })
}
function pM(msg, def) {
  return new Promise(r => {
    showM('<h3><i class="fas fa-pen c-p"></i> ' + msg + '</h3><div class="fg"><input type="text" id="pv" value="' + (def || '') + '" placeholder="\u8BF7\u8F93\u5165"></div><div class="fa"><button class="btn btn-s" id="pMc">\u53D6\u6D88</button><button class="btn btn-p" id="pMo">\u786E\u5B9A</button></div>')
    window.r = r
    const inp = document.getElementById('pv')
    if (inp) {
      inp.focus()
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { closeM(); r(inp.value.trim()) }
      })
    }
    document.getElementById('pMc').addEventListener('click', function() { closeM(); r(null) })
    document.getElementById('pMo').addEventListener('click', function() { closeM(); r(inp.value.trim()) })
  })
}
function aM(msg, t) {
  const i = t === 'success' ? 'fa-check-circle c-s' : 'fa-exclamation-circle c-d'
  showM('<h3><i class="fas ' + i + '"></i> ' + (t === 'success' ? '\u6210\u529F' : '\u63D0\u793A') + '</h3><p>' + msg + '</p><div class="fa"><button class="btn btn-p" onclick="closeM()">\u786E\u5B9A</button></div>')
}

function toast(msg, t) {
  const el = document.getElementById('toast')
  const i = t === 'success' ? 'fa-check-circle' : 'fa-times-circle'
  const cls = t === 'success' ? 'al-s' : 'al-e'
  el.innerHTML = '<div class="al ' + cls + '"><i class="fas ' + i + '"></i> ' + escapeHtml(msg) + '</div>'
  el.classList.remove('hd')
  setTimeout(() => el.classList.add('hd'), 3000)
}

// providers
function tog(id) {
  const d = document.getElementById('dt-' + id), c = document.getElementById('ch-' + id)
  d.classList.toggle('open')
  c.style.transform = d.classList.contains('open') ? 'rotate(90deg)' : ''
}

function showAdd() { document.getElementById('af').classList.remove('hd') }
function hideAdd() { document.getElementById('af').classList.add('hd'); document.getElementById('amc').classList.add('hd') }

// OAuth \u53CD\u4EE3\u6E20\u9053\u7684\u9ED8\u8BA4 API \u5730\u5740\uFF08\u7F51\u5173\u4E0D\u5B9E\u9645\u4F7F\u7528\u8BE5\u5730\u5740\u8F6C\u53D1\uFF0C\u4EC5\u4F5C\u5C55\u793A/\u515C\u5E95\uFF09
const OAUTH_DEFAULT_URLS = { claude: 'https://api.anthropic.com', codex: 'https://chatgpt.com/backend-api/codex', kimi: 'https://api.kimi.ai/coding', grok: 'https://cli-chat-proxy.grok.com/v1', qwen: 'https://portal.qwen.ai/v1', deepseek: 'https://chat.deepseek.com', zai: 'https://api.z.ai/api/coding/paas/v4', codebuddy: 'https://copilot.tencent.com', cline: 'https://api.cline.bot' }
function isOauthType(t) { return ['claude', 'codex', 'kimi', 'grok', 'qwen', 'codebuddy', 'cline'].indexOf(t) !== -1 }
function isDeepseekType(t) { return t === 'deepseek' }
function isZaiType(t) { return t === 'zai' }
function isCodebuddyType(t) { return t === 'codebuddy' }

// ===== CodeBuddy \u533A\u57DF\uFF08\u56FD\u5185\u7248 / \u56FD\u9645\u7248\uFF09=====
// \u533A\u57DF\u4EE5 region \u5B57\u6BB5\u4E3A\u51C6\uFF0CAPI \u5730\u5740\u4EC5\u4F5C\u5C55\u793A\u4E0E\u515C\u5E95\uFF1B\u4E24\u5957\u8D26\u53F7\u4F53\u7CFB\u4E92\u76F8\u72EC\u7ACB\uFF0C\u51ED\u636E\u4E0D\u53EF\u6DF7\u7528\u3002
const CB_REGION_URLS = { cn: 'https://copilot.tencent.com', global: 'https://www.workbuddy.ai' }
function cbRegionValue(id) {
  const el = document.getElementById('cbr-' + id)
  return el && el.value === 'global' ? 'global' : 'cn'
}
function cbRegionUrl(id) { return CB_REGION_URLS[cbRegionValue(id)] }
// \u5207\u6362\u533A\u57DF\uFF1A\u540C\u6B65 API \u5730\u5740\uFF0C\u5E76\u6E05\u6389\u4E0A\u4E00\u6B21\u7684\u533A\u57DF\u76F8\u5173\u67E5\u8BE2\u7ED3\u679C\uFF08\u6362\u533A\u540E\u65E7\u7ED3\u679C\u5DF2\u5931\u6548\uFF09
function cbRegionChange(id) {
  const urlEl = document.getElementById(id === 'new' ? 'aurl' : 'url-' + id)
  if (urlEl) urlEl.value = cbRegionUrl(id)
  const box = document.getElementById(id === 'new' ? 'cbst-new' : 'cbst-' + id)
  if (box) box.innerHTML = ''
}

// \u6E20\u9053\u7C7B\u578B\u5207\u6362: azure-tts \u663E\u793A\u97F3\u8272\u914D\u7F6E, antigravity/OAuth \u53CD\u4EE3\u663E\u793A\u6388\u6743\u533A; \u8FD9\u4E9B\u7C7B\u578B\u90FD\u5FFD\u7565 API \u5730\u5740
function onTypeChange(sel, id) {
  const isTts = sel.value === 'azure-tts'
  const isAg = sel.value === 'antigravity'
  const isOa = isOauthType(sel.value)
  const ttsBox = document.getElementById('tts-' + id)
  if (ttsBox) ttsBox.style.display = isTts ? '' : 'none'
  const agBox = document.getElementById('ag-' + id)
  if (agBox) agBox.style.display = isAg ? '' : 'none'
  const oaBox = document.getElementById('oa-' + id)
  if (oaBox) oaBox.style.display = isOa ? '' : 'none'
  const isDs = isDeepseekType(sel.value)
  const dsBox = document.getElementById('ds-' + id)
  if (dsBox) dsBox.style.display = isDs ? '' : 'none'
  const isCb = isCodebuddyType(sel.value)
  const cbBox = document.getElementById('cb-' + id)
  if (cbBox) cbBox.style.display = isCb ? '' : 'none'
  const vxBox = document.getElementById('vx-' + id)
  if (vxBox) vxBox.style.display = sel.value === 'vertex' ? '' : 'none'
  const dvBox = document.getElementById('dv-' + id)
  if (dvBox) dvBox.style.display = sel.value === 'devin' ? '' : 'none'
  const isZai = isZaiType(sel.value)
  const hint = document.getElementById('apt-hint-' + id)
  if (hint) {
    hint.textContent = sel.value === 'anthropic' ? 'Anthropic \u6D88\u606F\u534F\u8BAE, \u517C\u5BB9 /v1/messages\u3002'
      : sel.value === 'agnes-video' ? 'Agnes \u5F02\u6B65\u89C6\u9891\u4EFB\u52A1\u6A21\u5F0F(\u4EC5\u89C6\u9891\u7AEF\u70B9, \u5BF9\u8BDD/\u56FE\u7247\u8BF7\u53E6\u5EFA OpenAI \u517C\u5BB9\u6E20\u9053)\u3002'
      : sel.value === 'openai-video' ? '\u6807\u51C6 OpenAI \u89C6\u9891\u7AEF\u70B9, \u539F\u6837\u900F\u4F20\u3002'
      : sel.value === 'azure-tts' ? '\u5185\u7F6E\u514D\u8D39\u8BED\u97F3\u5408\u6210, \u65E0\u9700 API Key\u3002'
      : sel.value === 'antigravity' ? 'Antigravity \u53CD\u4EE3: \u70B9\u300C\u7528 Google \u8D26\u53F7\u6388\u6743\u300D\u83B7\u53D6 refresh_token, \u8BF7\u6C42\u81EA\u52A8\u7FFB\u8BD1\u6210 Gemini \u534F\u8BAE\u3002\u652F\u6301\u591A\u8D26\u53F7(\u4E00\u884C\u4E00\u4E2A), \u53EF\u7528 refresh_token|\u9879\u76EEID \u7ED9\u5355\u4E2A\u8D26\u53F7\u5355\u72EC\u6307\u5B9A\u9879\u76EE\u3002'
      : sel.value === 'claude' ? 'Claude OAuth \u53CD\u4EE3: \u6388\u6743\u767B\u5F55\u83B7\u53D6 refresh_token, \u8BF7\u6C42\u81EA\u52A8\u7FFB\u8BD1\u6210 Anthropic Messages \u534F\u8BAE, \u540C\u65F6\u517C\u5BB9 /v1/messages \u76F4\u8FDE\u3002'
      : sel.value === 'codex' ? 'ChatGPT (Codex) \u53CD\u4EE3: \u6388\u6743\u767B\u5F55\u83B7\u53D6 refresh_token, \u8BF7\u6C42\u81EA\u52A8\u7FFB\u8BD1\u6210 Responses \u534F\u8BAE\u3002'
      : sel.value === 'kimi' ? 'Kimi \u53CD\u4EE3: \u8BBE\u5907\u7801\u6388\u6743\u83B7\u53D6 refresh_token, OpenAI \u517C\u5BB9\u76F4\u901A (kimi-for-coding)\u3002'
      : sel.value === 'grok' ? 'Grok (xAI) \u53CD\u4EE3: \u8BBE\u5907\u7801\u6388\u6743\u83B7\u53D6 refresh_token, \u8BF7\u6C42\u81EA\u52A8\u7FFB\u8BD1\u6210 Responses \u534F\u8BAE\u3002'
      : sel.value === 'qwen' ? 'Qwen \u53CD\u4EE3: \u8BBE\u5907\u7801\u6388\u6743\u83B7\u53D6 refresh_token, OpenAI \u517C\u5BB9\u76F4\u901A (portal.qwen.ai)\u3002'
      : sel.value === 'deepseek' ? 'DeepSeek \u53CD\u4EE3: \u586B\u5B98\u65B9 API Key(sk-, \u76F4\u8FDE api.deepseek.com) \u6216\u7F51\u9875 userToken(PoW, \u9700 Workers Paid)\u3002'
      : sel.value === 'codebuddy' ? 'CodeBuddy(\u817E\u8BAF) \u53CD\u4EE3: \u5148\u5728\u4E0B\u65B9\u300C\u7248\u672C / \u533A\u57DF\u300D\u9009\u56FD\u5185\u7248\u6216\u56FD\u9645\u7248, \u518D\u70B9\u300C\u6388\u6743\u767B\u5F55\u300D\u767B\u5F55\u5BF9\u5E94\u533A\u57DF\u7684\u8D26\u53F7\u83B7\u53D6 refresh_token\u3002\u4E0A\u6E38\u5F3A\u5236\u6D41\u5F0F, \u975E\u6D41\u5F0F\u8BF7\u6C42\u7531\u7F51\u5173\u81EA\u52A8\u805A\u5408\u3002'
      : sel.value === 'cline' ? 'Cline \u53CD\u4EE3: \u70B9\u300C\u6388\u6743\u767B\u5F55\u300D\u8D70\u8BBE\u5907\u7801\u6D41\u7A0B\u83B7\u53D6 refreshToken (\u6216\u624B\u52A8\u7C98\u8D34), \u591A\u8D26\u53F7\u4E00\u884C\u4E00\u4E2A\u8F6E\u6362\u3002\u514D\u8D39\u901A\u9053\u81EA\u52A8\u5265 max_tokens + \u5F3A\u5236\u6D41\u5F0F, \u975E\u6D41\u5F0F\u7531\u7F51\u5173\u805A\u5408\u3002'
      : sel.value === 'zai' ? 'Z.AI \u9884\u8BBE: \u586B z.ai \u7684 API Key(\u7F16\u7801\u5957\u9910)\u3002/v1/messages \u81EA\u52A8\u8D70 Anthropic \u7AEF\u70B9, \u5176\u4F59\u8D70 OpenAI \u7AEF\u70B9\u3002'
      : 'Agnes \u7B49\u805A\u5408\u5E73\u53F0\u5EFA\u8BAE\u9009 OpenAI \u517C\u5BB9, \u89C6\u9891\u6A21\u578B\u81EA\u52A8\u8D70\u5F02\u6B65\u9002\u914D\u3002'
  }
  // Antigravity / OAuth \u53CD\u4EE3: \u9690\u85CF\u4EC5\u5BF9\u666E\u901A\u6E20\u9053\u6709\u610F\u4E49\u7684\u5B57\u6BB5/\u6309\u94AE\uFF08\u955C\u50CF\u5730\u5740\u3001OpenAI \u5F0F\u83B7\u53D6\u6A21\u578B\uFF09
  const hideForOAuth = isAg || isOa || isDs
  const scope = id === 'new' ? document.getElementById('af') : document.getElementById('dt-' + id)
  if (scope) {
    scope.querySelectorAll('[data-hide-ag]').forEach(function (el) { el.style.display = hideForOAuth ? 'none' : '' })
  }
  if (id === 'new') {
    const url = document.getElementById('aurl')
    if (url) {
      // codebuddy \u7684 API \u5730\u5740\u8DDF\u968F\u300C\u7248\u672C/\u533A\u57DF\u300D\u4E0B\u62C9\uFF0C\u4FDD\u6301\u53EF\u7F16\u8F91
      url.disabled = isTts || isAg || (isOa && !isCb) || isDs
      if (isTts) url.value = ''
      else if (isAg) url.value = 'https://daily-cloudcode-pa.googleapis.com'
      else if (isCb) url.value = cbRegionUrl('new')
      else if (isOa || isDs) url.value = OAUTH_DEFAULT_URLS[sel.value] || 'https://'
      else if (isZai) url.value = OAUTH_DEFAULT_URLS.zai
      else if (!url.value) url.value = 'https://'
    }
  } else {
    const url = document.getElementById('url-' + id)
    if (url) {
      url.disabled = isTts || isAg || (isOa && !isCb) || isDs
      if (isAg && !url.value) url.value = 'https://daily-cloudcode-pa.googleapis.com'
      if (isCb && !url.value) url.value = cbRegionUrl(id)
      if ((isOa && !isCb || isDs) && !url.value) url.value = OAUTH_DEFAULT_URLS[sel.value] || 'https://'
      if (isZai && !url.value) url.value = OAUTH_DEFAULT_URLS.zai
      if (isTts && !url.dataset.orig) url.dataset.orig = url.value
    }
  }
}

// \u8BFB\u53D6\u5F53\u524D\u6E20\u9053\u7C7B\u578B / \u9879\u76EE ID\uFF08\u65B0\u589E\u6001 id='new'\uFF0C\u7F16\u8F91\u6001\u4E3A\u6E20\u9053 id\uFF09
function provType(id) { const el = document.getElementById(id === 'new' ? 'apt' : 'pt-' + id); return el ? el.value : 'openai' }
// \u9879\u76EE ID \u8868\u5355\u5DF2\u4E0D\u66B4\u9732\uFF0C\u4FDD\u7559\u8BFB\u53D6\u4EE5\u517C\u5BB9\u65E7\u6570\u636E\uFF08\u7559\u7A7A\u5219\u7F51\u5173\u81EA\u52A8\u89E3\u6790\uFF09
function provProject(id) {
  const el = document.getElementById(id === 'new' ? 'agpj' : 'agpj-' + id)
  return el ? el.value.trim() : ''
}
// Vertex \u51ED\u636E\uFF08\u670D\u52A1\u8D26\u53F7 JSON \u6216 Express API Key\uFF0C\u591A\u4E2A\u4E4B\u95F4\u7A7A\u884C\u5206\u9694\uFF09
function provVertexKeys(id) {
  const el = document.getElementById(id === 'new' ? 'vxs' : 'vxs-' + id)
  if (!el) return null
  const txt = (el.value || '').trim()
  if (!txt) return null
  return txt.split(new RegExp('\\n\\s*\\n')).map(function (s) { return s.trim() }).filter(Boolean)
}
function provVertexLocation(id) {
  const el = document.getElementById(id === 'new' ? 'vxl' : 'vxl-' + id)
  return el ? el.value.trim() : ''
}
// Devin \u51ED\u636E\uFF08session token\uFF0C\u6BCF\u884C\u4E00\u4E2A\uFF09
function provDevinKeys(id) {
  const el = document.getElementById(id === 'new' ? 'dvt' : 'dvt-' + id)
  if (!el) return null
  const txt = (el.value || '').trim()
  if (!txt) return null
  return txt.split(new RegExp('\\n+')).map(function (s) { return s.trim() }).filter(Boolean)
}
// \u6821\u9A8C Devin \u51ED\u636E\uFF08GET /v3/self\uFF09
async function verifyDevin(id) {
  const keys = provDevinKeys(id)
  if (!keys || !keys.length) { toast('\u8BF7\u5148\u586B\u5199 session token \u6216\u5B8C\u6210\u6388\u6743', 'error'); return }
  toast('\u6821\u9A8C\u4E2D\u2026', 'success')
  try {
    const r = await fetch('/admin/api/devin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: keys[0] }) })
    const d = await r.json()
    toast(d.success ? ((d.data && d.data.message) || '\u51ED\u636E\u6709\u6548') : (d.message || '\u6821\u9A8C\u5931\u8D25'), d.success ? 'success' : 'error')
  } catch (e) { toast('\u6821\u9A8C\u8BF7\u6C42\u5931\u8D25', 'error') }
}
// Devin \u6388\u6743\uFF08PKCE \u65E0\u56DE\u8C03\uFF1A\u6388\u6743\u9875\u76F4\u63A5\u7ED9 code\uFF09
async function devinOAuth(id) {
  const w = window.open('', '_blank')
  try {
    const r = await fetch('/admin/api/devin/oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const d = await r.json()
    if (!d.success || !d.data) { if (w) w.close(); toast(d.message || '\u751F\u6210\u6388\u6743\u94FE\u63A5\u5931\u8D25', 'error'); return }
    if (w) w.location.href = d.data.url; else window.open(d.data.url, '_blank')
    showM('<h3><i class="fas fa-key c-p"></i> Devin \u6388\u6743</h3><p class="form-helper" style="margin-bottom:8px">\u5728\u6253\u5F00\u7684 Devin \u9875\u9762\u767B\u5F55\u5E76\u786E\u8BA4\u6388\u6743\uFF0C\u9875\u9762\u4F1A\u76F4\u63A5\u663E\u793A\u4E00\u6BB5\u6388\u6743\u7801\uFF08code\uFF09\uFF0C\u590D\u5236\u5230\u4E0B\u9762\u3002</p><div class="fg"><label>\u6388\u6743\u7801 code</label><textarea id="dvcode" rows="3" class="fx1" placeholder="\u7C98\u8D34\u9875\u9762\u7ED9\u51FA\u7684 code"></textarea></div><div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button><button class="btn btn-p" id="dvok">\u5B8C\u6210\u6388\u6743</button></div>')
    const ok = document.getElementById('dvok')
    ok.onclick = async function () {
      const code = (document.getElementById('dvcode').value || '').trim()
      if (!code) { toast('\u8BF7\u7C98\u8D34\u6388\u6743\u7801', 'error'); return }
      ok.disabled = true
      try {
        const rr = await fetch('/admin/api/devin/oauth/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code, state: d.data.state }) })
        const dd = await rr.json()
        if (dd.success && dd.data && dd.data.session_token) {
          const el = document.getElementById(id === 'new' ? 'dvt' : 'dvt-' + id)
          if (el) { el.value = (el.value ? el.value.replace(new RegExp('\\\\s*$'), '\\n') : '') + dd.data.session_token }
          closeM()
          toast('\u6388\u6743\u6210\u529F\uFF08' + (dd.data.user_name || dd.data.user_id || 'Devin') + '\uFF09\uFF0C\u51ED\u636E\u5DF2\u586B\u5165\uFF0C\u4FDD\u5B58\u6E20\u9053\u540E\u751F\u6548', 'success')
        } else { ok.disabled = false; toast(dd.message || '\u6388\u6743\u5931\u8D25', 'error') }
      } catch (e) { ok.disabled = false; toast('\u6388\u6743\u8BF7\u6C42\u5931\u8D25', 'error') }
    }
  } catch (e) { if (w) w.close(); toast('\u751F\u6210\u6388\u6743\u94FE\u63A5\u5931\u8D25', 'error') }
}

// \u6821\u9A8C Vertex \u51ED\u636E\uFF1A\u6362 token\uFF0C\u5E76\u7528\u6E20\u9053\u91CC\u7684\u7B2C\u4E00\u4E2A\u6A21\u578B\u8BD5\u8DD1\u4E00\u6B21
async function verifyVertex(id) {
  const keys = provVertexKeys(id)
  if (!keys || !keys.length) { toast('\u8BF7\u5148\u586B\u5199\u670D\u52A1\u8D26\u53F7 JSON \u6216 API Key', 'error'); return }
  let model = ''
  const ml = document.getElementById(id === 'new' ? 'amodels' : 'ml-' + id)
  if (ml) {
    const inp = ml.querySelector('.ami') || ml.querySelector('[data-idx] input')
    if (inp) model = inp.value.trim()
  }
  toast('\u6821\u9A8C\u4E2D\u2026', 'success')
  try {
    const r = await fetch('/admin/api/vertex/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: keys[0], model: model || undefined, location: provVertexLocation(id) || undefined }) })
    const d = await r.json()
    toast(d.success ? ((d.data && d.data.message) || '\u51ED\u636E\u6709\u6548') : (d.message || '\u6821\u9A8C\u5931\u8D25'), d.success ? 'success' : 'error')
  } catch (e) { toast('\u6821\u9A8C\u8BF7\u6C42\u5931\u8D25', 'error') }
}

// \u628A\u6388\u6743\u5F97\u5230\u7684 refresh_token \u8FFD\u52A0\u5230\u300C\u4E0A\u6E38 API Keys\u300D\u5217\u8868
function addKeyValue(id, value) {
  if (!value) return
  if (id === 'new') { addAKeyRow(value); return }
  const inp = document.getElementById('nk-' + id)
  if (inp) { inp.value = value; addKeyRow(id) } else { addAKeyRow(value) }
}

// Antigravity \u5185\u7F6E OAuth \u6388\u6743\uFF08loopback \u56DE\u8C03\uFF0C\u6253\u4E0D\u5F00\u9875\u9762\u5C5E\u6B63\u5E38\uFF0C\u590D\u5236\u5730\u5740\u680F code\uFF09
async function antigravityOAuth(id) {
  const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
  const w = window.open('', '_blank')
  if (tr) showSpinner(tr)
  try {
    const r = await fetch('/admin/api/antigravity/oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const d = await r.json()
    if (!d.success || !d.data) { if (w) w.close(); if (tr) showResult(tr, false, d.message || '\u751F\u6210\u6388\u6743\u94FE\u63A5\u5931\u8D25'); return }
    if (w) w.location.href = d.data.url
    else window.open(d.data.url, '_blank')
    showM('<h3><i class="fas fa-key c-p"></i> Antigravity \u6388\u6743</h3><p class="form-helper" style="margin-bottom:8px">\u5728\u6253\u5F00\u7684 Google \u9875\u9762\u767B\u5F55\u5E76\u540C\u610F\u6388\u6743\u3002\u6388\u6743\u540E\u6D4F\u89C8\u5668\u4F1A\u8DF3\u8F6C\u5230 <code>localhost:51121</code> \u5E76\u63D0\u793A\u300C\u65E0\u6CD5\u8BBF\u95EE\u300D\u2014\u2014 \u8FD9\u662F\u6B63\u5E38\u7684\uFF0C\u628A\u5730\u5740\u680F <code>code=</code> \u540E\u9762\u90A3\u6BB5\uFF08\u6216\u6574\u6BB5\u5730\u5740\uFF09\u590D\u5236\u5230\u4E0B\u9762\u3002</p><div class="fg"><label>code \u6216\u56DE\u8C03\u5730\u5740</label><textarea id="agcode" rows="3" class="fx1" placeholder="4/0A... \u6216 http://localhost:51121/oauth-callback?code=..."></textarea></div><div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button><button class="btn btn-p" id="agok">\u5B8C\u6210\u6388\u6743</button></div>')
    const agok = document.getElementById('agok')
    agok.onclick = async function () {
      const code = document.getElementById('agcode').value.trim()
      if (!code) { toast('\u8BF7\u7C98\u8D34 code', 'error'); return }
      agok.disabled = true
      try {
        const rr = await fetch('/admin/api/antigravity/oauth/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code, state: d.data.state }) })
        const dd = await rr.json()
        if (dd.success && dd.data && dd.data.refresh_token) {
          closeM()
          addKeyValue(id, dd.data.refresh_token)
          toast('\u6388\u6743\u6210\u529F\uFF0Crefresh_token \u5DF2\u586B\u5165 API Keys\uFF0C\u4FDD\u5B58\u6E20\u9053\u540E\u751F\u6548', 'success')
          if (tr) showResult(tr, true, '')
        } else {
          toast(dd.message || '\u6362\u53D6 token \u5931\u8D25', 'error')
          agok.disabled = false
        }
      } catch (e) { toast('\u8BF7\u6C42\u5931\u8D25', 'error'); agok.disabled = false }
    }
  } catch (e) {
    if (w) w.close()
    if (tr) showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25')
  }
}

// \u62C9\u53D6 Antigravity \u53EF\u7528\u6A21\u578B\u5E76\u8FFD\u52A0\u5230\u6A21\u578B\u5217\u8868
async function fetchAgModels(id) {
  const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
  let key = ''
  if (id === 'new') {
    const first = document.querySelector('#akeys .aki')
    key = first ? first.value.trim() : ''
  } else {
    const keys = getKeys(id)
    key = keys.length > 0 ? keys[0].key : ''
  }
  if (!key) { toast('\u8BF7\u5148\u586B\u5199\u6216\u6388\u6743\u83B7\u53D6 refresh_token', 'error'); return }
  if (tr) showSpinner(tr)
  try {
    const r = await fetch('/admin/api/antigravity/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: key }) })
    const d = await r.json()
    if (!d.success) { if (tr) showResult(tr, false, d.message || '\u83B7\u53D6\u5931\u8D25'); return }
    const models = (d.data && d.data.models) || []
    if (models.length === 0) { if (tr) showResult(tr, false, '\u672A\u89E3\u6790\u5230\u6A21\u578B\u540D\uFF0C\u53EF\u624B\u52A8\u586B\u5199'); return }
    // \u53BB\u91CD\uFF1A\u5DF2\u5B58\u5728\u7684\u6A21\u578B\u4E0D\u91CD\u590D\u6DFB\u52A0
    const existing = {}
    const sel = id === 'new' ? '#amodels .ami' : '#ml-' + id + ' [data-idx] input'
    document.querySelectorAll(sel).forEach(function (inp) { if (inp.value.trim()) existing[inp.value.trim()] = 1 })
    const toAdd = models.filter(function (m) { return !existing[m] })
    toAdd.forEach(function (m) { if (id === 'new') addMdlToForm(m); else addMdlToEdit(id, m) })
    toast('\u5DF2\u6DFB\u52A0 ' + toAdd.length + ' \u4E2A\u6A21\u578B' + (toAdd.length < models.length ? '\uFF08\u8DF3\u8FC7 ' + (models.length - toAdd.length) + ' \u4E2A\u5DF2\u5B58\u5728\uFF09' : ''), 'success')
    if (tr) showResult(tr, true, '')
  } catch (e) { if (tr) showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25') }
}

// =====================================================================
// OAuth \u53CD\u4EE3\u6E20\u9053\u6388\u6743\uFF08claude/codex: \u6388\u6743\u94FE\u63A5 + \u7C98\u8D34 code; kimi/grok: \u8BBE\u5907\u7801\u8F6E\u8BE2\uFF09
// =====================================================================
async function oauthChannel(id) {
  const provider = provType(id)
  if (!isOauthType(provider)) { toast('\u5F53\u524D\u6E20\u9053\u7C7B\u578B\u4E0D\u652F\u6301 OAuth \u6388\u6743', 'error'); return }
  const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
  if (tr) showSpinner(tr)
  try {
    const baseEl = document.getElementById(id === 'new' ? 'aurl' : 'url-' + id)
    const baseUrl = baseEl ? baseEl.value.trim() : ''
    const r = await fetch('/admin/api/oauth/' + provider + '/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ baseUrl: baseUrl, region: cbRegionValue(id) }) })
    const d = await r.json()
    if (!d.success || !d.data) { if (tr) showResult(tr, false, d.message || '\u53D1\u8D77\u6388\u6743\u5931\u8D25'); return }
    if (d.data.mode === 'redirect') {
      // claude / codex: \u6253\u5F00\u5B98\u65B9\u6388\u6743\u9875\uFF0C\u56DE\u8C03\u5230 localhost\uFF08\u65E0\u6CD5\u8BBF\u95EE\u5C5E\u6B63\u5E38\uFF09\uFF0C\u7C98\u8D34 code \u6362 token
      const w = window.open('', '_blank')
      if (w) { try { w.location.href = d.data.url } catch (e) { /* \u5F39\u7A97\u88AB\u62E6\u622A\u65F6\u5FFD\u7565 */ } }
      else window.open(d.data.url, '_blank')
      const loopback = provider === 'claude' ? 'localhost:54545' : 'localhost:1455'
      const pname = provider === 'claude' ? 'Claude' : 'ChatGPT'
      showM('<h3><i class="fas fa-key c-p"></i> ' + pname + ' \u6388\u6743</h3><p class="form-helper" style="margin-bottom:8px">\u5728\u6253\u5F00\u7684\u5B98\u65B9\u9875\u9762\u767B\u5F55\u5E76\u540C\u610F\u6388\u6743\u3002\u6388\u6743\u540E\u6D4F\u89C8\u5668\u4F1A\u8DF3\u8F6C\u5230 <code>' + loopback + '</code> \u5E76\u63D0\u793A\u300C\u65E0\u6CD5\u8BBF\u95EE\u300D\u2014\u2014 \u8FD9\u662F\u6B63\u5E38\u7684\uFF0C\u628A\u5730\u5740\u680F <code>code=</code> \u540E\u9762\u90A3\u6BB5\uFF08\u6216\u6574\u6BB5\u5730\u5740\uFF09\u590D\u5236\u5230\u4E0B\u9762\u3002</p><div class="fg"><label>code \u6216\u56DE\u8C03\u5730\u5740</label><textarea id="oacode" rows="3" class="fx1" placeholder="' + (provider === 'claude' ? 'e2ec2f0a...' : 'eyJ... \u6216 http://localhost:1455/auth/callback?code=...') + '"></textarea></div><div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button><button class="btn btn-p" id="oaok">\u5B8C\u6210\u6388\u6743</button></div>')
      const oaok = document.getElementById('oaok')
      oaok.onclick = async function () {
        const code = document.getElementById('oacode').value.trim()
        if (!code) { toast('\u8BF7\u7C98\u8D34 code', 'error'); return }
        oaok.disabled = true
        try {
          const rr = await fetch('/admin/api/oauth/' + provider + '/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code, state: d.data.state }) })
          const dd = await rr.json()
          if (dd.success && dd.data && dd.data.refresh_token) {
            closeM()
            addKeyValue(id, dd.data.refresh_token)
            toast('\u6388\u6743\u6210\u529F\uFF0Crefresh_token \u5DF2\u586B\u5165 API Keys\uFF0C\u4FDD\u5B58\u6E20\u9053\u540E\u751F\u6548', 'success')
            if (tr) showResult(tr, true, '')
          } else {
            toast(dd.message || '\u6362\u53D6 token \u5931\u8D25', 'error')
            oaok.disabled = false
          }
        } catch (e) { toast('\u8BF7\u6C42\u5931\u8D25', 'error'); oaok.disabled = false }
      }
    } else if (d.data.mode === 'redirect-poll') {
      // CodeBuddy(\u817E\u8BAF)\uFF1A\u6253\u5F00\u767B\u5F55\u9875\uFF0C\u767B\u5F55\u5B8C\u6210\u540E\u7F51\u5173\u81EA\u52A8\u8F6E\u8BE2\u6362\u53D6 refresh_token\uFF08\u65E0\u9700\u590D\u5236 code\uFF09
      window.open(d.data.url, '_blank')
      const realmName = d.data.realm === 'global' ? '\u56FD\u9645\u7248 (workbuddy.ai)' : '\u56FD\u5185\u7248 (codebuddy.cn)'
      showM('<h3><i class="fas fa-key c-p"></i> CodeBuddy \u6388\u6743</h3>'
        + '<p class="form-helper" style="margin-bottom:8px">\u5DF2\u5C1D\u8BD5\u5728\u65B0\u7A97\u53E3\u6253\u5F00\u817E\u8BAF\u767B\u5F55\u9875\uFF08' + realmName + '\uFF09\u3002\u82E5\u6D4F\u89C8\u5668\u62E6\u622A\u4E86\u5F39\u7A97\uFF0C\u8BF7\u70B9\u4E0B\u9762\u7684\u6309\u94AE\u6253\u5F00\u3002\u7528\u4F60\u7684 CodeBuddy / WorkBuddy \u8D26\u53F7\u5B8C\u6210\u767B\u5F55\u5373\u53EF\uFF0C<b>\u65E0\u9700\u590D\u5236\u4EFB\u4F55 code</b> \u2014\u2014 \u767B\u5F55\u5B8C\u6210\u540E\u672C\u9875\u4F1A\u81EA\u52A8\u68C0\u6D4B\u5E76\u586B\u5165 refresh_token\u3002</p>'
        + '<p style="margin:8px 0"><a class="btn btn-p" href="' + escapeHtml(d.data.url) + '" target="_blank" rel="noreferrer"><i class="fas fa-external-link-alt" aria-hidden="true"></i> \u6253\u5F00\u767B\u5F55\u9875</a></p>'
        + '<div class="fg"><label>\u6388\u6743\u94FE\u63A5\uFF08\u6253\u4E0D\u5F00\u65F6\u590D\u5236\u5230\u6D4F\u89C8\u5668\uFF09</label><input type="text" class="fx1" value="' + escapeHtml(d.data.url) + '" readonly onclick="this.select()"></div>'
        + '<div id="oadev" class="mu"><i class="fas fa-spinner fa-spin"></i> \u7B49\u5F85\u767B\u5F55\u5B8C\u6210...</div>'
        + '<div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button></div>')
      pollDeviceFlow(provider, d.data.state, id, tr, document.getElementById('oadev'))
    } else {
      // \u8BBE\u5907\u7801\u6D41\u7A0B\uFF1A\u6253\u5F00\u5E26 user_code \u7684\u5B8C\u6574\u6388\u6743\u94FE\u63A5\uFF08\u7F3A user_code \u53C2\u6570\u65F6\u9875\u9762\u4F1A\u62A5\u9519\uFF09\uFF0C\u5E76\u81EA\u52A8\u8F6E\u8BE2
      const complete = d.data.verification_uri_complete
        || (d.data.verification_uri ? d.data.verification_uri + '?user_code=' + encodeURIComponent(d.data.user_code || '') : '')
      window.open(complete, '_blank')
      const pname = provider === 'kimi' ? 'Kimi' : provider === 'qwen' ? 'Qwen' : provider === 'cline' ? 'Cline' : 'Grok'
      showM('<h3><i class="fas fa-key c-p"></i> ' + pname + ' \u8BBE\u5907\u7801\u6388\u6743</h3>'
        + '<p class="form-helper" style="margin-bottom:8px">\u5DF2\u5C1D\u8BD5\u5728\u65B0\u7A97\u53E3\u6253\u5F00\u6388\u6743\u9875\u9762\uFF08\u94FE\u63A5\u5DF2\u81EA\u52A8\u5E26\u4E0A\u9A8C\u8BC1\u7801\uFF09\u3002\u82E5\u6D4F\u89C8\u5668\u62E6\u622A\u4E86\u5F39\u7A97\uFF0C\u8BF7\u70B9\u51FB\u4E0B\u9762\u7684\u6309\u94AE\u6253\u5F00\u2014\u2014<b>\u5FC5\u987B\u4F7F\u7528\u5E26 user_code \u7684\u5B8C\u6574\u94FE\u63A5</b>\uFF0C\u76F4\u63A5\u6253\u5F00\u9A8C\u8BC1\u5730\u5740\u4F1A\u63D0\u793A\u300C\u7F3A\u5C11 user_code \u53C2\u6570\u300D\u3002</p>'
        + '<p style="margin:8px 0"><a class="btn btn-p" href="' + escapeHtml(complete) + '" target="_blank" rel="noreferrer"><i class="fas fa-external-link-alt" aria-hidden="true"></i> \u6253\u5F00\u6388\u6743\u9875\u9762</a></p>'
        + '<div class="fg"><label>\u9A8C\u8BC1\u7801 User Code\uFF08\u9875\u9762\u8981\u6C42\u624B\u52A8\u8F93\u5165\u65F6\u4F7F\u7528\uFF09</label><input type="text" class="fx1" value="' + escapeHtml(d.data.user_code || '') + '" readonly onclick="this.select()"></div>'
        + '<div class="fg"><label>\u5B8C\u6574\u6388\u6743\u94FE\u63A5\uFF08\u6253\u4E0D\u5F00\u65F6\u590D\u5236\u5230\u6D4F\u89C8\u5668\uFF09</label><input type="text" class="fx1" value="' + escapeHtml(complete) + '" readonly onclick="this.select()"></div>'
        + '<div id="oadev" class="mu"><i class="fas fa-spinner fa-spin"></i> \u7B49\u5F85\u6388\u6743\u786E\u8BA4...</div>'
        + '<div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button></div>')
      pollDeviceFlow(provider, d.data.state, id, tr, document.getElementById('oadev'))
    }
  } catch (e) {
    if (tr) showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25')
  }
}

// \u8BBE\u5907\u7801\u6388\u6743\u8F6E\u8BE2\uFF08\u5F39\u7A97\u5173\u95ED\u540E\u81EA\u52A8\u505C\u6B62\uFF09
async function pollDeviceFlow(provider, state, id, tr, boxEl) {
  const intervalMs = 5000
  // \u7ED1\u5B9A\u672C\u6B21\u5F39\u7A97\u8282\u70B9: \u82E5\u8BE5\u8282\u70B9\u5DF2\u88AB\u65B0\u5F39\u7A97\u66FF\u6362(\u518D\u6B21\u70B9\u51FB\u6388\u6743), \u65E7\u6D41\u7A0B\u7ACB\u5373\u9000\u51FA, \u907F\u514D\u628A\u8FC7\u671F\u9519\u8BEF\u5199\u8FDB\u65B0\u5F39\u7A97
  const box = boxEl || document.getElementById('oadev')
  for (;;) {
    await new Promise(function (res) { setTimeout(res, intervalMs) })
    if (!box || !document.body.contains(box)) return
    try {
      const r = await fetch('/admin/api/oauth/' + provider + '/poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: state }) })
      const d = await r.json()
      if (!d.success || !d.data) {
        box.innerHTML = '<span class="c-e">' + escapeHtml(d.message || '\u8F6E\u8BE2\u5931\u8D25') + '</span>'
        return
      }
      if (d.data.status === 'ok') {
        var tok = d.data.refresh_token || d.data.refreshToken
        if (!tok) { box.innerHTML = '<span class="c-e">\u6388\u6743\u6210\u529F\u4F46\u672A\u8FD4\u56DE\u4EE4\u724C\uFF0C\u8BF7\u91CD\u8BD5</span>'; return }
        addKeyValue(id, tok)
        closeM()
        toast('\u6388\u6743\u6210\u529F\uFF0Crefresh_token \u5DF2\u586B\u5165 API Keys\uFF0C\u4FDD\u5B58\u6E20\u9053\u540E\u751F\u6548', 'success')
        if (tr) showResult(tr, true, '')
        return
      }
      if (d.data.status === 'error') {
        box.innerHTML = '<span class="c-e">' + escapeHtml(d.data.message || '\u6388\u6743\u5931\u8D25') + '</span>'
        return
      }
    } catch (e) {
    }
  }
}

// CodeBuddy: \u67E5\u8BE2\u8D26\u53F7\u79EF\u5206/\u5957\u9910\u4F59\u989D\uFF08\u53D6\u6E20\u9053\u7B2C\u4E00\u4E2A\u542F\u7528\u51ED\u636E\uFF0C\u6216\u65B0\u589E\u6001\u8868\u5355\u91CC\u7684\u503C\uFF09
async function codebuddyStatus(id) {
  const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
  const box = document.getElementById(id === 'new' ? 'cbst-new' : 'cbst-' + id)
  let key = ''
  if (id === 'new') {
    const first = document.querySelector('#akeys .aki')
    key = first ? first.value.trim() : ''
  } else {
    const keys = getKeys(id)
    key = keys.length > 0 ? keys[0].key : ''
  }
  if (!key) { toast('\u8BF7\u5148\u586B\u5199 refresh_token\uFF08\u6216\u70B9\u300C\u6388\u6743\u767B\u5F55\u300D\u81EA\u52A8\u83B7\u53D6\uFF09', 'error'); return }
  if (tr) showSpinner(tr)
  if (box) box.innerHTML = '<span class="mu"><i class="fas fa-spinner fa-spin"></i> \u67E5\u8BE2\u4E2D...</span>'
  try {
    const baseEl = document.getElementById(id === 'new' ? 'aurl' : 'url-' + id)
    const baseUrl = baseEl ? baseEl.value.trim() : ''
    const r = await fetch('/admin/api/codebuddy/status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: key, baseUrl: baseUrl, region: cbRegionValue(id) }),
    })
    const d = await r.json()
    if (tr) showResult(tr, !!(d.success && d.data && d.data.ok), (d.success && d.data && d.data.ok) ? '' : (d.message || (d.data && d.data.message) || '\u67E5\u8BE2\u5931\u8D25'))
    if (!d.success || !d.data || !d.data.ok) {
      if (box) box.innerHTML = '<span class="c-e">' + escapeHtml(d.message || (d.data && d.data.message) || '\u67E5\u8BE2\u5931\u8D25') + '</span>'
      return
    }
    const s = d.data
    const num = function (v) { return (Number(v) || 0).toLocaleString() }
    const cell = 'display:inline-block;min-width:96px;color:var(--text-dim,#888);font-size:12px'
    const val = 'display:inline-block;font-weight:600'
    let html = '<div style="padding:10px 12px;border:1px solid var(--border,#333);border-radius:8px;margin-top:8px">'
      + '<div style="margin-bottom:6px"><span style="' + cell + '">\u8D26\u53F7</span><span style="' + val + '">' + escapeHtml(s.nickname || s.uid || '\u672A\u77E5') + '</span></div>'
      + '<div style="margin-bottom:6px"><span style="' + cell + '">\u533A\u57DF</span><span style="' + val + '">' + (s.realm === 'global' ? '\u56FD\u9645\u7248 (workbuddy.ai)' : '\u56FD\u5185\u7248 (codebuddy.cn)') + '</span></div>'
      + '<div style="margin-bottom:6px"><span style="' + cell + '">\u5269\u4F59\u79EF\u5206</span><span style="' + val + ';color:#22c55e">' + num(s.remain) + '</span></div>'
      + '<div style="margin-bottom:6px"><span style="' + cell + '">\u5DF2\u7528 / \u603B\u91CF</span><span style="' + val + '">' + num(s.used) + ' / ' + num(s.size) + '</span></div>'
      + '<div><span style="' + cell + '">\u5957\u9910\u6570</span><span style="' + val + '">' + (s.packs || 0) + '</span></div>'
      + '</div>'
    if (s.packages && s.packages.length) {
      const th = 'text-align:left;padding:4px 8px;border-bottom:1px solid var(--border,#333);font-size:12px;color:var(--text-dim,#888)'
      const td = 'padding:4px 8px;font-size:12px'
      html += '<table style="border-collapse:collapse;margin-top:8px;width:100%"><thead><tr>'
        + '<th style="' + th + '">\u5957\u9910</th><th style="' + th + '">\u5269\u4F59</th><th style="' + th + '">\u5DF2\u7528</th><th style="' + th + '">\u603B\u91CF</th><th style="' + th + '">\u5230\u671F</th>'
        + '</tr></thead><tbody>'
      for (const p of s.packages) {
        html += '<tr><td style="' + td + '">' + escapeHtml(p.name) + '</td><td style="' + td + '">' + num(p.remain) + '</td><td style="' + td + '">' + num(p.used) + '</td><td style="' + td + '">' + num(p.size) + '</td><td style="' + td + '">' + escapeHtml(p.endTime || '-') + '</td></tr>'
      }
      html += '</tbody></table>'
    }
    if (box) box.innerHTML = html
  } catch (e) {
    if (tr) showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25')
    if (box) box.innerHTML = '<span class="c-e">\u8BF7\u6C42\u5931\u8D25</span>'
  }
}

// CodeBuddy: \u6BCF\u65E5\u7B7E\u5230\uFF08\u5355\u8D26\u53F7\uFF0C\u53D6\u6E20\u9053\u7B2C\u4E00\u4E2A\u542F\u7528\u51ED\u636E\uFF1B\u540E\u7AEF\u7B7E\u5230\u6210\u529F\u540E\u4F1A\u987A\u5E26\u5237\u65B0\u4F59\u989D\uFF09
async function codebuddyCheckin(id) {
  const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
  const box = document.getElementById(id === 'new' ? 'cbst-new' : 'cbst-' + id)
  let key = ''
  if (id === 'new') {
    const first = document.querySelector('#akeys .aki')
    key = first ? first.value.trim() : ''
  } else {
    const keys = getKeys(id)
    key = keys.length > 0 ? keys[0].key : ''
  }
  if (!key) { toast('\u8BF7\u5148\u586B\u5199 refresh_token\uFF08\u6216\u70B9\u300C\u6388\u6743\u767B\u5F55\u300D\u81EA\u52A8\u83B7\u53D6\uFF09', 'error'); return }
  if (tr) showSpinner(tr)
  if (box) box.innerHTML = '<span class="mu"><i class="fas fa-spinner fa-spin"></i> \u7B7E\u5230\u4E2D...</span>'
  try {
    const baseEl = document.getElementById(id === 'new' ? 'aurl' : 'url-' + id)
    const baseUrl = baseEl ? baseEl.value.trim() : ''
    const r = await fetch('/admin/api/codebuddy/checkin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: key, baseUrl: baseUrl, region: cbRegionValue(id) }),
    })
    const d = await r.json()
    const ok = !!(d.success && d.data && d.data.ok)
    if (tr) showResult(tr, ok, ok ? '' : (d.message || (d.data && d.data.message) || '\u7B7E\u5230\u5931\u8D25'))
    if (!ok) {
      if (box) box.innerHTML = '<span class="c-e">' + escapeHtml(d.message || (d.data && d.data.message) || '\u7B7E\u5230\u5931\u8D25') + '</span>'
      return
    }
    const s = d.data
    const num = function (v) { return (Number(v) || 0).toLocaleString() }
    const cell = 'display:inline-block;min-width:96px;color:var(--text-dim,#888);font-size:12px'
    const val = 'display:inline-block;font-weight:600'
    let html = '<div style="padding:10px 12px;border:1px solid var(--border,#333);border-radius:8px;margin-top:8px">'
      + '<div style="margin-bottom:6px"><span style="' + cell + '">\u7ED3\u679C</span><span style="' + val + ';color:#22c55e">' + (s.already ? '\u4ECA\u65E5\u5DF2\u7B7E\u5230' : '\u7B7E\u5230\u6210\u529F') + '</span></div>'
      + '<div style="margin-bottom:6px"><span style="' + cell + '">\u8D26\u53F7</span><span style="' + val + '">' + escapeHtml(s.nickname || s.uid || '\u672A\u77E5') + '</span></div>'
      + '<div style="margin-bottom:6px"><span style="' + cell + '">\u533A\u57DF</span><span style="' + val + '">' + (s.realm === 'global' ? '\u56FD\u9645\u7248 (workbuddy.ai)' : '\u56FD\u5185\u7248 (codebuddy.cn)') + '</span></div>'
    if (typeof s.reward === 'number' && s.reward > 0) {
      html += '<div style="margin-bottom:6px"><span style="' + cell + '">\u672C\u6B21\u5956\u52B1</span><span style="' + val + ';color:#22c55e">+' + num(s.reward) + '</span></div>'
    }
    if (typeof s.remain === 'number') {
      html += '<div><span style="' + cell + '">\u5269\u4F59\u79EF\u5206</span><span style="' + val + ';color:#22c55e">' + num(s.remain) + '</span></div>'
    }
    html += '</div>'
    if (box) box.innerHTML = html
  } catch (e) {
    if (tr) showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25')
    if (box) box.innerHTML = '<span class="c-e">\u8BF7\u6C42\u5931\u8D25</span>'
  }
}

// DeepSeek: \u5F15\u5BFC\u5F0F\u5F39\u7A97\u6536 userToken\uFF08\u628A\u624B\u6284 localStorage \u7684\u6B65\u9AA4\u964D\u7EA7\u6210\u300C\u7C98\u4E00\u6BB5\u5B57\u7B26\u4E32\u300D\uFF09
function openDeepseekTokenDialog(id) {
  const already = id === 'new'
    ? (document.querySelector('#akeys .aki') || {}).value || ''
    : (getKeys(id)[0] || {}).key || ''
  showM(
    '<h3><i class="fas fa-key c-p"></i> \u83B7\u53D6\u5E76\u586B\u5165 userToken</h3>'
    + '<p class="form-helper" style="margin-bottom:8px">'
    + 'userToken \u662F DeepSeek \u7F51\u9875\u7248\u7684\u767B\u5F55\u51ED\u636E\uFF08JWT\uFF0C\u7EA6 24 \u5C0F\u65F6\u8FC7\u671F\uFF09\u3002\u6309\u4E0B\u9762\u4E09\u6B65\u53D6\u51FA\u6765\uFF0C\u7C98\u5230\u6846\u91CC\u5373\u53EF\u3002'
    + '</p>'
    + '<ol class="ds-steps">'
    + '<li>\u6253\u5F00 <a href="https://chat.deepseek.com" target="_blank" rel="noopener noreferrer">chat.deepseek.com</a> \u5E76<b>\u767B\u5F55</b>\u4F60\u7684\u8D26\u53F7</li>'
    + '<li>\u6309 <kbd>F12</kbd> \u6253\u5F00\u5F00\u53D1\u8005\u5DE5\u5177 \u2192 \u5207\u5230 <b>Application</b>\uFF08\u4E2D\u6587\u754C\u9762\u4E3A\u300C\u5E94\u7528\u300D\uFF09</li>'
    + '<li>\u5DE6\u4FA7\u5C55\u5F00 <b>Local Storage</b> \u2192 \u70B9 <code>https://chat.deepseek.com</code>\uFF0C'
    + '\u5728\u53F3\u4FA7\u5217\u8868\u627E\u5230 <code>userToken</code>\uFF0C\u53CC\u51FB\u5B83\u7684\u503C\u5168\u9009\u590D\u5236</li>'
    + '</ol>'
    + '<details class="ds-alt"><summary>\u627E\u4E0D\u5230 userToken\uFF1F\u6362\u4E2A\u4F4D\u7F6E\u627E\uFF08Console \u4E00\u884C\u547D\u4EE4\uFF09</summary>'
    + '<p class="form-helper" style="margin:8px 0 4px">\u5728\u5F00\u53D1\u8005\u5DE5\u5177\u7684 <b>Console</b> \u91CC\u7C98\u8D34\u4E0B\u9762\u8FD9\u884C\u5E76\u56DE\u8F66\uFF0C'
    + '\u5B83\u4F1A\u76F4\u63A5\u628A token \u590D\u5236\u5230\u526A\u8D34\u677F\uFF1A</p>'
    + '<code class="ds-code">copy(localStorage.getItem(&#39;userToken&#39;))</code>'
    + '</details>'
    + '<div class="fg" style="margin-top:10px"><label for="ds-tok">\u7C98\u8D34 userToken</label>'
    + '<textarea id="ds-tok" rows="4" class="fx1" placeholder="eyJhbGciOi...\uFF08\u4EE5 eyJ \u5F00\u5934\u7684\u957F\u5B57\u7B26\u4E32\uFF0C\u6216 sk- \u5F00\u5934\u7684\u5B98\u65B9 API Key\uFF09" spellcheck="false"></textarea>'
    + '<span class="form-helper" id="ds-tok-hint">'
    + '\u652F\u6301\u4E24\u79CD\u51ED\u636E\uFF1A<b>\u7F51\u9875 userToken</b>\uFF08<code>eyJ\u2026</code>\uFF09\u8D70\u7F51\u9875\u53CD\u4EE3\uFF0C\u9700 Workers Paid\uFF1B'
    + '<b>\u5B98\u65B9 API Key</b>\uFF08<code>sk-\u2026</code>\uFF09\u76F4\u8FDE api.deepseek.com\uFF0C\u514D\u8D39\u7248\u4E5F\u80FD\u7528\u3002'
    + '</span></div>'
    + '<div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button>'
    + '<button class="btn btn-p" id="ds-tok-ok"><i class="fas fa-check" aria-hidden="true"></i> \u586B\u5165\u5E76\u9A8C\u8BC1</button></div>'
  )
  const ta = document.getElementById('ds-tok')
  if (ta) {
    if (already) ta.value = already
    ta.focus()
    // \u7C98\u8D34\u540E\u5373\u65F6\u63D0\u793A\u8BC6\u522B\u5230\u7684\u51ED\u636E\u7C7B\u578B
    ta.addEventListener('input', function () {
      const v = ta.value.trim()
      const hint = document.getElementById('ds-tok-hint')
      if (!hint) return
      if (!v) { hint.classList.remove('c-e', 'c-s'); return }
      const isOfficial = /^sk-[A-Za-z0-9]/.test(v)
      const isJwt = /^eyJ[A-Za-z0-9_-]*./.test(v)
      if (isOfficial) { hint.textContent = '\u2713 \u8BC6\u522B\u4E3A\u5B98\u65B9 API Key\uFF08sk- \u5F00\u5934\uFF09\u2192 \u76F4\u8FDE api.deepseek.com\uFF0C\u514D\u8D39\u7248\u53EF\u7528'; hint.classList.add('c-s'); hint.classList.remove('c-e') }
      else if (isJwt) { hint.textContent = '\u2713 \u8BC6\u522B\u4E3A\u7F51\u9875 userToken\uFF08JWT\uFF09\u2192 \u8D70\u7F51\u9875\u53CD\u4EE3\uFF0C\u9700 Workers Paid'; hint.classList.add('c-s'); hint.classList.remove('c-e') }
      else { hint.textContent = '\u26A0 \u770B\u8D77\u6765\u4E0D\u50CF sk- \u5F00\u5934\u7684 API Key\uFF0C\u4E5F\u4E0D\u50CF eyJ \u5F00\u5934\u7684 JWT\uFF0C\u8BF7\u786E\u8BA4\u590D\u5236\u5B8C\u6574'; hint.classList.add('c-e'); hint.classList.remove('c-s') }
    })
  }
  const okBtn = document.getElementById('ds-tok-ok')
  if (okBtn) okBtn.onclick = function () { applyDeepseekToken(id) }
}

// DeepSeek \u65B9\u6848 B: \u8D26\u53F7\u6258\u7BA1\uFF08\u7F51\u5173\u4EE3\u767B\u5F55\uFF09\u5F39\u7A97
// \u6536\u96C6\u90AE\u7BB1/\u624B\u673A\u53F7 + \u5BC6\u7801 -> \u540E\u7AEF\u52A0\u5BC6\u5B58\u50A8 -> \u7ACB\u523B\u4EE3\u767B\u5F55\u6362 userToken -> \u586B\u5165 API Keys
function openDeepseekAccountDialog(id) {
  const el = document.getElementById('dsacc-' + id)
  const acc = el ? JSON.parse(el.textContent || '{}') : {}
  const has = !!(acc.hasPassword || acc.tokenSet)
  showM(
    '<h3><i class="fas fa-user-shield c-p"></i> DeepSeek \u8D26\u53F7\u4EE3\u767B\u5F55</h3>'
    + '<p class="form-helper" style="margin-bottom:8px">'
    + '\u586B\u5165 DeepSeek \u7F51\u9875\u7248\u8D26\u53F7\uFF0C\u7F51\u5173\u4F1A\u7528<b>\u4E0E\u8BE5\u8D26\u53F7\u4E00\u81F4\u7684\u8BBE\u5907\u8EAB\u4EFD</b>\u8C03\u5B98\u65B9\u767B\u5F55\u63A5\u53E3\u6362\u53D6 userToken\uFF0C'
    + '\u514D\u53BB\u624B\u52A8\u4ECE\u6D4F\u89C8\u5668\u62A0 token\u3002'
    + '</p>'
    + '<div class="ds-warn"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i>'
    + '<div><b>\u5BC6\u7801\u4F1A\u4FDD\u5B58\u5728\u8FD9\u5957\u7F51\u5173\u91CC</b>\uFF08AES-GCM \u52A0\u5BC6\uFF0C\u5BC6\u94A5\u7531\u7BA1\u7406\u5458\u5BC6\u7801\u6D3E\u751F\uFF09\u3002'
    + '\u82E5\u4F60\u6539\u8FC7\u7BA1\u7406\u5458\u5BC6\u7801\uFF0C\u5DF2\u5B58\u5BC6\u7801\u5C06\u65E0\u6CD5\u89E3\u5BC6\uFF0C\u9700\u8981\u91CD\u65B0\u586B\u5199\u3002'
    + '\u4E0D\u60F3\u6258\u7BA1\u5BC6\u7801\uFF0C\u8BF7\u6539\u7528\u4E0A\u9762\u7684\u300C\u7C98\u8D34 userToken\u300D\u3002</div></div>'
    + (has ? '<p class="form-helper" style="margin:8px 0"><b class="c-s">\u5DF2\u6258\u7BA1\uFF1A</b>'
      + escapePageHtml(acc.mobile || acc.email || '')
      + (acc.hasPassword ? ' \xB7 \u5DF2\u5B58\u5BC6\u7801' : ' \xB7 \u672A\u5B58\u5BC6\u7801')
      + (acc.tokenSet ? ' \xB7 \u6301\u6709 token ' + escapePageHtml(acc.tokenPreview || '') : ' \xB7 \u65E0 token')
      + (acc.lastLoginAt ? ' \xB7 \u4E0A\u6B21\u767B\u5F55 ' + escapePageHtml(String(acc.lastLoginAt).slice(0, 16).replace('T', ' ')) : '')
      + (acc.lastLoginResult && acc.lastLoginResult !== 'ok' ? ' \xB7 <span class="c-e">\u4E0A\u6B21\uFF1A' + escapePageHtml(acc.lastLoginResult) + '</span>' : '')
      + '</p>' : '')
    + '<div class="fr">'
    + '<div class="fg"><label for="dsa-mobile">\u624B\u673A\u53F7</label>'
    + '<input type="text" id="dsa-mobile" placeholder="13800138000" autocomplete="off" value="' + escapePageHtml(acc.mobile || '') + '"></div>'
    + '<div class="fg"><label for="dsa-area">\u533A\u53F7</label>'
    + '<input type="text" id="dsa-area" placeholder="+86" value="' + escapePageHtml(acc.areaCode || '+86') + '"></div>'
    + '</div>'
    + '<div class="fg"><label for="dsa-email">\u6216\u7528\u90AE\u7BB1</label>'
    + '<input type="text" id="dsa-email" placeholder="you@example.com" autocomplete="off" value="' + escapePageHtml(acc.email || '') + '">'
    + '<span class="form-helper">\u624B\u673A\u53F7\u4E0E\u90AE\u7BB1\u586B\u4E00\u4E2A\u5373\u53EF\uFF1B\u90FD\u586B\u65F6\u4EE5\u624B\u673A\u53F7\u767B\u5F55\u3002</span></div>'
    + '<div class="fg"><label for="dsa-pass">\u5BC6\u7801' + (acc.hasPassword ? '\uFF08\u7559\u7A7A\u5219\u7528\u5DF2\u5B58\u5BC6\u7801\uFF09' : '') + '</label>'
    + '<input type="password" id="dsa-pass" placeholder="' + (acc.hasPassword ? '\u5DF2\u4FDD\u5B58\uFF0C\u7559\u7A7A\u6CBF\u7528' : 'DeepSeek \u767B\u5F55\u5BC6\u7801') + '" autocomplete="new-password">'
    + '<span class="form-helper">\u5BC6\u7801\u53EA\u7528\u4E8E\u6362\u53D6 token\uFF0C\u4E0D\u4F1A\u56DE\u663E\uFF1B\u586B\u5199\u540E\u4F1A\u52A0\u5BC6\u4FDD\u5B58\uFF0C\u4E0B\u6B21\u53EF\u7559\u7A7A\u3002</span></div>'
    + '<div class="fa">'
    + (has ? '<button class="btn btn-s" id="dsa-clear"><i class="fas fa-trash" aria-hidden="true"></i> \u6E05\u9664\u6258\u7BA1</button>' : '')
    + '<button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button>'
    + '<button class="btn btn-p" id="dsa-ok"><i class="fas fa-right-to-bracket" aria-hidden="true"></i> \u767B\u5F55\u5E76\u586B\u5165</button>'
    + '</div>'
  )

  const clearBtn = document.getElementById('dsa-clear')
  if (clearBtn) clearBtn.onclick = function () { clearDeepseekAccount(id) }
  const okBtn = document.getElementById('dsa-ok')
  if (okBtn) okBtn.onclick = function () { submitDeepseekAccount(id) }
}

// \u63D0\u4EA4\u8D26\u53F7\u4EE3\u767B\u5F55\uFF1A\u5148\u5B58\u8D26\u53F7\uFF08\u53EF\u9009\u5BC6\u7801\uFF09\uFF0C\u518D\u89E6\u53D1\u767B\u5F55\uFF0C\u6210\u529F\u540E\u628A token \u5199\u8FDB API Keys
async function submitDeepseekAccount(id) {
  const mobile = (document.getElementById('dsa-mobile') || {}).value || ''
  const area = (document.getElementById('dsa-area') || {}).value || ''
  const email = (document.getElementById('dsa-email') || {}).value || ''
  const pass = (document.getElementById('dsa-pass') || {}).value || ''
  if (!mobile.trim() && !email.trim()) { toast('\u8BF7\u586B\u5199\u624B\u673A\u53F7\u6216\u90AE\u7BB1', 'error'); return }
  if (id === 'new') { toast('\u8BF7\u5148\u521B\u5EFA\u6E20\u9053\uFF0C\u518D\u914D\u7F6E\u8D26\u53F7\u4EE3\u767B\u5F55', 'error'); return }

  const okBtn = document.getElementById('dsa-ok')
  if (okBtn) { okBtn.disabled = true; okBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> \u767B\u5F55\u4E2D\u2026' }

  try {
    // 1) \u4FDD\u5B58\u8D26\u53F7\u4FE1\u606F\uFF08\u542B\u5BC6\u7801\uFF0C\u82E5\u6709\uFF09
    const saveBody = { mobile: mobile.trim(), areaCode: area.trim(), email: email.trim() }
    if (pass) saveBody.password = pass
    const sr = await fetch('/admin/api/providers/' + encodeURIComponent(id) + '/ds-account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveBody),
    })
    const sj = await sr.json().catch(function () { return {} })
    if (!sr.ok || sj.success === false) {
      throw new Error((sj.message || sj.error && sj.error.message || '\u4FDD\u5B58\u8D26\u53F7\u5931\u8D25'))
    }

    // 2) \u89E6\u53D1\u4EE3\u767B\u5F55
    const lr = await fetch('/admin/api/providers/' + encodeURIComponent(id) + '/ds-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pass ? { password: pass } : {}),
    })
    const lj = await lr.json().catch(function () { return {} })
    if (!lj.success) {
      const msg = lj.message || '\u767B\u5F55\u5931\u8D25'
      if (okBtn) { okBtn.disabled = false; okBtn.innerHTML = '<i class="fas fa-rotate-right" aria-hidden="true"></i> \u91CD\u8BD5' }
      toast('\u4EE3\u767B\u5F55\u5931\u8D25\uFF1A' + msg, 'error')
      location.reload() // \u5237\u65B0\uFF0C\u8BA9\u300C\u4E0A\u6B21\uFF1Axxx\u300D\u663E\u793A\u51FA\u6765
      return
    }
    const token = lj.data && lj.data.dsAccount && lj.data.dsAccount.userToken
    if (!token) {
      toast('\u767B\u5F55\u6210\u529F\u4F46\u672A\u8FD4\u56DE token\uFF0C\u8BF7\u91CD\u8BD5', 'error')
      if (okBtn) { okBtn.disabled = false; okBtn.innerHTML = '<i class="fas fa-rotate-right" aria-hidden="true"></i> \u91CD\u8BD5' }
      return
    }

    // 3) \u628A token \u5199\u8FDB\u8BE5\u6E20\u9053\u7684 API Keys \u8F93\u5165\u6846
    fillDeepseekKeyInput(id, token)
    toast(lj.message || '\u4EE3\u767B\u5F55\u6210\u529F\uFF0CuserToken \u5DF2\u586B\u5165\uFF0C\u8BF7\u70B9\u300C\u4FDD\u5B58\u300D', 'success')
    closeM()
    location.reload()
  } catch (e) {
    if (okBtn) { okBtn.disabled = false; okBtn.innerHTML = '<i class="fas fa-right-to-bracket" aria-hidden="true"></i> \u767B\u5F55\u5E76\u586B\u5165' }
    toast(String(e && e.message || e), 'error')
  }
}

// \u79FB\u9664\u8D26\u53F7\u6258\u7BA1\uFF08\u6E05\u5BC6\u7801\u4E0E token\uFF09
async function clearDeepseekAccount(id) {
  const yes = await cM('\u786E\u5B9A\u6E05\u9664\u8BE5\u6E20\u9053\u6258\u7BA1\u7684 DeepSeek \u8D26\u53F7\uFF1F\u5DF2\u4FDD\u5B58\u7684\u5BC6\u7801\u4E0E token \u90FD\u4F1A\u88AB\u5220\u9664\u3002')
  if (!yes) return
  try {
    const r = await fetch('/admin/api/providers/' + encodeURIComponent(id) + '/ds-account', { method: 'DELETE' })
    const j = await r.json().catch(function () { return {} })
    if (!j.success) { toast('\u6E05\u9664\u5931\u8D25\uFF1A' + (j.message || '\u672A\u77E5\u9519\u8BEF'), 'error'); return }
    toast('\u5DF2\u6E05\u9664\u6258\u7BA1\u8D26\u53F7', 'success')
    closeM()
    location.reload()
  } catch (e) { toast('\u6E05\u9664\u5931\u8D25\uFF1A' + String(e && e.message || e), 'error') }
}

// \u628A DeepSeek token \u5199\u8FDB\u6307\u5B9A\u6E20\u9053\u7684 API Keys \u8F93\u5165\u6846\uFF08\u4F9B\u4EE3\u767B\u5F55\u4E0E\u7C98\u8D34\u5171\u7528\uFF09
function fillDeepseekKeyInput(id, v) {
  let input = null
  if (id === 'new') {
    input = document.querySelector('#akeys .aki')
    if (!input && typeof addAKeyRow === 'function') { addAKeyRow(); input = document.querySelector('#akeys .aki:last-of-type') }
  } else {
    const rows = document.querySelectorAll('#keys-' + id + ' [data-kidx]')
    if (rows.length > 0) {
      input = document.getElementById('k-' + id + '-0')
    } else {
      const nk = document.getElementById('nk-' + id)
      if (nk) nk.value = v
      if (typeof addKeyRow === 'function') addKeyRow(id)
      input = document.getElementById('k-' + id + '-0')
    }
  }
  if (!input) {
    input = document.querySelector('#akeys .aki')
      || document.querySelector('#keys-' + id + ' input[type="text"]')
      || document.getElementById('nk-' + id)
  }
  if (input) {
    input.value = v
    input.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  }
  return false
}

// \u628A\u5F39\u7A97\u91CC\u7684 token \u5199\u8FDB\u6E20\u9053\u7684 API Keys \u8F93\u5165\u6846\uFF0C\u7136\u540E\u7ACB\u523B\u6821\u9A8C
async function applyDeepseekToken(id) {
  const ta = document.getElementById('ds-tok')
  const v = ta ? ta.value.trim() : ''
  if (!v) { toast('\u8BF7\u5148\u7C98\u8D34 userToken', 'error'); return }
  const okBtn = document.getElementById('ds-tok-ok')
  if (okBtn) { okBtn.disabled = true; okBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> \u9A8C\u8BC1\u4E2D\u2026' }

  // \u5199\u5165 API Keys \u8F93\u5165\u6846\uFF08\u903B\u8F91\u4E0E\u4EE3\u767B\u5F55\u5171\u7528\uFF0C\u542B\u515C\u5E95\u94FE\u8DEF\uFF0C\u7EDD\u4E0D\u9759\u9ED8\u4E22\u503C\uFF09
  if (!fillDeepseekKeyInput(id, v)) {
    toast('\u672A\u627E\u5230\u53EF\u5199\u5165\u7684 API Key \u8F93\u5165\u6846\uFF0C\u8BF7\u624B\u52A8\u7C98\u8D34', 'error')
    return
  }

  // \u7ACB\u5373\u6821\u9A8C
  let success = false, message = ''
  try {
    const r = await testKeyConnection(OAUTH_DEFAULT_URLS.deepseek, 'openai', v, id, '', false, 'deepseek', '')
    success = r.success; message = r.message || ''
  } catch (e) { message = '\u8BF7\u6C42\u5931\u8D25' }

  if (success) {
    toast('\u51ED\u636E\u6709\u6548\uFF0C\u5DF2\u586B\u5165\u5E76\u4FDD\u5B58\u524D\u8BF7\u70B9\u300C\u4FDD\u5B58\u300D', 'success')
    closeM()
    const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
    if (tr) showResult(tr, true, '')
  } else {
    // \u6821\u9A8C\u5931\u8D25\u4E5F\u4FDD\u7559\u586B\u5165\u7684\u503C\uFF0C\u53EA\u63D0\u793A\uFF08\u907F\u514D\u7528\u6237\u767D\u7C98\u8D34\u4E00\u6B21\uFF09
    if (okBtn) { okBtn.disabled = false; okBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> \u91CD\u65B0\u9A8C\u8BC1' }
    toast('\u51ED\u636E\u6821\u9A8C\u672A\u901A\u8FC7\uFF1A' + (message || '\u65E0\u6548'), 'error')
  }
}

// DeepSeek: \u7528\u5F53\u524D\u586B\u5199\u7684 userToken \u6821\u9A8C\u51ED\u636E\u6709\u6548\u6027\uFF08/users/current\uFF09
async function verifyDeepseek(id) {
  const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
  let key = ''
  if (id === 'new') {
    const first = document.querySelector('#akeys .aki')
    key = first ? first.value.trim() : ''
  } else {
    const keys = getKeys(id)
    key = keys.length > 0 ? keys[0].key : ''
  }
  if (!key) { toast('\u8BF7\u5148\u586B\u5199 userToken', 'error'); return }
  if (tr) showSpinner(tr)
  try {
    const r = await testKeyConnection(OAUTH_DEFAULT_URLS.deepseek, 'openai', key, id, '', false, 'deepseek', '')
    if (tr) showResult(tr, r.success, r.success ? '' : (r.message || '\u51ED\u636E\u65E0\u6548'))
    if (!r.success) toast(r.message || '\u51ED\u636E\u6821\u9A8C\u5931\u8D25', 'error')
  } catch (e) { if (tr) showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25') }
}

// \u62C9\u53D6 OAuth \u6E20\u9053\u53EF\u7528\u6A21\u578B\uFF08claude / kimi\uFF09\u5E76\u8FFD\u52A0\u5230\u6A21\u578B\u5217\u8868
async function fetchOAuthModels(id) {
  const provider = provType(id)
  if (!isOauthType(provider) && !isDeepseekType(provider)) { toast('\u5F53\u524D\u6E20\u9053\u7C7B\u578B\u4E0D\u652F\u6301', 'error'); return }
  const tr = document.getElementById(id === 'new' ? 'atestR' : 'tr-' + id)
  let key = ''
  if (id === 'new') {
    const first = document.querySelector('#akeys .aki')
    key = first ? first.value.trim() : ''
  } else {
    const keys = getKeys(id)
    key = keys.length > 0 ? keys[0].key : ''
  }
  if (!key) { toast('\u8BF7\u5148\u586B\u5199\u6216\u6388\u6743\u83B7\u53D6 refresh_token', 'error'); return }
  if (tr) showSpinner(tr)
  try {
    const baseEl2 = document.getElementById(id === 'new' ? 'aurl' : 'url-' + id)
    const netBase = baseEl2 ? baseEl2.value.trim() : ''
    const r = await fetch('/admin/api/oauth/' + provider + '/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: key, baseUrl: netBase, region: cbRegionValue(id) }) })
    const d = await r.json()
    if (!d.success || !d.data || !d.data.models || d.data.models.length === 0) {
      if (tr) showResult(tr, false, (d.data && d.data.message) || d.message || '\u672A\u83B7\u53D6\u5230\u6A21\u578B\uFF0C\u8BF7\u624B\u52A8\u586B\u5199')
      return
    }
    const models = d.data.models
    const existing = {}
    const sel = id === 'new' ? '#amodels .ami' : '#ml-' + id + ' [data-idx] input'
    document.querySelectorAll(sel).forEach(function (inp) { if (inp.value.trim()) existing[inp.value.trim()] = 1 })
    const toAdd = models.filter(function (m) { return !existing[m] })
    toAdd.forEach(function (m) { if (id === 'new') addMdlToForm(m); else addMdlToEdit(id, m) })
    toast('\u5DF2\u6DFB\u52A0 ' + toAdd.length + ' \u4E2A\u6A21\u578B' + (toAdd.length < models.length ? '\uFF08\u8DF3\u8FC7 ' + (models.length - toAdd.length) + ' \u4E2A\u5DF2\u5B58\u5728\uFF09' : ''), 'success')
    if (tr) showResult(tr, true, '')
  } catch (e) { if (tr) showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25') }
}
// \u670D\u52A1\u7AEF\u6CE8\u5165\u7684 Antigravity \u6E20\u9053/\u8D26\u53F7\u6E05\u5355\uFF08\u4E0D\u542B\u51ED\u636E\uFF09\uFF0C\u7528\u4E8E\u8FDB\u5165\u989D\u5EA6\u9875\u65F6\u5148\u5217\u51FA\u8D26\u53F7
let AG_CHANNELS = ${JSON.stringify(agChannels).replace(/</g, "\\u003c")}
let quotaReady = false

// \u9876\u90E8\u300C\u5237\u65B0\u8D26\u53F7\u300D\uFF1A\u91CD\u8BFB\u6E20\u9053/\u8D26\u53F7\u6E05\u5355\u5E76\u91CD\u65B0\u5217\u51FA\u8D26\u53F7\uFF08\u4E0D\u67E5\u8BE2\u989D\u5EA6\uFF09
async function refreshAgAccounts() {
  try {
    const r = await fetch('/admin/api/antigravity/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const d = await r.json()
    if (d.success && d.data && Array.isArray(d.data.channels)) {
      AG_CHANNELS = d.data.channels
      const badge = document.querySelector('.admin-nav__link[href="#quota"] b')
      if (badge) badge.textContent = String(AG_CHANNELS.reduce(function (n, c) { return n + (c.accountCount || 0) }, 0))
    }
  } catch (e) { /* \u4FDD\u7559\u73B0\u6709\u6E05\u5355 */ }
  quotaReady = false
  renderQuotaSkeleton()
  toast('\u8D26\u53F7\u5217\u8868\u5DF2\u5237\u65B0', 'success')
}

// \u8FDB\u5165\u989D\u5EA6\u9875\u65F6\uFF08\u5C1A\u672A\u67E5\u8BE2\u8FC7\uFF09\u5148\u5217\u51FA\u8D26\u53F7\u9AA8\u67B6\uFF0C\u6BCF\u6761\u5E26\u300C\u67E5\u8BE2\u300D\u6309\u94AE
function renderQuotaSkeleton() {
  const box = document.getElementById('quotaBody')
  if (!box) return
  if (!AG_CHANNELS.length) {
    box.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-gauge-high" aria-hidden="true"></i><h3>\u6682\u65E0 Antigravity \u6E20\u9053</h3><p>\u6DFB\u52A0\u4E00\u4E2A Antigravity \u53CD\u4EE3\u6E20\u9053\u540E\u5373\u53EF\u67E5\u770B\u989D\u5EA6\u3002</p></div>'
    return
  }
  box.innerHTML = renderQuotaCards(AG_CHANNELS)
}

// \u989D\u5EA6\u91CD\u7F6E\u65F6\u95F4\u683C\u5F0F\u5316\uFF1A\u76F8\u5BF9\u300C\u591A\u4E45\u540E\u91CD\u7F6E\u300D+ \u5177\u4F53\u672C\u5730\u65F6\u95F4
function fmtResetIn(iso) {
  const t = Date.parse(iso)
  if (isNaN(t)) return ''
  const ms = t - Date.now()
  if (ms <= 0) return '\u5DF2\u91CD\u7F6E'
  const mins = Math.round(ms / 60000)
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (d > 0) return d + '\u5929' + h + '\u5C0F\u65F6\u540E\u91CD\u7F6E'
  if (h > 0) return h + '\u5C0F\u65F6' + m + '\u5206\u540E\u91CD\u7F6E'
  return Math.max(1, m) + '\u5206\u949F\u540E\u91CD\u7F6E'
}
function fmtResetLocal(iso) {
  const t = Date.parse(iso)
  return isNaN(t) ? '' : new Date(t).toLocaleString()
}

function renderAgQuota(a, chId) {
  const mail = a.email ? '<code style="font-size:11px;font-weight:400">' + escapeHtml(a.email) + '</code>' : ''
  // \u8BA2\u9605\u770B paidTier\uFF1Ag1-pro-tier \u8FD9\u7C7B\u624D\u4EE3\u8868 Google AI \u5957\u9910\u771F\u7684\u751F\u6548\uFF08currentTier \u53EA\u53CD\u6620\u914D\u7F6E\u5C42\uFF0C\u514D\u8D39\u8D26\u53F7\u4E00\u5F8B free-tier\uFF09
  const paid = (a.paidTierId && a.paidTierId !== 'free-tier')
    ? '<span style="font-size:11px;padding:1px 6px;border-radius:9px;background:rgba(22,163,74,.14);color:#16a34a;white-space:nowrap">' + escapeHtml(a.paidTier || a.paidTierId) + '</span>'
    : ''
  const tierTxt = a.tierId ? (a.tier && a.tier !== 'Antigravity' ? a.tier + ' \xB7 ' + a.tierId : a.tierId) : (a.tier || '')
  const info = '<span class="fc" style="gap:8px;align-items:center;flex-wrap:wrap"><strong>\u8D26\u53F7 #' + (a.index + 1) + '</strong>' + mail + paid + '<span class="form-helper">' + escapeHtml(tierTxt) + (a.project ? ' \xB7 ' + escapeHtml(a.project) : '') + '</span></span>'
  const btn = (chId === undefined || chId === null) ? '' : '<button class="btn btn-s" type="button" data-agq="' + chId + '" data-agi="' + a.index + '"><i class="fas fa-magnifying-glass" aria-hidden="true"></i>\u67E5\u8BE2</button>'
  const head = '<div class="fc" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' + info + btn + '</div>'
  // Google \u539F\u8BDD\uFF1A\u5957\u9910\u672A\u751F\u6548\u65F6\u7684\u89E3\u91CA\uFF08\u542B\u8BF4\u660E\u94FE\u63A5\uFF09+ \u4E0D\u5177\u5907\u67D0\u5C42\u8D44\u683C\u7684\u539F\u56E0
  const notes = (a.tierNote ? '<div class="form-helper" style="margin-top:4px">Google\uFF1A' + escapeHtml(a.tierNote) + (a.tierNoteUrl ? ' <a href="' + escapeHtml(a.tierNoteUrl) + '" target="_blank" rel="noopener">\u8BF4\u660E</a>' : '') + '</div>' : '')
    + (a.ineligible ? '<div class="al al-e" style="margin-top:4px">' + escapeHtml(a.ineligible) + '</div>' : '')
  if (!a.ok) {
    const isErr = !!a.error
    const bg = isErr ? 'rgba(220,38,38,.08)' : 'rgba(127,127,127,.08)'
    const msg = isErr
      ? '<div class="al al-e" style="margin-top:4px">' + escapeHtml(a.error) + '</div>'
      : '<div class="form-helper" style="margin-top:4px">\u672A\u67E5\u8BE2\uFF0C\u70B9\u53F3\u4FA7\u300C\u67E5\u8BE2\u300D\u83B7\u53D6\u8BE5\u8D26\u53F7\u989D\u5EA6\u3002</div>'
    return '<div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:' + bg + '">' + head + msg + notes + '</div>'
  }
  const rows = (a.models || []).map(function (m) {
    const pct = (m.remaining === null || m.remaining === undefined) ? null : Math.round(m.remaining * 100)
    const color = pct === null ? '#9ca3af' : pct > 50 ? '#16a34a' : pct > 10 ? '#d97706' : '#dc2626'
    const bar = pct === null ? '' : '<span style="display:inline-block;width:80px;height:6px;border-radius:3px;background:rgba(127,127,127,.2);overflow:hidden;vertical-align:middle"><span style="display:block;height:100%;width:' + pct + '%;background:' + color + '"></span></span>'
    const reset = m.resetTime ? '<span class="form-helper" style="font-size:11px;white-space:nowrap" title="' + escapeHtml(fmtResetLocal(m.resetTime)) + '">' + escapeHtml(fmtResetIn(m.resetTime)) + '</span>' : ''
    return '<div class="fc" style="justify-content:space-between;gap:8px;padding:2px 0;font-size:12px"><code style="font-size:11px">' + escapeHtml(m.id) + '</code><span class="fc" style="gap:6px;align-items:center">' + reset + bar + '<span style="min-width:38px;text-align:right">' + (pct === null ? '\u2014' : pct + '%') + '</span></span></div>'
  }).join('')
  return '<div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(127,127,127,.08)">' + head + notes + '<div class="quota-models">' + rows + '</div></div>'
}

// \u8D26\u53F7\u5361\u7247\u533A\uFF1Achannels \u65E2\u53EF\u4EE5\u662F\u8D26\u53F7\u9AA8\u67B6\uFF08\u6709 accountCount\u3001\u65E0 accounts\uFF09\uFF0C\u4E5F\u53EF\u4EE5\u662F\u67E5\u8BE2\u7ED3\u679C\uFF08\u6709 accounts\uFF09
function renderQuotaCards(channels) {
  return channels.map(function (ch) {
    const head = '<div class="fc" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">' + escapeHtml(ch.name) + ' <code style="font-size:11px;font-weight:400">' + escapeHtml(ch.id) + '</code></h3></div>'
    let accts = ''
    if (ch.accounts && ch.accounts.length) {
      ch.accounts.forEach(function (a) {
        accts += '<div class="ag-acct" id="agacct-' + ch.id + '-' + a.index + '">' + renderAgQuota(a, ch.id) + '</div>'
      })
    } else if (ch.accountCount > 0) {
      for (let i = 0; i < ch.accountCount; i++) {
        accts += '<div class="ag-acct" id="agacct-' + ch.id + '-' + i + '">' + renderAgQuota({ index: i, ok: false, models: [] }, ch.id) + '</div>'
      }
    } else {
      accts = '<div class="form-helper" style="padding:8px 0">\u8BE5\u6E20\u9053\u672A\u914D\u7F6E\u51ED\u636E</div>'
    }
    return '<article class="quota-card">' + head + accts + '</article>'
  }).join('')
}

// \u4E00\u6B21\u67E5\u5B8C\u6240\u6709\u6E20\u9053\u6240\u6709\u8D26\u53F7\uFF08\u6BCF\u4E2A\u8D26\u53F7\u8981\u95EE\u4E00\u6B21\u4E0A\u6E38\uFF0C\u8D26\u53F7\u591A\u65F6\u6162\uFF0C\u6545\u7ED9\u8FDB\u5EA6\u63D0\u793A\uFF09
async function queryAllAgQuota() {
  const box = document.getElementById('quotaBody')
  if (!box) return
  quotaReady = true
  box.innerHTML = '<div class="form-helper" style="padding:12px 0;grid-column:1/-1">\u6B63\u5728\u67E5\u8BE2\u5168\u90E8\u8D26\u53F7\uFF08\u542B\u8BA2\u9605\u5C42\u4E0E\u90AE\u7BB1\uFF09\uFF0C\u8D26\u53F7\u8F83\u591A\u65F6\u9700\u8981\u5341\u51E0\u79D2\u2026</div>'
  try {
    const r = await fetch('/admin/api/antigravity/quota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const d = await r.json()
    if (!d.success || !d.data || !Array.isArray(d.data.channels)) {
      box.innerHTML = '<div class="al al-e" style="grid-column:1/-1">' + escapeHtml(d.message || '\u67E5\u8BE2\u5931\u8D25') + '</div>'
      return
    }
    box.innerHTML = d.data.channels.length
      ? renderQuotaCards(d.data.channels)
      : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-gauge-high" aria-hidden="true"></i><h3>\u6682\u65E0 Antigravity \u6E20\u9053</h3><p>\u6DFB\u52A0\u4E00\u4E2A Antigravity \u53CD\u4EE3\u6E20\u9053\u540E\u5373\u53EF\u67E5\u770B\u989D\u5EA6\u3002</p></div>'
    toast('\u5DF2\u5237\u65B0\u5168\u90E8\u8D26\u53F7\u989D\u5EA6', 'success')
  } catch (e) {
    box.innerHTML = '<div class="al al-e" style="grid-column:1/-1">\u8BF7\u6C42\u5931\u8D25</div>'
  }
}

// \u8D26\u53F7\u7EA7\u300C\u67E5\u8BE2\u300D\uFF1A\u53EA\u5237\u65B0\u8BE5\u6E20\u9053\u8BE5\u8D26\u53F7\u7684\u989D\u5EA6
async function agAccountQuery(chId, idx) {
  const el = document.getElementById('agacct-' + chId + '-' + idx)
  if (!el) return
  quotaReady = true
  el.innerHTML = '<div class="form-helper" style="padding:8px 0">\u67E5\u8BE2\u4E2D\u2026</div>'
  try {
    const r = await fetch('/admin/api/antigravity/quota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId: chId, index: idx }) })
    const d = await r.json()
    if (!d.success || !d.data || !d.data.accounts || !d.data.accounts.length) {
      el.innerHTML = '<div class="al al-e">' + escapeHtml(d.message || '\u67E5\u8BE2\u5931\u8D25') + '</div>'
      return
    }
    el.innerHTML = renderAgQuota(d.data.accounts[0], chId)
  } catch (e) { el.innerHTML = '<div class="al al-e">\u8BF7\u6C42\u5931\u8D25</div>' }
}

// \u4E00\u952E\u6DFB\u52A0\u5168\u90E8 Azure TTS \u97F3\u8272\u4E3A\u6A21\u578B (\u97F3\u8272 id \u5373\u6A21\u578B id, \u8C03\u7528\u65F6\u76F4\u63A5\u7528\u97F3\u8272\u540D)
function addAllTtsModels(id) {
  const voices = ${JSON.stringify(AZURE_TTS_VOICES.map((v) => v.id))}
  if (id === 'new') {
    const container = document.getElementById('amodels')
    const existing = new Set(Array.from(container.querySelectorAll('.ami')).map(i => i.value.trim()))
    let added = 0
    voices.forEach(v => {
      if (existing.has(v)) return
      const d = document.createElement('div')
      d.className = 'fc mb-4 field-row'
      d.innerHTML = '<input type="text" class="fx1 ami" value="' + v + '" placeholder="\u6A21\u578B ID"><label class="tg"><input type="checkbox" checked class="ame"><span class="sl"></span></label><button class="icon-btn" onclick="this.parentElement.remove()" title="\u79FB\u9664"><i class="fas fa-times" aria-hidden="true"></i></button>'
      container.appendChild(d)
      existing.add(v)
      added++
    })
    toast('\u5DF2\u6DFB\u52A0 ' + added + ' \u4E2A\u97F3\u8272\u6A21\u578B', added ? 'success' : 'error')
  } else {
    const container = document.getElementById('ml-' + id)
    const existing = new Set(Array.from(container.querySelectorAll('[data-idx] input[id^="mid-"]')).map(i => i.value.trim()))
    let added = 0
    voices.forEach(v => {
      if (existing.has(v)) return
      const idx = container.querySelectorAll('[data-idx]').length
      const d = document.createElement('div')
      d.className = 'fc mb-3 field-row'
      d.dataset.idx = idx
      d.innerHTML = '<input type="text" value="' + v + '" class="fx1" id="mid-' + id + '-' + idx + '" placeholder="\u6A21\u578B ID" title="\u4E0A\u6E38\u771F\u5B9E\u6A21\u578B ID"><input type="text" value="' + v + '" class="fx1" id="mal-' + id + '-' + idx + '" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" title="\u5BF9\u5916\u663E\u793A\u540D"><label class="tg"><input type="checkbox" checked id="men-' + id + '-' + idx + '" aria-label="\u542F\u7528\u6A21\u578B"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236\u6A21\u578B ID" aria-label="\u590D\u5236\u6A21\u578B ID"><i class="far fa-copy" aria-hidden="true"></i></button><button class="icon-btn" id="tm-' + id + '-' + idx + '" title="\u6D4B\u8BD5\u6A21\u578B" aria-label="\u6D4B\u8BD5\u6A21\u578B"><i class="fas fa-plug" aria-hidden="true"></i></button><button class="icon-btn" id="rm-' + id + '-' + idx + '" title="\u79FB\u9664\u6A21\u578B" aria-label="\u79FB\u9664\u6A21\u578B"><i class="fas fa-times" aria-hidden="true"></i></button>'
      container.appendChild(d)
      document.getElementById('tm-' + id + '-' + idx).addEventListener('click', function() { testMdl(id, v, idx) })
      document.getElementById('rm-' + id + '-' + idx).addEventListener('click', function() { rmMdl(id, idx) })
      existing.add(v)
      added++
    })
    toast('\u5DF2\u6DFB\u52A0 ' + added + ' \u4E2A\u97F3\u8272\u6A21\u578B', added ? 'success' : 'error')
  }
}

// \u628A\u5F53\u524D\u9009\u4E2D\u7684\u97F3\u8272\u6DFB\u52A0\u5230\u6A21\u578B\u5217\u8868
function addTtsModel(id) {
  const sel = document.getElementById('pv-' + id)
  const v = (sel ? sel.value : '').trim()
  if (!v) { toast('\u8BF7\u5148\u9009\u62E9\u97F3\u8272', 'error'); return }
  const container = document.getElementById('ml-' + id)
  const existing = new Set(Array.from(container.querySelectorAll('[data-idx] input[id^="mid-"]')).map(i => i.value.trim()))
  if (existing.has(v)) { toast('\u8BE5\u97F3\u8272\u5DF2\u5728\u6A21\u578B\u5217\u8868\u4E2D', 'error'); return }
  const idx = container.querySelectorAll('[data-idx]').length
  const d = document.createElement('div')
  d.className = 'fc mb-3 field-row'
  d.dataset.idx = idx
  d.innerHTML = '<input type="text" value="' + v + '" class="fx1" id="mid-' + id + '-' + idx + '" placeholder="\u6A21\u578B ID" title="\u4E0A\u6E38\u771F\u5B9E\u6A21\u578B ID"><input type="text" value="' + v + '" class="fx1" id="mal-' + id + '-' + idx + '" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" title="\u5BF9\u5916\u663E\u793A\u540D"><label class="tg"><input type="checkbox" checked id="men-' + id + '-' + idx + '" aria-label="\u542F\u7528\u6A21\u578B"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236\u6A21\u578B ID" aria-label="\u590D\u5236\u6A21\u578B ID"><i class="far fa-copy" aria-hidden="true"></i></button><button class="icon-btn" id="tm-' + id + '-' + idx + '" title="\u6D4B\u8BD5\u6A21\u578B" aria-label="\u6D4B\u8BD5\u6A21\u578B"><i class="fas fa-plug" aria-hidden="true"></i></button><button class="icon-btn" id="rm-' + id + '-' + idx + '" title="\u79FB\u9664\u6A21\u578B" aria-label="\u79FB\u9664\u6A21\u578B"><i class="fas fa-times" aria-hidden="true"></i></button>'
  container.appendChild(d)
  document.getElementById('tm-' + id + '-' + idx).addEventListener('click', function() { testMdl(id, v, idx) })
  document.getElementById('rm-' + id + '-' + idx).addEventListener('click', function() { rmMdl(id, idx) })
  toast('\u5DF2\u6DFB\u52A0\u97F3\u8272: ' + v, 'success')
}

// Azure TTS \u97F3\u8272\u8BD5\u542C: \u7528\u7BA1\u7406\u5458\u4F1A\u8BDD\u8C03\u7528 /admin/api/tts-preview \u5408\u6210\u5E76\u64AD\u653E
async function previewTts(id) {
  const voice = document.getElementById(id === 'new' ? 'av' : 'pv-' + id).value
  if (!voice) { toast('\u8BF7\u5148\u9009\u62E9\u97F3\u8272', 'error'); return }
  const box = document.getElementById('ttp-' + id)
  if (!box) return
  box.innerHTML = '<span class="form-helper">\u5408\u6210\u4E2D\u2026</span>'
  try {
    const r = await fetch('/admin/api/tts-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: id === 'new' ? 'tts' : id, voice }),
    })
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      box.innerHTML = '<span class="form-helper" style="color:var(--danger,#e5484d)">\u8BD5\u542C\u5931\u8D25: ' + (d.message || r.status) + '</span>'
      return
    }
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    box.innerHTML = '<audio controls autoplay style="width:100%;margin-block:8px"><source src="' + url + '" type="audio/mpeg"></audio><span class="form-helper">' + voice + '</span>'
  } catch (e) {
    box.innerHTML = '<span class="form-helper" style="color:var(--danger,#e5484d)">\u8BD5\u542C\u5931\u8D25</span>'
  }
}

// aid \u8F93\u5165 opencode \u65F6\u81EA\u52A8\u586B\u5145 API \u5730\u5740
document.getElementById('aid').addEventListener('input', function() {
  if (this.value.trim() === 'opencode') {
    document.getElementById('aurl').value = '${OPENCODE_DEFAULT_URL}'
  }
})

// provider api keys (add form)
function addAKeyRow(val) {
  const c = document.getElementById('akeys')
  const d = document.createElement('div')
  d.className = 'fc mb-4 field-row'
  d.innerHTML = '<input type="text" placeholder="sk-xxx" class="fx1 aki" aria-label="\u4E0A\u6E38 API Key" value="' + (val || '') + '"><label class="tg"><input type="checkbox" checked class="ake" aria-label="\u542F\u7528 Key"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236 Key" aria-label="\u590D\u5236 Key"><i class="far fa-copy"></i></button><button class="icon-btn" onclick="testNewAKey(this)" title="\u6D4B\u8BD5 Key" aria-label="\u6D4B\u8BD5 Key"><i class="fas fa-plug"></i></button><button class="icon-btn" onclick="this.parentElement.remove()" title="\u79FB\u9664 Key" aria-label="\u79FB\u9664 Key"><i class="fas fa-times"></i></button>'
  c.appendChild(d)
}

function renderModelGrid(models, editId, providerId) {
  if (providerId === 'opencode') {
    models = (models || []).filter(function(m) {
      return m && typeof m.id === 'string' && /^[A-Za-z0-9._:/-]+$/.test(m.id) && (m.id === 'big-pickle' || m.id.endsWith('-free'))
    })
  }
  if (!models || models.length === 0) return '<span class="mu">\u672A\u8FD4\u56DE\u6A21\u578B\u5217\u8868</span>'
  var h = models.map(function(m) {
    var modelId = String(m.id || '')
    var safeId = escapeHtml(modelId)
    var addFn = editId
      ? "addMdlToEdit('" + editId + "','" + modelId + "')"
      : "addMdlToForm('" + modelId + "')"
    return '<div class="mdl-item">' +
      '<i class="fas fa-cube"></i>' +
			'<span class="fx1 cp ov" onclick="copyText(\\'' + modelId + '\\',this)">' + safeId + '</span>' +
      '<button class="btn btn-gh mdl-add-btn" onclick="' + addFn + '" title="\u6DFB\u52A0\u5230\u8868\u5355">+</button></div>'
  }).join('')
  return '<div class="grid-2-gap6">' + h + '</div>'
}

// \u53EF\u7528\u6A21\u578B\u9762\u677F heading\uFF08\u6DFB\u52A0\u6001\u9759\u6001 HTML \u4E0E\u7F16\u8F91\u6001\u52A8\u6001\u751F\u6210\u5171\u7528\u540C\u4E00\u7ED3\u6784\uFF09
function modelPanelHeading(panelId) {
  return '<div class="panel-heading"><div>' +
    '<span class="panel-heading__mark"><i class="fas fa-cube" aria-hidden="true"></i></span>' +
    '<div><h3>\u53EF\u7528\u6A21\u578B</h3><p>\u70B9\u51FB\u201C+\u201D\u6DFB\u52A0\u5230\u914D\u7F6E\u3002</p></div></div>' +
    '<button class="icon-btn" type="button" onclick="hideMdlPanel(\\'' + panelId + '\\')" title="\u5173\u95ED\u53EF\u7528\u6A21\u578B" aria-label="\u5173\u95ED\u53EF\u7528\u6A21\u578B"><i class="fas fa-times" aria-hidden="true"></i></button></div>'
}

// \u5173\u95ED\u53EF\u7528\u6A21\u578B\u9762\u677F\uFF08\u4EC5\u9690\u85CF\uFF0C\u4E0D\u6E05\u7A7A\u5DF2\u83B7\u53D6\u7684\u6A21\u578B\u6570\u636E\uFF09
function hideMdlPanel(panelId) {
  document.getElementById(panelId).classList.add('hd')
}

function testNewAKey(btn) {
  const inp = btn.parentElement.querySelector('.aki'), k = inp.value.trim()
  const providerId = document.getElementById('aid').value.trim()
  if (!k && providerId !== 'opencode') { toast('\u8BF7\u8F93\u5165 API Key', 'error'); return }
  const url = document.getElementById('aurl').value.trim()
  if (!url) { toast('\u8BF7\u5148\u586B\u5199 API \u5730\u5740', 'error'); return }
  const apiType = document.getElementById('apt').value === 'anthropic' ? 'anthropic' : 'openai'
  const mirrorUrls = document.getElementById('amirror').value
  const tr = document.getElementById('atestR')
  showSpinner(tr)
  testKeyConnection(url, apiType, k, providerId, mirrorUrls, false, provType('new'), provProject('new')).then(function(result) {
    if (result.success && result.data) {
      document.getElementById('amcl').innerHTML = renderModelGrid(result.data.data || [], null, providerId)
      document.getElementById('amc').classList.remove('hd')
    } else {
      document.getElementById('amc').classList.add('hd')
    }
    showResult(tr, result.success, result.success ? '' : 'HTTP ' + result.status)
  })
}

// \u6279\u91CF\u6DFB\u52A0 API Key: \u5F39\u7A97\u7C98\u8D34, \u4E00\u884C\u4E00\u4E2A
function batchAddKeys() {
  showM('<h3><i class="fas fa-list c-p"></i> \u6279\u91CF\u6DFB\u52A0 API Key</h3><div class="fg"><label>\u6BCF\u884C\u4E00\u4E2A Key</label><textarea id="bkText" rows="8" class="fx1" placeholder="sk-xxx1&#10;sk-xxx2&#10;sk-xxx3" style="font-family:var(--font-mono);font-size:12px"></textarea></div><div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button><button class="btn btn-p" id="bkOk">\u6279\u91CF\u6DFB\u52A0</button></div>')
  const ok = document.getElementById('bkOk')
  ok.onclick = function () {
    const text = document.getElementById('bkText').value.trim()
    if (!text) { toast('\u8BF7\u7C98\u8D34\u81F3\u5C11\u4E00\u4E2A Key', 'error'); return }
    const keys = text.split(String.fromCharCode(10)).map(function (s) { return s.trim() }).filter(Boolean)
    // \u5148\u586B\u5DF2\u6709\u7A7A\u884C, \u4E0D\u8DB3\u518D\u8865\u65B0\u884C
    let ki = 0
    Array.from(document.querySelectorAll('#akeys .aki')).forEach(function (r) {
      if (ki >= keys.length) return
      if (!r.value.trim()) { r.value = keys[ki]; ki++ }
    })
    while (ki < keys.length) { addAKeyRow(keys[ki]); ki++ }
    closeM()
    toast('\u5DF2\u6DFB\u52A0 ' + keys.length + ' \u4E2A Key', 'success')
  }
}

// \u6279\u91CF\u6D4B\u8BD5\u6240\u6709 Key: \u9010\u4E2A\u8C03\u7528, \u7ED3\u679C\u6807\u8BB0\u5230\u884C\u5C3E
async function batchTestKeys() {
  const url = document.getElementById('aurl').value.trim()
  if (!url) { toast('\u8BF7\u5148\u586B\u5199 API \u5730\u5740', 'error'); return }
  const apiType = document.getElementById('apt').value === 'anthropic' ? 'anthropic' : 'openai'
  const providerId = document.getElementById('aid').value.trim()
  const mirrorUrls = document.getElementById('amirror').value
  const rows = Array.from(document.querySelectorAll('#akeys .field-row'))
  const keys = rows.map(function (r) { return r.querySelector('.aki').value.trim() }).filter(Boolean)
  if (keys.length === 0) { toast('\u8BF7\u5148\u6DFB\u52A0 API Key', 'error'); return }
  toast('\u6B63\u5728\u6279\u91CF\u6D4B\u8BD5 ' + keys.length + ' \u4E2A Key\u2026', 'info')
  // \u6BCF\u884C\u52A0\u72B6\u6001\u5FBD\u6807
  rows.forEach(function (r) { r.querySelectorAll('.key-test-badge').forEach(function (b) { b.remove() }) })
  const badge = function (r, ok, msg) {
    r.querySelectorAll('.key-test-badge').forEach(function (b) { b.remove() })
    const b = document.createElement('span')
    b.className = 'key-test-badge ' + (ok ? 'bd-on' : 'bd-off')
    b.textContent = (ok ? '\u2713 ' : '\u2717 ') + (msg || '')
    b.style.cssText = 'font-size:11px;white-space:nowrap'
    r.appendChild(b)
  }
  let okCount = 0
  for (const r of rows) {
    const k = r.querySelector('.aki').value.trim()
    if (!k) continue
    try {
      const result = await testKeyConnection(url, apiType, k, providerId, mirrorUrls, false, provType('new'), provProject('new'))
      if (result.success) { okCount++; badge(r, true, 'OK') }
      else badge(r, false, 'HTTP ' + result.status)
    } catch (e) {
      badge(r, false, 'ERR')
    }
  }
  toast('\u6279\u91CF\u6D4B\u8BD5\u5B8C\u6210: ' + okCount + '/' + keys.length + ' \u6210\u529F', okCount === keys.length ? 'success' : 'error')
}

// \u6DFB\u52A0\u8868\u5355 \u2014 \u83B7\u53D6\u514D\u8D39/\u5168\u90E8\u6A21\u578B
async function fetchNewModels(freeOnly) {
  const url = document.getElementById('aurl').value.trim()
  if (!url) { toast('\u8BF7\u5148\u586B\u5199 API \u5730\u5740', 'error'); return }
  const akeys = document.querySelectorAll('#akeys .aki')
  const configuredKey = Array.from(akeys).map(function(inp) { return inp.value.trim() }).filter(Boolean)[0] || ''
  const apiType = document.getElementById('apt').value === 'anthropic' ? 'anthropic' : 'openai'
  const providerId = document.getElementById('aid').value.trim()
  const mirrorUrls = document.getElementById('amirror').value
  const tr = document.getElementById('atestR')
  showSpinner(tr)
  try {
    const result = await testKeyConnection(url, apiType, configuredKey, providerId, mirrorUrls, freeOnly, provType('new'), provProject('new'))
    showResult(tr, result.success, result.success ? '' : 'HTTP ' + result.status)
    if (result.success && result.data) {
      const headEl = document.querySelector('#amc .panel-heading h3')
      if (headEl) headEl.textContent = freeOnly ? '\u514D\u8D39\u6A21\u578B' : '\u53EF\u7528\u6A21\u578B'
      document.getElementById('amcl').innerHTML = renderModelGrid(result.data.data || [], null, providerId)
      document.getElementById('amc').classList.remove('hd')
    }
  } catch (e) {
    showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25')
  }
}

let mdlCount = 1
function addMdlRow() {
  const c = document.getElementById('amodels')
  const d = document.createElement('div')
  d.className = 'fc mb-4 field-row'
  d.innerHTML = '<input type="text" placeholder="deepseek-chat" class="fx1 ami" aria-label="\u6A21\u578B ID" title="\u4E0A\u6E38\u771F\u5B9E\u6A21\u578B ID"><input type="text" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" class="fx1 amal" aria-label="\u5BF9\u5916\u540D" title="\u5BF9\u5916\u663E\u793A\u540D, \u7559\u7A7A\u81EA\u52A8\u53BB:free\u540E\u7F00"><label class="tg"><input type="checkbox" checked class="ame" aria-label="\u542F\u7528\u6A21\u578B"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236\u6A21\u578B ID" aria-label="\u590D\u5236\u6A21\u578B ID"><i class="far fa-copy"></i></button><button class="icon-btn" onclick="testNewMdl(this)" title="\u6D4B\u8BD5\u6A21\u578B" aria-label="\u6D4B\u8BD5\u6A21\u578B"><i class="fas fa-plug"></i></button><button class="icon-btn" onclick="this.parentElement.remove()" title="\u79FB\u9664\u6A21\u578B" aria-label="\u79FB\u9664\u6A21\u578B"><i class="fas fa-times"></i></button>'
  c.appendChild(d)
}

function addMdlToForm(mid) {
  const c = document.getElementById('amodels')
  const d = document.createElement('div')
  d.className = 'fc mb-4 field-row'
  d.innerHTML = '<input type="text" value="' + escapeHtml(mid) + '" class="fx1 ami" aria-label="\u6A21\u578B ID" title="\u4E0A\u6E38\u771F\u5B9E\u6A21\u578B ID"><input type="text" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" class="fx1 amal" aria-label="\u5BF9\u5916\u540D" title="\u5BF9\u5916\u663E\u793A\u540D, \u7559\u7A7A\u81EA\u52A8\u53BB:free\u540E\u7F00"><label class="tg"><input type="checkbox" checked class="ame" aria-label="\u542F\u7528\u6A21\u578B"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236\u6A21\u578B ID" aria-label="\u590D\u5236\u6A21\u578B ID"><i class="far fa-copy"></i></button><button class="icon-btn" onclick="testNewMdl(this)" title="\u6D4B\u8BD5\u6A21\u578B" aria-label="\u6D4B\u8BD5\u6A21\u578B"><i class="fas fa-plug"></i></button><button class="icon-btn" onclick="this.parentElement.remove()" title="\u79FB\u9664\u6A21\u578B" aria-label="\u79FB\u9664\u6A21\u578B"><i class="fas fa-times"></i></button>'
  c.appendChild(d)
}

function testNewMdl(btn) {
  const inp = btn.parentElement.querySelector('.ami'), mid = inp.value.trim()
  if (!mid) { toast('\u8BF7\u8F93\u5165\u6A21\u578B ID', 'error'); return }
  const url = document.getElementById('aurl').value.trim()
    const akeys = document.querySelectorAll('#akeys .aki')
    const configuredKey = Array.from(akeys).map(function(inp) { return inp.value.trim() }).filter(Boolean)[0] || ''
    const apiType = document.getElementById('apt').value === 'anthropic' ? 'anthropic' : 'openai'
    const mirrorUrls = document.getElementById('amirror').value
    const tr = document.getElementById('atestR')
    showSpinner(tr)
  const providerId = document.getElementById('aid').value.trim()
  const apiKey = configuredKey
  testModelConnection(url, apiType, apiKey, mid, providerId, mirrorUrls, provType('new'), provProject('new')).then(function(result) {
    showResult(tr, result.success, result.success ? '' : 'HTTP ' + result.status)
  })
}

async function createProv() {
  const nm = document.getElementById('anm').value.trim(), id = document.getElementById('aid').value.trim()
  const type = document.getElementById('apt').value
  const apiType = type === 'anthropic' ? 'anthropic' : 'openai'
  const aki = document.querySelectorAll('#akeys .aki')
  let keys = Array.from(aki).map((inp, i) => {
    const k = inp.value.trim()
    const en = inp.parentElement.querySelector('.ake')?.checked ?? true
    return k ? { key: k, enabled: en } : null
  }).filter(Boolean)
  const vxNewKeys = type === 'vertex' ? provVertexKeys('new') : null
  if (vxNewKeys && vxNewKeys.length) keys = vxNewKeys.map(k => ({ key: k, enabled: true }))
  const dvNewKeys = type === 'devin' ? provDevinKeys('new') : null
  if (dvNewKeys && dvNewKeys.length) keys = dvNewKeys.map(k => ({ key: k, enabled: true }))
  const ami = document.querySelectorAll('#amodels .ami')
  const models = Array.from(ami).map(inp => {
    const mid = inp.value.trim()
    const en = inp.parentElement.querySelector('.ame')?.checked ?? true
    const alEl = inp.parentElement.querySelector('.amal')
    const alias = alEl ? alEl.value.trim() : ''
    if (!mid) return null
    return alias ? { id: mid, enabled: en, alias: alias } : { id: mid, enabled: en }
  }).filter(Boolean)
  const enabled = document.getElementById('aen').checked
  const mirrorUrls = document.getElementById('amirror').value
  const isTts = type === 'azure-tts'
  const isAg = type === 'antigravity'
  const isOa = isOauthType(type) || isDeepseekType(type)
  const url = document.getElementById('aurl').value.trim() || (isTts ? 'https://speech.platform.bing.com' : isAg ? 'https://daily-cloudcode-pa.googleapis.com' : type === 'vertex' ? 'https://aiplatform.googleapis.com' : type === 'devin' ? 'https://server.codeium.com' : (isOa || isZaiType(type)) ? OAUTH_DEFAULT_URLS[type] : '')
  if (!nm || !id || !url) { toast('\u8BF7\u586B\u5199\u540D\u79F0\u3001ID \u548C API \u5730\u5740', 'error'); return }
  const ttsConf = isTts ? {
    voice: document.getElementById('av').value.trim() || 'zh-CN-XiaoxiaoNeural',
    rate: document.getElementById('ar').value.trim() || '+0%',
    volume: document.getElementById('avol').value.trim() || '+0%',
    pitch: document.getElementById('ap').value.trim() || '+0Hz',
  } : {}
  const r = await fetch('/admin/api/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name: nm, baseUrl: url, apiType, type, region: isCodebuddyType(type) ? cbRegionValue('new') : undefined, apiKeys: keys, models, mirrorUrls, enabled, project: provProject('new') || undefined, location: provVertexLocation('new') || undefined, ...ttsConf })
  })
  const d = await r.json()
  if (d.success) { toast('\u5DF2\u521B\u5EFA', 'success'); location.reload() }
  else toast(d.message || '\u521B\u5EFA\u5931\u8D25', 'error')
}

// provider api keys (edit)
function getKeys(id) {
  const c = document.getElementById('keys-' + id)
  const items = c.querySelectorAll('[data-kidx]')
  return Array.from(items).map(item => {
    const idx = parseInt(item.dataset.kidx)
    const k = document.getElementById('k-' + id + '-' + idx).value.trim()
    const en = document.getElementById('ken-' + id + '-' + idx).checked
    return k ? { key: k, enabled: en } : null
  }).filter(Boolean)
}

function addKeyRow(id) {
  const inp = document.getElementById('nk-' + id), k = inp.value.trim()
  if (!k) { toast('\u8BF7\u8F93\u5165 API Key', 'error'); return }
  const c = document.getElementById('keys-' + id), cnt = c.querySelectorAll('[data-kidx]').length
  const d = document.createElement('div')
  d.className = 'fc mb-3 field-row'
  d.dataset.kidx = cnt
  d.innerHTML = '<input type="text" value="' + k + '" class="fx1" id="k-' + id + '-' + cnt + '" placeholder="API Key"><label class="tg"><input type="checkbox" checked id="ken-' + id + '-' + cnt + '"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236 Key" aria-label="\u590D\u5236 Key"><i class="far fa-copy"></i></button><button class="icon-btn" onclick="testKeyRow(\\'' + id + '\\',' + cnt + ')" title="\u6D4B\u8BD5 Key" aria-label="\u6D4B\u8BD5 Key"><i class="fas fa-plug"></i></button><button class="icon-btn" onclick="rmKeyRow(\\'' + id + '\\',' + cnt + ')" title="\u79FB\u9664 Key" aria-label="\u79FB\u9664 Key"><i class="fas fa-times"></i></button>'
  c.appendChild(d)
  inp.value = ''
  inp.focus()
}

function rmKeyRow(id, idx) {
  const c = document.getElementById('keys-' + id)
  c.querySelectorAll('[data-kidx]').forEach(item => {
    if (parseInt(item.dataset.kidx) === idx) item.remove()
  })
}

async function testKeyRow(id, idx) {
  const k = document.getElementById('k-' + id + '-' + idx).value.trim()
  const url = document.getElementById('url-' + id).value.trim()
  if (!k) { toast('\u8BF7\u8F93\u5165 API Key', 'error'); return }
  const ptEl = document.getElementById('pt-' + id)
  const apiType = (ptEl ? ptEl.value : 'openai') === 'anthropic' ? 'anthropic' : 'openai'
  const mirEl = document.getElementById('mir-' + id)
  const mirrorUrls = mirEl ? mirEl.value : undefined
  const tr = document.getElementById('tr-' + id)
  showSpinner(tr)
  const result = await testKeyConnection(url, apiType, k, id, mirrorUrls, false, provType(id), provProject(id))
  showResult(tr, result.success, result.success ? '' : 'HTTP ' + result.status)
  if (result.success && result.data) {
    showEditModelsList(id, result.data.data || [])
  }
}

// \u7F16\u8F91\u8868\u5355 \u2014 \u83B7\u53D6\u6A21\u578B\uFF08\u590D\u7528 testKeyConnection \u903B\u8F91; freeOnly=true \u65F6\u53EA\u62C9\u514D\u8D39\u6A21\u578B\uFF09
async function fetchEditModels(id, freeOnly) {
  const url = document.getElementById('url-' + id).value.trim()
  const keys = getKeys(id)
  const apiKey = keys.length > 0 ? keys[0].key : ''
  const ptEl = document.getElementById('pt-' + id)
  const apiType = (ptEl ? ptEl.value : 'openai') === 'anthropic' ? 'anthropic' : 'openai'
  const mirEl = document.getElementById('mir-' + id)
  const mirrorUrls = mirEl ? mirEl.value : undefined
  const tr = document.getElementById('tr-' + id)
  showSpinner(tr)
  const result = await testKeyConnection(url, apiType, apiKey, id, mirrorUrls, freeOnly, provType(id), provProject(id))
  showResult(tr, result.success, result.success ? '' : escapeHtml(result.message || '\u83B7\u53D6\u6A21\u578B\u5931\u8D25'))
  if (result.success && result.data) {
    showEditModelsList(id, result.data.data || [], freeOnly)
  }
}

function showEditModelsList(id, models, freeOnly) {
  const cid = 'mel-' + id
  let el = document.getElementById(cid)
  if (!el) {
    // \u4EE5 API Keys fieldset \u4E3A\u951A\u70B9\u63D2\u5165\uFF0C\u7ED3\u6784\u4E0E\u6DFB\u52A0\u6001\u7684 #amc \u5BF9\u79F0
    const keysFs = document.getElementById('keys-' + id).closest('fieldset')
    el = document.createElement('aside')
    el.id = cid
    el.className = 'mdl-list-panel'
    el.innerHTML = modelPanelHeading(cid) + '<div id="melc-' + id + '"></div>'
    keysFs.insertAdjacentElement('afterend', el)
  }
  el.classList.remove('hd')
  const headEl = el.querySelector('.panel-heading h3')
  if (headEl) headEl.textContent = freeOnly ? '\u514D\u8D39\u6A21\u578B' : '\u53EF\u7528\u6A21\u578B'
  document.getElementById('melc-' + id).innerHTML = renderModelGrid(models, id, id)
}

function addMdlToEdit(id, mid) {
  document.getElementById('nmid-' + id).value = mid
  addMdl(id)
}

function getMdl(id) {
  const c = document.getElementById('ml-' + id), items = c.querySelectorAll('[data-idx]')
  return Array.from(items).map(item => {
    const idx = parseInt(item.dataset.idx), mid = document.getElementById('mid-' + id + '-' + idx).value.trim()
    const en = document.getElementById('men-' + id + '-' + idx).checked
    const alEl = document.getElementById('mal-' + id + '-' + idx)
    const alias = alEl ? alEl.value.trim() : ''
    if (!mid) return null
    return alias ? { id: mid, enabled: en, alias: alias } : { id: mid, enabled: en }
  }).filter(Boolean)
}

async function save(id) {
  const nm = document.getElementById('nm-' + id).value.trim(), urlEl = document.getElementById('url-' + id)
  let url = urlEl ? urlEl.value.trim() : ''
  const pidEl = document.getElementById('pid-' + id)
  const newId = pidEl ? pidEl.value.trim() : id
  const ptEl = document.getElementById('pt-' + id)
  const type = ptEl ? ptEl.value : 'openai'
  const apiType = type === 'anthropic' ? 'anthropic' : 'openai'
  const isTts = type === 'azure-tts'
  if (!url && type === 'antigravity') url = 'https://daily-cloudcode-pa.googleapis.com'
  if (!url && type === 'vertex') url = 'https://aiplatform.googleapis.com'
  if (!url && type === 'devin') url = 'https://server.codeium.com'
  if (!url && (isOauthType(type) || isDeepseekType(type) || isZaiType(type))) url = OAUTH_DEFAULT_URLS[type] || ''
  let keys = getKeys(id)
  const vxKeys = type === 'vertex' ? provVertexKeys(id) : null
  if (vxKeys && vxKeys.length) keys = vxKeys.map(k => ({ key: k, enabled: true }))
  const dvKeys = type === 'devin' ? provDevinKeys(id) : null
  if (dvKeys && dvKeys.length) keys = dvKeys.map(k => ({ key: k, enabled: true }))
  const models = getMdl(id), enabled = document.getElementById('en-' + id).checked
  const mirEl = document.getElementById('mir-' + id)
  const mirrorUrls = mirEl ? mirEl.value : undefined
  const ttsConf = isTts ? {
    voice: document.getElementById('pv-' + id).value.trim() || 'zh-CN-XiaoxiaoNeural',
    rate: document.getElementById('pr-' + id).value.trim() || '+0%',
    volume: document.getElementById('pvol-' + id).value.trim() || '+0%',
    pitch: document.getElementById('pp-' + id).value.trim() || '+0Hz',
  } : {}
  if (newId !== id && !/^[a-zA-Z0-9_-]+$/.test(newId)) { toast('ID \u53EA\u80FD\u5305\u542B\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF/\u8FDE\u5B57\u7B26', 'error'); return }
  const r = await fetch('/admin/api/providers/' + encodeURIComponent(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nm, baseUrl: url, apiType, type, region: isCodebuddyType(type) ? cbRegionValue(id) : undefined, apiKeys: keys, models, mirrorUrls, enabled, newId, project: provProject(id) || undefined, location: provVertexLocation(id) || undefined, ...ttsConf })
  })
  const d = await r.json()
  if (d.success) { toast('\u5DF2\u4FDD\u5B58', 'success'); location.reload() }
  else toast(d.message || '\u4FDD\u5B58\u5931\u8D25', 'error')
}

async function del(id) {
  if (!(await cM('\u786E\u5B9A\u8981\u5220\u9664\u6B64\u6E20\u9053\uFF1F'))) return
  const r = await fetch('/admin/api/providers/' + encodeURIComponent(id), { method: 'DELETE' })
  const d = await r.json()
  if (d.success) { toast('\u5DF2\u5220\u9664', 'success'); location.reload() }
  else toast(d.message || '\u5220\u9664\u5931\u8D25', 'error')
}

function addMdl(id) {
  const inp = document.getElementById('nmid-' + id), mid = inp.value.trim()
  const alInp = document.getElementById('nmal-' + id)
  const alias = alInp ? alInp.value.trim() : ''
  if (!mid) { toast('\u8BF7\u8F93\u5165\u6A21\u578B ID', 'error'); return }
  const c = document.getElementById('ml-' + id), cnt = c.querySelectorAll('[data-idx]').length
  const d = document.createElement('div')
  d.className = 'fc mb-3 field-row'
  d.dataset.idx = cnt
  d.innerHTML = '<input type="text" value="' + escapeHtml(mid) + '" class="fx1" id="mid-' + escapeHtml(id) + '-' + cnt + '" placeholder="\u6A21\u578B ID" title="\u4E0A\u6E38\u771F\u5B9E\u6A21\u578B ID"><input type="text" value="' + escapeHtml(alias) + '" class="fx1" id="mal-' + escapeHtml(id) + '-' + cnt + '" placeholder="\u5BF9\u5916\u540D(\u53EF\u9009)" title="\u5BF9\u5916\u663E\u793A\u540D, \u7559\u7A7A\u81EA\u52A8\u53BB:free\u540E\u7F00"><label class="tg"><input type="checkbox" checked id="men-' + escapeHtml(id) + '-' + cnt + '"><span class="sl"></span></label><button class="icon-btn" onclick="copyRowVal(this)" title="\u590D\u5236\u6A21\u578B ID" aria-label="\u590D\u5236\u6A21\u578B ID"><i class="far fa-copy"></i></button><button class="icon-btn" id="tm-' + escapeHtml(id) + '-' + cnt + '" title="\u6D4B\u8BD5\u6A21\u578B" aria-label="\u6D4B\u8BD5\u6A21\u578B"><i class="fas fa-plug"></i></button><button class="icon-btn" id="rm-' + escapeHtml(id) + '-' + cnt + '" title="\u79FB\u9664\u6A21\u578B" aria-label="\u79FB\u9664\u6A21\u578B"><i class="fas fa-times"></i></button>'
  c.appendChild(d)
  document.getElementById('tm-' + id + '-' + cnt).addEventListener('click', function() { testMdl(id, mid, cnt) })
  document.getElementById('rm-' + id + '-' + cnt).addEventListener('click', function() { rmMdl(id, cnt) })
  inp.value = ''
  if (alInp) alInp.value = ''
}

function rmMdl(id, idx) {
  const c = document.getElementById('ml-' + id)
  c.querySelectorAll('[data-idx]').forEach(item => {
    if (parseInt(item.dataset.idx) === idx) item.remove()
  })
}

async function testMdl(id, mid, idx) {
  const tr = document.getElementById('tr-' + id)
  showSpinner(tr)
  try {
    const mirEl = document.getElementById('mir-' + id)
    const mirrorUrls = mirEl ? mirEl.value : undefined
    const ptEl = document.getElementById('pt-' + id)
    const type = ptEl ? ptEl.value : 'openai'
    const apiType = type === 'anthropic' ? 'anthropic' : 'openai'
    // antigravity\uFF1A\u7528\u8868\u5355\u5F53\u524D\u503C\u76F4\u63A5\u6D4B\uFF0C\u65E0\u9700\u5148\u4FDD\u5B58\uFF08refresh_token \u53EF\u80FD\u5728\u8868\u5355\u91CC\u521A\u586B\uFF09
    if (type === 'antigravity') {
      const keys = getKeys(id)
      const apiKey = keys.length > 0 ? keys[0].key : ''
      const url = document.getElementById('url-' + id).value.trim()
      const r = await testModelConnection(url, apiType, apiKey, mid, id, mirrorUrls, type, provProject(id))
      showResult(tr, r.success, r.success ? '' : (r.message || ('HTTP ' + r.status)))
      return
    }
    const r = await fetch('/admin/api/providers/' + encodeURIComponent(id) + '/test-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId: mid, mirrorUrls })
    })
    const d = await r.json()
    if (d.success && d.data) {
      showResult(tr, d.data.success, d.data.success ? '' : (d.data.message || '\u8FDE\u63A5\u5931\u8D25'))
    } else {
      showResult(tr, false, d.message || '\u6D4B\u8BD5\u5931\u8D25')
    }
  } catch (e) { showResult(tr, false, '\u8BF7\u6C42\u5931\u8D25') }
}

// proxy keys
async function genKey() {
  const name = await pM('\u8F93\u5165 Key \u540D\u79F0\uFF08\u53EF\u9009\uFF09')
  if (name === null) return
  showM('<h3><i class="fas fa-key c-p"></i> \u751F\u6210\u4EE4\u724C</h3><div class="fg"><label>\u6709\u6548\u671F</label><select id="exp"><option value="30d">30 \u5929</option><option value="90d">90 \u5929</option><option value="180d">180 \u5929</option><option value="1y">1 \u5E74</option><option value="forever" selected>\u6C38\u4E45</option></select></div><div class="fa"><button class="btn btn-s" id="gKc">\u53D6\u6D88</button><button class="btn btn-p" id="gKo">\u751F\u6210</button></div>')
  document.getElementById('gKc').addEventListener('click', closeM)
  document.getElementById('gKo').addEventListener('click', function() { doGenKey(document.getElementById('exp').value, name) })
}

async function doGenKey(exp, name) {
  closeM()
  const nm = name || ''
  const r = await fetch('/admin/api/proxy-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nm, expiresIn: exp })
  })
  const d = await r.json()
  if (d.success && d.data) {
    showM('<h3><i class="fas fa-check-circle c-s"></i> \u751F\u6210\u6210\u529F</h3><p>\u8BF7\u59A5\u5584\u4FDD\u5B58\uFF0C\u5207\u52FF\u6CC4\u9732\uFF1A</p><div class="mk">' + d.data.key + '</div><div class="fa"><button class="btn btn-p" onclick="closeM();location.reload()">\u5173\u95ED</button></div>')
  } else toast(d.message || '\u751F\u6210\u5931\u8D25', 'error')
}

async function rmKey(id) {
  if (!(await cM('\u786E\u5B9A\u8981\u5220\u9664\u6B64 Key\uFF1F'))) return
  const r = await fetch('/admin/api/proxy-keys/' + encodeURIComponent(id), { method: 'DELETE' })
  const d = await r.json()
  if (d.success) { toast('\u5DF2\u5220\u9664', 'success'); location.reload() }
  else toast(d.message || '\u5220\u9664\u5931\u8D25', 'error')
}

// \u91CD\u65B0\u751F\u6210\u4EE4\u724C: \u65E7 key \u7ACB\u5373\u5931\u6548, \u751F\u6210\u65B0 key
async function regenerateKey(id) {
  if (!(await cM('\u91CD\u65B0\u751F\u6210\u540E\u65E7 Key \u5C06\u7ACB\u5373\u5931\u6548\uFF0C\u786E\u5B9A\u7EE7\u7EED\uFF1F'))) return
  const r = await fetch('/admin/api/proxy-keys/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regenerate: true })
  })
  const d = await r.json()
  if (!d.success) { toast(d.message || '\u91CD\u65B0\u751F\u6210\u5931\u8D25', 'error'); return }
  const nk = d.data.key
  // \u663E\u793A\u65B0 key \u4F9B\u590D\u5236 (\u7528\u4E8B\u4EF6\u7ED1\u5B9A\u907F\u514D\u6A21\u677F\u5B57\u7B26\u4E32\u5185\u5F15\u53F7\u8F6C\u4E49\u95EE\u9898)
  showM('<h3><i class="fas fa-sync-alt c-p"></i> \u4EE4\u724C\u5DF2\u91CD\u65B0\u751F\u6210</h3><div class="fg"><label>\u65B0 Key\uFF08\u4EC5\u663E\u793A\u4E00\u6B21\uFF09</label><input type="text" id="rgKey" value="' + nk + '" readonly onclick="this.select()"></div><div class="fa"><button class="btn btn-p" id="rgCopyBtn">\u590D\u5236</button><button class="btn btn-s" onclick="closeM()">\u5173\u95ED</button></div>')
  const copyBtn = document.getElementById('rgCopyBtn')
  if (copyBtn) copyBtn.onclick = function () { copyText(document.getElementById('rgKey').value, this); toast('\u5DF2\u590D\u5236', 'success') }
  toast('\u5DF2\u91CD\u65B0\u751F\u6210', 'success')
}

// proxy key list interactions
async function togglePb(id, checked) {
  const pi = document.querySelector('.pi[data-id="' + id + '"]')
  if (!pi) return
  const b = pi.querySelector('.ps .bd')
  if (b) { b.textContent = checked ? '\u5DF2\u542F\u7528' : '\u672A\u542F\u7528'; b.className = 'bd ' + (checked ? 'bd-on' : 'bd-off') }
  const r = await fetch('/admin/api/providers/' + encodeURIComponent(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: checked })
  })
  const d = await r.json()
  if (!d.success) toast(d.message || '\u64CD\u4F5C\u5931\u8D25', 'error')
}

function toggleKeyVis(id) {
  const el = document.getElementById('kv-' + id)
  const full = el.dataset.full
  const vis = el.dataset.vis === '1'
  if (vis) {
    el.textContent = full.length > 12
      ? full.substring(0, 8) + '*****' + full.substring(full.length - 4)
      : full
    el.dataset.vis = '0'
  } else {
    el.textContent = full
    el.dataset.vis = '1'
  }
}

async function toggleProxyKey(id, checked) {
  const r = await fetch('/admin/api/proxy-keys/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: checked })
  })
  const d = await r.json()
  if (d.success) {
    const ki = document.querySelector('.ki[data-id="' + id + '"]')
    if (ki) {
      const b = ki.querySelector('.fc .bd')
      if (b) { b.textContent = checked ? '\u5DF2\u542F\u7528' : '\u5DF2\u7981\u7528'; b.className = 'bd ' + (checked ? 'bd-on' : 'bd-off') }
    }
  } else toast(d.message || '\u64CD\u4F5C\u5931\u8D25', 'error')
}

// \u4E2D\u6587\u8BF4\u660E\uFF1A\u6839\u636E\u70B9\u51FB\u548C URL \u951A\u70B9\u540C\u6B65\u4FA7\u680F\u9009\u4E2D\u6001\uFF0C\u907F\u514D\u5BFC\u822A\u59CB\u7EC8\u505C\u7559\u5728\u201C\u6982\u89C8\u201D\u3002
const adminNavLinks = Array.from(document.querySelectorAll('.admin-nav a[href^="#"]'))
function setActiveAdminNav(hash) {
  const targetHash = adminNavLinks.some(function (link) { return link.getAttribute('href') === hash }) ? hash : '#overview'
  adminNavLinks.forEach(function (link) {
    const active = link.getAttribute('href') === targetHash
    link.classList.toggle('is-active', active)
    if (active) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })
}
adminNavLinks.forEach(function (link) {
  link.addEventListener('click', function () { setActiveAdminNav(link.getAttribute('href') || '#overview') })
})
window.addEventListener('hashchange', function () { setActiveAdminNav(location.hash) })
setActiveAdminNav(location.hash)

// ===== \u7528\u91CF\u7EDF\u8BA1 =====
const fmtNum = (n) => Number(n || 0).toLocaleString('zh-CN')
const fmtTok = (n) => {
  const v = Number(n || 0)
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(v)
}

async function loadUsage() {
  const days = document.getElementById('usage-days')?.value || '1'
  try {
    const r = await fetch('/admin/api/usage?days=' + days)
    const d = await r.json()
    if (!d.success) throw new Error(d.message || '\u52A0\u8F7D\u5931\u8D25')
    const s = d.data || {}
    setText('u-req', fmtNum(s.totalRequests))
    setText('u-ok', fmtNum(s.successRequests) + ' \u6210\u529F')
    setText('u-in', fmtTok(s.totalPromptTokens))
    setText('u-out', fmtTok(s.totalCompletionTokens))
    setText('u-lat', s.avgLatencyMs ? fmtNum(s.avgLatencyMs) + ' ms' : '-')

    // \u6BCF\u65E5\u8D8B\u52BF
    const trendEl = document.getElementById('u-trend')
    const trendWrap = document.getElementById('u-trend-wrap')
    if (s.daily && s.daily.length > 1) {
      const max = Math.max(...s.daily.map((x) => x.requests), 1)
      trendEl.innerHTML = '<div class="fc" style="flex-direction:column;gap:8px">' + s.daily.map((x) => {
        const pct = Math.max(Math.round((x.requests / max) * 100), 2)
        return '<div class="fc" style="width:100%;gap:8px"><span style="flex:0 0 70px;font-size:11px;color:var(--color-muted)">' + x.date.slice(5) + '</span><div class="fc" style="flex:1;height:18px;background:var(--color-rule);border-radius:4px;overflow:hidden"><div class="trend-fill" style="width:' + pct + '%;height:100%;background:var(--color-accent);border-radius:4px"></div></div><span style="flex:0 0 90px;text-align:right;font-size:11px" title="\u8F93\u5165 ' + fmtTok(x.promptTokens) + ' + \u8F93\u51FA ' + fmtTok(x.completionTokens) + ' tokens">' + fmtNum(x.requests) + ' \u8BF7\u6C42 \xB7 ' + fmtTok(x.promptTokens + x.completionTokens) + ' tok</span></div>'
      }).join('') + '</div>'
      trendWrap.classList.remove('hd')
    } else {
      trendWrap.classList.add('hd')
    }

    // \u6A21\u578B\u6392\u884C
    renderRank('u-models', s.byModel, 'model')
    // \u6E20\u9053\u6392\u884C
    renderRank('u-providers', s.byProvider, 'provider')
  } catch (e) {
    toast(e.message || '\u7528\u91CF\u52A0\u8F7D\u5931\u8D25', 'error')
  }
}

function renderRank(elId, list, keyName) {
  const el = document.getElementById(elId)
  if (!el) return
  if (!list || list.length === 0) {
    el.innerHTML = '<p class="mu" style="padding:8px 0">\u6682\u65E0\u6570\u636E</p>'
    return
  }
  const max = Math.max(...list.map((x) => x.requests), 1)
  el.innerHTML = list.slice(0, 10).map((x, i) => {
    const pct = Math.max(Math.round((x.requests / max) * 100), 3)
    return '<div class="rk-row" style="margin-bottom:10px">' +
      '<div class="fc" style="justify-content:space-between;gap:8px;margin-bottom:4px">' +
      '<code style="font-size:12px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + escapeHtml(x[keyName]) + '">' + escapeHtml(x[keyName]) + '</code>' +
      '<span style="font-size:11px;color:var(--color-muted);flex-shrink:0">' + fmtNum(x.requests) + ' \u8BF7\u6C42 \xB7 ' + fmtTok(x.promptTokens + x.completionTokens) + ' tokens</span></div>' +
      '<div style="height:6px;background:var(--color-rule);border-radius:3px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:var(--color-accent);border-radius:3px"></div></div></div>'
  }).join('')
}

function setText(id, text) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

// ===== \u5907\u4EFD\u4E0E\u6062\u590D =====
function bkResult(elId, ok, msg) {
  const el = document.getElementById(elId)
  if (el) el.innerHTML = '<div class="al ' + (ok ? 'al-ok' : 'al-err') + '">' + msg + '</div>'
}
// \u5F39\u7A97\u8F93\u5165\u7BA1\u7406\u5458\u5BC6\u7801, \u8FD4\u56DE SHA-256 \u54C8\u5E0C; \u53D6\u6D88\u8FD4\u56DE null
function adminAuthHash() {
  return new Promise(function (resolve) {
    showM('<h3><i class="fas fa-lock c-p"></i> \u9A8C\u8BC1\u7BA1\u7406\u5458\u5BC6\u7801</h3><p class="form-helper">\u6B64\u64CD\u4F5C\u654F\u611F\uFF0C\u9700\u8981\u8F93\u5165\u7BA1\u7406\u5458\u5BC6\u7801\u786E\u8BA4\u3002</p><div class="fg"><label>\u7BA1\u7406\u5458\u5BC6\u7801</label><input type="password" id="authPass" class="fx1" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" autocomplete="current-password"></div><div class="fa"><button class="btn btn-s" onclick="closeM()">\u53D6\u6D88</button><button class="btn btn-p" id="authOk">\u786E\u8BA4</button></div>')
    const ok = document.getElementById('authOk')
    ok.onclick = async function () {
      const pass = document.getElementById('authPass').value
      if (!pass) { toast('\u8BF7\u8F93\u5165\u5BC6\u7801', 'error'); return }
      closeM()
      const enc = new TextEncoder().encode(pass)
      const buf = await crypto.subtle.digest('SHA-256', enc)
      resolve(Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0') }).join(''))
    }
  })
}
async function backupExport() {
  const tr = document.getElementById('bk-io-result')
  showSpinner(tr)
  const hash = await adminAuthHash()
  if (!hash) { tr.innerHTML = ''; return }
  try {
    const r = await fetch('/admin/api/backup/export', { headers: { 'X-Admin-Auth': hash } })
    if (!r.ok) { bkResult('bk-io-result', false, '\u5BFC\u51FA\u5931\u8D25: ' + (r.status === 401 ? '\u5BC6\u7801\u9A8C\u8BC1\u5931\u8D25' : 'HTTP ' + r.status)); return }
    const blob = await r.blob()
    const cd = r.headers.get('Content-Disposition') || ''
    const name = (cd.match(/filename="?([^";]+)/) || [])[1] || 'ai-gateway-backup.json'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
    bkResult('bk-io-result', true, '\u5DF2\u5BFC\u51FA ' + name + '\uFF08\u6CE8\uFF1A\u4E3A\u4FDD\u62A4\u9690\u79C1\uFF0CTelegram \u901A\u77E5\u914D\u7F6E\u4E0D\u5305\u542B\u5728\u5907\u4EFD\u5185\uFF0C\u8FD8\u539F\u540E\u9700\u91CD\u65B0\u586B\u5199\uFF09')
  } catch (e) { bkResult('bk-io-result', false, '\u5BFC\u51FA\u5931\u8D25: ' + e.message) }
}
// \u5BFC\u5165\u6570\u636E\u5E93: \u70B9\u51FB\u6309\u94AE\u7ACB\u5373\u9A8C\u8BC1\u7BA1\u7406\u5458\u5BC6\u7801, \u901A\u8FC7\u540E\u624D\u9009\u62E9\u6587\u4EF6
let bkImportHash = null
function backupImportPick() {
  cM('\u5BFC\u5165\u5C06<strong>\u8986\u76D6</strong>\u5F53\u524D\u6240\u6709\u6570\u636E(\u6E20\u9053/\u4EE4\u724C/\u7528\u91CF)\uFF0C\u786E\u5B9A\u7EE7\u7EED\uFF1F').then(async function (ok) {
    if (!ok) return
    bkImportHash = await adminAuthHash()
    if (!bkImportHash) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = function () { backupImport(input.files[0]) }
    input.click()
  })
}
function backupImport(file) {
  if (!file || !bkImportHash) return
  const reader = new FileReader()
  reader.onload = async function () {
    try {
      const r = await fetch('/admin/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Auth': bkImportHash },
        body: reader.result,
      })
      const d = await r.json()
      bkResult('bk-io-result', d.success, d.message || (r.status === 401 ? '\u5BC6\u7801\u9A8C\u8BC1\u5931\u8D25' : '\u5BFC\u5165\u5B8C\u6210'))
      if (d.success) {
        toast('\u5BFC\u5165\u6210\u529F\uFF0C\u5373\u5C06\u91CD\u65B0\u767B\u5F55\u2026', 'success')
        setTimeout(function () { location.href = '/admin/login' }, 1500)
      }
    } catch (e) { bkResult('bk-io-result', false, '\u5BFC\u5165\u5931\u8D25: ' + e.message) }
  }
  reader.readAsText(file)
}
async function backupToR2() {
  const tr = document.getElementById('bk-r2-result')
  showSpinner(tr)
  const r = await fetch('/admin/api/backup/to-r2', { method: 'POST' })
  const d = await r.json()
  bkResult('bk-r2-result', d.success, d.message || '\u5907\u4EFD\u5931\u8D25')
  if (d.success) backupList()
}
async function backupList() {
  const el = document.getElementById('bk-r2-result')
  showSpinner(el)
  try {
    const r = await fetch('/admin/api/backup/list')
    const d = await r.json()
    if (!d.success) { bkResult('bk-r2-result', false, d.message || '\u83B7\u53D6\u5931\u8D25'); return }
    const list = d.data || []
    if (list.length === 0) { bkResult('bk-r2-result', false, 'R2 \u4E2D\u6682\u65E0\u5907\u4EFD\u5FEB\u7167'); return }
    el.innerHTML = '<div class="panel-list" style="margin-top:6px">' + list.map(function (f, i) {
      const shortKey = f.key.indexOf('/') >= 0 ? f.key.slice(f.key.indexOf('/') + 1) : f.key
      const Q = String.fromCharCode(39)
      return '<div class="fc field-row" style="justify-content:space-between;padding:6px 8px;border:1px solid var(--color-rule);border-radius:8px;margin-bottom:6px"><span style="font-family:var(--font-mono);font-size:11px;overflow:hidden;text-overflow:ellipsis">' + shortKey + '</span><span style="font-size:11px;color:var(--color-muted);flex-shrink:0">' + (f.size ? (f.size / 1024).toFixed(1) + ' KB' : '') + '</span><span class="fc" style="gap:4px;flex-shrink:0"><button class="btn btn-xs" onclick="backupRestore(' + Q + f.key + Q + ')" title="\u4ECE\u8BE5\u5FEB\u7167\u6062\u590D"><i class="fas fa-history"></i>\u6062\u590D</button><button class="btn btn-xs bd-del" onclick="backupDelete(' + Q + f.key + Q + ')" title="\u5220\u9664\u5FEB\u7167"><i class="fas fa-trash"></i></button></span></div>'
    }).join('') + '</div>'
  } catch (e) { bkResult('bk-r2-result', false, '\u83B7\u53D6\u5931\u8D25: ' + e.message) }
}
async function backupRestore(key) {
  if (!(await cM('\u4ECE\u5FEB\u7167\u6062\u590D\u5C06<strong>\u8986\u76D6</strong>\u5F53\u524D\u6240\u6709\u6570\u636E\uFF0C\u786E\u5B9A\u7EE7\u7EED\uFF1F'))) return
  const hash = await adminAuthHash()
  if (!hash) return
  const r = await fetch('/admin/api/backup/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Auth': hash },
    body: JSON.stringify({ key: key }),
  })
  const d = await r.json()
  bkResult('bk-r2-result', d.success, d.message || (r.status === 401 ? '\u5BC6\u7801\u9A8C\u8BC1\u5931\u8D25' : '\u6062\u590D\u5931\u8D25'))
  if (d.success) {
    toast('\u6062\u590D\u6210\u529F\uFF0C\u5373\u5C06\u91CD\u65B0\u767B\u5F55\u2026', 'success')
    setTimeout(function () { location.href = '/admin/login' }, 1500)
  }
}
async function backupDelete(key) {
  if (!(await cM('\u786E\u5B9A\u5220\u9664\u6B64\u5FEB\u7167\uFF1F'))) return
  const hash = await adminAuthHash()
  if (!hash) return
  const r = await fetch('/admin/api/backup/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Auth': hash },
    body: JSON.stringify({ key: key }),
  })
  const d = await r.json()
  bkResult('bk-r2-result', d.success, d.message || (r.status === 401 ? '\u5BC6\u7801\u9A8C\u8BC1\u5931\u8D25' : '\u5220\u9664\u5931\u8D25'))
  if (d.success) backupList()
}

// ===== Telegram \u5907\u4EFD =====
function tgParams() {
  return {
    botToken: document.getElementById('tgToken').value.trim(),
    chatId: document.getElementById('tgChat').value.trim(),
  }
}
async function telegramTest() {
  const el = document.getElementById('bk-tg-result')
  showSpinner(el)
  const p = tgParams()
  if (!p.botToken || !p.chatId) { bkResult('bk-tg-result', false, '\u8BF7\u5148\u586B\u5199 Bot Token \u548C USER ID'); return }
  const r = await fetch('/admin/api/telegram/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  })
  const d = await r.json()
  bkResult('bk-tg-result', d.success, d.message || '\u6D4B\u8BD5\u5931\u8D25')
}
async function backupToTelegram() {
  const el = document.getElementById('bk-tg-result')
  showSpinner(el)
  const p = tgParams()
  if (!p.botToken || !p.chatId) { bkResult('bk-tg-result', false, '\u8BF7\u5148\u586B\u5199 Bot Token \u548C USER ID'); return }
  const r = await fetch('/admin/api/backup/to-telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  })
  const d = await r.json()
  bkResult('bk-tg-result', d.success, d.message || '\u5907\u4EFD\u5931\u8D25')
}

// ===== \u4FA7\u8FB9\u680F\u6536\u7F29/\u5C55\u5F00(PC \u7AEF, \u8BB0\u5FC6\u72B6\u6001) =====
function toggleRail() {
  const shell = document.querySelector('.admin-shell')
  const collapsed = shell.classList.toggle('is-collapsed')
  try { localStorage.setItem('admin-rail-collapsed', collapsed ? '1' : '0') } catch (e) {}
  const btn = document.querySelector('.rail-toggle')
  if (btn) btn.title = collapsed ? '\u5C55\u5F00\u4FA7\u8FB9\u680F' : '\u6536\u7F29\u4FA7\u8FB9\u680F'
}
// \u6062\u590D\u4E0A\u6B21\u72B6\u6001
try {
  if (localStorage.getItem('admin-rail-collapsed') === '1') {
    document.querySelector('.admin-shell')?.classList.add('is-collapsed')
    const btn = document.querySelector('.rail-toggle')
    if (btn) btn.title = '\u5C55\u5F00\u4FA7\u8FB9\u680F'
  }
} catch (e) {}

// ===== \u6A21\u5757\u5316\u5BFC\u822A: \u70B9\u51FB\u5BFC\u822A\u53EA\u663E\u793A\u5BF9\u5E94\u6A21\u5757 =====
function showModule() {
  const hash = location.hash || '#overview'
  const mods = ['overview', 'providers', 'quota', 'proxy-keys', 'usage', 'backup']
  mods.forEach(m => {
    const el = document.getElementById(m)
    if (el) el.style.display = (hash === '#' + m) ? '' : 'none'
  })
  document.querySelectorAll('.admin-nav__link').forEach(a => {
    const href = a.getAttribute('href') || ''
    a.classList.toggle('is-active', href === hash || (hash === '#overview' && href === '#overview'))
  })
  if (hash === '#usage') loadUsage()
  if (hash === '#quota' && !quotaReady) renderQuotaSkeleton()
}
window.addEventListener('hashchange', showModule)
showModule()

// \u8D26\u53F7\u7EA7\u300C\u67E5\u8BE2\u300D\u6309\u94AE\u8D70\u4E8B\u4EF6\u59D4\u6258\uFF08\u5185\u5BB9\u4F1A\u88AB innerHTML \u66FF\u6362\uFF0C\u59D4\u6258\u5728\u5BB9\u5668\u4E0A\uFF09
const quotaBodyEl = document.getElementById('quotaBody')
if (quotaBodyEl) {
  quotaBodyEl.addEventListener('click', function (e) {
    const b = e.target && e.target.closest ? e.target.closest('[data-agq]') : null
    if (!b) return
    agAccountQuery(b.getAttribute('data-agq'), Number(b.getAttribute('data-agi')))
  })
}

// \u8FDB\u5165\u7528\u91CF section \u65F6\u52A0\u8F7D
if (location.hash === '#usage') loadUsage()
</script>
</body></html>`);
}

// src/index.ts
init_storage();

// src/backup.ts
init_storage();
init_storage_adapter();
var BACKUP_PREFIX = "backup/";
async function exportBackupData(env) {
  const kv = [];
  const usage = [];
  const kvStore = getKV(env);
  const listRes = await kvStore.list();
  for (const k of listRes.keys) {
    if (k.name.startsWith("admin:session:") || k.name === "admin:credentials" || k.name === "telegram:backup") continue;
    const val = await kvStore.get(k.name);
    if (val !== null) {
      kv.push({ key: k.name, value: val });
    }
  }
  return { version: 1, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), kv, usage };
}
async function importBackupData(env, data) {
  const kv = Array.isArray(data.kv) ? data.kv : [];
  const usage = Array.isArray(data.usage) ? data.usage : [];
  const kvStore = getKV(env);
  const existing = await kvStore.list();
  for (const k of existing.keys) {
    if (k.name.startsWith("admin:session:") || k.name === "admin:credentials" || k.name === "telegram:backup") continue;
    await kvStore.delete(k.name);
  }
  for (const item of kv) {
    await kvStore.put(item.key, item.value);
  }
  await deleteAllSessions(env);
  return { kv: kv.length, usage: usage.length };
}
async function handleBackupExport(c) {
  const providedHash = c.req.header("X-Admin-Auth");
  if (!providedHash) return c.json({ success: false, message: "\u65E0\u6743\u9650" }, 401);
  const cred = await getAdminCredentials(c.env);
  if (!cred || cred.passwordHash !== providedHash) return c.json({ success: false, message: "\u6743\u9650\u4E0D\u8DB3" }, 401);
  const data = await exportBackupData(c.env);
  const filename = `ai-gateway-backup-${data.exportedAt.replace(/[:.]/g, "-")}.json`;
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
async function handleBackupImport(c) {
  const providedHash = c.req.header("X-Admin-Auth");
  if (!providedHash) return c.json({ success: false, message: "\u65E0\u6743\u9650" }, 401);
  const cred = await getAdminCredentials(c.env);
  if (!cred || cred.passwordHash !== providedHash) return c.json({ success: false, message: "\u6743\u9650\u4E0D\u8DB3" }, 401);
  try {
    const data = await c.req.json();
    if (!data.version || !data.kv) {
      return c.json({ success: false, message: "\u6587\u4EF6\u683C\u5F0F\u9519\u8BEF" }, 400);
    }
    const counts = await importBackupData(c.env, data);
    return c.json({ success: true, message: `\u5BFC\u5165\u6210\u529F: \u6062\u590D\u4E86 ${counts.kv} \u9879\u914D\u7F6E\u4E0E ${counts.usage} \u6761\u7528\u91CF\u8BB0\u5F55` });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, message: `\u89E3\u6790\u6216\u5BFC\u5165\u5931\u8D25: ${message}` }, 400);
  }
}
async function handleBackupToR2(c) {
  const bucket = c.env.ai_gateway_backup;
  if (!bucket) return c.json({ success: false, message: "R2 \u672A\u914D\u7F6E(binding: ai_gateway_backup)" }, 400);
  try {
    const data = await exportBackupData(c.env);
    const key = `${BACKUP_PREFIX}${data.exportedAt.replace(/[:.]/g, "-")}.json`;
    await bucket.put(key, JSON.stringify(data), {
      httpMetadata: { contentType: "application/json" }
    });
    const all = await bucket.list({ prefix: BACKUP_PREFIX });
    if (all.objects.length > 30) {
      const sorted = all.objects.sort((a, b) => a.uploaded > b.uploaded ? -1 : 1);
      for (const old of sorted.slice(30)) await bucket.delete(old.key);
    }
    return c.json({ success: true, message: `\u5DF2\u5907\u4EFD\u5230 R2: ${key}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, message: `\u5907\u4EFD\u5931\u8D25: ${message}` }, 500);
  }
}
async function handleBackupList(c) {
  const bucket = c.env.ai_gateway_backup;
  if (!bucket) return c.json({ success: false, message: "R2 \u672A\u914D\u7F6E" }, 400);
  try {
    const all = await bucket.list({ prefix: BACKUP_PREFIX });
    const sorted = all.objects.sort((a, b) => a.uploaded > b.uploaded ? -1 : 1);
    return c.json({ success: true, data: sorted });
  } catch (error) {
    return c.json({ success: false, message: "\u83B7\u53D6\u5217\u8868\u5931\u8D25" }, 500);
  }
}
async function handleBackupRestore(c) {
  const providedHash = c.req.header("X-Admin-Auth");
  if (!providedHash) return c.json({ success: false, message: "\u65E0\u6743\u9650" }, 401);
  const cred = await getAdminCredentials(c.env);
  if (!cred || cred.passwordHash !== providedHash) return c.json({ success: false, message: "\u6743\u9650\u4E0D\u8DB3" }, 401);
  const bucket = c.env.ai_gateway_backup;
  if (!bucket) return c.json({ success: false, message: "R2 \u672A\u914D\u7F6E" }, 400);
  const body = await c.req.json();
  if (!body.key) return c.json({ success: false, message: "\u672A\u6307\u5B9A key" }, 400);
  try {
    const obj = await bucket.get(body.key);
    if (!obj) return c.json({ success: false, message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u5FEB\u7167" }, 404);
    const json = await obj.json();
    const counts = await importBackupData(c.env, json);
    return c.json({ success: true, message: `\u5DF2\u6062\u590D ${counts.kv} \u9879\u914D\u7F6E\u4E0E ${counts.usage} \u6761\u7528\u91CF\u8BB0\u5F55` });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, message: `\u6062\u590D\u5931\u8D25: ${message}` }, 500);
  }
}
async function handleBackupDelete(c) {
  const providedHash = c.req.header("X-Admin-Auth");
  if (!providedHash) return c.json({ success: false, message: "\u65E0\u6743\u9650" }, 401);
  const cred = await getAdminCredentials(c.env);
  if (!cred || cred.passwordHash !== providedHash) return c.json({ success: false, message: "\u6743\u9650\u4E0D\u8DB3" }, 401);
  const bucket = c.env.ai_gateway_backup;
  if (!bucket) return c.json({ success: false, message: "R2 \u672A\u914D\u7F6E" }, 400);
  const body = await c.req.json();
  if (!body.key) return c.json({ success: false, message: "\u672A\u6307\u5B9A key" }, 400);
  try {
    await bucket.delete(body.key);
    return c.json({ success: true, message: "\u5DF2\u5220\u9664\u5FEB\u7167" });
  } catch (error) {
    return c.json({ success: false, message: "\u5220\u9664\u5931\u8D25" }, 500);
  }
}
async function saveTgConfig(env, botToken, chatId) {
  await getKV(env).put("telegram:backup", JSON.stringify({ botToken, chatId }));
}
async function handleTelegramTest(c) {
  const { botToken, chatId } = await c.req.json();
  if (!botToken || !chatId) return c.json({ success: false, message: "\u7F3A\u5C11\u53C2\u6570" }, 400);
  try {
    const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: "AI Gateway: \u8FD9\u662F\u4E00\u4E2A\u6D4B\u8BD5\u6D88\u606F\uFF0C\u914D\u7F6E\u6210\u529F\uFF01" })
    });
    const d = await r.json();
    if (d.ok) {
      await saveTgConfig(c.env, botToken, chatId);
      return c.json({ success: true, message: "\u6D88\u606F\u53D1\u9001\u6210\u529F\uFF0C\u914D\u7F6E\u5DF2\u4FDD\u5B58" });
    }
    return c.json({ success: false, message: d.description || "\u53D1\u9001\u5931\u8D25" }, 400);
  } catch (e) {
    return c.json({ success: false, message: "\u8BF7\u6C42\u5931\u8D25" }, 500);
  }
}
async function handleBackupToTelegram(c) {
  const { botToken, chatId } = await c.req.json();
  if (!botToken || !chatId) return c.json({ success: false, message: "\u7F3A\u5C11\u53C2\u6570" }, 400);
  try {
    const data = await exportBackupData(c.env);
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const filename = `ai-gateway-backup-${data.exportedAt.replace(/[:.]/g, "-")}.json`;
    const fd = new FormData();
    fd.append("chat_id", chatId);
    fd.append("caption", `AI Gateway \u624B\u52A8\u5FEB\u7167
\u65F6\u95F4\uFF1A${data.exportedAt}
\u6E20\u9053\u4E0E\u914D\u7F6E\uFF1A${data.kv.length} \u9879
\u7528\u91CF\u8BB0\u5F55\uFF1A${data.usage.length} \u6761`);
    fd.append("document", blob, filename);
    const r = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, { method: "POST", body: fd });
    const d = await r.json();
    if (d.ok) {
      await saveTgConfig(c.env, botToken, chatId);
      return c.json({ success: true, message: "\u5DF2\u53D1\u9001\u81F3 Telegram" });
    }
    return c.json({ success: false, message: d.description || "\u53D1\u9001\u5931\u8D25" }, 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ success: false, message: `\u5907\u4EFD\u5931\u8D25: ${message}` }, 500);
  }
}

// src/index.ts
var app = new Hono2();
app.use("*", cors());
app.use("*", logger());
var seeded = false;
app.use("*", async (c, next) => {
  if (!seeded) {
    await seedInitialData(c.env).catch((e) => console.warn("[Seed] Error:", e?.message));
    seeded = true;
  }
  return next();
});
async function renderHome(c) {
  const { getCookie: getCookie2 } = await Promise.resolve().then(() => (init_cookie2(), cookie_exports));
  const sessionId = getCookie2(c, "session_id");
  let isLoggedIn = false;
  if (sessionId) {
    const session = await getSession(c.env, sessionId);
    isLoggedIn = session !== null;
  }
  return renderHomePage(c, isLoggedIn);
}
app.get("/", renderHome);
app.get("/home", renderHome);
app.get("/admin/login", async (c) => renderLoginPage(c));
app.post("/admin/login", handleLogin);
app.get("/admin/logout", handleLogout);
app.use("/admin/*", adminAuthMiddleware);
app.get("/admin", async (c) => {
  const res = await renderAdminPage(c);
  res.headers.set("Cache-Control", "no-store, must-revalidate");
  return res;
});
app.get("/admin/api/status", handleStatus);
app.get("/admin/api/providers", handleGetProviders);
app.post("/admin/api/providers", handleCreateProvider);
app.put("/admin/api/providers/:id", handleUpdateProvider);
app.delete("/admin/api/providers/:id", handleDeleteProvider);
app.post("/admin/api/providers/:id/test-model", handleTestModel);
app.put("/admin/api/providers/:id/ds-account", handleSaveDsAccount);
app.post("/admin/api/providers/:id/ds-login", handleDsLogin);
app.delete("/admin/api/providers/:id/ds-account", handleClearDsAccount);
app.post("/admin/api/test-key", handleTestKeyNew);
app.post("/admin/api/test-model", handleTestModelNew);
app.get("/admin/api/proxy-keys", handleGetProxyKeys);
app.post("/admin/api/proxy-keys", handleCreateProxyKey);
app.delete("/admin/api/proxy-keys/:id", handleDeleteProxyKey);
app.patch("/admin/api/proxy-keys/:id", handleUpdateProxyKey);
app.get("/admin/api/usage", handleGetUsage);
app.post("/admin/api/tts-preview", handleTtsPreview);
app.post("/admin/api/antigravity/oauth/start", handleAntigravityOAuthStart);
app.post("/admin/api/antigravity/oauth/complete", handleAntigravityOAuthComplete);
app.post("/admin/api/antigravity/models", handleAntigravityModels);
app.post("/admin/api/antigravity/quota", handleAntigravityQuotaAll);
app.post("/admin/api/antigravity/accounts", handleAntigravityAccounts);
app.post("/admin/api/vertex/verify", handleVertexVerify);
app.post("/admin/api/devin/oauth/start", handleDevinOAuthStart);
app.post("/admin/api/devin/oauth/complete", handleDevinOAuthComplete);
app.post("/admin/api/devin/verify", handleDevinVerify);
app.post("/admin/api/oauth/:provider/start", handleOAuthStart);
app.post("/admin/api/oauth/:provider/complete", handleOAuthComplete);
app.post("/admin/api/oauth/:provider/poll", handleOAuthPoll);
app.post("/admin/api/oauth/:provider/models", handleOAuthModels);
app.post("/admin/api/codebuddy/status", handleCodebuddyStatus);
app.post("/admin/api/codebuddy/checkin", handleCodebuddyCheckin);
app.get("/cron/checkin", handleCronCheckin);
app.on("HEAD", "/cron/checkin", handleCronCheckin);
app.post("/cron/checkin", handleCronCheckin);
app.get("/admin/api/backup/export", handleBackupExport);
app.post("/admin/api/backup/import", handleBackupImport);
app.post("/admin/api/backup/to-r2", handleBackupToR2);
app.get("/admin/api/backup/list", handleBackupList);
app.post("/admin/api/backup/restore", handleBackupRestore);
app.post("/admin/api/backup/delete", handleBackupDelete);
app.post("/admin/api/telegram/test", handleTelegramTest);
app.get("/admin/api/ds-probe", async (c) => {
  try {
    return c.json(await probeDeepSeek());
  } catch (err) {
    return c.json({ error: { message: err.message || "\u63A2\u9488\u5931\u8D25" } }, 500);
  }
});
app.post("/admin/api/ds-probe/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.password) {
    return c.json({ error: { message: "\u9700\u8981 password\uFF1B\u53EF\u9009 email \u6216 mobile(+area_code)" } }, 400);
  }
  try {
    return c.json(await probeDeepSeekLogin({
      email: body.email,
      mobile: body.mobile,
      password: body.password,
      areaCode: body.area_code
    }));
  } catch (err) {
    return c.json({ error: { message: err.message || "\u767B\u5F55\u63A2\u6D4B\u5931\u8D25" } }, 500);
  }
});
app.post("/admin/api/backup/to-telegram", handleBackupToTelegram);
app.use("/v1/*", proxyKeyAuthMiddleware);
app.get("/v1/models", handleModels);
app.post("/v1/chat/completions", handleProxy);
app.post("/v1/completions", handleProxy);
app.post("/v1/edits", handleProxy);
app.post("/v1/moderations", handleProxy);
app.post("/v1/messages", handleProxy);
app.post("/v1/responses", handleProxy);
app.post("/v1/audio/speech", handleProxy);
app.post("/v1/audio/transcriptions", handleProxy);
app.post("/v1/audio/translations", handleProxy);
app.post("/v1/images/generations", handleProxy);
app.post("/v1/images/edits", handleProxy);
app.post("/v1/images/variations", handleProxy);
app.post("/v1/embeddings", handleProxy);
app.post("/v1/engines/:model/embeddings", handleProxy);
app.post("/v1/videos/generations", handleProxy);
app.post("/v1/video/generations", handleProxy);
app.get("/v1/videos/status", handleProxy);
var notImplemented = (c) => c.json({
  error: { message: "API not implemented", type: "one_api_error", param: "", code: "api_not_implemented" }
}, 501);
app.get("/v1/files", notImplemented);
app.post("/v1/files", notImplemented);
app.delete("/v1/files/:id", notImplemented);
app.get("/v1/files/:id", notImplemented);
app.get("/v1/files/:id/content", notImplemented);
app.post("/v1/fine_tuning/jobs", notImplemented);
app.get("/v1/fine_tuning/jobs", notImplemented);
app.get("/v1/fine_tuning/jobs/:id", notImplemented);
app.post("/v1/fine_tuning/jobs/:id/cancel", notImplemented);
app.get("/v1/fine_tuning/jobs/:id/events", notImplemented);
app.post("/v1/assistants", notImplemented);
app.get("/v1/assistants/:id", notImplemented);
app.post("/v1/assistants/:id", notImplemented);
app.delete("/v1/assistants/:id", notImplemented);
app.get("/v1/assistants", notImplemented);
app.post("/v1/threads", notImplemented);
app.get("/v1/threads/:id", notImplemented);
app.post("/v1/threads/:id", notImplemented);
app.delete("/v1/threads/:id", notImplemented);
app.all("/v1/*", handleProxy);
app.notFound((c) => {
  return c.json({ error: { message: "\u63A5\u53E3\u4E0D\u5B58\u5728", type: "not_found" } }, 404);
});
app.onError((err, c) => {
  console.error("\u672A\u6355\u83B7\u7684\u9519\u8BEF:", err);
  return c.json({ error: { message: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF", type: "server_error" } }, 500);
});
var index_default = app;

// src/edgeone-entry.ts
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = crypto2;
} else {
  if (!globalThis.crypto.randomUUID && crypto2.randomUUID) {
    globalThis.crypto.randomUUID = crypto2.randomUUID.bind(crypto2);
  }
  if (!globalThis.crypto.subtle && crypto2.webcrypto) {
    globalThis.crypto.subtle = crypto2.webcrypto.subtle;
  }
}
async function onRequest(context) {
  const incoming = context.request;
  const env = {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "yxy.@990524gdg",
    OPENCODE_MIRRORS_URL: process.env.OPENCODE_MIRRORS_URL,
    AG_CLIENT_ID: process.env.AG_CLIENT_ID,
    AG_CLIENT_SECRET: process.env.AG_CLIENT_SECRET,
    ...process.env,
    ...context?.env || {}
  };
  const method = (incoming.method || "GET").toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  let request = incoming;
  if (hasBody) {
    try {
      const buf = await incoming.arrayBuffer();
      request = new Request(incoming.url, {
        method,
        headers: incoming.headers,
        body: buf.byteLength > 0 ? buf : void 0
      });
    } catch (err) {
      console.error("[Entry] Failed to materialize request body:", err?.message);
      request = incoming;
    }
  }
  return await index_default.fetch(request, env, context);
}
var edgeone_entry_default = index_default;
export {
  edgeone_entry_default as default,
  onRequest
};
