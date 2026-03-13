import { A as AnalyzedNode, R as RenderContext, J as JsonASTNode } from './types-C1ZzHgkh.js';
export { a as ActionBinding, b as ActionRegistry, c as JsonPropValue, N as NextJsonComponentOptions, d as RegistryAction, S as ScopedStoreState, e as SetStateFn } from './types-C1ZzHgkh.js';
export { S as SafeEvalError, U as UnregisteredActionError, a as analyzeNode, b as analyzeTree, c as createBoundHandler, d as createBoundServerActionHandler, i as isActionBinding, e as isExpression, f as isStaticNode, r as resolveExpression, g as resolveHandler, h as resolveProps, s as safeEval, v as validateRegistry } from './action-registry-CE__YEGr.js';
import React from 'react';

/**
 * key-generator.ts
 *
 * Hash-based stable key generation for $each list rendering.
 *
 * When a JSON AST uses $each without a $key, React needs a stable key
 * to correctly reconcile list items. Using array index causes state
 * misalignment when items are reordered or inserted.
 *
 * This module generates a deterministic hash from the item's content,
 * falling back to index only if hashing fails.
 */
/**
 * Generate a stable string key for a list item.
 *
 * Priority:
 *   1. Explicit $key expression (resolved by the renderer, passed in as `resolvedKey`)
 *   2. Hash of the item data
 *   3. Fallback: string-coerced index (last resort)
 *
 * @param item         - The current list item.
 * @param index        - The current iteration index.
 * @param resolvedKey  - The pre-resolved $key value (if $key was provided in JSON).
 * @returns A stable string key for React.
 */
declare function generateKey(item: unknown, index: number, resolvedKey?: unknown): string;
/**
 * Generate stable keys for an entire array of items.
 * Useful for batch-processing a $each list.
 *
 * @param items       - The array being iterated.
 * @param resolvedKeys - Optional array of pre-resolved $key values.
 * @returns Array of stable string keys, one per item.
 */
declare function generateKeys(items: unknown[], resolvedKeys?: unknown[]): string[];

/**
 * boundary-splitter.ts
 *
 * Analyzes a JSON AST (already processed by static-analyzer) and determines
 * whether each node or subtree requires Client-side rendering.
 *
 * A node "needs client" if:
 *   - It has an ActionBinding in any prop (event handlers)
 *   - It has a $if or $each directive (dynamic list/conditional rendering)
 *   - Any of its text children contains {{ state.xxx }} (stateful expressions)
 *   - Any of its child nodes need client
 *
 * Note: pure {{ props.xxx }} can technically be resolved server-side, but
 * for simplicity and to avoid hydration mismatches, we treat ALL {{ }}
 * expressions as requiring client for now. This can be refined in future.
 */

/**
 * Determine whether the given analyzed node requires client-side rendering.
 */
declare function nodeNeedsClient(node: AnalyzedNode): boolean;
/**
 * The result of boundary analysis on an AST.
 * Contains the original node annotated with `_needsClient` flags.
 */
interface AnnotatedNode extends AnalyzedNode {
    /** Whether this specific node (root of a subtree) needs client rendering. */
    _needsClient?: boolean;
    children?: (AnnotatedNode | string)[];
}
/**
 * Walk the entire AST and annotate each node with `_needsClient`.
 * This annotation is used by ServerJsonComponent to decide rendering strategy.
 */
declare function annotateBoundaries(node: AnalyzedNode): AnnotatedNode;

/**
 * node-renderer.ts
 *
 * Core shared rendering logic: converts a JSON AST node into a React element.
 * Used by both ServerJsonComponent (for static nodes) and ClientJsonHydrator
 * (for dynamic nodes).
 *
 * Handles:
 *   - $if conditional rendering
 *   - $each list rendering with hash-based keys
 *   - {{ }} expression resolution in props and text children
 *   - ActionBinding → event handler conversion
 *   - Component lookup from options.components
 */

/**
 * Render a JSON AST node into a React element (or null if hidden by $if).
 *
 * @param node - The analyzed JSON AST node.
 * @param ctx  - The current render context.
 * @param key  - React key (provided by parent when rendering lists).
 * @returns A React element, array of elements (for $each), or null.
 */
declare function renderNode(node: AnalyzedNode, ctx: RenderContext, key?: string): React.ReactNode;

/**
 * jsx-to-json.ts
 *
 * Converts a JSX string into a NextJsonComponent JSON AST.
 *
 * Uses Babel's parser to produce a full AST, then walks JSXElement nodes
 * to emit the JSON AST format.
 *
 * Supported JSX features:
 *   ✅ JSX elements (e.g. <div>, <Button>)
 *   ✅ JSX attributes (string, expression, boolean shorthand)
 *   ✅ JSX Spread Attributes ({...props}, {...rest})
 *   ✅ JSX children (text, elements, expressions)
 *   ✅ Ternary expressions in attributes
 *   ✅ String interpolation in JSX text
 *   ✅ Self-closing elements
 *   ✅ Fragments (<></>) — flattened into array
 *   ✅ Event handlers mapped to ActionBinding format
 */

interface JsxToJsonOptions {
    /**
     * Map event handler names to action names.
     * If an event handler is a simple identifier matching a key here, it is
     * converted to an ActionBinding.
     */
    eventHandlerMap?: Record<string, string>;
    /** If true, log warnings for unsupported expressions. Default: true */
    verbose?: boolean;
}
/**
 * Convert a JSX string to a JSON AST node (or array for fragments).
 */
declare function jsxToJson(jsx: string, options?: JsxToJsonOptions): JsonASTNode | JsonASTNode[];

/**
 * json-to-jsx.ts
 *
 * Converts a NextJsonComponent JSON AST back into JSX source code.
 *
 * This is useful for:
 *   - Developer tooling: inspect/debug JSON templates as readable JSX
 *   - Round-trip testing: jsxToJson → jsonToJsx should be idempotent
 *   - CMS preview rendering
 *
 * The output is formatted JSX that can be pasted directly into React files.
 *
 * Supported conversions:
 *   ✅ Plain props (string, number, boolean, null)
 *   ✅ Expression props ("{{ expr }}" → {expr})
 *   ✅ ActionBinding → onClick={() => actionName(args)}
 *   ✅ Spread props ("...propName": "{{ propName }}" → {...propName})
 *   ✅ $if directive → conditional expression or && shorthand
 *   ✅ $each directive → .map() with key
 *   ✅ Text children with {{ }} → JSX expression interpolation
 *   ✅ Nested children (recursive)
 */

interface JsonToJsxOptions {
    /** Number of spaces per indentation level. Default: 2. */
    indentSize?: number;
    /** Target import style. Default: 'none' (no import statement). */
    addImport?: boolean;
}
/**
 * Convert a JSON AST node (or array of nodes) into a JSX string.
 *
 * @param node    - The JSON AST node to convert.
 * @param options - Output formatting options.
 * @returns A JSX string representation.
 */
declare function jsonToJsx(node: JsonASTNode | JsonASTNode[], options?: JsonToJsxOptions): string;

export { AnalyzedNode, JsonASTNode, type JsonToJsxOptions, type JsxToJsonOptions, RenderContext, annotateBoundaries, generateKey, generateKeys, jsonToJsx, jsxToJson, nodeNeedsClient, renderNode };
