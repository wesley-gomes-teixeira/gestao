import { Response } from 'express';
import { IAuthRequest } from '../types';
import itemService from '../services/itemService';

export class ItemController {
  // Admin endpoints
  async createItem(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { nome, descricao, quantidade } = req.body;

      if (!nome || !quantidade) {
        res.status(400).json({ erro: 'Nome e quantidade são obrigatórios' });
        return;
      }

      const item = await itemService.createItem(nome, descricao || '', quantidade);

      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao criar item' });
    }
  }

  async listItens(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const itens = await itemService.listItens();

      res.json(itens);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar itens' });
    }
  }

  async getItemById(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const item = await itemService.getItemById(id);

      if (!item) {
        res.status(404).json({ erro: 'Item não encontrado' });
        return;
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar item' });
    }
  }

  async updateItem(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, descricao, quantidade, quantidade_disponivel } = req.body;

      const item = await itemService.updateItem(id, {
        nome,
        descricao,
        quantidade,
        quantidade_disponivel,
      });

      res.json(item);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao atualizar item' });
    }
  }

  async deleteItem(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await itemService.deleteItem(id);

      res.json({ mensagem: 'Item deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao deletar item' });
    }
  }

  // Empréstimo endpoints
  async emprestar(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      const { itemId, quantidade } = req.body;

      if (!itemId || !quantidade) {
        res.status(400).json({ erro: 'Item ID e quantidade são obrigatórios' });
        return;
      }

      const emprestimo = await itemService.emprestar(
        itemId,
        req.user.id,
        quantidade
      );

      res.status(201).json(emprestimo);
    } catch (error: any) {
      res.status(400).json({ erro: error.message || 'Erro ao emprestar item' });
    }
  }

  async devolverItem(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { emprestimoId, itemId } = req.body;

      if (!emprestimoId || !itemId) {
        res
          .status(400)
          .json({ erro: 'Empréstimo ID e Item ID são obrigatórios' });
        return;
      }

      await itemService.devolverItem(emprestimoId, itemId);

      res.json({ mensagem: 'Item devolvido com sucesso' });
    } catch (error: any) {
      res.status(400).json({ erro: error.message || 'Erro ao devolver item' });
    }
  }

  async listEmprestimos(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.query;

      const emprestimos = await itemService.listEmprestimos(
        usuarioId as string
      );

      res.json(emprestimos);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar empréstimos' });
    }
  }
}

export default new ItemController();
