import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IAuthRequest, IJWTPayload, UserRole } from '../types';

export function authMiddleware(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ erro: 'Token não fornecido' });
      return;
    }

    const payload = jwt.verify(token, config.jwtSecret) as IJWTPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

export function roleMiddleware(roles: UserRole[]) {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ erro: 'Usuário não autenticado' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ erro: 'Acesso negado' });
      return;
    }

    next();
  };
}

export function errorHandler(
  err: Error,
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void {
  console.error('Erro:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}
