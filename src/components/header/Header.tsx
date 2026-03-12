import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usuarioService } from '../../services/usuarioService';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { label: 'Geral', rota: '/geral' },
  { label: 'Metas', rota: '/metas' },
  { label: 'Saldo', rota: '/saldo' },
  { label: 'Transações', rota: '/gastos' },
  { label: 'Investimentos', rota: '/investimentos' },
  { label: 'Cripto', rota: '/cripto' },
  { label: 'Calendário', rota: '/calendario' },
];

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => {
    usuarioService.logout();
    navigate('/');
  };

  const handleNavegar = (rota: string) => {
    navigate(rota);
    setMenuAberto(false);
  };

  const ThemeToggle = ({ className = '' }: { className?: string }) => (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center w-9 h-9 rounded-lg text-c-text/50 hover:text-c-text hover:bg-c-text/10 transition-all duration-200 cursor-pointer border-none bg-transparent ${className}`}
      aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {theme === 'dark' ? (
        /* Sol */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Lua */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      <header className="w-full bg-c-header border-b border-c-border">

        {/* Barra principal */}
        <div className="pl-0 pr-3 sm:pr-4 md:pr-6 py-1 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <img
              src="/logoeasy.png"
              alt="Easy"
              className="w-auto object-contain h-[min(20vw,6rem)] md:h-[42px] lg:h-[54px] xl:h-[64px] 2xl:h-[74px]"
            />
            <span
              className="inline font-black leading-none text-[min(5vw,1.5rem)] md:text-[13px] lg:text-[15px] xl:text-[18px] 2xl:text-xl -ml-[min(4vw,1.25rem)] md:-ml-2 lg:-ml-3 xl:-ml-4"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #06B6D4, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Easy
            </span>
          </div>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {navItems.map(({ label, rota }) => {
              const ativo = pathname === rota;
              return (
                <button
                  key={rota}
                  onClick={() => navigate(rota)}
                  className={`px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 cursor-pointer border-none
                    ${ativo
                      ? 'bg-c-accent text-white'
                      : 'text-c-text/60 hover:text-c-text hover:bg-c-text/10'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium text-c-text/60 hover:text-c-text hover:bg-c-text/10 transition-all duration-200 cursor-pointer border-none bg-transparent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden lg:inline">Sair</span>
            </button>
          </div>

          {/* Ações mobile */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex flex-col justify-center items-center w-9 h-9 rounded-lg text-c-text/60 hover:text-c-text hover:bg-c-text/10 transition-all duration-200 cursor-pointer border-none bg-transparent gap-1.5"
              aria-label="Abrir menu"
            >
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${menuAberto ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuAberto ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${menuAberto ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>

        </div>
      </header>

      {/* Overlay escuro */}
      {menuAberto && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Drawer mobile */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-c-header z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out border-l border-c-border
          ${menuAberto ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-c-border">
          <div className="flex items-center shrink-0">
            <img src="/logoeasy.png" alt="Easy" className="h-8 w-auto object-contain" />
            <span
              className="text-lg font-black leading-none -ml-2"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #06B6D4, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Easy
            </span>
          </div>
          <button
            onClick={() => setMenuAberto(false)}
            className="text-c-text/50 hover:text-c-text transition-colors cursor-pointer border-none bg-transparent p-1"
            aria-label="Fechar menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Itens de navegação */}
        <nav className="flex flex-col gap-1 px-4 py-4 flex-1">
          {navItems.map(({ label, rota }) => {
            const ativo = pathname === rota;
            return (
              <button
                key={rota}
                onClick={() => handleNavegar(rota)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border-none
                  ${ativo
                    ? 'bg-c-accent text-white'
                    : 'text-c-text/60 hover:text-c-text hover:bg-c-text/10'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Rodapé do drawer */}
        <div className="px-4 pb-6 border-t border-c-border pt-4 flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-c-text/60 hover:text-c-text hover:bg-c-text/10 transition-all duration-200 cursor-pointer border-none bg-transparent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
