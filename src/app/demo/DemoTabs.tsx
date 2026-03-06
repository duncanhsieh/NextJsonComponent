'use client';

/**
 * DemoTabs.tsx — Tab controller for the Demo page.
 *
 * Receives pre-rendered tab content as React children and handles
 * client-side tab switching.
 */

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon: string;
  content: React.ReactNode;
}

export function DemoTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');

  const current = tabs.find((t) => t.id === active);

  return (
    <div className="demo-shell">
      <div className="demo-tab-bar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            className={`demo-tab${tab.id === active ? ' active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            <span className="demo-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="demo-content" role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
