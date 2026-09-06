// Server-side Gemini client. API key is read from env and NEVER sent to the client.

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.5-flash';

export function hasGeminiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

export interface GeminiResult {
  text: string;
}

export async function generateContent(
  parts: GeminiPart[],
  options?: { jsonMode?: boolean; systemPrompt?: string }
): Promise<GeminiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      ...(options?.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (options?.systemPrompt) {
    body.systemInstruction = { parts: [{ text: options.systemPrompt }] };
  }

  const res = await fetch(`${GEMINI_API_BASE}/${MODEL}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p?.text || '')
      .join('') || '';
  return { text };
}

// Safely parse a JSON response (handles code fences Gemini sometimes adds)
export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// Convert a data URL (data:mime;base64,xxx) to Gemini inline_data part
export function dataUrlToPart(dataUrl: string): GeminiPart | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return null;
  return { inline_data: { mime_type: match[1], data: match[2] } };
}
