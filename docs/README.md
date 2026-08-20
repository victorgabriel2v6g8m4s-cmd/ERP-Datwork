# Documentação do ERP Datwork

Status do índice: **implementado como documentação**. As capacidades descritas mantêm seu status próprio.

## Leitura rápida

1. [`REGRAS.md`](../REGRAS.md): política obrigatória de engenharia.
2. [`AGENTS.md`](../AGENTS.md): operação dos agentes e gates.
3. [Arquitetura](./architecture/README.md): estado observado, alvo e decisões.
4. [Roadmap](./roadmap.md): sequência de entregas e gates.
5. [Fit-gap Carro Chefe](./product/carro-chefe-fit-gap.md): requisito do primeiro cliente de referência.

## Arquitetura

- [Contexto do sistema](./architecture/system-context.md)
- [Mapa de domínios](./architecture/domain-map.md)
- [Frontend](./architecture/frontend.md)
- [Estúdio Visual](./architecture/visual-editor.md)
- [Backend](./architecture/backend.md)
- [Dados e precisão](./architecture/data.md)
- [Tenancy e RBAC](./architecture/tenancy-and-rbac.md)
- [Autenticação e sessões](./architecture/authentication-and-sessions.md)
- [Contratos e eventos](./architecture/contracts-and-events.md)
- [Integrações, webhooks e outbox](./architecture/integrations-and-webhooks.md)
- [Observabilidade](./architecture/observability.md)
- [Migração PostgreSQL](./architecture/postgresql-migration.md)
- [Operação em VPS, deploy e backup](./architecture/vps-operations.md)
- [Inicializador Windows local](./operations/windows-launcher.md)
- [UX responsiva](./architecture/ux-responsive.md)
- [ADRs](./architecture/decisions/README.md)
- [Fases SaaS, decisões e riscos](./architecture/rollout-decisions-and-risks.md)

## Convenção de status

| Marca | Significado |
| --- | --- |
| **Implementado** | código e evidência verificável existem |
| **Parcial** | há uma parte funcional; gate de produção não foi atendido |
| **Proposto** | alvo ainda não implementado/aprovado |
| **Bloqueado** | depende de decisão, dado, orçamento ou autoridade externa |
| **Legado** | existe para desenvolvimento, compatibilidade ou migração |
