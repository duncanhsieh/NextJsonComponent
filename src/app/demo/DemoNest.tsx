'use client';

/**
 * DemoNest.tsx
 *
 * Demonstrates CMS-style JsonASTNode component composition:
 *   - PureJsonComponent: stateless, renders props + $slot children
 *   - createJsonComponent: stateful (Zustand), with actions + $slot
 *   - Both composed inside a ReactJsonRenderer page template
 */

import React from 'react';
import { ReactJsonRenderer } from '@/lib/next-json-component/react';
import { PureJsonComponent, createJsonComponent } from '@/lib/next-json-component/react';
import type { JsonASTNode, ActionRegistry } from '@/lib/next-json-component';

// ---------------------------------------------------------------------------
// 1. CMS-defined "Title" component — PureJsonComponent
//    Renders an <h2> with a CSS class and passes children through $slot.
// ---------------------------------------------------------------------------

const Title = PureJsonComponent({
  type: 'h2',
  props: {
    style: {
      fontSize: '1.4rem',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      marginBottom: '12px',
      borderBottom: '2px solid var(--accent)',
      paddingBottom: '8px',
    },
  },
  children: [{ type: '$slot' }],
});

// ---------------------------------------------------------------------------
// 2. CMS-defined "InfoCard" — PureJsonComponent with props
//    Reads `props.label` and passes children to $slot body.
// ---------------------------------------------------------------------------

const InfoCard = PureJsonComponent({
  type: 'div',
  props: {
    style: {
      background: 'rgba(124, 58, 237, 0.05)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '20px 24px',
      marginBottom: '16px',
    },
  },
  children: [
    {
      type: 'div',
      props: {
        style: {
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--accent)',
          marginBottom: '8px',
        },
      },
      children: ['{{ props.label }}'],
    },
    { type: '$slot' },
  ],
});

// ---------------------------------------------------------------------------
// 3. CMS-defined "MiniCounter" — createJsonComponent (has Zustand state)
//    Internal state + actions, with an optional label from props.
// ---------------------------------------------------------------------------

const counterRegistry: ActionRegistry = {
  inc: (state, setState) => setState({ n: (state.n as number) + 1 }),
  dec: (state, setState) => setState({ n: Math.max(0, (state.n as number) - 1) }),
};

const MiniCounter = createJsonComponent(
  {
    type: 'div',
    props: { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
    children: [
      {
        type: 'span',
        props: { style: { color: 'var(--text-muted)', fontSize: '0.9rem' } },
        children: ['{{ props.label }}'],
      },
      {
        type: 'button',
        props: {
          onClick: { action: 'dec' },
          style: {
            width: '28px', height: '28px', borderRadius: '50%',
            border: '1px solid var(--border)', cursor: 'pointer',
            background: 'var(--bg-input)', color: 'var(--text)',
          },
        },
        children: ['−'],
      },
      {
        type: 'span',
        props: { style: { fontWeight: '700', fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' } },
        children: ['{{ state.n }}'],
      },
      {
        type: 'button',
        props: {
          onClick: { action: 'inc' },
          style: {
            width: '28px', height: '28px', borderRadius: '50%',
            border: '1px solid var(--border)', cursor: 'pointer',
            background: 'var(--bg-input)', color: 'var(--text)',
          },
        },
        children: ['+'],
      },
    ],
  },
  { initialState: { n: 0 }, actionRegistry: counterRegistry },
);

// ---------------------------------------------------------------------------
// Page-level template — uses Title, InfoCard, MiniCounter as components
// ---------------------------------------------------------------------------

const pageTemplate: JsonASTNode = {
  type: 'div',
  children: [
    // PureJsonComponent with children passed as $slot
    {
      type: 'Title',
      children: ['🧩 CMS 組件組合（JsonASTNode Composition）'],
    },

    // InfoCard with label prop + children in $slot
    {
      type: 'InfoCard',
      props: { label: 'PureJsonComponent' },
      children: [
        {
          type: 'p',
          props: { style: { fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 } },
          children: [
            'Title 和 InfoCard 都是用 ',
            { type: 'code', children: ['PureJsonComponent()'] },
            ' 從 JsonASTNode 建立的無狀態組件，透過 ',
            { type: 'code', children: ['$slot'] },
            ' 渲染外部傳入的 children。',
          ],
        },
      ],
    },

    // InfoCard with MiniCounter inside — createJsonComponent
    {
      type: 'InfoCard',
      props: { label: 'createJsonComponent（含 Zustand State）' },
      children: [
        {
          type: 'p',
          props: { style: { fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' } },
          children: ['MiniCounter 由 createJsonComponent() 建立，擁有獨立的 Zustand store：'],
        },
        {
          type: 'MiniCounter',
          props: { label: '數量：' },
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Demo wrapper
// ---------------------------------------------------------------------------

export function DemoNest() {
  return (
    <ReactJsonRenderer
      template={pageTemplate}
      options={{
        components: {
          Title: Title as any,
          InfoCard: InfoCard as any,
          MiniCounter: MiniCounter as any,
        },
      }}
    />
  );
}
