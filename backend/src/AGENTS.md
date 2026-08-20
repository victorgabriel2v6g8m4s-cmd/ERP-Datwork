# AGENTS — Código-fonte do backend

## Região

Implementação Express. Leia `../AGENTS.md`, `../../REGRAS.md` e os documentos de arquitetura.

## Owners atuais e direção alvo

- `routes`: composição de endpoints/middlewares.
- `controllers`: adaptação HTTP fina.
- `contracts` e validators: schema/allowlist de entrada.
- `services`: casos de uso/regras; dividir handler grande por operação.
- `presenters`: DTO público mínimo.
- `middlewares`: concerns HTTP transversais.
- `config`: ambiente validado e limites nomeados.
- `logger`: logging/redaction; `math`: fórmulas determinísticas/versionadas.
- Persistência hoje aparece via Prisma nos services; o alvo exige repositories por domínio.

## Limites

- Nunca importar controller/Express em service/domínio.
- Nunca aceitar `organizationId`, permissões, valores calculados ou snapshots do cliente como verdade.
- Nunca usar `Float`/`number` em nova regra financeira canônica.
- Nunca registrar request body, credencial, documento ou payload de webhook completo.

## Segurança

Ordem: schema → sanitização → auth → TenantContext → policy → use case. Recurso fora do tenant não deve ter existência confirmada. Upload e webhook exigem controles especializados.

## Gate

- [ ] controller fino, service de responsabilidade única e presenter explícito
- [ ] erro semântico/público estável; timeout/idempotência/transação definidos
- [ ] query paginada/indexável; nenhum N+1 evidente
- [ ] `CustomLogger` contextual e sem PII
- [ ] testes unitários/integrados/regressão proporcionais ao risco
