import { describe, it, expect } from 'vitest';
import { auditService } from '@/lib/services/audit';

describe('auditService', () => {
  it('exports expected methods', () => {
    expect(typeof auditService.log).toBe('function');
    expect(typeof auditService.getLogs).toBe('function');
    expect(typeof auditService.getLogsByUser).toBe('function');
    expect(typeof auditService.getLogsByResource).toBe('function');
    expect(typeof auditService.subscribeToLogs).toBe('function');
  });
});
