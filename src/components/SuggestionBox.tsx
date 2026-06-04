"use client";
import { useState } from 'react';

export default function SuggestionBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setStatus('loading');
    try {
      const res = await fetch('/api/sugerencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      
      if (res.ok) {
        setStatus('success');
        setName('');
        setMessage('');
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
        <button 
          onClick={() => { setIsOpen(true); setStatus('idle'); }}
          className="bg-teal-500 text-white p-3 sm:p-4 rounded-full shadow-xl hover:bg-teal-600 transition-colors flex items-center justify-center group cursor-pointer active:scale-95 duration-200"
          title="Buzón de Sugerencias"
        >
          <span className="text-xl sm:text-2xl">📬</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-3 font-bold text-xs sm:text-sm">
            Buzón de Sugerencias
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden anim-fade-up">
      <div className="bg-teal-500 p-4 text-white flex justify-between items-center">
        <h3 className="font-bold">Buzón de Sugerencias</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
      </div>
      <div className="p-5">
        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✨</div>
            <p className="font-bold text-teal-600">¡Gracias por tu mensaje!</p>
            <p className="text-sm text-slate-500 mt-1">Tu sugerencia ha sido enviada al equipo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tu Nombre (Opcional)</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. María Pérez"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tu Mensaje</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Escribe tu sugerencia, idea o problema aquí..."
                required
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-teal-500 text-white font-bold py-2 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
            {status === 'error' && <p className="text-red-500 text-xs text-center">Hubo un error. Intenta de nuevo.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
