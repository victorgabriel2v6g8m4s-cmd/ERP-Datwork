# AGENTS — ERP Datwork

## Precedência obrigatória

1. Leia integralmente [`REGRAS.md`](./REGRAS.md) antes de criar, alterar, revisar ou testar qualquer arquivo.
2. Aplique este arquivo na raiz e o `AGENTS.md` mais próximo do arquivo em trabalho.
3. Consulte [`docs/README.md`](./docs/README.md) para distinguir estado existente, alvo, proposta e bloqueio.
4. Em conflito, segurança, integridade dos dados e decisão humana registrada prevalecem sobre conveniência.

## Missão

Evoluir o ERP Datwork de aplicação local para um ERP SaaS modular, multiempresa e auditável, capaz de atender o Carro Chefe sem acoplar o produto a um único cliente. A ambição de ampliar o mercado é direção de produto, não evidência de capacidade implementada.

## Status documental

Use **Implementado**, **Parcial**, **Proposto**, **Bloqueado** ou **Legado**. Não declare como pronto o que aparece apenas no roadmap, em placeholder ou em documentação.

## Arquitetura observada e alvo

```text
Implementado/parcial: React + Vite → Express → Prisma → SQLite local

Alvo SaaS: Web/PWA → API versionada
  → autenticação + TenantContext + RBAC
    → casos de uso por domínio
      → repositories/adapters → PostgreSQL + object storage
      → outbox → workers → integrações/webhooks
```

Módulos observados: agenda, produtos, insumos, receitas, despesas e precificação. Autenticação real, tenancy/RBAC, PostgreSQL, filas/outbox, integrações de produção, fiscal, contábil, PDV e demais domínios do roadmap não podem ser tratados como implementados.

## Limites globais

- Backend é autoridade para autenticação, autorização, regras, fórmulas e integridade.
- Frontend não acessa Prisma, não decide permissão e não duplica cálculo financeiro canônico.
- Controllers são finos; casos de uso não conhecem Express; domínio não depende de UI ou provider.
- Persistência é isolada por repositories/adapters. Controller não acessa ORM/SQL diretamente.
- Entidade de negócio SaaS é tenant-owned, salvo allowlist global documentada.
- Dinheiro, custo, quantidade e percentuais seguem Decimal; não usar `Float`/`number` em novos contratos financeiros.
- Integração externa usa adapter, timeout, idempotência, retry limitado e observabilidade.
- Evento confiável sai por outbox; webhook valida assinatura, replay e idempotência.
- Segredos, credenciais, bancos locais, uploads e dados pessoais não entram no Git.

## Papéis e veto

- **Gestão/Produto** prioriza e registra decisões; não substitui revisão técnica.
- **Arquitetura** define fronteiras e contratos; não transforma proposta em implementação.
- **Development** é o único papel que altera código e executa gates.
- **Security/Sanitization** revisa auth, authz, tenant, inputs, uploads, logs e abuso; pode vetar.
- **Database** revisa schema, Decimal, constraints, índices, migrations e recuperação; integridade pode vetar.
- **API/Integration** mantém DTOs, compatibilidade, idempotência e adapters.
- **Testing** cobre comportamento, falha, regressão, permissão e isolamento.
- **Performance/Observability** mede hot paths e garante diagnóstico sem sacrificar correção.
- **UI/UX** assegura clareza, acessibilidade e equivalência mobile/desktop.
- **Documentation** mantém mapas, ADRs, status e runbooks alinhados ao código.

## Fluxo obrigatório

1. Ler `REGRAS.md`, os `AGENTS.md` aplicáveis e o índice de arquitetura.
2. Identificar status, requisito, owner, dependências, aceite, riscos e autorização.
3. Mapear fluxo ponta a ponta e procurar contratos/componentes reutilizáveis.
4. Implementar mudança pequena na camada dona; atualizar testes e documentação.
5. Validar segurança, tenant, banco, desempenho, UX e observabilidade proporcionais ao risco.
6. Executar gates regionais, revisar diff e relatar evidência, falha e próximo passo.

## Gates mínimos

- Frontend: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build:bundle`.
- Backend: migrations em banco temporário quando afetadas, `prisma generate`, `npm test`, `npm run build`.
- Persistência: migration do zero, constraints/índices e teste cross-tenant quando aplicável.
- UI: desktop/mobile, teclado, foco, contraste, loading, vazio, erro, sucesso e duplo envio.
- Feature crítica: autorização, IDOR/cross-tenant, input inválido, duplicação/idempotência e falha externa.

Etapa não aplicável exige justificativa no relatório.

## Git e ações externas

- Branch por entrega, commits coerentes e `main` apenas para integração.
- Sem force push ou reescrita de histórico compartilhado.
- Migration destrutiva, deploy, DNS, contratação, compra, publicação, preço final e tratamento externo de dados pessoais exigem autorização humana explícita.
- Preserve mudanças alheias; um único owner de escrita por arquivo em cada entrega.

## Índices

- [Documentação](./docs/README.md)
- [Arquitetura](./docs/architecture/README.md)
- [Roadmap](./docs/roadmap.md)
- [Fit-gap Carro Chefe](./docs/product/carro-chefe-fit-gap.md)
- [ADRs](./docs/architecture/decisions/README.md)
