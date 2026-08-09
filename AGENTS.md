# ERP-Datwork Development Rules

Este arquivo define as regras de engenharia para qualquer alteração realizada no ERP-Datwork.

## 1. Princípios obrigatórios

- Manter o código modular, legível e com responsabilidades pequenas.
- Aplicar DRY: antes de criar lógica nova, procurar componentes, hooks, services, utilitários e tipos reutilizáveis existentes.
- Evitar arquivos grandes. Quando um arquivo acumular responsabilidades diferentes, separar por responsabilidade.
- Cada domínio deve ter um ponto central de orquestração e módulos menores responsáveis pela execução do trabalho.
- Não misturar refatoração ampla com correção ou feature não relacionada na mesma tarefa.
- Preservar comportamento existente quando o objetivo da tarefa for apenas refatoração.

## 2. Estrutura e responsabilidades

### Frontend

Preferir a separação:

- `Page`: composição e orquestração da tela.
- `components/`: apresentação e interação visual específica do domínio.
- `hooks/`: estado e coordenação de comportamento React.
- `services/`: comunicação HTTP e fronteiras externas.
- `utils/`: funções puras e reutilizáveis.
- `constants/`: configurações estáticas.
- `types/`: contratos específicos do domínio quando não forem globais.

Páginas e componentes visuais não devem acessar `api/client` diretamente quando existir ou couber uma camada de service.

### Backend

Preferir a separação:

- routes: declaração e composição das rotas.
- controllers: fronteira HTTP, validação inicial e tradução de resposta.
- services: regras de negócio.
- repositories/data access: acesso a persistência quando a complexidade justificar a separação.
- math/utils: funções determinísticas e cálculos reutilizáveis.

Controllers não devem concentrar regras de negócio complexas.

## 3. Reutilização

- Componentes visuais reutilizáveis pertencem a `frontend/src/components`.
- Hooks genéricos pertencem a `frontend/src/hooks`.
- Não duplicar validações, parsing, formatação ou cálculos entre Create/Edit/View.
- Extrair comportamento global somente quando houver uma abstração realmente reutilizável.
- Evitar componentes artificiais que apenas movem poucas linhas sem criar uma responsabilidade clara.

## 4. Logging e diagnóstico

- Usar `CustomLogger` para fluxos relevantes, falhas e eventos úteis de diagnóstico.
- Código refatorado não deve introduzir `console.log`, `console.warn` ou `console.error` diretamente fora da implementação do logger.
- Logs novos devem ser técnicos, objetivos e sem emojis.
- Nunca registrar senhas, tokens, segredos, dados de autenticação ou payloads sensíveis.
- Erros devem incluir contexto suficiente para localizar domínio, operação e registro quando seguro.

## 5. Segurança

- Tratar qualquer dado recebido de API, formulário, URL, upload ou armazenamento como não confiável.
- Validar estruturas e tipos nas fronteiras do sistema.
- Não armazenar segredos no repositório.
- Evitar interpolação insegura, exposição de stack traces ao cliente e mensagens internas desnecessárias.
- Uploads devem validar tipo, tamanho, nome, destino e autorização.
- Autenticação e autorização devem ser verificadas no backend; proteção visual no frontend não substitui autorização.
- Preferir soft-delete quando dados possuírem valor histórico ou financeiro.
- Novas dependências devem ser justificadas e avaliadas antes da inclusão.

## 6. Performance

- Evitar N+1 queries e requisições HTTP repetitivas.
- Preferir operações em lote quando disponíveis.
- Não recalcular dados caros durante renderização sem necessidade.
- Utilizar memoização somente quando existir benefício mensurável ou risco real de recomputação.
- Preservar atualização otimista somente quando houver rollback/refresh seguro em caso de falha.
- Revisar índices do banco para consultas frequentes ou crescentes.

## 7. Estilização do frontend

- Novos padrões visuais devem ser centralizáveis.
- Evitar repetir grandes blocos de classes/valores visuais em vários módulos.
- Preferir tokens de tema, presets e componentes base globais.
- Cores, espaçamentos, radius, sombras, tipografia e estados devem convergir para uma camada central de tema/design system.
- Não criar um componente global apenas para um caso específico de uma única tela.

## 8. TypeScript e contratos

- Evitar `any`; usar `unknown` nas fronteiras e validar antes de converter.
- Não enfraquecer unions com padrões como `'A' | 'B' | string` em código novo.
- Payloads de Create/Update devem possuir tipos próprios quando forem estabilizados.
- Parsing de JSON externo deve ser defensivo e não ocorrer diretamente dentro do JSX.

## 9. Testes

- Toda função pura de regra de negócio relevante deve receber testes unitários.
- Correção de bug deve receber teste de regressão quando tecnicamente viável.
- Mudanças de infraestrutura, contratos e fronteiras críticas devem possuir smoke/architecture tests quando úteis.
- Testes não devem depender do banco local do desenvolvedor.
- CI deve utilizar banco temporário e ambiente reproduzível.

Comandos padrão:

```bash
cd frontend && npm ci && npm test && npm run build
cd backend && npm ci && DATABASE_URL=file:./ci.db npx prisma migrate deploy && DATABASE_URL=file:./ci.db npm test
```

## 10. Fluxo de trabalho

- Trabalhar em branch de feature/fix/refactor; evitar desenvolvimento direto na `main`.
- Antes de editar, entender o módulo e reutilizações existentes.
- Manter cada tarefa com escopo único e revisável.
- Após implementar: revisar diff, tipagem, logs, segurança, performance e regressões.
- CI deve passar antes de merge.
- Não ignorar falhas do CI sem entender a causa.

## 11. Critério de conclusão

Uma tarefa só é considerada concluída quando:

1. o comportamento solicitado está implementado;
2. a arquitetura continua modular e DRY;
3. logs relevantes estão presentes;
4. riscos de segurança e performance foram revisados;
5. testes aplicáveis foram adicionados/atualizados;
6. build e CI estão consistentes;
7. não foram introduzidas mudanças não relacionadas ao escopo.
