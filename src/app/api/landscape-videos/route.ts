import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

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
    const { landscapeId, videoUrl } = await request.json();
    if (!landscapeId || !videoUrl) {
      return NextResponse.json({ success: false, error: 'landscapeId y videoUrl requeridos' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('landscape_videos')
      .upsert({ landscape_id: landscapeId, video_url: videoUrl });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}
