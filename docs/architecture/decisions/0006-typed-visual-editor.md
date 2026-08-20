# ADR 0006 — Estúdio Visual tipado e laboratório local isolado

Status: **Proposto — implementação local parcial; decisão de publicação SaaS pendente**.

## Contexto

O produto precisa ajustar a identidade visual de páginas existentes sem criar edição manual espalhada por dezenas de arquivos. Ao mesmo tempo, HTML/CSS/JavaScript fornecidos por usuário não podem ser promovidos ao shell, ao tenant ou à origem autenticada.

## Decisão proposta

Manter o editor como ferramenta DEV local baseada em superfícies `data-ui-key`, propriedades e valores allowlisted, drafts locais versionados e preview em viewport. Manter o laboratório de código em `iframe` opaco com `sandbox="allow-scripts"` e CSP restritiva, sem contrato de publicação.

## Consequências

Positivas: fronteira explícita, menor risco de XSS e mass assignment, preview repetível, undo/redo e evolução incremental do design system. Negativas: cobertura limitada às superfícies registradas; drafts não são compartilhados; CSP/sandbox não garantem contenção de CPU nem comportamento idêntico em todos os navegadores.

## Alternativas

- Persistir CSS/HTML/JavaScript livre e renderizá-lo na aplicação: rejeitado por segurança.
- Criar publicação tenant-aware agora: bloqueado por falta de autenticação, RBAC, auditoria, versionamento e rollback produtivos.
- Remover laboratório: não atende o uso de experimentação visual local, desde que permaneça não publicável e isolado.

## Evidência e próximos gates

Implementação parcial em [`frontend/src/pages/VisualEditor`](../../../frontend/src/pages/VisualEditor) e teste em [`frontend/tests/visual-editor.test.mjs`](../../../frontend/tests/visual-editor.test.mjs). Antes de qualquer publicação: decisão humana de produto/arquitetura, contrato API versionado, TenantContext, RBAC default-deny, auditoria, revisão de conteúdo, CSP produtiva, rollback e testes cross-tenant. Esta ADR não é aceite até essa decisão explícita.
