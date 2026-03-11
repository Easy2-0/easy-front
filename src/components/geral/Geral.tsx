import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBalance } from '../../context/BalanceContext';
import { transacaoService } from '../../services/transacaoService';
import { usuarioService } from '../../services/usuarioService';
import type { Transacao } from '../../models';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Geral = () => {
  const navigate = useNavigate();
  const { entrada, saida, saldo, setEntrada, setSaida } = useBalance();
  const usuario = usuarioService.getUsuarioLogado();
  const [recentes, setRecentes] = useState<Transacao[]>([]);

  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'você';
  const saldoPositivo = saldo >= 0;
  const corVar = saldoPositivo ? 'var(--color-c-positive)' : 'var(--color-c-negative)';
  const total = entrada + saida;
  const pctEntrada = total > 0 ? (entrada / total) * 100 : 50;

  useEffect(() => {
    transacaoService.buscarTodas().then((todas) => {
      const filtradas = usuario ? todas.filter((t) => t.usuario?.id === usuario.id) : todas;
      const ents = filtradas.filter((t) => t.tipo === 'Receita').reduce((s, t) => s + t.valor, 0);
      const sais = filtradas.filter((t) => t.tipo === 'Despesa').reduce((s, t) => s + t.valor, 0);
      setEntrada(ents);
      setSaida(sais);
      setRecentes([...filtradas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-4">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 flex flex-col gap-4 transition-colors duration-500"
        style={{ backgroundColor: `color-mix(in srgb, ${corVar} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${corVar} 25%, transparent)` }}
      >
        {/* Saudação */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase">Visão geral</p>
            <p className="text-c-text font-bold text-lg mt-0.5">Olá, {primeiroNome} 👋</p>
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${corVar} 20%, transparent)` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={corVar} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {saldoPositivo
                ? <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>
                : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
              }
            </svg>
          </div>
        </div>

        {/* Saldo hero */}
        <div>
          <p className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase mb-1">Saldo disponível</p>
          <p className="text-4xl font-black leading-none" style={{ color: corVar }}>
            {fmt(saldo)}
          </p>
          <p className="text-c-text/40 text-xs mt-2">
            {saldoPositivo ? 'Suas finanças estão positivas!' : 'Atenção: suas despesas superam as entradas.'}
          </p>
        </div>

        {/* Barra de proporção */}
        {total > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-semibold text-c-text/40">
              <span>Receitas {Math.round(pctEntrada)}%</span>
              <span>Despesas {Math.round(100 - pctEntrada)}%</span>
            </div>
            <div className="h-2 rounded-full bg-c-negative/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctEntrada}%`, backgroundColor: 'var(--color-c-positive)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── CARDS ENTRADA / SAÍDA ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">

        <div
          className="rounded-2xl p-4 flex flex-col gap-3 border cursor-pointer hover:brightness-105 transition-all"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-c-positive) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-c-positive) 25%, transparent)' }}
          onClick={() => navigate('/gastos')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-c-positive)' }}>Entradas</span>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-c-positive) 20%, transparent)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-positive)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
          </div>
          <p className="text-c-text font-black text-xl leading-none">{fmt(entrada)}</p>
          <p className="text-c-text/30 text-[10px]">Total recebido</p>
        </div>

        <div
          className="rounded-2xl p-4 flex flex-col gap-3 border cursor-pointer hover:brightness-105 transition-all"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-c-negative) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-c-negative) 25%, transparent)' }}
          onClick={() => navigate('/gastos')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-c-negative)' }}>Saídas</span>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-c-negative) 20%, transparent)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-negative)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
              </svg>
            </div>
          </div>
          <p className="text-c-text font-black text-xl leading-none">{fmt(saida)}</p>
          <p className="text-c-text/30 text-[10px]">Total gasto</p>
        </div>
      </div>

      {/* ── ÚLTIMAS TRANSAÇÕES ────────────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-c-border">
          <p className="text-c-text font-bold text-sm">Últimas transações</p>
          <button
            onClick={() => navigate('/gastos')}
            className="text-c-accent text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none"
          >
            Ver todas →
          </button>
        </div>

        {recentes.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-c-text/30 text-sm">Nenhuma transação ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {recentes.map((t, i) => {
              const isRec = t.tipo === 'Receita';
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i < recentes.length - 1 ? 'border-b border-c-border' : ''}`}
                >
                  {/* Ícone */}
                  <div
                    className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `color-mix(in srgb, ${isRec ? 'var(--color-c-positive)' : 'var(--color-c-negative)'} 15%, transparent)` }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isRec ? 'var(--color-c-positive)' : 'var(--color-c-negative)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {isRec
                        ? <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
                        : <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>
                      }
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-c-text text-sm font-semibold truncate">{t.nome}</p>
                    <p className="text-c-text/30 text-xs">{new Date(t.data).toLocaleDateString('pt-BR')}</p>
                  </div>

                  {/* Valor */}
                  <p className="text-sm font-black shrink-0" style={{ color: isRec ? 'var(--color-c-positive)' : 'var(--color-c-negative)' }}>
                    {isRec ? '+' : '-'}{fmt(t.valor)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Geral;
