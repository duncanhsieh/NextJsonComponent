import React from 'react';
import { b as AnalyzedNode, N as NextJsonComponentOptions } from './types-B1lk251m.js';
import * as react_jsx_runtime from 'react/jsx-runtime';

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

interface ClientJsonHydratorProps {
    /** The JSON AST to hydrate. Must be JSON-serializable (no Functions). */
    template: AnalyzedNode;
    /** Component options (actionRegistry, components, initialState, etc.). */
    options: NextJsonComponentOptions;
    /** Props passed from the consumer's usage of NextJsonComponent. */
    componentProps?: Record<string, unknown>;
}
declare const ClientJsonHydrator: React.FC<ClientJsonHydratorProps>;

interface ServerActionState {
    isPending: boolean;
    result: unknown;
    error: string | null;
}

declare function useServerActionState(action: (...args: unknown[]) => Promise<unknown>, _actionName: string): {
    dispatch: (...args: unknown[]) => void;
    state: ServerActionState;
};
interface ServerActionHydratorProps {
    template: AnalyzedNode;
    options: NextJsonComponentOptions;
    componentProps?: Record<string, unknown>;
}
/**
 * Self-contained hydrator for components that use Server Actions.
 * Owns its Zustand store and syncs action state into it reactively.
 */
declare function ServerActionHydrator({ template, options, componentProps, }: ServerActionHydratorProps): react_jsx_runtime.JSX.Element;

export { ClientJsonHydrator, type ClientJsonHydratorProps, ServerActionHydrator, type ServerActionState, useServerActionState };
