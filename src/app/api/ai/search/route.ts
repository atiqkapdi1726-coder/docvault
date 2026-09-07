import { NextRequest, NextResponse } from 'next/server';
import { generateContent, safeJsonParse, hasGeminiKey } from '@/lib/ai/gemini';

interface DocLite {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  aiSummary?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, query: searchQuery, documents } = await request.json();
    if (!workspaceId || !searchQuery?.trim()) {
      return NextResponse.json({ error: 'Missing workspaceId or query' }, { status: 400 });
    }
    if (!hasGeminiKey()) {
      return NextResponse.json({ error: 'AI service is temporarily unavailable' }, { status: 503 });
    }
    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    const docList = (documents as DocLite[]).slice(0, 100).map((d, i) => ({
      index: i,
      name: d.name,
      description: d.description || '',
      tags: d.tags || [],
      summary: d.aiSummary || '',
    }));

    const prompt = `A user searches their documents for: "${searchQuery}"

Here are their documents (index, name, description, tags, AI summary):
${JSON.stringify(docList, null, 1)}

Respond ONLY with valid JSON: {"matches": [indices of documents that match the search intent]}
Include a document if its name, description, tags, or summary relate to the query's MEANING (not just exact words).
Return max 20 matches. If nothing matches, return {"matches": []}.`;

    const { text } = await generateContent([{ text: prompt }], { jsonMode: true });
    const parsed = safeJsonParse<{ matches?: number[] }>(text, {});
    const matchIndices = new Set((parsed.matches || []).map(Number));

    const results = (documents as DocLite[])
      .slice(0, 100)
      .filter((_, i) => matchIndices.has(i))
      .map((d) => d.id);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI search failed' },
      { status: 500 }
    );
  }
}
