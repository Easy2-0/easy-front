import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../ui/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'erro' | 'sucesso' | 'aviso' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!email || !senha) {
      setToast({ mensagem: 'Preencha todos os campos corretamente.', tipo: 'erro' });
      return;
    }
    if (senha.length < 6) {
      setToast({ mensagem: 'A senha deve ter no mínimo 6 caracteres.', tipo: 'erro' });
      return;
    }

    const sucesso = await login(email, senha);
    if (sucesso) {
      navigate('/gastos');
    } else if (error) {
      setToast({ mensagem: error, tipo: 'erro' });
    }
  };

  const handleDemoAccess = () => {
    // Simula um login de admin/demo para o APK
    const demoUser = {
      id: 1,
      nome: 'Usuário Demo',
      email: 'demo@easy.com.br',
      token: 'mock-token-12345'
    };
    localStorage.setItem('token', demoUser.token);
    localStorage.setItem('usuario', JSON.stringify(demoUser));
    
    setToast({ mensagem: 'Acessando modo demonstração...', tipo: 'sucesso' });
    setTimeout(() => navigate('/gastos'), 1000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-c-bg flex items-center justify-center px-6 py-6">

      {/* Blobs decorativos */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-c-accent opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-c-accent opacity-[0.07] blur-3xl pointer-events-none" />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-5">

        {/* Logo e slogan */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-c-accent shadow-lg shadow-c-accent/30">
            <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="20" r="12" stroke="white" strokeWidth="3" fill="none" />
              <text x="30" y="25" fontSize="16" fill="white" textAnchor="middle" fontWeight="bold">$</text>
              <path d="M15 35 Q20 32 30 32 Q40 32 45 35 L42 45 Q35 48 30 48 Q25 48 18 45 Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-c-text text-2xl font-black tracking-widest">EASY</h1>
          <p className="text-c-text/50 text-xs tracking-wide">Seu gestor financeiro inteligente</p>
        </div>

        {/* Card do formulário */}
        <div className="bg-c-surface border border-c-border rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col p-8 gap-5">

            <h2 className="text-c-text text-xl font-bold">
              Bem-vindo de volta 👋
            </h2>

            {/* Campo Email */}
            <div className="flex flex-col gap-2">
              <label className="text-c-text/60 text-xs font-semibold tracking-widest uppercase">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[42px] px-4 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
              />
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-2">
              <label className="text-c-text/60 text-xs font-semibold tracking-widest uppercase">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full h-[42px] px-4 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
              />
              <div className="flex justify-end mt-1">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-c-accent text-xs hover:text-c-accent/70 transition-colors"
                >
                  Esqueci minha senha
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[42px] bg-c-accent text-white text-sm font-bold rounded-xl tracking-widest hover:opacity-85 hover:shadow-lg hover:shadow-c-accent/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-c-border" />
              <span className="text-c-text/20 text-[10px] font-bold uppercase tracking-widest">OU</span>
              <div className="flex-1 h-px bg-c-border" />
            </div>

            {/* Botão Demo para APK */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full h-[42px] bg-c-surface border border-c-accent/30 text-c-accent text-xs font-bold rounded-xl tracking-widest hover:bg-c-accent/10 transition-all duration-300 cursor-pointer"
            >
              ACESSO DEMO (APK)
            </button>
          </form>
        </div>

        {/* Rodapé - Cadastro */}
        <p className="text-center text-c-text/40 text-xs">
          Ainda não tem uma conta?{' '}
          <button
            onClick={() => navigate('/cadastro')}
            className="text-c-accent font-bold hover:text-c-accent/70 transition-colors cursor-pointer bg-transparent border-none"
          >
            Cadastre-se grátis
          </button>
        </p>

      </div>

      {/* Toast */}
      {toast && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;
