import { Router, Response } from 'express';
import userController from '../controllers/userController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { UserRole, IAuthRequest } from '../types';

const router = Router();

// Autenticação pública
router.post('/register', (req, res) => userController.register(req as IAuthRequest, res));
router.post('/login', (req, res) => userController.login(req as IAuthRequest, res));

// Obter usuário autenticado
router.get('/me', authMiddleware, (req: IAuthRequest, res: Response) =>
  userController.getCurrentUser(req, res)
);

// Admin endpoints
router.get(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => userController.listUsers(req, res)
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => userController.createUserByAdmin(req, res)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => userController.updateUserByAdmin(req, res)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  (req: IAuthRequest, res: Response) => userController.deleteUserByAdmin(req, res)
);

export default router;
