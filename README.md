# ERP Datwork

ERP em desenvolvimento, atualmente local, sendo preparado para uma arquitetura SaaS modular e multiempresa. O repositório possui uma SPA React/Vite e uma API Express/Prisma sobre SQLite legado de desenvolvimento.

> A visão de produto é ampla, mas apenas módulos e evidências listados na documentação devem ser tratados como implementados.

## Estado atual

- **Parcial**: agenda, produtos, insumos, receitas, despesas e precificação.
- **Parcial/simulado**: login e proteção de rotas; autenticação produtiva ainda não existe.
- **Legado local**: SQLite e campos financeiros `Float`.
- **Proposto**: SaaS multiempresa, PostgreSQL/Decimal, RBAC/RLS, outbox/workers, PDV, estoque, compras, fiscal, CRM e demais domínios.

## Estrutura

```text
frontend/   React + TypeScript + Vite
backend/    Express + TypeScript + Prisma
docs/       arquitetura, produto, decisões e roadmap
REGRAS.md   diretrizes obrigatórias
AGENTS.md   contrato global dos agentes
```

## Comece aqui

1. Leia [`REGRAS.md`](./REGRAS.md) e [`AGENTS.md`](./AGENTS.md).
2. Consulte o [índice documental](./docs/README.md) e a [arquitetura](./docs/architecture/README.md).
3. Use o `AGENTS.md` da região alterada.
4. Trabalhe em branch e execute os gates do frontend/backend.

## Execução local

Instale as dependências uma vez em cada aplicação:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Depois, na raiz, inicie frontend e backend juntos:

```bash
npm run dev
```

O launcher publica apenas em loopback: frontend em `http://127.0.0.1:5173` e backend em `http://127.0.0.1:3333`. Ele encerra os dois processos ao receber `Ctrl+C` e habilita o bypass de autenticação somente para esse ambiente local. O backend falha imediatamente se o bypass for combinado com produção ou host não local.

Os gates agregados também ficam na raiz: `npm run check`, `npm test` e `npm run build`. O projeto não usa npm workspaces e preserva os locks independentes de frontend e backend.

Variáveis locais ficam em arquivos ignorados pelo Git. Nunca versione credenciais, bancos, uploads ou dados pessoais. Para validar as políticas antes de uma tarefa, execute `npm run policy:preflight -- --agent <AGENTE> --scope <caminho>` e leia integralmente as fontes listadas.

## Referências de planejamento

- [Roadmap](./docs/roadmap.md)
- [Fit-gap Carro Chefe](./docs/product/carro-chefe-fit-gap.md)
- [Decisões e riscos SaaS](./docs/architecture/rollout-decisions-and-risks.md)
- [ADRs](./docs/architecture/decisions/README.md)
