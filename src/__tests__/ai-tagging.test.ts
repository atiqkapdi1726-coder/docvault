import { describe, it, expect, vi } from 'vitest';
import { generateAutoTags, generateSummary } from '@/lib/ai/tagging';
import type { Document } from '@/lib/types';

function makeDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: '1',
    name: 'test.pdf',
    folderId: null,
    workspaceId: 'ws1',
    fileUrl: '',
    fileSize: 1024,
    mimeType: 'application/pdf',
    thumbnailUrl: null,
    description: '',
    tags: [],
    version: 1,
    versions: [],
    createdBy: 'user1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    metadata: { author: '', category: '', language: 'en' },
    aiSummary: null,
    aiTags: [],
    ...overrides,
  };
}

describe('AI Auto-tagging', () => {
  it('generates tags for invoice documents', () => {
    const doc = makeDoc({
      name: 'invoice_march.pdf',
      description: 'Monthly invoice for payment processing',
      metadata: { author: '', category: 'finance', language: 'en' },
    });
    const tags = generateAutoTags(doc);
    expect(tags).toContain('invoice');
  });

  it('generates tags for report documents', () => {
    const doc = makeDoc({
      name: 'quarterly_report.docx',
      description: 'Analysis and findings from Q1',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      metadata: { author: '', category: 'reports', language: 'en' },
    });
    const tags = generateAutoTags(doc);
    expect(tags).toContain('report');
    expect(tags).toContain('word');
  });

  it('generates tags for contract documents', () => {
    const doc = makeDoc({
      name: 'service_agreement.pdf',
      description: 'Contract terms and agreement between parties',
      metadata: { author: '', category: 'legal', language: 'en' },
    });
    const tags = generateAutoTags(doc);
    expect(tags).toContain('contract');
    expect(tags).toContain('pdf');
  });

  it('generates tags for resume documents', () => {
    const doc = makeDoc({
      name: 'resume_2024.pdf',
      description: 'Professional resume with experience and skills',
    });
    const tags = generateAutoTags(doc);
    expect(tags).toContain('resume');
  });

  it('generates tags for presentation files', () => {
    const doc = makeDoc({
      name: 'pitch_deck.pptx',
      description: 'Slides for the investor presentation',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    const tags = generateAutoTags(doc);
    expect(tags).toContain('presentation');
    expect(tags).toContain('powerpoint');
  });

  it('generates image tags for image files', () => {
    const doc = makeDoc({
      name: 'photo.png',
      mimeType: 'image/png',
    });
    const tags = generateAutoTags(doc);
    expect(tags).toContain('image');
  });

  it('does not duplicate tags', () => {
    const doc = makeDoc({
      name: 'report.pdf',
      description: 'A financial report',
      tags: ['report'],
      metadata: { author: '', category: 'finance', language: 'en' },
    });
    const tags = generateAutoTags(doc);
    const uniqueTags = [...new Set(tags)];
    expect(tags.length).toBe(uniqueTags.length);
  });
});

describe('AI Summary Generation', () => {
  it('generates a summary with document info', () => {
    const doc = makeDoc({
      name: 'project_plan.docx',
      description: 'Project plan for the new feature',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      tags: ['project', 'planning'],
      versions: [
        { version: 1, fileUrl: '', fileSize: 2048, uploadedBy: 'user1', uploadedAt: '2024-01-01', changelog: '' },
        { version: 2, fileUrl: '', fileSize: 2048, uploadedBy: 'user1', uploadedAt: '2024-01-02', changelog: '' },
      ],
      metadata: { author: '', category: 'project', language: 'en' },
    });
    const summary = generateSummary(doc);
    expect(summary).toContain('project_plan.docx');
    expect(summary).toContain('2 versions');
    expect(summary).toContain('project, planning');
  });

  it('generates summary without tags', () => {
    const doc = makeDoc({
      name: 'document.pdf',
      description: '',
      tags: [],
      versions: [],
    });
    const summary = generateSummary(doc);
    expect(summary).toContain('document.pdf');
    expect(summary).toContain('general');
  });
});
