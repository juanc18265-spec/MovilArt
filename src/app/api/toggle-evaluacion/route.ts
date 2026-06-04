import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('grupos').select('id, triviarte_enabled');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const states: Record<string, boolean> = {};
  for (const g of data || []) {
    states[g.id] = g.triviarte_enabled || false;
  }
  return NextResponse.json({ states });
}

export async function POST(request: Request) {
  try {
    const { grupoId, enabled } = await request.json();
    if (!grupoId || enabled === undefined) {
      return NextResponse.json({ success: false, error: 'grupoId y enabled requeridos' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('grupos').select('id').eq('id', grupoId).single();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Grupo no encontrado' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('grupos').update({ triviarte_enabled: enabled }).eq('id', grupoId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Retornar estados actualizados de todos los grupos
    const { data: allGrupos } = await supabaseAdmin.from('grupos').select('id, triviarte_enabled');
    const states: Record<string, boolean> = {};
    for (const g of allGrupos || []) {
      states[g.id] = g.triviarte_enabled || false;
    }
    return NextResponse.json({ success: true, states });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}
