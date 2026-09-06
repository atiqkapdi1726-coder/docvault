import { NextRequest, NextResponse } from 'next/server';
import { r2Storage } from '@/lib/r2/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max size is 50MB.' }, { status: 400 });
    }

    const result = await r2Storage.uploadFile(file, path);

    return NextResponse.json({
      success: true,
      fileUrl: result.url,
      fileKey: result.key,
      fileSize: result.size,
      contentType: result.contentType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
