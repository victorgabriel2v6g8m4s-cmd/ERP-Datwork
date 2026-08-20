# REGRAS — ERP Datwork

Estas regras são obrigatórias para qualquer criação, alteração, refatoração, correção, revisão, migração ou operação do ERP Datwork. Adaptam as diretrizes full-stack do projeto de origem às necessidades de um ERP SaaS e complementam os `AGENTS.md` regionais.

## 1. Objetivo e verdade operacional

O ERP Datwork deve evoluir de forma modular, segura, testável, observável e utilizável em desktop e mobile. Atender negócios de portes diferentes é um **alvo de produto**; apenas código testado e evidência registrada são **implementados**.

Use sempre: **Implementado**, **Parcial**, **Proposto**, **Bloqueado** ou **Legado**. Não confunda tela, mock, placeholder, migration antiga ou documentação com capacidade produtiva.

## 2. Ordem de decisão

```text
correção → segurança → integridade dos dados → arquitetura
→ manutenção/testes → UX/acessibilidade → performance medida → menos código
```

Velocidade não justifica duplicação, arquivo gigante, bypass de autorização, perda de precisão ou dívida técnica evitável.

## 3. Responsabilidade e tamanho

- Um arquivo, função, componente, hook, controller, service, repository ou configuração possui uma responsabilidade central.
- A partir de ~150 linhas, analise extração; acima de ~250, justifique; acima de ~400, trate como dívida arquitetural salvo exceção registrada.
- Páginas e controllers orquestram. Regras ficam em casos de uso/domínio; persistência em repositories; providers em adapters.
- Não transfira um “god component” para um “god hook/service/config”.
- Não crie wrappers artificiais: a abstração deve reduzir duplicação, expor contrato ou permitir evolução independente.

## 4. Organização por domínio

Código específico permanece no domínio; `shared` recebe apenas código genuinamente genérico com owner claro.

```text
module/
├── application ou services
├── domain
├── contracts ou validators
├── repositories e policies
├── presenters ou mappers
├── components e hooks (frontend)
├── tests
└── index.ts (API pública local)
```

Dependências seguem uma direção previsível e não formam ciclos. Barrel export não expõe detalhes internos.

## 5. Reutilização e fonte única

- Antes de criar componente, hook, função, tipo, endpoint, texto, token, regra ou formatter, procure equivalente.
- Regras, permissões, rotas, endpoints, schemas, fórmulas, enums, textos e tokens têm uma fonte de verdade.
- Dupla validação tem propósitos diferentes: frontend para UX, backend para segurança/regra e banco para integridade.
- Não generalize domínios com invariantes diferentes apenas por semelhança visual.

## 6. TypeScript e contratos

- Evite `any`, `@ts-ignore`, casts inseguros e retornos imprevisíveis. Use `unknown` + schema, unions e tipos compartilhados.
- DTOs de entrada/saída são explícitos; entidades Prisma não são contratos HTTP.
- Respostas retornam somente o necessário e erros com `code` estável; nunca stack trace ou detalhe de banco.
- Rotas e endpoints são centralizados e versionáveis.

## 7. Frontend e design system

- Componentes obtêm dados por hooks/services e permanecem finos; UI não importa client HTTP diretamente.
- Textos passam por i18n; configuração por módulos; cores, tipografia, espaços, radius, breakpoints e estados por tokens/temas.
- `data-ui-key` identifica superfícies do editor visual futuro; não substitui semântica ou acessibilidade.
- Estado fica próximo do uso; server state não é copiado; estado derivado é calculado.
- `useEffect`, memoização e lazy loading só entram com responsabilidade ou benefício claro.
- Evite request duplicado e waterfall; resposta canônica da mutation deve atualizar o estado quando segura.

## 8. UX responsiva e acessível

- Tarefa essencial deve ser concluível em desktop e mobile sem duplicar regra de negócio.
- Mobile usa alvos de toque adequados, navegação simples e alternativa a tabelas largas.
- Teclado, foco, labels, HTML semântico, screen reader, contraste e mensagens de erro integram o componente.
- Cor nunca é o único indicador de estado.
- Ação assíncrona mostra loading localizado, bloqueia duplo envio e orienta após sucesso/erro.
- Preserve dados digitados após falha. Ação destrutiva exige confirmação proporcional ou undo seguro.
- Reutilize layout, header, card, form field, table/card list, modal, toast, estados e paginação.

## 9. Backend

```text
Request → validação/sanitização → autenticação
→ TenantContext + autorização → controller fino → caso de uso
→ repository/adapter → presenter → resposta
```

- Controller não conhece SQL/Prisma nem regra extensa.
- Caso de uso é pequeno, nomeado por intenção e deixa side effects explícitos.
- Chamada externa não fica em transação sem necessidade de atomicidade.
- Transação é curta; idempotência e comportamento concorrente são definidos.
- Trabalho pesado usa fila/worker com retry limitado, backoff, dead-letter e progresso quando aplicável.
- Banco, HTTP, storage, cache e integração têm timeout.

## 10. SaaS, autenticação e autorização

- Entidade de negócio é tenant-owned salvo allowlist global documentada.
- Servidor resolve `User`, `Session`, `Membership` e `Organization`; ID do cliente nunca concede acesso.
- Autorização é server-side, default-deny e resource-aware. Ocultar botão não controla acesso.
- Repository exige `TenantContext`; query por ID inclui tenant. Cache, upload, job, export e log também carregam contexto.
- PostgreSQL alvo usa RLS como contenção adicional, sem substituir o filtro da aplicação.
- Sessão alvo é opaca/revogável em cookie `Secure`, `HttpOnly`, `SameSite`; token não fica em `localStorage`.
- Operações mutáveis stateful usam CSRF/origin; auth, reset e endpoint custoso usam rate limit contextual.
- Mudança de privilégio, senha ou membership revoga/rotaciona sessões e gera auditoria.

## 11. Segurança nas fronteiras

- Usuário, URL, query, header, cookie, webhook, arquivo, CSV/JSON, cache, fila e provider são não confiáveis.
- Validação verifica formato; sanitização neutraliza/normaliza. Use allowlist e impeça mass assignment.
- Nunca concatene entrada em SQL ou shell. SQL raw exige parâmetros, review, teste e justificativa.
- Upload valida tamanho, MIME declarado/detectado, assinatura, filename e destino, impedindo traversal.
- Arquivo privado exige ownership/autorização e URL assinada curta; bucket não é público.
- Webhook valida assinatura, timestamp/replay, evento permitido e idempotência antes de processar.
- CORS e headers são centralizados/restritivos; produção prefere same-origin.

## 12. Segredos, LGPD, logs e auditoria

- Nunca versione senha, token, cookie, chave, banco local, PII exportada ou credencial.
- Logs usam `CustomLogger`, são contextuais e redigem campos sensíveis; remova `console.*` temporário.
- Audit log é separado do log técnico e registra ator, momento, ação, recurso, resultado, origem e correlation ID.
- Classifique/minimize dados e defina finalidade, acesso, retenção, exportação e descarte.
- Métricas e traces não usam PII nem IDs de tenant/usuário como labels de alta cardinalidade.

## 13. PostgreSQL, Prisma e migrations

- SQLite atual é legado de desenvolvimento; PostgreSQL + Prisma é o alvo SaaS.
- Banco expressa invariantes com `NOT NULL`, `UNIQUE`, FK, `CHECK`, defaults e delete explícito.
- Todo filtro/listagem avalia índice e paginação; evite `SELECT *`, N+1 e coleção ilimitada.
- Migrations são pequenas, revisadas, recriáveis do zero e compatíveis; mudanças complexas usam expand/contract.
- Migration não roda implicitamente no start; runtime não possui migration ou bypass RLS.
- Mudança destrutiva exige autorização, backup verificado, plano de dados e recuperação.

## 14. Precisão financeira e fórmulas

- Não use `Float`, `REAL` ou JavaScript `number` como fonte canônica de dinheiro, custo, margem, imposto ou quantidade fracionária.
- PostgreSQL/Prisma usa `Decimal(p,s)` aprovado; HTTP usa strings canônicas; frontend preserva texto na edição.
- Arredondamento, escala, unidade, moeda, vigência e versão são explícitos; regra fiscal não herda default genérico.
- Motor de fórmula é determinístico, versionado, testável e auditável. Fórmula nova não reescreve histórico.
- Totais são recalculáveis a partir de fatos e versão; snapshots possuem schema/versionamento.

## 15. Integrações, eventos e outbox

- Cada integração declara owner, direção, contrato, frequência, idempotência e reconciliação.
- Adapters isolam n8n/WhatsApp, pagamentos, fiscal, e-commerce, storage, e-mail e providers futuros.
- Evento confiável usa outbox na transação do fato; worker entrega com idempotência e registra tentativas.
- Consumidor suporta duplicação e ordenação limitada. Retry infinito é proibido; falha persistente vai à DLQ.
- Webhook não registra payload completo nem dispara regra financeira sem validação canônica.

## 16. Performance e escala

- Meça antes de otimizar com profiling, métricas, traces, query plan e browser profiler.
- Avalie CPU, memória, I/O, rede, payload, render, query, lock e concorrência ponta a ponta.
- Listagem grande usa paginação com máximo server-side; export/import usa streaming/chunks e assíncrono.
- `Promise.all` ilimitado, O(n²), cache sem TTL/invalidação e query por item são bloqueios.
- Cache é derivado, tenant-aware e nunca fonte acidental de verdade.

## 17. Observabilidade e operação

- Operação crítica tem request/correlation ID, logs de resultado/falha, métrica e auditoria quando necessária.
- `/health` é liveness barato; `/ready` verifica dependências sem expor detalhes.
- Serviços fazem graceful shutdown; filas retomam com segurança.
- Deploy é reproduzível, same-origin atrás de TLS, com secrets fora do Git e rollback compatível.
- Backup inclui banco, objetos e configuração. Só é válido após restore testado e evidenciado.
- SLO, RPO, RTO, retenção e alertas precisam de aprovação e medição.

## 18. Testes e CI

- Regra, fórmula, validator, mapper, service, repository e bug reproduzível têm teste comportamental.
- Feature crítica cobre válido, inválido/vazio/gigante, inexistente, autorização, cross-tenant, duplicação, concorrência, timeout e falha externa.
- Banco cobre migrations do zero, constraints, query crítica, RLS e recuperação.
- API cobre contrato, erro, paginação, idempotência e compatibilidade.
- UI cobre teclado, foco, responsividade, estados, preservação de dados e duplo envio.
- CI executa lint, typecheck, testes, build, migration do zero e checks de segurança pertinentes.
- Não desative regra nem aumente limite para esconder falha.

## 19. Documentação e AGENTS.md

- Cada região relevante possui `AGENTS.md` com objetivo, limites, dependências, papéis, segurança e checklist.
- Herança: raiz → camada → feature. Regra local pode restringir, nunca enfraquecer qualidade/segurança.
- Feature relevante documenta mapa e fluxo. Decisão importante usa ADR com contexto, decisão, consequência e status.
- Documentação muda junto com arquitetura; mapa desatualizado é defeito.

## 20. Conclusão e Git

- Branch por entrega, um owner de escrita por arquivo, preservar mudanças alheias e nunca force push.
- Dependência nova exige análise de necessidade, manutenção, peso, licença e supply chain.
- Antes de concluir: validar verdade do status, duplicação/tamanho, auth/tenant, segurança, Decimal/banco, mobile/desktop, testes/build, observabilidade e documentação.
- Se um item aplicável falhar, registre bloqueio e próximo passo; não declare a entrega pronta.
