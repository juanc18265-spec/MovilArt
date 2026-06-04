import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json({ success: true, url: db.proyectoJoanUrl || "" });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url } = data;

    if (url === undefined) {
      return NextResponse.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    const db = getDb();
    db.proyectoJoanUrl = url;
    saveDb(db);

    return NextResponse.json({ success: true, url: db.proyectoJoanUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
