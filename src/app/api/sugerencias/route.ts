import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.sugerencias);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const db = getDb();
    
    const newSugerencia = {
      id: Math.random().toString(36).substring(2, 9),
      name: data.name || 'Anónimo',
      message: data.message,
      date: new Date().toISOString()
    };
    
    db.sugerencias.push(newSugerencia);
    saveDb(db);
    
    return NextResponse.json({ success: true, sugerencia: newSugerencia });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.sugerencias = db.sugerencias.filter(s => s.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error deleting suggestion' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    const index = db.sugerencias.findIndex(s => s.id === data.id);
    if (index !== -1) {
      db.sugerencias[index] = {
        ...db.sugerencias[index],
        archived: data.archived !== undefined ? data.archived : !db.sugerencias[index].archived
      };
      saveDb(db);
      return NextResponse.json({ success: true, sugerencia: db.sugerencias[index] });
    }

    return NextResponse.json({ success: false, error: 'Suggestion not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error updating suggestion' }, { status: 500 });
  }
}
