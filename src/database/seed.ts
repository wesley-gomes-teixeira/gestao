import userService from '../services/userService';
import { UserRole } from '../types';
import { ensureDefaultLoanItems } from './bootstrap';

export async function seedDatabase() {
  try {
    console.log('Iniciando seeding do banco de dados...');

    // Criar usuários de exemplo
    const adminEmail = 'wesley@gmail.com';
    const analistaEmail = 'analista@exemplo.com';
    const usuarioEmail = 'usuario@exemplo.com';

    // Verificar se admin já existe
    let admin = await userService.getUserByEmail(adminEmail);
    if (!admin) {
      admin = await userService.createUser(
        adminEmail,
        'Wesley@1.',
        'Wesley',
        UserRole.ADMIN
      );
      console.log('✓ Admin criado:', adminEmail);
    }

    // Verificar se analista já existe
    let analista = await userService.getUserByEmail(analistaEmail);
    if (!analista) {
      analista = await userService.createUser(
        analistaEmail,
        'analista123',
        'Analista',
        UserRole.ANALISTA
      );
      console.log('✓ Analista criado:', analistaEmail);
    }

    // Verificar se usuário já existe
    let usuario = await userService.getUserByEmail(usuarioEmail);
    if (!usuario) {
      usuario = await userService.createUser(
        usuarioEmail,
        'usuario123',
        'Usuário Teste',
        UserRole.USUARIO
      );
      console.log('✓ Usuário criado:', usuarioEmail);
    }

    console.log('\n✓ Seeding concluído!');
    console.log('\nCredenciais de teste:');
    console.log('Admin:', adminEmail, '/ Wesley@1.');
    console.log('Analista:', analistaEmail, '/ analista123');
    console.log('Usuário:', usuarioEmail, '/ usuario123');
    await ensureDefaultLoanItems();
    console.log('\nItens de emprestimo criados/verificados.');
  } catch (error) {
    console.error('Erro ao fazer seeding:', error);
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Falha no seeding:', error);
      process.exit(1);
    });
}
