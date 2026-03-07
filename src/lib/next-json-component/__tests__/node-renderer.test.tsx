/**
 * node-renderer.test.tsx
 *
 * Unit tests for the core AST rendering logic (renderNode, renderEach, renderSingleNode)
 * including all specified extreme edge cases.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { renderNode } from '../node-renderer';
import type { RenderContext, AnalyzedNode } from '../types';

const defaultCtx: RenderContext = {
  state: {},
  setState: vi.fn(),
  props: {},
  options: {},
};

describe('node-renderer — Basic functionality', () => {
  it('renders a simple HTML element', () => {
    const node: AnalyzedNode = { type: 'div', props: { className: 'test' }, children: ['Hello'] };
    const element = renderNode(node, defaultCtx) as React.ReactElement;
    expect(element.type).toBe('div');
    expect((element.props as any).className).toBe('test');
    expect((element.props as any).children).toBe('Hello'); // React optimizations sometimes flatten ['Hello'] into 'Hello' if there's only one child. Wait, actually my `renderChildren` returns an array always. Let's see - oh actually `Object.keys()` checking my `renderNode` return. Wait, renderChildren returns `React.ReactNode[]`. If array length is 1, maybe it doesn't get flattened in React.createElement? React.createElement(type, props, ...children). If 1 child, `props.children` is a single string! Let's check: string 'Hello'
  });

  it('renders a primitive child', () => {
     const node: AnalyzedNode = { type: 'span', children: ['42'] }; 
     const element = renderNode(node, defaultCtx) as React.ReactElement;
     expect((element.props as any).children).toBe('42');
  });
});

describe('node-renderer — Extreme Edge Cases: Node Structure', () => {
  it('handles empty AST node', () => {
    const node: AnalyzedNode = { type: 'div' };
    const element = renderNode(node, defaultCtx) as React.ReactElement;
    expect(element.type).toBe('div');
    expect(element.props).toEqual({}); // no children, no props
  });

  it('handles deeply nested nodes without stack overflow (15 levels)', () => {
    let current: AnalyzedNode = { type: 'span', children: ['Deep'] };
    for (let i = 0; i < 15; i++) {
        current = { type: 'div', children: [current] };
    }
    const element = renderNode(current, defaultCtx) as React.ReactElement;
    expect(element.type).toBe('div'); // no crash
  });

  it('handles unknown HTML tags', () => {
    // Should pass it through as a string to React
    const node: AnalyzedNode = { type: 'foo-bar', children: ['custom'] };
    const element = renderNode(node, defaultCtx) as React.ReactElement;
    expect(element.type).toBe('foo-bar');
  });

  it('handles mixed string and node children', () => {
    const node: AnalyzedNode = { type: 'p', children: ['Start ', { type: 'strong', children: ['Bold'] }, ' End'] };
    const element = renderNode(node, defaultCtx) as React.ReactElement;
    
    // Check React elements
    expect(Array.isArray(element.props.children)).toBe(true);
    expect(element.props.children[0]).toBe('Start ');
    expect(element.props.children[1].type).toBe('strong');
    expect(element.props.children[2]).toBe(' End');
  });
});

describe('node-renderer — Extreme Edge Cases: $if', () => {
  it('hides node when $if is falsy (false, 0, "", null)', () => {
    const falsyValues = ['false', '0', "''", 'null', 'undefined'];
    falsyValues.forEach(val => {
       const node: AnalyzedNode = { type: 'div', $if: `{{ ${val} }}`, children: ['Hidden'] };
       expect(renderNode(node, defaultCtx)).toBeNull();
    });
  });

  it('renders node when $if is truthy (true, 1, "text", [], {})', () => {
    // We mock ctx state to hold objects resolving to truthy
    const ctx = { ...defaultCtx, state: { obj: {}, arr: [] } };
    const truthyValues = ['true', '1', "'text'", 'state.obj', 'state.arr'];
    truthyValues.forEach(val => {
       const node: AnalyzedNode = { type: 'div', $if: `{{ ${val} }}`, children: ['Visible'] };
       const element = renderNode(node, ctx) as React.ReactElement;
       expect(element).not.toBeNull();
       expect(element.type).toBe('div');
    });
  });
});

describe('node-renderer — Extreme Edge Cases: $each', () => {
  it('handles $each bound to non-array gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const node: AnalyzedNode = { type: 'li', $each: '{{ state.notArray }}' };
    const ctx = { ...defaultCtx, state: { notArray: 'string' } };
    
    expect(renderNode(node, ctx)).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('handles $each bound to empty array', () => {
    const node: AnalyzedNode = { type: 'li', $each: '[]' }; // empty array literal logic, though technically our evaluator doesn't do [] literal currently unless its in state. Let's put it in state.
    const ctx = { ...defaultCtx, state: { arr: [] } };
    const nodeEmpty = { type: 'li', $each: '{{ state.arr }}' };
    expect(renderNode(nodeEmpty, ctx)).toEqual([]);
  });

  it('handles massive arrays (1000 items)', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const ctx = { ...defaultCtx, state: { arr } };
    const node: AnalyzedNode = { type: 'li', $each: '{{ state.arr }}', children: ['Item'] };
    
    const elements = renderNode(node, ctx) as React.ReactElement[];
    expect(elements).toHaveLength(1000);
    expect(elements[999].type).toBe('li');
  });

  it('handles nested $each (2D lists)', () => {
    const grid = [[1, 2], [3, 4]];
    const ctx = { ...defaultCtx, state: { grid } };
    const node: AnalyzedNode = { 
        type: 'div', 
        $each: '{{ state.grid }}',
        $as: 'row',
        children: [
            {
                type: 'span',
                $each: '{{ row }}',
                $as: 'cell',
                children: ['{{ cell }}']
            }
        ]
    };
    
    const rows = renderNode(node, ctx) as React.ReactElement[];
    expect(rows).toHaveLength(2);
    const firstRowChildren = (rows[0].props as any).children as React.ReactElement[];
    expect((firstRowChildren[0].props as any).children).toBe('1');
  });
});

describe('node-renderer — Props and Components', () => {
  it('handles custom components from options', () => {
    const CustomBtn = () => <button>Custom</button>;
    const ctx = { ...defaultCtx, options: { components: { CustomBtn } } };
    const node: AnalyzedNode = { type: 'CustomBtn' };
    
    const element = renderNode(node, ctx) as React.ReactElement;
    expect(element.type).toBe(CustomBtn);
  });

  it('handles nested style objects in props', () => {
    const node: AnalyzedNode = { type: 'div', props: { style: { color: 'red', margin: 10 } } };
    const element = renderNode(node, defaultCtx) as React.ReactElement;
    expect(element.props.style).toEqual({ color: 'red', margin: 10 });
  });

  it('handles unresolved action bindings gracefully without crashing render', () => {
    // resolveSingleProp will catch ActionBinding and try resolveHandler.
    // If missing, resolveHandler emits warn and returns undefined.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const node: AnalyzedNode = { type: 'button', props: { onClick: { action: 'missing' } } };
    
    const element = renderNode(node, defaultCtx) as React.ReactElement;
    expect(element.props.onClick).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
