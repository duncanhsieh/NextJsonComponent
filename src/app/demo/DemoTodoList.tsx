'use client';

/**
 * DemoTodoList.tsx
 *
 * Demonstrates:
 *   - $each list rendering with hash-based keys
 *   - $if conditional rendering
 *   - ActionRegistry (pure functions — never serialized)
 *   - Nested dynamic props ("{{ todo.done ? 'todo-text done' : 'todo-text' }}")
 *   - Per-item action args ("{{ todo.id }}")
 */

import { useRef } from 'react';
import { ClientJsonHydrator } from '@/lib/next-json-component/client';
import type { AnalyzedNode, ActionRegistry } from '@/lib/next-json-component';

// ---------------------------------------------------------------------------
// Sample todos pool
// ---------------------------------------------------------------------------

const SAMPLE_TODOS = [
  '審查 JSON AST Schema 設計',
  '實作 Server Actions Bridge',
  '撰寫 safe-evaluator 單元測試',
  '部署到 production 環境',
  '更新 README 文件',
  '最佳化靜態節點提升',
  '新增 E2E 測試',
  '設定 CI/CD pipeline',
  '實作 jsxToJson 轉換器',
  '建立 Demo 展示頁面',
];

export function DemoTodoList({ template }: { template: AnalyzedNode }) {
  const sampleIndexRef = useRef(0);

  // ---------------------------------------------------------------------------
  // Action Registry
  // ---------------------------------------------------------------------------

  const todoRegistry: ActionRegistry = {
    addTodo: (state, setState) => {
      const text = SAMPLE_TODOS[sampleIndexRef.current % SAMPLE_TODOS.length];
      sampleIndexRef.current++;
      setState((prev) => {
        const todos = [
          ...(prev.todos as object[]),
          { id: Date.now() + Math.random(), text, done: false },
        ];
        return { todos };
      });
    },

  toggleTodo: (state, setState, _props, id: unknown) => {
    setState((prev) => {
      const todos = (prev.todos as { id: unknown; text: string; done: boolean }[]).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      );
      return { todos };
    });
  },

  deleteTodo: (state, setState, _props, id: unknown) => {
    setState((prev) => {
      const todos = (prev.todos as { id: unknown }[]).filter((t) => t.id !== id);
      return { todos };
    });
  },

    clearAll: (_state, setState) => {
      setState({ todos: [] });
    },
  };

  return (
    <ClientJsonHydrator
      template={template}
      options={{
        actionRegistry: todoRegistry,
        initialState: { todos: [] },
      }}
    />
  );
}


