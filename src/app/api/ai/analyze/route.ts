import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc, updateDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { generateContent, safeJsonParse, dataUrlToPart, hasGeminiKey } from '@/lib/ai/gemini';

// Server-side Firebase (uses env vars, no client config needed)
function getServerDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

const TEXT_MIMES = ['text/', 'application/json', 'application/javascript', 'application/xml'];

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();
    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
    }
    if (!hasGeminiKey()) {
      return NextResponse.json({ error: 'AI not configured (missing GEMINI_API_KEY)' }, { status: 503 });
    }

    const db = getServerDb();

    // Load the document record
    const docSnap = await getDoc(doc(db, 'documents', documentId));
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const docData = docSnap.data();
    const fileUrl = docData.fileUrl as string | undefined;

    // Load the stored Base64 blob
    let filePart = null;
    if (fileUrl?.startsWith('firestore://')) {
      const fileId = fileUrl.replace('firestore://', '');
      const fileSnap = await getDoc(doc(db, 'fileStorage', fileId));
      if (fileSnap.exists()) {
        filePart = dataUrlToPart(fileSnap.data().data as string);
      }
    }

    const prompt = `Analyze this document "${docData.name}" (type: ${docData.mimeType || 'unknown'}).

Respond ONLY with valid JSON in this exact shape:
{"summary": "2-3 sentence plain-English summary of what this document is and contains", "tags": ["tag1", "tag2", "tag3"], "description": "one-line description of the document"}

Rules:
- summary: describe the actual content, not just the filename
- tags: 3-6 lowercase single-word or short-phrase tags (e.g. "invoice", "q3-financials", "contract", "resume")
- description: max 100 characters
- If the file content is not analyzable (binary/unknown format), base your answer on the filename and type.`;

    const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [
      { text: prompt },
      ...(filePart ? [filePart] : []),
    ];

    const { text } = await generateContent(parts, { jsonMode: true });
    const parsed = safeJsonParse<{ summary?: string; tags?: string[]; description?: string }>(text, {});

    const aiSummary = parsed.summary || '';
    const aiTags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6).map(String) : [];
    const description = parsed.description || docData.description || '';

    // Save AI results to the document
    await updateDoc(doc(db, 'documents', documentId), {
      aiSummary,
      aiTags,
      description,
      aiProcessedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      aiSummary,
      aiTags,
      description,
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI processing failed' },
      { status: 500 }
    );
  }
}
