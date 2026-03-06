'use client';

/**
 * client/index.ts — Public API for client-side usage.
 *
 * Usage:
 *   import { ClientJsonHydrator } from '@/lib/next-json-component/client';
 */
export { ClientJsonHydrator } from './ClientJsonHydrator';
export type { ClientJsonHydratorProps } from './ClientJsonHydrator';

export { ServerActionHydrator, useServerActionState } from './server-action-bridge';
export type { ServerActionState } from './server-action-bridge';
