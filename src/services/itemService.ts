import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { IItem } from '../types';

export class ItemService {
  async createItem(
    nome: string,
    descricao: string,
    quantidade: number
  ): Promise<IItem> {
    const id = uuidv4();

    const result = await query(
      `INSERT INTO itens (id, nome, descricao, quantidade, quantidade_disponivel, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, nome, descricao, quantidade, quantidade_disponivel, criado_em, atualizado_em`,
      [id, nome, descricao, quantidade]
    );

    return result.rows[0];
  }

  async getItemById(id: string): Promise<IItem | null> {
    const result = await query(
      `SELECT id, nome, descricao, quantidade, quantidade_disponivel, criado_em, atualizado_em
       FROM itens WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  async listItens(): Promise<IItem[]> {
    const result = await query(
      `SELECT id, nome, descricao, quantidade, quantidade_disponivel, criado_em, atualizado_em
       FROM itens ORDER BY nome ASC`
    );

    return result.rows;
  }

  async updateItem(id: string, data: Partial<IItem>): Promise<IItem> {
    const updates: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;

    if (data.nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(data.nome);
    }

    if (data.descricao !== undefined) {
      updates.push(`descricao = $${paramIndex++}`);
      values.push(data.descricao);
    }

    if (data.quantidade !== undefined) {
      updates.push(`quantidade = $${paramIndex++}`);
      values.push(data.quantidade);
    }

    if (data.quantidade_disponivel !== undefined) {
      updates.push(`quantidade_disponivel = $${paramIndex++}`);
      values.push(data.quantidade_disponivel);
    }

    updates.push(`atualizado_em = CURRENT_TIMESTAMP`);

    const result = await query(
      `UPDATE itens SET ${updates.join(', ')} WHERE id = $1
       RETURNING id, nome, descricao, quantidade, quantidade_disponivel, criado_em, atualizado_em`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Item não encontrado');
    }

    return result.rows[0];
  }

  async deleteItem(id: string): Promise<void> {
    await query(`DELETE FROM itens WHERE id = $1`, [id]);
  }

  async emprestar(itemId: string, usuarioId: string, quantidade: number): Promise<any> {
    const id = uuidv4();

    // Verificar disponibilidade
    const item = await this.getItemById(itemId);
    if (!item || item.quantidade_disponivel < quantidade) {
      throw new Error('Quantidade não disponível');
    }

    // Registrar empréstimo
    await query(
      `INSERT INTO emprestimos (id, usuario_id, item_id, quantidade, data_emprestimo, devolvido)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, false)`,
      [id, usuarioId, itemId, quantidade]
    );

    // Atualizar quantidade disponível
    await this.updateItem(itemId, {
      quantidade_disponivel: item.quantidade_disponivel - quantidade,
    });

    return { id, itemId, usuarioId, quantidade };
  }

  async devolverItem(emprestimoId: string, itemId: string): Promise<void> {
    // Obter empréstimo
    const result = await query(
      `SELECT quantidade FROM emprestimos WHERE id = $1 AND devolvido = false`,
      [emprestimoId]
    );

    if (result.rows.length === 0) {
      throw new Error('Empréstimo não encontrado');
    }

    const { quantidade } = result.rows[0];

    // Atualizar empréstimo
    await query(
      `UPDATE emprestimos SET devolvido = true, data_devolucao = CURRENT_TIMESTAMP WHERE id = $1`,
      [emprestimoId]
    );

    // Atualizar quantidade disponível
    const item = await this.getItemById(itemId);
    if (item) {
      await this.updateItem(itemId, {
        quantidade_disponivel: item.quantidade_disponivel + quantidade,
      });
    }
  }

  async listEmprestimos(usuarioId?: string): Promise<any[]> {
    let query_str = `SELECT id, usuario_id, item_id, quantidade, data_emprestimo, data_devolucao, devolvido
                    FROM emprestimos`;
    const params: any[] = [];

    if (usuarioId) {
      query_str += ` WHERE usuario_id = $1`;
      params.push(usuarioId);
    }

    query_str += ` ORDER BY data_emprestimo DESC`;

    const result = await query(query_str, params);
    return result.rows;
  }
}

export default new ItemService();
