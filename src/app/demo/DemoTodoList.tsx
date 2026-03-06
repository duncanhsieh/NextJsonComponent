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

import { ClientJsonHydrator } from '@/lib/next-json-component/client';
import { analyzeTree } from '@/lib/next-json-component';
import type { JsonASTNode, ActionRegistry } from '@/lib/next-json-component';

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

let sampleIndex = 0;

// ---------------------------------------------------------------------------
// Action Registry
// ---------------------------------------------------------------------------

const todoRegistry: ActionRegistry = {
  addTodo: (state, setState) => {
    const text = SAMPLE_TODOS[sampleIndex % SAMPLE_TODOS.length];
    sampleIndex++;
    const todos = [
      ...(state.todos as object[]),
      { id: Date.now(), text, done: false },
    ];
    setState({ todos });
  },

  toggleTodo: (state, setState, _props, id: unknown) => {
    const todos = (state.todos as { id: unknown; text: string; done: boolean }[]).map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
    setState({ todos });
  },

  deleteTodo: (state, setState, _props, id: unknown) => {
    const todos = (state.todos as { id: unknown }[]).filter((t) => t.id !== id);
    setState({ todos });
  },

  clearAll: (_state, setState) => {
    setState({ todos: [] });
  },
};

// ---------------------------------------------------------------------------
// JSON AST Template
// ---------------------------------------------------------------------------

const todoTemplate: JsonASTNode = {
  type: 'div',
  props: { className: 'todo-wrap' },
  children: [
    // Header
    {
      type: 'div',
      props: { className: 'todo-header' },
      children: [
        { type: 'h2', props: { className: 'todo-title' }, children: ['待辦事項'] },
        { type: 'span', props: { className: 'todo-count' }, children: ['{{ state.todos.length }} 項'] },
      ],
    },

    // Actions row
    {
      type: 'div',
      props: { className: 'todo-actions-row' },
      children: [
        {
          type: 'button',
          props: { className: 'btn-add-todo', onClick: { action: 'addTodo' } },
          children: ['+ 新增待辦'],
        },
        {
          type: 'button',
          props: { className: 'btn-clear', onClick: { action: 'clearAll' } },
          $if: '{{ state.todos.length > 0 }}',
          children: ['清除全部'],
        },
      ],
    },

    // Empty state
    {
      type: 'div',
      props: { className: 'todo-empty' },
      $if: '{{ state.todos.length === 0 }}',
      children: [
        { type: 'div', props: { className: 'todo-empty-icon' }, children: ['📋'] },
        { type: 'p', children: ['尚無待辦事項，點擊新增！'] },
      ],
    },

    // List
    {
      type: 'ul',
      props: { className: 'todo-list' },
      $if: '{{ state.todos.length > 0 }}',
      children: [
        {
          type: 'li',
          props: { className: 'todo-item' },
          $each: '{{ state.todos }}',
          $as: 'todo',
          $key: '{{ todo.id }}',
          children: [
            {
              type: 'span',
              props: { className: "{{ todo.done ? 'todo-text done' : 'todo-text' }}" },
              children: ['{{ todo.text }}'],
            },
            {
              type: 'button',
              props: {
                className: "{{ todo.done ? 'btn-icon done' : 'btn-icon' }}",
                title: '切換狀態',
                onClick: { action: 'toggleTodo', args: ['{{ todo.id }}'] },
              },
              children: ["{{ todo.done ? '↩' : '✓' }}"],
            },
            {
              type: 'button',
              props: {
                className: 'btn-icon btn-icon-del',
                title: '刪除',
                onClick: { action: 'deleteTodo', args: ['{{ todo.id }}'] },
              },
              children: ['×'],
            },
          ],
        },
      ],
    },
  ],
};

const analyzedTemplate = analyzeTree(todoTemplate);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DemoTodoList() {
  return (
    <ClientJsonHydrator
      template={analyzedTemplate}
      options={{
        actionRegistry: todoRegistry,
        initialState: { todos: [] },
      }}
    />
  );
}
