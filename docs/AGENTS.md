# AGENTS — Documentação

## Região e objetivo

Fonte humana de arquitetura, decisões, roadmap, contratos, operação e fit-gap. Documenta o código; não cria implementação por declaração.

## Organização

```text
docs/README.md
├── architecture/ (contexto, camadas, dados, segurança, integração, ADRs)
├── product/ (capacidades e fit-gap)
├── operations/ (runbooks e recuperação, quando implementados)
└── roadmap.md
```

## Regras

- Todo documento declara **Implementado**, **Parcial**, **Proposto**, **Bloqueado** ou **Legado**.
- Afirmação de implementação exige caminho/evidência verificável.
- ADR registra contexto, decisão, consequências, alternativas e status; alteração cria supersessão explícita.
- Evite duplicar regra: documentos especializados são fonte e índices apenas apontam.
- Não publicar segredo, PII, hostname/credencial privada ou dado financeiro real indevido.
- Links relativos devem funcionar; mapas Mermaid mostram dependência/fluxo, não decoração.

## Papéis

Documentation mantém coerência; Architecture valida desenho; Security/Database/UI revisam suas regiões; Product/Gestão aprova requisito e status de negócio.

## Gate

- [ ] status atual e alvo estão separados
- [ ] owner, dependência, aceite, risco e bloqueio estão claros
- [ ] links/mapas e termos são consistentes
- [ ] `REGRAS.md` e `AGENTS.md` impactados foram atualizados
