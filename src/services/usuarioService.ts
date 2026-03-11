import api from './api';
import type { UsuarioLogin, UsuarioCadastro, UsuarioResponse } from '../models';

const MOCK_ADMIN: UsuarioResponse = {
  id: 1,
  nome: 'Admin',
  email: 'admin@email.com',
  token: 'mock-token-admin',
};

const MOCK_CREDENTIALS = {
  email: 'admin@email.com',
  senha: '123456',
};

export const usuarioService = {
  async login({ email, senha }: UsuarioLogin): Promise<UsuarioResponse> {
    if (email === MOCK_CREDENTIALS.email && senha === MOCK_CREDENTIALS.senha) {
      localStorage.setItem('token', MOCK_ADMIN.token);
      localStorage.setItem('usuario', JSON.stringify(MOCK_ADMIN));
      return MOCK_ADMIN;
    }

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
