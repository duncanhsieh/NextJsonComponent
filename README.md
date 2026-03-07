# NextJsonComponent

一個為 Next.js App Router 打造的強大 CMS 渲染引擎。它允許你使用 JSON 定義 React 元件結構，支援 Server Components (RSC)、Zustand 狀態同步、Server Actions 以及高效的快取機制。

## 特色

- 🚀 **RSC 優先**：原生支援 React Server Components，效能卓越。
- 📦 **JSON 驅動**：透過 JSON AST 檔案定義 UI，非常適合 CMS 直接驅動。
- 🎣 **狀態同步**：內建 Zustand 整合，讓 JSON 元件能與應用程式狀態互動。
- 🔄 **快取與重驗證**：完美整合 Next.js `unstable_cache` 與 `revalidateTag` Webhook。
- 🔗 **元件轉換器**：提供 `jsxToJson` 轉換器，讓你用熟悉的 React 語法開發，自動轉為 JSON。

## 安裝

你可以直接透過 GitHub 安裝此套件：

```bash
npm install github:duncanhsieh/NextJsonComponent
```

## 快速開始

### 引入元件

在你的 Next.js 頁面中引入：

```tsx
import { NextJsonComponent } from 'next-json-component/server';
import { getTemplate } from 'next-json-component/server';

export default async function Page({ params }) {
  const { slug } = await params;
  const template = await getTemplate(slug);

  return <NextJsonComponent template={template} />;
}
```

## 說明文件

詳細的使用指南與範例請參考：

- [概覽與快速開始](docs/README.md)
- [快取機制與 Template Fetcher](docs/caching/template-fetcher.md)
- [CMS Webhook 快取重驗證](docs/caching/cms-webhook.md)
- [動態路由範本](docs/caching/dynamic-routes.md)

## 開發

此專案同時包含一個 Demo 環境，可用於開發與測試：

```bash
npm install
npm run dev
```

打包套件：
```bash
npm run build
```
