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
      `SELECT c.id, c.usuario_id, c.titulo, c.descricao, c.status, c.prioridade,
              c.criado_em, c.atualizado_em, COUNT(r.id)::int as respostas_count,
              MAX(r.criado_em) as ultima_resposta_em
       FROM chamados c
       LEFT JOIN respostas_chamados r ON r.chamado_id = c.id
       WHERE c.usuario_id = $1
       GROUP BY c.id
       ORDER BY c.criado_em DESC`,
      [usuarioId]
    );

    return result.rows;
  }

  async listTodosChamados(): Promise<IChamado[]> {
    const result = await query(
      `SELECT c.id, c.usuario_id, c.titulo, c.descricao, c.status, c.prioridade,
              c.criado_em, c.atualizado_em, COUNT(r.id)::int as respostas_count,
              MAX(r.criado_em) as ultima_resposta_em
       FROM chamados c
       LEFT JOIN respostas_chamados r ON r.chamado_id = c.id
       GROUP BY c.id
       ORDER BY c.criado_em DESC`
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

    if (data.titulo !== undefined) {
      updates.push(`titulo = $${paramIndex++}`);
      values.push(data.titulo);
    }

    if (data.descricao !== undefined) {
      updates.push(`descricao = $${paramIndex++}`);
      values.push(data.descricao);
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (data.prioridade !== undefined) {
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
      `SELECT r.id, r.chamado_id, r.usuario_id, r.resposta, r.criado_em,
              u.nome as usuario_nome, u.email as usuario_email, u.tipo as usuario_role
       FROM respostas_chamados r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE r.chamado_id = $1
       ORDER BY r.criado_em ASC`,
      [chamadoId]
    );

    return result.rows;
  }
}

export default new ChamadoService();
