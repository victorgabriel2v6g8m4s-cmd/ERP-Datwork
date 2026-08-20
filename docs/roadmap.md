# Roadmap do ERP Datwork

Status: **proposto**. Sequência orientada por dependências; não representa datas ou orçamento aprovados.

| Fase | Resultado | Responsável principal | Dependências | Aceite | Impacto | Urgência |
| --- | --- | --- | --- | --- | --- | --- |
| R0 — governança | regras, AGENTS, inventário, ADRs e backlog com status verdadeiro | Gestão + Arquitetura | nenhuma | docs coerentes e CI base conhecido | 5 | 5 |
| R1 — qualidade da base | modularização incremental, boundaries, i18n/theme e gates | Development | R0 | lint/typecheck/test/build verdes e hotspots priorizados | 5 | 5 |
| R2 — fundação SaaS | Organization/User/Membership, sessão, RBAC, tenant context e audit | Security + Development | decisões A1–A5 | testes cross-tenant/auth verdes | 5 | 5 |
| R3 — PostgreSQL/Decimal | baseline, constraints/RLS, importador e reconciliação | Database + Finanças | R2, A6–A8 | dois ensaios sem divergência inexplicada | 5 | 5 |
| R4 — operação confiável | staging, TLS, secrets, object storage, telemetria e restore | Operações/DevOps | A9–A13 | readiness, smoke e restore drill | 5 | 4 |
| R5 — núcleo Carro Chefe | catálogo/modificadores, ficha técnica, estoque/compras e preço | Produto + Operações + Development | R2–R4 | cenário ponta a ponta e reconciliação | 5 | 5 |
| R6 — pedidos e produção | PDV/totem/site, pedidos, fila/KDS e entrega | Produto + Development | R5 | fluxo idempotente mobile/touch e contingência | 5 | 5 |
| R7 — pagamentos/fiscal | provider, conciliação, documento fiscal e contabilidade | Finanças + Integration | R6, contratos externos | homologação profissional e financeira | 5 | 4 |
| R8 — CRM/canais/BI | eventos, consentimento, n8n/WhatsApp, dashboards e recompra | Marketing/Dados + Integration | R6–R7 | métricas reconciliadas e LGPD | 4 | 3 |
| R9 — expansão ERP | MES, qualidade, ativos, pessoas, logística, IA e marketplace | Gestão/Produto | uso e demanda medidos | PRD/gates próprios por domínio | 3 | 1 |

## Próxima sequência recomendada

1. Fechar decisões A1–A14 do [rollout SaaS](./architecture/rollout-decisions-and-risks.md).
2. Transformar R1 em tarefas pequenas por hotspot medido.
3. Implementar R2 e R3 em mudanças separadas, antes de segundo tenant ou dado financeiro produtivo.
4. Executar R4 em staging e provar restauração.
5. Construir o vertical slice do Carro Chefe: produto → receita → estoque → pedido → pagamento simulado → produção → financeiro.

Cada fase deve registrar dependências, critérios, evidências, risco, owner e decisão humana para custo/publicação/contrato.
