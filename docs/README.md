# NextJsonComponent — 文件索引

歡迎閱讀 NextJsonComponent 說明文件。本文件涵蓋核心功能、整合指南與實作範本。

---

## 目錄

### 快取與重新驗證 (Caching & Revalidating)

| 文件 | 說明 |
|------|------|
| [Template Fetcher](./caching/template-fetcher.md) | 以 `unstable_cache` 快取 CMS template，避免重複呼叫 API |
| [CMS Webhook](./caching/cms-webhook.md) | 透過 `revalidateTag` 在 CMS 發布時即時清除快取 |
| [動態路由範本](./caching/dynamic-routes.md) | 完整的 CMS 頁面路由實作範本 |

---

## 快速開始

### 1. 設定環境變數

複製 `.env.local.example` 為 `.env.local` 並填入 CMS API URL：

```bash
cp .env.local.example .env.local
```

```env
CMS_API_URL=https://your-cms.example.com/api
WEBHOOK_SECRET=your-secret-token
```

### 2. 在頁面中使用 (或建立自訂 Fetcher)

```tsx
// app/[slug]/page.tsx
import { NextJsonComponent, getTemplate } from 'next-json-component/server';

export default async function Page({ params }) {
  const { slug } = await params;
  
  // getTemplate 是內建的 REST API fetcher
  // 你也可以用 createTemplateFetcher() 包裝 GraphQL 或 SDK
  const template = await getTemplate(slug);
  
  return <NextJsonComponent template={template} />;
}
```

### 3. 設定 CMS Webhook

在 CMS 後台設定 Publish 事件觸發以下 webhook：

```
POST https://your-site.com/api/cms-webhook
Content-Type: application/json
Authorization: Bearer <WEBHOOK_SECRET>

{ "templateId": "home" }
```

---

## 核心概念

### JSON AST Template

每個 NextJsonComponent 頁面由一個 JSON AST 物件描述：

```json
{
  "type": "div",
  "props": { "className": "container" },
  "children": [
    {
      "type": "h1",
      "children": ["{{ state.title }}"]
    }
  ]
}
```

### 快取流程

```
使用者請求 /about
  ↓
getTemplate('about')
  ├── Cache hit  → 直接回傳（<1ms）
  └── Cache miss → fetch CMS API → 存入 Data Cache → 回傳
        ↓
NextJsonComponent 渲染 JSON AST → HTML
```

### 內容更新流程

```
CMS 編輯人員發布更新
  ↓
CMS 觸發 Webhook → POST /api/cms-webhook { "templateId": "about" }
  ↓
revalidateTag('njc-template:about')
  ↓
下次請求 /about 時重新從 CMS 取得最新 template
```
