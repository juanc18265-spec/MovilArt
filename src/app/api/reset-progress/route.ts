import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json({ resetToken: db.resetToken || "INITIAL_TOKEN_2026" });
}

export async function POST() {
  try {
    const db = getDb();
    
    // Generar un nuevo token de reinicio al azar
    const newToken = "RESET_" + Math.random().toString(36).substring(2, 9).toUpperCase() + "_" + Date.now();
    db.resetToken = newToken;
    
    // Opcional: Al resetear remotamente todo, también vaciamos la lista de calificaciones si el profesor lo decide.
    // Para ser prudentes, solo modificamos el token para forzar el reinicio local en el navegador del alumno.
    saveDb(db);
    
    return NextResponse.json({ success: true, resetToken: newToken });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error generating reset token' }, { status: 500 });
  }
}
