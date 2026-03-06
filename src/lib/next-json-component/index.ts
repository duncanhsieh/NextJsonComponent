/**
 * index.ts — Unified public API (for non-RSC / testing contexts).
 *
 * NOTE: In Next.js App Router, prefer importing from:
 *   - '@/lib/next-json-component/server' for RSC pages
 *   - '@/lib/next-json-component/client' for explicit client components
 */

// Types
export type {
  JsonASTNode,
  AnalyzedNode,
  ActionBinding,
  JsonPropValue,
  ActionRegistry,
  RegistryAction,
  SetStateFn,
  ScopedStoreState,
  NextJsonComponentOptions,
  RenderContext,
} from './types';

// Core utilities
export { safeEval, SafeEvalError } from './safe-evaluator';
export { resolveExpression, resolveProps, isActionBinding, isExpression } from './expression-resolver';
export { analyzeTree, analyzeNode, isStaticNode } from './static-analyzer';
export { generateKey, generateKeys } from './key-generator';
export { annotateBoundaries, nodeNeedsClient } from './boundary-splitter';
export { renderNode } from './node-renderer';
export {
  createBoundHandler,
  createBoundServerActionHandler,
  resolveHandler,
  validateRegistry,
  UnregisteredActionError,
} from './action-registry';

// Phase 3 — Converters
export { jsxToJson } from './converters/jsx-to-json';
export { jsonToJsx } from './converters/json-to-jsx';
export type { JsxToJsonOptions } from './converters/jsx-to-json';
export type { JsonToJsxOptions } from './converters/json-to-jsx';
