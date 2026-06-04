import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('grupos').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Convertir array a Record<string, GrupoData> igual que antes
  const grupos: Record<string, unknown> = {};
  for (const g of data || []) {
    grupos[g.id] = {
      id: g.id,
      name: g.name,
      info: g.info,
      videos: g.videos || [],
      images: g.images || [],
      fichas: g.fichas || [],
      tests: g.tests || [],
      triviarteEnabled: g.triviarte_enabled || false,
    };
  }
  return NextResponse.json(grupos);
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    // Distribuir ficha a todos los grupos
    if (data.action === 'distribute_ficha' && data.ficha) {
      const { data: grupos, error: fetchError } = await supabaseAdmin.from('grupos').select('*');
      if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

      for (const grupo of grupos || []) {
        const fichas = [...(grupo.fichas || []), data.ficha];
        await supabaseAdmin.from('grupos').update({ fichas }).eq('id', grupo.id);
      }
      return NextResponse.json({ success: true, message: 'Ficha distribuida a todos los grupos' });
    }

    // Actualizar un grupo específico
    if (data.id) {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('grupos').select('*').eq('id', data.id).single();
      if (fetchError || !existing) {
        return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
      }

      const updatePayload: Record<string, unknown> = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.info !== undefined) updatePayload.info = data.info;
      if (data.videos !== undefined) updatePayload.videos = data.videos;
      if (data.images !== undefined) updatePayload.images = data.images;
      if (data.fichas !== undefined) updatePayload.fichas = data.fichas;
      if (data.tests !== undefined) updatePayload.tests = data.tests;
      if (data.triviarteEnabled !== undefined) updatePayload.triviarte_enabled = data.triviarteEnabled;

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('grupos').update(updatePayload).eq('id', data.id).select().single();
      if (updateError) return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });

      return NextResponse.json({ success: true, group: { ...updated, triviarteEnabled: updated.triviarte_enabled } });
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}
