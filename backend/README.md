# Backend do ERP Datwork

Status: **API parcial em desenvolvimento local**.

Express + TypeScript + Prisma. Antes de alterar, leia [`REGRAS.md`](../REGRAS.md), [`AGENTS.md`](../AGENTS.md), [`backend/AGENTS.md`](./AGENTS.md) e os `AGENTS.md` de `src`, `prisma` ou `tests` conforme a região.

## Fluxo atual e alvo

```text
route → middleware → controller → validator → service → Prisma
                                          ↓
                                      presenter

Alvo incremental:
service/use case → repository → Prisma/PostgreSQL
                 → outbox/adapter
```

Detalhes: [arquitetura de backend](../docs/architecture/backend.md), [dados](../docs/architecture/data.md) e [tenancy/RBAC](../docs/architecture/tenancy-and-rbac.md).

## Execução local

Pela raiz do repositório, a opção recomendada inicia frontend e backend coordenados:

```bash
npm run dev
```

Para iniciar apenas a API:

```bash
npm install
npm run dev
```

O servidor usa `HOST=127.0.0.1` por padrão. `ALLOW_INSECURE_AUTH_BYPASS=true` é aceito exclusivamente fora de produção e com `HOST` em loopback (`127.0.0.1`, `::1` ou `localhost`); qualquer combinação insegura interrompe o start. Para exposição em rede ou produção, mantenha o bypass desabilitado e implemente autenticação real antes de servir rotas protegidas.

O ambiente local usa configuração própria e SQLite legado. Não o trate como banco de produção e não versione `.env`, `dev.db` ou uploads.

## Gates

```bash
npm run build
npm test
```

Quando Prisma for afetado, gere o client e valide migrations/schema em banco temporário. Mudança de schema PostgreSQL/Decimal/tenancy segue os gates documentados e não pode ser improvisada mudando somente o provider.
