# Frontend do ERP Datwork

Status: **aplicação parcial em desenvolvimento local**.

SPA em React, TypeScript e Vite. Antes de alterar, leia [`REGRAS.md`](../REGRAS.md), [`AGENTS.md`](../AGENTS.md) e [`frontend/AGENTS.md`](./AGENTS.md).

## Módulos observados

Agenda, produtos, insumos, receitas, despesas e precificação. Login ainda não representa autenticação produtiva; dashboard, DRE e estoque contêm placeholders.

## Fluxo

```text
Page → components/hooks → feature service → api/client → backend
            ↓
TEXTS + APP_CONFIG + ERP_THEME + UI_KEYS
```

Detalhes e direção alvo: [Arquitetura de frontend](../docs/architecture/frontend.md) e [UX responsiva](../docs/architecture/ux-responsive.md).

## Desenvolvimento

```bash
npm install
npm run dev
```

O backend local deve estar disponível na URL configurada por `VITE_API_BASE_URL`; na ausência, o desenvolvimento usa o default do projeto. Não versione `.env` ou credenciais.

## Gates

```bash
npm test
npm run typecheck
npm run lint
npm run build:bundle
```

Para mudança visual, valide também mobile e desktop, teclado, foco, contraste e estados de loading/vazio/erro/sucesso.
