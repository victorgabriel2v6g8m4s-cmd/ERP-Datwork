# ADR 0005 — Outbox e inbox transacionais

Status: **proposta**.

## Contexto

Persistir fato e chamar provider diretamente cria dual write: banco pode confirmar e a mensagem falhar, ou vice-versa. Webhooks podem repetir e chegar fora de ordem.

## Decisão

Gravar evento outbox na transação do fato; dispatcher entrega ao adapter com retry limitado/DLQ. Webhook validado entra em inbox durável e é processado idempotentemente.

## Consequências

Há consistência eventual e necessidade de workers/observabilidade/reconciliação. Consumidores deduplicam e lidam com ordenação limitada.

## Alternativas

HTTP dentro da transação ou “best effort” depois do commit são rejeitados em operações críticas. Broker transacional pode ser avaliado em escala futura.
