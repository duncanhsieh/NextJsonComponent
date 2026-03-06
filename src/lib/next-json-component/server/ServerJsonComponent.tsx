/**
 * ServerJsonComponent.tsx
 *
 * The RSC (React Server Component) entry point for NextJsonComponent.
 *
 * Responsibilities:
 *   - Accepts a JSON AST template and options from the server (page/layout).
 *   - Pre-processes the AST: static analysis + boundary annotation.
 *   - Delegates to ServerActionHydrator (which handles Server Actions state).
 *
 * NOTE: This file must NOT contain 'use client'.
 */

import React from 'react';
import type { JsonASTNode, NextJsonComponentOptions } from '../types';
import { ServerActionHydrator } from '../client/server-action-bridge';
import { analyzeTree } from '../static-analyzer';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ServerJsonComponentProps {
  /** The JSON AST template from CMS or database. */
  template: JsonASTNode;
  /** Configuration: components, actionRegistry, serverActions, initialState. */
  options?: NextJsonComponentOptions;
  /** Additional props passed through to actions and expressions as `props`. */
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * NextJsonComponent — Server Component entry point.
 */
export async function NextJsonComponent({
  template,
  options = {},
  ...rest
}: ServerJsonComponentProps): Promise<React.ReactElement> {
  // --- Validate template ---
  if (!template || typeof template !== 'object') {
    console.error('[NextJsonComponent] Invalid template: must be a non-null object.');
    return <div className="njc-error">NextJsonComponent: Invalid template.</div>;
  }

  // --- Pre-process the AST on the server ---
  const analyzedTemplate = analyzeTree(template);

  // Collect component props from rest
  const componentProps = rest as Record<string, unknown>;

  // --- Hand off to client hydrator (via ServerActionHydrator bridge) ---
  const clientOptions: NextJsonComponentOptions = {
    initialState: options.initialState,
    components: options.components,
    actionRegistry: options.actionRegistry,
    serverActions: options.serverActions,
  };

  return (
    <ServerActionHydrator
      template={analyzedTemplate}
      options={clientOptions}
      componentProps={componentProps}
    />
  );
}
