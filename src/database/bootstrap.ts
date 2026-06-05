import { config } from '../config/env';
import userService from '../services/userService';
import { UserRole } from '../types';

export async function ensureDefaultAdmin(): Promise<void> {
  const { email, password, nome } = config.defaultAdmin;

  if (!email || !password || !nome) {
    console.log('Admin inicial nao configurado. Pulando bootstrap.');
    return;
  }

  const existingAdmin = await userService.getUserByEmail(email);

  if (existingAdmin) {
    console.log('Admin inicial ja existe:', email);
    return;
  }

  await userService.createUser(email, password, nome, UserRole.ADMIN);
  console.log('Admin inicial criado:', email);
}
