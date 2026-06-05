import { Request } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  ANALISTA = 'analista',
  USUARIO = 'usuario',
}

export enum ChamadoStatus {
  ABERTO = 'aberto',
  EM_ANDAMENTO = 'em_andamento',
  RESOLVIDO = 'resolvido',
  FECHADO = 'fechado',
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  nome: string;
  role: UserRole;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface IChamado {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao: string;
  status: ChamadoStatus;
  prioridade: 'baixa' | 'media' | 'alta';
  criado_em: Date;
  atualizado_em: Date;
}

export interface IRespostaChamado {
  id: string;
  chamado_id: string;
  usuario_id: string;
  resposta: string;
  criado_em: Date;
}

export interface IItem {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  quantidade_disponivel: number;
  criado_em: Date;
  atualizado_em: Date;
}

export interface IJWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface IAuthRequest extends Request {
  user?: IJWTPayload;
}
