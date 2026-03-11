export type TipoTransacao = 'Receita' | 'Despesa';

export interface Transacao {
  id?: number;
  nome: string;
  tipo: TipoTransacao;
  valor: number;
  data: string;
  descricao: string;
  usuario: {
    id: number;
  };
}

export interface TransacaoForm {
  nome: string;
  tipo: TipoTransacao;
  valor: number;
  data: string;
  descricao: string;
}
