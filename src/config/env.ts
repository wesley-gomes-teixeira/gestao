import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const databaseUrl = process.env.DATABASE_URL;

if (isProduction && !databaseUrl && !process.env.DB_HOST) {
  throw new Error(
    'DATABASE_URL nao configurada. No Fly, rode fly postgres attach ou configure o secret DATABASE_URL.'
  );
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv,
  jwtSecret: process.env.JWT_SECRET || 'seu_secret_jwt_super_seguro',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@exemplo.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    nome: process.env.DEFAULT_ADMIN_NAME || 'Admin',
  },
  database: {
    connectionString: databaseUrl,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'gestao_user',
    password: process.env.DB_PASSWORD || 'gestao_password',
    database: process.env.DB_NAME || 'gestao_db',
  },
};
