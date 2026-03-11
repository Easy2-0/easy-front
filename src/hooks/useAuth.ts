import { useState } from 'react';
import { usuarioService } from '../services/usuarioService';
import type { UsuarioResponse } from '../models';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await usuarioService.login({ email, senha });
      return true;
    } catch {
      setError('Email ou senha inválidos.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    usuarioService.logout();
  };

  const getUsuario = (): UsuarioResponse | null => {
    return usuarioService.getUsuarioLogado();
  };

  return { login, logout, getUsuario, loading, error };
};
