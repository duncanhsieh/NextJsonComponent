'use client';

/**
 * ClientJsonHydrator.tsx
 *
 * The 'use client' boundary component for NextJsonComponent.
 *
 * Responsibilities:
 *   - Creates a scoped Zustand store for the component's state.
 *   - Subscribes to state updates and triggers re-renders.
 *   - Provides the RenderContext (state, setState, props, options) to
 *     the node renderer.
 *   - Wraps the rendered output in an ErrorBoundary.
 *
 * Receives JSON AST from the Server Component via serializable props.
 *
 * NOTE: When used through ServerActionHydrator, `options._onStoreReady` is
 * called once (via a one-time useEffect) so the hydrator can push server
 * action state updates without triggering a re-render loop.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import type { AnalyzedNode, NextJsonComponentOptions, RenderContext } from '../types';
import { createScopedStore } from '../store/store';

import { renderNode } from '../node-renderer';
import { ErrorBoundary } from '../errors/ErrorBoundary';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClientJsonHydratorProps {
  /** The JSON AST to hydrate. Must be JSON-serializable (no Functions). */
  template: AnalyzedNode;
  /** Component options (actionRegistry, components, initialState, etc.). */
  options: NextJsonComponentOptions;
  /** Props passed from the consumer's usage of NextJsonComponent. */
  componentProps?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Static node cache — memoizes subtrees that are known to be static
// ---------------------------------------------------------------------------

function StaticSubtree({ content }: { content: React.ReactNode }) {
  return <>{content}</>;
}
const MemoizedStaticSubtree = React.memo(StaticSubtree);

// ---------------------------------------------------------------------------
// Hydrator component
// ---------------------------------------------------------------------------

export const ClientJsonHydrator: React.FC<ClientJsonHydratorProps> = React.memo(
  ({ template, options, componentProps = {} }) => {
    // Create a stable Zustand store once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const useStore = useMemo(() => createScopedStore(options.initialState ?? {}), []);

    const state = useStore();
    const storeRef = useRef(useStore);
    storeRef.current = useStore;

    // -----------------------------------------------------------------------
    // Notify ServerActionHydrator about the store's setter — once on mount.
    // This avoids the infinite-loop caused by using setState in a dep-tracked
    // useEffect: the setter reference is stable, so the effect only fires once.
    // -----------------------------------------------------------------------
    const onStoreReadyRef = useRef(options._onStoreReady);
    onStoreReadyRef.current = options._onStoreReady;

    useEffect(() => {
      if (onStoreReadyRef.current) {
        onStoreReadyRef.current((partial) => {
          // Direct Zustand set — bypasses the React render cycle
          storeRef.current.getState().setState(partial);
        });
      }
      // Run only once on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The template was already analyzed statically on the server
    const analyzedTemplate = template;

    // Build render context
    const ctx: RenderContext = useMemo(
      () => ({
        state,
        setState: state.setState,
        props: componentProps,
        options,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state, componentProps, options],
    );

    const rendered = renderNode(analyzedTemplate, ctx);

    return <ErrorBoundary>{rendered}</ErrorBoundary>;
  },
);

ClientJsonHydrator.displayName = 'ClientJsonHydrator';

/**
 * Render a static analyzed node and wrap it in React.memo.
 */
export function renderStaticNode(
  node: AnalyzedNode,
  ctx: RenderContext,
): React.ReactNode {
  const content = renderNode(node, ctx);
  return <MemoizedStaticSubtree key={node.type} content={content} />;
}
