import { useState, useEffect, ReactNode } from 'react';

interface ModalBaseProps {
  titulo: string;
  subtitulo?: string;
  corDestaque?: string; // Hex ou CSS variable
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const ModalBase = ({ titulo, subtitulo, corDestaque = 'var(--color-c-accent)', isOpen, onClose, children }: ModalBaseProps) => {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisivel(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisivel(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${visivel ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full sm:max-w-[460px] bg-c-surface sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          visivel ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* Header Estilizado */}
        <div
          className="relative px-6 pt-6 pb-8 transition-colors duration-300"
          style={{ backgroundColor: `color-mix(in srgb, ${corDestaque} 12%, transparent)` }}
        >
          {/* Drag handle — mobile */}
          <div className="sm:hidden w-10 h-1 rounded-full bg-c-border mx-auto mb-4" />

          {/* Fechar */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-c-text/10 hover:bg-c-text/20 flex items-center justify-center transition-all cursor-pointer border-none text-c-text/50 hover:text-c-text"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase mb-1">{subtitulo}</p>
          <h2 className="text-c-text text-2xl font-black">{titulo}</h2>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalBase;
