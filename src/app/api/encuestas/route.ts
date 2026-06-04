import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('encuestas')
    .select('*')
    .order('date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Convertir snake_case → camelCase
  const mapped = (data || []).map((e) => ({
    id: e.id,
    question: e.question,
    type: e.type,
    duration: e.duration,
    options: e.options,
    date: e.date,
    votes: e.votes,
    totalVotes: e.total_votes,
  }));
  return NextResponse.json(mapped);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

  if (id === 'all') {
    const { error } = await supabaseAdmin.from('encuestas').delete().neq('id', '');
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Historial de encuestas eliminado' });
  }

  const { error } = await supabaseAdmin.from('encuestas').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
