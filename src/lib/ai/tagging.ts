import type { Document } from '../types';

const TAG_PATTERNS: Record<string, string[]> = {
  invoice: ['invoice', 'bill', 'payment', 'amount due'],
  report: ['report', 'analysis', 'summary', 'findings', 'quarterly'],
  contract: ['contract', 'agreement', 'terms', 'parties', 'sign'],
  resume: ['resume', 'cv', 'experience', 'education', 'skills'],
  presentation: ['presentation', 'slides', 'pitch', 'deck'],
  proposal: ['proposal', 'project plan', 'scope', 'deliverables'],
  meeting: ['meeting', 'minutes', 'agenda', 'attendees'],
  policy: ['policy', 'guidelines', 'procedure', 'compliance'],
  legal: ['legal', 'court', 'plaintiff', 'defendant', 'statute'],
  financial: ['financial', 'revenue', 'profit', 'budget', 'forecast'],
};

export function generateAutoTags(doc: Document): string[] {
  const text = `${doc.name} ${doc.description} ${doc.metadata?.category || ''}`.toLowerCase();
  const tags: string[] = [];

  Object.entries(TAG_PATTERNS).forEach(([tag, patterns]) => {
    const matched = patterns.some((pattern) => text.includes(pattern));
    if (matched) tags.push(tag);
  });

  const extension = doc.name.split('.').pop()?.toLowerCase();
  if (extension) {
    const typeMap: Record<string, string> = {
      pdf: 'pdf',
      doc: 'word', docx: 'word',
      xls: 'excel', xlsx: 'excel',
      ppt: 'powerpoint', pptx: 'powerpoint',
      png: 'image', jpg: 'image', jpeg: 'image', gif: 'image',
      mp4: 'video', mov: 'video',
      zip: 'archive',
    };
    if (typeMap[extension]) tags.push(typeMap[extension]);
  }

  return [...new Set(tags)];
}

export function generateSummary(doc: Document): string {
  const parts: string[] = [];

  parts.push(`Document "${doc.name}" is a ${doc.metadata?.category || 'general'} file.`);
  parts.push(`Size: ${(doc.fileSize / 1024).toFixed(1)} KB.`);
  if (doc.tags.length > 0) {
    parts.push(`Tags: ${doc.tags.join(', ')}.`);
  }
  if (doc.description) {
    parts.push(`Description: ${doc.description}`);
  }
  if (doc.versions && doc.versions.length > 1) {
    parts.push(`This document has ${doc.versions.length} versions.`);
  }

  return parts.join(' ');
}

export async function autoTagDocument(doc: Document): Promise<{ tags: string[]; summary: string }> {
  const tags = generateAutoTags(doc);
  const summary = generateSummary(doc);
  return { tags, summary };
}

export default autoTagDocument;
