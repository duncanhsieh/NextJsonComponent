/**
 * template-fetcher.ts
 *
 * A generic Higher-Order Function (HoF) for caching CMS template requests.
 *
 * It wraps your custom template fetching logic with Next.js `unstable_cache`
 * and applies standardized Cache Tags. This allows you to precisely invalidate
 * templates via `revalidateTag(templateTag(id))` when your CMS publishes content.
 *
 * ─────────────────────────────────────────────────────────────────
 * Example Usage (Contentful GraphQL):
 *
 *   export const getTemplate = createTemplateFetcher(async (slug) => {
 *     const data = await client.request(query, { slug });
 *     return transformToAst(data.page.layout);
 *   });
 *
 * Example Usage (REST API with Context):
 *
 *   export const getI18nTemplate = createTemplateFetcher(
 *     async (id, context: { locale: string }) => {
 *       const res = await fetch(`https://api.cms.com/${context.locale}/pages/${id}`);
 *       return (await res.json()).ast;
 *     }
 *   );
 * ─────────────────────────────────────────────────────────────────
 */

import { unstable_cache } from 'next/cache';
import type { JsonASTNode } from '../types';

// ---------------------------------------------------------------------------
// Public helpers — call these in your webhook to invalidate exactly one entry
// ---------------------------------------------------------------------------

/** Canonical tag used for invalidating a single template by ID. */
export function templateTag(templateId: string): string {
  return `njc-template:${templateId}`;
}

/** Tag applied to ALL templates — use to bust the entire template cache. */
export const ALL_TEMPLATES_TAG = 'njc-templates' as const;

// ---------------------------------------------------------------------------
// Fetcher configuration
// ---------------------------------------------------------------------------

export interface TemplateFetcherOptions {
  /**
   * Default revalidation interval (seconds).
   * Set `0` for no revalidation (permanent cache until explicitly invalidated).
   * Defaults to 60 s.
   */
  revalidate?: number | false;

  /**
   * Custom hook to generate cache tags for a given template ID.
   * Defaults to: `[templateTag(id), ALL_TEMPLATES_TAG]`
   */
  getTags?: (templateId: string) => string[];

  /**
   * Custom hook to generate the `unstable_cache` key parts.
   * Defaults to: `['njc-template', templateId]`
   */
  getCacheKey?: (templateId: string) => string[];
}

// ---------------------------------------------------------------------------
// Core fetcher wrapper (HoF)
// ---------------------------------------------------------------------------

/**
 * Wraps a custom fetch function with Next.js `unstable_cache` and standard tags.
 *
 * @param fetcher - Your custom function that retrieves and returns a JsonASTNode.
 * @param options - Cache configuration.
 */
export function createTemplateFetcher<TContext = unknown>(
  fetcher: (templateId: string, context?: TContext) => Promise<JsonASTNode>,
  options: TemplateFetcherOptions = {}
) {
  const revalidate = options.revalidate ?? 60;
  const getTags = options.getTags ?? ((id) => [templateTag(id), ALL_TEMPLATES_TAG]);
  const getCacheKey = options.getCacheKey ?? ((id) => ['njc-template', id]);

  /**
   * Intelligently wraps the user's fetcher inside `unstable_cache` *per invocation*
   * to dynamically bind the correct `tags` and `keyParts` based on the ID.
   */
  return async (templateId: string, context?: TContext): Promise<JsonASTNode> => {
    // We create the cached version dynamically for the specific ID,
    // so `unstable_cache` knows exactly which tags to apply for this entry.
    const cachedFn = unstable_cache(
      async () => {
        const ast = await fetcher(templateId, context);

        // Basic sanity check — the response must look like a JsonASTNode.
        if (!ast || typeof ast !== 'object' || !('type' in ast)) {
          throw new Error(
            `[NextJsonComponent] template-fetcher: The fetcher returned an invalid ` +
            `JsonASTNode for template "${templateId}". Missing "type" field.`
          );
        }

        return ast;
      },
      getCacheKey(templateId),
      {
        revalidate,
        tags: getTags(templateId),
      }
    );

    return cachedFn();
  };
}

// ---------------------------------------------------------------------------
// Default demo fetcher
// ---------------------------------------------------------------------------

/**
 * A simple REST-based fetcher provided out-of-the-box.
 * Retrieves JSON from `${process.env.CMS_API_URL}/templates/:id`.
 *
 * If you need GraphQL, SDKs, or custom headers, write your own function
 * and wrap it with `createTemplateFetcher`.
 */
export const getTemplate = createTemplateFetcher(async (templateId: string) => {
  const cmsApiUrl = process.env.CMS_API_URL;

  if (!cmsApiUrl) {
    throw new Error(
      '[NextJsonComponent] default getTemplate(): CMS_API_URL is not set. ' +
      'Set it in your environment or build your own fetcher using createTemplateFetcher().'
    );
  }

  const url = `${cmsApiUrl.replace(/\/$/, '')}/templates/${templateId}`;
  
  // Notice we don't set `next: { tags }` on the `fetch` call here.
  // The `unstable_cache` wrapper already guarantees caching and tagging at the
  // function-call level, which is cleaner and works for non-fetch data sources too.
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `[NextJsonComponent] default getTemplate(): Failed to load template "${templateId}". ` +
      `HTTP ${res.status} from ${url}`
    );
  }

  return res.json();
});
