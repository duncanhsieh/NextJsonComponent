# Template Fetcher — `unstable_cache` 快取指南

## 概述

`template-fetcher` 模組提供了一個通用的 **Higher-Order Function (HoF)**。由於每個 CMS 的架構不同（REST, GraphQL, SDKs），它不預設你如何抓取資料，而是**將你自訂的抓取邏輯包裝在 Next.js `unstable_cache` 中**，使得：

- 同一個 template ID 的重複請求直接從 Data Cache 回傳，不再花費時間執行你的抓取邏輯
- 每個快取項目帶有精確的 tag，可透過 `revalidateTag` 單獨清除
- 預設 TTL 60 秒，過期後自動重新驗證（Stale-While-Revalidate 行為）

---

## API 參考

### `createTemplateFetcher(fetcher, options?)`

將你的自訂抓取邏輯（`fetcher`）包裝成帶有快取能力的版本。

```ts
import { createTemplateFetcher } from '@/lib/next-json-component/server';
import { request } from 'graphql-request';

// 1. 定義包裝後的抓取函式
export const getMyTemplate = createTemplateFetcher(
  // 你的邏輯：負責回傳 Promise<JsonASTNode>
  async (templateId: string, context?: { locale: string }) => {
    const data = await request(CMS_ENDPOINT, MY_QUERY, { 
      id: templateId, 
      locale: context?.locale 
    });
    return data.ast;
  },
  // 快取設定
  {
    revalidate: 300, // 5 分鐘
  }
);

// 2. 在元件中使用
const template = await getMyTemplate('hero-banner', { locale: 'zh-TW' });
```

| 參數 | 型別 | 說明 |
|------|------|------|
| `fetcher` | `(id: string, context?: T) => Promise<JsonASTNode>` | 你的自訂抓取邏輯 |
| `options.revalidate` | `number \| false` | TTL（秒）。預設 `60`。設 `0` 表示永不自動過期 |
| `options.getTags` | `(id) => string[]` | 自訂 cache tags。預設打上 `['njc-template:id', 'njc-templates']` |
| `options.getCacheKey` | `(id) => string[]` | 自訂 cache key。預設為 `['njc-template', id]` |

---

### `getTemplate(templateId)`

這是我們預先寫好給大家快速測試用的單例（Singleton），它背後是一個簡單的 `fetch` 實作。
如果你的架構很單純，也可以直接使用它。

```ts
import { getTemplate } from '@/lib/next-json-component/server';
const template = await getTemplate('home');
```

> [!NOTE]  
> `getTemplate` 依賴 `CMS_API_URL` 環境變數。如果你的 CMS 是 Contentful / Sanity，請放棄使用此方法，改用 `createTemplateFetcher` 自己寫邏輯。

---

### `templateTag(templateId)`

回傳單一 template 的快取 tag 字串，供 `revalidateTag` 使用。

```ts
import { templateTag } from '@/lib/next-json-component/server';

templateTag('home')   // → 'njc-template:home'
templateTag('about')  // → 'njc-template:about'
```

---

### `ALL_TEMPLATES_TAG`

清除**所有** template 快取的 tag 常數。

```ts
import { ALL_TEMPLATES_TAG, revalidateTag } from 'next/cache';
import { ALL_TEMPLATES_TAG as NJC_ALL } from '@/lib/next-json-component/server';

revalidateTag(NJC_ALL, 'default'); // 清除所有 NextJsonComponent template 快取
```

---

## 環境變數

| 變數 | 必填 | 說明 |
|------|------|------|
| `CMS_API_URL` | 是（使用 `getTemplate` 時）| CMS API 基礎 URL，不含結尾 `/` |

CMS API 需支援以下端點：

```
GET {CMS_API_URL}/templates/:id
```

**預期回傳格式**（`application/json`）：

```json
{
  "type": "div",
  "props": { "className": "container" },
  "children": [
    {
      "type": "h1",
      "children": ["Hello, World!"]
    }
  ]
}
```

---

## 使用範例

### 基礎用法

```tsx
// app/[slug]/page.tsx
import { NextJsonComponent, getTemplate } from '@/lib/next-json-component/server';
import { notFound } from 'next/navigation';

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let template;
  try {
    template = await getTemplate(slug);
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

### 自訂 TTL（按頁面設定）

```tsx
// app/news/[slug]/page.tsx — 新聞頁面需要更短的 TTL
import { createTemplateFetcher, NextJsonComponent } from '@/lib/next-json-component/server';

// 新聞頁面：10 秒重新驗證
const getNewsTemplate = createTemplateFetcher(
  async (slug: string) => {
    const res = await fetch(`${process.env.CMS_API_URL}/news/${slug}`);
    return res.json();
  },
  { revalidate: 10 }
);

export default async function NewsPage({ params }) {
  const { slug } = await params;
  const template = await getNewsTemplate(`news/${slug}`);
  return <NextJsonComponent template={template} />;
}
```

### 永不自動過期（只靠 Webhook 清快取）

```tsx
import { createTemplateFetcher } from '@/lib/next-json-component/server';

// 永久快取，只有 CMS 發布才清除
const getStaticTemplate = createTemplateFetcher(
  async (id: string) => {
    const res = await fetch(`${process.env.CMS_API_URL}/pages/${id}`);
    return res.json();
  },
  { revalidate: 0 }
);
```

### 搭配多語系

```tsx
// app/[lang]/[slug]/page.tsx
import { getTemplate, NextJsonComponent } from '@/lib/next-json-component/server';

export default async function I18nPage({ params }) {
  const { lang, slug } = await params;
  // template ID 包含語系，讓快取 tag 也帶語系資訊
  const template = await getTemplate(`${lang}/${slug}`);
  return <NextJsonComponent template={template} />;
}
```

---

## 快取命中行為

```
第 1 次請求 /about
  Cache miss → fetch CMS API → 存入 cache（tag: njc-template:about）
  耗時：~200ms（受 CMS API 回應時間影響）

第 2-N 次請求 /about（60 秒內）
  Cache hit → 直接回傳
  耗時：<5ms

60 秒後
  Background revalidation → 下一個請求觸發重新 fetch
  使用者仍回傳舊快取（Stale-While-Revalidate）

CMS 發布後 → POST /api/cms-webhook { "templateId": "about" }
  revalidateTag('njc-template:about') → 立即清除
  下次請求：強制重新 fetch
```

---

## CMS API 實作建議

CMS 端的 `/templates/:id` 端點建議：

1. **回傳完整的 JSON AST**，不要回傳 HTML 或 Markdown
2. **使用 ETag / Last-Modified** header 讓 Next.js 的條件式請求生效
3. **回傳 404** 當 template 不存在，`getTemplate` 會拋出錯誤便於 `notFound()` 處理
4. **支援版本號**查詢（選用）：`/templates/:id?version=draft` for preview mode

```
GET /templates/home         → 已發布版本
GET /templates/home?v=draft → 草稿版本（Preview Mode 用）
```
