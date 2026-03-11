import { useNavigate, useLocation } from 'react-router-dom';
import { usuarioService } from '../../services/usuarioService';

const navItems = [
  { label: 'Geral', rota: '/geral' },
  { label: 'Saldo', rota: '/saldo' },
  { label: 'Transações', rota: '/gastos' },
  { label: 'Investimentos', rota: '/investimentos' },
  { label: 'Calendário', rota: '/calendario' },
];

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    usuarioService.logout();
    navigate('/');
  };

  return (
    <header className="w-full bg-[#264d49] border-b border-white/10 px-6 py-3 flex items-center justify-between">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2bb39a]">
          <svg width="18" height="18" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="20" r="12" stroke="white" strokeWidth="3" fill="none" />
            <text x="30" y="25" fontSize="16" fill="white" textAnchor="middle" fontWeight="bold">$</text>
            <path d="M15 35 Q20 32 30 32 Q40 32 45 35 L42 45 Q35 48 30 48 Q25 48 18 45 Z" fill="white" />
          </svg>
        </div>
        <span className="text-white font-black tracking-widest text-sm">EASY</span>
      </div>

      {/* Navegação */}
      <nav className="flex items-center gap-1">
        {navItems.map(({ label, rota }) => {
          const ativo = pathname === rota;
          return (
            <button
              key={rota}
              onClick={() => navigate(rota)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border-none
                ${ativo
                  ? 'bg-[#2bb39a] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer border-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sair
      </button>

    </header>
  );
};

export default Header;
