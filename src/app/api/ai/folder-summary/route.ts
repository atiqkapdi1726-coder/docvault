import { NextRequest, NextResponse } from 'next/server';
import { generateContent, safeJsonParse, hasGeminiKey } from '@/lib/ai/gemini';

interface DocLite {
  name: string;
  tags?: string[];
  aiSummary?: string | null;
  mimeType?: string;
  fileSize?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { folderName, documents } = await request.json();
    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: 'No documents provided' }, { status: 400 });
    }
    if (!hasGeminiKey()) {
      return NextResponse.json({ error: 'AI service is temporarily unavailable' }, { status: 503 });
    }

    const docList = (documents as DocLite[]).slice(0, 60).map((d) => ({
      name: d.name,
      type: d.mimeType || '',
      size: d.fileSize || 0,
      tags: d.tags || [],
      summary: d.aiSummary || '',
    }));

    const prompt = `Summarize what this document folder contains.

Folder: "${folderName || 'Root'}"
Documents (${docList.length}):
${JSON.stringify(docList, null, 1)}

Respond ONLY with valid JSON:
{"summary": "2-3 sentences: what kind of documents this folder holds, main topics, anything notable (e.g. 3 invoices from Q3, a resume, and a contract)", "highlights": ["short bullet", "short bullet", "short bullet"]}

Max 4 highlights, each under 60 characters. Plain language.`;

    const { text } = await generateContent([{ text: prompt }], { jsonMode: true });
    const parsed = safeJsonParse<{ summary?: string; highlights?: string[] }>(text, {});

    return NextResponse.json({
      success: true,
      summary: parsed.summary || '',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 4).map(String) : [],
    });
  } catch (error) {
    console.error('Folder summary error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Folder summary failed' },
      { status: 500 }
    );
  }
}
