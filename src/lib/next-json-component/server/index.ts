/**
 * server/index.ts — Public API for server-side usage.
 *
 * Usage:
 *   import { NextJsonComponent } from '@/lib/next-json-component/server';
 *   import { getTemplate, createTemplateFetcher, templateTag } from '@/lib/next-json-component/server';
 */
export { NextJsonComponent } from './ServerJsonComponent';
export type { ServerJsonComponentProps } from './ServerJsonComponent';

// Template caching utilities
export {
  getTemplate,
  createTemplateFetcher,
  templateTag,
  ALL_TEMPLATES_TAG,
} from './template-fetcher';
export type { TemplateFetcherOptions } from './template-fetcher';
