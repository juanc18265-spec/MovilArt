import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expirar inmediatamente
    });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error en logout:', err);
    return NextResponse.json({ success: false, error: 'Error al cerrar sesión' }, { status: 500 });
  }
}
