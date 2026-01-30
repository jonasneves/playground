import Y, { useCallback as N, useState as O, useEffect as F, forwardRef as fe, createElement as K, useRef as he } from "react";
const ae = (t) => {
  let r;
  const i = /* @__PURE__ */ new Set(), s = (g, y) => {
    const x = typeof g == "function" ? g(r) : g;
    if (!Object.is(x, r)) {
      const j = r;
      r = y ?? (typeof x != "object" || x === null) ? x : Object.assign({}, r, x), i.forEach((b) => b(r, j));
    }
  }, n = () => r, l = { setState: s, getState: n, getInitialState: () => u, subscribe: (g) => (i.add(g), () => i.delete(g)) }, u = r = t(s, n, l);
  return l;
}, ge = ((t) => t ? ae(t) : ae), ye = (t) => t;
function ve(t, r = ye) {
  const i = Y.useSyncExternalStore(
    t.subscribe,
    Y.useCallback(() => r(t.getState()), [t, r]),
    Y.useCallback(() => r(t.getInitialState()), [t, r])
  );
  return Y.useDebugValue(i), i;
}
const oe = (t) => {
  const r = ge(t), i = (s) => ve(r, s);
  return Object.assign(i, r), i;
}, Q = ((t) => t ? oe(t) : oe);
function be(t, r) {
  let i;
  try {
    i = t();
  } catch {
    return;
  }
  return {
    getItem: (n) => {
      var a;
      const c = (u) => u === null ? null : JSON.parse(u, void 0), l = (a = i.getItem(n)) != null ? a : null;
      return l instanceof Promise ? l.then(c) : c(l);
    },
    setItem: (n, a) => i.setItem(n, JSON.stringify(a, void 0)),
    removeItem: (n) => i.removeItem(n)
  };
}
const Z = (t) => (r) => {
  try {
    const i = t(r);
    return i instanceof Promise ? i : {
      then(s) {
        return Z(s)(i);
      },
      catch(s) {
        return this;
      }
    };
  } catch (i) {
    return {
      then(s) {
        return this;
      },
      catch(s) {
        return Z(s)(i);
      }
    };
  }
}, xe = (t, r) => (i, s, n) => {
  let a = {
    storage: be(() => localStorage),
    partialize: (m) => m,
    version: 0,
    merge: (m, T) => ({
      ...T,
      ...m
    }),
    ...r
  }, c = !1, l = 0;
  const u = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set();
  let y = a.storage;
  if (!y)
    return t(
      (...m) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${a.name}', the given storage is currently unavailable.`
        ), i(...m);
      },
      s,
      n
    );
  const x = () => {
    const m = a.partialize({ ...s() });
    return y.setItem(a.name, {
      state: m,
      version: a.version
    });
  }, j = n.setState;
  n.setState = (m, T) => (j(m, T), x());
  const b = t(
    (...m) => (i(...m), x()),
    s,
    n
  );
  n.getInitialState = () => b;
  let k;
  const $ = () => {
    var m, T;
    if (!y) return;
    const C = ++l;
    c = !1, u.forEach((d) => {
      var p;
      return d((p = s()) != null ? p : b);
    });
    const f = ((T = a.onRehydrateStorage) == null ? void 0 : T.call(a, (m = s()) != null ? m : b)) || void 0;
    return Z(y.getItem.bind(y))(a.name).then((d) => {
      if (d)
        if (typeof d.version == "number" && d.version !== a.version) {
          if (a.migrate) {
            const p = a.migrate(
              d.state,
              d.version
            );
            return p instanceof Promise ? p.then((S) => [!0, S]) : [!0, p];
          }
          console.error(
            "State loaded from storage couldn't be migrated since no migrate function was provided"
          );
        } else
          return [!1, d.state];
      return [!1, void 0];
    }).then((d) => {
      var p;
      if (C !== l)
        return;
      const [S, I] = d;
      if (k = a.merge(
        I,
        (p = s()) != null ? p : b
      ), i(k, !0), S)
        return x();
    }).then(() => {
      C === l && (f?.(k, void 0), k = s(), c = !0, g.forEach((d) => d(k)));
    }).catch((d) => {
      C === l && f?.(void 0, d);
    });
  };
  return n.persist = {
    setOptions: (m) => {
      a = {
        ...a,
        ...m
      }, m.storage && (y = m.storage);
    },
    clearStorage: () => {
      y?.removeItem(a.name);
    },
    getOptions: () => a,
    rehydrate: () => $(),
    hasHydrated: () => c,
    onHydrate: (m) => (u.add(m), () => {
      u.delete(m);
    }),
    onFinishHydration: (m) => (g.add(m), () => {
      g.delete(m);
    })
  }, a.skipHydration || $(), k || b;
}, je = xe;
function Ye(t = "auth-storage") {
  return Q()(
    je(
      (r) => ({
        token: null,
        user: null,
        isAuthenticated: !1,
        setAuth: (i, s) => r({ token: i, user: s, isAuthenticated: !0 }),
        logout: () => {
          r({ token: null, user: null, isAuthenticated: !1 }), localStorage.clear(), window.location.href = "/";
        }
      }),
      {
        name: t
      }
    )
  );
}
function We(t = 3e5) {
  return Q()((r, i) => ({
    cacheTimeout: t,
    getCache: (s, n, a) => {
      const c = `gh_${s}_${n}_${a}`, l = localStorage.getItem(c);
      if (!l) return null;
      try {
        const u = JSON.parse(l);
        return Date.now() - u.timestamp > i().cacheTimeout ? (localStorage.removeItem(c), null) : u;
      } catch {
        return null;
      }
    },
    setCache: (s, n, a, c, l) => {
      const u = `gh_${s}_${n}_${a}`;
      try {
        localStorage.setItem(u, JSON.stringify({
          content: c,
          sha: l,
          timestamp: Date.now()
        }));
      } catch (g) {
        console.warn("Cache storage failed:", g);
      }
    },
    clearCache: (s, n) => {
      const a = `gh_${s}_${n}_`;
      Object.keys(localStorage).filter((l) => l.startsWith(a)).forEach((l) => localStorage.removeItem(l));
    },
    invalidateCache: (s, n, a) => {
      const c = `gh_${s}_${n}_${a}`;
      localStorage.removeItem(c);
    }
  }));
}
function Ge(t = { enabled: !0, maxEvents: 100 }) {
  return Q()((r, i) => ({
    events: [],
    errors: [],
    metrics: [],
    track: (s, n = {}) => {
      if (!t.enabled) return;
      const a = {
        type: s,
        data: n,
        timestamp: Date.now()
      };
      r((c) => ({
        events: [...c.events.slice(-(t.maxEvents - 1)), a]
      })), console.log("[Analytics]", s, n);
    },
    logError: (s) => {
      t.enabled && (r((n) => ({
        errors: [...n.errors.slice(-49), s]
      })), console.error("[Error]", s));
    },
    trackMetric: (s, n, a) => {
      if (!t.enabled) return;
      const c = { app: s, metric: n, value: a, timestamp: Date.now() };
      r((l) => ({
        metrics: [...l.metrics.slice(-199), c]
      }));
    },
    getMetrics: (s) => i().metrics.filter((n) => n.app === s)
  }));
}
function qe(t, r) {
  return function(s, n) {
    const a = t.token, { getCache: c, setCache: l, invalidateCache: u } = r, g = `https://api.github.com/repos/${s}/${n}`, y = N((f) => btoa(unescape(encodeURIComponent(f))), []), x = N((f) => decodeURIComponent(escape(atob(f))), []), j = N(async (f, d = {}) => {
      const p = await fetch(`${g}/contents/${f}`, {
        ...d,
        headers: {
          Authorization: `Bearer ${a}`,
          Accept: "application/vnd.github.v3+json",
          ...d.headers
        }
      });
      if (!p.ok)
        throw p.status === 401 ? (t.logout(), new Error("Authentication expired")) : new Error(`Failed to ${d.method || "fetch"} ${f}: ${p.statusText}`);
      return p.json();
    }, [g, a]), b = N(async (f) => {
      const d = c(s, n, f);
      if (d)
        return {
          content: d.content,
          sha: d.sha,
          path: f
        };
      const p = await j(f), S = {
        content: x(p.content),
        sha: p.sha,
        path: p.path,
        name: p.name,
        size: p.size
      };
      return l(s, n, f, S.content, S.sha), S;
    }, [s, n, c, l, j, x]), k = N(async (f, d, p, S) => {
      const I = await j(f, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: S || `Update ${f}`,
          content: y(d),
          sha: p
        })
      });
      return u(s, n, f), I;
    }, [s, n, j, y, u]), $ = N(async (f, d, p) => j(f, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: p || `Create ${f}`,
        content: y(d)
      })
    }), [j, y]), m = N(async (f, d, p) => {
      const S = await j(f, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: p || `Delete ${f}`,
          sha: d
        })
      });
      return u(s, n, f), S;
    }, [s, n, j, u]), T = N(async (f = "") => j(f), [j]), C = N(async (f) => {
      try {
        const d = await b(`${f}/manifest.json`);
        return JSON.parse(d.content);
      } catch {
        return null;
      }
    }, [b]);
    return {
      getFile: b,
      updateFile: k,
      createFile: $,
      deleteFile: m,
      listDirectory: T,
      getManifest: C,
      encodeContent: y,
      decodeContent: x
    };
  };
}
var G = { exports: {} }, U = {};
var ie;
function we() {
  if (ie) return U;
  ie = 1;
  var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.fragment");
  function i(s, n, a) {
    var c = null;
    if (a !== void 0 && (c = "" + a), n.key !== void 0 && (c = "" + n.key), "key" in n) {
      a = {};
      for (var l in n)
        l !== "key" && (a[l] = n[l]);
    } else a = n;
    return n = a.ref, {
      $$typeof: t,
      type: s,
      key: c,
      ref: n !== void 0 ? n : null,
      props: a
    };
  }
  return U.Fragment = r, U.jsx = i, U.jsxs = i, U;
}
var J = {};
var ce;
function _e() {
  return ce || (ce = 1, process.env.NODE_ENV !== "production" && (function() {
    function t(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === A ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case m:
          return "Fragment";
        case C:
          return "Profiler";
        case T:
          return "StrictMode";
        case S:
          return "Suspense";
        case I:
          return "SuspenseList";
        case L:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case $:
            return "Portal";
          case d:
            return e.displayName || "Context";
          case f:
            return (e._context.displayName || "Context") + ".Consumer";
          case p:
            var h = e.render;
            return e = e.displayName, e || (e = h.displayName || h.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case w:
            return h = e.displayName || null, h !== null ? h : t(e.type) || "Memo";
          case R:
            h = e._payload, e = e._init;
            try {
              return t(e(h));
            } catch {
            }
        }
      return null;
    }
    function r(e) {
      return "" + e;
    }
    function i(e) {
      try {
        r(e);
        var h = !1;
      } catch {
        h = !0;
      }
      if (h) {
        h = console;
        var v = h.error, _ = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return v.call(
          h,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          _
        ), r(e);
      }
    }
    function s(e) {
      if (e === m) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === R)
        return "<...>";
      try {
        var h = t(e);
        return h ? "<" + h + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function n() {
      var e = P.A;
      return e === null ? null : e.getOwner();
    }
    function a() {
      return Error("react-stack-top-frame");
    }
    function c(e) {
      if (M.call(e, "key")) {
        var h = Object.getOwnPropertyDescriptor(e, "key").get;
        if (h && h.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function l(e, h) {
      function v() {
        ee || (ee = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          h
        ));
      }
      v.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: v,
        configurable: !0
      });
    }
    function u() {
      var e = t(this.type);
      return te[e] || (te[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function g(e, h, v, _, W, V) {
      var E = v.ref;
      return e = {
        $$typeof: k,
        type: e,
        key: h,
        props: v,
        _owner: _
      }, (E !== void 0 ? E : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: u
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: W
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: V
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function y(e, h, v, _, W, V) {
      var E = h.children;
      if (E !== void 0)
        if (_)
          if (H(E)) {
            for (_ = 0; _ < E.length; _++)
              x(E[_]);
            Object.freeze && Object.freeze(E);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else x(E);
      if (M.call(h, "key")) {
        E = t(e);
        var D = Object.keys(h).filter(function(pe) {
          return pe !== "key";
        });
        _ = 0 < D.length ? "{key: someKey, " + D.join(": ..., ") + ": ...}" : "{key: someKey}", se[E + _] || (D = 0 < D.length ? "{" + D.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          _,
          E,
          D,
          E
        ), se[E + _] = !0);
      }
      if (E = null, v !== void 0 && (i(v), E = "" + v), c(h) && (i(h.key), E = "" + h.key), "key" in h) {
        v = {};
        for (var B in h)
          B !== "key" && (v[B] = h[B]);
      } else v = h;
      return E && l(
        v,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), g(
        e,
        E,
        v,
        n(),
        W,
        V
      );
    }
    function x(e) {
      j(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === R && (e._payload.status === "fulfilled" ? j(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
    }
    function j(e) {
      return typeof e == "object" && e !== null && e.$$typeof === k;
    }
    var b = Y, k = /* @__PURE__ */ Symbol.for("react.transitional.element"), $ = /* @__PURE__ */ Symbol.for("react.portal"), m = /* @__PURE__ */ Symbol.for("react.fragment"), T = /* @__PURE__ */ Symbol.for("react.strict_mode"), C = /* @__PURE__ */ Symbol.for("react.profiler"), f = /* @__PURE__ */ Symbol.for("react.consumer"), d = /* @__PURE__ */ Symbol.for("react.context"), p = /* @__PURE__ */ Symbol.for("react.forward_ref"), S = /* @__PURE__ */ Symbol.for("react.suspense"), I = /* @__PURE__ */ Symbol.for("react.suspense_list"), w = /* @__PURE__ */ Symbol.for("react.memo"), R = /* @__PURE__ */ Symbol.for("react.lazy"), L = /* @__PURE__ */ Symbol.for("react.activity"), A = /* @__PURE__ */ Symbol.for("react.client.reference"), P = b.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, M = Object.prototype.hasOwnProperty, H = Array.isArray, q = console.createTask ? console.createTask : function() {
      return null;
    };
    b = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var ee, te = {}, re = b.react_stack_bottom_frame.bind(
      b,
      a
    )(), ne = q(s(a)), se = {};
    J.Fragment = m, J.jsx = function(e, h, v) {
      var _ = 1e4 > P.recentlyCreatedOwnerStacks++;
      return y(
        e,
        h,
        v,
        !1,
        _ ? Error("react-stack-top-frame") : re,
        _ ? q(s(e)) : ne
      );
    }, J.jsxs = function(e, h, v) {
      var _ = 1e4 > P.recentlyCreatedOwnerStacks++;
      return y(
        e,
        h,
        v,
        !0,
        _ ? Error("react-stack-top-frame") : re,
        _ ? q(s(e)) : ne
      );
    };
  })()), J;
}
var le;
function Ee() {
  return le || (le = 1, process.env.NODE_ENV === "production" ? G.exports = we() : G.exports = _e()), G.exports;
}
var o = Ee();
function Ve({
  children: t,
  oauthServiceUrl: r,
  onAuthChange: i,
  isAuthenticated: s
}) {
  const [n, a] = O(!0), [c, l] = O(!1);
  return F(() => {
    const u = document.createElement("script");
    return u.src = `${r}/github-auth.js?v=2`, u.integrity = "sha384-yCvoyjf6LKk2Yc6oSRenxRV0yFNdjeQ5ANuXIcRN50VoX/X8S4YJ9mU2+cT9MGW1", u.crossOrigin = "anonymous", u.async = !0, u.onload = () => {
      l(!0);
    }, u.onerror = () => {
      console.error("Failed to load OAuth script"), a(!1);
    }, document.head.appendChild(u), () => {
      document.head.removeChild(u);
    };
  }, [r]), F(() => {
    if (c)
      if (window.GitHubAuth.isAuthenticated()) {
        const u = window.GitHubAuth.getUser(), g = window.GitHubAuth.getToken();
        u && g && (i(g, u), a(!1));
      } else
        window.GitHubAuth.init({
          scope: "repo",
          onLogin: (u) => {
            const g = window.GitHubAuth.getUser();
            g && (i(u, g), a(!1));
          }
        }), a(!1);
  }, [c, i]), n ? /* @__PURE__ */ o.jsx("div", { className: "loading", children: /* @__PURE__ */ o.jsxs("div", { style: { textAlign: "center" }, children: [
    /* @__PURE__ */ o.jsx("div", { style: {
      border: "4px solid rgba(255,255,255,0.3)",
      borderRadius: "50%",
      borderTopColor: "white",
      width: "50px",
      height: "50px",
      animation: "spin 1s linear infinite",
      margin: "0 auto 20px"
    } }),
    /* @__PURE__ */ o.jsx("p", { children: "Initializing..." })
  ] }) }) : s ? /* @__PURE__ */ o.jsx(o.Fragment, { children: t }) : /* @__PURE__ */ o.jsx("div", { className: "loading", children: /* @__PURE__ */ o.jsxs("div", { style: { textAlign: "center" }, children: [
    /* @__PURE__ */ o.jsx("h2", { children: "Authentication Required" }),
    /* @__PURE__ */ o.jsx("p", { style: { marginTop: 16, marginBottom: 24, opacity: 0.9 }, children: "Please sign in with GitHub to access the gallery" }),
    /* @__PURE__ */ o.jsx(
      "button",
      {
        onClick: () => window.GitHubAuth.login(),
        style: {
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer"
        },
        children: "Sign in with GitHub"
      }
    )
  ] }) });
}
const me = (...t) => t.filter((r, i, s) => !!r && r.trim() !== "" && s.indexOf(r) === i).join(" ").trim();
const ke = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const Se = (t) => t.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (r, i, s) => s ? s.toUpperCase() : i.toLowerCase()
);
const ue = (t) => {
  const r = Se(t);
  return r.charAt(0).toUpperCase() + r.slice(1);
};
var Re = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const Ae = (t) => {
  for (const r in t)
    if (r.startsWith("aria-") || r === "role" || r === "title")
      return !0;
  return !1;
};
const Te = fe(
  ({
    color: t = "currentColor",
    size: r = 24,
    strokeWidth: i = 2,
    absoluteStrokeWidth: s,
    className: n = "",
    children: a,
    iconNode: c,
    ...l
  }, u) => K(
    "svg",
    {
      ref: u,
      ...Re,
      width: r,
      height: r,
      stroke: t,
      strokeWidth: s ? Number(i) * 24 / Number(r) : i,
      className: me("lucide", n),
      ...!a && !Ae(l) && { "aria-hidden": "true" },
      ...l
    },
    [
      ...c.map(([g, y]) => K(g, y)),
      ...Array.isArray(a) ? a : [a]
    ]
  )
);
const z = (t, r) => {
  const i = fe(
    ({ className: s, ...n }, a) => K(Te, {
      ref: a,
      iconNode: r,
      className: me(
        `lucide-${ke(ue(t))}`,
        `lucide-${t}`,
        s
      ),
      ...n
    })
  );
  return i.displayName = ue(t), i;
};
const Ce = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
], Ne = z("arrow-right", Ce);
const Oe = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
], $e = z("circle-alert", Oe);
const Ie = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
], Pe = z("log-out", Ie);
const Le = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
], Me = z("refresh-cw", Le);
const De = [
  [
    "path",
    {
      d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
      key: "m3kijz"
    }
  ],
  [
    "path",
    {
      d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
      key: "1fmvmk"
    }
  ],
  ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0", key: "1f8sc4" }],
  ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5", key: "qeys4" }]
], de = z("rocket", De);
const Fe = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
], ze = z("trash-2", Fe);
function X({ user: t, onLogout: r, onClearCache: i }) {
  const [s, n] = O(!1), a = he(null);
  F(() => {
    function l(u) {
      a.current && !a.current.contains(u.target) && n(!1);
    }
    return document.addEventListener("click", l), () => document.removeEventListener("click", l);
  }, []);
  const c = () => {
    confirm("Clear all cached data? Apps will reload from the repository.") && (i(), window.location.reload());
  };
  return t ? /* @__PURE__ */ o.jsxs("div", { ref: a, style: { position: "relative" }, children: [
    /* @__PURE__ */ o.jsxs(
      "div",
      {
        className: "user-pill",
        onClick: () => n(!s),
        children: [
          /* @__PURE__ */ o.jsx(
            "img",
            {
              src: t.avatar_url,
              alt: t.login,
              className: "user-avatar"
            }
          ),
          /* @__PURE__ */ o.jsx("span", { style: { fontWeight: 500, fontSize: "14px" }, children: t.name || t.login })
        ]
      }
    ),
    /* @__PURE__ */ o.jsxs("div", { className: `user-menu ${s ? "show" : ""}`, children: [
      /* @__PURE__ */ o.jsxs("button", { onClick: () => window.location.reload(), children: [
        /* @__PURE__ */ o.jsx(Me, { size: 16 }),
        " Refresh"
      ] }),
      /* @__PURE__ */ o.jsxs("button", { onClick: c, children: [
        /* @__PURE__ */ o.jsx(ze, { size: 16 }),
        " Clear Cache"
      ] }),
      /* @__PURE__ */ o.jsxs("button", { onClick: r, children: [
        /* @__PURE__ */ o.jsx(Pe, { size: 16 }),
        " Logout"
      ] })
    ] })
  ] }) : null;
}
function He(t, r) {
  if (!t?.minLauncherVersion || !r) return null;
  const i = r.split(".").map(Number), s = t.minLauncherVersion.split(".").map(Number);
  for (let n = 0; n < 3; n++) {
    if (i[n] < s[n])
      return `Requires launcher v${t.minLauncherVersion}`;
    if (i[n] > s[n]) return null;
  }
  return null;
}
function Ue({ appName: t, manifest: r, path: i, onLaunch: s, version: n }) {
  if (!r)
    return /* @__PURE__ */ o.jsx("div", { className: "app-card", children: /* @__PURE__ */ o.jsxs("div", { className: "app-card-body", children: [
      /* @__PURE__ */ o.jsx("h3", { children: t }),
      /* @__PURE__ */ o.jsx("p", { style: { color: "#ccc" }, children: "Loading..." })
    ] }) });
  const a = He(r, n);
  return /* @__PURE__ */ o.jsxs("div", { className: "app-card", children: [
    r.thumbnail && /* @__PURE__ */ o.jsx(
      "img",
      {
        src: r.thumbnail,
        alt: r.name,
        onError: (c) => {
          c.currentTarget.style.display = "none";
        }
      }
    ),
    /* @__PURE__ */ o.jsxs("div", { className: "app-card-body", children: [
      /* @__PURE__ */ o.jsx("h3", { children: r.name }),
      /* @__PURE__ */ o.jsx("p", { children: r.description }),
      a && /* @__PURE__ */ o.jsxs("div", { style: {
        color: "#f59e0b",
        fontSize: "13px",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }, children: [
        /* @__PURE__ */ o.jsx($e, { size: 16 }),
        " ",
        a
      ] }),
      r.tech && r.tech.length > 0 && /* @__PURE__ */ o.jsx("div", { className: "app-meta", children: r.tech.map((c) => /* @__PURE__ */ o.jsx("span", { className: "badge", children: c }, c)) }),
      /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => s(i, r.name),
          className: "launch-btn",
          children: [
            "Launch App ",
            /* @__PURE__ */ o.jsx(Ne, { size: 16 })
          ]
        }
      )
    ] })
  ] });
}
function Be({
  config: t,
  user: r,
  token: i,
  useGitHubAPI: s,
  onLogout: n,
  onClearCache: a,
  onTrack: c
}) {
  const [l, u] = O([]), [g, y] = O(!0), [x, j] = O(null), [b, k] = O(null), [$, m] = O(!1), [T, C] = O(!1), f = s(t.repository.owner, t.repository.name), d = he(null);
  F(() => {
    p();
  }, []), F(() => {
    function w(R) {
      R.key === "Escape" && b && I();
    }
    return window.addEventListener("keydown", w), () => window.removeEventListener("keydown", w);
  }, [b]), F(() => {
    function w(R) {
      R.data === "close-app" && I();
    }
    return window.addEventListener("message", w), () => window.removeEventListener("message", w);
  }, []);
  const p = async () => {
    try {
      y(!0);
      const R = (await f.listDirectory("apps")).filter((A) => A.type === "dir"), L = R.map((A) => ({
        name: A.name,
        path: A.path,
        manifest: null
      }));
      u(L);
      for (let A = 0; A < R.length; A++) {
        await new Promise((M) => setTimeout(M, A * 100));
        const P = await f.getManifest(R[A].path);
        P && u((M) => M.map(
          (H) => H.name === R[A].name ? { ...H, manifest: P } : H
        ));
      }
      y(!1);
    } catch (w) {
      j(w.message), y(!1);
    }
  }, S = N(async (w, R) => {
    try {
      m(!0), k({ path: w, name: R }), c?.("app_launch", { appName: R, appPath: w });
      const L = await f.getFile(`${w}/index.html`), A = `<script>
        window.INJECTED_TOKEN = ${JSON.stringify(i)};
        window.INJECTED_USER = ${JSON.stringify(r)};
        window.PARENT_REPO = window.parent.repo;
      <\/script>`, P = L.content.replace("<head>", "<head>" + A);
      d.current && (d.current.srcdoc = P, d.current.onload = () => {
        m(!1), C(!0), setTimeout(() => C(!1), 3e3);
      });
    } catch (L) {
      alert(`Error loading app: ${L.message}`), m(!1), k(null);
    }
  }, [f, i, r, c]), I = N(() => {
    k(null), C(!1), d.current && (d.current.srcdoc = "");
  }, []);
  return g && l.length === 0 ? /* @__PURE__ */ o.jsxs("div", { children: [
    /* @__PURE__ */ o.jsx(X, { user: r, onLogout: n, onClearCache: a }),
    /* @__PURE__ */ o.jsxs("div", { style: {
      background: `linear-gradient(135deg, ${t.branding.theme.primary} 0%, ${t.branding.theme.secondary} 100%)`,
      color: "white",
      padding: "48px 20px",
      textAlign: "center",
      marginBottom: "48px"
    }, children: [
      /* @__PURE__ */ o.jsxs("h1", { style: {
        margin: "0 0 8px 0",
        fontSize: "2.5em",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }, children: [
        /* @__PURE__ */ o.jsx(de, { size: 32 }),
        " ",
        t.branding.title
      ] }),
      /* @__PURE__ */ o.jsx("p", { style: { margin: 0, opacity: 0.95, fontSize: "1.05em" }, children: t.branding.subtitle })
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "loading", children: /* @__PURE__ */ o.jsxs("div", { style: { textAlign: "center" }, children: [
      /* @__PURE__ */ o.jsx("div", { style: {
        border: "4px solid rgba(255,255,255,0.3)",
        borderRadius: "50%",
        borderTopColor: "white",
        width: "50px",
        height: "50px",
        animation: "spin 1s linear infinite",
        margin: "0 auto 20px"
      } }),
      /* @__PURE__ */ o.jsx("p", { children: "Loading applications..." })
    ] }) })
  ] }) : x ? /* @__PURE__ */ o.jsxs("div", { children: [
    /* @__PURE__ */ o.jsx(X, { user: r, onLogout: n, onClearCache: a }),
    /* @__PURE__ */ o.jsxs("div", { className: "error", children: [
      /* @__PURE__ */ o.jsx("strong", { children: "Error:" }),
      " ",
      x
    ] })
  ] }) : /* @__PURE__ */ o.jsxs("div", { children: [
    /* @__PURE__ */ o.jsx(X, { user: r, onLogout: n, onClearCache: a }),
    /* @__PURE__ */ o.jsxs("div", { style: {
      background: `linear-gradient(135deg, ${t.branding.theme.primary} 0%, ${t.branding.theme.secondary} 100%)`,
      color: "white",
      padding: "48px 20px",
      textAlign: "center",
      marginBottom: "48px"
    }, children: [
      /* @__PURE__ */ o.jsxs("h1", { style: {
        margin: "0 0 8px 0",
        fontSize: "2.5em",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }, children: [
        /* @__PURE__ */ o.jsx(de, { size: 32 }),
        " ",
        t.branding.title
      ] }),
      /* @__PURE__ */ o.jsx("p", { style: { margin: 0, opacity: 0.95, fontSize: "1.05em" }, children: t.branding.subtitle })
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "app-grid", children: l.map((w) => /* @__PURE__ */ o.jsx(
      Ue,
      {
        appName: w.name,
        manifest: w.manifest,
        path: w.path,
        onLaunch: S
      },
      w.name
    )) }),
    b && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
      /* @__PURE__ */ o.jsx(
        "iframe",
        {
          ref: d,
          className: "app-frame",
          style: { display: "block" },
          title: b.name
        }
      ),
      $ && /* @__PURE__ */ o.jsx("div", { className: "app-loader", style: { display: "flex" }, children: /* @__PURE__ */ o.jsxs("div", { style: { textAlign: "center" }, children: [
        /* @__PURE__ */ o.jsx("div", { style: {
          border: "4px solid rgba(255,255,255,0.3)",
          borderRadius: "50%",
          borderTopColor: "white",
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        } }),
        /* @__PURE__ */ o.jsx("p", { children: "Loading app..." })
      ] }) }),
      /* @__PURE__ */ o.jsx("div", { className: `hint ${T ? "visible" : ""}`, children: "Press ESC to return to gallery" })
    ] })
  ] });
}
export {
  Ue as AppCard,
  Be as AppShell,
  Ve as OAuth,
  X as UserMenu,
  Ge as createAnalyticsStore,
  Ye as createAuthStore,
  We as createCacheStore,
  qe as createGitHubAPIHook
};
//# sourceMappingURL=framework.es.js.map
