# Fundação SaaS e operacional

Status: **proposta para aprovação**. Esta documentação foi preparada sobre a branch `refactor/products-stage-1`, no commit `009185c`, e não autoriza implementação automática.

## Objetivo e limites

Definir uma fundação implementável para transformar o ERP local em um SaaS multiempresa, migrar o banco para PostgreSQL e operar a primeira implantação em VPS com segurança e recuperação verificável.

Ficam fora desta etapa: alterar o schema Prisma, criar migrations, instalar dependências, mudar código, configurar a VPS ou transferir dados. Cada execução futura deverá ter task, revisão e plano de rollback próprios.

## Estado observado

- O frontend é React/Vite e já usa `/api` no build de produção; o backend é Express/Prisma.
- O banco é SQLite, com 23 migrations ativas e 14 campos `Float` no schema.
- Ainda não existem `Organization`, `User`, `Membership`, `Role`, `Permission` ou sessões persistidas.
- O login do frontend é simulado. O backend permite bypass somente em desenvolvimento e falha fechado em produção.
- `/health` confirma apenas que o processo responde; não há readiness do banco ou da versão de migrations.
- Uploads ficam no disco local sob `default_user`, sem metadados persistidos nem separação por empresa.
- A cópia local ignorada `backend/dev.db` passou em `integrity_check`, mas apresentou 58 violações de chave estrangeira: 4 em `recipes -> products` e 54 em `product_versions -> products`. Ela não deve ser considerada apta para migração até que a origem oficial seja escolhida e as violações sejam tratadas.

## Documentos

- [Tenancy e RBAC](./tenancy-and-rbac.md): modelo organizacional, autorização e isolamento obrigatório.
- [Autenticação e sessões](./authentication-and-sessions.md): login, cookies, CSRF, recuperação de senha e revogação.
- [Migração para PostgreSQL](./postgresql-migration.md): baseline, transferência, validação e política Decimal.
- [Operação na VPS](./vps-operations.md): TLS, processo, readiness, backups, observabilidade e uploads.
- [Fases, riscos e aprovações](./rollout-decisions-and-risks.md): dependências, gates e decisões do proprietário.

## Princípios que funcionam como gates

1. Nenhuma segunda empresa entra no sistema antes de o isolamento em aplicação, banco, testes e uploads estar ativo.
2. Nenhuma troca de banco ocorre sem origem congelada, backup verificável, ensaio completo e reconciliação assinada.
3. Nenhuma publicação externa ocorre sem autenticação real, TLS, readiness, backup externo e restauração ensaiada.
4. Identidade, empresa e permissão são contextos validados pelo servidor; IDs enviados pelo cliente nunca concedem acesso.
5. Valores decimais são strings nos contratos HTTP e aritmética financeira não usa `number`/IEEE-754.
6. Migration de banco é etapa explícita do deploy; não roda automaticamente ao iniciar a aplicação.
7. Um backup só é considerado válido depois de uma restauração automatizada e verificada.

## Referências normativas

As decisões de segurança seguem as recomendações atuais da [OWASP para aplicações multi-tenant](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html), [gerenciamento de sessões](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) e [autorização](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). As decisões de banco consideram a documentação oficial do PostgreSQL sobre [Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) e [recuperação point-in-time](https://www.postgresql.org/docs/current/continuous-archiving.html).
