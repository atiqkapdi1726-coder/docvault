import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { generateContent, dataUrlToPart, hasGeminiKey } from '@/lib/ai/gemini';

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
    const docSnap = await getDoc(doc(db, 'documents', documentId));
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const docData = docSnap.data();

    if (!docData.fileUrl?.startsWith('firestore://')) {
      return NextResponse.json({ error: 'Document has no stored file' }, { status: 400 });
    }
    const isImage = typeof docData.mimeType === 'string' && docData.mimeType.startsWith('image/');
    const isPdf = docData.mimeType === 'application/pdf';
    if (!isImage && !isPdf) {
      return NextResponse.json({ error: 'OCR works on images and PDFs only' }, { status: 400 });
    }

    const fileId = docData.fileUrl.replace('firestore://', '');
    const fileSnap = await getDoc(doc(db, 'fileStorage', fileId));
    if (!fileSnap.exists()) {
      return NextResponse.json({ error: 'File data not found' }, { status: 404 });
    }
    const filePart = dataUrlToPart(fileSnap.data().data as string);
    if (!filePart) {
      return NextResponse.json({ error: 'File data unreadable' }, { status: 400 });
    }

    const { text } = await generateContent(
      [
        { text: 'Extract ALL text visible in this image/document. Output only the extracted text, preserving line breaks and natural reading order. If there is no text, respond with exactly: [No text detected]' },
        filePart,
      ],
      { systemPrompt: 'You are an OCR engine. Output extracted text only — no commentary, no markdown fences.' }
    );

    return NextResponse.json({ success: true, text: text.trim() });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OCR failed' },
      { status: 500 }
    );
  }
}
