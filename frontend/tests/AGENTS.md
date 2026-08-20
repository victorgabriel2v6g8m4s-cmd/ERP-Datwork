# AGENTS — Testes de frontend

## Região

Testes de contratos, arquitetura e comportamento da SPA.

## Regras

- Teste comportamento observável, não detalhe privado.
- Correção de bug recebe regressão reproduzível.
- Cubra válido, inválido, loading, vazio, erro, duplo envio, preservação de input e navegação.
- Feature responsiva crítica exige evidência mobile/desktop, teclado e foco; use E2E quando a unidade não provar o fluxo.
- Teste de fronteira impede componente acessando API client e hardcodes fora das fontes únicas.
- Fixture não contém PII/segredo real e é mínima/determinística.

## Gate

- [ ] `npm test`, typecheck, lint e build verdes
- [ ] teste falha sem a correção e não é flaky
- [ ] dependência externa é mockada no limite correto
