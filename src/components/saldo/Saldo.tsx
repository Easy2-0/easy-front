import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { transacaoService } from '../../services/transacaoService';
import { usuarioService } from '../../services/usuarioService';
import type { Transacao } from '../../models';
import {
  formatarValor,
  calcularTotais,
  filtrarMesAtual,
  calcularEvolucaoMensal,
  buscarDestaques,
} from '../../utils/transacaoUtils';
import { useTheme } from '../../context/ThemeContext';

// ---------------------------------------------------------------------------
// Cores por tema
// ---------------------------------------------------------------------------

const CORES_DARK  = { receita: '#34d399', despesa: '#f87171' };
const CORES_LIGHT = { receita: '#059669', despesa: '#dc2626' };

// ---------------------------------------------------------------------------
// Tooltip customizado para os gráficos
// ---------------------------------------------------------------------------

const TooltipPersonalizado = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-c-surface border border-c-border rounded-xl px-4 py-2 text-sm text-c-text shadow-xl">
      {payload.map((p: any) => (
        <p key={p.name}>
          <span className="text-c-text/50">{p.name}: </span>
          <span className="font-bold">{formatarValor(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const Saldo = () => {
  const usuario = usuarioService.getUsuarioLogado();
  const { theme } = useTheme();
  const CORES = theme === 'dark' ? CORES_DARK : CORES_LIGHT;

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const todas = await transacaoService.buscarTodas();
        const filtradas = usuario ? todas.filter((t) => t.usuario?.id === usuario.id) : todas;
        setTransacoes(filtradas);
      } catch {
        setTransacoes([]);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-c-text/40 text-sm">Carregando análise...</p>
      </div>
    );
  }

  if (transacoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-c-surface border border-c-border">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <p className="text-c-text/40 text-sm text-center">
          Nenhuma transação encontrada.<br />
          <span className="text-c-text/30 text-xs">Adicione transações para ver sua análise financeira.</span>
        </p>
      </div>
    );
  }

  const totaisGeral = calcularTotais(transacoes);
  const transacoesMes = filtrarMesAtual(transacoes);
  const totaisMes = calcularTotais(transacoesMes);
  const evolucao = calcularEvolucaoMensal(transacoes);
  const { maiorReceita, maiorDespesa } = buscarDestaques(transacoes);
  const saldoMesPositivo = totaisMes.saldo >= 0;

  const dadosPizza = [
    { name: 'Receitas', value: totaisGeral.entrada },
    { name: 'Despesas', value: totaisGeral.saida },
  ];

  const percReceita = totaisGeral.entrada + totaisGeral.saida > 0
    ? Math.round((totaisGeral.entrada / (totaisGeral.entrada + totaisGeral.saida)) * 100)
    : 0;
  const percDespesa = 100 - percReceita;

  const tickColor = theme === 'dark' ? 'rgba(226,232,240,0.4)' : 'rgba(15,23,42,0.4)';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="flex flex-col gap-6">

      {/* Título */}
      <div>
        <h1 className="text-c-text text-xl font-bold">Análise Financeira</h1>
        <p className="text-c-text/50 text-sm mt-1">Um resumo claro de como está seu dinheiro</p>
      </div>

      {/* Resumo do mês atual */}
      <div>
        <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase mb-3">
          Resumo do mês atual
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-1">
            <span className="text-c-positive text-xs font-semibold tracking-widest uppercase">O que entrou</span>
            <span className="text-c-text text-xl font-bold">{formatarValor(totaisMes.entrada)}</span>
            <span className="text-c-text/30 text-xs">Total de receitas no mês</span>
          </div>

          <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-1">
            <span className="text-c-negative text-xs font-semibold tracking-widest uppercase">O que saiu</span>
            <span className="text-c-text text-xl font-bold">{formatarValor(totaisMes.saida)}</span>
            <span className="text-c-text/30 text-xs">Total de despesas no mês</span>
          </div>

          <div className={`border rounded-2xl p-5 flex flex-col gap-1 ${saldoMesPositivo ? 'bg-c-positive/10 border-c-positive/30' : 'bg-c-negative/10 border-c-negative/30'}`}>
            <span className={`text-xs font-semibold tracking-widest uppercase ${saldoMesPositivo ? 'text-c-positive' : 'text-c-negative'}`}>
              O que sobrou
            </span>
            <span className={`text-xl font-bold ${saldoMesPositivo ? 'text-c-positive' : 'text-c-negative'}`}>
              {formatarValor(totaisMes.saldo)}
            </span>
            <span className="text-c-text/30 text-xs">
              {saldoMesPositivo ? 'Mês positivo! Continue assim.' : 'Você gastou mais do que recebeu.'}
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pizza */}
        <div className="bg-c-surface border border-c-border rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-c-text font-semibold text-sm">Para onde foi seu dinheiro?</p>
            <p className="text-c-text/40 text-xs mt-1">Proporção entre o que você ganhou e o que gastou no total</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill={CORES.receita} />
                <Cell fill={CORES.despesa} />
              </Pie>
              <Tooltip content={<TooltipPersonalizado />} />
              <Legend
                formatter={(value) => <span className="text-c-text/60 text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around">
            <div className="text-center">
              <p style={{ color: CORES.receita }} className="text-xl font-black">{percReceita}%</p>
              <p className="text-c-text/40 text-xs">Receitas</p>
            </div>
            <div className="w-px bg-c-border" />
            <div className="text-center">
              <p style={{ color: CORES.despesa }} className="text-xl font-black">{percDespesa}%</p>
              <p className="text-c-text/40 text-xs">Despesas</p>
            </div>
          </div>
        </div>

        {/* Barras */}
        <div className="bg-c-surface border border-c-border rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-c-text font-semibold text-sm">Evolução nos últimos meses</p>
            <p className="text-c-text/40 text-xs mt-1">Compare receitas e despesas mês a mês</p>
          </div>
          {evolucao.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={evolucao} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="mes" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<TooltipPersonalizado />} />
                <Legend formatter={(value) => <span className="text-c-text/60 text-xs capitalize">{value}</span>} />
                <Bar dataKey="receitas" name="Receitas" fill={CORES.receita} radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill={CORES.despesa} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center flex-1 min-h-[200px]">
              <p className="text-c-text/30 text-xs">Dados insuficientes para o gráfico.</p>
            </div>
          )}
        </div>
      </div>

      {/* Destaques */}
      <div>
        <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase mb-3">
          Destaques de todos os tempos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-c-positive/15 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
            <div>
              <p className="text-c-text/40 text-xs">Maior receita</p>
              {maiorReceita ? (
                <>
                  <p className="text-c-text font-semibold text-sm">{maiorReceita.nome}</p>
                  <p className="text-c-positive font-bold text-base">{formatarValor(maiorReceita.valor)}</p>
                </>
              ) : (
                <p className="text-c-text/30 text-xs">Nenhuma receita ainda</p>
              )}
            </div>
          </div>

          <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-c-negative/15 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-negative)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </div>
            <div>
              <p className="text-c-text/40 text-xs">Maior despesa</p>
              {maiorDespesa ? (
                <>
                  <p className="text-c-text font-semibold text-sm">{maiorDespesa.nome}</p>
                  <p className="text-c-negative font-bold text-base">{formatarValor(maiorDespesa.valor)}</p>
                </>
              ) : (
                <p className="text-c-text/30 text-xs">Nenhuma despesa ainda</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Saldo;
