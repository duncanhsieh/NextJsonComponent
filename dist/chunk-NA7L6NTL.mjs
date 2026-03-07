import { __spreadProps, __spreadValues, renderNode } from './chunk-3P2SZ7UA.mjs';
import React, { useMemo, useRef, useEffect, useTransition, useState, useCallback } from 'react';
import { create } from 'zustand';
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
function useServerActionRunner(action) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useCallback(
    (...args) => {
      startTransition(async () => {
        try {
          const res = await action(...args);
          setResult(res);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action]
  );
  return { dispatch, state: { isPending, result, error } };
}
function useServerActionState(action, _actionName) {
  return useServerActionRunner(action);
}
function ServerActionHydrator({
  template,
  options,
  componentProps = {}
}) {
  var _a, _b;
  const serverActions = (_a = options.serverActions) != null ? _a : {};
  const actionEntries = useMemo(() => Object.entries(serverActions), [serverActions]);
  const runnersArray = actionEntries.map(([name, action]) => ({
    name,
    runner: useServerActionRunner(action)
  }));
  const actionRunners = {};
  runnersArray.forEach(({ name, runner }) => {
    actionRunners[name] = runner;
  });
  const initialActionsStatus = Object.fromEntries(
    Object.entries(actionRunners).map(([name, { state }]) => [name, state])
  );
  const useStore = useMemo(() => {
    var _a2;
    return createScopedStore(__spreadProps(__spreadValues({}, (_a2 = options.initialState) != null ? _a2 : {}), {
      _actions: initialActionsStatus
    }));
  }, []);
  const storeState = useStore();
  const actionsStatus = Object.fromEntries(
    Object.entries(actionRunners).map(([name, { state }]) => [name, state])
  );
  const actionsJson = JSON.stringify(actionsStatus);
  const actionsStatusRef = useRef(actionsStatus);
  actionsStatusRef.current = actionsStatus;
  useEffect(() => {
    useStore.getState().setState({ _actions: actionsStatusRef.current });
  }, [actionsJson]);
  const bridgedRegistry = __spreadValues(__spreadValues({}, (_b = options.actionRegistry) != null ? _b : {}), Object.fromEntries(
    Object.entries(actionRunners).map(([name, { dispatch }]) => [
      name,
      (_s, _ss, _p, ...args) => dispatch(...args)
    ])
  ));
  const analyzedTemplate = template;
  const ctx = {
    state: storeState,
    setState: storeState.setState,
    props: componentProps,
    options: __spreadProps(__spreadValues({}, options), {
      actionRegistry: bridgedRegistry,
      // Clear serverActions so resolveHandler routes through actionRegistry
      // (which contains our useTransition-wrapped dispatchers) instead of
      // calling the raw server action directly.
      serverActions: {}
    })
  };
  return /* @__PURE__ */ jsx(ErrorBoundary, { children: renderNode(analyzedTemplate, ctx) });
}

export { ErrorBoundary, ServerActionHydrator, createScopedStore, useServerActionState };
//# sourceMappingURL=chunk-NA7L6NTL.mjs.map
//# sourceMappingURL=chunk-NA7L6NTL.mjs.map