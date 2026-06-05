import { query } from '../config/database';

export async function runMigrations() {
  try {
    console.log('Iniciando migrations...');

    // Criar extensão UUID
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Tabela de usuários
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('admin', 'analista', 'usuario')),
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de chamados
    await query(`
      CREATE TABLE IF NOT EXISTS chamados (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
        prioridade VARCHAR(50) NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de respostas dos chamados
    await query(`
      CREATE TABLE IF NOT EXISTS respostas_chamados (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        chamado_id UUID NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        resposta TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de itens para empréstimo
    await query(`
      CREATE TABLE IF NOT EXISTS itens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        quantidade INT NOT NULL DEFAULT 0,
        quantidade_disponivel INT NOT NULL DEFAULT 0,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de empréstimos
    await query(`
      CREATE TABLE IF NOT EXISTS emprestimos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
        quantidade INT NOT NULL,
        data_emprestimo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_devolucao TIMESTAMP,
        devolvido BOOLEAN DEFAULT false,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_chamados_usuario_id ON chamados(usuario_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_respostas_chamado_id ON respostas_chamados(chamado_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_respostas_usuario_id ON respostas_chamados(usuario_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_emprestimos_usuario_id ON emprestimos(usuario_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_emprestimos_item_id ON emprestimos(item_id)');

    console.log('✓ Migrations executadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    throw error;
  }
}

// Executar migrations se o arquivo for chamado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Falha nas migrations:', error);
      process.exit(1);
    });
}
