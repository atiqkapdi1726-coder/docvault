import { NextRequest, NextResponse } from 'next/server';
import { generateContent, hasGeminiKey } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { documentName, changelog } = await request.json();
    if (!hasGeminiKey()) {
      return NextResponse.json({ error: 'AI service is temporarily unavailable' }, { status: 503 });
    }
    if (!changelog?.trim()) {
      return NextResponse.json({ success: true, changelog: 'New version uploaded' });
    }

    const { text } = await generateContent(
      [
        {
          text: `A user uploaded a new version of "${documentName}" and wrote this rough note describing what changed:
"${changelog}"

Rewrite it as a clear, one-sentence version changelog (max 15 words). Output only the sentence, nothing else.`,
        },
      ],
      { systemPrompt: 'You write concise changelog entries. Output plain text only.' }
    );

    return NextResponse.json({ success: true, changelog: text.trim().slice(0, 120) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Changelog AI failed' },
      { status: 500 }
    );
  }
}
