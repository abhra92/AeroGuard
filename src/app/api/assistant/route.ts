import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-providers';

const MAX_PROMPT_CHARS = 2000;

const optionalString = (v: unknown, max = 200) =>
  typeof v === 'string' && v.length > 0 ? v.slice(0, max) : undefined;

const optionalNumber = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000 ? v : undefined;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json({ error: `Prompt must be ${MAX_PROMPT_CHARS} characters or fewer` }, { status: 413 });
  }

  try {
    const result = await generateAIResponse({
      prompt,
      currentAqi: optionalNumber(body.currentAqi),
      currentPm25: optionalNumber(body.currentPm25),
      city: optionalString(body.city, 100),
      geminiKey: optionalString(body.geminiKey),
      groqKey: optionalString(body.groqKey),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Assistant API error:', error);
    // Do not leak internal error details to clients.
    return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 });
  }
}
