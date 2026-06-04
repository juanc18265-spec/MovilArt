import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.evaluaciones || []);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.studentName || !data.grupoId) {
      return NextResponse.json({ success: false, error: 'Student name and Group ID are required' }, { status: 400 });
    }

    const db = getDb();
    if (!db.evaluaciones) db.evaluaciones = [];

    const newEvaluacion = {
      id: Math.random().toString(36).substring(2, 9),
      studentName: data.studentName,
      grupoId: data.grupoId,
      grupoName: data.grupoName || data.grupoId,
      points: data.points || 0,
      heartsLeft: data.heartsLeft !== undefined ? data.heartsLeft : 7,
      date: new Date().toISOString(),
      archived: false
    };

    db.evaluaciones.push(newEvaluacion);
    saveDb(db);

    return NextResponse.json({ success: true, evaluacion: newEvaluacion });
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
    if (!db.evaluaciones) db.evaluaciones = [];
    db.evaluaciones = db.evaluaciones.filter(e => e.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error deleting evaluation' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    if (!db.evaluaciones) db.evaluaciones = [];
    const index = db.evaluaciones.findIndex(e => e.id === data.id);
    if (index !== -1) {
      db.evaluaciones[index] = {
        ...db.evaluaciones[index],
        archived: data.archived !== undefined ? data.archived : !db.evaluaciones[index].archived
      };
      saveDb(db);
      return NextResponse.json({ success: true, evaluacion: db.evaluaciones[index] });
    }

    return NextResponse.json({ success: false, error: 'Evaluation not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error updating evaluation' }, { status: 500 });
  }
}
