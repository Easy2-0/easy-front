import { useEffect, useState, useMemo } from 'react';
import { transacaoService } from '../../services/transacaoService';
import { usuarioService } from '../../services/usuarioService';
import type { Transacao } from '../../models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function chaveData(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function gerarGrade(ano: number, mes: number): (number | null)[] {
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const grade: (number | null)[] = Array(primeiroDia).fill(null);
  for (let d = 1; d <= totalDias; d++) grade.push(d);
  while (grade.length % 7 !== 0) grade.push(null);
  return grade;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

const Calendario = () => {
  const usuario = usuarioService.getUsuarioLogado();
  const hoje = new Date();

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  useEffect(() => {
    transacaoService.buscarTodas().then((todas) => {
      const filtradas = usuario ? todas.filter((t) => t.usuario?.id === usuario.id) : todas;
      setTransacoes(filtradas);
    }).catch(() => {}).finally(() => setCarregando(false));
  }, []);

  // Agrupa transações por data (chave YYYY-MM-DD)
  // Usa substring(0,10) para evitar problemas de timezone na conversão de Date
  const porData = useMemo(() => {
    const mapa: Record<string, Transacao[]> = {};
    transacoes.forEach((t) => {
      const chave = String(t.data).substring(0, 10);
      if (!mapa[chave]) mapa[chave] = [];
      mapa[chave].push(t);
    });
    return mapa;
  }, [transacoes]);

  const grade = useMemo(() => gerarGrade(ano, mes), [ano, mes]);

  const navMes = (delta: number) => {
    const d = new Date(ano, mes + delta, 1);
    setMes(d.getMonth());
    setAno(d.getFullYear());
    setDiaSelecionado(null);
  };

  // Totais do mês visível
  const { totalEntrada, totalSaida } = useMemo(() => {
    const prefix = `${ano}-${String(mes + 1).padStart(2, '0')}`;
    let e = 0, s = 0;
    Object.entries(porData).forEach(([chave, lista]) => {
      if (!chave.startsWith(prefix)) return;
      lista.forEach((t) => {
        if (t.tipo === 'Receita') e += t.valor;
        else s += t.valor;
      });
    });
    return { totalEntrada: e, totalSaida: s };
  }, [porData, mes, ano]);

  const transacoesDia = diaSelecionado ? (porData[diaSelecionado] ?? []) : [];

  const hojeChave = chaveData(hoje);

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-c-text/40 text-sm">Carregando calendário...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── CABEÇALHO DO MÊS ──────────────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-4">

        {/* Navegação */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navMes(-1)}
            className="w-9 h-9 rounded-xl bg-c-bg border border-c-border text-c-text/50 hover:text-c-text flex items-center justify-center transition-all cursor-pointer border-solid"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-c-text font-bold text-base">{MESES[mes]}</p>
            <p className="text-c-text/40 text-xs">{ano}</p>
          </div>

          <button
            onClick={() => navMes(1)}
            className="w-9 h-9 rounded-xl bg-c-bg border border-c-border text-c-text/50 hover:text-c-text flex items-center justify-center transition-all cursor-pointer border-solid"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Resumo do mês */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-c-positive) 10%, transparent)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-c-positive)' }}>Receitas</span>
            <span className="text-c-text font-black text-sm">{fmt(totalEntrada)}</span>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-c-negative) 10%, transparent)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-c-negative)' }}>Despesas</span>
            <span className="text-c-text font-black text-sm">{fmt(totalSaida)}</span>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-c-bg border border-c-border">
            <span className="text-[10px] font-bold tracking-widest uppercase text-c-text/40">Saldo</span>
            <span
              className="font-black text-sm"
              style={{ color: totalEntrada - totalSaida >= 0 ? 'var(--color-c-positive)' : 'var(--color-c-negative)' }}
            >
              {fmt(totalEntrada - totalSaida)}
            </span>
          </div>
        </div>
      </div>

      {/* ── GRADE DO CALENDÁRIO ────────────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl overflow-hidden">

        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b border-c-border">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-2.5 text-center text-[10px] font-bold text-c-text/30 tracking-widest uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Células */}
        <div className="grid grid-cols-7">
          {grade.map((dia, i) => {
            if (!dia) return <div key={`v-${i}`} className="aspect-square border-b border-r border-c-border last:border-r-0" />;

            const chave = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const lista = porData[chave] ?? [];
            const entrada = lista.filter((t) => t.tipo === 'Receita').reduce((s, t) => s + t.valor, 0);
            const saida = lista.filter((t) => t.tipo === 'Despesa').reduce((s, t) => s + t.valor, 0);
            const saldoDia = entrada - saida;
            const temTransacoes = lista.length > 0;
            const isHoje = chave === hojeChave;
            const isSelecionado = chave === diaSelecionado;
            const isUltimaColuna = (i + 1) % 7 === 0;

            let bgColor = 'transparent';
            if (isSelecionado) bgColor = 'color-mix(in srgb, var(--color-c-accent) 15%, transparent)';
            else if (temTransacoes && saldoDia > 0) bgColor = 'color-mix(in srgb, var(--color-c-positive) 10%, transparent)';
            else if (temTransacoes && saldoDia < 0) bgColor = 'color-mix(in srgb, var(--color-c-negative) 10%, transparent)';
            else if (temTransacoes) bgColor = 'color-mix(in srgb, var(--color-c-text) 5%, transparent)';

            return (
              <button
                key={chave}
                onClick={() => setDiaSelecionado(isSelecionado ? null : chave)}
                className={`aspect-square flex flex-col items-center justify-center gap-0.5 border-b border-c-border transition-all cursor-pointer border-none ${!isUltimaColuna ? 'border-r' : ''} ${isSelecionado ? 'ring-1 ring-inset ring-c-accent' : 'hover:bg-c-text/5'}`}
                style={{ backgroundColor: bgColor }}
              >
                {/* Número do dia */}
                <span
                  className={`text-xs font-bold leading-none w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                    isHoje ? 'text-white' : isSelecionado ? 'text-c-accent' : 'text-c-text'
                  }`}
                  style={isHoje ? { backgroundColor: 'var(--color-c-accent)' } : {}}
                >
                  {dia}
                </span>

                {/* Dots de transações */}
                {temTransacoes && (
                  <div className="flex gap-0.5">
                    {entrada > 0 && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-c-positive)' }} />}
                    {saida > 0 && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-c-negative)' }} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LEGENDA ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-5">
        {[
          { cor: 'var(--color-c-positive)', label: 'Receita no dia' },
          { cor: 'var(--color-c-negative)', label: 'Despesa no dia' },
          { cor: 'var(--color-c-accent)', label: 'Hoje' },
        ].map(({ cor, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cor }} />
            <span className="text-c-text/40 text-[10px]">{label}</span>
          </div>
        ))}
      </div>

      {/* ── PAINEL DO DIA SELECIONADO ──────────────────────────────────── */}
      {diaSelecionado && (
        <div className="bg-c-surface border border-c-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-c-border">
            <p className="text-c-text font-bold text-sm">
              {new Date(diaSelecionado + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <button
              onClick={() => setDiaSelecionado(null)}
              className="text-c-text/30 hover:text-c-text transition-colors cursor-pointer bg-transparent border-none text-lg leading-none"
            >×</button>
          </div>

          {transacoesDia.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-c-text/30 text-sm">Nenhuma transação neste dia.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {transacoesDia.map((t, i) => {
                const isRec = t.tipo === 'Receita';
                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-5 py-3.5 ${i < transacoesDia.length - 1 ? 'border-b border-c-border' : ''}`}
                  >
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
                    <div className="flex-1 min-w-0">
                      <p className="text-c-text text-sm font-semibold truncate">{t.nome}</p>
                      {t.descricao && <p className="text-c-text/30 text-xs truncate">{t.descricao}</p>}
                    </div>
                    <p className="text-sm font-black shrink-0" style={{ color: isRec ? 'var(--color-c-positive)' : 'var(--color-c-negative)' }}>
                      {isRec ? '+' : '-'}{fmt(t.valor)}
                    </p>
                  </div>
                );
              })}

              {/* Resumo do dia */}
              {transacoesDia.length > 1 && (() => {
                const e = transacoesDia.filter(t => t.tipo === 'Receita').reduce((s, t) => s + t.valor, 0);
                const s = transacoesDia.filter(t => t.tipo !== 'Receita').reduce((acc, t) => acc + t.valor, 0);
                const sal = e - s;
                return (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-c-border bg-c-bg">
                    <span className="text-c-text/40 text-xs font-semibold">Saldo do dia</span>
                    <span className="text-sm font-black" style={{ color: sal >= 0 ? 'var(--color-c-positive)' : 'var(--color-c-negative)' }}>
                      {fmt(sal)}
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Calendario;
