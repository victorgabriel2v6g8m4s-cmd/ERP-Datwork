# AGENTS — Backend

## Região e objetivo

API Express/TypeScript, regras de aplicação, segurança, integração e persistência Prisma. É a autoridade de domínio e autorização.

## Arquitetura local

```text
route → middleware → controller → validator/policy → service/use case
                                               → repository → Prisma
                                               → adapter/outbox
                               presenter → HTTP DTO
```

O código atual ainda não possui todas essas fronteiras; novas mudanças devem aproximar incrementalmente o alvo, sem reescrita indiscriminada.

## Dependências

- Permitidas: camada abaixo via contrato público e adapters de infraestrutura.
- Proibidas: controller→Prisma/SQL, domínio→Express, payload→ORM direto, provider externo dentro do domínio.

## Papéis e limites

- Development implementa; Architecture define owner/contrato; API controla DTO/status/versionamento.
- Security/Sanitization pode vetar authz/input/upload inseguro.
- Database revisa Prisma/migration/transaction/index; Integration revisa provider/webhook.
- Testing cobre falha e isolamento; Observability exige diagnóstico sem PII.

## Regras

- Input `unknown` validado por allowlist; DTO de resposta explícito.
- Toda operação SaaS recebe `TenantContext`, verifica permissão/resource e falha fechada.
- Side effect externo usa adapter, timeout e idempotência; evento confiável usa outbox.
- Transação curta e determinística; log com correlation ID e redaction.

## Gate

- [ ] `npm run build`
- [ ] `npm test`
- [ ] `prisma generate` e migrations do zero quando aplicável
- [ ] authz/cross-tenant, inválido, duplicação, concorrência e falha externa testados conforme risco
- [ ] contratos, observabilidade e documentação atualizados
