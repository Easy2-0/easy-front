import api from './api';
import type { Categoria } from '../models/categoria.model';

export const categoriaService = {
  async buscarTodas(): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>('/categoria');
    return data;
  },
};
