import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { IChamado, ChamadoStatus, IRespostaChamado } from '../types';

export class ChamadoService {
  async createChamado(
    usuarioId: string,
    titulo: string,
    descricao: string,
    prioridade: 'baixa' | 'media' | 'alta' = 'media'
  ): Promise<IChamado> {
    const id = uuidv4();

    const result = await query(
      `INSERT INTO chamados (id, usuario_id, titulo, descricao, status, prioridade, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, 'aberto', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, usuario_id, titulo, descricao, status, prioridade, criado_em, atualizado_em`,
      [id, usuarioId, titulo, descricao, prioridade]
    );

    return result.rows[0];
  }

  async getChamadoById(id: string): Promise<IChamado | null> {
    const result = await query(
      `SELECT id, usuario_id, titulo, descricao, status, prioridade, criado_em, atualizado_em
       FROM chamados WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  async listChamadosDoUsuario(usuarioId: string): Promise<IChamado[]> {
    const result = await query(
      `SELECT id, usuario_id, titulo, descricao, status, prioridade, criado_em, atualizado_em
       FROM chamados WHERE usuario_id = $1 ORDER BY criado_em DESC`,
      [usuarioId]
    );

    return result.rows;
  }

  async listTodosChamados(): Promise<IChamado[]> {
    const result = await query(
      `SELECT id, usuario_id, titulo, descricao, status, prioridade, criado_em, atualizado_em
       FROM chamados ORDER BY criado_em DESC`
    );

    return result.rows;
  }

  async updateChamado(
    id: string,
    data: Partial<IChamado>
  ): Promise<IChamado> {
    const updates: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;

    if (data.titulo) {
      updates.push(`titulo = $${paramIndex++}`);
      values.push(data.titulo);
    }

    if (data.descricao) {
      updates.push(`descricao = $${paramIndex++}`);
      values.push(data.descricao);
    }

    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (data.prioridade) {
      updates.push(`prioridade = $${paramIndex++}`);
      values.push(data.prioridade);
    }

    updates.push(`atualizado_em = CURRENT_TIMESTAMP`);

    const result = await query(
      `UPDATE chamados SET ${updates.join(', ')} WHERE id = $1
       RETURNING id, usuario_id, titulo, descricao, status, prioridade, criado_em, atualizado_em`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Chamado não encontrado');
    }

    return result.rows[0];
  }

  async deleteChamado(id: string): Promise<void> {
    await query(`DELETE FROM chamados WHERE id = $1`, [id]);
  }

  // Respostas de Chamados
  async addRespostaChamado(
    chamadoId: string,
    usuarioId: string,
    resposta: string
  ): Promise<IRespostaChamado> {
    const id = uuidv4();

    const result = await query(
      `INSERT INTO respostas_chamados (id, chamado_id, usuario_id, resposta, criado_em)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, chamado_id, usuario_id, resposta, criado_em`,
      [id, chamadoId, usuarioId, resposta]
    );

    return result.rows[0];
  }

  async listRespostasChamado(chamadoId: string): Promise<IRespostaChamado[]> {
    const result = await query(
      `SELECT id, chamado_id, usuario_id, resposta, criado_em
       FROM respostas_chamados WHERE chamado_id = $1 ORDER BY criado_em ASC`,
      [chamadoId]
    );

    return result.rows;
  }
}

export default new ChamadoService();
