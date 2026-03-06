# CMS 動態路由範本

本文件提供多種 CMS 頁面路由的實作範本，涵蓋從最簡單的靜態展示到含互動的進階用法。

---

## 範本一：基礎 CMS 頁面

適用於：純展示性內容，無互動。

```tsx
// app/[slug]/page.tsx
import { NextJsonComponent, getTemplate } from '@/lib/next-json-component/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
    // 可在此從 CMS 取得 title / description
  };
}

// ── Page ────────────────────────────────────────────────────────────────────
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

---

## 範本二：含 Server Action 的互動頁面

適用於：含有按鈕、表單等互動元素。

> **注意**：含 Server Action 的頁面無法靜態生成。Next.js 會自動標記為 dynamic rendering。

```tsx
// app/interactive/[slug]/page.tsx
import {
  NextJsonComponent,
  getTemplate,
} from '@/lib/next-json-component/server';
import { submitContactForm } from './actions';
import { notFound } from 'next/navigation';

export default async function InteractivePage({
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
      <NextJsonComponent
        template={template}
        options={{
          // Server Actions：JSON template 中可用 { action: 'submitContact', serverAction: true }
          serverActions: {
            submitContact: submitContactForm,
          },
          // 初始狀態
          initialState: {
            submitted: false,
            name: '',
            email: '',
          },
        }}
      />
    </main>
  );
}
```

```ts
// app/interactive/[slug]/actions.ts
'use server';

export async function submitContactForm(formData: unknown) {
  // 處理表單提交邏輯
  return {
    success: true,
    message: '感謝您的訊息，我們將盡快回覆。',
  };
}
```

---

## 範本三：多語系頁面

適用於：同一套模板需支援多語言。

```tsx
// app/[lang]/[slug]/page.tsx
import { NextJsonComponent, getTemplate } from '@/lib/next-json-component/server';
import { notFound } from 'next/navigation';

const SUPPORTED_LANGUAGES = ['zh-TW', 'en', 'ja'] as const;
type Lang = (typeof SUPPORTED_LANGUAGES)[number];

export async function generateStaticParams() {
  // 預先生成常用語系 + 頁面的靜態路由（選用）
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

export default async function I18nCmsPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!SUPPORTED_LANGUAGES.includes(lang as Lang)) {
    notFound();
  }

  let template;
  try {
    // template ID 包含語系，cache tag 也帶語系
    // → revalidateTag('njc-template:zh-TW/about') 只清除繁中版
    template = await getTemplate(`${lang}/${slug}`);
  } catch {
    notFound();
  }

  return (
    <main lang={lang}>
      <NextJsonComponent
        template={template}
        options={{
          initialState: { lang },
        }}
      />
    </main>
  );
}
```

---

## 範本四：多段路由（巢狀分類）

適用於：`/blog/tech/2026/my-post` 這類多層分類結構。

```tsx
// app/[...segments]/page.tsx
import { NextJsonComponent, getTemplate } from '@/lib/next-json-component/server';
import { notFound } from 'next/navigation';

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  const templateId = segments.join('/'); // e.g. "blog/tech/my-post"

  let template;
  try {
    template = await getTemplate(templateId);
  } catch {
    notFound();
  }

  return (
    <main>
      <NextJsonComponent
        template={template}
        options={{
          initialState: {
            // 將路徑資訊注入 state，template 可用 {{ state.breadcrumb }} 渲染
            breadcrumb: segments,
            currentPath: `/${segments.join('/')}`,
          },
        }}
      />
    </main>
  );
}
```

---

## 範本五：草稿預覽模式

適用於：CMS 編輯人員預覽尚未發布的內容。

```tsx
// app/preview/[slug]/page.tsx
import { createTemplateFetcher, NextJsonComponent } from '@/lib/next-json-component/server';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

// 草稿 fetcher：不快取（revalidate: 0），每次都從 CMS 取最新草稿
const getDraftTemplate = createTemplateFetcher(
  async (slug: string) => {
    const res = await fetch(`${process.env.CMS_API_URL}/drafts/${slug}`);
    return res.json();
  },
  { revalidate: 0 }
);

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { isEnabled } = await draftMode();

  // 非草稿模式不允許訪問預覽頁
  if (!isEnabled) {
    redirect('/');
  }

  const { slug } = await params;
  const template = await getDraftTemplate(slug);

  return (
    <main>
      {/* 預覽標示條 */}
      <div
        style={{
          background: '#f59e0b',
          color: '#000',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        ⚠️ 草稿預覽模式 — 此內容尚未發布
      </div>

      <NextJsonComponent template={template} />
    </main>
  );
}
```

**啟用草稿模式的 API Route**：

```ts
// app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  if (secret !== process.env.PREVIEW_SECRET || !slug) {
    return new Response('Invalid token', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(`/preview/${slug}`);
}
```

---

## 範本六：靜態生成（`generateStaticParams`）

適用於：已知所有頁面 slug，希望在 build time 預先生成靜態 HTML。

```tsx
// app/[slug]/page.tsx
import { NextJsonComponent, getTemplate } from '@/lib/next-json-component/server';
import { notFound } from 'next/navigation';

// 告訴 Next.js 在 build time 生成哪些頁面
export async function generateStaticParams() {
  // 從 CMS 取得所有已發布的 slug 列表
  const res = await fetch(`${process.env.CMS_API_URL}/templates?fields=id`);
  const templates = await res.json();

  return templates.map((t: { id: string }) => ({
    slug: t.id,
  }));
}

export default async function StaticCmsPage({
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
      {/* 純展示，不含 Server Action → 可被靜態生成 */}
      <NextJsonComponent template={template} />
    </main>
  );
}
```

---

## 快取策略選擇建議

| 頁面類型 | 建議策略 | 說明 |
|---------|---------|------|
| 行銷頁 / Landing Page | `revalidate: 0` + Webhook | 只在 CMS 發布時更新 |
| 部落格文章 | `revalidate: 300`（5 分鐘）| 兼顧即時性與快取效益 |
| 新聞 / 快訊 | `revalidate: 10` | 高即時性需求 |
| 草稿預覽 | `revalidate: 0`（永不快取）| 每次都取最新草稿 |
| 高互動頁面 | `dynamic = 'force-dynamic'` | 不需要快取 |
