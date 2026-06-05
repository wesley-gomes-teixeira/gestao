import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import { config } from './env';

dotenv.config();

const pool = new Pool(
  config.database.connectionString
    ? { connectionString: config.database.connectionString }
    : {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
      }
);

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
