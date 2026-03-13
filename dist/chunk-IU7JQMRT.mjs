import { createScopedStore, ErrorBoundary } from './chunk-ZFUZUVYD.mjs';
import { __spreadProps, __spreadValues, renderNode } from './chunk-3P2SZ7UA.mjs';
import { useMemo, useRef, useEffect, useTransition, useState, useCallback } from 'react';
import { jsx } from 'react/jsx-runtime';

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

export { ServerActionHydrator, useServerActionState };
//# sourceMappingURL=chunk-IU7JQMRT.mjs.map
//# sourceMappingURL=chunk-IU7JQMRT.mjs.map