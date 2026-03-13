# NextJsonComponent — Next.js Usage Guide

> **Target audience**: AI Code Agents and developers who want to use `NextJsonComponent` in a **Next.js App Router** environment with React Server Components (RSC), Server Actions, and CMS-backed page rendering.

---

## 1. Overview

`NextJsonComponent` is a **JSON AST → React UI** rendering engine designed natively for **Next.js App Router**. It bridges the gap between a headless CMS (which stores UI structure as JSON) and a Next.js application (which needs that structure rendered as fast, SEO-friendly HTML).

**The full data flow:**

```
CMS / Database
     │  JSON AST (stored as data, not code)
     ↓
NextJsonComponent (RSC — Server Component)
     ├─ analyzeTree()          static optimization pass
     ├─ SSR: pure HTML rendered by React on the server
     └─ ServerActionHydrator   ('use client' boundary)
              ├─ ClientJsonHydrator    Zustand store + event handlers
              └─ Server Action bridge  useTransition + isPending sync
                       ↓
               Interactive React UI in the browser
```

**Key benefits:**
- **SEO-friendly**: full HTML on first load, no client JS needed for initial render
- **No hydration mismatch**: static parts rendered on server, dynamic parts hydrated cleanly
- **CMS-driven**: store entire page layouts as JSON in your database or CMS
- **Secure**: no `eval` / `new Function`; all action logic stays in code
- **Server Actions**: first-class support for `isPending`, `result`, `error` in templates

---

## 2. Installation & Entry Points

The library exposes **three separate entry points** to respect Next.js module boundary rules:

| Entry | Use in | Contains |
|-------|--------|----------|
| `next-json-component/server` | RSC (`app/page.tsx`, `app/layout.tsx`) | `NextJsonComponent`, `getTemplate`, `createTemplateFetcher` |
| `next-json-component/react` | Client Components (`'use client'`) | `ReactJsonRenderer`, `PureJsonComponent`, `createJsonComponent` |
| `next-json-component` (main) | Utilities, tests, type imports | Types, converters, core utilities, factories |

> [!IMPORTANT]
> **Never import `next-json-component/react` or client hooks directly inside an RSC file.** Use the `server` entry point in RSC files.

---

## 3. `JsonASTNode` — The Data Schema

Every piece of UI is described by a `JsonASTNode`. This is the JSON you store in your CMS or database.

```typescript
interface JsonASTNode {
  type: string;                                    // HTML tag OR component name
  props?: Record<string, JsonPropValue>;           // attributes / component props
  children?: (JsonASTNode | string)[];             // nested nodes or text

  // Directives
  $if?: string;       // "{{ expr }}" — renders node only if truthy
  $each?: string;     // "{{ expr }}" — expression resolving to an array
  $key?: string;      // stable key per iteration item
  $as?: string;       // loop variable name (default: "item")
  $indexAs?: string;  // index variable name (default: "index")
}

type JsonPropValue =
  | string          // may contain {{ expr }}
  | number
  | boolean
  | null
  | ActionBinding   // { action: "name", args?: [...], serverAction?: true }
  | Record<string, unknown>; // nested object (e.g. inline style)
```

---

## 4. Basic Usage — Rendering a CMS Page

### Minimal setup

```tsx
// app/[slug]/page.tsx
import { NextJsonComponent, getTemplate } from 'next-json-component/server';
import { notFound } from 'next/navigation';

export default async function CmsPage({ params }) {
  const { slug } = await params;

  let template;
  try {
    template = await getTemplate(slug); // cached via unstable_cache
  } catch {
    notFound();
  }

  return (
    <main>
      <NextJsonComponent template={template} />
    </main>
  );
}
```

### `NextJsonComponent` Props

```tsx
<NextJsonComponent
  template={templateFromCms}       // JsonASTNode — required
  options={{
    components: {},                // Custom client components by name
    actionRegistry: {},            // Named action handlers
    serverActions: {},             // Next.js Server Actions by name
    initialState: {},              // Initial Zustand store state
  }}
  someExtraProp="value"            // Any extra props → accessible as {{ props.someExtraProp }}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `template` | `JsonASTNode` | The JSON AST to render |
| `options.components` | `Record<string, ComponentType>` | React components by name |
| `options.actionRegistry` | `ActionRegistry` | Client-side action handlers |
| `options.serverActions` | `Record<string, ServerAction>` | Next.js Server Actions |
| `options.initialState` | `Record<string, unknown>` | Zustand store initial values |
| `...rest` | `any` | Additional props → `{{ props.xxx }}` in template |

---

## 5. Template Fetching & Caching

### Built-in REST Fetcher

```bash
# .env.local
CMS_API_URL=https://your-cms.example.com/api
```

```tsx
import { getTemplate } from 'next-json-component/server';

// GET ${CMS_API_URL}/templates/{slug}
// Cached 60s, invalidated by webhook
const template = await getTemplate('home');
```

### Custom Fetcher (`createTemplateFetcher`)

Wrap any async fetch function (GraphQL, SDK, Firestore, etc.) with `createTemplateFetcher` to get automatic `unstable_cache` integration:

```typescript
import { createTemplateFetcher } from 'next-json-component/server';

// Contentful GraphQL example
export const getTemplate = createTemplateFetcher(async (slug) => {
  const data = await contentfulClient.request(MY_QUERY, { slug });
  return transformToAst(data.page.layout); // → JsonASTNode
});

// With locale context
export const getI18nTemplate = createTemplateFetcher(
  async (slug, ctx: { locale: string }) => {
    const res = await fetch(`https://api.cms.com/${ctx.locale}/pages/${slug}`);
    return (await res.json()).ast;
  },
  {
    revalidate: 300,        // cache for 5 minutes (default: 60s)
    getTags: (id) => [`njc-template:${id}`, 'njc-templates', 'cms-content'],
  }
);

// Usage in page:
const template = await getI18nTemplate('home', { locale: 'zh-TW' });
```

### Cache Invalidation via Webhook

When the CMS publishes new content, it should POST to your webhook endpoint:

```typescript
// app/api/cms-webhook/route.ts
import { revalidateTag } from 'next/cache';
import { templateTag } from 'next-json-component/server';

export async function POST(req: Request) {
  const { templateId } = await req.json();

  // Invalidate only this template's cache entry
  revalidateTag(templateTag(templateId));   // 'njc-template:home'

  // Or bust ALL templates at once:
  // revalidateTag('njc-templates');

  return Response.json({ revalidated: true });
}
```

CMS webhook configuration:
```
POST https://your-site.com/api/cms-webhook
Content-Type: application/json
Authorization: Bearer <WEBHOOK_SECRET>

{ "templateId": "home" }
```

---

## 6. Expression Syntax `{{ }}`

Expressions are evaluated by a **sandboxed resolver** — no `eval`, no `new Function`.

| Expression | Source |
|-----------|--------|
| `{{ state.count }}` | Zustand store |
| `{{ props.username }}` | Extra props passed to `NextJsonComponent` |
| `{{ item.name }}` | `$each` loop variable |
| `{{ index }}` | `$each` loop index |
| `{{ state._actions.submit.isPending }}` | Server Action pending state |
| `{{ state._actions.submit.result?.message }}` | Server Action result |
| `{{ state.count > 0 ? 'yes' : 'no' }}` | Ternary expression |

**Security**: Access to `window`, `document`, `process`, `eval`, `Function`, and `__proto__` is blocked.

---

## 7. State Management

Each `NextJsonComponent` instance gets its own scoped Zustand store:

```tsx
<NextJsonComponent
  template={template}
  options={{
    initialState: {
      count: 0,
      user: { name: 'Guest', role: 'viewer' },
      items: [],
    }
  }}
/>
```

Template reads state with `{{ state.xxx }}`:
```json
{ "type": "span", "children": ["{{ state.user.name }}"] }
```

---

## 8. Action Registry (Client-Side Actions)

Pre-registered JavaScript functions bound to template events.

```tsx
// app/page.tsx (RSC — defines component but not action logic)
import { counterActions } from './actions-registry';  // client module

<NextJsonComponent
  template={template}
  options={{ actionRegistry: counterActions }}
/>
```

```typescript
// actions-registry.ts (can be a client module)
'use client';

import type { ActionRegistry } from 'next-json-component';

export const counterActions: ActionRegistry = {
  increment: (state, setState) => {
    setState({ count: (state.count as number) + 1 });
  },
  reset: (_state, setState) => {
    setState({ count: 0 });
  },
  deleteTodo: (state, setState, _props, id) => {
    setState({ todos: (state.todos as any[]).filter(t => t.id !== id) });
  },
};
```

Template binding:
```json
{
  "type": "button",
  "props": { "onClick": { "action": "increment" } },
  "children": ["+"]
}
```

With dynamic args (resolved at runtime):
```json
{
  "type": "button",
  "props": {
    "onClick": { "action": "deleteTodo", "args": ["{{ item.id }}"] }
  },
  "children": ["Delete"]
}
```

---

## 9. Server Actions

Define Server Actions in a `'use server'` file, then pass them to `options.serverActions`:

```typescript
// app/actions.ts
'use server';

export async function submitForm(data: unknown) {
  await db.save(data);
  return { success: true, message: 'Saved!', timestamp: new Date().toISOString() };
}
```

```tsx
// app/page.tsx (RSC)
import { NextJsonComponent } from 'next-json-component/server';
import { submitForm } from './actions';

export default function Page() {
  return (
    <NextJsonComponent
      template={formTemplate}
      options={{
        serverActions: { submit: submitForm },
      }}
    />
  );
}
```

### How Server Action State Works

When a Server Action is registered, the engine automatically tracks its lifecycle under `state._actions.<name>`:

```typescript
state._actions.submit = {
  isPending: false,   // true while the action is running
  result: null,       // the value returned by the server action
  error: null,        // error message string if it threw
}
```

Reference these in the template:
```json
{
  "type": "button",
  "props": {
    "onClick": { "action": "submit", "serverAction": true },
    "disabled": "{{ state._actions.submit.isPending }}"
  },
  "children": ["{{ state._actions.submit.isPending ? 'Saving...' : 'Save' }}"]
}
```

```json
{
  "type": "div",
  "$if": "{{ state._actions.submit.result?.success }}",
  "children": ["{{ state._actions.submit.result.message }}"]
}
```

> [!NOTE]
> Server Actions use `useTransition` internally (not `useActionState`). Calling the action from an `onClick` handler works correctly: `isPending` signals during the transition, `result` is set on completion.

---

## 10. Directives

### `$if` — Conditional Rendering

```json
{
  "type": "p",
  "$if": "{{ state.user.isAdmin }}",
  "children": ["Admin panel"]
}
```

### `$each` — List Rendering

```json
{
  "type": "li",
  "$each": "{{ state.todos }}",
  "$as": "todo",
  "$key": "{{ todo.id }}",
  "children": [
    {
      "type": "span",
      "children": ["{{ todo.text }}"]
    },
    {
      "type": "button",
      "props": { "onClick": { "action": "toggle", "args": ["{{ todo.id }}"] } },
      "children": ["{{ todo.done ? '✓' : '○' }}"]
    }
  ]
}
```

### `$slot` — Children Passthrough (for CMS component templates)

```json
{
  "type": "article",
  "props": { "className": "card" },
  "children": [
    { "type": "h2", "children": ["{{ props.title }}"] },
    { "type": "$slot" }
  ]
}
```

---

## 11. Custom Components

Pass custom React components (Client Components) by name into `options.components`:

```tsx
// components/cms-components.ts
'use client';

import { PureJsonComponent, createJsonComponent } from 'next-json-component/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Raw React components
export const cmsComponents = {
  Button,
  Badge,

  // CMS-defined stateless component
  SectionTitle: PureJsonComponent({
    type: 'h2',
    props: { className: 'section-title' },
    children: [{ type: '$slot' }],
  }),

  // CMS-defined stateful component
  ReadMoreToggle: createJsonComponent(
    {
      type: 'div',
      children: [
        {
          type: 'button',
          props: { onClick: { action: 'toggle' } },
          children: ["{{ state.open ? 'Read less' : 'Read more' }}"],
        },
        {
          type: 'div',
          $if: '{{ state.open }}',
          children: [{ type: '$slot' }],
        },
      ],
    },
    {
      initialState: { open: false },
      actionRegistry: {
        toggle: (s, set) => set({ open: !s.open }),
      },
    }
  ),
};
```

```tsx
// app/page.tsx (RSC)
import { NextJsonComponent, getTemplate } from 'next-json-component/server';
import { cmsComponents } from '@/components/cms-components';

export default async function Page({ params }) {
  const template = await getTemplate((await params).slug);

  return (
    <NextJsonComponent
      template={template}
      options={{ components: cmsComponents }}
    />
  );
}
```

> [!IMPORTANT]
> **Do not define components inline in RSC.** Functions defined in an RSC body cannot be passed as props to Client Components (they are not serializable). Always import components from a separate `'use client'`-marked module.

---

## 12. Complete Example — CMS Blog Page

### CMS Template (stored in database)

```json
{
  "type": "article",
  "props": { "className": "blog-post" },
  "children": [
    {
      "type": "SectionTitle",
      "children": ["{{ props.title }}"]
    },
    {
      "type": "p",
      "props": { "className": "meta" },
      "children": ["By {{ props.author }} · {{ props.date }}"]
    },
    {
      "type": "div",
      "props": { "className": "body" },
      "children": [
        { "type": "p", "children": ["First paragraph of content..."] },
        {
          "type": "ReadMoreToggle",
          "children": [
            { "type": "p", "children": ["Hidden extended content..."] }
          ]
        }
      ]
    },
    {
      "type": "div",
      "props": { "className": "cta" },
      "children": [
        {
          "type": "Button",
          "props": {
            "onClick": { "action": "subscribe", "serverAction": true },
            "disabled": "{{ state._actions.subscribe.isPending }}"
          },
          "children": ["{{ state._actions.subscribe.isPending ? 'Subscribing...' : 'Subscribe' }}"]
        },
        {
          "type": "div",
          "$if": "{{ state._actions.subscribe.result?.success }}",
          "children": ["✓ Subscribed!"]
        }
      ]
    }
  ]
}
```

### Server Action

```typescript
// app/(blog)/actions.ts
'use server';

export async function subscribe() {
  await new Promise(r => setTimeout(r, 1000)); // simulate API call
  return { success: true };
}
```

### Page Component

```tsx
// app/(blog)/[slug]/page.tsx
import { NextJsonComponent, getTemplate } from 'next-json-component/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cmsComponents } from '@/components/cms-components';
import { subscribe } from '../actions';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  return {
    title: (template.props?.title as string) ?? slug,
    description: template.props?.description as string,
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;

  let template;
  try {
    template = await getTemplate(slug);
  } catch {
    notFound();
  }

  return (
    <NextJsonComponent
      template={template}
      options={{
        components: cmsComponents,
        serverActions: { subscribe },
      }}
      title={template.props?.title}
      author={template.props?.author}
      date={new Date().toLocaleDateString()}
    />
  );
}
```

---

## 13. Architecture: Server ↔ Client Boundary

```
app/page.tsx (RSC — no 'use client')
  └─ NextJsonComponent (RSC)
       ├─ analyzeTree(template)       ← marks isStatic on subtrees
       └─ <ServerActionHydrator>      ← 'use client' boundary
              ├─ owns Zustand store
              ├─ calls useTransition for each serverAction
              ├─ syncs _actions state → store on every render
              └─ renderNode(template, ctx)
                   ├─ Static subtrees → rendered once, memoized
                   └─ Dynamic nodes   → re-render on state change
```

**Why this works:**
- The RSC does the heavy static analysis and sends the analyzed AST to the client
- The client hydrator creates a **single** Zustand store for the entire component tree
- Server Action dispatchers are wired via the bridged action registry — they appear as normal actions in the template but run `startTransition → serverAction → updateStore`

---

## 14. Metadata from CMS Template

The `JsonASTNode.props` can carry metadata fields for `generateMetadata`:

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const template = await getTemplate((await params).slug);
  return {
    title: template.props?.title as string,
    description: template.props?.description as string,
    openGraph: {
      title: template.props?.title as string,
    },
  };
}
```

---

## 15. Static Analysis & Performance

`NextJsonComponent` runs a **static analysis pass** on every template before rendering:

- Nodes with no `{{ }}` expressions, no `$if`/`$each` directives, and no `ActionBinding` props are marked `isStatic: true`
- Static subtrees are wrapped in `React.memo` on the client → they never re-render on state changes
- This makes large JSON trees with many static nodes very efficient

You can also pre-analyze on the server and pass the `AnalyzedNode` directly:

```tsx
import { analyzeTree } from 'next-json-component';

const analyzedTemplate = analyzeTree(rawTemplate); // server-side
// Pass to ReactJsonRenderer directly (skips client-side re-analysis)
```

---

## 16. Type Reference

```typescript
// From 'next-json-component' or 'next-json-component/server'

interface JsonASTNode {
  type: string;
  props?: Record<string, JsonPropValue>;
  children?: (JsonASTNode | string)[];
  $if?: string;
  $each?: string;
  $key?: string;
  $as?: string;
  $indexAs?: string;
}

interface ActionBinding {
  action: string;
  args?: (string | number | boolean)[];
  serverAction?: boolean; // set true to route to options.serverActions
}

interface NextJsonComponentOptions {
  components?: Record<string, ComponentType<Record<string, unknown>>>;
  actionRegistry?: ActionRegistry;
  serverActions?: Record<string, (...args: unknown[]) => Promise<unknown>>;
  initialState?: Record<string, unknown>;
}

type RegistryAction = (
  state: Record<string, unknown>,
  setState: SetStateFn,
  props: Record<string, unknown>,
  ...args: unknown[]
) => Promise<void> | void;

type ActionRegistry = Record<string, RegistryAction>;

interface ServerActionState {
  isPending: boolean;
  result: unknown;    // returned value from server action function
  error: string | null;
}
// Accessible in template as: state._actions.<actionName>.isPending / .result / .error
```

---

## 17. File Structure Reference

```
src/lib/next-json-component/
├── types.ts                  # All shared TypeScript interfaces
├── node-renderer.ts          # Core: JsonASTNode → React.createElement
├── expression-resolver.ts    # {{ }} expression evaluation
├── safe-evaluator.ts         # Sandboxed JS expression evaluator
├── static-analyzer.ts        # isStatic annotation pass
├── action-registry.ts        # Action binding + handler resolution
├── key-generator.ts          # Hash-based $key generation
├── boundary-splitter.ts      # Server/Client boundary annotation
├── index.ts                  # Main public API
│
├── server/
│   ├── ServerJsonComponent.tsx   # RSC entry point
│   ├── template-fetcher.ts       # unstable_cache + createTemplateFetcher
│   └── index.ts                  # server entry point exports
│
├── client/
│   ├── ClientJsonHydrator.tsx    # 'use client' component with Zustand
│   ├── server-action-bridge.tsx  # useTransition-based Server Action integration
│   └── index.ts
│
├── react/
│   ├── ReactJsonRenderer.tsx     # Pure React entry (no Next.js)
│   ├── PureJsonComponent.tsx     # Stateless component factory
│   ├── createJsonComponent.tsx   # Stateful component factory
│   └── index.ts                  # react entry point exports
│
├── store/
│   └── store.ts                  # createScopedStore (Zustand factory)
│
├── errors/
│   └── ErrorBoundary.tsx
│
└── converters/
    ├── jsx-to-json.ts            # JSX string → JsonASTNode
    └── json-to-jsx.ts            # JsonASTNode → JSX string
```
