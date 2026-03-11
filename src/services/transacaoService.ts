import api from './api';
import type { Transacao, TransacaoForm } from '../models';

export const transacaoService = {
  async buscarTodas(): Promise<Transacao[]> {
    const { data } = await api.get<Transacao[]>('/transacao');
    return data;
  },

  async criar(form: TransacaoForm, usuarioId: number): Promise<Transacao> {
    const payload: Transacao = { ...form, usuario: { id: usuarioId } };
    const { data } = await api.post<Transacao>('/transacao', payload);
    return data;
  },

  async atualizar(id: number, form: TransacaoForm, usuarioId: number): Promise<Transacao> {
    const payload: Transacao = { ...form, usuario: { id: usuarioId } };
    const { data } = await api.put<Transacao>(`/transacao/${id}`, payload);
    return data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/transacao/${id}`);
  },
};
