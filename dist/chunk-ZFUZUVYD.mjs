import { __spreadProps, __spreadValues } from './chunk-3P2SZ7UA.mjs';
import { create } from 'zustand';
import React from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

function createScopedStore(initialState = {}) {
  return create((set, get) => __spreadProps(__spreadValues({}, initialState), {
    setState: ((update) => {
      set((current) => {
        const partial = typeof update === "function" ? update(current) : update;
        return __spreadValues(__spreadValues({}, current), partial);
      });
    }),
    // Expose getState for use in action handlers
    getState: () => get()
  }));
}
var FallbackUI = ({ error }) => /* @__PURE__ */ jsxs(
  "div",
  {
    style: {
      padding: "16px",
      border: "1px solid #e74c3c",
      borderRadius: "4px",
      backgroundColor: "#fdf0ef",
      color: "#c0392b",
      fontFamily: "monospace",
      fontSize: "14px"
    },
    children: [
      /* @__PURE__ */ jsx("strong", { children: "NextJsonComponent \u6E32\u67D3\u932F\u8AA4" }),
      error && /* @__PURE__ */ jsx("pre", { style: { marginTop: "8px", whiteSpace: "pre-wrap", fontSize: "12px" }, children: error.message })
    ]
  }
);
var ErrorBoundary = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[NextJsonComponent] Render error caught by ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== void 0) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsx(FallbackUI, { error: this.state.error });
    }
    return this.props.children;
  }
};

export { ErrorBoundary, createScopedStore };
//# sourceMappingURL=chunk-ZFUZUVYD.mjs.map
//# sourceMappingURL=chunk-ZFUZUVYD.mjs.map