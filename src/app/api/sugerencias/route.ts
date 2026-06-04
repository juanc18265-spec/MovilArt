import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('sugerencias')
    .select('*')
    .order('date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.message) {
      return NextResponse.json({ success: false, error: 'Mensaje requerido' }, { status: 400 });
    }
    const newSug = {
      id: Math.random().toString(36).substring(2, 9),
      name: body.name || 'Anónimo',
      message: body.message,
      date: new Date().toISOString(),
      archived: false,
    };
    const { data, error } = await supabaseAdmin.from('sugerencias').insert(newSug).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, sugerencia: data }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

  const { error } = await supabaseAdmin.from('sugerencias').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

    const { data: existing } = await supabaseAdmin
      .from('sugerencias').select('archived').eq('id', body.id).single();
    if (!existing) return NextResponse.json({ success: false, error: 'No encontrada' }, { status: 404 });

    const newArchived = body.archived !== undefined ? body.archived : !existing.archived;
    const { data, error } = await supabaseAdmin
      .from('sugerencias').update({ archived: newArchived }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, sugerencia: data });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}
