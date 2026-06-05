# Deploy no Render

Este projeto esta pronto para deploy no Render usando Blueprint (`render.yaml`).

## 1. Envie o projeto para o GitHub

O Render precisa acessar um repositorio Git.

## 2. Crie o Blueprint no Render

1. Acesse o Render Dashboard.
2. Clique em `New` > `Blueprint`.
3. Conecte o repositorio deste projeto.
4. Confirme o arquivo `render.yaml`.
5. Aplique o Blueprint.

O Blueprint cria:

- `gestao-suporte`: Web Service Node.
- `gestao-suporte-db`: banco Render Postgres.
- `DATABASE_URL`: connection string do banco injetada automaticamente.
- `JWT_SECRET`: segredo gerado automaticamente pela Render.

## 3. Acesse a aplicacao

Quando o deploy terminar, abra a URL `https://<seu-servico>.onrender.com`.

Rotas uteis:

- `/` - frontend.
- `/health` - health check.
- `/api/usuarios/register` - cadastro.
- `/api/usuarios/login` - login.

## 4. Popular usuarios de teste

O sistema cria automaticamente um admin inicial no startup:

- `admin@exemplo.com` / `admin123`

Troque essa senha depois do primeiro acesso. Voce tambem pode mudar os valores no Render antes do deploy usando:

- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_ADMIN_NAME`

Opcionalmente, para criar tambem analista e usuario de teste, abra o Shell do Web Service no Render e rode:

```bash
npm run seed
```

Credenciais adicionais criadas pelo seed:

- `admin@exemplo.com` / `admin123`
- `analista@exemplo.com` / `analista123`
- `usuario@exemplo.com` / `usuario123`

## Observacoes

- As migrations rodam automaticamente ao iniciar o servidor.
- O plano `free` e bom para teste e portfolio, mas nao e ideal para producao.
- Se sua workspace nao tiver plano free de Postgres disponivel, altere `plan` em `render.yaml` para um plano pago aceito pela sua conta.
