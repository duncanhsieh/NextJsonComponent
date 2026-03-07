'use client';

/**
 * DemoCounter.tsx
 *
 * Demonstrates core NextJsonComponent with Zustand state:
 *   - {{ }} expression interpolation in text and class props
 *   - $if conditional rendering
 *   - ActionRegistry (increment / decrement / reset)
 */

import { ClientJsonHydrator } from '@/lib/next-json-component/client';
import type { AnalyzedNode, ActionRegistry } from '@/lib/next-json-component';

// ---------------------------------------------------------------------------
// Action Registry — logic stays in code, never in JSON
// ---------------------------------------------------------------------------

const counterRegistry: ActionRegistry = {
  increment: (state, setState) => {
    setState((prev) => ({ count: (prev.count as number) + 1 }));
  },
  decrement: (state, setState) => {
    setState((prev) => ({ count: Math.max(0, (prev.count as number) - 1) }));
  },
  reset: (_state, setState) => {
    setState({ count: 0 });
  },
};

export function DemoCounter({ template }: { template: AnalyzedNode }) {
  return (
    <ClientJsonHydrator
      template={template}
      options={{
        actionRegistry: counterRegistry,
        initialState: { count: 0 },
      }}
    />
  );
}
