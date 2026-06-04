import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.landscapeVideos || {});
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { landscapeId, videoUrl } = data;

    if (!landscapeId || videoUrl === undefined) {
      return NextResponse.json({ success: false, error: 'landscapeId and videoUrl are required' }, { status: 400 });
    }

    const db = getDb();
    if (!db.landscapeVideos) {
      db.landscapeVideos = {};
    }
    db.landscapeVideos[landscapeId] = videoUrl;
    saveDb(db);

    return NextResponse.json({ success: true, landscapeVideos: db.landscapeVideos });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}
