import { describe, it, expect } from 'vitest';
import { activityService } from '@/lib/services/activity';

describe('activityService', () => {
  it('exports expected methods', () => {
    expect(typeof activityService.logActivity).toBe('function');
    expect(typeof activityService.getActivities).toBe('function');
    expect(typeof activityService.getDocumentActivities).toBe('function');
    expect(typeof activityService.subscribeToActivities).toBe('function');
  });
});
