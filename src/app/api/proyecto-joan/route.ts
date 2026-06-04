import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'proyectoJoanUrl')
    .single();
  if (error) return NextResponse.json({ success: true, url: '' });
  return NextResponse.json({ success: true, url: data?.value || '' });
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    const { url } = await request.json();
    if (url === undefined) {
      return NextResponse.json({ success: false, error: 'URL requerida' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({ key: 'proyectoJoanUrl', value: url });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, url });
  } catch {
    return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
  }
}
