import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.grupos);
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const db = getDb();
    
    // global distribution of a ficha
    if (data.action === 'distribute_ficha' && data.ficha) {
      for (const key of Object.keys(db.grupos)) {
        if (!db.grupos[key].fichas) db.grupos[key].fichas = [];
        db.grupos[key].fichas.push(data.ficha);
      }
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Ficha distribuida a todos los grupos' });
    }

    // update specific group
    if (data.id && db.grupos[data.id]) {
      db.grupos[data.id] = { ...db.grupos[data.id], ...data };
      saveDb(db);
      return NextResponse.json({ success: true, group: db.grupos[data.id] });
    }
    
    return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}
