# ADR 0002 — Tenancy em shared schema com RLS

Status: **proposta, bloqueada pela decisão A1**.

## Contexto

SaaS exige isolamento sem custo operacional de um banco por pequeno cliente. Filtro manual isolado é vulnerável a omissão.

## Decisão

`Organization` será tenant. Tabelas de negócio terão `organizationId`, chaves/índices compostos e PostgreSQL RLS `FORCE`; aplicação também filtra por TenantContext. Role runtime não terá bypass.

## Consequências

Menor custo operacional e analytics controlado, com disciplina obrigatória em query, cache, job, arquivo e teste. Clientes com requisito legal/escala podem ganhar estratégia dedicada futura via adapter/roteamento.

## Alternativas

Schema ou banco por tenant aumentam isolamento, mas também migrations/operação/custo; permanecem opção futura.
