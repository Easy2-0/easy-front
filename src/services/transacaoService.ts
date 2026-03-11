import api from './api';
import type { Transacao, TransacaoForm } from '../models';

const normalizar = (t: Transacao): Transacao => ({ ...t, valor: Number(t.valor) });

export const transacaoService = {
  async buscarTodas(): Promise<Transacao[]> {
    const { data } = await api.get<Transacao[]>('/transacao');
    return data.map(normalizar);
  },

  async criar(form: TransacaoForm, usuarioId: number): Promise<Transacao> {
    const payload = { ...form, usuarioId };
    const { data } = await api.post<Transacao>('/transacao', payload);
    return normalizar(data);
  },

  async atualizar(id: number, form: TransacaoForm, usuarioId: number): Promise<Transacao> {
    const payload = { ...form, usuarioId };
    const { data } = await api.put<Transacao>(`/transacao/${id}`, payload);
    return normalizar(data);
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/transacao/${id}`);
  },
};
