import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'gestao_user',
  password: process.env.DB_PASSWORD || 'gestao_password',
  database: process.env.DB_NAME || 'gestao_db',
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexão:', err);
});

export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Erro na query:', { text, error });
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export default pool;
