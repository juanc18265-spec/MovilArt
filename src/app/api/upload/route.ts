import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se recibió archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const filename = `upload_${timestamp}.${ext}`;

    // Subir a Supabase Storage (bucket: 'uploads')
    const { error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(filename);
    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (err) {
    console.error('Error en upload:', err);
    return NextResponse.json({ success: false, error: 'Error al procesar el archivo' }, { status: 500 });
  }
}
