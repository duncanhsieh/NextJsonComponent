# **產品需求規格書 (PRD)：NextJsonComponent**

## **1\. 產品概述 (Product Overview)**

**產品名稱**：NextJsonComponent (Next.js 專屬動態組件引擎)

**目標背景**：

原有的 JsonComponent 在處理客戶端動態渲染表現優異，但其提供的 NextJsonComponent 僅為嚴格的靜態 HTML 輸出，喪失了 React 的互動性 (Actions/Context)，且底層的 new Function 設計在企業級應用中存在安全隱患。

**核心目標**：

打造一個完美融入 **Next.js App Router (React Server Components, RSC)** 的動態 JSON 渲染引擎。實現「伺服器端高效渲染靜態結構，客戶端無縫水合 (Hydration) 互動邏輯」，並徹底解決安全性與效能瓶頸。

## **2\. 核心痛點與解決方案 (Pain Points & Solutions)**

針對 1.0 版本的五大弱點，本專案提出對應的架構升級：

| 1.0 痛點 | 解決方案 | 預期效益 |
| :---- | :---- | :---- |
| **安全隱患** (new Function 沙箱逃逸風險) | **安全沙箱與預註冊機制**：廢除 new Function。改用安全的 AST 解析器 (如輕量級 JS-Interpreter) 執行字串邏輯，或強制採用「Action 預註冊表 (Action Registry)」模式。 | 符合企業級 CSP (內容安全策略) 規範，杜絕 XSS 與任意代碼執行。 |
| **SSR 互動受限** (無 actions/contexts) | **RSC / Client 混合渲染架構**：將組件分為 ServerJsonComponent 與 ClientJsonHydrator。伺服器渲染純 UI，Client 端掛載事件與 Context。 | 在 Next.js 中達成 SEO 優化與完整互動體驗的完美平衡。 |
| **JSX 轉換器缺漏** (不支援展開屬性) | **Babel AST 深度整合**：升級 jsxToJson 轉換器，完整支援 JSXSpreadAttribute ({...props}) 與複雜的三元運算子。 | 開發者能將現有複雜的 React 代碼無損轉換為 JSON AST。 |
| **效能浪費** (靜態節點重複遞迴) | **靜態節點提升 (Static Hoisting)**：在編譯或首次渲染階段，標記無 {{ }} 綁定的子樹，並使用 React.memo 快取，避免重複渲染。 | 大幅降低 Client 端渲染大型 JSON 樹的 CPU 開銷。 |
| **列表渲染 Key 錯誤** (依賴 index) | **強制 / 自動化 Key 生成**：當 $each 未提供 $key 時，引擎會基於資料內容進行雜湊 (Hash) 自動生成穩定 ID，而非單純使用 index。 | 提升 React 虛擬 DOM 比對效能，解決狀態錯位問題。 |

## **3\. 核心功能規格 (Core Functional Requirements)**

### **3.1 雙層渲染架構 (Isomorphic Rendering)**

* **Server 端 (RSC)**：負責解析 JSON AST，處理不需要互動的 $if, $each，並將帶有 {{action}} 綁定的節點標記為 Client 邊界。  
* **Client 端 (Hydration)**：透過 'use client' 指令的封裝層，接收 Server 傳來的狀態與結構，並將 Zustand Store、React Contexts 以及 Event Listeners (Actions) 綁定到對應的 DOM 節點上。

### **3.2 企業級 Action 引擎 (Enterprise Action Engine)**

提供兩種 Action 執行模式供開發者選擇：

1. **Registry Mode (推薦/最安全)**：JSON 中只存放 Action 名稱與參數。實際邏輯以函數形式預先寫死在專案代碼中傳入 options。  
   { "onClick": { "action": "fetchUserData", "args": \["{{props.userId}}"\] } }

2. **Safe Interpreter Mode (低代碼平台用)**：若必須執行字串邏輯，使用內建的輕量 AST 解析器來執行 JS 語法子集，徹底隔離 window 與 document。

### **3.3 Server Actions 深度整合**

* 允許在 JSON 模板中直接宣告對 Next.js Server Actions 的呼叫。  
* 支援 React 19 的 useActionState 與 useFormStatus，在 JSON 中可直接綁定 {{isPending}} 來顯示 Loading 狀態。

### **3.4 進階效能優化 (AST Pre-processing)**

引擎在接收到 JSON 後，會先進行一次靜態分析 (Pre-pass)：

* 標記 isStatic: true 於不含任何 {{ }} 變數的節點。  
* 在 Client 端渲染時，這些節點會被直接快取 (Memoized)。

## **4\. 系統架構設計 (System Architecture)**

graph TD  
    A\[資料庫 / CMS\] \--\>|JSON AST| B(Next.js Server Component)  
    B \--\> C{節點分析器}  
    C \--\>|純靜態節點| D\[直接輸出 HTML\]  
    C \--\>|動態節點 / 事件| E\[轉換為 Client 組件 Props\]  
    D \--\> F\[瀏覽器 HTML\]  
    E \--\>|JSON 片段 \+ initialState| G('use client' Hydrator)  
    G \--\>|掛載 Zustand & Context| H\[可互動的 React UI\]  
    F \--\> H

## **5\. API 規格定義 (API Specification)**

### **5.1 Next.js 伺服器端使用 (Server Component)**

// app/page.tsx  
import { NextJsonComponent } from 'next-json-component/server';  
import { myServerAction } from './actions';  
import { Button } from '@/components/ui/button';

export default async function Page() {  
  const templateJson \= await fetchTemplateFromCMS();  
    
  return (  
    \<NextJsonComponent   
      template={templateJson}  
      options={{  
        components: { Button }, // 映射伺服器/客戶端組件  
        serverActions: { submitForm: myServerAction }, // 注入 Server Actions  
        initialState: { user: 'Guest' }  
      }}  
    /\>  
  );  
}

### **5.2 Next.js 客戶端組件映射 (Client Components Mapping)**

若 JSON 內部需要使用 Context 或強互動組件，透過 clientComponents 傳入，引擎會自動處理邊界。

## **6\. 開發階段與里程碑 (Phases & Milestones)**

* **Phase 1: 基礎重構與安全強化 (Weeks 1-2)**  
  * 移除 new Function，引入安全 Action 解析器。  
  * 重構 $each 的 Key 生成演算法 (Hash-based)。  
  * 升級 jsxToJson 支援 Spread Attributes ({...props})。  
* **Phase 2: Next.js RSC 架構適配 (Weeks 3-4)**  
  * 開發 ServerJsonComponent 與 ClientJsonHydrator。  
  * 實作 JSON AST 切割演算法 (區分 Server / Client 邊界)。  
* **Phase 3: Server Actions 與效能優化 (Weeks 5-6)**  
  * 整合 Next.js Server Actions 支援。  
  * 實作 Static Node Hoisting (靜態節點提升) 演算法。  
  * 撰寫 Next.js App Router 專屬的單元測試與端到端 (E2E) 測試。

## **7\. 測試與驗收標準 (Testing & Acceptance Criteria)**

1. **安全驗收**：  
   * 嘗試在 JSON 模板注入 window.location, document.cookie 等惡意代碼，系統必須攔截並拋出 Sandbox Error，且不影響其他 UI 渲染。  
2. **SSR 互動驗收**：  
   * 在 Next.js App Router 中，關閉瀏覽器 JavaScript 時，能看到完整的初始 HTML 結構（SEO 友善）。  
   * 開啟 JavaScript 後，點擊按鈕能正確觸發 Zustand 狀態更新或 Server Actions，不會出現 React Hydration Mismatch 錯誤。  
3. **效能驗收**：  
   * 渲染包含 1000 個深度的靜態 JSON 節點時，Client 端的重繪 (Re-render) 時間應比 1.0 版本下降至少 40% (透過靜態快取)。  
4. **轉換器驗收**：  
   * jsxToJson 必須能 100% 無損轉換包含 \<div {...props} data-test="1" /\> 的語法，並能透過 jsonToJsx 還原。