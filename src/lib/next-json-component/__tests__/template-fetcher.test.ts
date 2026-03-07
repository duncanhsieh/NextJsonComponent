/**
 * template-fetcher.test.ts
 *
 * Unit tests for the cache wrapper HoF.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTemplateFetcher, templateTag, ALL_TEMPLATES_TAG } from '../server/template-fetcher';

// Mock `next/cache`
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn, keys, options) => {
    // Return an async function that just runs the original fn
    return async (...args: any[]) => fn(...args);
  }),
}));

describe('template-fetcher — helpers', () => {
  it('templateTag returns a properly formatted tag', () => {
    expect(templateTag('home')).toBe('njc-template:home');
    expect(templateTag('article/123')).toBe('njc-template:article/123');
  });

  it('ALL_TEMPLATES_TAG value is correct', () => {
    expect(ALL_TEMPLATES_TAG).toBe('njc-templates');
  });
});

describe('template-fetcher — createTemplateFetcher wrapper', () => {
  const validAst = { type: 'div' };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes the provided fetcher and returns the valid AST', async () => {
    const mockFetch = vi.fn().mockResolvedValue(validAst);
    const getTemplate = createTemplateFetcher(mockFetch);
    
    const result = await getTemplate('test-id', { locale: 'en' });
    
    expect(mockFetch).toHaveBeenCalledWith('test-id', { locale: 'en' });
    expect(result).toEqual(validAst);
  });

  it('throws an error if the fetcher returns null', async () => {
    const mockFetch = vi.fn().mockResolvedValue(null);
    const getTemplate = createTemplateFetcher(mockFetch);
    
    await expect(getTemplate('test-id')).rejects.toThrow(/invalid JsonASTNode/);
  });

  it('throws an error if the fetcher returns an object without a type field', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ props: {} }); // missing type
    const getTemplate = createTemplateFetcher(mockFetch);
    
    await expect(getTemplate('test-id')).rejects.toThrow(/Missing "type" field/);
  });

  it('propagates errors thrown by the underlying fetcher', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network failure'));
    const getTemplate = createTemplateFetcher(mockFetch);
    
    await expect(getTemplate('test-id')).rejects.toThrow('Network failure');
  });

  it('uses default cache options (60s, standard tags)', async () => {
    const { unstable_cache } = await import('next/cache');
    const mockFetch = vi.fn().mockResolvedValue(validAst);
    
    const getTemplate = createTemplateFetcher(mockFetch);
    await getTemplate('my-id');
    
    expect(unstable_cache).toHaveBeenCalled();
    const calls = vi.mocked(unstable_cache).mock.calls;
    const [fn, keys, options] = calls[0];
    
    expect(keys).toEqual(['njc-template', 'my-id']);
    expect(options).toEqual({
      revalidate: 60,
      tags: ['njc-template:my-id', 'njc-templates'],
    });
  });

  it('respects custom cache options and tag generation', async () => {
    const { unstable_cache } = await import('next/cache');
    const mockFetch = vi.fn().mockResolvedValue(validAst);
    
    const getTemplate = createTemplateFetcher(mockFetch, {
      revalidate: 3600,
      getTags: (id) => [`custom-tag:${id}`],
      getCacheKey: (id) => ['custom-key', id],
    });
    
    await getTemplate('custom-id');
    
    const calls = vi.mocked(unstable_cache).mock.calls;
    const [_, keys, options] = calls[0];
    
    expect(keys).toEqual(['custom-key', 'custom-id']);
    expect(options).toEqual({
      revalidate: 3600,
      tags: ['custom-tag:custom-id'],
    });
  });

  it('allows disabling revalidation by passing false or 0', async () => {
    const { unstable_cache } = await import('next/cache');
    const mockFetch = vi.fn().mockResolvedValue(validAst);
    
    const getTemplate = createTemplateFetcher(mockFetch, { revalidate: 0 });
    await getTemplate('static-id');
    
    const calls = vi.mocked(unstable_cache).mock.calls;
    expect(calls[0][2]?.revalidate).toBe(0);
  });
});
