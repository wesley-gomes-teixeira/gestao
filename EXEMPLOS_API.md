## Exemplos de Requisições da API

### 1. Autenticação e Usuários

#### Registrar novo usuário
```bash
curl -X POST http://localhost:3000/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123",
    "nome": "João Silva"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Obter usuário autenticado
```bash
curl -X GET http://localhost:3000/api/usuarios/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Listar todos os usuários (Admin)
```bash
curl -X GET http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

#### Criar usuário (Admin)
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{
    "email": "analista@exemplo.com",
    "password": "senha123",
    "nome": "Maria Santos",
    "role": "analista"
  }'
```

#### Atualizar usuário (Admin)
```bash
curl -X PUT http://localhost:3000/api/usuarios/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{
    "nome": "João Silva Atualizado",
    "ativo": true
  }'
```

#### Deletar usuário (Admin)
```bash
curl -X DELETE http://localhost:3000/api/usuarios/USER_ID \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

---

### 2. Chamados

#### Criar chamado (Usuário)
```bash
curl -X POST http://localhost:3000/api/chamados \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_USUARIO" \
  -d '{
    "titulo": "Problema com login",
    "descricao": "Não consigo fazer login na aplicação, recebo erro 500",
    "prioridade": "alta"
  }'
```

**Resposta:**
```json
{
  "id": "12345-uuid",
  "usuario_id": "user-uuid",
  "titulo": "Problema com login",
  "descricao": "Não consigo fazer login na aplicação, recebo erro 500",
  "status": "aberto",
  "prioridade": "alta",
  "criado_em": "2024-01-15T10:30:00Z",
  "atualizado_em": "2024-01-15T10:30:00Z"
}
```

#### Listar meus chamados
```bash
curl -X GET http://localhost:3000/api/chamados/meus \
  -H "Authorization: Bearer TOKEN_USUARIO"
```

#### Obter chamado por ID (com respostas)
```bash
curl -X GET http://localhost:3000/api/chamados/CHAMADO_ID \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "id": "12345-uuid",
  "usuario_id": "user-uuid",
  "titulo": "Problema com login",
  "descricao": "Não consigo fazer login na aplicação",
  "status": "aberto",
  "prioridade": "alta",
  "criado_em": "2024-01-15T10:30:00Z",
  "atualizado_em": "2024-01-15T10:30:00Z",
  "respostas": [
    {
      "id": "resposta-uuid",
      "chamado_id": "12345-uuid",
      "usuario_id": "analista-uuid",
      "resposta": "Vamos verificar suas credenciais...",
      "criado_em": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### Listar todos os chamados (Admin/Analista)
```bash
curl -X GET http://localhost:3000/api/chamados/admin/todos \
  -H "Authorization: Bearer TOKEN_ADMIN_OU_ANALISTA"
```

#### Atualizar chamado (Admin/Analista)
```bash
curl -X PUT http://localhost:3000/api/chamados/CHAMADO_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN_OU_ANALISTA" \
  -d '{
    "status": "em_andamento",
    "prioridade": "media"
  }'
```

#### Adicionar resposta ao chamado (Admin/Analista)
```bash
curl -X POST http://localhost:3000/api/chamados/CHAMADO_ID/respostas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN_OU_ANALISTA" \
  -d '{
    "resposta": "Problema identificado. Estamos trabalhando na solução."
  }'
```

#### Deletar chamado (Admin)
```bash
curl -X DELETE http://localhost:3000/api/chamados/CHAMADO_ID \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

---

### 3. Itens e Empréstimos

#### Listar itens
```bash
curl -X GET http://localhost:3000/api/itens \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
[
  {
    "id": "item-uuid",
    "nome": "Notebook",
    "descricao": "Dell Inspiron 15",
    "quantidade": 5,
    "quantidade_disponivel": 3,
    "criado_em": "2024-01-15T10:00:00Z",
    "atualizado_em": "2024-01-15T10:00:00Z"
  }
]
```

#### Obter item por ID
```bash
curl -X GET http://localhost:3000/api/itens/ITEM_ID \
  -H "Authorization: Bearer TOKEN"
```

#### Criar item (Admin)
```bash
curl -X POST http://localhost:3000/api/itens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{
    "nome": "Notebook",
    "descricao": "Dell Inspiron 15 com Intel i7",
    "quantidade": 5
  }'
```

#### Atualizar item (Admin)
```bash
curl -X PUT http://localhost:3000/api/itens/ITEM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{
    "quantidade": 10,
    "quantidade_disponivel": 8
  }'
```

#### Deletar item (Admin)
```bash
curl -X DELETE http://localhost:3000/api/itens/ITEM_ID \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

#### Emprestar item
```bash
curl -X POST http://localhost:3000/api/itens/emprestar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_USUARIO" \
  -d '{
    "itemId": "ITEM_ID",
    "quantidade": 1
  }'
```

**Resposta:**
```json
{
  "id": "emprestimo-uuid",
  "itemId": "ITEM_ID",
  "usuarioId": "USER_ID",
  "quantidade": 1
}
```

#### Devolver item
```bash
curl -X POST http://localhost:3000/api/itens/devolver \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_USUARIO" \
  -d '{
    "emprestimoId": "EMPRESTIMO_ID",
    "itemId": "ITEM_ID"
  }'
```

#### Listar empréstimos (Admin/Analista)
```bash
curl -X GET http://localhost:3000/api/itens/listar-emprestimos \
  -H "Authorization: Bearer TOKEN_ADMIN_OU_ANALISTA"
```

Filtrar por usuário:
```bash
curl -X GET "http://localhost:3000/api/itens/listar-emprestimos?usuarioId=USER_ID" \
  -H "Authorization: Bearer TOKEN_ADMIN_OU_ANALISTA"
```

---

## 📌 Dicas

1. **Sempre inclua o Bearer token** nos headers quando a autenticação for obrigatória
2. **Use `Content-Type: application/json`** para requisições com corpo
3. **Substitua os placeholders** (USUARIO_ID, TOKEN, etc) pelos valores reais
4. **Códigos HTTP importantes:**
   - 200: Sucesso
   - 201: Criado com sucesso
   - 400: Requisição inválida
   - 401: Não autenticado
   - 403: Sem permissão
   - 404: Não encontrado
   - 500: Erro interno do servidor
