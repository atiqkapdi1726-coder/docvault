import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface AuditEntry {
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  details: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AuditEntry = await request.json();

    const logEntry = {
      id: uuidv4(),
      ...body,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, log: logEntry });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log audit entry' }, { status: 500 });
  }
}
