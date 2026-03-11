export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
}

export interface UsuarioLogin {
  email: string;
  senha: string;
}

export interface UsuarioCadastro {
  nome: string;
  email: string;
  senha: string;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  token: string;
}
