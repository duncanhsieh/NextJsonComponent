/**
 * app/demo/page.tsx — Interactive Demo Hub
 */

import { DemoTabs } from './DemoTabs';
import { DemoCounter } from './DemoCounter';
import { DemoTodoList } from './DemoTodoList';
import { DemoConverter } from './DemoConverter';
import { DemoHeadlessUI } from './DemoHeadlessUI';
import { DemoNest } from './DemoNest';
import { NextJsonComponent } from '@/lib/next-json-component/server';
import { analyzeTree } from '@/lib/next-json-component';
import { submitDemoAction } from './actions';
import { counterTemplate, todoTemplate, headlessUITemplate } from './templates';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo — NextJsonComponent',
  description: '互動式 Demo：RSC 渲染、Server Actions 整合與自動狀態同步。',
};

// ---------------------------------------------------------------------------
// RSC Demo Template
// ---------------------------------------------------------------------------

const RSC_TEMPLATE: any = {
  type: 'div',
  props: {
    style: {
      background: 'rgba(124, 58, 237, 0.05)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '32px',
      maxWidth: '500px',
      margin: '0 auto',
    },
  },
  children: [
    {
      type: 'h3',
      props: { style: { marginBottom: '8px', fontSize: '1.25rem' } },
      children: ['📩 伺服器端渲染 (RSC) + Server Actions'],
    },
    {
      type: 'p',
      props: { style: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' } },
      children: ['此區塊透過 ServerJsonComponent 渲染。點擊按鈕將觸發 Next.js Server Action，狀態（Pending/Result）會自動同步。'],
    },
    {
      type: 'div',
      props: { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      children: [
        {
          type: 'button',
          props: {
            onClick: { action: 'submit', serverAction: true },
            disabled: '{{ state._actions.submit.isPending }}',
            style: {
              padding: '12px',
              borderRadius: 'var(--r-md)',
              background: 'var(--accent)',
              color: 'white',
              fontWeight: '600',
              opacity: '{{ state._actions.submit.isPending ? 0.6 : 1 }}',
              cursor: '{{ state._actions.submit.isPending ? "not-allowed" : "pointer" }}',
              border: 'none',
              width: '100%',
            },
          },
          children: ["{{ state._actions.submit.isPending ? '⏳ 正在聯絡伺服器...' : '發送 Server Action' }}"],
        },
      ],
    },
    {
      type: 'div',
      $if: '{{ state._actions.submit.result?.success }}',
      props: {
        style: {
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(74, 222, 128, 0.12)',
          border: '1px solid rgba(74, 222, 128, 0.25)',
          borderRadius: 'var(--r-md)',
          color: 'var(--green)',
          fontSize: '0.95rem',
          textAlign: 'center',
          animation: 'fade-in 0.3s ease-out',
        },
      },
      children: [
        { type: 'strong', children: ['✅ 執行成功！'] },
        { type: 'div', props: { style: { marginTop: '4px' } }, children: ['{{ state._actions.submit.result.message }}'] },
        {
          type: 'div',
          props: { style: { fontSize: '0.75rem', marginTop: '8px', opacity: 0.7 } },
          children: ['最後更新：{{ state._actions.submit.result.timestamp }}'],
        },
      ],
    },
  ],
};

const COUNTER_AST_PREVIEW = JSON.stringify(
  {
    type: 'button',
    props: { className: 'btn-counter-primary', onClick: { action: 'increment' } },
    children: ['+'],
  },
  null,
  2,
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DemoPage() {
  // Pre-analyze templates on the server
  const analyzedCounter = analyzeTree(counterTemplate);
  const analyzedTodo = analyzeTree(todoTemplate);
  const analyzedHeadlessUI = analyzeTree(headlessUITemplate);

  return (
    <main>
      <div className="container section">
        <div className="section-header" style={{ marginBottom: 40 }}>
          <div className="section-label">互動式展示</div>
          <h1 className="section-title">NextJsonComponent Demo</h1>
          <p className="section-desc">
            由 JSON AST 驅動的動態介面。體驗 RSC 渲染、Server Actions 整合與自動狀態同步。
          </p>
        </div>

        <DemoTabs
          tabs={[
            {
              id: 'counter',
              icon: '🔢',
              label: '計數器',
              content: (
                <div>
                  <DemoCounter template={analyzedCounter} />
                  <div className="divider" />
                  <div>
                    <div className="section-label" style={{ marginBottom: 12 }}>對應的 JSON AST 片段</div>
                    <div
                      style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--r-md)',
                        padding: '16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        lineHeight: 1.7,
                        color: 'var(--text-dim)',
                        whiteSpace: 'pre',
                        overflowX: 'auto',
                      }}
                    >
                      {COUNTER_AST_PREVIEW}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'todo',
              icon: '✅',
              label: '待辦清單',
              content: <DemoTodoList template={analyzedTodo} />,
            },
            {
              id: 'rsc',
              icon: '☁️',
              label: 'RSC 渲染',
              content: (
                <div>
                  <Suspense fallback={<div style={{ padding: 20 }}>載入中...</div>}>
                    <NextJsonComponent
                      template={RSC_TEMPLATE}
                      options={{
                        serverActions: { submit: submitDemoAction },
                      }}
                    />
                  </Suspense>
                  <div className="info-box" style={{ marginTop: 32 }}>
                    <strong>Server-Side 優勢：</strong>{' '}
                    此標籤內容透過 <code>ServerJsonComponent</code> 預分析，首屏 HTML 在伺服器生成。
                    透過 <code>serverActions</code> 設定，
                    <code>isPending</code> 與 <code>result</code> 會自動同步到 JSON state 中（支援 <code>?.</code> 可選鏈式讀取），
                    無需手動撰寫複雜的 <code>useActionState</code> 邏輯。
                  </div>
                </div>
              ),
            },
            {
              id: 'converter',
              icon: '🔄',
              label: 'JSX ↔ JSON 轉換器',
              content: <DemoConverter />,
            },
            {
              id: 'headlessui',
              icon: '🧩',
              label: 'Headless UI',
              content: <DemoHeadlessUI template={analyzedHeadlessUI} />,
            },
            {
              id: 'nest',
              icon: '🏗️',
              label: 'CMS 組件組合',
              content: <DemoNest />,
            },
          ]}
        />

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          所有狀態由 Zustand scoped store 管理，同步由 ServerActionHydrator 驅動。
        </p>
      </div>
    </main>
  );
}
