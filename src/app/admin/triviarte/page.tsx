'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const GRUPOS = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto'];
const NOMBRES: Record<string, string> = {
  primero: 'Grupo Primero',
  segundo: 'Grupo Segundo',
  tercero: 'Grupo Tercero',
  cuarto: 'Grupo Cuarto',
  quinto: 'Grupo Quinto',
};

export default function TriviartePage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [estados, setEstados] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState('Cargando...');
  const [loading, setLoading] = useState<string | null>(null);

  const cargar = () => {
    fetch('/api/toggle-evaluacion?t=' + Date.now())
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setEstados(j.states);
          setMsg('✅ Datos cargados correctamente');
        } else {
          setMsg('❌ Error cargando: ' + JSON.stringify(j));
        }
      })
      .catch(e => setMsg('❌ Error de red: ' + e.message));
  };

  useEffect(() => {
    fetch('/api/admin/verify?t=' + Date.now())
      .then(r => r.json())
      .then(j => {
        setIsAuthorized(j.authorized);
        if (j.authorized) {
          cargar();
        }
      })
      .catch(() => setIsAuthorized(false));
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthorized(true);
        setLoginError('');
        cargar();
      } else {
        setLoginError(data.error || 'Credenciales incorrectas.');
      }
    } catch {
      setLoginError('Error de conexión al servidor.');
    }
  };

  const toggle = async (gId: string, enable: boolean) => {
    setLoading(gId + enable);
    setMsg('Enviando...');
    try {
      const res = await fetch('/api/toggle-evaluacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupoId: gId, enabled: enable }),
      });
      if (res.status === 401) {
        setIsAuthorized(false);
        setMsg('❌ Sesión expirada. Por favor ingresa tus credenciales.');
        setLoading(null);
        return;
      }
      const j = await res.json();
      if (j.success) {
        setEstados(j.states);
        setMsg(`✅ ${NOMBRES[gId]}: ${enable ? 'ABIERTA' : 'CERRADA'}`);
      } else {
        setMsg('❌ Error: ' + JSON.stringify(j));
      }
    } catch (e: any) {
      setMsg('❌ Error de red: ' + e.message);
    }
    setLoading(null);
  };

  if (isAuthorized === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ color: '#94a3b8', fontSize: 16, fontWeight: 700, animation: 'pulse 1.5s infinite' }}>Cargando control...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: 400, width: '100%', background: '#1e293b', border: '2px solid #334155', borderRadius: 24, padding: '32px', color: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 40 }}>🔑</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginTop: 12, marginBottom: 4 }}>Control Triviarte</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Seguridad Docente</p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Usuario:</label>
              <input 
                type="text"
                value={usernameInput}
                onChange={e => { setUsernameInput(e.target.value); setLoginError(''); }}
                placeholder="Usuario docente"
                style={{ background: '#0f172a', border: '1px solid #475569', borderRadius: 12, padding: '12px', color: '#fff', fontSize: 14, outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Contraseña:</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setLoginError(''); }}
                  placeholder="••••••••"
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 12, padding: '12px', paddingRight: 70, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  {showPassword ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>
            </div>

            {loginError && (
              <div style={{ fontSize: 12, color: '#f87171', background: '#7f1d1d33', border: '1px solid #f8717133', padding: '10px', borderRadius: 12, textAlign: 'center', fontWeight: 700 }}>
                ❌ {loginError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link 
                href="/"
                style={{ flex: 1, textDecoration: 'none', textAlign: 'center', background: '#334155', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Inicio
              </Link>
              <button 
                type="submit"
                style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}
              >
                Entrar 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>
            🎮 Control Triviarte
          </h1>
          <Link href="/admin/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12, fontWeight: 700, border: '1px solid #334155', borderRadius: 8, padding: '6px 12px' }}>
            Ir al Dashboard →
          </Link>
        </div>
        <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
          Abre o cierra la evaluación para cada grupo de estudiantes.
        </p>

        {/* Mensaje de estado */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>
          {msg}
          <button onClick={cargar} style={{ marginLeft: 16, background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            🔄 Recargar
          </button>
        </div>

        {/* Tarjetas por grupo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {GRUPOS.map(gId => {
            const abierto = estados[gId] === true;
            return (
              <div key={gId} style={{ background: '#1e293b', border: `2px solid ${abierto ? '#10b981' : '#ef4444'}`, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{NOMBRES[gId]}</div>
                    <div style={{ color: abierto ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: 13, marginTop: 4 }}>
                      {abierto ? '🟢 EVALUACIÓN ABIERTA' : '🔴 EVALUACIÓN CERRADA'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      disabled={loading === gId + 'true'}
                      onClick={() => toggle(gId, true)}
                      style={{
                        background: '#10b981', color: '#fff', border: 'none', borderRadius: 10,
                        padding: '10px 20px', fontWeight: 900, fontSize: 13, cursor: 'pointer',
                        opacity: loading === gId + 'true' ? 0.5 : 1
                      }}
                    >
                      🔓 ABRIR
                    </button>
                    <button
                      disabled={loading === gId + 'false'}
                      onClick={() => toggle(gId, false)}
                      style={{
                        background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10,
                        padding: '10px 20px', fontWeight: 900, fontSize: 13, cursor: 'pointer',
                        opacity: loading === gId + 'false' ? 0.5 : 1
                      }}
                    >
                      🔒 CERRAR
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, color: '#475569', fontSize: 12, textAlign: 'center' }}>
          Los estudiantes ven el cambio en máximo 5 segundos automáticamente.
        </div>
      </div>
    </div>
  );
}
