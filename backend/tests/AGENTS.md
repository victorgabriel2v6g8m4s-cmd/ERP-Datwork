# AGENTS — Testes de backend

## Região

Testes unitários, integração, contrato, segurança e persistência da API.

## Regras

- Banco de teste é descartável, isolado e criado por migrations/schema do projeto.
- Não reutilizar banco local nem fixture com dado real.
- Cobrir schema inválido/campo extra, autorização, IDOR/cross-tenant, duplicação, concorrência e falha externa conforme risco.
- Fórmula Decimal compara strings/valores exatos e versão de regra.
- Webhook cobre assinatura, replay, idempotência, retry e DLQ; upload cobre MIME/conteúdo/tamanho/traversal.
- Teste de contrato valida DTO/código estável e impede entidade Prisma vazando.

## Gate

- [ ] `npm run build` e `npm test` verdes
- [ ] migrations sobem do zero quando afetadas
- [ ] teste de regressão prova o defeito e é determinístico
- [ ] logs e respostas não expõem segredo/PII
