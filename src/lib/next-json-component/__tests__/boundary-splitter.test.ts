/**
 * boundary-splitter.test.ts
 *
 * Unit tests for mapping RSC / Client rendering boundaries in JSON ASTs.
 */

import { describe, it, expect } from 'vitest';
import { annotateBoundaries, nodeNeedsClient, type AnnotatedNode } from '../boundary-splitter';
import type { AnalyzedNode } from '../types';

describe('boundary-splitter — nodeNeedsClient', () => {
  it('returns false for pure static node', () => {
    const node: AnalyzedNode = { type: 'div', isStatic: true };
    expect(nodeNeedsClient(node)).toBe(false);
  });

  it('returns true if $if directive is present', () => {
    const node: AnalyzedNode = { type: 'div', $if: 'state.show' };
    expect(nodeNeedsClient(node)).toBe(true);
  });

  it('returns true if $each directive is present', () => {
    const node: AnalyzedNode = { type: 'li', $each: 'state.list' };
    expect(nodeNeedsClient(node)).toBe(true);
  });

  it('returns true if props contain ActionBindings', () => {
    const node: AnalyzedNode = { type: 'button', props: { onClick: { action: 'submit' } } };
    expect(nodeNeedsClient(node)).toBe(true);
  });

  it('returns true if text children contain {{ }} expressions', () => {
    const node: AnalyzedNode = { type: 'p', children: ['Hello {{ state.user }}'] };
    expect(nodeNeedsClient(node)).toBe(true);
  });

  it('returns false if children are normal strings', () => {
    const node: AnalyzedNode = { type: 'p', children: ['Hello world'] };
    expect(nodeNeedsClient(node)).toBe(false);
  });

  it('returns true if a direct child node needs client', () => {
    const node: AnalyzedNode = {
      type: 'div',
      children: [
        { type: 'span', children: ['{{ state.text }}'] } // child needs client
      ]
    };
    expect(nodeNeedsClient(node)).toBe(true);
  });

  it('handles empty children arrays safely', () => {
    const node: AnalyzedNode = { type: 'div', children: [] };
    expect(nodeNeedsClient(node)).toBe(false);
  });
});

describe('boundary-splitter — annotateBoundaries tree traversal', () => {
  it('annotates deep tree correctly, inner client node makes parents client', () => {
    const root: AnalyzedNode = {
      type: 'main',
      children: [
        {
          type: 'div',
          children: [
            { type: 'span', children: ['{{ dynamic }}'] }
          ]
        },
        {
          type: 'p',
          isStatic: true,
          children: ['static']
        }
      ]
    };

    const annotated = annotateBoundaries(root);
    
    // Root should need client because span needs client
    expect(annotated._needsClient).toBe(true);
    
    // Div should need client
    const div = annotated.children![0] as AnnotatedNode;
    expect(div._needsClient).toBe(true);

    // Span should need client
    const span = div.children![0] as AnnotatedNode;
    expect(span._needsClient).toBe(true);

    // P should not need client (is static, no dynamic children/props)
    const p = annotated.children![1] as AnnotatedNode;
    expect(p._needsClient).toBe(false);
  });

  it('flags nodes securely when both $if and $each are present', () => {
    const node: AnalyzedNode = { type: 'div', $if: 'cond', $each: 'arr' };
    const annotated = annotateBoundaries(node);
    expect(annotated._needsClient).toBe(true);
  });
});
