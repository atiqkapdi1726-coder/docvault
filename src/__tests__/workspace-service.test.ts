import { describe, it, expect } from 'vitest';
import { workspaceService } from '@/lib/services/workspace';

describe('workspaceService', () => {
  it('exports expected methods', () => {
    expect(typeof workspaceService.getWorkspaces).toBe('function');
    expect(typeof workspaceService.getWorkspace).toBe('function');
    expect(typeof workspaceService.createWorkspace).toBe('function');
    expect(typeof workspaceService.updateWorkspace).toBe('function');
    expect(typeof workspaceService.deleteWorkspace).toBe('function');
    expect(typeof workspaceService.addMember).toBe('function');
    expect(typeof workspaceService.removeMember).toBe('function');
    expect(typeof workspaceService.updateMemberRole).toBe('function');
  });

  it('has 8 service methods', () => {
    const methods = Object.keys(workspaceService).filter(k => typeof (workspaceService as any)[k] === 'function');
    expect(methods.length).toBe(8);
  });
});
