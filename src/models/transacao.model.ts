export type TipoTransacao = 'Receita' | 'Despesa';

export interface Transacao {
  id?: number;
  nome: string;
  tipo: TipoTransacao;
  valor: number;
  data: string;
  descricao: string;
  categoriaId?: number;
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
  categoriaId?: number;
}
