# ADR 0003 — Sessões opacas server-side

Status: **proposta, bloqueada pelas decisões A3–A5**.

## Contexto

ERP precisa revogar acesso imediatamente após mudança de senha, membership ou role. Token duradouro no navegador amplia exposição e dificulta revogação.

## Decisão

Usar token aleatório opaco em cookie `__Host-`, `Secure`, `HttpOnly`, `SameSite`; banco guarda somente hash, membership ativa, expirações e revogação. Operações mutáveis usam CSRF/origin.

## Consequências

Revogação e auditoria são diretas; cada request consulta/valida sessão com cache seguro opcional. Frontend não persiste credencial.

## Alternativas

JWT longo em localStorage (rejeitado); access token curto + refresh pode ser reavaliado para clientes externos/móveis.
