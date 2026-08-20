# Contratos, comandos e eventos

Status: **proposto**; contratos HTTP atuais existem por módulo, mas ainda não seguem integralmente este padrão.

## HTTP

- Base alvo: `/api/v1`; JSON; data/hora ISO 8601 UTC; decimal como string; enum estável.
- Request dividido em params/query/body/headers com schema estrito e allowlist.
- Lista retorna `items` + paginação, nunca coleção ilimitada.
- Mutation crítica aceita `Idempotency-Key` e concurrency/version quando houver edição concorrente.
- Erro público: `{ code, message, details?, requestId }`; `details` contém somente validação segura.

Exemplo proposto:

```json
{
  "data": { "id": "...", "total": "12.3400", "version": 3 },
  "meta": { "requestId": "..." }
}
```

## Comandos e queries internos

- Comando expressa intenção (`ApprovePurchase`, `FinalizeOrder`); query não causa side effect.
- Ambos recebem `ActorContext` e DTO validado.
- Resultado não vaza entidade Prisma nem provider.

## Eventos

Formato mínimo alvo:

```json
{
  "eventId": "uuid",
  "type": "order.paid.v1",
  "occurredAt": "2026-08-20T00:00:00Z",
  "organizationId": "uuid",
  "aggregateId": "uuid",
  "aggregateVersion": 4,
  "correlationId": "uuid",
  "causationId": "uuid",
  "payload": {}
}
```

- Evento é fato no passado, versionado e mínimo; não carrega segredo/PII livre.
- Producer grava outbox atomicamente; dispatcher pode repetir; consumer deduplica por `eventId`.
- Mudança incompatível cria nova versão e período de compatibilidade.

## Eventos iniciais candidatos

`product.updated.v1`, `recipe.cost-recalculated.v1`, `inventory.movement-posted.v1`, `order.created.v1`, `payment.approved.v1`, `order.ready.v1`, `expense.posted.v1`, `member.permission-changed.v1`. São **propostas**, não catálogo implementado.
