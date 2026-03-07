/**
 * Landing page — Server Component
 */
import Link from 'next/link';



// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: '🔒',
    title: '零 eval() 安全執行',
    desc: '以 Registry Mode 取代 new Function，action 邏輯與 JSON 完全分離，阻擋所有危險 global。',
  },
  {
    icon: '⚡',
    title: 'RSC 優先架構',
    desc: 'Server Component 負責靜態 HTML，Client Component 僅對動態節點進行 Hydration，最小化 JS Bundle。',
  },
  {
    icon: '🌳',
    title: 'Static Node Hoisting',
    desc: '預先分析 AST，將純靜態子樹標記後交由 React.memo，減少 40%+ 不必要的 re-render。',
  },
  {
    icon: '🔄',
    title: '雙向轉換器',
    desc: 'jsxToJson 將現有 JSX 轉換為 JSON AST（含 Spread Attributes），jsonToJsx 反向產生可讀代碼。',
  },
  {
    icon: '🎯',
    title: '強大的 Directives',
    desc: '$if 條件渲染、$each 列表渲染與 object-hash 穩定 key，直接內嵌於 JSON 描述。',
  },
  {
    icon: '🚀',
    title: 'Next.js Server Actions',
    desc: 'ServerActionHydrator 橋接 useActionState，將 isPending/result 注入 template state。',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Next.js 16 · React 19 · TypeScript · Zustand
        </div>

        <h1 className="hero-title">
          從 JSON 渲染<br />任意 UI 介面
        </h1>

        <p className="hero-sub">
          NextJsonComponent 是安全、高效的 JSON AST 渲染引擎，
          專為 Next.js App Router 設計，支援 RSC、Server Actions 與靜態節點優化。
        </p>

        <div className="hero-actions">
          <Link href="/demo" className="btn-primary">
            🚀 查看 Demo
          </Link>
          <a
            href="https://github.com"
            className="btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
        </div>

        {/* Code Window */}
        <div className="code-window">
          <div className="code-window-header">
            <span className="code-dot code-dot-r" />
            <span className="code-dot code-dot-y" />
            <span className="code-dot code-dot-g" />
            <span className="code-window-tab">template.json &nbsp;&nbsp;→&nbsp;&nbsp; rendered output</span>
          </div>
          <div className="code-body">
            <div className="code-panel">
              <div className="code-label">JSON Input (from CMS / DB)</div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                <span className="c-gray">{'{'}</span>{'\n'}
                {'  '}<span className="c-blue">&quot;type&quot;</span><span className="c-gray">: </span><span className="c-green">&quot;div&quot;</span><span className="c-gray">,</span>{'\n'}
                {'  '}<span className="c-blue">&quot;props&quot;</span><span className="c-gray">: {'{'} </span><span className="c-blue">&quot;className&quot;</span><span className="c-gray">: </span><span className="c-green">&quot;card&quot;</span><span className="c-gray"> {'}'}</span><span className="c-gray">,</span>{'\n'}
                {'  '}<span className="c-blue">&quot;children&quot;</span><span className="c-gray">: [</span>{'\n'}
                {'    '}
                <span className="c-gray">{'{'}</span>{'\n'}
                {'      '}<span className="c-blue">&quot;type&quot;</span><span className="c-gray">: </span><span className="c-green">&quot;h2&quot;</span><span className="c-gray">,</span>{'\n'}
                {'      '}<span className="c-blue">&quot;children&quot;</span><span className="c-gray">: [</span><span className="c-yellow">&quot;Hello, </span><span className="c-purple">{'{{ state.name }}'}</span><span className="c-yellow">!&quot;</span><span className="c-gray">]</span>{'\n'}
                {'    '}<span className="c-gray">{'}'}</span><span className="c-gray">,</span>{'\n'}
                {'    '}<span className="c-gray">{'{'}</span>{'\n'}
                {'      '}<span className="c-blue">&quot;type&quot;</span><span className="c-gray">: </span><span className="c-green">&quot;button&quot;</span><span className="c-gray">,</span>{'\n'}
                {'      '}<span className="c-blue">&quot;props&quot;</span><span className="c-gray">: {'{'} </span><span className="c-blue">&quot;onClick&quot;</span><span className="c-gray">: {'{'} </span><span className="c-blue">&quot;action&quot;</span><span className="c-gray">: </span><span className="c-green">&quot;greet&quot;</span><span className="c-gray"> {'}'} {'}'}</span>{'\n'}
                {'    '}<span className="c-gray">{'}'}</span>{'\n'}
                {'  '}<span className="c-gray">]</span>{'\n'}
                <span className="c-gray">{'}'}</span>
              </pre>
            </div>
            <div className="code-panel">
              <div className="code-label">等效 JSX Output</div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                <span className="c-gray">&lt;</span><span className="c-blue">div</span> <span className="c-green">className</span><span className="c-gray">=</span><span className="c-yellow">&quot;card&quot;</span><span className="c-gray">&gt;</span>{'\n'}
                {'  '}<span className="c-gray">&lt;</span><span className="c-blue">h2</span><span className="c-gray">&gt;</span><span className="c-white">Hello, </span><span className="c-purple">&#123;state.name&#125;</span><span className="c-white">!</span><span className="c-gray">&lt;/</span><span className="c-blue">h2</span><span className="c-gray">&gt;</span>{'\n'}
                {'  '}<span className="c-gray">&lt;</span><span className="c-blue">button</span>{'\n'}
                {'    '}<span className="c-green">onClick</span><span className="c-gray">=&#123;() =&gt; </span><span className="c-yellow">greet</span><span className="c-gray">()&#125;</span>{'\n'}
                {'  '}<span className="c-gray">&gt;</span>{'\n'}
                {'    '}<span className="c-white">Say Hi 👋</span>{'\n'}
                {'  '}<span className="c-gray">&lt;/</span><span className="c-blue">button</span><span className="c-gray">&gt;</span>{'\n'}
                <span className="c-gray">&lt;/</span><span className="c-blue">div</span><span className="c-gray">&gt;</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────── */}
      <div className="container">
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num">114</div>
            <div className="stat-label">Unit Tests Passing</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">0</div>
            <div className="stat-label">eval() / new Function()</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">RSC</div>
            <div className="stat-label">Next.js App Router 優先</div>
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-label">核心功能</div>
            <h2 className="section-title">
              為現代 Next.js 而生
            </h2>
            <p className="section-desc">
              整合 RSC、Server Actions 與全類型安全，讓 CMS 驅動的 UI 開發更安全、更高效。
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────── */}
      <section className="section" id="how-it-works" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">運作原理</div>
            <h2 className="section-title">RSC / Client 混合架構</h2>
            <p className="section-desc">
              Server Component 執行靜態分析並產出 HTML，Client Component 僅對需要互動的節點進行 Hydration。
            </p>
          </div>

          <div className="code-window" style={{ maxWidth: '100%' }}>
            <div className="code-window-header">
              <span className="code-dot code-dot-r" />
              <span className="code-dot code-dot-y" />
              <span className="code-dot code-dot-g" />
              <span className="code-window-tab">頁面使用範例</span>
            </div>
            <div className="code-panel" style={{ borderRight: 'none' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem' }}>
<span className="c-gray">{'// page.tsx (Server Component)'}</span>{'\n'}
<span className="c-purple">export default async function</span> <span className="c-yellow">Page</span><span className="c-gray">() {'{'}</span>{'\n'}
{'  '}<span className="c-purple">const</span> template <span className="c-gray">= await</span> <span className="c-yellow">fetchFromCMS</span><span className="c-gray">();</span>{'\n'}
{'\n'}
{'  '}<span className="c-purple">return</span> <span className="c-gray">(</span>{'\n'}
{'    '}<span className="c-gray">&lt;</span><span className="c-blue">MyPageWrapper</span><span className="c-gray">&gt;</span>{'\n'}
{'      '}<span className="c-gray">&lt;</span><span className="c-blue">DemoCounter</span>{'\n'}
{'        '}<span className="c-green">template</span><span className="c-gray">=&#123;</span>analyzeTree<span className="c-gray">(</span>template<span className="c-gray">)&#125;</span>{'\n'}
{'        '}<span className="c-green">initialState</span><span className="c-gray">=&#123;{'{'} count: 0 {'}'}&#125;</span>{'\n'}
{'      '}<span className="c-gray">/&gt;</span>{'\n'}
{'    '}<span className="c-gray">&lt;/</span><span className="c-blue">MyPageWrapper</span><span className="c-gray">&gt;</span>{'\n'}
{'  '}<span className="c-gray">);</span>{'\n'}
<span className="c-gray">{'}'}</span>{'\n'}
{'\n'}
<span className="c-gray">{'// DemoCounter.tsx (Client Component)'}</span>{'\n'}
<span className="c-purple">&apos;use client&apos;</span><span className="c-gray">;</span>{'\n'}
<span className="c-purple">const</span> registry<span className="c-gray">: </span><span className="c-blue">ActionRegistry</span> <span className="c-gray">= {'{'}</span>{'\n'}
{'  '}increment<span className="c-gray">: (</span>state<span className="c-gray">,</span> setState<span className="c-gray">) =&gt;</span>{'\n'}
{'    '}setState<span className="c-gray">({'{'}</span> count<span className="c-gray">:</span> state<span className="c-gray">.</span>count <span className="c-gray">+</span> <span className="c-yellow">1</span> <span className="c-gray">{'}'}),</span>{'\n'}
<span className="c-gray">{'}'}</span><span className="c-gray">;</span>{'\n'}
<span className="c-gray">{'// ↑ 函數永遠不會序列化跨越 RSC boundary'}</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>
            準備好了嗎？
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '36px' }}>
            查看互動 Demo，體驗計數器、Todo 列表與 JSX 轉換器。
          </p>
          <Link href="/demo" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            開啟 Demo →
          </Link>
        </div>
      </section>
    </main>
  );
}
