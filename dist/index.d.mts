import { A as ActionBinding, R as RenderContext, J as JsonPropValue, a as JsonASTNode, b as AnalyzedNode, c as ActionRegistry } from './types-B1lk251m.mjs';
export { N as NextJsonComponentOptions, d as RegistryAction, S as ScopedStoreState, e as SetStateFn } from './types-B1lk251m.mjs';
import React from 'react';

/**
 * safe-evaluator.ts
 *
 * A lightweight, sandboxed expression evaluator for {{ }} template bindings.
 * Replaces `new Function` by hand-parsing a safe JS expression subset.
 *
 * Supported syntax:
 *   - Member access:      a.b.c
 *   - Dynamic access:     a[b]
 *   - Function calls:     fn(a, b)
 *   - Ternary operator:   a ? b : c
 *   - Comparison:         ===, !==, ==, !=, >, <, >=, <=
 *   - Logical:            &&, ||, !
 *   - Arithmetic:         +, -, *, /, %
 *   - String literals:    'hello', "hello", `hello`
 *   - Number literals:    42, 3.14
 *   - Boolean literals:   true, false
 *   - Null / undefined:   null, undefined
 *   - Grouping:           (expr)
 *
 * Explicitly BLOCKED:
 *   - Assignment (=, +=, etc.)
 *   - `new`, `delete`, `typeof`, `instanceof`
 *   - constructor access
 *   - __proto__ / prototype access
 *   - Access to window, document, globalThis, eval, Function, etc.
 */
/** Error thrown when the safe evaluator encounters a blocked or invalid expression. */
declare class SafeEvalError extends Error {
    constructor(message: string);
}
/**
 * Safely evaluate a JavaScript expression string against a given context.
 *
 * @param expression - The expression string to evaluate (NOT a full program, just an expression).
 * @param context    - The variable bindings available to the expression.
 * @returns The evaluated value.
 * @throws SafeEvalError if the expression uses blocked identifiers or invalid syntax.
 */
declare function safeEval(expression: string, context: Record<string, unknown>): unknown;

/**
 * expression-resolver.ts
 *
 * Resolves {{ expr }} template expressions against a RenderContext.
 * All actual expression evaluation is delegated to the safe-evaluator.
 */

/**
 * Check whether a string value contains at least one {{ }} template expression.
 */
declare function isExpression(value: string): boolean;
/**
 * Resolve a string template that may contain one or more {{ expr }} placeholders.
 *
 * - If the entire string is a single {{ expr }}, returns the raw evaluated value
 *   (preserving type: boolean, number, object, etc.).
 * - If the string contains {{ expr }} mixed with literal text, all placeholders
 *   are replaced with their string-coerced values and the full string is returned.
 *
 * @param template - A string potentially containing {{ }} expressions.
 * @param ctx      - The current render context.
 * @returns The resolved value.
 */
declare function resolveExpression(template: string, ctx: RenderContext): unknown;
/**
 * Resolve all props in a props map against the render context.
 * Returns a new object with all {{ }} expressions replaced.
 */
declare function resolveProps(props: Record<string, JsonPropValue>, ctx: RenderContext): Record<string, unknown>;
/**
 * Type-guard — check whether a value is an ActionBinding.
 */
declare function isActionBinding(value: unknown): value is ActionBinding;

/**
 * static-analyzer.ts
 *
 * Implements Static Node Hoisting (AST Pre-pass).
 *
 * Walks the JSON AST and marks nodes with `isStatic: true` when:
 *   - The node has no {{ }} expressions in its props or text children
 *   - The node has no $if, $each directives
 *   - The node has no ActionBinding in its props
 *   - All of its children are also static
 *
 * Static nodes are later memoized by React.memo in the client hydrator,
 * avoiding unnecessary re-renders on state changes.
 */

/**
 * Analyze a JSON AST node and all its descendants.
 * Returns an AnalyzedNode with `isStatic` set appropriately.
 *
 * A node is static if AND ONLY IF:
 *   1. It has no directives ($if, $each)
 *   2. It has no dynamic props ({{ }} or ActionBinding)
 *   3. None of its textual children contain {{ }}
 *   4. All sub-node children are also static
 *
 * @param node - The raw JSON AST node to analyze.
 */
declare function analyzeNode(node: JsonASTNode): AnalyzedNode;
/**
 * Analyze an entire JSON AST tree.
 * Convenience wrapper over analyzeNode for clarity at the call site.
 */
declare function analyzeTree(root: JsonASTNode): AnalyzedNode;
/**
 * Returns true if the analyzed node is guaranteed to produce stable output
 * regardless of state or props changes.
 */
declare function isStaticNode(node: AnalyzedNode): boolean;

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
 * action-registry.ts
 *
 * Implements the Registry Mode action engine.
 * JSON templates reference action names + args; actual logic lives in code.
 * This eliminates all `new Function` / eval usage for actions.
 */

/** Error thrown when an unregistered action is invoked. */
declare class UnregisteredActionError extends Error {
    constructor(name: string, available: string[]);
}
/**
 * Create a bound event handler from an ActionBinding.
 */
declare function createBoundHandler(binding: ActionBinding, registry: ActionRegistry, ctx: RenderContext): (...eventArgs: unknown[]) => Promise<void> | void;
/**
 * Create a bound handler for a Next.js Server Action.
 */
declare function createBoundServerActionHandler(actionName: string, serverAction: (...args: unknown[]) => Promise<unknown>, binding: ActionBinding, ctx: RenderContext): (...eventArgs: unknown[]) => Promise<void>;
/**
 * Validate an ActionRegistry.
 */
declare function validateRegistry(registry: ActionRegistry): void;
/**
 * Build an action handler.
 */
declare function resolveHandler(binding: ActionBinding, ctx: RenderContext): ((...args: unknown[]) => Promise<void> | void) | undefined;

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

export { ActionBinding, ActionRegistry, AnalyzedNode, JsonASTNode, JsonPropValue, type JsonToJsxOptions, type JsxToJsonOptions, RenderContext, SafeEvalError, UnregisteredActionError, analyzeNode, analyzeTree, annotateBoundaries, createBoundHandler, createBoundServerActionHandler, generateKey, generateKeys, isActionBinding, isExpression, isStaticNode, jsonToJsx, jsxToJson, nodeNeedsClient, renderNode, resolveExpression, resolveHandler, resolveProps, safeEval, validateRegistry };
