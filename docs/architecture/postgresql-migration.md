# Migração de SQLite para PostgreSQL

Status: **proposta**. Não executar antes da aprovação do modelo SaaS, da política Decimal e da origem oficial dos dados.

## Resultado esperado

- PostgreSQL em versão major suportada e fixada por ambiente.
- Uma cadeia nova de migrations exclusivamente PostgreSQL, recriável do zero no CI.
- Dados legados associados a uma organização bootstrap, com IDs preservados quando válidos.
- Campos decimais sem aritmética IEEE-754 no backend ou nos contratos HTTP.
- Manifesto de migração reproduzível, reconciliação assinada e SQLite original imutável.

O comentário atual de que basta mudar o provider não corresponde à transição real: adaptador, migrations SQLite, tipos nativos, constraints, SQL, dados e runtime precisam mudar coordenadamente.

## Pré-flight e origem

1. O proprietário identifica qual arquivo SQLite é a origem oficial e quem pode autorizar o corte.
2. Entram em freeze as escritas; são registrados tamanho, SHA-256, data e responsável.
3. São geradas duas cópias read-only, uma de trabalho e outra de custódia fora da máquina.
4. Rodam `integrity_check`, `foreign_key_check`, inventário de tabelas/colunas/índices, contagens e auditorias de JSON, datas, enums, nulidade, unicidade e números.
5. Qualquer violação gera relatório e bloqueia a transferência; correções ocorrem em cópia versionada, por regras explícitas e auditáveis.

Na inspeção de 2026-08-10, a cópia local `backend/dev.db` estava íntegra no nível de páginas, mas tinha 58 FKs órfãs. Como o arquivo é ignorado pelo Git e pode não ser a origem oficial, os números são apenas um alerta: o pré-flight deve ser repetido sobre a fonte aprovada.

## Nova baseline de migrations

A cadeia SQLite atual não será reaproveitada como se fosse PostgreSQL.

1. Criar tag/commit de custódia do último estado SQLite e guardar o dump/schema e o arquivo-fonte com checksum.
2. Em uma task futura, aprovar primeiro o schema final PostgreSQL com tenancy, autenticação, constraints e tipos Decimal.
3. Substituir a pasta ativa de migrations por uma baseline PostgreSQL gerada do schema aprovado a partir de banco vazio. O histórico SQLite continua recuperável no Git/tag, fora da pasta ativa.
4. Revisar manualmente SQL, nomes, FKs compostas, índices, RLS e permissões. A baseline deve criar tudo; não deve conter dados específicos do ambiente.
5. Aplicar a baseline com `prisma migrate deploy` em PostgreSQL vazio no CI e em staging. Um banco de produção preexistente só usaria `migrate resolve --applied` após prova de equivalência exata; a estratégia preferida aqui é criar o destino vazio pela própria baseline.
6. Migrations posteriores são pequenas, PostgreSQL-only e seguem expand/contract. A role de migration é separada da role de runtime.

O importador de dados não é uma migration Prisma. Será uma ferramenta one-shot, versionada, idempotente por `migrationRunId`, com dry-run, checkpoints, manifestos e logs sem PII. Ela escreve no schema já criado e respeita constraints.

## Transferência dos dados

Ordem proposta:

1. criar `Organization`, permissões, roles de sistema e o primeiro `User`/`Membership` owner por procedimento bootstrap;
2. importar configurações e raízes independentes: appointments, products, ingredients, expenses, pricing settings e order profiles;
3. importar recipes e recipe items após products e ingredients;
4. importar versões/históricos após seus pais, resolvendo órfãos por decisão registrada — nunca descartando silenciosamente;
5. transformar snapshots conhecidos para o contrato Decimal versionado e guardar o export bruto para auditoria;
6. copiar uploads para armazenamento de objetos, calcular checksum e criar metadados tenant-owned; só então atualizar referências;
7. ajustar sequences se algum ID numérico existir no futuro, executar `ANALYZE` e validar o conjunto completo.

Todos os registros atuais recebem o `organizationId` da empresa bootstrap. E-mails, slug, razão/nome, moeda base e owner não podem ser inventados pelo importador.

Datas são interpretadas conforme a semântica da origem e gravadas em UTC; datas sem timezone entram em relatório antes da conversão. JSON inválido, enum desconhecido, FK órfã, duplicidade, overflow ou número não finito interrompem o lote correspondente.

## Validação e aceite

| Dimensão | Validação mínima |
| --- | --- |
| Estrutura | baseline sobe do zero; schema diff vazio; provider e migration lock são PostgreSQL |
| Completude | contagem por tabela e organização; IDs de origem presentes no destino; zero registros não classificados |
| Relações | zero FKs órfãs; vínculos compostos mantêm `organizationId`; constraints e RLS ativas |
| Conteúdo | hashes determinísticos de linhas canônicas por lote, excluindo campos gerados documentados |
| Financeiro | min/max/soma por campo, distribuição, escala, deltas de arredondamento e recálculo independente |
| JSON/snapshots | parse de 100%, versão conhecida, caminhos decimais como strings e amostragem aprovada |
| Uploads | quantidade, tamanho e SHA-256; objeto privado acessível apenas pela organização dona |
| Aplicação | smoke de todos os módulos, auth/RBAC, isolamento entre duas empresas e concorrência básica |
| Operação | backup, restauração, readiness, métricas e rollback ensaiados em staging |

O manifesto contém versão do importador, checksums da origem/export/objetos, contagens, totais, erros, decisões de reparo, início/fim e responsáveis. O aceite exige zero divergência não explicada.

## Float para Decimal

### Contrato proposto

| Semântica atual | Tipo PostgreSQL/Prisma proposto | Regra |
| --- | --- | --- |
| valor monetário informado (`Expense.value`, `Ingredient.price`, `Product.finalPrice`) | `Decimal(19,4)` | quatro casas armazenadas; apresentação pela escala da moeda |
| custo/preço monetário calculado (`recipeCostPerUnit`, `indirectCost`, `totalUnitCost`, `suggestedPrice`, `predictedNetProfit`) | `Decimal(19,6)` | precisão adicional para custo unitário; arredondar só na fronteira definida |
| quantidade (`Ingredient.quantity`, `RecipeItem.quantityNeeded`) | `Decimal(19,6)` | unidade é obrigatória e conversões têm regra explícita |
| percentual/margem | `Decimal(9,6)` | armazenado em pontos percentuais, por exemplo `12.5` = 12,5% |
| capacidade de produção | `Decimal(19,6)` provisório | confirmar se o domínio exige inteiro ou quantidade fracionária |

`Decimal(p,s)` usa `p` dígitos totais e `s` fracionários. Os limites devem ser validados antes do banco para produzir erros de domínio claros.

Regras comuns:

- HTTP recebe e devolve decimais como strings canônicas (`"1234.5600"`), nunca JSON number.
- Validators convertem string com a biblioteca decimal adotada; presenters serializam string. Frontend mantém texto durante edição e formata apenas para exibição.
- Serviços e fórmulas usam Decimal ponta a ponta. Converter para `number` só é permitido em coordenadas/medidas não financeiras comprovadamente seguras.
- Operações intermediárias usam precisão de pelo menos 12 casas; a escala de persistência não define sozinha a escala de cálculo.
- Arredondamento comercial inicial proposto: `HALF_UP`. Regras fiscais/tributárias terão política própria versionada por jurisdição; nunca dependem do default de uma biblioteca.
- Valores apresentados/pagos respeitam os minor units ISO 4217 da moeda; BRL usa duas casas nessa fronteira. Guardar quatro ou seis casas não autoriza cobrar frações de centavo.
- `Organization.baseCurrency` começa com `BRL`. Entidades transacionais financeiras futuras terão `currencyCode`; nenhuma conversão cambial é implícita.

### Conversão dos valores existentes

Para cada campo, o importador extrai uma representação textual determinística, valida finitude/sinal/limite, aplica a escala e o modo de arredondamento aprovados e registra valor de origem, destino e delta em relatório técnico. Fazer apenas cast de `REAL` para `numeric` pode cristalizar ruído binário e não é suficiente.

Totais derivados serão recalculados com o novo motor Decimal e comparados ao legado. Diferenças dentro da tolerância aprovada são registradas; diferenças maiores viram exceção manual. Nenhum total financeiro será “ajustado” silenciosamente.

Snapshots históricos precisam de decisão: a recomendação é versionar o formato e converter caminhos monetários/quantitativos conhecidos para strings, preservando o export bruto imutável. Manter números legados dentro do JSON exigiria leitores duplos indefinidamente.

## Ensaio, cutover e rollback

1. Executar ao menos dois ensaios completos em staging a partir de cópias novas da origem e comparar manifestos.
2. Medir duração para definir a janela de manutenção com margem.
3. No corte: bloquear escritas, fazer backup/checksum final, importar em PostgreSQL vazio, validar e só então trocar a aplicação.
4. Abrir tráfego gradualmente, executar smoke e observar erros, latência e reconciliação.
5. Manter SQLite final read-only pelo período de retenção aprovado.

Antes da primeira escrita em PostgreSQL, rollback significa apontar o release anterior para o SQLite congelado. Depois que PostgreSQL aceitar escrita, voltar diretamente ao SQLite perderia dados; a decisão passa a ser correção forward, restauração PostgreSQL/PITR ou reverse-ETL planejado. Este é um gate explícito de não retorno.

Referências: [Prisma — baselining](https://docs.prisma.io/docs/orm/prisma-migrate/workflows/baselining), [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) e [PostgreSQL PITR](https://www.postgresql.org/docs/current/continuous-archiving.html).
