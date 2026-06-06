import crypto from 'crypto';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mobilart-local-fallback-secret-key-2026';

export interface AdminSession {
  username: string;
  expiresAt: number;
}

/**
 * Firma un token JWT simplificado usando HMAC SHA-256 nativo de Node.js
 */
export function signToken(payload: AdminSession): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${data}`)
    .digest('base64url');
  
  return `${header}.${data}.${signature}`;
}

/**
 * Verifica un token JWT simplificado y retorna su payload si es válido, o null si falló/expiró
 */
export function verifyToken(token: string): AdminSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, data, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${data}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload: AdminSession = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf8')
    );
    
    // Comprobar expiración
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Lee la cookie de sesión del administrador y retorna el payload verificado, o null si no está autorizado
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
