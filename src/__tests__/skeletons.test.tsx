import { describe, it, expect } from 'vitest';
import { Screen, render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Skeleton, CardSkeleton, DocumentGridSkeleton, TableSkeleton, DashboardSkeleton, CommentSkeleton, ActivitySkeleton } from '@/components/skeletons/Skeletons';

describe('Skeleton Components', () => {
  it('Skeleton renders without crashing', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('Skeleton accepts className', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('CardSkeleton renders', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('DocumentGridSkeleton renders correct count', () => {
    const { container } = render(<DocumentGridSkeleton count={4} />);
    expect(container.querySelectorAll('.card').length).toBe(4);
  });

  it('DocumentGridSkeleton default count', () => {
    const { container } = render(<DocumentGridSkeleton />);
    expect(container.querySelectorAll('.card').length).toBe(8);
  });

  it('TableSkeleton renders rows', () => {
    const { container } = render(<TableSkeleton rows={3} cols={2} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('DashboardSkeleton renders', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('CommentSkeleton renders', () => {
    const { container } = render(<CommentSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('ActivitySkeleton renders', () => {
    const { container } = render(<ActivitySkeleton />);
    expect(container.firstChild).toBeTruthy();
  });
});
