# AGENTS — Prisma e banco

## Região e objetivo

Schema, migrations e integridade. SQLite é legado local; PostgreSQL com Decimal, tenancy e RLS é o alvo SaaS proposto.

## Arquitetura alvo

```text
schema.prisma → migration PostgreSQL revisada → CI banco vazio
application repository → runtime role restrita → PostgreSQL/RLS
deploy role separada → migrate deploy
```

## Limites

- Database Agent possui owner técnico; Security revisa RLS/roles; Development executa alteração autorizada.
- Não alterar schema/migration por efeito colateral de tarefa de UI.
- Não editar migration aplicada. Nova correção usa migration nova e compatível.
- Não copiar cadeia SQLite como se fosse PostgreSQL nem mudar apenas o provider.
- Não apagar coluna/tabela/dado sem autorização, backup restaurável e estratégia de migração.

## Regras

- Tabela tenant-owned: `organizationId` obrigatório, FK composta quando aplicável, índice e política RLS/teste.
- Dinheiro/quantidade/percentual: Decimal com escala e arredondamento documentados.
- Invariantes usam FK, unique, not null, check e delete explícito.
- Novo filtro/listagem revisa índice e limite; transação é curta.
- Role runtime não é owner/superuser/BYPASSRLS; migration é etapa separada.

## Gate

- [ ] baseline/migrations sobem do zero em banco temporário
- [ ] schema diff e `prisma generate` válidos
- [ ] dados existentes, rollback/forward e locking analisados
- [ ] constraints, índices e cross-tenant/RLS testados
- [ ] Decimal/reconciliação e documentação atualizados
