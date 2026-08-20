# Decisões arquiteturais (ADRs)

Status: **registro de decisões propostas**. Uma ADR só vira **aceita** após aprovação explícita e, quando aplicável, implementação verificada.

| ADR | Decisão | Status |
| --- | --- | --- |
| [0001](./0001-modular-monolith.md) | monólito modular antes de microserviços | Proposta |
| [0002](./0002-shared-schema-tenancy.md) | shared schema, TenantContext e RLS | Proposta/bloqueada por A1 |
| [0003](./0003-server-side-sessions.md) | sessão opaca server-side | Proposta/bloqueada por A3–A5 |
| [0004](./0004-decimal-money.md) | Decimal e strings HTTP | Proposta/bloqueada por A6 |
| [0005](./0005-transactional-outbox.md) | outbox/inbox para integração confiável | Proposta |

Nova decisão não edita silenciosamente a anterior: crie ADR e marque a substituída.
