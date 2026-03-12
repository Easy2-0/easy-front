import { TipoInvestimentoEnum, TAX_RULES_2026, ALIQUOTA_DAY_TRADE } from '../constants/taxRules';

export interface TaxCalculationParams {
  valorBruto: number;
  rendimentoBruto: number;
  dataAplicacao: Date;
  tipoInvestimento: TipoInvestimentoEnum;
  isDayTrade?: boolean;
}

export interface TaxCalculationResult {
  valorImposto: number;
  rendimentoLiquido: number;
  aliquotaAplicada: number;
  isento: boolean;
}

/**
 * Calcula o imposto de renda sobre o investimento de acordo com as regras brasileiras de 2026.
 */
export const calculateInvestmentTax = ({
  valorBruto,
  rendimentoBruto,
  dataAplicacao,
  tipoInvestimento,
  isDayTrade = false,
}: TaxCalculationParams): TaxCalculationResult => {
  const rule = TAX_RULES_2026[tipoInvestimento];
  let aliquota = rule.aliquota;
  let isento = false;

  // 1. Verificar Isenções (Ações, Cripto, Dividendos)
  // Nota: Isenção é sobre o total de VENDAS no mês, mas aqui usaremos valorBruto como proxy.
  if (rule.isencaoMensal && valorBruto <= rule.isencaoMensal) {
    isento = true;
    aliquota = 0;
  }

  // 2. Regra Regressiva para Renda Fixa
  if (!isento && tipoInvestimento === TipoInvestimentoEnum.RENDA_FIXA && rule.regressiva) {
    const dataAtual = new Date();
    const diffTime = Math.abs(dataAtual.getTime() - dataAplicacao.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const step = rule.regressiva.find((s) => diffDays <= s.dias);
    aliquota = step ? step.aliquota : rule.aliquota;
  }

  // 3. Day Trade (Ações / ETFs / FIIs geralmente não variam, mas prompt foca em Ações/ETFs)
  if (!isento && isDayTrade && (tipoInvestimento === TipoInvestimentoEnum.ACOES || tipoInvestimento === TipoInvestimentoEnum.ETFS)) {
    aliquota = ALIQUOTA_DAY_TRADE;
  }

  const valorImposto = isento ? 0 : rendimentoBruto * aliquota;
  const rendimentoLiquido = rendimentoBruto - valorImposto;

  return {
    valorImposto,
    rendimentoLiquido,
    aliquotaAplicada: aliquota,
    isento,
  };
};

/**
 * Hook para facilitar o uso da lógica de cálculo de impostos em componentes React.
 */
export const useTaxCalculator = () => {
  return {
    calculate: calculateInvestmentTax,
  };
};
