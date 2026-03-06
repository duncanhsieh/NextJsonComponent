/**
 * app/api/cms-webhook/route.ts
 *
 * POST /api/cms-webhook
 *
 * Called by the CMS when content is published or updated.
 * Uses Next.js `revalidateTag` to precisely invalidate the Data Cache
 * for the affected template(s).
 *
 * ─────────────────────────────────────────────────────────────────
 * Payload shapes accepted:
 *
 *   { "templateId": "home" }             → invalidate one template
 *   { "templateId": ["home", "about"] }  → invalidate multiple templates
 *   { "all": true }                      → bust the entire template cache
 *
 * ─────────────────────────────────────────────────────────────────
 * Security:
 *   Set WEBHOOK_SECRET in .env.local  (min 32 chars recommended).
 *   Send it as:  Authorization: Bearer <WEBHOOK_SECRET>
 *   or:          X-Webhook-Secret: <WEBHOOK_SECRET>
 *
 *   If WEBHOOK_SECRET is not set, the endpoint accepts all requests
 *   (useful during local development).
 *
 * ─────────────────────────────────────────────────────────────────
 * Example curl:
 *
 *   curl -X POST http://localhost:3000/api/cms-webhook \
 *     -H "Content-Type: application/json" \
 *     -H "Authorization: Bearer my-secret-token" \
 *     -d '{ "templateId": "home" }'
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { templateTag, ALL_TEMPLATES_TAG } from '@/lib/next-json-component/server/template-fetcher';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WebhookBody {
  /** One or more template IDs to invalidate. */
  templateId?: string | string[];
  /** If true, invalidate ALL cached templates. */
  all?: boolean;
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.WEBHOOK_SECRET;

  // No secret configured → allow all (dev mode)
  if (!secret) {
    console.warn(
      '[cms-webhook] WEBHOOK_SECRET is not set. ' +
        'All requests accepted. Set it in .env.local for production.',
    );
    return true;
  }

  // Accept via Bearer token or custom header
  const authHeader = request.headers.get('authorization') ?? '';
  const customHeader = request.headers.get('x-webhook-secret') ?? '';

  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  return bearer === secret || customHeader === secret;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: WebhookBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];

  // ── Bust entire cache ─────────────────────────────────────────────────────
  if (body.all === true) {
    revalidateTag(ALL_TEMPLATES_TAG, 'default');
    revalidated.push('*');
    console.log('[cms-webhook] Revalidated ALL templates.');
  }

  // ── Bust specific template(s) ─────────────────────────────────────────────
  if (body.templateId !== undefined) {
    const ids = Array.isArray(body.templateId) ? body.templateId : [body.templateId];

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '`templateId` array must not be empty.' },
        { status: 400 },
      );
    }

    for (const id of ids) {
      if (typeof id !== 'string' || !id.trim()) {
        return NextResponse.json(
          { success: false, error: `Invalid templateId: ${JSON.stringify(id)}` },
          { status: 400 },
        );
      }
      revalidateTag(templateTag(id), 'default');
      revalidated.push(id);
      console.log(`[cms-webhook] Revalidated template: "${id}"`);
    }
  }

  // ── Nothing to do ─────────────────────────────────────────────────────────
  if (revalidated.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Provide `templateId` (string or array) or `all: true`.',
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    revalidated,
    revalidatedAt: new Date().toISOString(),
  });
}
