import { Router, Response } from 'express';
import itemController from '../controllers/itemController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { UserRole, IAuthRequest } from '../types';

const router = Router();

// Admin - Criar item
router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => itemController.createItem(req, res)
);

// Listar itens (qualquer usuário autenticado)
router.get('/', authMiddleware, (req: IAuthRequest, res: Response) =>
  itemController.listItens(req, res)
);

// Empréstimos - rotas específicas devem vir antes de /:id
router.post(
  '/emprestar',
  authMiddleware,
  (req: IAuthRequest, res: Response) => itemController.emprestar(req, res)
);

router.post(
  '/devolver',
  authMiddleware,
  (req: IAuthRequest, res: Response) => itemController.devolverItem(req, res)
);

router.get(
  '/listar-emprestimos',
  authMiddleware,
  (req: IAuthRequest, res: Response) => itemController.listEmprestimos(req, res)
);

// Obter item por ID
router.get('/:id', authMiddleware, (req: IAuthRequest, res: Response) =>
  itemController.getItemById(req, res)
);

// Admin - Atualizar item
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => itemController.updateItem(req, res)
);

// Admin - Deletar item
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => itemController.deleteItem(req, res)
);

export default router;
