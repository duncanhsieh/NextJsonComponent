'use client';

/**
 * server-action-bridge.tsx
 *
 * Integrates Next.js Server Actions with the JSON template engine.
 *
 * Architecture (v4 — useTransition based, no useActionState):
 *   - Uses `useTransition` to track `isPending` (React 18 concurrent mode).
 *   - Calls the server action directly in a `startTransition` callback.
 *   - Stores result/error in local useState (not inside the JSON store).
 *   - On every render, merges _actions status into the scoped Zustand store
 *     directly (without going through initialState or prop passing).
 *
 * Why not useActionState?
 *   `useActionState` expects its `formAction` to be called from a native form
 *   submission context or React's special `startTransition`. When called from
 *   a plain onClick handler it does not reliably signal isPending.
 *   `useTransition` is the correct primitive for manually-triggered async work.
 */

import React, { useCallback, useMemo, useEffect, useRef, useState, useTransition } from 'react';
import type { NextJsonComponentOptions, RenderContext } from '../types';
import { createScopedStore } from '../store/store';
import { analyzeTree } from '../static-analyzer';
import { renderNode } from '../node-renderer';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import type { AnalyzedNode } from '../types';

// ---------------------------------------------------------------------------
// Server Action State Shape
// ---------------------------------------------------------------------------

export interface ServerActionState {
  isPending: boolean;
  result: unknown;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Single server-action hook (useTransition based)
// ---------------------------------------------------------------------------

function useServerActionRunner(
  action: (...args: unknown[]) => Promise<unknown>,
): {
  dispatch: (...args: unknown[]) => void;
  state: ServerActionState;
} {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useCallback(
    (...args: unknown[]) => {
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
    [action],
  );

  return { dispatch, state: { isPending, result, error } };
}

// Keep type export for external consumers
export { type ServerActionState as ServerActionStateType };
export function useServerActionState(
  action: (...args: unknown[]) => Promise<unknown>,
  _actionName: string,
) {
  return useServerActionRunner(action);
}

// ---------------------------------------------------------------------------
// ServerActionHydrator Component
// ---------------------------------------------------------------------------

interface ServerActionHydratorProps {
  template: AnalyzedNode;
  options: NextJsonComponentOptions;
  componentProps?: Record<string, unknown>;
}

/**
 * Self-contained hydrator for components that use Server Actions.
 * Owns its Zustand store and syncs action state into it reactively.
 */
export function ServerActionHydrator({
  template,
  options,
  componentProps = {},
}: ServerActionHydratorProps) {
  const serverActions = options.serverActions ?? {};

  // Stable hook order — one runner per action
  const actionRunners: Record<string, { dispatch: (...a: unknown[]) => void; state: ServerActionState }> = {};
  for (const [name, action] of Object.entries(serverActions)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const runner = useServerActionRunner(action);
    actionRunners[name] = runner;
  }

  // -----------------------------------------------------------------------
  // Own Zustand store — created once
  // -----------------------------------------------------------------------
  const initialActionsStatus = Object.fromEntries(
    Object.entries(actionRunners).map(([name, { state }]) => [name, state]),
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useStore = useMemo(() => createScopedStore({
    ...(options.initialState ?? {}),
    _actions: initialActionsStatus,
  }), []);

  const storeState = useStore();

  // -----------------------------------------------------------------------
  // Sync _actions into store when any action state changes.
  // Compare by JSON to avoid infinite loops.
  // -----------------------------------------------------------------------
  const actionsStatus: Record<string, ServerActionState> = Object.fromEntries(
    Object.entries(actionRunners).map(([name, { state }]) => [name, state]),
  );
  const actionsJson = JSON.stringify(actionsStatus);
  const actionsStatusRef = useRef(actionsStatus);
  actionsStatusRef.current = actionsStatus;

  useEffect(() => {
    useStore.getState().setState({ _actions: actionsStatusRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsJson]);

  // -----------------------------------------------------------------------
  // Bridged action registry — dispatchers exposed under their action names
  // -----------------------------------------------------------------------
  const bridgedRegistry = {
    ...(options.actionRegistry ?? {}),
    ...Object.fromEntries(
      Object.entries(actionRunners).map(([name, { dispatch }]) => [
        name,
        (_s: unknown, _ss: unknown, _p: unknown, ...args: unknown[]) => dispatch(...args),
      ]),
    ),
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  const analyzedTemplate = useMemo(() => analyzeTree(template), [template]);

  const ctx: RenderContext = {
    state: storeState,
    setState: storeState.setState,
    props: componentProps,
    options: {
      ...options,
      actionRegistry: bridgedRegistry,
      // Clear serverActions so resolveHandler routes through actionRegistry
      // (which contains our useTransition-wrapped dispatchers) instead of
      // calling the raw server action directly.
      serverActions: {},
    },
  };

  return <ErrorBoundary>{renderNode(analyzedTemplate, ctx)}</ErrorBoundary>;
}
