import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  PiggyBank, Landmark, Flag, Wheat, Building2, Zap,
  TrendingUp, Home, BarChart2, Globe, Bitcoin, Coins,
  type LucideIcon,
} from 'lucide-react';
import { TipoInvestimentoEnum } from '../../constants/taxRules';
import { calculateInvestmentTax } from '../../hooks/useTaxCalculator';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface InfoAtivo {
  descricao: string;
  investe: string;
  liquidez: string;
  risco: 'Baixo' | 'Médio' | 'Alto';
  horizonte: string;
  destaques: string[];
}

interface TipoInvestimento {
  id: string;
  enum: TipoInvestimentoEnum;
  label: string;
  Icon: LucideIcon;
  taxaAnual: number;
  cor: string;
  descricaoCurta: string;
  irInfo: string;
  irBadge: string;
  grupo: 'isento' | 'renda-fixa' | 'renda-variavel';
  info: InfoAtivo;
  isentoManual?: boolean;
}

// ---------------------------------------------------------------------------
// Investimentos (Baseado nas regras de 2026)
// ---------------------------------------------------------------------------

const TIPOS: TipoInvestimento[] = [
  // ── Isentos de IR ──────────────────────────────────────────────────────────
  {
    id: 'poupanca', enum: TipoInvestimentoEnum.RENDA_FIXA, label: 'Poupança', Icon: PiggyBank,
    taxaAnual: 6.17, cor: '#6aa3c8', grupo: 'isento',
    descricaoCurta: '6,17% a.a.',
    irInfo: 'Isenta de IR', irBadge: 'Isento',
    isentoManual: true,
    info: {
      descricao: 'A forma mais simples de guardar dinheiro no Brasil. Corrigida pela TR mais 6,17% ao ano, é indicada principalmente para reserva de emergência pela sua liquidez imediata.',
      investe: 'Depósitos bancários corrigidos pela TR',
      liquidez: 'Imediata (D+0)',
      risco: 'Baixo',
      horizonte: 'Curto prazo',
      destaques: ['Isenta de IR para pessoa física', 'Protegida pelo FGC até R$250 mil', 'Liquidez imediata sem perda de rendimento', 'Indicada para reserva de emergência'],
    },
  },
  {
    id: 'lci-lca', enum: TipoInvestimentoEnum.RENDA_FIXA, label: 'LCI / LCA', Icon: Wheat,
    taxaAnual: 10.5, cor: '#52a08e', grupo: 'isento',
    descricaoCurta: '~10,5% a.a.',
    irInfo: 'Isento de IR · Protegido pelo FGC', irBadge: 'Isento',
    isentoManual: true,
    info: {
      descricao: 'Letras de Crédito Imobiliário (LCI) e do Agronegócio (LCA) emitidas por bancos para financiar seus respectivos setores. Isentas de IR para pessoa física, competem diretamente com o CDB.',
      investe: 'Setor imobiliário (LCI) ou agronegócio (LCA)',
      liquidez: 'No vencimento (90 dias a 3 anos)',
      risco: 'Baixo',
      horizonte: 'Médio prazo',
      destaques: ['Isentas de IR para PF', 'Protegidas pelo FGC até R$250 mil', 'Rentabilidade superior à poupança', 'Carência mínima de 90 dias'],
    },
  },
  {
    id: 'cri-cra', enum: TipoInvestimentoEnum.RENDA_FIXA, label: 'CRI / CRA', Icon: Building2,
    taxaAnual: 12.0, cor: '#60a070', grupo: 'isento',
    descricaoCurta: 'IPCA+ ~12% a.a.',
    irInfo: 'Isento de IR · Sem FGC', irBadge: 'Isento',
    isentoManual: true,
    info: {
      descricao: 'Certificados de Recebíveis Imobiliários e do Agronegócio emitidos por securitizadoras. Geralmente indexados ao IPCA+ ou CDI, oferecem rentabilidade acima da média com isenção de IR.',
      investe: 'Recebíveis do setor imobiliário (CRI) ou agronegócio (CRA)',
      liquidez: 'Baixa (mercado secundário)',
      risco: 'Médio',
      horizonte: 'Longo prazo',
      destaques: ['Isentos de IR para PF', 'Sem cobertura do FGC', 'Rentabilidade indexada ao IPCA+', 'Recomendado para investidores qualificados'],
    },
  },
  {
    id: 'debentures', enum: TipoInvestimentoEnum.RENDA_FIXA, label: 'Debêntures', Icon: Zap,
    taxaAnual: 11.5, cor: '#85a052', grupo: 'isento',
    descricaoCurta: '~11,5% a.a.',
    irInfo: 'Isento de IR · Infra (Lei 12.431)', irBadge: 'Isento',
    isentoManual: true,
    info: {
      descricao: 'Títulos de dívida emitidos por empresas privadas para financiar projetos de infraestrutura (energia, rodovias, saneamento). A Lei 12.431 garante isenção de IR para pessoa física.',
      investe: 'Projetos de infraestrutura: energia, transporte e saneamento',
      liquidez: 'Baixa a média',
      risco: 'Médio',
      horizonte: 'Longo prazo',
      destaques: ['Isentas de IR (Lei 12.431)', 'Rentabilidade IPCA+ acima da média', 'Contribuição ao desenvolvimento nacional', 'Sem proteção do FGC'],
    },
  },
  // ── Renda Fixa Tributada ───────────────────────────────────────────────────
  {
    id: 'cdb', enum: TipoInvestimentoEnum.RENDA_FIXA, label: 'CDB', Icon: Landmark,
    taxaAnual: 11.0, cor: '#5a9e90', grupo: 'renda-fixa',
    descricaoCurta: '11% a.a.',
    irInfo: 'IR regressivo até 15%', irBadge: 'IR reg.',
    info: {
      descricao: 'Certificado de Depósito Bancário — o investidor empresta dinheiro ao banco e recebe juros. Um dos investimentos mais populares do Brasil, com variedade de prazos e bancos emissores.',
      investe: 'Carteira de crédito do banco emissor',
      liquidez: 'Varia: liquidez diária ou no vencimento',
      risco: 'Baixo',
      horizonte: 'Curto a médio prazo',
      destaques: ['Protegido pelo FGC até R$250 mil', 'IR regressivo de 22,5% a 15%', 'Taxas acima de 100% do CDI em bancos menores', 'Grande variedade de prazos e emissores'],
    },
  },
  {
    id: 'tesouro', enum: TipoInvestimentoEnum.RENDA_FIXA, label: 'Tesouro Selic', Icon: Flag,
    taxaAnual: 10.5, cor: '#8e84c0', grupo: 'renda-fixa',
    descricaoCurta: '10,5% a.a.',
    irInfo: 'IR regressivo até 15%', irBadge: 'IR reg.',
    info: {
      descricao: 'Título público federal pós-fixado emitido pelo Tesouro Nacional e atrelado à taxa Selic. Considerado o investimento de menor risco do país, pois é garantido pelo governo federal.',
      investe: 'Dívida pública do governo federal',
      liquidez: 'Alta (D+1 dias úteis)',
      risco: 'Baixo',
      horizonte: 'Qualquer prazo',
      destaques: ['Garantido pelo Governo Federal', 'IR regressivo a partir de 22,5%', 'Resgate a qualquer momento sem perda', 'Taxa de custódia de 0,1% a.a. (B3)'],
    },
  },
  // ── Renda Variável ─────────────────────────────────────────────────────────
  {
    id: 'acoes', enum: TipoInvestimentoEnum.ACOES, label: 'Ações', Icon: TrendingUp,
    taxaAnual: 12.0, cor: '#b87898', grupo: 'renda-variavel',
    descricaoCurta: '~12% a.a.',
    irInfo: '15% sobre o lucro (Isento até 20k/mês)', irBadge: 'IR 15%',
    info: {
      descricao: 'Participação no capital de empresas listadas na B3. Ganhos ocorrem por valorização do papel e pelo recebimento de dividendos. É o ativo de maior potencial de retorno no longo prazo.',
      investe: 'Empresas de capital aberto listadas na B3',
      liquidez: 'Alta (D+2 dias úteis)',
      risco: 'Alto',
      horizonte: 'Longo prazo (5+ anos)',
      destaques: ['Isenção de IR para vendas até R$20k/mês', 'Maior potencial de valorização', 'Volatilidade elevada no curto prazo', 'Acesso a grandes empresas brasileiras'],
    },
  },
  {
    id: 'fiis', enum: TipoInvestimentoEnum.FIIS, label: 'FIIs', Icon: Home,
    taxaAnual: 10.0, cor: '#b89842', grupo: 'renda-variavel',
    descricaoCurta: '10% a.a. + Proventos',
    irInfo: '20% fixo sobre o lucro', irBadge: 'IR 20%',
    info: {
      descricao: 'Fundos de Investimento Imobiliário que distribuem rendimentos mensais provenientes de aluguéis de imóveis (shoppings, lajes corporativas, galpões logísticos) ou de títulos do setor imobiliário.',
      investe: 'Imóveis comerciais, industriais e títulos imobiliários (CRI/LCI)',
      liquidez: 'Alta (D+2 dias úteis)',
      risco: 'Médio',
      horizonte: 'Longo prazo',
      destaques: ['Renda passiva mensal distribuída', 'IR 20% apenas sobre ganho de capital', 'Acesso ao mercado imobiliário com pouco capital', 'Diversificação geográfica e setorial'],
    },
  },
  {
    id: 'etfs', enum: TipoInvestimentoEnum.ETFS, label: 'ETFs', Icon: BarChart2,
    taxaAnual: 11.0, cor: '#5e90b8', grupo: 'renda-variavel',
    descricaoCurta: 'Ex: BOVA11 / IVVB11',
    irInfo: '15% sobre o lucro na venda', irBadge: 'IR 15%',
    info: {
      descricao: 'Exchange Traded Funds — fundos negociados em bolsa que replicam índices de referência como o Ibovespa (BOVA11) ou o S&P 500 em reais (IVVB11). Ideal para quem busca diversificação automática e baixo custo.',
      investe: 'Cesta de ações que compõem um índice de referência',
      liquidez: 'Alta (D+2 dias úteis)',
      risco: 'Alto',
      horizonte: 'Longo prazo',
      destaques: ['Diversificação automática e instantânea', 'Taxa de administração baixíssima', 'IR 15% sobre o lucro na venda', 'Estratégia passiva com retorno de mercado'],
    },
  },
  {
    id: 'bdrs', enum: TipoInvestimentoEnum.ACOES, label: 'BDRs', Icon: Globe,
    taxaAnual: 13.0, cor: '#8278b8', grupo: 'renda-variavel',
    descricaoCurta: '~13% a.a.',
    irInfo: '15% sobre o lucro (Isento até 20k/mês)', irBadge: 'IR 15%',
    info: {
      descricao: 'Brazilian Depositary Receipts — certificados que representam ações de empresas estrangeiras (Apple, Microsoft, Amazon, Tesla) negociados diretamente na B3, em reais, sem necessidade de conta no exterior.',
      investe: 'Ações das maiores empresas globais via B3',
      liquidez: 'Alta (D+2 dias úteis)',
      risco: 'Alto',
      horizonte: 'Longo prazo',
      destaques: ['Exposição internacional sem conta no exterior', 'IR 15% (isenção até R$20k/mês em vendas)', 'Risco cambial: varia com o dólar/euro', 'Acesso às maiores empresas do mundo'],
    },
  },
  {
    id: 'cripto', enum: TipoInvestimentoEnum.CRIPTO, label: 'Cripto', Icon: Bitcoin,
    taxaAnual: 25.0, cor: '#b87e4a', grupo: 'renda-variavel',
    descricaoCurta: 'Retorno variável',
    irInfo: '15% sobre o lucro (Isento até 35k/mês)', irBadge: 'IR 15%',
    info: {
      descricao: 'Ativos digitais descentralizados baseados em tecnologia blockchain. Alta volatilidade com potencial de retorno expressivo — e perdas igualmente altas. Exige perfil arrojado e diversificação controlada.',
      investe: 'Moedas digitais: Bitcoin, Ethereum, Solana e outros',
      liquidez: 'Muito alta (mercado 24/7)',
      risco: 'Alto',
      horizonte: 'Longo prazo (ciclos de 4 anos)',
      destaques: ['Mercado aberto 24 horas, 7 dias', 'IR 15% (isenção até R$35k/mês)', 'Volatilidade muito elevada', 'Sem regulação centralizada no Brasil'],
    },
  },
  {
    id: 'dividendos', enum: TipoInvestimentoEnum.DIVIDENDOS, label: 'Dividendos', Icon: Coins,
    taxaAnual: 8.0, cor: '#52a06a', grupo: 'renda-variavel',
    descricaoCurta: 'Renda passiva',
    irInfo: '15% sobre o excedente (Isento até 50k/mês)', irBadge: 'IR 15%',
    info: {
      descricao: 'Estratégia de investimento em empresas com histórico consistente de distribuição de lucros aos acionistas. Gera uma renda passiva crescente ao longo do tempo, ideal para quem busca independência financeira.',
      investe: 'Ações de empresas consolidadas com alto payout',
      liquidez: 'Alta (D+2 dias úteis)',
      risco: 'Médio',
      horizonte: 'Longo prazo',
      destaques: ['Renda passiva mensal ou trimestral', 'IR 15% sobre excedente de R$50k/mês', 'Empresas sólidas e defensivas', 'Reinvestimento potencializa o efeito dos juros compostos'],
    },
  },
];

// ---------------------------------------------------------------------------
// Cálculos Centralizados
// ---------------------------------------------------------------------------

function calcularBruto(p: number, pmt: number, n: number, taxa: number) {
  const r = taxa / 100 / 12;
  if (r === 0) return p + pmt * n;
  const f = Math.pow(1 + r, n);
  return p * f + pmt * ((f - 1) / r);
}

function obterDataAplicacao(meses: number): Date {
  const data = new Date();
  data.setMonth(data.getMonth() - meses);
  return data;
}

function calcularResultado(p: number, pmt: number, n: number, tipo: TipoInvestimento) {
  const aportado = p + pmt * n;
  const totalBruto = calcularBruto(p, pmt, n, tipo.taxaAnual);
  const rendBruto = Math.max(0, totalBruto - aportado);
  
  // Usando a lógica centralizada de impostos
  const taxResult = tipo.isentoManual 
    ? { valorImposto: 0, aliquotaAplicada: 0, isento: true }
    : calculateInvestmentTax({
        valorBruto: totalBruto,
        rendimentoBruto: rendBruto,
        dataAplicacao: obterDataAplicacao(n),
        tipoInvestimento: tipo.enum,
      });

  const ir = taxResult.valorImposto;
  const rendLiquido = rendBruto - ir;
  
  return { 
    aportado, 
    totalBruto, 
    rendBruto, 
    ir, 
    rendLiquido, 
    totalLiquido: aportado + rendLiquido,
    aliquota: taxResult.aliquotaAplicada,
    isento: taxResult.isento
  };
}

function calcularEvolucao(p: number, pmt: number, n: number, tipo: TipoInvestimento) {
  const passo = Math.max(1, Math.ceil(n / 24));
  const pts: any[] = [];
  for (let i = 0; i <= n; i += passo) {
    const res = calcularResultado(p, pmt, i, tipo);
    const a = Math.floor(i / 12), m = i % 12;
    const label = i === 0 ? 'Início' : a === 0 ? `${i}m` : m === 0 ? `${a}a` : `${a}a${m}m`;
    pts.push({ label, aportado: Math.round(res.aportado * 100) / 100, liquido: Math.round(res.totalLiquido * 100) / 100 });
  }
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
    <span className="text-c-text/40 text-xs font-semibold tracking-widest uppercase">{label}</span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-11 h-11 rounded-xl bg-c-surface border border-c-border text-c-text text-xl font-bold flex items-center justify-center active:bg-c-surface/80 transition-all cursor-pointer shrink-0"
      >−</button>
      <div className="flex-1 h-11 bg-c-surface border border-c-border rounded-xl flex items-center justify-center">
        <span className="text-c-text font-bold text-base">{value}</span>
        <span className="text-c-text/40 text-xs ml-1">{unit}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-11 h-11 rounded-xl bg-c-surface border border-c-border text-c-text text-xl font-bold flex items-center justify-center active:bg-c-surface/80 transition-all cursor-pointer shrink-0"
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
    <div className="bg-c-surface border border-c-border rounded-xl px-4 py-3 shadow-xl min-w-[160px]">
      <p className="text-c-text/50 text-xs mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }} className="text-xs">{p.name}</span>
          <span className="text-c-text font-bold text-xs">{fmt(p.value)}</span>
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
  const [personalizando, setPersonalizando] = useState(false);

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
        <h1 className="text-c-text text-xl font-bold">Calculadora</h1>
        <p className="text-c-text/40 text-sm mt-0.5">Simule o rendimento líquido dos seus investimentos</p>
      </div>

      {/* ── SEÇÃO 1: VALORES ─────────────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase">Valores</p>

        <div className="grid grid-cols-2 gap-3">
          {/* Valor inicial */}
          <div className="flex flex-col gap-1.5">
            <label className="text-c-positive text-xs font-semibold tracking-widest uppercase">Inicial</label>
            <div className="flex h-12 rounded-xl overflow-hidden border border-c-border bg-c-surface">
              <span className="px-3 flex items-center text-c-positive font-bold text-sm bg-c-surface border-r border-c-border shrink-0">R$</span>
              <input
                type="number" inputMode="decimal" min="0" step="100"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
                className="flex-1 min-w-0 px-3 bg-transparent text-c-text text-sm outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Aporte mensal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-c-positive text-xs font-semibold tracking-widest uppercase">Mensal</label>
            <div className="flex h-12 rounded-xl overflow-hidden border border-c-border bg-c-surface">
              <span className="px-3 flex items-center text-c-positive font-bold text-sm bg-c-surface border-r border-c-border shrink-0">R$</span>
              <input
                type="number" inputMode="decimal" min="0" step="50"
                value={aporteMensal}
                onChange={(e) => setAporteMensal(e.target.value)}
                className="flex-1 min-w-0 px-3 bg-transparent text-c-text text-sm outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 2: PERÍODO ─────────────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-4">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase">Período</p>
          <span className="text-c-positive text-sm font-bold">{labelPeriodo()}</span>
        </div>

        {/* Atalhos */}
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden -mx-1 px-1 pb-1">
          {ATALHOS.map((a) => {
            const ativo = anos === a.anos && mesesExtra === a.meses;
            return (
              <button
                key={a.label}
                onClick={() => { setAnos(a.anos); setMesesExtra(a.meses); setPersonalizando(false); }}
                className={`shrink-0 h-9 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  ativo && !personalizando
                    ? 'bg-c-positive border-c-positive text-c-bg'
                    : 'bg-c-surface border-c-border text-c-text/50'
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        {/* Toggle personalizar */}
        <button
          onClick={() => setPersonalizando((v) => !v)}
          className="flex items-center gap-1.5 self-start text-xs font-semibold text-c-text/40 hover:text-c-text/70 transition-colors cursor-pointer bg-transparent border-none px-0"
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-300 ${personalizando ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {personalizando ? 'Ocultar' : 'Personalizar período'}
        </button>

        {/* Steppers — expansível */}
        <div className={`grid transition-all duration-300 ${personalizando ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="flex gap-3 pt-1">
              <Stepper label="Anos" unit="a" value={anos} min={0} max={50} onChange={(v) => { setAnos(v); setPersonalizando(true); }} />
              <Stepper label="Meses" unit="m" value={mesesExtra} min={0} max={11} onChange={(v) => { setMesesExtra(v); setPersonalizando(true); }} />
            </div>
          </div>
        </div>

      </div>

      {/* ── SEÇÃO 3: TIPO DE INVESTIMENTO ────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase px-1">Tipo de investimento</p>

        {([
          { key: 'isento',         label: 'Isentos de IR',    badge: '✦ Sem imposto' },
          { key: 'renda-fixa',     label: 'Renda Fixa',       badge: null },
          { key: 'renda-variavel', label: 'Renda Variável',   badge: null },
        ] as const).map(({ key, label, badge }) => {
          const grupo = TIPOS.filter((t) => t.grupo === key);
          return (
            <div key={key} className="flex flex-col gap-2">
              {/* Rótulo do grupo */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-c-text/50 text-[11px] font-bold tracking-widest uppercase">{label}</span>
                {badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-c-positive/10 text-c-positive">{badge}</span>
                )}
              </div>

              {/* Cards */}
              <div className="flex gap-3 overflow-x-auto overflow-y-hidden -mx-1 px-1 pb-2">
                {grupo.map((t) => {
                  const ativo = tipoId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTipoId(t.id)}
                      className="shrink-0 flex flex-col gap-1 p-4 rounded-2xl border transition-all cursor-pointer text-left w-[140px]"
                      style={
                        ativo
                          ? { backgroundColor: `${t.cor}20`, borderColor: t.cor }
                          : { backgroundColor: 'var(--color-c-surface)', borderColor: 'var(--color-c-border)' }
                      }
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${t.cor}20` }}>
                        <t.Icon size={16} style={{ color: t.cor }} strokeWidth={2} />
                      </div>
                      <span className="text-c-text text-sm font-bold mt-1 leading-tight">{t.label}</span>
                      <span className="text-xs font-semibold" style={{ color: ativo ? t.cor : 'var(--color-c-text-40)' }}>
                        {t.descricaoCurta}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold mt-1 self-start"
                        style={
                          ativo
                            ? { backgroundColor: `${t.cor}30`, color: t.cor }
                            : { backgroundColor: 'var(--color-c-surface)', color: 'var(--color-c-text-35)' }
                        }
                      >
                        {t.irBadge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SEÇÃO 4: RESULTADO PRINCIPAL (hero) ──────────────────────── */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4 border"
        style={{ backgroundColor: `${tipo.cor}15`, borderColor: `${tipo.cor}40` }}
      >
        {/* Valor final em destaque */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-c-text/50 text-xs font-semibold tracking-widest uppercase mb-1">
              Valor final líquido · {tipo.label}
            </p>
            <p className="text-c-text text-3xl sm:text-4xl font-black leading-none">
              {fmt(res.totalLiquido)}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: tipo.cor }}>
              +{pctRendimento}% líquido sobre o aportado
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${tipo.cor}25` }}>
            <tipo.Icon size={24} style={{ color: tipo.cor }} strokeWidth={1.8} />
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px border-t border-c-border" />

        {/* 3 métricas secundárias */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-c-text/40 text-[10px] font-semibold uppercase tracking-wide">Aportado</span>
            <span className="text-c-text font-bold text-sm">{fmt(res.aportado)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-c-text/40 text-[10px] font-semibold uppercase tracking-wide">Rendimento</span>
            <span className="font-bold text-sm" style={{ color: tipo.cor }}>+{fmt(res.rendLiquido)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-c-text/40 text-[10px] font-semibold uppercase tracking-wide">
              {res.ir === 0 ? 'IR' : `IR ${(res.aliquota * 100).toFixed(1)}%`}
            </span>
            <span className="text-c-negative font-bold text-sm">
              {res.ir === 0 ? 'Isento' : `−${fmt(res.ir)}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 5: GRÁFICO ─────────────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <p className="text-c-text font-semibold text-sm">Evolução do patrimônio</p>
          <p className="text-c-text/40 text-xs mt-0.5">Aportado vs. valor líquido ao longo do tempo</p>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={evolucao} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gLiq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={tipo.cor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={tipo.cor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gAp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-c-text)" stopOpacity={0.08} />
                <stop offset="95%" stopColor="var(--color-c-text)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-c-border)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--color-c-text)', fontSize: 9, opacity: 0.3 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'var(--color-c-text)', fontSize: 9, opacity: 0.3 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip content={<TooltipCustom />} />
            <Area type="monotone" dataKey="aportado" name="Aportado" stroke="var(--color-c-text)" fill="url(#gAp)" strokeWidth={1.5} dot={false} opacity={0.2} />
            <Area type="monotone" dataKey="liquido" name="Líquido" stroke={tipo.cor} fill="url(#gLiq)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legenda manual (mais legível no mobile) */}
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-c-text/30" />
            <span className="text-c-text/40 text-xs">Aportado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: tipo.cor }} />
            <span className="text-c-text/60 text-xs">Líquido após IR</span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 6: SOBRE O ATIVO ───────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-5" style={{ borderColor: `${tipo.cor}30` }}>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${tipo.cor}20` }}>
            <tipo.Icon size={20} style={{ color: tipo.cor }} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-c-text font-bold text-sm leading-tight">Sobre {tipo.label}</p>
            <p className="text-c-text/40 text-xs mt-0.5">{tipo.descricaoCurta} · {tipo.irBadge}</p>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-c-text/70 text-sm leading-relaxed">{tipo.info.descricao}</p>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Risco', value: tipo.info.risco, cor: tipo.info.risco === 'Baixo' ? 'var(--color-c-positive)' : tipo.info.risco === 'Médio' ? '#b89842' : 'var(--color-c-negative)' },
            { label: 'Liquidez', value: tipo.info.liquidez, cor: 'var(--color-c-text)' },
            { label: 'Horizonte', value: tipo.info.horizonte, cor: 'var(--color-c-text)' },
          ].map(({ label, value, cor }) => (
            <div key={label} className="bg-c-bg rounded-xl p-3 flex flex-col gap-1 border border-c-border">
              <span className="text-c-text/40 text-[10px] font-bold uppercase tracking-widest">{label}</span>
              <span className="text-xs font-bold leading-tight" style={{ color: cor }}>{value}</span>
            </div>
          ))}
        </div>

        {/* O que investe */}
        <div className="flex flex-col gap-1.5">
          <span className="text-c-text/40 text-[10px] font-bold uppercase tracking-widest">Investe em</span>
          <p className="text-c-text/80 text-sm font-medium">{tipo.info.investe}</p>
        </div>

        {/* Destaques */}
        <div className="flex flex-col gap-2">
          <span className="text-c-text/40 text-[10px] font-bold uppercase tracking-widest">Destaques</span>
          <div className="flex flex-col gap-1.5">
            {tipo.info.destaques.map((d) => (
              <div key={d} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: tipo.cor }} />
                <span className="text-c-text/70 text-sm leading-snug">{d}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── SEÇÃO 7: COMPARATIVO ─────────────────────────────────────── */}
      <div className="bg-c-surface border border-c-border rounded-2xl p-5 flex flex-col gap-3">
        <div>
          <p className="text-c-text font-semibold text-sm">Comparativo líquido</p>
          <p className="text-c-text/40 text-xs mt-0.5">Toque para selecionar e ver no gráfico</p>
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
                  ativo ? 'border-c-border bg-c-surface' : 'border-transparent bg-c-surface/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${t.cor}20` }}>
                      <t.Icon size={13} style={{ color: t.cor }} strokeWidth={2} />
                    </div>
                    <span className="text-c-text/80 text-sm font-semibold">{t.label}</span>
                    {i === 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${t.cor}30`, color: t.cor }}>
                        MELHOR
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-c-text font-bold text-sm">{fmt(t.totalLiquido)}</p>
                    {t.ir > 0 && (
                      <p className="text-c-negative/60 text-[10px]">IR −{fmt(t.ir)}</p>
                    )}
                  </div>
                </div>
                <div className="w-full h-1.5 bg-c-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: t.cor }}
                  />
                </div>
                <p className="text-c-text/25 text-[10px] mt-1.5">{t.irInfo}</p>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Calculadora;
