var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-3aPd7Z/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// _worker.js
var bt = Object.defineProperty;
var Ie = /* @__PURE__ */ __name((e) => {
  throw TypeError(e);
}, "Ie");
var wt = /* @__PURE__ */ __name((e, t, s) => t in e ? bt(e, t, { enumerable: true, configurable: true, writable: true, value: s }) : e[t] = s, "wt");
var p = /* @__PURE__ */ __name((e, t, s) => wt(e, typeof t != "symbol" ? t + "" : t, s), "p");
var He = /* @__PURE__ */ __name((e, t, s) => t.has(e) || Ie("Cannot " + s), "He");
var a = /* @__PURE__ */ __name((e, t, s) => (He(e, t, "read from private field"), s ? s.call(e) : t.get(e)), "a");
var v = /* @__PURE__ */ __name((e, t, s) => t.has(e) ? Ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), "v");
var u = /* @__PURE__ */ __name((e, t, s, r) => (He(e, t, "write to private field"), r ? r.call(e, s) : t.set(e, s), s), "u");
var y = /* @__PURE__ */ __name((e, t, s) => (He(e, t, "access private method"), s), "y");
var _e = /* @__PURE__ */ __name((e, t, s, r) => ({ set _(n) {
  u(e, t, n, s);
}, get _() {
  return a(e, t, r);
} }), "_e");
var Me = /* @__PURE__ */ __name((e, t, s) => (r, n) => {
  let i = -1;
  return o(0);
  async function o(l) {
    if (l <= i)
      throw new Error("next() called multiple times");
    i = l;
    let c, h = false, d;
    if (e[l] ? (d = e[l][0][0], r.req.routeIndex = l) : d = l === e.length && n || void 0, d)
      try {
        c = await d(r, () => o(l + 1));
      } catch (f) {
        if (f instanceof Error && t)
          r.error = f, c = await t(f, r), h = true;
        else
          throw f;
      }
    else
      r.finalized === false && s && (c = await s(r));
    return c && (r.finalized === false || h) && (r.res = c), r;
  }
  __name(o, "o");
}, "Me");
var xt = Symbol();
var Rt = /* @__PURE__ */ __name(async (e, t = /* @__PURE__ */ Object.create(null)) => {
  const { all: s = false, dot: r = false } = t, i = (e instanceof rt ? e.raw.headers : e.headers).get("Content-Type");
  return i != null && i.startsWith("multipart/form-data") || i != null && i.startsWith("application/x-www-form-urlencoded") ? Et(e, { all: s, dot: r }) : {};
}, "Rt");
async function Et(e, t) {
  const s = await e.formData();
  return s ? jt(s, t) : {};
}
__name(Et, "Et");
function jt(e, t) {
  const s = /* @__PURE__ */ Object.create(null);
  return e.forEach((r, n) => {
    t.all || n.endsWith("[]") ? Ot(s, n, r) : s[n] = r;
  }), t.dot && Object.entries(s).forEach(([r, n]) => {
    r.includes(".") && (Pt(s, r, n), delete s[r]);
  }), s;
}
__name(jt, "jt");
var Ot = /* @__PURE__ */ __name((e, t, s) => {
  e[t] !== void 0 ? Array.isArray(e[t]) ? e[t].push(s) : e[t] = [e[t], s] : t.endsWith("[]") ? e[t] = [s] : e[t] = s;
}, "Ot");
var Pt = /* @__PURE__ */ __name((e, t, s) => {
  let r = e;
  const n = t.split(".");
  n.forEach((i, o) => {
    o === n.length - 1 ? r[i] = s : ((!r[i] || typeof r[i] != "object" || Array.isArray(r[i]) || r[i] instanceof File) && (r[i] = /* @__PURE__ */ Object.create(null)), r = r[i]);
  });
}, "Pt");
var Ye = /* @__PURE__ */ __name((e) => {
  const t = e.split("/");
  return t[0] === "" && t.shift(), t;
}, "Ye");
var At = /* @__PURE__ */ __name((e) => {
  const { groups: t, path: s } = Ct(e), r = Ye(s);
  return St(r, t);
}, "At");
var Ct = /* @__PURE__ */ __name((e) => {
  const t = [];
  return e = e.replace(/\{[^}]+\}/g, (s, r) => {
    const n = `@${r}`;
    return t.push([n, s]), n;
  }), { groups: t, path: e };
}, "Ct");
var St = /* @__PURE__ */ __name((e, t) => {
  for (let s = t.length - 1; s >= 0; s--) {
    const [r] = t[s];
    for (let n = e.length - 1; n >= 0; n--)
      if (e[n].includes(r)) {
        e[n] = e[n].replace(r, t[s][1]);
        break;
      }
  }
  return e;
}, "St");
var Re = {};
var Ht = /* @__PURE__ */ __name((e, t) => {
  if (e === "*")
    return "*";
  const s = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (s) {
    const r = `${e}#${t}`;
    return Re[r] || (s[2] ? Re[r] = t && t[0] !== ":" && t[0] !== "*" ? [r, s[1], new RegExp(`^${s[2]}(?=/${t})`)] : [e, s[1], new RegExp(`^${s[2]}$`)] : Re[r] = [e, s[1], true]), Re[r];
  }
  return null;
}, "Ht");
var Te = /* @__PURE__ */ __name((e, t) => {
  try {
    return t(e);
  } catch {
    return e.replace(/(?:%[0-9A-Fa-f]{2})+/g, (s) => {
      try {
        return t(s);
      } catch {
        return s;
      }
    });
  }
}, "Te");
var kt = /* @__PURE__ */ __name((e) => Te(e, decodeURI), "kt");
var Ze = /* @__PURE__ */ __name((e) => {
  const t = e.url, s = t.indexOf("/", t.indexOf(":") + 4);
  let r = s;
  for (; r < t.length; r++) {
    const n = t.charCodeAt(r);
    if (n === 37) {
      const i = t.indexOf("?", r), o = t.slice(s, i === -1 ? void 0 : i);
      return kt(o.includes("%25") ? o.replace(/%25/g, "%2525") : o);
    } else if (n === 63)
      break;
  }
  return t.slice(s, r);
}, "Ze");
var Lt = /* @__PURE__ */ __name((e) => {
  const t = Ze(e);
  return t.length > 1 && t.at(-1) === "/" ? t.slice(0, -1) : t;
}, "Lt");
var te = /* @__PURE__ */ __name((e, t, ...s) => (s.length && (t = te(t, ...s)), `${(e == null ? void 0 : e[0]) === "/" ? "" : "/"}${e}${t === "/" ? "" : `${(e == null ? void 0 : e.at(-1)) === "/" ? "" : "/"}${(t == null ? void 0 : t[0]) === "/" ? t.slice(1) : t}`}`), "te");
var et = /* @__PURE__ */ __name((e) => {
  if (e.charCodeAt(e.length - 1) !== 63 || !e.includes(":"))
    return null;
  const t = e.split("/"), s = [];
  let r = "";
  return t.forEach((n) => {
    if (n !== "" && !/\:/.test(n))
      r += "/" + n;
    else if (/\:/.test(n))
      if (/\?/.test(n)) {
        s.length === 0 && r === "" ? s.push("/") : s.push(r);
        const i = n.replace("?", "");
        r += "/" + i, s.push(r);
      } else
        r += "/" + n;
  }), s.filter((n, i, o) => o.indexOf(n) === i);
}, "et");
var ke = /* @__PURE__ */ __name((e) => /[%+]/.test(e) ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")), e.indexOf("%") !== -1 ? Te(e, st) : e) : e, "ke");
var tt = /* @__PURE__ */ __name((e, t, s) => {
  let r;
  if (!s && t && !/[%+]/.test(t)) {
    let o = e.indexOf(`?${t}`, 8);
    for (o === -1 && (o = e.indexOf(`&${t}`, 8)); o !== -1; ) {
      const l = e.charCodeAt(o + t.length + 1);
      if (l === 61) {
        const c = o + t.length + 2, h = e.indexOf("&", c);
        return ke(e.slice(c, h === -1 ? void 0 : h));
      } else if (l == 38 || isNaN(l))
        return "";
      o = e.indexOf(`&${t}`, o + 1);
    }
    if (r = /[%+]/.test(e), !r)
      return;
  }
  const n = {};
  r ?? (r = /[%+]/.test(e));
  let i = e.indexOf("?", 8);
  for (; i !== -1; ) {
    const o = e.indexOf("&", i + 1);
    let l = e.indexOf("=", i);
    l > o && o !== -1 && (l = -1);
    let c = e.slice(i + 1, l === -1 ? o === -1 ? void 0 : o : l);
    if (r && (c = ke(c)), i = o, c === "")
      continue;
    let h;
    l === -1 ? h = "" : (h = e.slice(l + 1, o === -1 ? void 0 : o), r && (h = ke(h))), s ? (n[c] && Array.isArray(n[c]) || (n[c] = []), n[c].push(h)) : n[c] ?? (n[c] = h);
  }
  return t ? n[t] : n;
}, "tt");
var $t = tt;
var Dt = /* @__PURE__ */ __name((e, t) => tt(e, t, true), "Dt");
var st = decodeURIComponent;
var Fe = /* @__PURE__ */ __name((e) => Te(e, st), "Fe");
var ne;
var A;
var _;
var nt;
var it;
var $e;
var F;
var We;
var rt = (We = /* @__PURE__ */ __name(class {
  constructor(e, t = "/", s = [[]]) {
    v(this, _);
    p(this, "raw");
    v(this, ne);
    v(this, A);
    p(this, "routeIndex", 0);
    p(this, "path");
    p(this, "bodyCache", {});
    v(this, F, (e2) => {
      const { bodyCache: t2, raw: s2 } = this, r = t2[e2];
      if (r)
        return r;
      const n = Object.keys(t2)[0];
      return n ? t2[n].then((i) => (n === "json" && (i = JSON.stringify(i)), new Response(i)[e2]())) : t2[e2] = s2[e2]();
    });
    this.raw = e, this.path = t, u(this, A, s), u(this, ne, {});
  }
  param(e) {
    return e ? y(this, _, nt).call(this, e) : y(this, _, it).call(this);
  }
  query(e) {
    return $t(this.url, e);
  }
  queries(e) {
    return Dt(this.url, e);
  }
  header(e) {
    if (e)
      return this.raw.headers.get(e) ?? void 0;
    const t = {};
    return this.raw.headers.forEach((s, r) => {
      t[r] = s;
    }), t;
  }
  async parseBody(e) {
    var t;
    return (t = this.bodyCache).parsedBody ?? (t.parsedBody = await Rt(this, e));
  }
  json() {
    return a(this, F).call(this, "text").then((e) => JSON.parse(e));
  }
  text() {
    return a(this, F).call(this, "text");
  }
  arrayBuffer() {
    return a(this, F).call(this, "arrayBuffer");
  }
  blob() {
    return a(this, F).call(this, "blob");
  }
  formData() {
    return a(this, F).call(this, "formData");
  }
  addValidatedData(e, t) {
    a(this, ne)[e] = t;
  }
  valid(e) {
    return a(this, ne)[e];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [xt]() {
    return a(this, A);
  }
  get matchedRoutes() {
    return a(this, A)[0].map(([[, e]]) => e);
  }
  get routePath() {
    return a(this, A)[0].map(([[, e]]) => e)[this.routeIndex].path;
  }
}, "We"), ne = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new WeakSet(), nt = /* @__PURE__ */ __name(function(e) {
  const t = a(this, A)[0][this.routeIndex][1][e], s = y(this, _, $e).call(this, t);
  return s && /\%/.test(s) ? Fe(s) : s;
}, "nt"), it = /* @__PURE__ */ __name(function() {
  const e = {}, t = Object.keys(a(this, A)[0][this.routeIndex][1]);
  for (const s of t) {
    const r = y(this, _, $e).call(this, a(this, A)[0][this.routeIndex][1][s]);
    r !== void 0 && (e[s] = /\%/.test(r) ? Fe(r) : r);
  }
  return e;
}, "it"), $e = /* @__PURE__ */ __name(function(e) {
  return a(this, A)[1] ? a(this, A)[1][e] : e;
}, "$e"), F = /* @__PURE__ */ new WeakMap(), We);
var Tt = { Stringify: 1 };
var at = /* @__PURE__ */ __name(async (e, t, s, r, n) => {
  typeof e == "object" && !(e instanceof String) && (e instanceof Promise || (e = e.toString()), e instanceof Promise && (e = await e));
  const i = e.callbacks;
  return i != null && i.length ? (n ? n[0] += e : n = [e], Promise.all(i.map((l) => l({ phase: t, buffer: n, context: r }))).then((l) => Promise.all(l.filter(Boolean).map((c) => at(c, t, false, r, n))).then(() => n[0]))) : Promise.resolve(e);
}, "at");
var Nt = "text/plain; charset=UTF-8";
var Le = /* @__PURE__ */ __name((e, t) => ({ "Content-Type": e, ...t }), "Le");
var ge;
var ye;
var D;
var ie;
var T;
var j;
var me;
var ae;
var oe;
var G;
var be;
var we;
var q;
var se;
var ze;
var It = (ze = /* @__PURE__ */ __name(class {
  constructor(e, t) {
    v(this, q);
    v(this, ge);
    v(this, ye);
    p(this, "env", {});
    v(this, D);
    p(this, "finalized", false);
    p(this, "error");
    v(this, ie);
    v(this, T);
    v(this, j);
    v(this, me);
    v(this, ae);
    v(this, oe);
    v(this, G);
    v(this, be);
    v(this, we);
    p(this, "render", (...e2) => (a(this, ae) ?? u(this, ae, (t2) => this.html(t2)), a(this, ae).call(this, ...e2)));
    p(this, "setLayout", (e2) => u(this, me, e2));
    p(this, "getLayout", () => a(this, me));
    p(this, "setRenderer", (e2) => {
      u(this, ae, e2);
    });
    p(this, "header", (e2, t2, s) => {
      this.finalized && u(this, j, new Response(a(this, j).body, a(this, j)));
      const r = a(this, j) ? a(this, j).headers : a(this, G) ?? u(this, G, new Headers());
      t2 === void 0 ? r.delete(e2) : s != null && s.append ? r.append(e2, t2) : r.set(e2, t2);
    });
    p(this, "status", (e2) => {
      u(this, ie, e2);
    });
    p(this, "set", (e2, t2) => {
      a(this, D) ?? u(this, D, /* @__PURE__ */ new Map()), a(this, D).set(e2, t2);
    });
    p(this, "get", (e2) => a(this, D) ? a(this, D).get(e2) : void 0);
    p(this, "newResponse", (...e2) => y(this, q, se).call(this, ...e2));
    p(this, "body", (e2, t2, s) => y(this, q, se).call(this, e2, t2, s));
    p(this, "text", (e2, t2, s) => !a(this, G) && !a(this, ie) && !t2 && !s && !this.finalized ? new Response(e2) : y(this, q, se).call(this, e2, t2, Le(Nt, s)));
    p(this, "json", (e2, t2, s) => y(this, q, se).call(this, JSON.stringify(e2), t2, Le("application/json", s)));
    p(this, "html", (e2, t2, s) => {
      const r = /* @__PURE__ */ __name((n) => y(this, q, se).call(this, n, t2, Le("text/html; charset=UTF-8", s)), "r");
      return typeof e2 == "object" ? at(e2, Tt.Stringify, false, {}).then(r) : r(e2);
    });
    p(this, "redirect", (e2, t2) => {
      const s = String(e2);
      return this.header("Location", /[^\x00-\xFF]/.test(s) ? encodeURI(s) : s), this.newResponse(null, t2 ?? 302);
    });
    p(this, "notFound", () => (a(this, oe) ?? u(this, oe, () => new Response()), a(this, oe).call(this, this)));
    u(this, ge, e), t && (u(this, T, t.executionCtx), this.env = t.env, u(this, oe, t.notFoundHandler), u(this, we, t.path), u(this, be, t.matchResult));
  }
  get req() {
    return a(this, ye) ?? u(this, ye, new rt(a(this, ge), a(this, we), a(this, be))), a(this, ye);
  }
  get event() {
    if (a(this, T) && "respondWith" in a(this, T))
      return a(this, T);
    throw Error("This context has no FetchEvent");
  }
  get executionCtx() {
    if (a(this, T))
      return a(this, T);
    throw Error("This context has no ExecutionContext");
  }
  get res() {
    return a(this, j) || u(this, j, new Response(null, { headers: a(this, G) ?? u(this, G, new Headers()) }));
  }
  set res(e) {
    if (a(this, j) && e) {
      e = new Response(e.body, e);
      for (const [t, s] of a(this, j).headers.entries())
        if (t !== "content-type")
          if (t === "set-cookie") {
            const r = a(this, j).headers.getSetCookie();
            e.headers.delete("set-cookie");
            for (const n of r)
              e.headers.append("set-cookie", n);
          } else
            e.headers.set(t, s);
    }
    u(this, j, e), this.finalized = true;
  }
  get var() {
    return a(this, D) ? Object.fromEntries(a(this, D)) : {};
  }
}, "ze"), ge = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakMap(), oe = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), q = /* @__PURE__ */ new WeakSet(), se = /* @__PURE__ */ __name(function(e, t, s) {
  const r = a(this, j) ? new Headers(a(this, j).headers) : a(this, G) ?? new Headers();
  if (typeof t == "object" && "headers" in t) {
    const i = t.headers instanceof Headers ? t.headers : new Headers(t.headers);
    for (const [o, l] of i)
      o.toLowerCase() === "set-cookie" ? r.append(o, l) : r.set(o, l);
  }
  if (s)
    for (const [i, o] of Object.entries(s))
      if (typeof o == "string")
        r.set(i, o);
      else {
        r.delete(i);
        for (const l of o)
          r.append(i, l);
      }
  const n = typeof t == "number" ? t : (t == null ? void 0 : t.status) ?? a(this, ie);
  return new Response(e, { status: n, headers: r });
}, "se"), ze);
var b = "ALL";
var _t = "all";
var Mt = ["get", "post", "put", "delete", "options", "patch"];
var ot = "Can not add a route since the matcher is already built.";
var ct = /* @__PURE__ */ __name(class extends Error {
}, "ct");
var Ft = "__COMPOSED_HANDLER";
var qt = /* @__PURE__ */ __name((e) => e.text("404 Not Found", 404), "qt");
var qe = /* @__PURE__ */ __name((e, t) => {
  if ("getResponse" in e) {
    const s = e.getResponse();
    return t.newResponse(s.body, s);
  }
  return console.error(e), t.text("Internal Server Error", 500);
}, "qe");
var C;
var w;
var ht;
var S;
var V;
var Ee;
var je;
var Be;
var lt = (Be = /* @__PURE__ */ __name(class {
  constructor(t = {}) {
    v(this, w);
    p(this, "get");
    p(this, "post");
    p(this, "put");
    p(this, "delete");
    p(this, "options");
    p(this, "patch");
    p(this, "all");
    p(this, "on");
    p(this, "use");
    p(this, "router");
    p(this, "getPath");
    p(this, "_basePath", "/");
    v(this, C, "/");
    p(this, "routes", []);
    v(this, S, qt);
    p(this, "errorHandler", qe);
    p(this, "onError", (t2) => (this.errorHandler = t2, this));
    p(this, "notFound", (t2) => (u(this, S, t2), this));
    p(this, "fetch", (t2, ...s) => y(this, w, je).call(this, t2, s[1], s[0], t2.method));
    p(this, "request", (t2, s, r2, n2) => t2 instanceof Request ? this.fetch(s ? new Request(t2, s) : t2, r2, n2) : (t2 = t2.toString(), this.fetch(new Request(/^https?:\/\//.test(t2) ? t2 : `http://localhost${te("/", t2)}`, s), r2, n2)));
    p(this, "fire", () => {
      addEventListener("fetch", (t2) => {
        t2.respondWith(y(this, w, je).call(this, t2.request, t2, void 0, t2.request.method));
      });
    });
    [...Mt, _t].forEach((i) => {
      this[i] = (o, ...l) => (typeof o == "string" ? u(this, C, o) : y(this, w, V).call(this, i, a(this, C), o), l.forEach((c) => {
        y(this, w, V).call(this, i, a(this, C), c);
      }), this);
    }), this.on = (i, o, ...l) => {
      for (const c of [o].flat()) {
        u(this, C, c);
        for (const h of [i].flat())
          l.map((d) => {
            y(this, w, V).call(this, h.toUpperCase(), a(this, C), d);
          });
      }
      return this;
    }, this.use = (i, ...o) => (typeof i == "string" ? u(this, C, i) : (u(this, C, "*"), o.unshift(i)), o.forEach((l) => {
      y(this, w, V).call(this, b, a(this, C), l);
    }), this);
    const { strict: r, ...n } = t;
    Object.assign(this, n), this.getPath = r ?? true ? t.getPath ?? Ze : Lt;
  }
  route(t, s) {
    const r = this.basePath(t);
    return s.routes.map((n) => {
      var o;
      let i;
      s.errorHandler === qe ? i = n.handler : (i = /* @__PURE__ */ __name(async (l, c) => (await Me([], s.errorHandler)(l, () => n.handler(l, c))).res, "i"), i[Ft] = n.handler), y(o = r, w, V).call(o, n.method, n.path, i);
    }), this;
  }
  basePath(t) {
    const s = y(this, w, ht).call(this);
    return s._basePath = te(this._basePath, t), s;
  }
  mount(t, s, r) {
    let n, i;
    r && (typeof r == "function" ? i = r : (i = r.optionHandler, r.replaceRequest === false ? n = /* @__PURE__ */ __name((c) => c, "n") : n = r.replaceRequest));
    const o = i ? (c) => {
      const h = i(c);
      return Array.isArray(h) ? h : [h];
    } : (c) => {
      let h;
      try {
        h = c.executionCtx;
      } catch {
      }
      return [c.env, h];
    };
    n || (n = (() => {
      const c = te(this._basePath, t), h = c === "/" ? 0 : c.length;
      return (d) => {
        const f = new URL(d.url);
        return f.pathname = f.pathname.slice(h) || "/", new Request(f, d);
      };
    })());
    const l = /* @__PURE__ */ __name(async (c, h) => {
      const d = await s(n(c.req.raw), ...o(c));
      if (d)
        return d;
      await h();
    }, "l");
    return y(this, w, V).call(this, b, te(t, "*"), l), this;
  }
}, "Be"), C = /* @__PURE__ */ new WeakMap(), w = /* @__PURE__ */ new WeakSet(), ht = /* @__PURE__ */ __name(function() {
  const t = new lt({ router: this.router, getPath: this.getPath });
  return t.errorHandler = this.errorHandler, u(t, S, a(this, S)), t.routes = this.routes, t;
}, "ht"), S = /* @__PURE__ */ new WeakMap(), V = /* @__PURE__ */ __name(function(t, s, r) {
  t = t.toUpperCase(), s = te(this._basePath, s);
  const n = { basePath: this._basePath, path: s, method: t, handler: r };
  this.router.add(t, s, [r, n]), this.routes.push(n);
}, "V"), Ee = /* @__PURE__ */ __name(function(t, s) {
  if (t instanceof Error)
    return this.errorHandler(t, s);
  throw t;
}, "Ee"), je = /* @__PURE__ */ __name(function(t, s, r, n) {
  if (n === "HEAD")
    return (async () => new Response(null, await y(this, w, je).call(this, t, s, r, "GET")))();
  const i = this.getPath(t, { env: r }), o = this.router.match(n, i), l = new It(t, { path: i, matchResult: o, env: r, executionCtx: s, notFoundHandler: a(this, S) });
  if (o[0].length === 1) {
    let h;
    try {
      h = o[0][0][0][0](l, async () => {
        l.res = await a(this, S).call(this, l);
      });
    } catch (d) {
      return y(this, w, Ee).call(this, d, l);
    }
    return h instanceof Promise ? h.then((d) => d || (l.finalized ? l.res : a(this, S).call(this, l))).catch((d) => y(this, w, Ee).call(this, d, l)) : h ?? a(this, S).call(this, l);
  }
  const c = Me(o[0], this.errorHandler, a(this, S));
  return (async () => {
    try {
      const h = await c(l);
      if (!h.finalized)
        throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
      return h.res;
    } catch (h) {
      return y(this, w, Ee).call(this, h, l);
    }
  })();
}, "je"), Be);
var Pe = "[^/]+";
var pe = ".*";
var ve = "(?:|/.*)";
var re = Symbol();
var Ut = new Set(".\\+*[^]$()");
function Wt(e, t) {
  return e.length === 1 ? t.length === 1 ? e < t ? -1 : 1 : -1 : t.length === 1 || e === pe || e === ve ? 1 : t === pe || t === ve ? -1 : e === Pe ? 1 : t === Pe ? -1 : e.length === t.length ? e < t ? -1 : 1 : t.length - e.length;
}
__name(Wt, "Wt");
var J;
var X;
var H;
var Ve;
var De = (Ve = /* @__PURE__ */ __name(class {
  constructor() {
    v(this, J);
    v(this, X);
    v(this, H, /* @__PURE__ */ Object.create(null));
  }
  insert(t, s, r, n, i) {
    if (t.length === 0) {
      if (a(this, J) !== void 0)
        throw re;
      if (i)
        return;
      u(this, J, s);
      return;
    }
    const [o, ...l] = t, c = o === "*" ? l.length === 0 ? ["", "", pe] : ["", "", Pe] : o === "/*" ? ["", "", ve] : o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let h;
    if (c) {
      const d = c[1];
      let f = c[2] || Pe;
      if (d && c[2] && (f === ".*" || (f = f.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:"), /\((?!\?:)/.test(f))))
        throw re;
      if (h = a(this, H)[f], !h) {
        if (Object.keys(a(this, H)).some((g) => g !== pe && g !== ve))
          throw re;
        if (i)
          return;
        h = a(this, H)[f] = new De(), d !== "" && u(h, X, n.varIndex++);
      }
      !i && d !== "" && r.push([d, a(h, X)]);
    } else if (h = a(this, H)[o], !h) {
      if (Object.keys(a(this, H)).some((d) => d.length > 1 && d !== pe && d !== ve))
        throw re;
      if (i)
        return;
      h = a(this, H)[o] = new De();
    }
    h.insert(l, s, r, n, i);
  }
  buildRegExpStr() {
    const s = Object.keys(a(this, H)).sort(Wt).map((r) => {
      const n = a(this, H)[r];
      return (typeof a(n, X) == "number" ? `(${r})@${a(n, X)}` : Ut.has(r) ? `\\${r}` : r) + n.buildRegExpStr();
    });
    return typeof a(this, J) == "number" && s.unshift(`#${a(this, J)}`), s.length === 0 ? "" : s.length === 1 ? s[0] : "(?:" + s.join("|") + ")";
  }
}, "Ve"), J = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakMap(), Ve);
var Ae;
var xe;
var Ke;
var zt = (Ke = /* @__PURE__ */ __name(class {
  constructor() {
    v(this, Ae, { varIndex: 0 });
    v(this, xe, new De());
  }
  insert(e, t, s) {
    const r = [], n = [];
    for (let o = 0; ; ) {
      let l = false;
      if (e = e.replace(/\{[^}]+\}/g, (c) => {
        const h = `@\\${o}`;
        return n[o] = [h, c], o++, l = true, h;
      }), !l)
        break;
    }
    const i = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let o = n.length - 1; o >= 0; o--) {
      const [l] = n[o];
      for (let c = i.length - 1; c >= 0; c--)
        if (i[c].indexOf(l) !== -1) {
          i[c] = i[c].replace(l, n[o][1]);
          break;
        }
    }
    return a(this, xe).insert(i, t, r, a(this, Ae), s), r;
  }
  buildRegExp() {
    let e = a(this, xe).buildRegExpStr();
    if (e === "")
      return [/^$/, [], []];
    let t = 0;
    const s = [], r = [];
    return e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (n, i, o) => i !== void 0 ? (s[++t] = Number(i), "$()") : (o !== void 0 && (r[Number(o)] = ++t), "")), [new RegExp(`^${e}`), s, r];
  }
}, "Ke"), Ae = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakMap(), Ke);
var dt = [];
var Bt = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var Oe = /* @__PURE__ */ Object.create(null);
function ut(e) {
  return Oe[e] ?? (Oe[e] = new RegExp(e === "*" ? "" : `^${e.replace(/\/\*$|([.\\+*[^\]$()])/g, (t, s) => s ? `\\${s}` : "(?:|/.*)")}$`));
}
__name(ut, "ut");
function Vt() {
  Oe = /* @__PURE__ */ Object.create(null);
}
__name(Vt, "Vt");
function Kt(e) {
  var h;
  const t = new zt(), s = [];
  if (e.length === 0)
    return Bt;
  const r = e.map((d) => [!/\*|\/:/.test(d[0]), ...d]).sort(([d, f], [g, R]) => d ? 1 : g ? -1 : f.length - R.length), n = /* @__PURE__ */ Object.create(null);
  for (let d = 0, f = -1, g = r.length; d < g; d++) {
    const [R, k, m] = r[d];
    R ? n[k] = [m.map(([P]) => [P, /* @__PURE__ */ Object.create(null)]), dt] : f++;
    let O;
    try {
      O = t.insert(k, f, R);
    } catch (P) {
      throw P === re ? new ct(k) : P;
    }
    R || (s[f] = m.map(([P, Z]) => {
      const de = /* @__PURE__ */ Object.create(null);
      for (Z -= 1; Z >= 0; Z--) {
        const [L, Ce] = O[Z];
        de[L] = Ce;
      }
      return [P, de];
    }));
  }
  const [i, o, l] = t.buildRegExp();
  for (let d = 0, f = s.length; d < f; d++)
    for (let g = 0, R = s[d].length; g < R; g++) {
      const k = (h = s[d][g]) == null ? void 0 : h[1];
      if (!k)
        continue;
      const m = Object.keys(k);
      for (let O = 0, P = m.length; O < P; O++)
        k[m[O]] = l[k[m[O]]];
    }
  const c = [];
  for (const d in o)
    c[d] = s[o[d]];
  return [i, c, n];
}
__name(Kt, "Kt");
function ee(e, t) {
  if (e) {
    for (const s of Object.keys(e).sort((r, n) => n.length - r.length))
      if (ut(s).test(t))
        return [...e[s]];
  }
}
__name(ee, "ee");
var U;
var W;
var le;
var ft;
var pt;
var Ge;
var Gt = (Ge = /* @__PURE__ */ __name(class {
  constructor() {
    v(this, le);
    p(this, "name", "RegExpRouter");
    v(this, U);
    v(this, W);
    u(this, U, { [b]: /* @__PURE__ */ Object.create(null) }), u(this, W, { [b]: /* @__PURE__ */ Object.create(null) });
  }
  add(e, t, s) {
    var l;
    const r = a(this, U), n = a(this, W);
    if (!r || !n)
      throw new Error(ot);
    r[e] || [r, n].forEach((c) => {
      c[e] = /* @__PURE__ */ Object.create(null), Object.keys(c[b]).forEach((h) => {
        c[e][h] = [...c[b][h]];
      });
    }), t === "/*" && (t = "*");
    const i = (t.match(/\/:/g) || []).length;
    if (/\*$/.test(t)) {
      const c = ut(t);
      e === b ? Object.keys(r).forEach((h) => {
        var d;
        (d = r[h])[t] || (d[t] = ee(r[h], t) || ee(r[b], t) || []);
      }) : (l = r[e])[t] || (l[t] = ee(r[e], t) || ee(r[b], t) || []), Object.keys(r).forEach((h) => {
        (e === b || e === h) && Object.keys(r[h]).forEach((d) => {
          c.test(d) && r[h][d].push([s, i]);
        });
      }), Object.keys(n).forEach((h) => {
        (e === b || e === h) && Object.keys(n[h]).forEach((d) => c.test(d) && n[h][d].push([s, i]));
      });
      return;
    }
    const o = et(t) || [t];
    for (let c = 0, h = o.length; c < h; c++) {
      const d = o[c];
      Object.keys(n).forEach((f) => {
        var g;
        (e === b || e === f) && ((g = n[f])[d] || (g[d] = [...ee(r[f], d) || ee(r[b], d) || []]), n[f][d].push([s, i - h + c + 1]));
      });
    }
  }
  match(e, t) {
    Vt();
    const s = y(this, le, ft).call(this);
    return this.match = (r, n) => {
      const i = s[r] || s[b], o = i[2][n];
      if (o)
        return o;
      const l = n.match(i[0]);
      if (!l)
        return [[], dt];
      const c = l.indexOf("", 1);
      return [i[1][c], l];
    }, this.match(e, t);
  }
}, "Ge"), U = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakSet(), ft = /* @__PURE__ */ __name(function() {
  const e = /* @__PURE__ */ Object.create(null);
  return Object.keys(a(this, W)).concat(Object.keys(a(this, U))).forEach((t) => {
    e[t] || (e[t] = y(this, le, pt).call(this, t));
  }), u(this, U, u(this, W, void 0)), e;
}, "ft"), pt = /* @__PURE__ */ __name(function(e) {
  const t = [];
  let s = e === b;
  return [a(this, U), a(this, W)].forEach((r) => {
    const n = r[e] ? Object.keys(r[e]).map((i) => [i, r[e][i]]) : [];
    n.length !== 0 ? (s || (s = true), t.push(...n)) : e !== b && t.push(...Object.keys(r[b]).map((i) => [i, r[b][i]]));
  }), s ? Kt(t) : null;
}, "pt"), Ge);
var z;
var N;
var Je;
var Jt = (Je = /* @__PURE__ */ __name(class {
  constructor(e) {
    p(this, "name", "SmartRouter");
    v(this, z, []);
    v(this, N, []);
    u(this, z, e.routers);
  }
  add(e, t, s) {
    if (!a(this, N))
      throw new Error(ot);
    a(this, N).push([e, t, s]);
  }
  match(e, t) {
    if (!a(this, N))
      throw new Error("Fatal error");
    const s = a(this, z), r = a(this, N), n = s.length;
    let i = 0, o;
    for (; i < n; i++) {
      const l = s[i];
      try {
        for (let c = 0, h = r.length; c < h; c++)
          l.add(...r[c]);
        o = l.match(e, t);
      } catch (c) {
        if (c instanceof ct)
          continue;
        throw c;
      }
      this.match = l.match.bind(l), u(this, z, [l]), u(this, N, void 0);
      break;
    }
    if (i === n)
      throw new Error("Fatal error");
    return this.name = `SmartRouter + ${this.activeRouter.name}`, o;
  }
  get activeRouter() {
    if (a(this, N) || a(this, z).length !== 1)
      throw new Error("No active router has been determined yet.");
    return a(this, z)[0];
  }
}, "Je"), z = /* @__PURE__ */ new WeakMap(), N = /* @__PURE__ */ new WeakMap(), Je);
var fe = /* @__PURE__ */ Object.create(null);
var B;
var E;
var Q;
var ce;
var x;
var I;
var K;
var Xe;
var vt = (Xe = /* @__PURE__ */ __name(class {
  constructor(e, t, s) {
    v(this, I);
    v(this, B);
    v(this, E);
    v(this, Q);
    v(this, ce, 0);
    v(this, x, fe);
    if (u(this, E, s || /* @__PURE__ */ Object.create(null)), u(this, B, []), e && t) {
      const r = /* @__PURE__ */ Object.create(null);
      r[e] = { handler: t, possibleKeys: [], score: 0 }, u(this, B, [r]);
    }
    u(this, Q, []);
  }
  insert(e, t, s) {
    u(this, ce, ++_e(this, ce)._);
    let r = this;
    const n = At(t), i = [];
    for (let o = 0, l = n.length; o < l; o++) {
      const c = n[o], h = n[o + 1], d = Ht(c, h), f = Array.isArray(d) ? d[0] : c;
      if (f in a(r, E)) {
        r = a(r, E)[f], d && i.push(d[1]);
        continue;
      }
      a(r, E)[f] = new vt(), d && (a(r, Q).push(d), i.push(d[1])), r = a(r, E)[f];
    }
    return a(r, B).push({ [e]: { handler: s, possibleKeys: i.filter((o, l, c) => c.indexOf(o) === l), score: a(this, ce) } }), r;
  }
  search(e, t) {
    var l;
    const s = [];
    u(this, x, fe);
    let n = [this];
    const i = Ye(t), o = [];
    for (let c = 0, h = i.length; c < h; c++) {
      const d = i[c], f = c === h - 1, g = [];
      for (let R = 0, k = n.length; R < k; R++) {
        const m = n[R], O = a(m, E)[d];
        O && (u(O, x, a(m, x)), f ? (a(O, E)["*"] && s.push(...y(this, I, K).call(this, a(O, E)["*"], e, a(m, x))), s.push(...y(this, I, K).call(this, O, e, a(m, x)))) : g.push(O));
        for (let P = 0, Z = a(m, Q).length; P < Z; P++) {
          const de = a(m, Q)[P], L = a(m, x) === fe ? {} : { ...a(m, x) };
          if (de === "*") {
            const M = a(m, E)["*"];
            M && (s.push(...y(this, I, K).call(this, M, e, a(m, x))), u(M, x, L), g.push(M));
            continue;
          }
          const [Ce, Ne, ue] = de;
          if (!d && !(ue instanceof RegExp))
            continue;
          const $ = a(m, E)[Ce], mt = i.slice(c).join("/");
          if (ue instanceof RegExp) {
            const M = ue.exec(mt);
            if (M) {
              if (L[Ne] = M[0], s.push(...y(this, I, K).call(this, $, e, a(m, x), L)), Object.keys(a($, E)).length) {
                u($, x, L);
                const Se = ((l = M[0].match(/\//)) == null ? void 0 : l.length) ?? 0;
                (o[Se] || (o[Se] = [])).push($);
              }
              continue;
            }
          }
          (ue === true || ue.test(d)) && (L[Ne] = d, f ? (s.push(...y(this, I, K).call(this, $, e, L, a(m, x))), a($, E)["*"] && s.push(...y(this, I, K).call(this, a($, E)["*"], e, L, a(m, x)))) : (u($, x, L), g.push($)));
        }
      }
      n = g.concat(o.shift() ?? []);
    }
    return s.length > 1 && s.sort((c, h) => c.score - h.score), [s.map(({ handler: c, params: h }) => [c, h])];
  }
}, "Xe"), B = /* @__PURE__ */ new WeakMap(), E = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), ce = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakSet(), K = /* @__PURE__ */ __name(function(e, t, s, r) {
  const n = [];
  for (let i = 0, o = a(e, B).length; i < o; i++) {
    const l = a(e, B)[i], c = l[t] || l[b], h = {};
    if (c !== void 0 && (c.params = /* @__PURE__ */ Object.create(null), n.push(c), s !== fe || r && r !== fe))
      for (let d = 0, f = c.possibleKeys.length; d < f; d++) {
        const g = c.possibleKeys[d], R = h[c.score];
        c.params[g] = r != null && r[g] && !R ? r[g] : s[g] ?? (r == null ? void 0 : r[g]), h[c.score] = true;
      }
  }
  return n;
}, "K"), Xe);
var Y;
var Qe;
var Xt = (Qe = /* @__PURE__ */ __name(class {
  constructor() {
    p(this, "name", "TrieRouter");
    v(this, Y);
    u(this, Y, new vt());
  }
  add(e, t, s) {
    const r = et(t);
    if (r) {
      for (let n = 0, i = r.length; n < i; n++)
        a(this, Y).insert(e, r[n], s);
      return;
    }
    a(this, Y).insert(e, t, s);
  }
  match(e, t) {
    return a(this, Y).search(e, t);
  }
}, "Qe"), Y = /* @__PURE__ */ new WeakMap(), Qe);
var gt = /* @__PURE__ */ __name(class extends lt {
  constructor(e = {}) {
    super(e), this.router = e.router ?? new Jt({ routers: [new Gt(), new Xt()] });
  }
}, "gt");
var Qt = /* @__PURE__ */ __name((e) => {
  const s = { ...{ origin: "*", allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"], allowHeaders: [], exposeHeaders: [] }, ...e }, r = ((i) => typeof i == "string" ? i === "*" ? () => i : (o) => i === o ? o : null : typeof i == "function" ? i : (o) => i.includes(o) ? o : null)(s.origin), n = ((i) => typeof i == "function" ? i : Array.isArray(i) ? () => i : () => [])(s.allowMethods);
  return async function(o, l) {
    var d;
    function c(f, g) {
      o.res.headers.set(f, g);
    }
    __name(c, "c");
    const h = await r(o.req.header("origin") || "", o);
    if (h && c("Access-Control-Allow-Origin", h), s.origin !== "*") {
      const f = o.req.header("Vary");
      f ? c("Vary", f) : c("Vary", "Origin");
    }
    if (s.credentials && c("Access-Control-Allow-Credentials", "true"), (d = s.exposeHeaders) != null && d.length && c("Access-Control-Expose-Headers", s.exposeHeaders.join(",")), o.req.method === "OPTIONS") {
      s.maxAge != null && c("Access-Control-Max-Age", s.maxAge.toString());
      const f = await n(o.req.header("origin") || "", o);
      f.length && c("Access-Control-Allow-Methods", f.join(","));
      let g = s.allowHeaders;
      if (!(g != null && g.length)) {
        const R = o.req.header("Access-Control-Request-Headers");
        R && (g = R.split(/\s*,\s*/));
      }
      return g != null && g.length && (c("Access-Control-Allow-Headers", g.join(",")), o.res.headers.append("Vary", "Access-Control-Request-Headers")), o.res.headers.delete("Content-Length"), o.res.headers.delete("Content-Type"), new Response(null, { headers: o.res.headers, status: 204, statusText: "No Content" });
    }
    await l();
  };
}, "Qt");
var he = new gt();
he.use("/api/*", Qt());
he.get("/api/templates", async (e) => {
  const t = [{ id: "video@1.0.0", name: "Video Player", category: "media", capabilities: ["autoplay", "controls"], paramsSchema: { type: "object", properties: { src: { type: "string", description: "Video source URL" }, autoplay: { type: "boolean", default: false } }, required: ["src"] } }, { id: "drag-drop-choices@1.2.0", name: "Drag & Drop Multiple Choice", category: "interaction", capabilities: ["drag", "drop", "keyboard"], paramsSchema: { type: "object", properties: { prompt: { type: "string", description: "Question prompt" }, choices: { type: "array", items: { type: "string" } }, answer: { type: "string", description: "Correct answer" }, image: { type: "string", description: "Optional image URL" } }, required: ["prompt", "choices", "answer"] } }];
  return e.json({ templates: t });
});
he.get("/api/lessons/:id", async (e) => (e.req.param("id"), e.json({ error: "Not implemented" }, 501)));
he.post("/api/lessons", async (e) => (await e.req.json(), e.json({ error: "Not implemented" }, 501)));
he.get("/", (e) => e.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Educational Lesson Platform</title>
        <meta name="description" content="Plugin-based educational lesson platform with interactive activities">
        
        <!-- CSS -->
        <link rel="stylesheet" href="/static/css/design-system.css">
        <link rel="stylesheet" href="/static/css/components.css">
        <link rel="stylesheet" href="/static/css/builder.css">
        
        <!-- Preload critical resources -->
        <link rel="preload" href="/static/js/app.js" as="script">
        
        <!-- Theme color for mobile browsers -->
        <meta name="theme-color" content="#0b1220">
        
        <!-- Favicon -->
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>\u{1F4DA}</text></svg>">
    </head>
    <body>
        <div id="app">
            <!-- Header -->
            <header class="header">
                <div class="container">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <h1 class="text-2xl font-bold">\u{1F4DA} \uB808\uC2A8 \uD50C\uB7AB\uD3FC</h1>
                            <span class="badge badge-primary">v2.0.0</span>
                        </div>
                        <nav class="navigation">
                            <button class="nav-link active" data-tab="player">
                                <span class="nav-icon">\u{1F3AF}</span>
                                <span class="nav-text">\uD50C\uB808\uC774\uC5B4</span>
                            </button>
                            <button class="nav-link" data-tab="builder">
                                <span class="nav-icon">\u{1F6E0}\uFE0F</span>
                                <span class="nav-text">\uBE4C\uB354</span>
                            </button>
                            <button class="nav-link" data-tab="templates">
                                <span class="nav-icon">\u{1F9E9}</span>
                                <span class="nav-text">\uD15C\uD50C\uB9BF</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <!-- Main Content Area -->
            <main class="main-content">
                <!-- Lesson Player Panel -->
                <section class="content-panel active" data-panel="player">
                    <div class="container">
                        <div class="lesson-player-layout">
                            <!-- Lesson Controls Sidebar -->
                            <aside class="lesson-sidebar">
                                <div class="card">
                                    <div class="card-header">
                                        <h3 class="card-title">\uB808\uC2A8 \uB85C\uB354</h3>
                                    </div>
                                    
                                    <!-- Lesson Loader -->
                                    <div class="lesson-loader-section">
                                        <button id="load-sample-btn" class="btn btn-primary w-full">
                                            \u{1F4D6} \uC0D8\uD50C \uB808\uC2A8 \uB85C\uB4DC
                                        </button>
                                        
                                        <div class="divider">\uB610\uB294</div>
                                        
                                        <div class="file-upload-area">
                                            <input type="file" id="lesson-file-input" accept=".json" class="sr-only">
                                            <div id="lesson-drop-zone" class="drop-zone">
                                                <div class="drop-zone-content">
                                                    <svg class="drop-zone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                                    </svg>
                                                    <p class="drop-zone-text">JSON \uD30C\uC77C\uC744 \uB4DC\uB798\uADF8\uD558\uAC70\uB098 \uD074\uB9AD\uD558\uC138\uC694</p>
                                                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('lesson-file-input').click()">
                                                        \uD30C\uC77C \uC120\uD0DD
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Lesson Info -->
                                    <div class="lesson-info-section" style="display: none;" id="lesson-info-section">
                                        <h4>\uB808\uC2A8 \uC815\uBCF4</h4>
                                        <div class="lesson-meta">
                                            <h5 id="lesson-title">\uB808\uC2A8 \uC81C\uBAA9</h5>
                                            <p id="lesson-subtitle" class="text-sm text-secondary">\uD65C\uB3D9 \uC815\uBCF4</p>
                                        </div>
                                        <div id="lesson-progress"></div>
                                    </div>
                                    
                                    <!-- Current Activity Info -->
                                    <div id="current-activity-info"></div>
                                </div>
                                
                                <!-- Lesson Controls -->
                                <div class="card" id="lesson-controls" style="display: none;">
                                    <div class="card-header">
                                        <h4 class="card-title">\uB808\uC2A8 \uC81C\uC5B4</h4>
                                    </div>
                                    <div class="lesson-controls-grid">
                                        <button id="btn-previous" class="btn btn-secondary">
                                            \u2190 \uC774\uC804
                                        </button>
                                        <button id="btn-next" class="btn btn-primary">
                                            \uB2E4\uC74C \u2192
                                        </button>
                                        <button id="btn-restart" class="btn btn-ghost">
                                            \u{1F504} \uC7AC\uC2DC\uC791
                                        </button>
                                        <button id="btn-finish" class="btn btn-success">
                                            \u2713 \uC644\uB8CC
                                        </button>
                                    </div>
                                </div>
                            </aside>
                            
                            <!-- Activity Container -->
                            <div class="lesson-main">
                                <div class="activity-container-wrapper">
                                    <div id="activity-container" class="activity-template">
                                        <div class="activity-placeholder">
                                            <div class="placeholder-content">
                                                <div class="placeholder-icon">\u{1F3AF}</div>
                                                <h3 class="placeholder-title">\uB808\uC2A8\uC744 \uC2DC\uC791\uD558\uC138\uC694</h3>
                                                <p class="placeholder-text">
                                                    \uC0D8\uD50C \uB808\uC2A8\uC744 \uB85C\uB4DC\uD558\uAC70\uB098 JSON \uD30C\uC77C\uC744 \uC5C5\uB85C\uB4DC\uD558\uC5EC \uC778\uD130\uB799\uD2F0\uBE0C \uD559\uC2B5\uC744 \uC2DC\uC791\uD558\uC138\uC694.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Lesson Builder Panel -->
                <section class="content-panel" data-panel="builder">
                    <div class="container">
                        <div class="builder-layout">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">\u{1F6E0}\uFE0F \uB808\uC2A8 \uBE4C\uB354</h3>
                                    <p class="card-subtitle">\uB4DC\uB798\uADF8 \uC564 \uB4DC\uB86D\uC73C\uB85C \uB808\uC2A8\uC744 \uAD6C\uC131\uD558\uC138\uC694</p>
                                </div>
                                <div class="builder-placeholder">
                                    <div class="placeholder-content">
                                        <div class="placeholder-icon">\u{1F6A7}</div>
                                        <h4 class="placeholder-title">\uAC1C\uBC1C \uC911</h4>
                                        <p class="placeholder-text">
                                            \uB808\uC2A8 \uBE4C\uB354\uB294 \uD604\uC7AC \uAC1C\uBC1C \uC911\uC785\uB2C8\uB2E4.<br>
                                            \uACE7 \uC9C1\uAD00\uC801\uC778 \uB4DC\uB798\uADF8 \uC564 \uB4DC\uB86D \uC778\uD130\uD398\uC774\uC2A4\uB97C \uC81C\uACF5\uD560 \uC608\uC815\uC785\uB2C8\uB2E4.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Templates Catalog Panel -->
                <section class="content-panel" data-panel="templates">
                    <div class="container">
                        <div class="templates-layout">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">\u{1F9E9} \uD15C\uD50C\uB9BF \uCE74\uD0C8\uB85C\uADF8</h3>
                                    <p class="card-subtitle">\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC561\uD2F0\uBE44\uD2F0 \uD15C\uD50C\uB9BF\uC744 \uD655\uC778\uD558\uC138\uC694</p>
                                </div>
                                <div id="templates-catalog">
                                    <div class="loading-placeholder">
                                        <div class="loading-spinner"></div>
                                        <p>\uD15C\uD50C\uB9BF\uC744 \uBD88\uB7EC\uC624\uB294 \uC911...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <!-- Footer -->
            <footer class="footer">
                <div class="container">
                    <div class="flex items-center justify-between">
                        <div class="footer-text">
                            <span>\xA9 2024 Educational Lesson Platform</span>
                            <span class="text-muted">Plugin Architecture v2.0</span>
                        </div>
                        <div class="footer-links">
                            <a href="#" class="footer-link">\uB3C4\uC6C0\uB9D0</a>
                            <a href="#" class="footer-link">API \uBB38\uC11C</a>
                            <a href="https://github.com/UnimationKorea/core_plugin" class="footer-link">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        
        <!-- Notifications Container -->
        <div id="notifications-container"></div>
        
        <!-- Scripts -->
        <script type="module" src="/static/js/app.js"><\/script>
        <script type="module" src="/static/js/builder.js"><\/script>
        
        <!-- Service Worker for offline support -->
        <script>
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/static/js/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
            });
          }
        <\/script>
    </body>
    </html>
  `));
var Ue = new gt();
var Yt = Object.assign({ "/src/index.tsx": he });
var yt = false;
for (const [, e] of Object.entries(Yt))
  e && (Ue.route("/", e), Ue.notFound(e.notFoundHandler), yt = true);
if (!yt)
  throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-3aPd7Z/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = Ue;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-3aPd7Z/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=bundledWorker-0.10657224964515222.mjs.map
