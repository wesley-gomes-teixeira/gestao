# Guia Rápido de Uso

## 🚀 Start Rápido com Docker

### 1. Clone ou entre no diretório do projeto
```bash
cd gestao
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

### 3. Inicie os containers
```bash
docker-compose up -d
```

### 4. Verifique se está tudo rodando
```bash
docker-compose logs -f app
```

A aplicação estará disponível em: **http://localhost:3000**

---

## 🧪 Testar a API

### Health Check
```bash
curl http://localhost:3000/health
```

### 1. Registrar um usuário
```bash
curl -X POST http://localhost:3000/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@exemplo.com",
    "password": "sua_senha",
    "nome": "Seu Nome"
  }'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@exemplo.com",
    "password": "sua_senha"
  }'
```

Copie o token retornado!

### 3. Usar o token em outras requisições
```bash
curl -X GET http://localhost:3000/api/usuarios/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📚 Documentação Completa

Veja [EXEMPLOS_API.md](./EXEMPLOS_API.md) para exemplos completos de todas as requisições.

---

## 🛑 Parar os containers

```bash
docker-compose down
```

Para parar e remover volumes (limpar banco de dados):
```bash
docker-compose down -v
```

---

## 🔧 Desenvolvimento Local (sem Docker)

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+ rodando localmente

### Instalação

```bash
# Instalar dependências
npm install

# Copiar e configurar .env
cp .env.example .env

# Atualizar .env com host local
# DB_HOST=localhost

# Executar migrations
npm run migrate

# Iniciar em desenvolvimento
npm run dev
```

---

## 🐛 Troubleshooting

### Erro: "Não consegue conectar ao PostgreSQL"
```bash
# Verificar se postgres está rodando
docker-compose ps

# Se não estiver, reiniciar
docker-compose restart postgres
```

### Erro: "Porta 3000 já está em uso"
Altere `PORT` em `.env`:
```env
PORT=3001
```

### Ver logs da aplicação
```bash
docker-compose logs -f app
```

### Ver logs do PostgreSQL
```bash
docker-compose logs -f postgres
```

### Resetar banco de dados
```bash
docker-compose down -v
docker-compose up -d
```

---

## 👥 Usuários de Teste (após Docker)

Se quiser popular com dados de teste, execute:

```bash
docker-compose exec app npm run seed
```

**Credenciais:**
- Admin: admin@exemplo.com / admin123
- Analista: analista@exemplo.com / analista123
- Usuário: usuario@exemplo.com / usuario123

---

## 📊 Estrutura de Permissões

| Ação | Usuario | Analista | Admin |
|------|---------|----------|-------|
| Criar Chamado | ✅ | ✅ | ✅ |
| Ver seus chamados | ✅ | ✅ | ✅ |
| Ver todos chamados | ❌ | ✅ | ✅ |
| Responder chamados | ❌ | ✅ | ✅ |
| Emprestar itens | ✅ | ✅ | ✅ |
| Ver empréstimos | ❌ | ✅ | ✅ |
| Criar/Editar usuários | ❌ | ❌ | ✅ |
| Gerenciar itens | ❌ | ❌ | ✅ |

---

## 📝 Scripts Disponíveis

```bash
npm run dev        # Desenvolvimento com ts-node
npm run build      # Compilar TypeScript para dist/
npm start          # Executar versão compilada
npm run migrate    # Executar migrations do BD
```

---

## 🆘 Suporte

Para mais detalhes, veja:
- [README.md](./README.md) - Documentação completa
- [EXEMPLOS_API.md](./EXEMPLOS_API.md) - Exemplos de requisições
