import { a as ActionBinding, R as RenderContext, c as JsonPropValue, J as JsonASTNode, A as AnalyzedNode, b as ActionRegistry } from './types-C1ZzHgkh.js';

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

export { SafeEvalError as S, UnregisteredActionError as U, analyzeNode as a, analyzeTree as b, createBoundHandler as c, createBoundServerActionHandler as d, isExpression as e, isStaticNode as f, resolveHandler as g, resolveProps as h, isActionBinding as i, resolveExpression as r, safeEval as s, validateRegistry as v };
