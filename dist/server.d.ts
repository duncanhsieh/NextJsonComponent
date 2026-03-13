import React from 'react';
import { J as JsonASTNode, N as NextJsonComponentOptions } from './types-C1ZzHgkh.js';

/**
 * ServerJsonComponent.tsx
 *
 * The RSC (React Server Component) entry point for NextJsonComponent.
 *
 * Responsibilities:
 *   - Accepts a JSON AST template and options from the server (page/layout).
 *   - Pre-processes the AST: static analysis + boundary annotation.
 *   - Delegates to ServerActionHydrator (which handles Server Actions state).
 *
 * NOTE: This file must NOT contain 'use client'.
 */

interface ServerJsonComponentProps {
    /** The JSON AST template from CMS or database. */
    template: JsonASTNode;
    /** Configuration: components, actionRegistry, serverActions, initialState. */
    options?: NextJsonComponentOptions;
    /** Additional props passed through to actions and expressions as `props`. */
    [key: string]: unknown;
}
/**
 * NextJsonComponent — Server Component entry point.
 */
declare function NextJsonComponent({ template, options, ...rest }: ServerJsonComponentProps): Promise<React.ReactElement>;

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

/** Canonical tag used for invalidating a single template by ID. */
declare function templateTag(templateId: string): string;
/** Tag applied to ALL templates — use to bust the entire template cache. */
declare const ALL_TEMPLATES_TAG: "njc-templates";
interface TemplateFetcherOptions {
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
/**
 * Wraps a custom fetch function with Next.js `unstable_cache` and standard tags.
 *
 * @param fetcher - Your custom function that retrieves and returns a JsonASTNode.
 * @param options - Cache configuration.
 */
declare function createTemplateFetcher<TContext = unknown>(fetcher: (templateId: string, context?: TContext) => Promise<JsonASTNode>, options?: TemplateFetcherOptions): (templateId: string, context?: TContext) => Promise<JsonASTNode>;
/**
 * A simple REST-based fetcher provided out-of-the-box.
 * Retrieves JSON from `${process.env.CMS_API_URL}/templates/:id`.
 *
 * If you need GraphQL, SDKs, or custom headers, write your own function
 * and wrap it with `createTemplateFetcher`.
 */
declare const getTemplate: (templateId: string, context?: unknown) => Promise<JsonASTNode>;

export { ALL_TEMPLATES_TAG, NextJsonComponent, type ServerJsonComponentProps, type TemplateFetcherOptions, createTemplateFetcher, getTemplate, templateTag };
