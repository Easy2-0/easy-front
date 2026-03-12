import api from './api';
import type { UsuarioLogin, UsuarioCadastro, UsuarioResponse } from '../models';

export const usuarioService = {
  async login({ email, senha }: UsuarioLogin): Promise<UsuarioResponse> {
    const { data } = await api.post<UsuarioResponse>('/auth/login', { email, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data));
    return data;
  },

  async cadastrar(payload: UsuarioCadastro): Promise<UsuarioResponse> {
    const { data } = await api.post<UsuarioResponse>('/auth/cadastro', payload);
    return data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getUsuarioLogado(): UsuarioResponse | null {
    const raw = localStorage.getItem('usuario');
    return raw ? (JSON.parse(raw) as UsuarioResponse) : null;
  },

  isAutenticado(): boolean {
    return !!localStorage.getItem('token');
  },
};
