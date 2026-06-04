import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('landscape_videos').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Convertir a Record<string, string> igual que antes
  const result: Record<string, string> = {};
  for (const row of data || []) {
    result[row.landscape_id] = row.video_url;
  }
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    const { landscapeId, videoUrl } = await request.json();
    if (!landscapeId || !videoUrl) {
      return NextResponse.json({ success: false, error: 'landscapeId y videoUrl requeridos' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('landscape_videos')
      .upsert({ landscape_id: landscapeId, video_url: videoUrl });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Consultar todos los videos de paisajes para retornar la lista actualizada
    const { data: allVideos } = await supabaseAdmin.from('landscape_videos').select('*');
    const result: Record<string, string> = {};
    for (const row of allVideos || []) {
      result[row.landscape_id] = row.video_url;
    }

    return NextResponse.json({ success: true, landscapeVideos: result });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}
