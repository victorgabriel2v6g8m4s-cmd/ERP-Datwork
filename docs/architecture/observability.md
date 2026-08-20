# Observabilidade e auditoria

Status: **parcial**: `CustomLogger` e logs existem; telemetria estruturada, métricas, traces, auditoria e alertas são propostos.

## Sinais

| Sinal | Uso | Cuidados |
| --- | --- | --- |
| logs técnicos | diagnóstico de execução/falha | JSON, requestId, redaction, retenção operacional |
| métricas | saúde, volume, latência, erro e capacidade | rota normalizada; sem labels de tenant/usuário |
| traces | fluxo API→DB→worker→provider | sampling e propagação de correlation/causation |
| audit log | ação crítica e mudança de dados/permissão | append-only, acesso restrito e retenção própria |

## Eventos mínimos por operação crítica

Início quando útil, resultado, duração, código de falha, request/correlation ID, release/ambiente e entidade opaca mínima. Nunca senha, cookie, token, documento, cartão, conteúdo de upload ou body completo.

## Indicadores iniciais

- API: taxa/latência/5xx por rota, payload e requests em voo.
- Banco: pool, timeout, query lenta, lock/deadlock, uso de conexão e storage.
- Assíncrono: backlog, idade, tentativa, DLQ e tempo de processamento.
- Segurança: login falho, rate limit, CSRF, negação RBAC/cross-tenant e webhook inválido.
- Negócio: pedido/pagamento/estoque com nomes de evento aprovados; sem PII.
- Recuperação: idade do backup/WAL e resultado/duração de restore drill.

## Alertas e SLO

Alertar sobre sintoma acionável: indisponibilidade/readiness, erro/latência sustentados, banco, fila parada, DLQ, disco, backup/WAL e certificado. Thresholds, SLO, RPO e RTO permanecem **bloqueados por aprovação e baseline medida**.
