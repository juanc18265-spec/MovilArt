"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { io } from "socket.io-client";

interface Resource { id: string; url: string; title?: string; }
interface Ficha { id: string; url: string; title: string; }
interface TestQuestion { id: string; question: string; options: string[]; correctAnswerIndex: number; }
interface GrupoData { id: string; name: string; info: string; videos: Resource[]; images: Resource[]; fichas: Ficha[]; tests: TestQuestion[]; triviarteEnabled?: boolean; }
interface Sugerencia { id: string; name: string; message: string; date: string; archived?: boolean; }
interface Evaluacion {
  id: string;
  studentName: string;
  grupoId: string;
  grupoName: string;
  points: number;
  heartsLeft: number;
  date: string;
  archived?: boolean;
}

// La seguridad del administrador ahora se maneja en el servidor con cookies seguras HttpOnly.

const formatTimeLeft = (seconds: number) => {
  if (seconds <= 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  
  return parts.join(" ");
};

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<"grupos" | "sugerencias" | "evaluaciones" | "videos" | "encuestas">("grupos");
  const [sugTabFilter, setSugTabFilter] = useState<"active" | "archived">("active");
  const [evalTabFilter, setEvalTabFilter] = useState<"active" | "archived">("active");
  const [grupos, setGrupos] = useState<Record<string, GrupoData>>({});
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [landscapeVideos, setLandscapeVideos] = useState<Record<string, string>>({});
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("primero");
  const [uploading, setUploading] = useState<"video" | "ficha" | "image" | null>(null);
  const [uploadingGlobal, setUploadingGlobal] = useState(false);

  // New question form state
  const [newQuestion, setNewQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  // Estados para el sistema de encuestas en tiempo real
  const [socket, setSocket] = useState<any>(null);
  const [surveyQuestion, setSurveyQuestion] = useState("");
  const [surveyType, setSurveyType] = useState<"choice" | "rating">("choice");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [adminSecondsLeft, setAdminSecondsLeft] = useState(0);
  const [surveyOptions, setSurveyOptions] = useState<string[]>(["Sí", "No", "", ""]);
  const [liveSurvey, setLiveSurvey] = useState<any>(null);
  const [surveyHistory, setSurveyHistory] = useState<any[]>([]);
  const [proyectoJoanUrl, setProyectoJoanUrl] = useState("");
  const [uploadingJoanTesis, setUploadingJoanTesis] = useState(false);

  // Cargar datos del dashboard cuando se autoriza
  useEffect(() => {
    if (isAuthorized === true) {
      fetch('/api/grupos?t=' + Date.now()).then(r => r.json()).then(setGrupos);
      fetch('/api/sugerencias?t=' + Date.now()).then(r => r.json()).then(setSugerencias);
      fetch('/api/evaluaciones?t=' + Date.now()).then(r => r.json()).then(setEvaluaciones);
      fetch('/api/landscape-videos?t=' + Date.now()).then(r => r.json()).then(setLandscapeVideos);
      fetch('/api/encuestas?t=' + Date.now()).then(r => r.json()).then(setSurveyHistory);
      fetch('/api/proyecto-joan?t=' + Date.now()).then(r => r.json()).then(data => { if (data.success) setProyectoJoanUrl(data.url); });
    }
  }, [isAuthorized]);

  // Verificar auth e inicializar sockets al montar
  useEffect(() => {
    fetch('/api/admin/verify?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        setIsAuthorized(data.authorized);
      })
      .catch(() => {
        setIsAuthorized(false);
      });

    // Inicializar conexión WebSocket
    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('active_survey_state', (state: any) => {
      if (state.active) {
        setLiveSurvey(state);
        const timeLeft = Math.max(0, Math.round((state.endsAt - Date.now()) / 1000));
        setAdminSecondsLeft(timeLeft);
      }
    });

    socketInstance.on('survey_started', (state: any) => {
      setLiveSurvey(state);
      setAdminSecondsLeft(state.duration);
    });

    socketInstance.on('survey_votes_updated', (data: any) => {
      setLiveSurvey((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          votes: data.votes,
          totalVotes: data.totalVotes
        };
      });
    });

    socketInstance.on('survey_ended', () => {
      setLiveSurvey(null);
      setAdminSecondsLeft(0);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Recargar historial al finalizar encuesta
  useEffect(() => {
    if (!liveSurvey && isAuthorized === true) {
      fetch('/api/encuestas?t=' + Date.now()).then(r => r.json()).then(setSurveyHistory);
    }
  }, [liveSurvey, isAuthorized]);

  // Temporizador para el panel de administración
  useEffect(() => {
    if (!liveSurvey || adminSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setAdminSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setLiveSurvey(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [liveSurvey, adminSecondsLeft]);

  const playChimeSound = (success: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      if (success) {
        // Double sweet note
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5

        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        gain2.gain.setValueAtTime(0.15, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.4);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.5);
      } else {
        // Low double buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        setLoginError("");
        playChimeSound(true);
      } else {
        setLoginError(data.error || "Credenciales incorrectas.");
        playChimeSound(false);
      }
    } catch {
      setLoginError("Error de conexión al servidor.");
      playChimeSound(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setIsAuthorized(false);
    setUsernameInput("");
    setPasswordInput("");
  };

  const handleUpdateGroup = async (id: string, data: Partial<GrupoData>) => {
    const res = await fetch('/api/grupos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    if (res.ok) {
      const updated = await res.json();
      setGrupos(prev => ({ ...prev, [id]: updated.group }));
      
      // Emit socket event if triviarteEnabled was changed
      if (data.triviarteEnabled !== undefined && socket) {
        socket.emit('toggle_evaluacion', { grupoId: id, enabled: data.triviarteEnabled });
        // Refrescar datos del servidor para mantener sincronización
        fetch('/api/grupos?t=' + Date.now()).then(r => r.json()).then(setGrupos);
        alert(data.triviarteEnabled ? "🟢 Evaluación ABIERTA para los estudiantes" : "🔒 Evaluación CERRADA para los estudiantes");
      } else {
        alert("Grupo actualizado exitosamente");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "ficha" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir archivo");
      const result = await res.json();

      if (result.success && result.url) {
        const group = grupos[selectedGroup];
        if (!group) return;

        if (type === "video") {
          const title = file.name.split(".")[0];
          await handleUpdateGroup(group.id, {
            videos: [...group.videos, { id: Math.random().toString(), title, url: result.url }],
          });
        } else if (type === "ficha") {
          const title = file.name.split(".")[0];
          await handleUpdateGroup(group.id, {
            fichas: [...group.fichas, { id: Math.random().toString(), title, url: result.url }],
          });
        } else if (type === "image") {
          await handleUpdateGroup(group.id, {
            images: [...group.images, { id: Math.random().toString(), url: result.url }],
          });
        }
        alert("¡Archivo subido y guardado exitosamente!");
      }
    } catch (err: any) {
      alert("Error subiendo archivo: " + err.message);
    } finally {
      setUploading(null);
      e.target.value = ""; // reset file input
    }
  };

  const handleGlobalFichaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGlobal(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir archivo");
      const result = await res.json();

      if (result.success && result.url) {
        const title = file.name.split(".")[0];
        
        // Repartir a todos los grupos
        const distributeRes = await fetch('/api/grupos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'distribute_ficha',
            ficha: { id: Math.random().toString(), title, url: result.url }
          })
        });

        if (distributeRes.ok) {
          alert("¡PDF repartido exitosamente a TODOS los grupos!");
          // Refrescar los grupos
          const refreshed = await fetch('/api/grupos').then(r => r.json());
          setGrupos(refreshed);
        } else {
          throw new Error("Error al distribuir el archivo");
        }
      }
    } catch (err: any) {
      alert("Error subiendo o repartiendo archivo: " + err.message);
    } finally {
      setUploadingGlobal(false);
      e.target.value = ""; // reset file input
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const group = grupos[selectedGroup];
    if (!group) return;

    if (!newQuestion.trim()) return alert("Por favor ingresa la pregunta");
    if (options.some(opt => !opt.trim())) return alert("Por favor completa las 4 opciones");

    const createdQuestion: TestQuestion = {
      id: Math.random().toString(),
      question: newQuestion,
      options: [...options],
      correctAnswerIndex: correctIndex
    };

    handleUpdateGroup(group.id, {
      tests: [...(group.tests || []), createdQuestion]
    });

    // Reset form
    setNewQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  };

  const handleArchiveSuggestion = async (id: string, currentlyArchived: boolean) => {
    try {
      const res = await fetch('/api/sugerencias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, archived: !currentlyArchived })
      });
      if (res.ok) {
        const result = await res.json();
        setSugerencias(prev => prev.map(s => s.id === id ? result.sugerencia : s));
        playChimeSound(true);
      } else {
        alert("Error al archivar la sugerencia.");
        playChimeSound(false);
      }
    } catch (e) {
      alert("Error de red al actualizar la sugerencia.");
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar de forma permanente esta sugerencia? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/sugerencias?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSugerencias(prev => prev.filter(s => s.id !== id));
        playChimeSound(true);
      } else {
        alert("Error al eliminar la sugerencia.");
        playChimeSound(false);
      }
    } catch (e) {
      alert("Error de red al eliminar la sugerencia.");
    }
  };

  const handleArchiveEvaluation = async (id: string, currentlyArchived: boolean) => {
    try {
      const res = await fetch('/api/evaluaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, archived: !currentlyArchived })
      });
      if (res.ok) {
        const result = await res.json();
        setEvaluaciones(prev => prev.map(e => e.id === id ? result.evaluacion : e));
        playChimeSound(true);
      } else {
        alert("Error al archivar la calificación.");
        playChimeSound(false);
      }
    } catch (e) {
      alert("Error de red al actualizar la calificación.");
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta calificación? Esta acción no se puede deshacer y el registro del alumno desaparecerá del panel.")) return;
    try {
      const res = await fetch(`/api/evaluaciones?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEvaluaciones(prev => prev.filter(e => e.id !== id));
        playChimeSound(true);
      } else {
        alert("Error al eliminar la calificación.");
        playChimeSound(false);
      }
    } catch (e) {
      alert("Error de red al eliminar la calificación.");
    }
  };

  const handleUpdateLandscapeVideo = async (landscapeId: string, videoUrl: string) => {
    try {
      const res = await fetch('/api/landscape-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landscapeId, videoUrl })
      });
      if (res.ok) {
        const result = await res.json();
        setLandscapeVideos(result.landscapeVideos);
        playChimeSound(true);
        alert("¡Video del paisaje actualizado exitosamente!");
      } else {
        alert("Error al actualizar el video del paisaje.");
        playChimeSound(false);
      }
    } catch (e) {
      alert("Error de red al actualizar el video.");
      playChimeSound(false);
    }
  };

  const handleResetAllStudentProgress = async () => {
    if (!confirm("🚨 ATENCIÓN DOCENTE:\n¿Estás completamente seguro de que deseas Restablecer el Progreso de Todos los Alumnos a cero?\n\nEsto enviará una señal de reinicio global que vaciará la memoria caché de sus computadores la próxima vez que entren o actualicen la página del grupo. ¡Sus exámenes volverán a empezar desde el Paso 1!")) return;
    
    setIsResettingAll(true);
    try {
      const res = await fetch('/api/reset-progress', {
        method: 'POST'
      });
      if (res.ok) {
        const result = await res.json();
        alert(`✓ ¡Éxito! Progreso escolar restablecido a cero de forma remota.\nNuevo Token de Sincronización: ${result.resetToken}\n\nLos navegadores de los alumnos se limpiarán automáticamente.`);
        playChimeSound(true);
      } else {
        alert("Error al intentar restablecer el progreso.");
        playChimeSound(false);
      }
    } catch (e) {
      alert("Error de red al conectar con el servidor.");
    } finally {
      setIsResettingAll(false);
    }
  };

  const handleLaunchSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) return alert("Conexión de red no disponible.");
    if (!surveyQuestion.trim()) return alert("Por favor ingresa una pregunta.");

    let optionsToUse: string[] = [];
    if (surveyType === "choice") {
      optionsToUse = surveyOptions.filter(opt => opt.trim() !== "");
      if (optionsToUse.length < 2) {
        return alert("Por favor ingresa al menos 2 opciones de respuesta.");
      }
    }

    // Calcular segundos totales
    const totalSeconds = (durationHours * 3600) + (durationMinutes * 60) + durationSeconds;

    if (totalSeconds < 5) {
      return alert("La duración mínima de la encuesta es de 5 segundos.");
    }
    if (totalSeconds > 604800) {
      return alert("La duración máxima de la encuesta es de 7 días (168 horas).");
    }

    socket.emit("launch_survey", {
      id: Math.random().toString(),
      question: surveyQuestion,
      type: surveyType,
      duration: totalSeconds,
      options: optionsToUse
    });

    // Reset question form
    setSurveyQuestion("");
  };

  const handleCloseSurveyManual = () => {
    if (socket) {
      socket.emit("close_survey_manual");
    }
  };

  const handleJoanTesisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingJoanTesis(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir archivo");
      const result = await res.json();

      if (result.success && result.url) {
        const saveRes = await fetch("/api/proyecto-joan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: result.url }),
        });

        if (saveRes.ok) {
          const saveResult = await saveRes.json();
          setProyectoJoanUrl(saveResult.url);
          alert("¡Documento de tesis de grado subido y enlazado exitosamente!");
          playChimeSound(true);
        } else {
          throw new Error("Error al guardar enlace del archivo de tesis");
        }
      }
    } catch (err: any) {
      alert("Error subiendo tesis: " + err.message);
      playChimeSound(false);
    } finally {
      setUploadingJoanTesis(false);
      e.target.value = "";
    }
  };

  const handleDeleteJoanTesis = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar el documento de tesis de grado? El botón del inicio volverá a estar desactivado y en color gris.")) return;
    try {
      const res = await fetch("/api/proyecto-joan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "" }),
      });
      if (res.ok) {
        setProyectoJoanUrl("");
        alert("¡Documento de tesis de grado eliminado exitosamente!");
        playChimeSound(true);
      } else {
        throw new Error("Error al eliminar el archivo de tesis");
      }
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
      playChimeSound(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (!confirm(id === 'all' ? "¿Estás seguro de que deseas eliminar TODO el historial de encuestas de forma permanente?" : "¿Estás seguro de que deseas eliminar este registro de encuesta de forma permanente?")) return;
    try {
      const res = await fetch(`/api/encuestas?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (id === 'all') {
          setSurveyHistory([]);
        } else {
          setSurveyHistory(prev => prev.filter(item => item.id !== id));
        }
        playChimeSound(true);
      } else {
        alert("Error al eliminar del historial.");
        playChimeSound(false);
      }
    } catch (e) {
      alert("Error de red al conectar con el servidor.");
    }
  };

  const group = grupos[selectedGroup];

  // Prevent flicker during load
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center font-bold text-slate-500 animate-pulse text-lg">Cargando panel...</div>
      </div>
    );
  }

  // PASSCODE PROTECTION LOGIN SCREEN
  if (!isAuthorized) {
    return (
      <main className="min-h-screen relative flex items-center justify-center bg-[#F8FAFC] px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_rgba(13,148,136,0.12)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_bottom_left,_rgba(249,115,22,0.08)_0%,_transparent_60%)] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <Reveal>
            <div className="bg-white/80 backdrop-blur-xl border-4 border-slate-900 p-8 rounded-3xl shadow-[8px_8px_0_rgba(15,23,42,1)] text-slate-900">
              
              <div className="text-center mb-6">
                <span className="text-4xl block mb-3 animate-bounce">🔑</span>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Acceso Restringido
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">
                  Código de Seguridad Docente
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-800 uppercase">
                    Usuario:
                  </label>
                  <input 
                    type="text"
                    value={usernameInput}
                    onChange={e => {
                      setUsernameInput(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="Usuario docente"
                    className="w-full border-3 border-slate-900 px-4 py-3 rounded-2xl text-base font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 bg-white"
                    required
                  />
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs font-extrabold text-slate-800 uppercase">
                    Contraseña:
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={e => {
                        setPasswordInput(e.target.value);
                        setLoginError("");
                      }}
                      placeholder="••••••••"
                      className="w-full border-3 border-slate-900 px-4 py-3.5 rounded-2xl text-base font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[50%] -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase cursor-pointer"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-red-500 text-center animate-pulse bg-red-50 py-2.5 rounded-xl border border-red-200">
                    ❌ {loginError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Link 
                    href="/" 
                    className="flex-1 text-center py-3.5 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-2xl text-xs sm:text-sm active:translate-y-0.5 active:translate-x-0.5 transition-all shadow-[2px_2px_0_rgba(15,23,42,1)]"
                  >
                    ← Volver al Inicio
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-extrabold rounded-2xl text-xs sm:text-sm border-2 border-slate-900 active:translate-y-0.5 active:translate-x-0.5 transition-all shadow-[3px_3px_0_rgba(15,23,42,1)] cursor-pointer"
                  >
                    Entrar al Panel 🚀
                  </button>
                </div>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block leading-normal">
                  Este panel permite modificar contenidos en tiempo real. Utiliza el código del docente para administrar el currículo e imágenes de MovilArt Studio.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    );
  }

  // AUTHORIZED FULL ADMIN DASHBOARD SCREEN
  return (
    <main className="min-h-screen px-4 pt-24 pb-28 relative bg-[#F8FAFC]">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.08)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <div>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-bold tracking-wider uppercase">
              ← Volver al Inicio
            </Link>
            <h1 className="text-3xl md:text-4xl mt-3 font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Panel de <span className="text-teal-600">Administración</span>
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1">Sube, baja y gestiona contenidos de los grupos escolares y lee sugerencias</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleResetAllStudentProgress}
              disabled={isResettingAll}
              className="bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-700 hover:text-amber-800 px-5 py-2.5 rounded-2xl font-extrabold text-xs border border-amber-200 shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              {isResettingAll ? "⏳ Limpiando..." : "🧹 Restablecer Progreso Alumnos"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-5 py-2.5 rounded-2xl font-extrabold text-xs border border-red-200 shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              🔒 Cerrar Sesión Docente
            </button>
          </div>
        </div>

        {/* ── SECCIÓN DE ARCHIVOS GLOBALES Y TESIS ── */}
        <div className="grid md:grid-cols-2 gap-8 mb-10 text-white">
          
          {/* Tarjeta 1: Distribución Global de PDFs */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📢</span>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Repartir Archivo Global
                  </h2>
                </div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium leading-relaxed">
                  Sube un archivo (como el <strong className="text-white">PDF PARA EL ADMINISTRADOR</strong>) y se enviará automáticamente a la sección de Fichas/PDFs de <strong>TODOS los grupos (1 al 5)</strong> al mismo tiempo.
                </p>
              </div>
              
              <div>
                <label className={`cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-purple-700 hover:bg-purple-50 text-xs font-black rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 ${uploadingGlobal ? "opacity-70 pointer-events-none" : ""}`}>
                  {uploadingGlobal ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Repartiendo a grupos...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">📤</span>
                      <span>Subir PDF y Repartir a Todos</span>
                    </>
                  )}
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleGlobalFichaUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Tesis de Grado - Proyecto Joan */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🎓</span>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Tesis de Grado: Proyecto Joan
                  </h2>
                </div>
                <p className="text-teal-100 text-xs sm:text-sm font-medium leading-relaxed">
                  Sube y actualiza el PDF oficial de tu proyecto de tesis de grado. El enlace en la sección de Fundamentación Teórica del inicio se actualizará automáticamente y cambiará a color destacado para habilitar su descarga.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <label className={`cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-teal-700 hover:bg-teal-50 text-xs font-black rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 ${uploadingJoanTesis ? "opacity-70 pointer-events-none" : ""}`}>
                  {uploadingJoanTesis ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Subiendo tesis...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">📤</span>
                      <span>Subir PDF Tesis</span>
                    </>
                  )}
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleJoanTesisUpload} />
                </label>

                {proyectoJoanUrl ? (
                  <div className="flex items-center gap-2">
                    <a 
                      href={proyectoJoanUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-850 hover:bg-teal-900 border border-teal-500 text-white text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer"
                    >
                      <span>👁️</span> Ver PDF
                    </a>
                    <button 
                      onClick={handleDeleteJoanTesis}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-600 hover:bg-rose-700 border border-rose-500 text-rose-100 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer"
                    >
                      <span>🗑️</span> Eliminar
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-teal-100/70 border border-teal-500/30 px-4 py-3 rounded-2xl bg-teal-800/20 italic">
                    Sin archivo (Botón desactivado en el inicio)
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 border-b border-slate-200 pb-4">
          <button 
            onClick={() => setActiveTab("grupos")} 
            className={`px-5 py-2.5 text-sm font-extrabold transition-all rounded-lg ${activeTab === "grupos" ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            📂 Gestión de Grupos
          </button>
          <button 
            onClick={() => {
              setActiveTab("sugerencias");
              setSugTabFilter("active");
            }} 
            className={`px-5 py-2.5 text-sm font-extrabold transition-all rounded-lg ${activeTab === "sugerencias" ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            📨 Buzón de Sugerencias ({sugerencias.filter(s => !s.archived).length})
          </button>
          <button 
            onClick={() => {
              setActiveTab("evaluaciones");
              setEvalTabFilter("active");
            }} 
            className={`px-5 py-2.5 text-sm font-extrabold transition-all rounded-lg ${activeTab === "evaluaciones" ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            🎓 Evaluaciones Recibidas ({evaluaciones.filter(e => !e.archived).length})
          </button>
          <button 
            onClick={() => setActiveTab("videos")} 
            className={`px-5 py-2.5 text-sm font-extrabold transition-all rounded-lg ${activeTab === "videos" ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            🎥 Videos de Paisajes
          </button>
          <button 
            onClick={() => setActiveTab("encuestas")} 
            className={`px-5 py-2.5 text-sm font-extrabold transition-all rounded-lg ${activeTab === "encuestas" ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            📊 Encuestas en Vivo
          </button>
        </div>

        {/* ── GRUPOS TAB ── */}
        {activeTab === "grupos" && group && (
          <div className="anim-fade-in grid md:grid-cols-4 gap-8">
            {/* Sidebar Selector */}
            <div className="col-span-1 space-y-2">
              <h3 className="font-extrabold text-slate-800 mb-4 uppercase text-xs tracking-wider">Seleccionar Grupo</h3>
              {Object.keys(grupos).map(k => (
                <button 
                  key={k} 
                  onClick={() => setSelectedGroup(k)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl font-black transition-all border-2 ${selectedGroup === k ? 'bg-teal-50 border-teal-500 text-white shadow-md scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}
                >
                  {grupos[k].name}
                </button>
              ))}
            </div>

            {/* Editor Principal */}
            <div className="col-span-1 md:col-span-3 space-y-8">

              {/* Control de Acceso Triviarte */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">Control de la Evaluación Triviarte</h3>
                <p className="text-xs text-slate-500 mb-4 font-bold">Habilita o deshabilita la prueba para este grupo: <strong className="text-slate-800">{group?.name}</strong></p>
                
                {/* Estado actual */}
                <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 border ${group?.triviarteEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 ${group?.triviarteEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                  <span className={`font-black text-sm ${group?.triviarteEnabled ? 'text-emerald-800' : 'text-red-800'}`}>
                    {group?.triviarteEnabled ? '🟢 ABIERTA — Los estudiantes pueden entrar' : '🔴 CERRADA — Evaluación bloqueada'}
                  </span>
                </div>

                {/* Dos botones separados: uno para abrir, otro para cerrar */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={async () => {
                      const r = await fetch('/api/toggle-evaluacion', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ grupoId: selectedGroup, enabled: true }) });
                      const j = await r.json();
                      if (j.success) { 
                        fetch('/api/grupos?t='+Date.now()).then(x=>x.json()).then(setGrupos); 
                        if(socket) socket.emit('toggle_evaluacion',{grupoId:selectedGroup,enabled:true});
                        playChimeSound(true); 
                        alert('🟢 Evaluación ABIERTA para ' + selectedGroup); 
                      }
                      else alert('Error: ' + j.error);
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-sm border-2 border-emerald-700 cursor-pointer active:scale-95 transition-all shadow-md"
                  >
                    🔓 ABRIR EVALUACIÓN
                  </button>
                  <button
                    onClick={async () => {
                      const r = await fetch('/api/toggle-evaluacion', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ grupoId: selectedGroup, enabled: false }) });
                      const j = await r.json();
                      if (j.success) { 
                        fetch('/api/grupos?t='+Date.now()).then(x=>x.json()).then(setGrupos); 
                        if(socket) socket.emit('toggle_evaluacion',{grupoId:selectedGroup,enabled:false});
                        playChimeSound(true); 
                        alert('🔒 Evaluación CERRADA para ' + selectedGroup); 
                      }
                      else alert('Error: ' + j.error);
                    }}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-sm border-2 border-rose-700 cursor-pointer active:scale-95 transition-all shadow-md"
                  >
                    🔒 CERRAR EVALUACIÓN
                  </button>
                </div>
              </div>

              
              {/* Info básica */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">Información del Grupo</h3>
                <p className="text-xs text-slate-500 mb-4 font-semibold">Modifica el texto descriptivo del grupo de grados.</p>
                <textarea 
                  value={group.info} 
                  onChange={e => setGrupos(p => ({...p, [group.id]: {...p[group.id], info: e.target.value}}))}
                  className="w-full border border-slate-200 rounded-2xl p-4 h-24 mb-4 focus:outline-teal-500 font-semibold text-slate-700" 
                />
                <button onClick={() => handleUpdateGroup(group.id, { info: group.info })} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm">
                  Guardar Información
                </button>
              </div>

              {/* Videos */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Videos</h3>
                    <p className="text-xs text-slate-500 font-semibold">Agrega URLs de YouTube/MP4 o sube un video directamente desde tu computador.</p>
                  </div>
                  {/* File Upload Button */}
                  <label className={`cursor-pointer px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-bold rounded-xl transition-all ${uploading === "video" ? "opacity-50 pointer-events-none" : ""}`}>
                    <span>{uploading === "video" ? "⌛ Subiendo..." : "📁 Subir Video Local"}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, "video")} />
                  </label>
                </div>

                <div className="space-y-4 mb-6">
                  {group.videos.length === 0 ? (
                    <p className="text-slate-400 text-sm italic font-medium py-2">No hay videos en este grupo.</p>
                  ) : (
                    group.videos.map((vid, idx) => (
                      <div key={vid.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <input type="text" value={vid.title || ''} readOnly className="border-0 bg-transparent p-2 text-sm font-bold text-slate-700 flex-1 cursor-default outline-none" placeholder="Título" />
                        <input type="text" value={vid.url} readOnly className="border-0 bg-transparent p-2 text-xs font-semibold text-slate-400 flex-2 w-full cursor-default outline-none truncate" placeholder="URL" />
                        <button onClick={() => {
                          const newVids = [...group.videos]; newVids.splice(idx, 1);
                          handleUpdateGroup(group.id, { videos: newVids });
                        }} className="bg-red-50 text-red-600 p-2 rounded-xl font-bold hover:bg-red-100 transition-colors">✕</button>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={e => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const title = fd.get('title') as string;
                  const url = fd.get('url') as string;
                  handleUpdateGroup(group.id, { videos: [...group.videos, { id: Math.random().toString(), title, url }] });
                  e.currentTarget.reset();
                }} className="flex gap-2 flex-col sm:flex-row">
                  <input name="title" placeholder="Título del video de internet" required className="border border-slate-200 p-3 rounded-2xl text-sm font-semibold flex-1" />
                  <input name="url" placeholder="URL del video de YouTube" required className="border border-slate-200 p-3 rounded-2xl text-sm font-semibold flex-2" />
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all">+ Agregar URL</button>
                </form>
              </div>

              {/* Fichas */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Fichas / PDFs Descargables</h3>
                    <p className="text-xs text-slate-500 font-semibold">Sube archivos PDF desde tu equipo o escribe URLs de internet.</p>
                  </div>
                  {/* File Upload Button */}
                  <label className={`cursor-pointer px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-xs font-bold rounded-xl transition-all ${uploading === "ficha" ? "opacity-50 pointer-events-none" : ""}`}>
                    <span>{uploading === "ficha" ? "⌛ Subiendo..." : "📁 Subir PDF Local"}</span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={e => handleFileUpload(e, "ficha")} />
                  </label>
                </div>

                <div className="space-y-4 mb-6">
                  {group.fichas.length === 0 ? (
                    <p className="text-slate-400 text-sm italic font-medium py-2">No hay fichas en este grupo.</p>
                  ) : (
                    group.fichas.map((f, idx) => (
                      <div key={f.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <input type="text" value={f.title} readOnly className="border-0 bg-transparent p-2 text-sm font-bold text-slate-700 flex-1 outline-none" />
                        <input type="text" value={f.url} readOnly className="border-0 bg-transparent p-2 text-xs font-semibold text-slate-400 flex-2 w-full outline-none truncate" />
                        <button onClick={() => {
                          const newFichas = [...group.fichas]; newFichas.splice(idx, 1);
                          handleUpdateGroup(group.id, { fichas: newFichas });
                        }} className="bg-red-50 text-red-600 p-2 rounded-xl font-bold hover:bg-red-100 transition-colors">✕</button>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={e => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const title = fd.get('title') as string;
                  const url = fd.get('url') as string;
                  handleUpdateGroup(group.id, { fichas: [...group.fichas, { id: Math.random().toString(), title, url }] });
                  e.currentTarget.reset();
                }} className="flex gap-2 flex-col sm:flex-row">
                  <input name="title" placeholder="Nombre de la ficha" required className="border border-slate-200 p-3 rounded-2xl text-sm font-semibold flex-1" />
                  <input name="url" placeholder="URL externa del PDF" required className="border border-slate-200 p-3 rounded-2xl text-sm font-semibold flex-2" />
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all">+ Agregar URL</button>
                </form>
              </div>

              {/* Imágenes de la Galería */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Galería de Imágenes del Grupo</h3>
                    <p className="text-xs text-slate-500 font-semibold">Gestiona el mural de fotos escolares del grupo.</p>
                  </div>
                  {/* File Upload Button */}
                  <label className={`cursor-pointer px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-all ${uploading === "image" ? "opacity-50 pointer-events-none" : ""}`}>
                    <span>{uploading === "image" ? "⌛ Subiendo..." : "🖼️ Subir Imagen Local"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, "image")} />
                  </label>
                </div>

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 mt-4">
                  {(!group.images || group.images.length === 0) ? (
                    <p className="text-slate-400 text-sm italic font-medium py-2 col-span-4">No hay imágenes en la galería de este grupo.</p>
                  ) : (
                    group.images.map((img, idx) => (
                      <div key={img.id} className="relative aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden group">
                        <img src={img.url} alt="Galería" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => {
                            const newImgs = [...group.images]; newImgs.splice(idx, 1);
                            handleUpdateGroup(group.id, { images: newImgs });
                          }} 
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all shadow-md text-xs cursor-pointer z-10"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={e => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const url = fd.get('url') as string;
                  handleUpdateGroup(group.id, { images: [...(group.images || []), { id: Math.random().toString(), url }] });
                  e.currentTarget.reset();
                }} className="flex gap-2">
                  <input name="url" placeholder="O pega una URL de imagen de internet" required className="border border-slate-200 p-3 rounded-2xl text-sm font-semibold flex-1" />
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all">+ Agregar URL</button>
                </form>
              </div>

              {/* Test / Evaluaciones */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
                <h3 className="font-extrabold text-lg text-slate-900 mb-1">Banco de Preguntas</h3>
                <p className="text-xs text-slate-500 font-semibold mb-4">Crea, edita o elimina preguntas de opción múltiple del grupo escolar.</p>

                {/* Question List */}
                <div className="space-y-4 mb-8">
                  {(!group.tests || group.tests.length === 0) ? (
                    <p className="text-slate-400 text-sm italic font-medium py-2">No hay preguntas de test en este grupo aún.</p>
                  ) : (
                    group.tests.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 relative">
                        <button 
                          onClick={() => {
                            const newTests = [...group.tests]; newTests.splice(idx, 1);
                            handleUpdateGroup(group.id, { tests: newTests });
                          }}
                          className="absolute top-4 right-4 bg-red-50 text-red-600 hover:bg-red-100 w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-all text-xs"
                        >
                          ✕
                        </button>
                        <p className="font-bold text-slate-800 pr-10 text-sm sm:text-base">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="mt-3 grid sm:grid-cols-2 gap-2 pl-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`text-xs font-semibold p-2 rounded-lg border ${oIdx === q.correctAnswerIndex ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-slate-100 text-slate-600'}`}>
                              <span className="mr-1">{oIdx === q.correctAnswerIndex ? '✓' : '•'}</span> {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form to Add Question */}
                <form onSubmit={handleAddQuestion} className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">📝 Crear Nueva Pregunta</h4>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700">Enunciado de la Pregunta:</label>
                    <input 
                      type="text" 
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      placeholder="Ej. ¿Cuáles son los tres colores primarios?"
                      className="border border-slate-200 p-3 rounded-2xl text-sm font-semibold bg-white"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-700">Opción {oIdx + 1}:</label>
                        <input 
                          type="text"
                          value={opt}
                          onChange={e => {
                            const newOpts = [...options];
                            newOpts[oIdx] = e.target.value;
                            setOptions(newOpts);
                          }}
                          placeholder={`Opción ${oIdx + 1}`}
                          className="border border-slate-200 p-3 rounded-2xl text-sm font-semibold bg-white"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-1/2 pt-2">
                    <label className="text-xs font-bold text-slate-700">Seleccionar Opción Correcta:</label>
                    <select 
                      value={correctIndex}
                      onChange={e => setCorrectIndex(Number(e.target.value))}
                      className="border border-slate-200 p-3 rounded-2xl text-sm font-bold bg-white"
                    >
                      <option value={0}>Opción 1</option>
                      <option value={1}>Opción 2</option>
                      <option value={2}>Opción 3</option>
                      <option value={3}>Opción 4</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md">
                    + Añadir Pregunta al Banco
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ── SUGERENCIAS TAB ── */}
        {activeTab === "sugerencias" && (
          <div className="anim-fade-in space-y-6 col-span-4 w-full">
            {/* Filtros de la bandeja de sugerencias */}
            <div className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
              <button
                onClick={() => setSugTabFilter("active")}
                className={`flex-1 py-2 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  sugTabFilter === "active"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                📥 Activas ({sugerencias.filter(s => !s.archived).length})
              </button>
              <button
                onClick={() => setSugTabFilter("archived")}
                className={`flex-1 py-2 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  sugTabFilter === "archived"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                📦 Archivadas ({sugerencias.filter(s => s.archived).length})
              </button>
            </div>

            {/* Listado filtrado de sugerencias */}
            <div className="grid gap-4 md:grid-cols-2">
              {sugerencias.filter(s => sugTabFilter === "active" ? !s.archived : s.archived).length === 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center col-span-2 py-12">
                  <span className="text-3xl block mb-2">📨</span>
                  <p className="text-slate-500 font-bold text-sm">
                    No hay sugerencias en esta bandeja.
                  </p>
                </div>
              ) : (
                sugerencias
                  .filter(s => sugTabFilter === "active" ? !s.archived : s.archived)
                  .map(sug => (
                    <div key={sug.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/60 flex flex-col justify-between hover:shadow-lg transition-shadow">
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base">{sug.name}</h3>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Sugerencia Comunitaria</span>
                          </div>
                          <span className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                            {new Date(sug.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 bg-slate-50/70 p-4 rounded-xl italic font-semibold text-sm leading-relaxed border border-slate-100">
                          "{sug.message}"
                        </p>
                      </div>

                      {/* Botonera de acciones de moderación */}
                      <div className="flex justify-end gap-2.5 mt-5 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => handleArchiveSuggestion(sug.id, !!sug.archived)}
                          className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            sug.archived
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 hover:border-emerald-300"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {sug.archived ? (
                            <>
                              <span>📤</span>
                              <span>Desarchivar</span>
                            </>
                          ) : (
                            <>
                              <span>📦</span>
                              <span>Archivar</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSuggestion(sug.id)}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <span>🗑️</span>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ── EVALUACIONES TAB ── */}
        {activeTab === "evaluaciones" && (
          <div className="anim-fade-in space-y-6 col-span-4 w-full">

            {/* Consola de Control de Exámenes en Vivo */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">Consola de Control de Exámenes (Triviarte)</h3>
              <p className="text-xs text-slate-500 mb-4 font-bold">Abre o cierra el examen de cada grupo para que los estudiantes puedan ingresar desde sus salones.</p>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.keys(grupos).map((gId) => {
                  const g = grupos[gId];
                  return (
                    <div key={gId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between gap-3 shadow-xs">
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{g.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2 h-2 rounded-full ${g.triviarteEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-350'}`} />
                          <span className="text-[10px] text-slate-500 font-bold">
                            {g.triviarteEnabled ? '🟢 Habilitado al público' : '🔴 Bloqueado (Bajo Candado)'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const r = await fetch('/api/toggle-evaluacion', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ grupoId: gId, enabled: true }) });
                            const j = await r.json();
                            if (j.success) { fetch('/api/grupos?t='+Date.now()).then(x=>x.json()).then(setGrupos); if(socket) socket.emit('toggle_evaluacion',{grupoId:gId,enabled:true}); playChimeSound(true); }
                            else alert('Error: ' + j.error);
                          }}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-[11px] border-2 border-emerald-700 cursor-pointer active:scale-95 transition-all"
                        >
                          🔓 Abrir
                        </button>
                        <button
                          onClick={async () => {
                            const r = await fetch('/api/toggle-evaluacion', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ grupoId: gId, enabled: false }) });
                            const j = await r.json();
                            if (j.success) { fetch('/api/grupos?t='+Date.now()).then(x=>x.json()).then(setGrupos); if(socket) socket.emit('toggle_evaluacion',{grupoId:gId,enabled:false}); playChimeSound(true); }
                            else alert('Error: ' + j.error);
                          }}
                          className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-[11px] border-2 border-rose-700 cursor-pointer active:scale-95 transition-all"
                        >
                          🔒 Cerrar
                        </button>
                      </div>
                    </div>

                  );
                })}
              </div>
            </div>

            {/* Filtros de la bandeja de calificaciones */}
            <div className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
              <button
                onClick={() => setEvalTabFilter("active")}
                className={`flex-1 py-2 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  evalTabFilter === "active"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                🎓 Activas ({evaluaciones.filter(e => !e.archived).length})
              </button>
              <button
                onClick={() => setEvalTabFilter("archived")}
                className={`flex-1 py-2 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  evalTabFilter === "archived"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                📦 Archivadas ({evaluaciones.filter(e => e.archived).length})
              </button>
            </div>

            {/* Listado de evaluaciones */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {evaluaciones.filter(e => evalTabFilter === "active" ? !e.archived : e.archived).length === 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center col-span-full py-12">
                  <span className="text-3xl block mb-2">🎓</span>
                  <p className="text-slate-500 font-bold text-sm">
                    No hay evaluaciones en esta bandeja.
                  </p>
                </div>
              ) : (
                evaluaciones
                  .filter(e => evalTabFilter === "active" ? !e.archived : e.archived)
                  .map(evalu => {
                    const totalHearts = 7;
                    const heartsArray = Array.from({ length: totalHearts }, (_, i) => i < evalu.heartsLeft);
                    return (
                      <div key={evalu.id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-200/60 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden">
                        {/* Etiqueta decorativa del grupo */}
                        <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-bl-2xl">
                          {evalu.grupoName}
                        </div>
                        
                        <div>
                          <div className="mb-4">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estudiante</span>
                            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{evalu.studentName}</h3>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1">
                              📅 {new Date(evalu.date).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500 font-bold">Puntaje Obtenido:</span>
                              <span className="text-sm font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100">
                                ⭐ {evalu.points} Artipuntos
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500 font-bold">Corazones Restantes:</span>
                              <div className="flex gap-0.5 text-xs">
                                {heartsArray.map((isFilled, idx) => (
                                  <span key={idx} className="transition-transform hover:scale-110">
                                    {isFilled ? "❤️" : "🖤"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-end gap-2 mt-2 border-t border-slate-100 pt-4">
                          <button
                            onClick={() => handleArchiveEvaluation(evalu.id, !!evalu.archived)}
                            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                              evalu.archived
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 hover:border-emerald-300"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {evalu.archived ? (
                              <>
                                <span>📤</span>
                                <span>Desarchivar</span>
                              </>
                            ) : (
                              <>
                                <span>📦</span>
                                <span>Archivar</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteEvaluation(evalu.id)}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ── VIDEOS TAB ── */}
        {activeTab === "videos" && (
          <div className="anim-fade-in space-y-6 col-span-4 w-full text-slate-900">
            {/* Header info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                🎥 Gestión de Videos de Colombia Viva
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Esta consola te permite cambiar el video explicativo oficial que ven los estudiantes cuando ingresan a cada uno de los <strong>6 paisajes interactivos 3D</strong> en la sección <em>Colombia Viva</em> de la app. Los estudiantes solo podrán ver el video que configures aquí y <strong>ya no podrán modificarlo ellos mismos</strong>.
              </p>
            </div>

            {/* List of landscapes with inputs */}
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  id: "la-paloma-de-la-paz",
                  title: "La Paloma de la Paz",
                  subtitle: "Símbolo de reconciliación nacional",
                  image: "/images/gallery/dove_peace.png",
                  description: "Representa el perdón y la restauración de la empatía entre las comunidades rurales y urbanas."
                },
                {
                  id: "cano-cristales",
                  title: "Caño Cristales",
                  subtitle: "El río de los 7 colores",
                  image: "/images/gallery/cano_cristales.png",
                  description: "Representa la pureza, resiliencia y biodiversidad de la Sierra de la Macarena."
                },
                {
                  id: "valle-cocora",
                  title: "Valle del Cocora",
                  subtitle: "Palmas de cera y niebla mágica",
                  image: "/images/gallery/valle_cocora.png",
                  description: "Árbol nacional, representa la rectitud moral, altura de miras y la unión colectiva."
                },
                {
                  id: "condor-andes",
                  title: "El Cóndor de los Andes",
                  subtitle: "Majestuosidad, soberanía y libertad",
                  image: "/images/gallery/condor_andes.png",
                  description: "Símbolo patrio de libertad de pensamiento y perspectiva elevada frente al conflicto."
                },
                {
                  id: "mascaras-teatro",
                  title: "Máscaras del Teatro",
                  subtitle: "Expresión, cultura y emoción",
                  image: "/images/masks_theater.png",
                  description: "Exteriorización de emociones y catarsis a través de comparsas de carnaval por la paz."
                },
                {
                  id: "paleta-artista",
                  title: "La Paleta del Artista",
                  subtitle: "El color como lenguaje integrador",
                  image: "/images/palette_art.png",
                  description: "Expresión de la diversidad y capacidad de sanar realidades duras a través del lienzo escolar."
                }
              ].map((landscape) => {
                const currentUrl = landscapeVideos[landscape.id] || "";
                return (
                  <div key={landscape.id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-200/60 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden">
                    {/* Upper decorative badge */}
                    <div className="absolute top-0 right-0 bg-teal-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-2xl">
                      ID: {landscape.id}
                    </div>

                    <div>
                      {/* Title & Info */}
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <img 
                            src={landscape.image} 
                            alt={landscape.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as any).src = 'https://placehold.co/100x100?text=Arte'; }}
                          />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base leading-tight">{landscape.title}</h4>
                          <p className="text-teal-600 text-xs font-bold mt-0.5">{landscape.subtitle}</p>
                          <p className="text-slate-400 text-[11px] leading-tight mt-1">{landscape.description}</p>
                        </div>
                      </div>

                      {/* Inputs & Actions */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">
                            URL del Video (YouTube o MP4 directo):
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              key={landscape.id + "-" + currentUrl}
                              defaultValue={currentUrl}
                              placeholder="Ej: https://www.youtube.com/watch?v=..."
                              id={`url-input-${landscape.id}`}
                              className="flex-1 text-slate-900 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(`url-input-${landscape.id}`) as HTMLInputElement;
                                if (input) {
                                  handleUpdateLandscapeVideo(landscape.id, input.value.trim());
                                }
                              }}
                              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              <span>💾</span>
                              <span>Guardar</span>
                            </button>
                          </div>
                        </div>

                        {/* Current Active Preview */}
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-slate-200/60 pt-2.5">
                          <span>Estado actual:</span>
                          {currentUrl ? (
                            <a 
                              href={currentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-teal-600 hover:underline flex items-center gap-1 overflow-hidden max-w-[200px] text-ellipsis whitespace-nowrap"
                            >
                              🌐 Ver video configurado
                            </a>
                          ) : (
                            <span className="text-amber-500">Sin video asignado (usa por defecto)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ENCUESTAS TAB ── */}
        {activeTab === "encuestas" && (
          <div className="anim-fade-in space-y-8 col-span-4 w-full text-slate-900">
            {/* Header info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                📊 Sistema de Encuestas en Vivo
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Crea y lanza encuestas en vivo para que los estudiantes de todos los grupos respondan a través de una notificación flotante no intrusiva en sus pantallas.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Formulario de Creación */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between">
                <form onSubmit={handleLaunchSurvey} className="space-y-6">
                  <h4 className="font-extrabold text-slate-800 text-base uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span>🚀</span> Lanzar Nueva Encuesta
                  </h4>

                  {/* Pregunta */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Pregunta de la Encuesta:</label>
                    <input 
                      type="text"
                      value={surveyQuestion}
                      onChange={e => setSurveyQuestion(e.target.value)}
                      placeholder="Ej. ¿Cómo te sientes respecto al reto de pintura?"
                      className="border-2 border-slate-200 p-3 rounded-2xl text-sm font-semibold bg-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  {/* Modelo */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Modelo de Encuesta:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="radio" 
                          name="surveyType" 
                          value="choice" 
                          checked={surveyType === "choice"} 
                          onChange={() => setSurveyType("choice")} 
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Opción Múltiple</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="radio" 
                          name="surveyType" 
                          value="rating" 
                          checked={surveyType === "rating"} 
                          onChange={() => setSurveyType("rating")} 
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Valoración Emocional (Emojis)</span>
                      </label>
                    </div>
                  </div>

                  {/* Inputs específicos según modelo */}
                  {surveyType === "choice" ? (
                    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Configurar opciones (mínimo 2):</p>
                      <div className="grid gap-3">
                        {surveyOptions.map((opt, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500">Opción {idx + 1}:</span>
                            <input 
                              type="text"
                              value={opt}
                              onChange={e => {
                                const newOpts = [...surveyOptions];
                                newOpts[idx] = e.target.value;
                                setSurveyOptions(newOpts);
                              }}
                              placeholder={idx < 2 ? `Opción obligatoria ${idx + 1}` : `Opción opcional ${idx + 1}`}
                              className="border border-slate-200 p-2.5 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-teal-500"
                              required={idx < 2}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Vista previa de emojis de reacción:</p>
                      <div className="flex justify-around items-center text-3xl p-2 bg-white rounded-xl border border-slate-200">
                        <span title="Me encanta">🤩</span>
                        <span title="Bien">😊</span>
                        <span title="Normal">😐</span>
                        <span title="Triste">😢</span>
                        <span title="Enojado">😡</span>
                      </div>
                    </div>
                  )}

                  {/* Duración */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Duración de la Encuesta:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Horas</span>
                        <input 
                          type="number"
                          min={0}
                          max={168}
                          value={durationHours}
                          onChange={e => setDurationHours(Math.max(0, Number(e.target.value)))}
                          className="w-full border-2 border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-teal-500"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Minutos</span>
                        <input 
                          type="number"
                          min={0}
                          max={59}
                          value={durationMinutes}
                          onChange={e => setDurationMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                          className="w-full border-2 border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-teal-500"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Segundos</span>
                        <input 
                          type="number"
                          min={0}
                          max={59}
                          value={durationSeconds}
                          onChange={e => setDurationSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                          className="w-full border-2 border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!!liveSurvey}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl border-2 border-slate-900 active:translate-y-0.5 active:translate-x-0.5 transition-all shadow-[4px_4px_0_rgba(15,23,42,1)] cursor-pointer"
                  >
                    {liveSurvey ? "⏳ Hay una encuesta activa" : "Lanzar Encuesta en Vivo 🚀"}
                  </button>
                </form>
              </div>

              {/* Panel de Resultados en Vivo */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between min-h-[300px]">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2 mb-6">
                    <span>📊</span> Resultados en Tiempo Real
                  </h4>

                  {liveSurvey ? (
                    <div className="space-y-6">
                      {/* Información de la encuesta */}
                      <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                        <span className="text-[10px] text-teal-700 font-extrabold uppercase tracking-wider block mb-1">Encuesta Activa</span>
                        <p className="font-black text-slate-900 text-base leading-tight">
                          {liveSurvey.question}
                        </p>
                        <div className="flex justify-between items-center mt-3 text-xs text-slate-500 font-bold pt-2 border-t border-teal-100/50">
                          <span>Modelo: {liveSurvey.type === 'choice' ? 'Opción Múltiple' : 'Valoración Emocional'}</span>
                          <span className="text-rose-600 animate-pulse font-extrabold">⏱️ Quedan: {formatTimeLeft(adminSecondsLeft)}</span>
                          <span className="text-teal-600">Total Votos: {liveSurvey.totalVotes || 0}</span>
                        </div>
                      </div>

                      {/* Resultados / Barras de progreso */}
                      <div className="space-y-4">
                        {Object.entries(liveSurvey.votes || {}).map(([option, count]) => {
                          const c = count as number;
                          const total = liveSurvey.totalVotes || 0;
                          const percentage = total > 0 ? Math.round((c / total) * 100) : 0;
                          return (
                            <div key={option} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-extrabold text-slate-700">
                                <span>{option}</span>
                                <span>{c} votos ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                                <div 
                                  className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Botón de cierre manual */}
                      <div className="pt-4 border-t border-slate-150 flex justify-end">
                        <button
                          onClick={handleCloseSurveyManual}
                          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-5 py-2.5 rounded-xl font-extrabold text-xs border border-red-200 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
                        >
                          🛑 Cerrar Encuesta Manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                      <span className="text-5xl mb-4">💤</span>
                      <p className="font-bold text-sm">No hay ninguna encuesta activa en este momento.</p>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">Completa el formulario de la izquierda y presiona "Lanzar Encuesta" para iniciar.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Historial de Encuestas Pasadas */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md w-full mt-10">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6 flex-wrap gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base uppercase tracking-wider flex items-center gap-2">
                    <span>📜</span> Historial de Encuestas Realizadas
                  </h4>
                  <p className="text-slate-500 text-xs font-semibold mt-1">Revisa los resultados y participación de las encuestas pasadas.</p>
                </div>
                {surveyHistory.length > 0 && (
                  <button
                    onClick={() => handleDeleteHistoryItem('all')}
                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-2 rounded-xl font-extrabold text-xs border border-red-200 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span>🗑️</span> Borrar Todo el Historial
                  </button>
                )}
              </div>

              {surveyHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <span className="text-4xl mb-3">📭</span>
                  <p className="font-bold text-sm">No hay registro de encuestas finalizadas aún.</p>
                  <p className="text-xs text-slate-400 mt-1">Los resultados se guardarán aquí una vez finalicen los temporizadores de las encuestas.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {surveyHistory.map((item) => (
                    <div key={item.id} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all relative">
                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="absolute top-4 right-4 bg-red-50 text-red-600 hover:bg-red-100 w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all text-xs"
                        title="Eliminar registro"
                      >
                        ✕
                      </button>

                      <div>
                        <div className="mb-3">
                          <span className="text-[9px] text-teal-600 font-extrabold uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                            {item.type === 'choice' ? 'Opción Múltiple' : 'Emojis'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-2">
                            📅 {new Date(item.date).toLocaleString('es-CO')}
                          </span>
                          <h5 className="font-extrabold text-slate-900 text-sm mt-1.5 leading-snug">
                            {item.question}
                          </h5>
                        </div>

                        {/* Detalle de Votación */}
                        <div className="space-y-2 mt-4 bg-white p-3 rounded-xl border border-slate-100">
                          {Object.entries(item.votes || {}).map(([option, count]) => {
                            const c = count as number;
                            const total = item.totalVotes || 0;
                            const percentage = total > 0 ? Math.round((c / total) * 100) : 0;
                            return (
                              <div key={option} className="space-y-0.5">
                                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                                  <span className="truncate max-w-[120px]">{option}</span>
                                  <span>{c} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                  <div 
                                    className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-150 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                        <span>Total de Votos: <strong className="text-slate-800">{item.totalVotes}</strong></span>
                        <span>Duración: {formatTimeLeft(item.duration)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
