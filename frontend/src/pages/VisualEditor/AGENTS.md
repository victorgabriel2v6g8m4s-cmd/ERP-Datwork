# AGENTS — Estúdio Visual

## Status e objetivo

Ferramenta **Implementada apenas para desenvolvimento local**. Permite experimentar overrides visuais declarativos sobre superfícies `data-ui-key` conhecidas sem publicar, persistir no backend ou alterar autorização.

## Limites de segurança

- Overrides reais usam somente `uiKey`, propriedade e valor presentes em allowlists tipadas.
- CSS livre, seletores livres e HTML/JavaScript nunca são promovidos para páginas do ERP.
- O laboratório arbitrário roda apenas em `iframe` opaco com `sandbox="allow-scripts"`, `referrerPolicy="no-referrer"` e CSP restritiva. `navigate-to` é defesa adicional, não barreira universal.
- O sandbox não contém CPU. Edição não executa automaticamente; executar, restaurar e recriar o iframe são ações explícitas, mas um loop infinito pode exigir reabrir a aba.
- Mensagens entre editor e preview validam `source`, `origin`, canal, versão e payload.
- Rascunhos ficam exclusivamente no navegador local e não contêm tenant, credencial ou PII.
- Produção não oferece acesso à ferramenta e redireciona sua rota.

## Organização

```text
VisualEditorPage → hooks → contracts/registry/storage
                 → components → preview bridge/CSS
                 → isolated-lab srcDoc
```

## Checklist

- [ ] Nenhum endpoint, `api/client`, `any`, `console.*` ou HTML não confiável no shell.
- [ ] Importação e mensagens passam pelos validadores runtime.
- [ ] Propriedade e valor perigosos são rejeitados.
- [ ] Preview desktop/tablet/mobile e operação por teclado continuam disponíveis.
- [ ] Laboratório permanece não publicável e isolado.
- [ ] Checker pós-build prova a ausência do runtime, bridge e laboratório nos assets de produção.
- [ ] Testes, typecheck, lint e bundle estão verdes.
