import React from 'react';
import { J as JsonASTNode, A as AnalyzedNode, N as NextJsonComponentOptions } from './types-C1ZzHgkh.mjs';
export { a as ActionBinding, b as ActionRegistry, c as JsonPropValue, d as RegistryAction, R as RenderContext, S as ScopedStoreState, e as SetStateFn } from './types-C1ZzHgkh.mjs';
export { S as SafeEvalError, U as UnregisteredActionError, a as analyzeNode, b as analyzeTree, c as createBoundHandler, e as isExpression, f as isStaticNode, r as resolveExpression, s as safeEval, v as validateRegistry } from './action-registry-BzoJEMzs.mjs';

/**
 * ReactJsonRenderer.tsx
 *
 * A framework-agnostic React component for rendering JSON AST templates.
 * Designed for use in pure React environments (e.g. Vite + React, CRA)
 * without any Next.js dependency.
 *
 * Usage:
 *   import { ReactJsonRenderer } from 'next-json-component/react';
 *
 *   <ReactJsonRenderer
 *     template={myJsonAst}
 *     options={{
 *       actionRegistry: { increment: (s, set) => set({ count: s.count + 1 }) },
 *       initialState: { count: 0 },
 *     }}
 *   />
 */

interface ReactJsonRendererProps {
    /** The JSON AST template to render. Accepts both raw and pre-analyzed nodes. */
    template: JsonASTNode | AnalyzedNode;
    /**
     * Component options.
     * Note: `serverActions` is not supported in React-only mode.
     * Use `actionRegistry` for all action handling.
     */
    options: Omit<NextJsonComponentOptions, 'serverActions' | '_onStoreReady'>;
    /** Props passed from the consumer, accessible via `{{ props.xxx }}` in templates. */
    componentProps?: Record<string, unknown>;
}
declare const ReactJsonRenderer: React.FC<ReactJsonRendererProps>;

export { AnalyzedNode, JsonASTNode, NextJsonComponentOptions, ReactJsonRenderer, type ReactJsonRendererProps };
