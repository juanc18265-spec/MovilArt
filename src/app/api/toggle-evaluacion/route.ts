import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: obtener estado actual de triviarteEnabled para todos los grupos
export async function GET() {
  const db = getDb();
  const states: Record<string, boolean> = {};
  for (const [key, grupo] of Object.entries(db.grupos)) {
    states[key] = (grupo as any).triviarteEnabled === true;
  }
  return NextResponse.json({ success: true, states });
}

// POST: toggle (cambiar) el estado de triviarteEnabled para un grupo
export async function POST(request: Request) {
  try {
    const { grupoId, enabled } = await request.json();
    
    if (!grupoId || typeof enabled !== 'boolean') {
      return NextResponse.json({ success: false, error: 'grupoId y enabled son requeridos' }, { status: 400 });
    }
    
    const db = getDb();
    
    if (!db.grupos[grupoId]) {
      return NextResponse.json({ success: false, error: 'Grupo no encontrado' }, { status: 404 });
    }
    
    db.grupos[grupoId].triviarteEnabled = enabled;
    saveDb(db);
    
    // Devolver el estado actualizado de todos los grupos
    const states: Record<string, boolean> = {};
    for (const [key, grupo] of Object.entries(db.grupos)) {
      states[key] = (grupo as any).triviarteEnabled === true;
    }
    
    return NextResponse.json({ 
      success: true, 
      grupoId,
      enabled,
      states
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
