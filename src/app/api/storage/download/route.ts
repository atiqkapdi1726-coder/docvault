import { NextRequest, NextResponse } from 'next/server';
import { r2Storage } from '@/lib/r2/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'No file key provided' }, { status: 400 });
    }

    const downloadUrl = await r2Storage.getDownloadUrl(key);

    return NextResponse.json({ success: true, url: downloadUrl });
  } catch (error) {
    console.error('Download URL error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get download URL' },
      { status: 500 }
    );
  }
}
