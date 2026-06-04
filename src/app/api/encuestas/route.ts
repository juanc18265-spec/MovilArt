import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const history = db.encuestas || [];
  return NextResponse.json(history);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();

    if (id === 'all') {
      db.encuestas = [];
      saveDb(db);
      return NextResponse.json({ success: true });
    }

    if (db.encuestas) {
      db.encuestas = db.encuestas.filter((s: any) => s.id !== id);
      saveDb(db);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error deleting survey history' }, { status: 500 });
  }
}
