import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'seu_secret_jwt_super_seguro',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  database: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'gestao_user',
    password: process.env.DB_PASSWORD || 'gestao_password',
    database: process.env.DB_NAME || 'gestao_db',
  },
};
