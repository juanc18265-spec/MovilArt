import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'resetToken')
    .single();
  if (error) return NextResponse.json({ resetToken: 'INITIAL_TOKEN_2026' });
  return NextResponse.json({ resetToken: data?.value || 'INITIAL_TOKEN_2026' });
}

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

  const newToken = `RESET_${Math.random().toString(36).substring(2, 9).toUpperCase()}_${Date.now()}`;
  const { error } = await supabaseAdmin
    .from('app_settings')
    .upsert({ key: 'resetToken', value: newToken });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, resetToken: newToken });
}
