import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

// Límite de tamaño de archivo: 15MB
const MAX_SIZE_BYTES = 15 * 1024 * 1024;
// Ancho máximo de la imagen comprimida (px)
const MAX_WIDTH = 1920;
// Calidad WebP (0-100)
const WEBP_QUALITY = 80;

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se recibió archivo' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'El archivo supera el límite de 15MB' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(new Uint8Array(arrayBuffer));
    let outputBuffer: Buffer;
    let filename: string;
    let contentType: string;

    if (isImage(file.type)) {
      // ✅ Comprimir imágenes automáticamente con Sharp
      // Convierte a WebP, redimensiona a max 1920px de ancho, calidad 80%
      outputBuffer = await sharp(inputBuffer)
        .rotate()               // Corrige la rotación EXIF (fotos de iPhone/Samsung)
        .resize({
          width: MAX_WIDTH,
          withoutEnlargement: true, // No ampliar imágenes pequeñas
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      filename = `img_${timestamp}.webp`;
      contentType = 'image/webp';

      console.log(`📸 Imagen comprimida: ${(file.size / 1024).toFixed(0)}KB → ${(outputBuffer.length / 1024).toFixed(0)}KB`);
    } else {
      // Archivos no imagen (PDF, etc.) se suben sin cambios
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
      filename = `file_${timestamp}.${ext}`;
      contentType = file.type || 'application/octet-stream';
    }

    const uploadBuffer = isImage(file.type) ? outputBuffer! : inputBuffer;

    // Subir a Supabase Storage (bucket: 'uploads')
    const { error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filename, uploadBuffer, {
        contentType,
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
