import { Response } from 'express';
import { IAuthRequest, UserRole } from '../types';
import userService from '../services/userService';

export class UserController {
  async register(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, nome } = req.body;

      if (!email || !password || !nome) {
        res
          .status(400)
          .json({ erro: 'Email, senha e nome são obrigatórios' });
        return;
      }

      // Verificar se usuário já existe
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ erro: 'Email já cadastrado' });
        return;
      }

      const user = await userService.createUser(
        email,
        password,
        nome,
        UserRole.USUARIO
      );

      res.status(201).json({
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao registrar usuário' });
    }
  }

  async login(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        return;
      }

      const token = await userService.authenticate(email, password);

      res.json({ token });
    } catch (error: any) {
      res.status(401).json({ erro: error.message || 'Credenciais inválidas' });
    }
  }

  async getCurrentUser(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      const user = await userService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({ erro: 'Usuário não encontrado' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        ativo: user.ativo,
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
  }

  // Admin endpoints
  async listUsers(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const users = await userService.listUsers();

      res.json(
        users.map((u) => ({
          id: u.id,
          email: u.email,
          nome: u.nome,
          role: u.role,
          ativo: u.ativo,
          criado_em: u.criado_em,
        }))
      );
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
  }

  async createUserByAdmin(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, nome, role } = req.body;

      if (!email || !password || !nome || !role) {
        res.status(400).json({
          erro: 'Email, senha, nome e role são obrigatórios',
        });
        return;
      }

      // Verificar se usuário já existe
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ erro: 'Email já cadastrado' });
        return;
      }

      const user = await userService.createUser(email, password, nome, role);

      res.status(201).json({
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        ativo: user.ativo,
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
  }

  async updateUserByAdmin(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, email, role, ativo } = req.body;

      const user = await userService.updateUser(id, {
        nome,
        email,
        role,
        ativo,
      });

      res.json({
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        ativo: user.ativo,
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
  }

  async deleteUserByAdmin(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await userService.deleteUser(id);

      res.json({ mensagem: 'Usuário deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao deletar usuário' });
    }
  }
}

export default new UserController();
