import { NextRequest, NextResponse } from 'next/server';
import { r2Storage } from '@/lib/r2/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';

    const files = await r2Storage.listFiles(prefix);

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list files' },
      { status: 500 }
    );
  }
}
