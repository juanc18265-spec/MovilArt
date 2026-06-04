"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "🏠", color: "from-blue-400 to-blue-600" },
  { href: "/#fundamentacion", label: "Proyecto", icon: "📖", color: "from-rose-400 to-rose-600" },
  { href: "/normativa", label: "Leyes", icon: "⚖️", color: "from-emerald-400 to-emerald-600" },
  { href: "/#emocionometro", label: "Emociones", icon: "🎭", color: "from-pink-400 to-pink-600" },
  { href: "/#grupos", label: "Grupos", icon: "👥", color: "from-teal-400 to-teal-600" },
  { href: "/#bienestar", label: "Bienestar", icon: "📱", color: "from-indigo-400 to-indigo-600" },
  { href: "/#juegos", label: "Juegos", icon: "🎮", color: "from-amber-400 to-amber-600" }
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl">
      <nav 
        className="bg-white/95 backdrop-blur-md px-3 py-2 md:px-6 shadow-[5px_5px_0_rgba(15,23,42,1)] md:shadow-[8px_8px_0_rgba(15,23,42,1)] border-3 md:border-4 border-slate-900 flex items-center justify-between gap-1 md:gap-0" 
        style={{ 
          borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");
          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={item.label}
              className={`relative flex flex-col items-center justify-center p-2.5 md:py-2 md:px-4 min-w-[38px] md:min-w-[75px] shrink-0 transition-all duration-300 z-10 group select-none
                ${isActive ? 'transform -translate-y-1 scale-105' : 'hover:-translate-y-0.5'}
              `}
            >
              {isActive ? (
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} border-2 border-slate-900 shadow-[2px_2px_0_rgba(0,0,0,1)] -z-10`} style={{ borderRadius: '12px 4px 12px 4px/4px 12px 4px 12px' }}></div>
              ) : (
                <div className="absolute inset-0 bg-slate-100 border-2 border-transparent group-hover:border-slate-300 opacity-0 group-hover:opacity-100 -z-10 transition-all" style={{ borderRadius: '12px 4px 12px 4px/4px 12px 4px 12px' }}></div>
              )}
              
              <div className={`text-xl md:text-2xl transition-transform duration-300 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                {item.icon}
              </div>
              <span className={`hidden md:block text-[9px] md:text-xs font-bold tracking-wide mt-0.5 md:mt-1 
                ${isActive ? 'text-white drop-shadow-md' : 'text-slate-500 group-hover:text-slate-900'}
              `} style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
