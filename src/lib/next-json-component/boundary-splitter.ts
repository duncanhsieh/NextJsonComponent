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

import type { AnalyzedNode, JsonPropValue } from './types';

// {{ }} regex — same as expression-resolver
const EXPR_RE = /\{\{[\s\S]+?\}\}/;

/**
 * Check if a prop value makes the node require a client boundary.
 */
function propNeedsClient(value: JsonPropValue): boolean {
  if (typeof value === 'string') {
    return EXPR_RE.test(value);
  }
  // ActionBinding
  if (typeof value === 'object' && value !== null && 'action' in value) {
    return true;
  }
  return false;
}

/**
 * Determine whether the given analyzed node requires client-side rendering.
 */
export function nodeNeedsClient(node: AnalyzedNode): boolean {
  // Static nodes never need client
  if (node.isStatic) return false;

  // Directives — dynamic conditional / list rendering
  if (node.$if !== undefined || node.$each !== undefined) return true;

  // Dynamic props (expressions or action bindings)
  if (node.props) {
    for (const value of Object.values(node.props)) {
      if (propNeedsClient(value)) return true;
    }
  }

  // Dynamic text children
  if (node.children) {
    for (const child of node.children) {
      if (typeof child === 'string' && EXPR_RE.test(child)) return true;
      if (typeof child !== 'string' && nodeNeedsClient(child)) return true;
    }
  }

  return false;
}

/**
 * The result of boundary analysis on an AST.
 * Contains the original node annotated with `_needsClient` flags.
 */
export interface AnnotatedNode extends AnalyzedNode {
  /** Whether this specific node (root of a subtree) needs client rendering. */
  _needsClient?: boolean;
  children?: (AnnotatedNode | string)[];
}

/**
 * Walk the entire AST and annotate each node with `_needsClient`.
 * This annotation is used by ServerJsonComponent to decide rendering strategy.
 */
export function annotateBoundaries(node: AnalyzedNode): AnnotatedNode {
  const annotatedChildren: (AnnotatedNode | string)[] =
    node.children?.map((child) => {
      if (typeof child === 'string') return child;
      return annotateBoundaries(child);
    }) ?? [];

  const needsClient = nodeNeedsClient(node);

  return {
    ...node,
    children: annotatedChildren,
    _needsClient: needsClient,
  } as AnnotatedNode;
}
