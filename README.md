# Gestão de Suporte - Monólito TypeScript + Express + PostgreSQL + Docker

Sistema completo de gestão de suporte com autenticação JWT, controle de permissões e funcionalidades de empréstimo de itens.

## 🚀 Características

- ✅ **Autenticação JWT** - Login e autenticação segura
- ✅ **3 Tipos de Usuários** - Admin, Analista e Usuário
- ✅ **Sistema de Chamados** - Criar, visualizar e responder chamados
- ✅ **Permissões Baseadas em Roles** - Controle granular de acesso
- ✅ **CRUD de Itens** - Gerenciar itens para empréstimo
- ✅ **Sistema de Empréstimos** - Controlar empréstimos e devoluções
- ✅ **Docker & Docker Compose** - Deploy facilitado
- ✅ **TypeScript** - Type-safe e development experience melhorado

## 📋 Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação Local (sem Docker)

```bash
# Clonar repositório
git clone <seu-repo>
cd gestao

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Compilar TypeScript
npm run build

# Executar migrations
npm run migrate

# Iniciar servidor
npm run dev
```

## 🐳 Executar com Docker

```bash
# Construir e iniciar containers
docker-compose up -d

# Verificar logs
docker-compose logs -f app

# Parar containers
docker-compose down
```

## Deploy no Render

O projeto inclui `render.yaml` para publicar a API, o frontend e o PostgreSQL no Render via Blueprint.

Resumo:

1. Envie o projeto para um repositorio GitHub.
2. No Render, crie `New` > `Blueprint`.
3. Selecione o repositorio.
4. Confirme o `render.yaml`.
5. Ao terminar, acesse a URL `onrender.com` gerada.

Veja o passo a passo completo em `DEPLOY_RENDER.md`.

## Deploy no Fly.io

O projeto tambem inclui `fly.toml` para deploy no Fly.io.

Se os logs mostrarem `ECONNREFUSED 127.0.0.1:5432`, anexe um Postgres ao app para criar `DATABASE_URL`.

Resumo:

```bash
fly secrets set JWT_SECRET="troque-por-um-segredo-forte" -a gestao-ubsb9a
fly postgres create --name gestao-ubsb9a-db --region gru
fly postgres attach gestao-ubsb9a-db --app gestao-ubsb9a
fly deploy -a gestao-ubsb9a
```

Veja o passo a passo completo em `DEPLOY_FLY.md`.

## Frontend

A aplicacao agora tambem entrega um frontend estatico pelo proprio Express.

No primeiro startup, o sistema garante um admin inicial:

- `wesley@gmail.com` / `Wesley@1.`

Em producao, troque `DEFAULT_ADMIN_PASSWORD` depois do primeiro acesso.

- `GET /` - Interface web do sistema
- `GET /styles.css` - Estilos da interface
- `GET /app.js` - Cliente web que consome a API

Para usar localmente:

```bash
npm install
npm run dev
```

Depois acesse `http://localhost:3000`.

O frontend inclui login, cadastro, resumo operacional, abertura e acompanhamento de chamados, listagem e emprestimo de itens, alem de telas administrativas para usuarios e itens quando o perfil autenticado permitir.

## 📚 API Endpoints

### Autenticação
- `POST /api/usuarios/register` - Registrar novo usuário
- `POST /api/usuarios/login` - Login
- `GET /api/usuarios/me` - Obter usuário autenticado

### Usuários (Admin)
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### Chamados
- `POST /api/chamados` - Criar chamado (Usuário)
- `GET /api/chamados/meus` - Obter meus chamados
- `GET /api/chamados/:id` - Obter chamado com respostas
- `GET /api/chamados/admin/todos` - Listar todos (Admin/Analista)
- `PUT /api/chamados/:id` - Atualizar chamado (Admin/Analista)
- `POST /api/chamados/:id/respostas` - Adicionar resposta (Admin/Analista)
- `DELETE /api/chamados/:id` - Deletar chamado (Admin)

### Itens & Empréstimos
- `GET /api/itens` - Listar itens
- `GET /api/itens/:id` - Obter item
- `POST /api/itens` - Criar item (Admin)
- `PUT /api/itens/:id` - Atualizar item (Admin)
- `DELETE /api/itens/:id` - Deletar item (Admin)
- `POST /api/itens/emprestar` - Emprestar item
- `POST /api/itens/devolver` - Devolver item
- `GET /api/itens/listar-emprestimos` - Listar empréstimos (Admin/Analista)

## 🔐 Autenticação

Incluir token JWT no header:
```
Authorization: Bearer <seu-token-jwt>
```

## 📝 Exemplos de Requisições

### Registro
```bash
POST /api/usuarios/register
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "nome": "Usuário Teste"
}
```

### Login
```bash
POST /api/usuarios/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### Criar Chamado
```bash
POST /api/chamados
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Problema com login",
  "descricao": "Não consigo fazer login na aplicação",
  "prioridade": "alta"
}
```

### Criar Item (Admin)
```bash
POST /api/itens
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "nome": "Notebook",
  "descricao": "Dell Inspiron 15",
  "quantidade": 5
}
```

### Emprestar Item
```bash
POST /api/itens/emprestar
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "uuid-do-item",
  "quantidade": 1
}
```

## 🗄️ Estrutura de Banco de Dados

### Tabelas
- `usuarios` - Usuários do sistema
- `chamados` - Chamados de suporte
- `respostas_chamados` - Respostas aos chamados
- `itens` - Itens disponíveis para empréstimo
- `emprestimos` - Registro de empréstimos

## 🛠️ Scripts Disponíveis

```bash
npm run dev        # Iniciar em modo desenvolvimento
npm run build      # Compilar TypeScript
npm start          # Iniciar em produção
npm run migrate    # Executar migrations
```

## 📦 Dependências Principais

- **express** - Framework web
- **pg** - Driver PostgreSQL
- **jsonwebtoken** - Autenticação JWT
- **bcrypt** - Hash de senhas
- **uuid** - Geração de IDs
- **cors** - CORS middleware
- **dotenv** - Variáveis de ambiente

## 🌍 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=gestao_user
DB_PASSWORD=gestao_password
DB_NAME=gestao_db
NODE_ENV=development
JWT_SECRET=seu_secret_jwt_super_seguro_aqui
JWT_EXPIRES_IN=7d
```

## 📚 Tipos de Usuários

| Tipo | Permissões |
|------|-----------|
| **Usuario** | Criar chamados, visualizar seus chamados e emprestar itens |
| **Analista** | Visualizar todos os chamados, responder chamados, visualizar empréstimos |
| **Admin** | Todas as permissões + criar/editar usuários e itens |

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verificar se PostgreSQL está rodando
- Validar credenciais em `.env`
- Verificar porta 5432

### Erro ao executar migrations
```bash
npm run migrate
```

### Portas em uso
- Alterar `PORT` em `.env`
- Alterar porta do PostgreSQL em `docker-compose.yml`

## 📄 Licença

MIT

## 👨‍💻 Autor

Sistema desenvolvido para gestão de suporte

---

**Pronto para usar! Boa sorte! 🚀**
