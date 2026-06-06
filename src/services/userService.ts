import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { config } from '../config/env';
import { UserRole, IUser } from '../types';

export class UserService {
  async createUser(
    email: string,
    password: string,
    nome: string,
    role: UserRole
  ): Promise<IUser> {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO usuarios (id, email, senha, nome, tipo, ativo, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, nome, tipo as role, ativo, criado_em, atualizado_em`,
      [id, email, hashedPassword, nome, role]
    );

    return {
      ...result.rows[0],
      password: hashedPassword,
    };
  }

  async getUserById(id: string): Promise<IUser | null> {
    const result = await query(
      `SELECT id, email, senha as password, nome, tipo as role, ativo, criado_em, atualizado_em
       FROM usuarios WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const result = await query(
      `SELECT id, email, senha as password, nome, tipo as role, ativo, criado_em, atualizado_em
       FROM usuarios WHERE email = $1`,
      [email]
    );

    return result.rows[0] || null;
  }

  async authenticate(email: string, password: string): Promise<string> {
    const user = await this.getUserByEmail(email);

    if (!user || !user.ativo) {
      throw new Error('Usuário não encontrado ou inativo');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new Error('Senha incorreta');
    }

    const signOptions: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    };

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      signOptions
    );

    return token;
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    const updates: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;

    if (data.nome) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(data.nome);
    }

    if (data.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }

    if (data.role) {
      updates.push(`tipo = $${paramIndex++}`);
      values.push(data.role);
    }

    if (data.ativo !== undefined) {
      updates.push(`ativo = $${paramIndex++}`);
      values.push(data.ativo);
    }

    updates.push(`atualizado_em = CURRENT_TIMESTAMP`);

    const result = await query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $1
       RETURNING id, email, nome, tipo as role, ativo, criado_em, atualizado_em`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    return result.rows[0];
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `UPDATE usuarios SET senha = $2, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1`,
      [id, hashedPassword]
    );

    if (result.rowCount === 0) {
      throw new Error('UsuÃ¡rio nÃ£o encontrado');
    }
  }

  async listUsers(): Promise<IUser[]> {
    const result = await query(
      `SELECT id, email, nome, tipo as role, ativo, criado_em, atualizado_em
       FROM usuarios ORDER BY criado_em DESC`
    );

    return result.rows;
  }

  async deleteUser(id: string): Promise<void> {
    await query(`DELETE FROM usuarios WHERE id = $1`, [id]);
  }
}

export default new UserService();
