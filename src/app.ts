import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { config } from './config/env';
import { runMigrations } from './database/migrations';
import userRoutes from './routes/users';
import chamadoRoutes from './routes/chamados';
import itemRoutes from './routes/itens';
import { errorHandler } from './middleware/auth';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Routes
app.use('/api/usuarios', userRoutes);
app.use('/api/chamados', chamadoRoutes);
app.use('/api/itens', itemRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Error handler
app.use(errorHandler);

// Initialize server
async function startServer() {
  try {
    // Run migrations
    await runMigrations();

    const { port, host } = config;
    app.listen(port, host, () => {
      console.log(`✓ Servidor rodando em http://${host}:${port}`);
      console.log(`✓ Ambiente: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;
