import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TipoInvestimento {
  id: string;
  label: string;
  emoji: string;
  taxaAnual: number;
  cor: string;
  descricaoCurta: string;
  irInfo: string;
  irBadge: string;
  calcularIR: (rendimentoBruto: number, meses: number) => number;
}

// ---------------------------------------------------------------------------
// IR
// ---------------------------------------------------------------------------

function irRendaFixa(rendimentoBruto: number, meses: number): number {
  let aliquota: number;
  if (meses <= 6) aliquota = 0.225;
  else if (meses <= 12) aliquota = 0.20;
  else if (meses <= 24) aliquota = 0.175;
  else aliquota = 0.15;
  return rendimentoBruto * aliquota;
}

function aliquotaLabel(meses: number) {
  if (meses <= 6) return 'IR 22,5%';
  if (meses <= 12) return 'IR 20%';
  if (meses <= 24) return 'IR 17,5%';
  return 'IR 15%';
}

// ---------------------------------------------------------------------------
// Investimentos
// ---------------------------------------------------------------------------

const TIPOS: TipoInvestimento[] = [
  {
    id: 'poupanca', label: 'Poupança', emoji: '🐖',
    taxaAnual: 6.17, cor: '#60a5fa',
    descricaoCurta: '6,17% a.a.',
    irInfo: 'Isenta de IR', irBadge: 'Isento',
    calcularIR: () => 0,
  },
  {
    id: 'cdb', label: 'CDB', emoji: '🏦',
    taxaAnual: 11.0, cor: '#2bb39a',
    descricaoCurta: '11% a.a.',
    irInfo: 'IR regressivo até 15%', irBadge: 'IR reg.',
    calcularIR: irRendaFixa,
  },
  {
    id: 'tesouro', label: 'Tesouro Selic', emoji: '🇧🇷',
    taxaAnual: 10.5, cor: '#a78bfa',
    descricaoCurta: '10,5% a.a.',
    irInfo: 'IR regressivo até 15%', irBadge: 'IR reg.',
    calcularIR: irRendaFixa,
  },
  {
    id: 'ipca', label: 'IPCA+', emoji: '📈',
    taxaAnual: 10.5, cor: '#fb923c',
    descricaoCurta: '~10,5% a.a.',
    irInfo: 'IR regressivo até 15%', irBadge: 'IR reg.',
    calcularIR: irRendaFixa,
  },
  {
    id: 'acoes', label: 'Ações', emoji: '📊',
    taxaAnual: 12.0, cor: '#f472b6',
    descricaoCurta: '~12% a.a.',
    irInfo: '15% sobre o lucro', irBadge: 'IR 15%',
    calcularIR: (r) => r * 0.15,
  },
];

// ---------------------------------------------------------------------------
// Cálculos
// ---------------------------------------------------------------------------

function calcularBruto(p: number, pmt: number, n: number, taxa: number) {
  const r = taxa / 100 / 12;
  if (r === 0) return p + pmt * n;
  const f = Math.pow(1 + r, n);
  return p * f + pmt * ((f - 1) / r);
}

function calcularResultado(p: number, pmt: number, n: number, tipo: TipoInvestimento) {
  const aportado = p + pmt * n;
  const totalBruto = calcularBruto(p, pmt, n, tipo.taxaAnual);
  const rendBruto = Math.max(0, totalBruto - aportado);
  const ir = tipo.calcularIR(rendBruto, n);
  const rendLiquido = rendBruto - ir;
  return { aportado, totalBruto, rendBruto, ir, rendLiquido, totalLiquido: aportado + rendLiquido };
}

function calcularEvolucao(p: number, pmt: number, n: number, tipo: TipoInvestimento) {
  const passo = Math.max(1, Math.ceil(n / 24));
  const pts: { label: string; liquido: number; aportado: number }[] = [];
  for (let i = 0; i <= n; i += passo) {
    const ap = p + pmt * i;
    const bruto = calcularBruto(p, pmt, i, tipo.taxaAnual);
    const rend = Math.max(0, bruto - ap);
    const ir = tipo.calcularIR(rend, i);
    const a = Math.floor(i / 12), m = i % 12;
    const label = i === 0 ? 'Início' : a === 0 ? `${i}m` : m === 0 ? `${a}a` : `${a}a${m}m`;
    pts.push({ label, aportado: Math.round(ap * 100) / 100, liquido: Math.round((ap + rend - ir) * 100) / 100 });
  }
  const last = pts[pts.length - 1];
  const ap = p + pmt * n;
  const bruto = calcularBruto(p, pmt, n, tipo.taxaAnual);
  const rend = Math.max(0, bruto - ap);
  const ir = tipo.calcularIR(rend, n);
  const a = Math.floor(n / 12), m = n % 12;
  const labelFinal = a === 0 ? `${n}m` : m === 0 ? `${a}a` : `${a}a${m}m`;
  if (last?.label !== labelFinal)
    pts.push({ label: labelFinal, aportado: Math.round(ap * 100) / 100, liquido: Math.round((ap + rend - ir) * 100) / 100 });
  return pts;
}

// ---------------------------------------------------------------------------
// Formatadores
// ---------------------------------------------------------------------------

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${Math.round(v)}`;
};

// ---------------------------------------------------------------------------
// Stepper — controle +/− para mobile
// ---------------------------------------------------------------------------

interface StepperProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

const Stepper = ({ label, unit, value, min, max, step = 1, onChange }: StepperProps) => (
  <div className="flex flex-col gap-2 flex-1">
    <span className="text-white/40 text-xs font-semibold tracking-widest uppercase">{label}</span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 text-white text-xl font-bold flex items-center justify-center active:bg-white/20 transition-all cursor-pointer shrink-0"
      >−</button>
      <div className="flex-1 h-11 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-base">{value}</span>
        <span className="text-white/40 text-xs ml-1">{unit}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 text-white text-xl font-bold flex items-center justify-center active:bg-white/20 transition-all cursor-pointer shrink-0"
      >+</button>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

const TooltipCustom = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e3d3a] border border-white/20 rounded-xl px-4 py-3 shadow-xl min-w-[160px]">
      <p className="text-white/50 text-xs mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }} className="text-xs">{p.name}</span>
          <span className="text-white font-bold text-xs">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const ATALHOS = [
  { label: '6m', anos: 0, meses: 6 },
  { label: '1a', anos: 1, meses: 0 },
  { label: '2a', anos: 2, meses: 0 },
  { label: '5a', anos: 5, meses: 0 },
  { label: '10a', anos: 10, meses: 0 },
  { label: '20a', anos: 20, meses: 0 },
  { label: '30a', anos: 30, meses: 0 },
  { label: '50a', anos: 50, meses: 0 },
];

const Calculadora = () => {
  const [valorInicial, setValorInicial] = useState('1000');
  const [aporteMensal, setAporteMensal] = useState('200');
  const [anos, setAnos] = useState(5);
  const [mesesExtra, setMesesExtra] = useState(0);
  const [tipoId, setTipoId] = useState('cdb');

  const tipo = TIPOS.find((t) => t.id === tipoId) ?? TIPOS[1]!;
  const totalMeses = Math.max(1, anos * 12 + mesesExtra);
  const principal = Math.max(0, parseFloat(valorInicial) || 0);
  const aporte = Math.max(0, parseFloat(aporteMensal) || 0);

  const res = useMemo(() => calcularResultado(principal, aporte, totalMeses, tipo), [principal, aporte, totalMeses, tipo]);
  const evolucao = useMemo(() => calcularEvolucao(principal, aporte, totalMeses, tipo), [principal, aporte, totalMeses, tipo]);
  const comparativo = useMemo(
    () => TIPOS.map((t) => ({ ...t, ...calcularResultado(principal, aporte, totalMeses, t) }))
      .sort((a, b) => b.totalLiquido - a.totalLiquido),
    [principal, aporte, totalMeses],
  );

  const pctRendimento = res.aportado > 0
    ? ((res.rendLiquido / res.aportado) * 100).toFixed(1)
    : '0';

  const labelPeriodo = () => {
    const p = [];
    if (anos > 0) p.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
    if (mesesExtra > 0) p.push(`${mesesExtra} ${mesesExtra === 1 ? 'mês' : 'meses'}`);
    return p.join(' e ') || '–';
  };

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* Título */}
      <div>
        <h1 className="text-white text-xl font-bold">Calculadora</h1>
        <p className="text-white/40 text-sm mt-0.5">Simule o rendimento líquido dos seus investimentos</p>
      </div>

      {/* ── SEÇÃO 1: VALORES ─────────────────────────────────────────── */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">Valores</p>

        <div className="grid grid-cols-2 gap-3">
          {/* Valor inicial */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#bfe9df] text-xs font-semibold tracking-widest uppercase">Inicial</label>
            <div className="flex h-12 rounded-xl overflow-hidden border border-white/20 bg-white/10">
              <span className="px-3 flex items-center text-[#2bb39a] font-bold text-sm bg-white/5 border-r border-white/10 shrink-0">R$</span>
              <input
                type="number" inputMode="decimal" min="0" step="100"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
                className="flex-1 min-w-0 px-3 bg-transparent text-white text-sm outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Aporte mensal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#bfe9df] text-xs font-semibold tracking-widest uppercase">Mensal</label>
            <div className="flex h-12 rounded-xl overflow-hidden border border-white/20 bg-white/10">
              <span className="px-3 flex items-center text-[#2bb39a] font-bold text-sm bg-white/5 border-r border-white/10 shrink-0">R$</span>
              <input
                type="number" inputMode="decimal" min="0" step="50"
                value={aporteMensal}
                onChange={(e) => setAporteMensal(e.target.value)}
                className="flex-1 min-w-0 px-3 bg-transparent text-white text-sm outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 2: PERÍODO ─────────────────────────────────────────── */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">Período</p>
          <span className="text-[#2bb39a] text-sm font-bold">{labelPeriodo()} · {totalMeses}m</span>
        </div>

        {/* Steppers lado a lado */}
        <div className="flex gap-3">
          <Stepper label="Anos" unit="a" value={anos} min={0} max={50} onChange={setAnos} />
          <Stepper label="Meses" unit="m" value={mesesExtra} min={0} max={11} onChange={setMesesExtra} />
        </div>

        {/* Atalhos — scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 scroll-thin mt-2">
          {ATALHOS.map((a) => {
            const ativo = anos === a.anos && mesesExtra === a.meses;
            return (
              <button
                key={a.label}
                onClick={() => { setAnos(a.anos); setMesesExtra(a.meses); }}
                className={`shrink-0 h-9 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  ativo
                    ? 'bg-[#2bb39a] border-[#2bb39a] text-white'
                    : 'bg-white/5 border-white/10 text-white/50 active:bg-white/10'
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEÇÃO 3: TIPO DE INVESTIMENTO ────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-white/40 text-xs font-semibold tracking-widest uppercase px-1">Tipo de investimento</p>

        {/* Cards em scroll horizontal */}
        <div className="flex gap-3 overflow-x-auto -mx-1 px-1 scroll-thin mt-2">
          {TIPOS.map((t) => {
            const ativo = tipoId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTipoId(t.id)}
                className={`shrink-0 flex flex-col gap-1 p-4 rounded-2xl border transition-all cursor-pointer text-left w-[140px]`}
                style={
                  ativo
                    ? { backgroundColor: `${t.cor}20`, borderColor: t.cor }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }
                }
              >
                <span className="text-xl leading-none">{t.emoji}</span>
                <span className="text-white text-sm font-bold mt-1 leading-tight">{t.label}</span>
                <span className="text-xs font-semibold" style={{ color: ativo ? t.cor : 'rgba(255,255,255,0.4)' }}>
                  {t.descricaoCurta}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold mt-1 self-start"
                  style={
                    ativo
                      ? { backgroundColor: `${t.cor}30`, color: t.cor }
                      : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  {t.irBadge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEÇÃO 4: RESULTADO PRINCIPAL (hero) ──────────────────────── */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4 border"
        style={{ backgroundColor: `${tipo.cor}15`, borderColor: `${tipo.cor}40` }}
      >
        {/* Valor final em destaque */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">
              Valor final líquido · {tipo.label}
            </p>
            <p className="text-white text-3xl sm:text-4xl font-black leading-none">
              {fmt(res.totalLiquido)}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: tipo.cor }}>
              +{pctRendimento}% líquido sobre o aportado
            </p>
          </div>
          <span className="text-4xl shrink-0">{tipo.emoji}</span>
        </div>

        {/* Divisor */}
        <div className="h-px bg-white/10" />

        {/* 3 métricas secundárias */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">Aportado</span>
            <span className="text-white font-bold text-sm">{fmt(res.aportado)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">Rendimento</span>
            <span className="font-bold text-sm" style={{ color: tipo.cor }}>+{fmt(res.rendLiquido)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">
              {res.ir === 0 ? 'IR' : tipo.id !== 'acoes' ? aliquotaLabel(totalMeses) : 'IR 15%'}
            </span>
            <span className="text-[#e24b4b] font-bold text-sm">
              {res.ir === 0 ? 'Isento' : `−${fmt(res.ir)}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 5: GRÁFICO ─────────────────────────────────────────── */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <p className="text-white font-semibold text-sm">Evolução do patrimônio</p>
          <p className="text-white/40 text-xs mt-0.5">Aportado vs. valor líquido ao longo do tempo</p>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={evolucao} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gLiq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={tipo.cor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={tipo.cor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gAp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="95%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip content={<TooltipCustom />} />
            <Area type="monotone" dataKey="aportado" name="Aportado" stroke="rgba(255,255,255,0.2)" fill="url(#gAp)" strokeWidth={1.5} dot={false} />
            <Area type="monotone" dataKey="liquido" name="Líquido" stroke={tipo.cor} fill="url(#gLiq)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legenda manual (mais legível no mobile) */}
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-white/30" />
            <span className="text-white/40 text-xs">Aportado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: tipo.cor }} />
            <span className="text-white/60 text-xs">Líquido após IR</span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 6: COMPARATIVO ─────────────────────────────────────── */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col gap-3">
        <div>
          <p className="text-white font-semibold text-sm">Comparativo líquido</p>
          <p className="text-white/40 text-xs mt-0.5">Toque para selecionar e ver no gráfico</p>
        </div>

        <div className="flex flex-col gap-2">
          {comparativo.map((t, i) => {
            const melhor = comparativo[0]!;
            const pct = melhor.totalLiquido > 0 ? (t.totalLiquido / melhor.totalLiquido) * 100 : 0;
            const ativo = t.id === tipoId;
            return (
              <button
                key={t.id}
                onClick={() => setTipoId(t.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                  ativo ? 'border-white/30 bg-white/10' : 'border-transparent bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{t.emoji}</span>
                    <span className="text-white/80 text-sm font-semibold">{t.label}</span>
                    {i === 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${t.cor}30`, color: t.cor }}>
                        MELHOR
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{fmt(t.totalLiquido)}</p>
                    {t.ir > 0 && (
                      <p className="text-[#e24b4b]/60 text-[10px]">IR −{fmt(t.ir)}</p>
                    )}
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: t.cor }}
                  />
                </div>
                <p className="text-white/25 text-[10px] mt-1.5">{t.irInfo}</p>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Calculadora;
