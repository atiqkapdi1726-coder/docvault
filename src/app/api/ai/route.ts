import { NextRequest, NextResponse } from 'next/server';
import { generateAutoTags, generateSummary } from '@/lib/ai/tagging';

interface DocInput {
  name: string;
  description: string;
  fileSize: number;
  mimeType: string;
  tags: string[];
  metadata?: { category?: string };
}

export async function POST(request: NextRequest) {
  try {
    const doc: DocInput = await request.json();

    const docForAI = {
      ...doc,
      id: 'temp',
      folderId: null,
      workspaceId: 'temp',
      fileUrl: '',
      thumbnailUrl: null,
      version: 1,
      versions: [],
      createdBy: 'temp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        author: '',
        category: doc.metadata?.category || '',
        language: 'en',
      },
      aiSummary: null,
      aiTags: [],
    };

    const autoTags = generateAutoTags(docForAI);
    const summary = generateSummary(docForAI);

    const allTags = [...new Set([...doc.tags, ...autoTags])];

    return NextResponse.json({
      success: true,
      tags: allTags,
      summary,
      aiTags: autoTags,
    });
  } catch (error) {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
