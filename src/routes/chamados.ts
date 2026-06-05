import { Router, Response } from 'express';
import chamadoController from '../controllers/chamadoController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { UserRole, IAuthRequest } from '../types';

const router = Router();

// Criar chamado (usuário autenticado)
router.post('/', authMiddleware, (req: IAuthRequest, res: Response) =>
  chamadoController.createChamado(req, res)
);

// Rotas específicas devem vir antes de /:id
// Obter meus chamados
router.get('/meus', authMiddleware, (req: IAuthRequest, res: Response) =>
  chamadoController.getMeusChamados(req, res)
);

// Admin e Analista - Listar todos os chamados
router.get(
  '/admin/todos',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.ANALISTA]),
  (req: IAuthRequest, res: Response) => chamadoController.listTodosChamados(req, res)
);

// Obter chamado por ID
router.get('/:id', authMiddleware, (req: IAuthRequest, res: Response) =>
  chamadoController.getChamadoById(req, res)
);

// Admin e Analista - Atualizar chamado
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.ANALISTA]),
  (req: IAuthRequest, res: Response) => chamadoController.updateChamado(req, res)
);

// Admin e Analista - Adicionar resposta
router.post(
  '/:id/respostas',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.ANALISTA]),
  (req: IAuthRequest, res: Response) => chamadoController.adicionarRespostaChamado(req, res)
);

// Admin - Deletar chamado
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => chamadoController.deleteChamado(req, res)
);

export default router;
