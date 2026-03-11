import type { Transacao } from '../models';

export const isReceita = (tipo: string) => tipo === 'Receita';

export const formatarValor = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const calcularTotais = (transacoes: Transacao[]) => {
  const entrada = transacoes.filter((t) => isReceita(t.tipo)).reduce((s, t) => s + t.valor, 0);
  const saida = transacoes.filter((t) => !isReceita(t.tipo)).reduce((s, t) => s + t.valor, 0);
  return { entrada, saida, saldo: entrada - saida };
};

export const filtrarMesAtual = (transacoes: Transacao[]) => {
  const agora = new Date();
  return transacoes.filter((t) => {
    const data = new Date(t.data);
    return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
  });
};

export const calcularEvolucaoMensal = (transacoes: Transacao[]) => {
  const meses: Record<string, { mes: string; receitas: number; despesas: number }> = {};

  transacoes.forEach((t) => {
    const data = new Date(t.data);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    const label = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    if (!meses[chave]) meses[chave] = { mes: label, receitas: 0, despesas: 0 };

    if (isReceita(t.tipo)) meses[chave].receitas += t.valor;
    else meses[chave].despesas += t.valor;
  });

  return Object.entries(meses)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);
};

export const buscarDestaques = (transacoes: Transacao[]) => {
  const receitas = transacoes.filter((t) => isReceita(t.tipo));
  const despesas = transacoes.filter((t) => !isReceita(t.tipo));

  const maiorReceita = receitas.length > 0 ? receitas.reduce((a, b) => (a.valor > b.valor ? a : b)) : null;
  const maiorDespesa = despesas.length > 0 ? despesas.reduce((a, b) => (a.valor > b.valor ? a : b)) : null;

  return { maiorReceita, maiorDespesa };
};
