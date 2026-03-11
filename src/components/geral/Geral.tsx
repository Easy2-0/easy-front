import { useNavigate } from 'react-router-dom';
import { useBalance } from '../../context/BalanceContext';

const Geral = () => {
  const navigate = useNavigate();
  const { entrada, saida, saldo } = useBalance();

  const formatarValor = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const saldoPositivo = saldo >= 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Título */}
      <div>
        <h1 className="text-c-text text-xl font-bold">Visão Geral</h1>
        <p className="text-c-text/50 text-sm mt-1">Acompanhe suas finanças em tempo real</p>
      </div>

      {/* Cards de entrada e saída */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Card Entrada */}
        <div className="bg-c-surface border border-c-border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-c-text/50 text-xs font-semibold tracking-widest uppercase">Entrada</span>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-c-positive/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
          </div>
          <span className="text-c-text text-2xl font-bold">{formatarValor(entrada)}</span>
          <button
            onClick={() => navigate('/gastos')}
            className="w-full py-2 rounded-xl border border-c-positive text-c-positive text-xs font-semibold tracking-widest uppercase hover:bg-c-positive hover:text-white transition-all duration-200 cursor-pointer bg-transparent"
          >
            Adicionar Entrada
          </button>
        </div>

        {/* Card Saída */}
        <div className="bg-c-surface border border-c-border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-c-text/50 text-xs font-semibold tracking-widest uppercase">Saída</span>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-c-negative/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-negative)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </div>
          </div>
          <span className="text-c-text text-2xl font-bold">{formatarValor(saida)}</span>
          <button
            onClick={() => navigate('/gastos')}
            className="w-full py-2 rounded-xl border border-c-negative text-c-negative text-xs font-semibold tracking-widest uppercase hover:bg-c-negative hover:text-white transition-all duration-200 cursor-pointer bg-transparent"
          >
            Adicionar Saída
          </button>
        </div>
      </div>

      {/* Card Saldo */}
      <div className={`border rounded-2xl p-6 flex flex-col gap-2 ${saldoPositivo ? 'bg-c-positive/10 border-c-positive/30' : 'bg-c-negative/10 border-c-negative/30'}`}>
        <span className="text-c-text/50 text-xs font-semibold tracking-widest uppercase">Saldo Disponível</span>
        <span className={`text-4xl font-black ${saldoPositivo ? 'text-c-positive' : 'text-c-negative'}`}>
          {formatarValor(saldo)}
        </span>
        <p className="text-c-text/40 text-xs mt-1">
          {saldoPositivo ? 'Suas finanças estão positivas!' : 'Atenção: suas despesas superam as entradas.'}
        </p>
      </div>

    </div>
  );
};

export default Geral;
