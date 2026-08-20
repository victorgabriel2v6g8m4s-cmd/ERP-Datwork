# AGENTS — Frontend

## Região e objetivo

React + TypeScript + Vite. Entrega a experiência ERP responsiva, acessível e consistente; não é fronteira de segurança nem fonte de regra financeira.

## Arquitetura local

```text
route/page → hook orquestrador → service → api/client
     │              │
     └→ components  └→ contracts/mappers
          ↓
  TEXTS + APP_CONFIG + ERP_THEME + UI_KEYS
```

## Dependências

- Permitidas: API pública de componentes/features, `TEXTS`, `APP_CONFIG`, `ERP_THEME`, `UI_KEYS` e services locais.
- Proibidas: Prisma/banco, segredo, regra canônica financeira, import direto de `api/client` por componente/hook visual e detalhe interno de outra feature.

## Papéis e limites

- Development implementa componentes finos, hooks e services.
- UI/UX revisa tarefa mobile/desktop, teclado, foco e estados.
- Security valida exposição, XSS, storage, autorização visual complementar e upload.
- API valida contracts/mappers; Performance mede bundle, render e waterfalls; Testing cobre comportamento.
- Nenhum papel de frontend altera schema ou reduz controle server-side.

## Regras obrigatórias

- Textos visíveis em i18n; valores variáveis em config; visual em tokens/temas.
- `data-ui-key` estável em superfície editável, sem sacrificar HTML semântico.
- Tabela larga tem alternativa mobile; ação assíncrona bloqueia duplicação e preserva input em falha.
- Página orquestra e usa lazy loading; regra/JSX/estado extenso é extraído por responsabilidade.

## Gate

- [ ] `npm test`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build:bundle`
- [ ] desktop/mobile, teclado, foco, contraste, loading, vazio, erro e sucesso verificados
- [ ] mapa/UX/docs atualizados quando a estrutura mudar
