import { analyzeTree } from './chunk-YKATBEDX.mjs';
export { analyzeNode, analyzeTree, isStaticNode } from './chunk-YKATBEDX.mjs';
import { createScopedStore, ErrorBoundary } from './chunk-ZFUZUVYD.mjs';
import { renderNode } from './chunk-3P2SZ7UA.mjs';
export { SafeEvalError, UnregisteredActionError, createBoundHandler, isExpression, resolveExpression, safeEval, validateRegistry } from './chunk-3P2SZ7UA.mjs';
import React, { useMemo } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';

function StaticSubtree({ content }) {
  return /* @__PURE__ */ jsx(Fragment, { children: content });
}
React.memo(StaticSubtree);
var ReactJsonRenderer = React.memo(
  ({ template, options, componentProps = {} }) => {
    const useStore = useMemo(
      () => {
        var _a;
        return createScopedStore((_a = options.initialState) != null ? _a : {});
      },
      []
    );
    const state = useStore();
    const analyzedTemplate = useMemo(
      () => analyzeTree(template),
      [template]
    );
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
ReactJsonRenderer.displayName = "ReactJsonRenderer";

export { ReactJsonRenderer };
//# sourceMappingURL=react.mjs.map
//# sourceMappingURL=react.mjs.map