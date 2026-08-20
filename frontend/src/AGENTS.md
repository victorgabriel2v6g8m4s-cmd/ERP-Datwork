# AGENTS — Código-fonte do frontend

## Região

Implementação da SPA. Leia também `../AGENTS.md` e `../../REGRAS.md`.

## Owners

- `pages/<Domain>` é owner da composição e comportamento específico do domínio.
- `components` contém UI realmente transversal; não é depósito.
- `api/client.ts` é a única fronteira HTTP de baixo nível.
- `config`, `i18n`, `theme` e `ui/keys` são fontes únicas de configuração, texto, visual e identidade editável.
- `types` contém contratos compartilhados; types locais permanecem na feature.

## Fluxo e limites

```text
Page → domain components → hooks → domain service → API client
                           ↘ pure utils/contracts
```

- Page não faz `axios/fetch`; componente não conhece endpoint.
- Hook orquestrador coordena hooks menores e não vira “god hook”.
- Mapper valida/normaliza resposta externa antes da UI.
- Não duplicar componente para mobile/desktop quando composição responsiva resolve.

## Segurança e UX

- Não persistir token/permissão sensível em storage; não renderizar HTML não confiável.
- Permissão visual melhora UX, mas backend continua autoridade.
- Modal gerencia foco; erro aponta próximo passo; destructive action é diferenciada.

## Gate

- [ ] nenhum texto visível, endpoint, magic number ou token visual espalhado
- [ ] nenhum `any`, `console.*`, request duplicado ou estado derivado duplicado
- [ ] API pública da feature e dependências direcionais preservadas
- [ ] testes e `AGENTS.md`/mapa atualizados quando necessário
