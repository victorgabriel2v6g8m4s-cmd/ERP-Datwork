# ADR 0004 — Decimal ponta a ponta

Status: **proposta, bloqueada pela decisão A6**.

## Contexto

O schema SQLite atual usa `Float` em custo, preço, quantidade e margem. IEEE-754 não garante precisão financeira/reconciliação.

## Decisão

PostgreSQL/Prisma usa Decimal com escala por semântica; HTTP transmite strings; cálculo usa biblioteca Decimal; arredondamento, moeda e versão da fórmula são explícitos.

## Consequências

Contratos e UI precisam tratar string/Decimal, e migração precisa registrar delta. Gráficos podem converter cópias apenas para apresentação não canônica.

## Alternativas

Centavos inteiros não atendem quantidades/custos de alta precisão; Float é rejeitado para fato financeiro.
