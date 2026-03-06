/**
 * app/api/convert/route.ts
 *
 * POST /api/convert
 *
 * Body:
 *   { "mode": "jsx-to-json", "input": "<jsx string>" }
 *   { "mode": "json-to-jsx", "input": "<json string>" }
 *
 * Response (success):
 *   { "success": true, "output": "<string>" }
 *
 * Response (error):
 *   { "success": false, "error": "<message>" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsxToJson } from '@/lib/next-json-component/converters/jsx-to-json';
import { jsonToJsx } from '@/lib/next-json-component/converters/json-to-jsx';

export async function POST(request: NextRequest) {
  let body: { mode?: string; input?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { mode, input } = body;

  if (!input || typeof input !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing `input` field.' }, { status: 400 });
  }

  try {
    if (mode === 'jsx-to-json') {
      const result = jsxToJson(input.trim(), { verbose: false });
      return NextResponse.json({
        success: true,
        output: JSON.stringify(result, null, 2),
      });
    }

    if (mode === 'json-to-jsx') {
      const parsed = JSON.parse(input.trim());
      const result = jsonToJsx(parsed, { indentSize: 2 });
      return NextResponse.json({ success: true, output: result });
    }

    return NextResponse.json({ success: false, error: 'Invalid `mode`. Use "jsx-to-json" or "json-to-jsx".' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 422 },
    );
  }
}
