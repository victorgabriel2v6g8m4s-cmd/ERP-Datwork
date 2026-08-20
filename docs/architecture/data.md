# Arquitetura de dados

Status: **SQLite/Float legado implementado; PostgreSQL/Decimal/tenancy propostos**.

## Fontes de verdade

| Dado | Fonte alvo |
| --- | --- |
| identidade, organização, RBAC e sessão | PostgreSQL/control plane |
| catálogo, ficha técnica, estoque, preço, pedido, financeiro | módulo ERP proprietário |
| liquidação de pagamento/documento fiscal | provider externo + reconciliação no ERP |
| arquivo binário | object storage privado; metadado no PostgreSQL |
| evento para integração | outbox PostgreSQL; fila é transporte |
| cache | derivado, nunca fonte oficial |

## Modelo transversal alvo

- `Organization`, `User`, `Membership`, `Role`, `Permission`, `Session` e audit/outbox.
- Toda linha de negócio inclui `organizationId` obrigatório, timestamps e versão/concurrency control quando editável.
- FK tenant-owned evita vínculo cruzado; RLS usa `organization_id` e role runtime sem bypass.
- Exclusão é explícita por domínio: restrict, cascade, archive ou retenção/purge. Soft delete não é default universal.

## Decimal e unidades

- Monetário informado: proposta `Decimal(19,4)`; custo calculado/quantidade: `Decimal(19,6)`; percentual: `Decimal(9,6)`.
- HTTP representa decimal por string. Regra de arredondamento é versionada por contexto; BRL apresenta/cobra duas casas na fronteira apropriada.
- Quantidade sempre possui unidade; conversão e rendimento são regras explícitas.
- Fórmula guarda versão, inputs canônicos e resultado; histórico não depende da fórmula atual.

## Query e escala

- Coleção paginada com máximo server-side; cursor/keyset nos fluxos de alto volume.
- Índices derivam de filtros reais, tenant, ordenação e seletividade.
- Relatório grande é assíncrono/streaming; importação usa parse → validate → preview/errors → persist em chunks.
- Query crítica é medida por plano e tempo; proibir N+1 e acesso sem contexto de tenant.

## Migração e recuperação

O processo completo está em [Migração PostgreSQL](./postgresql-migration.md). A fonte SQLite oficial, reparo de FKs órfãs, escalas Decimal, owner bootstrap e tolerâncias continuam bloqueados por decisão humana. Backup/PITR/restore estão em [Operação na VPS](./vps-operations.md).
