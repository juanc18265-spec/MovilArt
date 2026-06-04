import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('evaluaciones')
    .select('*')
    .order('date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Convertir snake_case → camelCase para compatibilidad con el frontend
  const mapped = (data || []).map((ev) => ({
    id: ev.id,
    studentName: ev.student_name,
    grupoId: ev.grupo_id,
    grupoName: ev.grupo_name,
    points: ev.points,
    heartsLeft: ev.hearts_left,
    date: ev.date,
    archived: ev.archived,
  }));
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.studentName || !body.grupoId) {
      return NextResponse.json({ success: false, error: 'Nombre y grupoId requeridos' }, { status: 400 });
    }
    const newEv = {
      id: Math.random().toString(36).substring(2, 9),
      student_name: body.studentName,
      grupo_id: body.grupoId,
      grupo_name: body.grupoName || '',
      points: body.points || 0,
      hearts_left: body.heartsLeft !== undefined ? body.heartsLeft : 7,
      date: new Date().toISOString(),
      archived: false,
    };
    const { data, error } = await supabaseAdmin.from('evaluaciones').insert(newEv).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({
      success: true,
      evaluacion: {
        id: data.id, studentName: data.student_name, grupoId: data.grupo_id,
        grupoName: data.grupo_name, points: data.points, heartsLeft: data.hearts_left,
        date: data.date, archived: data.archived,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

  const { error } = await supabaseAdmin.from('evaluaciones').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

    const { data: existing } = await supabaseAdmin
      .from('evaluaciones').select('archived').eq('id', body.id).single();
    if (!existing) return NextResponse.json({ success: false, error: 'No encontrada' }, { status: 404 });

    const newArchived = body.archived !== undefined ? body.archived : !existing.archived;
    const { data, error } = await supabaseAdmin
      .from('evaluaciones').update({ archived: newArchived }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({
      success: true,
      evaluacion: {
        id: data.id, studentName: data.student_name, grupoId: data.grupo_id,
        grupoName: data.grupo_name, points: data.points, heartsLeft: data.hearts_left,
        date: data.date, archived: data.archived,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}
