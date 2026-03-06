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
import { analyzeTree } from '@/lib/next-json-component';
import type { JsonASTNode, ActionRegistry } from '@/lib/next-json-component';

// ---------------------------------------------------------------------------
// Action Registry — logic stays in code, never in JSON
// ---------------------------------------------------------------------------

const counterRegistry: ActionRegistry = {
  increment: (state, setState) => {
    setState({ count: (state.count as number) + 1 });
  },
  decrement: (state, setState) => {
    setState({ count: Math.max(0, (state.count as number) - 1) });
  },
  reset: (_state, setState) => {
    setState({ count: 0 });
  },
};

// ---------------------------------------------------------------------------
// JSON AST Template — pretend this came from CMS
// ---------------------------------------------------------------------------

const counterTemplate: JsonASTNode = {
  type: 'div',
  props: { className: 'counter-widget' },
  children: [
    // Main count display
    {
      type: 'div',
      props: { className: 'counter-display' },
      children: ['{{ state.count }}'],
    },

    // Buttons
    {
      type: 'div',
      props: { className: 'counter-btns' },
      children: [
        {
          type: 'button',
          props: {
            className: 'btn-counter btn-counter-secondary',
            onClick: { action: 'decrement' },
            title: '減少',
          },
          children: ['−'],
        },
        {
          type: 'button',
          props: {
            className: 'btn-counter btn-counter-primary',
            onClick: { action: 'increment' },
            title: '增加',
          },
          children: ['+'],
        },
      ],
    },

    // Reset button
    {
      type: 'button',
      props: { className: 'btn-reset', onClick: { action: 'reset' } },
      children: ['重設'],
    },

    // Milestone — $if conditional
    {
      type: 'p',
      props: { className: 'milestone' },
      $if: '{{ state.count >= 10 }}',
      children: ['🎉 恭喜達到 10！'],
    },

    // Info
    {
      type: 'p',
      props: { className: 'counter-info' },
      children: ['由 Zustand ({{ state.count >= 0 ? "scoped store" : "" }}) 驅動'],
    },
  ],
};

const analyzedTemplate = analyzeTree(counterTemplate);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DemoCounter() {
  return (
    <ClientJsonHydrator
      template={analyzedTemplate}
      options={{
        actionRegistry: counterRegistry,
        initialState: { count: 0 },
      }}
    />
  );
}
