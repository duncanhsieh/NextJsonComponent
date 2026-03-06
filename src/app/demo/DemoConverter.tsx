'use client';

/**
 * DemoConverter.tsx
 *
 * Live JSX ↔ JSON AST converter playground.
 * Calls the /api/convert route handler (server-side Babel) to avoid
 * bundling Babel parser in the client bundle.
 *
 * Modes:
 *   - JSX → JSON  (paste JSX, get JSON AST)
 *   - JSON → JSX  (paste JSON AST, get formatted JSX)
 */

import { useState, useTransition } from 'react';

// ---------------------------------------------------------------------------
// Default samples
// ---------------------------------------------------------------------------

const JSX_SAMPLE = `<div className={state.theme}>
  <h2>Hello, {state.name}!</h2>
  <p>{state.count > 0 ? \`Count: \${state.count}\` : 'Start counting'}</p>
  <div className="actions">
    <button onClick={() => increment()}>+</button>
    <button onClick={() => decrement()}>−</button>
    <button onClick={() => reset()}>Reset</button>
  </div>
  <ul>
    <li $each={state.items} $as="item" $key={item.id}>
      {item.label}
    </li>
  </ul>
</div>`;

const JSON_SAMPLE = `{
  "type": "div",
  "props": { "className": "{{ state.theme }}" },
  "children": [
    {
      "type": "h2",
      "children": ["Hello, {{ state.name }}!"]
    },
    {
      "type": "button",
      "props": {
        "onClick": { "action": "increment" }
      },
      "children": ["+"]
    }
  ]
}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Mode = 'jsx-to-json' | 'json-to-jsx';

export function DemoConverter() {
  const [mode, setMode] = useState<Mode>('jsx-to-json');
  const [input, setInput] = useState(JSX_SAMPLE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setInput(newMode === 'jsx-to-json' ? JSX_SAMPLE : JSON_SAMPLE);
    setOutput('');
    setError('');
  };

  const handleConvert = () => {
    startTransition(async () => {
      setError('');
      setOutput('');
      try {
        const res = await fetch('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, input }),
        });
        const data = await res.json();
        if (data.success) {
          setOutput(data.output);
        } else {
          setError(data.error ?? 'Unknown error');
        }
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputLabel = mode === 'jsx-to-json' ? 'JSX Input' : 'JSON AST Input';
  const outputLabel = mode === 'jsx-to-json' ? 'JSON AST Output' : 'JSX Output';
  const placeholder = mode === 'jsx-to-json'
    ? '<div className="wrapper">\n  <h1>Hello {state.name}</h1>\n</div>'
    : '{\n  "type": "div",\n  "children": ["Hello!"]\n}';

  return (
    <div>
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => handleModeChange('jsx-to-json')}
          className="demo-tab"
          style={{ borderRadius: 8, border: '1px solid var(--border-subtle)' }}
          data-active={mode === 'jsx-to-json'}
        >
          JSX → JSON
        </button>
        <button
          onClick={() => handleModeChange('json-to-jsx')}
          className="demo-tab"
          style={{ borderRadius: 8, border: '1px solid var(--border-subtle)' }}
          data-active={mode === 'json-to-jsx'}
        >
          JSON → JSX
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center', marginLeft: 8 }}>
          由 Babel Parser 驅動 · 安全在伺服器端執行
        </span>
      </div>

      <div className="converter-grid">
        {/* Input */}
        <div className="converter-panel">
          <label className="converter-label">{inputLabel}</label>
          <textarea
            className="converter-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
          />
        </div>

        {/* Arrow Button */}
        <div className="converter-arrow-wrap">
          <button
            className="converter-arrow-btn"
            onClick={handleConvert}
            disabled={isPending}
            title="Convert"
          >
            {isPending ? '⟳' : '→'}
          </button>
        </div>

        {/* Output */}
        <div className="converter-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="converter-label">{outputLabel}</label>
            {output && (
              <button className="converter-copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <div className={`converter-output${error ? ' converter-error' : ''}`}>
            {error
              ? `⚠ ${error}`
              : output || <span style={{ color: 'var(--text-muted)' }}>點擊 → 開始轉換</span>}
          </div>
        </div>
      </div>

      <div className="info-box">
        <strong>小提示：</strong>{' '}
        {mode === 'jsx-to-json'
          ? '支援 JSX Spread Attributes ({...props})、Arrow Function Event Handlers、Template Literals 和 Fragments (<></>)。'
          : '輸入合法的 NextJsonComponent JSON AST，將自動產生格式化的 JSX 代碼，包含 ActionBinding、$if/$each 指令轉換。'}
      </div>
    </div>
  );
}
