import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    return NextResponse.json({ authorized: !!session });
  } catch (err) {
    console.error('Error verifying session:', err);
    return NextResponse.json({ authorized: false });
  }
}
