# CMS Webhook — `revalidateTag` 清快取指南

## 概述

`POST /api/cms-webhook` 是一個伺服器端 API 路由，供 CMS 在內容發布後呼叫，以精確清除 Next.js Data Cache 中的 template 快取項目。

支援三種清除模式：
| 模式 | Payload | 說明 |
|------|---------|------|
| 單一 template | `{ "templateId": "home" }` | 只清除指定的一個 template |
| 多個 template | `{ "templateId": ["home", "about"] }` | 批次清除多個 template |
| 全部清除 | `{ "all": true }` | 清除所有 NextJsonComponent template 快取 |

---

## Endpoint

```
POST /api/cms-webhook
Content-Type: application/json
Authorization: Bearer <WEBHOOK_SECRET>
```

---

## 認證

Webhook 端點透過 `WEBHOOK_SECRET` 環境變數進行認證。

**Header 選項**（擇一）：

```
Authorization: Bearer <WEBHOOK_SECRET>
X-Webhook-Secret: <WEBHOOK_SECRET>
```

> [!NOTE]
> 若 `WEBHOOK_SECRET` 未設定，端點在開發環境中接受所有請求，並在 console 輸出警告。**生產環境必須設定**。

---

## 請求格式

### 清除單一 Template

```json
{
  "templateId": "home"
}
```

### 清除多個 Template

```json
{
  "templateId": ["home", "about", "contact"]
}
```

### 清除所有 Template

```json
{
  "all": true
}
```

---

## 回應格式

### 成功

```json
{
  "success": true,
  "revalidated": ["home"],
  "revalidatedAt": "2026-03-06T11:30:47.000Z"
}
```

### 失敗

```json
{
  "success": false,
  "error": "Unauthorized."
}
```

---

## 錯誤碼

| HTTP 狀態碼 | 說明 |
|-------------|------|
| `200` | 清快取成功 |
| `400` | 請求格式錯誤（缺少 `templateId` 或 `all`，或 `templateId` 為空陣列） |
| `401` | 認證失敗（Bearer token 不符） |

---

## 環境變數

| 變數 | 必填 | 說明 |
|------|------|------|
| `WEBHOOK_SECRET` | 生產環境必填 | Webhook 認證 token，建議 32 字元以上 |

生成安全的 secret：

```bash
openssl rand -base64 32
```

---

## 使用範例

### cURL（手動測試）

```bash
# 清除單一 template
curl -X POST http://localhost:3000/api/cms-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-token" \
  -d '{ "templateId": "home" }'

# 清除多個 template
curl -X POST http://localhost:3000/api/cms-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-token" \
  -d '{ "templateId": ["home", "about", "blog"] }'

# 清除所有 template
curl -X POST http://localhost:3000/api/cms-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-token" \
  -d '{ "all": true }'
```

### 在 Next.js Server Action 中呼叫

```ts
// app/admin/actions.ts
'use server';

export async function publishTemplate(templateId: string) {
  // 1. 將更新儲存到 CMS/DB ...

  // 2. 清除快取
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cms-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({ templateId }),
  });

  if (!res.ok) {
    throw new Error(`Cache revalidation failed: ${res.status}`);
  }

  return res.json();
}
```

---

## CMS 平台整合範本

### Contentful

在 Contentful 後台 Settings → Webhooks，新增以下設定：

```
URL:     POST https://your-site.com/api/cms-webhook
Header:  Authorization: Bearer <WEBHOOK_SECRET>
Trigger: Entry published, Entry unpublished
```

Payload transformation（Content Transformation）：

```json
{
  "templateId": "{ /payload/sys/id }"
}
```

---

### Strapi

在 Strapi 的 Settings → Webhooks：

```
URL:     POST https://your-site.com/api/cms-webhook
Header:  Authorization: Bearer <WEBHOOK_SECRET>
Events:  entry.publish, entry.update, entry.delete
```

Template payload（使用 Strapi Lifecycle Hook）：

```js
// src/extensions/content-type-name/content-types/lifecycles.js
module.exports = {
  afterCreate: async ({ result }) => {
    await fetch('https://your-site.com/api/cms-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({ templateId: result.slug }),
    });
  },
};
```

---

### Sanity

```js
// sanity/plugins/revalidate.js
export const revalidatePlugin = () => ({
  name: 'revalidate-on-publish',
  document: {
    actions: (prev, context) => {
      return prev.map((action) => {
        if (action.action !== 'publish') return action;
        return {
          ...action,
          onHandle: async () => {
            action.onHandle?.();
            await fetch('https://your-site.com/api/cms-webhook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
              },
              body: JSON.stringify({ templateId: context.documentId }),
            });
          },
        };
      });
    },
  },
});
```

---

## 與 Template Fetcher 的 Tag 對應

Webhook 清除的 tag 由 `templateTag()` 函式產生，與 `template-fetcher.ts` 中 `fetch()` 設定的 `next.tags` 完全對應：

```
templateTag('home')  →  'njc-template:home'
ALL_TEMPLATES_TAG    →  'njc-templates'
```

清除 `njc-templates` 會同時影響所有帶有此 tag 的快取項目（即所有由 `getTemplate` 或 `createTemplateFetcher` 快取的結果）。

---

## 安全建議

1. **生產環境必須設定 `WEBHOOK_SECRET`**，不要讓端點對外公開訪問
2. **使用 HTTPS**，確保 token 在傳輸中加密
3. **紀錄 revalidation 事件**，便於追蹤誰在何時清了什麼快取（目前以 `console.log` 輸出，生產環境建議替換為結構化 logging）
4. **限制請求來源 IP**（可在 CDN/WAF 層配合 Webhook 觸發的 IP 範圍白名單）
