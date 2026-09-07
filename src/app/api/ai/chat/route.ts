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

const MAX_FILE_CHARS = 500000;

export async function POST(request: NextRequest) {
  try {
    const { documentId, question, history } = await request.json();
    if (!documentId || !question) {
      return NextResponse.json({ error: 'Missing documentId or question' }, { status: 400 });
    }
    if (!hasGeminiKey()) {
      return NextResponse.json({ error: 'AI service is temporarily unavailable' }, { status: 503 });
    }

    const db = getServerDb();
    const docSnap = await getDoc(doc(db, 'documents', documentId));
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const docData = docSnap.data();

    // Build document context
    let contextParts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [];
    const fileInfo = `Document: "${docData.name}" | Type: ${docData.mimeType} | Size: ${docData.fileSize} bytes`;
    let inlinePart = null;

    if (docData.fileUrl?.startsWith('firestore://')) {
      const fileId = docData.fileUrl.replace('firestore://', '');
      const fileSnap = await getDoc(doc(db, 'fileStorage', fileId));
      if (fileSnap.exists()) {
        const dataUrl = fileSnap.data().data as string;
        const isTexty =
          typeof docData.mimeType === 'string' &&
          (docData.mimeType.startsWith('text/') || docData.mimeType === 'application/json');
        if (isTexty) {
          // Text: inline as text (cheaper than base64)
          try {
            const b64 = dataUrl.split(',')[1] || '';
            const decoded = Buffer.from(b64, 'base64').toString('utf-8').slice(0, MAX_FILE_CHARS);
            contextParts.push({ text: `--- Document content ---\n${decoded}\n--- End content ---` });
          } catch {}
        } else {
          inlinePart = dataUrlToPart(dataUrl);
          if (inlinePart) contextParts.push(inlinePart);
        }
      }
    }

    const systemPrompt = `You are DocVault AI, an assistant that answers questions about documents.
The user is asking about: ${fileInfo}
${docData.aiSummary ? `Known summary: ${docData.aiSummary}` : ''}
${docData.tags?.length ? `Tags: ${docData.tags.join(', ')}` : ''}

Guidelines:
- Answer ONLY based on the document content provided. If the answer isn't in the document, say so.
- Be concise and direct. Use short paragraphs or lists when helpful.
- If the document is a binary format you can't read (e.g. docx, xlsx), say you can only see the filename and metadata.
- Max 200 words unless the question demands more.`;

    const historyParts = (Array.isArray(history) ? history : [])
      .slice(-6)
      .map((m: { role: string; content: string }) => ({ text: `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}` }));

    const parts = [
      ...(historyParts.length ? [{ text: `Conversation so far:\n${historyParts.map((p: any) => p.text).join('\n')}\n---` }] : []),
      ...contextParts,
      { text: `Question: ${question}` },
    ];

    const { text } = await generateContent(parts, { systemPrompt });
    return NextResponse.json({ success: true, answer: text });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI chat failed' },
      { status: 500 }
    );
  }
}
