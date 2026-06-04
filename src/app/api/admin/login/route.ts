import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'MOBILART2026';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

    if (username === expectedUsername && password === expectedPassword) {
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
      const token = signToken({ username, expiresAt });

      const cookieStore = await cookies();
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60, // 24 horas en segundos
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Usuario o contraseña incorrectos' },
      { status: 401 }
    );
  } catch (err) {
    console.error('Error en login:', err);
    return NextResponse.json(
      { success: false, error: 'Datos de inicio de sesión inválidos' },
      { status: 400 }
    );
  }
}
