import { useEffect, useState } from 'react';

type TipoToast = 'sucesso' | 'erro' | 'aviso' | 'info';

interface ToastProps {
  mensagem: string;
  tipo: TipoToast;
  onClose: () => void;
}

const ESTILOS: Record<TipoToast, {
  bg: string;
  borda: string;
  sombra: string;
  icone: React.ReactNode;
}> = {
  sucesso: {
    bg: 'bg-emerald-500',
    borda: 'border-emerald-400',
    sombra: 'shadow-emerald-500/40',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  erro: {
    bg: 'bg-rose-500',
    borda: 'border-rose-400',
    sombra: 'shadow-rose-500/40',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  aviso: {
    bg: 'bg-amber-500',
    borda: 'border-amber-400',
    sombra: 'shadow-amber-500/40',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-sky-500',
    borda: 'border-sky-400',
    sombra: 'shadow-sky-500/40',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

const Toast = ({ mensagem, tipo, onClose }: ToastProps) => {
  const [visivel, setVisivel] = useState(false);
  const estilo = ESTILOS[tipo];

  useEffect(() => {
    const show = setTimeout(() => setVisivel(true), 10);
    const hide = setTimeout(() => {
      setVisivel(false);
      setTimeout(onClose, 300);
    }, 3500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-48px)] max-w-sm -translate-x-1/2 transition-all duration-300 ${
        visivel ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border ${estilo.bg} ${estilo.borda} ${estilo.sombra}`}>

        {/* Ícone */}
        <div className="shrink-0 w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
          {estilo.icone}
        </div>

        {/* Mensagem */}
        <p className="text-white text-sm font-semibold flex-1 leading-snug">
          {mensagem}
        </p>

        {/* Fechar */}
        <button
          onClick={() => { setVisivel(false); setTimeout(onClose, 300); }}
          className="shrink-0 text-white/70 hover:text-white text-xl leading-none transition-colors cursor-pointer bg-transparent border-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
export type { TipoToast };
