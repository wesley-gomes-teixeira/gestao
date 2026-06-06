import { config } from '../config/env';
import itemService from '../services/itemService';
import userService from '../services/userService';
import { UserRole } from '../types';

const defaultLoanItems = [
  {
    nome: 'Notebook Dell Latitude',
    descricao: 'Notebook corporativo para uso temporario em atendimentos e trabalho remoto.',
    quantidade: 4,
  },
  {
    nome: 'Monitor 24 polegadas',
    descricao: 'Monitor externo HDMI para estacoes de trabalho.',
    quantidade: 6,
  },
  {
    nome: 'Teclado USB',
    descricao: 'Teclado padrao ABNT2 com conexao USB.',
    quantidade: 8,
  },
  {
    nome: 'Mouse USB',
    descricao: 'Mouse optico com conexao USB.',
    quantidade: 10,
  },
  {
    nome: 'Headset com microfone',
    descricao: 'Headset para reunioes online e suporte remoto.',
    quantidade: 5,
  },
  {
    nome: 'Webcam Full HD',
    descricao: 'Webcam USB para videoconferencias.',
    quantidade: 3,
  },
  {
    nome: 'Projetor multimidia',
    descricao: 'Projetor HDMI para apresentacoes e treinamentos.',
    quantidade: 2,
  },
  {
    nome: 'Cabo HDMI',
    descricao: 'Cabo HDMI para conexao de monitores e projetores.',
    quantidade: 12,
  },
];

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

export async function ensureDefaultLoanItems(): Promise<void> {
  const existingItems = await itemService.listItens();
  const existingNames = new Set(
    existingItems.map((item) => item.nome.trim().toLowerCase())
  );

  for (const item of defaultLoanItems) {
    const itemKey = item.nome.trim().toLowerCase();

    if (existingNames.has(itemKey)) {
      continue;
    }

    await itemService.createItem(item.nome, item.descricao, item.quantidade);
    console.log('Item inicial criado:', item.nome);
  }
}
