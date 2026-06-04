'use client';
import { useEffect, useState } from 'react';

const GRUPOS = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto'];
const NOMBRES: Record<string, string> = {
  primero: 'Grupo Primero',
  segundo: 'Grupo Segundo',
  tercero: 'Grupo Tercero',
  cuarto: 'Grupo Cuarto',
  quinto: 'Grupo Quinto',
};

export default function TriviartePage() {
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

  useEffect(() => { cargar(); }, []);

  const toggle = async (gId: string, enable: boolean) => {
    setLoading(gId + enable);
    setMsg('Enviando...');
    try {
      const res = await fetch('/api/toggle-evaluacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupoId: gId, enabled: enable }),
      });
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

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          🎮 Control Triviarte
        </h1>
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
