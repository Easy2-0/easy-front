export enum TipoInvestimentoEnum {
  RENDA_FIXA = 'RENDA_FIXA',
  ACOES = 'ACOES',
  ETFS = 'ETFS',
  FIIS = 'FIIS',
  CRIPTO = 'CRIPTO',
  DIVIDENDOS = 'DIVIDENDOS',
}

export interface TaxRule {
  aliquota: number;
  isencaoMensal?: number;
  regressiva?: { dias: number; aliquota: number }[];
}

export const TAX_RULES_2026: Record<TipoInvestimentoEnum, TaxRule> = {
  [TipoInvestimentoEnum.RENDA_FIXA]: {
    aliquota: 0.15, // Mínima
    regressiva: [
      { dias: 180, aliquota: 0.225 },
      { dias: 360, aliquota: 0.20 },
      { dias: 720, aliquota: 0.175 },
      { dias: 99999, aliquota: 0.15 },
    ],
  },
  [TipoInvestimentoEnum.ACOES]: {
    aliquota: 0.15, // Swing Trade
    isencaoMensal: 20000,
  },
  [TipoInvestimentoEnum.ETFS]: {
    aliquota: 0.15,
  },
  [TipoInvestimentoEnum.FIIS]: {
    aliquota: 0.20,
  },
  [TipoInvestimentoEnum.CRIPTO]: {
    aliquota: 0.15,
    isencaoMensal: 35000,
  },
  [TipoInvestimentoEnum.DIVIDENDOS]: {
    aliquota: 0.15, // Proposta para 2026
    isencaoMensal: 50000,
  },
};

export const ALIQUOTA_DAY_TRADE = 0.20;
