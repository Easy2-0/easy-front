import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLocal, setErroLocal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLocal('');

    if (!email || !senha) {
      setErroLocal('Preencha todos os campos corretamente.');
      return;
    }
    if (senha.length < 6) {
      setErroLocal('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const sucesso = await login(email, senha);
    if (sucesso) navigate('/gastos');
  };

  const mensagemErro = erroLocal || error;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#264d49] flex items-center justify-center px-6 py-6">

      {/* Blobs decorativos */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#2bb39a] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-[#2bb39a] opacity-15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-[#bfe9df] opacity-10 blur-2xl pointer-events-none" />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-5">

        {/* Logo e slogan */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2bb39a] shadow-lg shadow-[#2bb39a]/40">
            <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="20" r="12" stroke="white" strokeWidth="3" fill="none" />
              <text x="30" y="25" fontSize="16" fill="white" textAnchor="middle" fontWeight="bold">$</text>
              <path d="M15 35 Q20 32 30 32 Q40 32 45 35 L42 45 Q35 48 30 48 Q25 48 18 45 Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-black tracking-widest">EASY</h1>
          <p className="text-[#bfe9df] text-xs tracking-wide">Seu gestor financeiro inteligente</p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col p-8 gap-5">

            <h2 className="text-white text-xl font-bold">
              Bem-vindo de volta 👋
            </h2>

            {/* Campo Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[#bfe9df] text-xs font-semibold tracking-widest uppercase">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[42px] px-4 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 outline-none focus:border-[#2bb39a] focus:bg-white/15 transition-all"
              />
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-2">
              <label className="text-[#bfe9df] text-xs font-semibold tracking-widest uppercase">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full h-[42px] px-4 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 outline-none focus:border-[#2bb39a] focus:bg-white/15 transition-all"
              />
              {mensagemErro && (
                <p className="text-[#e24b4b] text-xs">{mensagemErro}</p>
              )}
              <div className="flex justify-end mt-1">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#2bb39a] text-xs hover:text-[#bfe9df] transition-colors"
                >
                  Esqueci minha senha
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[42px] bg-[#2bb39a] text-white text-sm font-bold rounded-xl tracking-widest hover:bg-[#3a4f4b] hover:shadow-lg hover:shadow-[#2bb39a]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>
        </div>

        {/* Rodapé - Cadastro */}
        <p className="text-center text-white/50 text-xs">
          Ainda não tem uma conta?{' '}
          <button
            onClick={() => navigate('/cadastro')}
            className="text-[#2bb39a] font-bold hover:text-[#bfe9df] transition-colors cursor-pointer bg-transparent border-none"
          >
            Cadastre-se grátis
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;
