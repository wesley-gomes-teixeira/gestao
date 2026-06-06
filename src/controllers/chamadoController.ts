import { Response } from 'express';
import { IAuthRequest, UserRole } from '../types';
import chamadoService from '../services/chamadoService';

export class ChamadoController {
  async createChamado(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      if (req.user.role !== UserRole.USUARIO) {
        res.status(403).json({ erro: 'Apenas usuarios podem abrir chamados' });
        return;
      }

      const { titulo, descricao, prioridade } = req.body;

      if (!titulo || !descricao) {
        res.status(400).json({ erro: 'Título e descrição são obrigatórios' });
        return;
      }

      const chamado = await chamadoService.createChamado(
        req.user.id,
        titulo,
        descricao,
        prioridade || 'media'
      );

      res.status(201).json(chamado);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao criar chamado' });
    }
  }

  async getMeusChamados(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      const chamados = await chamadoService.listChamadosDoUsuario(req.user.id);

      res.json(chamados);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar chamados' });
    }
  }

  async getChamadoById(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const chamado = await chamadoService.getChamadoById(id);

      if (!chamado) {
        res.status(404).json({ erro: 'Chamado não encontrado' });
        return;
      }

      // Obter respostas do chamado
      const respostas = await chamadoService.listRespostasChamado(id);

      res.json({ ...chamado, respostas });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar chamado' });
    }
  }

  // Admin e Analista endpoints
  async listTodosChamados(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const chamados = await chamadoService.listTodosChamados();

      res.json(chamados);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar chamados' });
    }
  }

  async updateChamado(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, prioridade, titulo, descricao } = req.body;

      const chamado = await chamadoService.updateChamado(id, {
        status,
        prioridade,
        titulo,
        descricao,
      });

      res.json(chamado);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao atualizar chamado' });
    }
  }

  async adicionarRespostaChamado(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      const { id } = req.params;
      const { resposta } = req.body;

      if (!resposta) {
        res.status(400).json({ erro: 'Resposta é obrigatória' });
        return;
      }

      // Verificar se chamado existe
      const chamado = await chamadoService.getChamadoById(id);
      if (!chamado) {
        res.status(404).json({ erro: 'Chamado não encontrado' });
        return;
      }

      const novaResposta = await chamadoService.addRespostaChamado(
        id,
        req.user.id,
        resposta
      );

      res.status(201).json(novaResposta);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao adicionar resposta' });
    }
  }

  async deleteChamado(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await chamadoService.deleteChamado(id);

      res.json({ mensagem: 'Chamado deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao deletar chamado' });
    }
  }
}

export default new ChamadoController();
