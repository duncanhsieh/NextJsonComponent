import { createScopedStore, ErrorBoundary } from './chunk-NA7L6NTL.mjs';
export { ServerActionHydrator, useServerActionState } from './chunk-NA7L6NTL.mjs';
import { renderNode } from './chunk-3P2SZ7UA.mjs';
import React, { useMemo, useRef, useEffect } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';

function StaticSubtree({ content }) {
  return /* @__PURE__ */ jsx(Fragment, { children: content });
}
React.memo(StaticSubtree);
var ClientJsonHydrator = React.memo(
  ({ template, options, componentProps = {} }) => {
    const useStore = useMemo(() => {
      var _a;
      return createScopedStore((_a = options.initialState) != null ? _a : {});
    }, []);
    const state = useStore();
    const storeRef = useRef(useStore);
    storeRef.current = useStore;
    const onStoreReadyRef = useRef(options._onStoreReady);
    onStoreReadyRef.current = options._onStoreReady;
    useEffect(() => {
      if (onStoreReadyRef.current) {
        onStoreReadyRef.current((partial) => {
          storeRef.current.getState().setState(partial);
        });
      }
    }, []);
    const analyzedTemplate = template;
    const ctx = useMemo(
      () => ({
        state,
        setState: state.setState,
        props: componentProps,
        options
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state, componentProps, options]
    );
    const rendered = renderNode(analyzedTemplate, ctx);
    return /* @__PURE__ */ jsx(ErrorBoundary, { children: rendered });
  }
);
ClientJsonHydrator.displayName = "ClientJsonHydrator";

export { ClientJsonHydrator };
//# sourceMappingURL=client.mjs.map
//# sourceMappingURL=client.mjs.map