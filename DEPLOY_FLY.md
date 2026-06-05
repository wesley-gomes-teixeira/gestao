# Deploy no Fly.io

Este projeto esta pronto para rodar no Fly.io com Dockerfile e `fly.toml`.

## Problema dos logs

Os logs indicavam dois pontos:

- O app tentava conectar no PostgreSQL local (`127.0.0.1:5432` / `::1:5432`), mas no Fly o banco precisa vir por `DATABASE_URL`.
- O Fly tentava acessar `0.0.0.0:8080`, entao a aplicacao tambem precisa escutar na porta `8080`.

O projeto agora configura `PORT=8080`, `HOST=0.0.0.0` e aceita `DATABASE_URL`.

## 1. Defina o segredo JWT

```bash
fly secrets set JWT_SECRET="troque-por-um-segredo-forte" -a gestao-ubsb9a
```

## 2. Crie ou anexe o Postgres

Se ainda nao tiver um Postgres no Fly:

```bash
fly postgres create --name gestao-ubsb9a-db --region gru
fly postgres attach gestao-ubsb9a-db --app gestao-ubsb9a
```

O comando `attach` cria a variavel secreta `DATABASE_URL` automaticamente no app.

Se estiver usando Fly Managed Postgres, use:

```bash
fly mpg attach <cluster-id> -a gestao-ubsb9a
```

## 3. Confira os secrets

```bash
fly secrets list -a gestao-ubsb9a
```

Voce deve ver pelo menos:

- `DATABASE_URL`
- `JWT_SECRET`

## 4. Faça o deploy

```bash
fly deploy -a gestao-ubsb9a
```

## 5. Verifique

```bash
fly status -a gestao-ubsb9a
fly logs -a gestao-ubsb9a
```

Quando estiver OK, abra:

```bash
fly open -a gestao-ubsb9a
```

## 6. Popular usuarios de teste

Opcional:

```bash
fly ssh console -a gestao-ubsb9a
npm run seed
```

Credenciais criadas:

- `admin@exemplo.com` / `admin123`
- `analista@exemplo.com` / `analista123`
- `usuario@exemplo.com` / `usuario123`
