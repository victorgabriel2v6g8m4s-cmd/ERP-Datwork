# Autenticação e sessões

Status: **proposta**. A escolha inicial é sessão opaca mantida no servidor, em vez de JWT de longa duração no navegador.

## Contrato de autenticação

O backend será a única autoridade de autenticação. O frontend não guardará credencial, token de sessão ou permission list em `localStorage`. A resposta de identidade pode ser mantida em memória e recarregada por `GET /api/auth/session`.

Uma futura `Session` terá, no mínimo: ID interno, hash único do token, `userId`, `activeMembershipId`, datas de criação/último uso/expiração ociosa/expiração absoluta, data e motivo de revogação e metadados mínimos de dispositivo. O token aleatório de 32 bytes só existe em claro no cookie; o banco guarda seu hash criptográfico.

Fluxo de login proposto:

1. Normalizar o e-mail, aplicar limites por IP e por conta e buscar o usuário sem revelar se ele existe.
2. Verificar a senha com Argon2id e tratar conta, e-mail e membership inativos com resposta pública uniforme.
3. Criar a sessão com a organização escolhida somente após validar uma membership ativa.
4. Rotacionar qualquer identificador pré-autenticação, emitir o cookie e registrar evento técnico sem credenciais.
5. Retornar usuário, organizações acessíveis, empresa ativa e permissões efetivas calculadas no servidor.

Trocar de organização é uma operação `POST`: valida a membership, revoga/rotaciona o token e o CSRF, e devolve o novo contexto. Alteração de senha, e-mail, MFA futuro, role ou nível de privilégio também rotaciona ou revoga sessões.

## Cookie de sessão

Produção usará um único domínio para frontend e `/api`, evitando CORS amplo.

```text
Set-Cookie: __Host-datwork_session=<token>; Secure; HttpOnly; SameSite=Lax; Path=/
```

- sem atributo `Domain`, para impedir compartilhamento com subdomínios;
- `Secure` e TLS durante toda a sessão;
- `HttpOnly`, nunca acessível pelo JavaScript;
- `SameSite=Lax` para equilíbrio entre navegação e proteção; `Strict` poderá ser adotado se os fluxos externos forem compatíveis;
- cookie de sessão sem `Expires`/`Max-Age`; a validade no servidor continua limitada pela expiração absoluta e não haverá “lembrar-me” na primeira versão;
- respostas autenticadas e páginas de recuperação usam `Cache-Control: no-store`.

Defaults a confirmar: expiração ociosa de 12 horas, absoluta de 7 dias e autenticação recente de no máximo 15 minutos para ownership, senha, e-mail, roles e encerramento de todas as sessões. `lastSeenAt` será atualizado de forma amortizada, não a cada request.

## CSRF e origem

`SameSite` é defesa adicional, não a proteção principal. A aplicação stateful usará synchronizer token:

- `GET /api/auth/csrf` emite um token aleatório ligado à sessão; ele não é o cookie de sessão;
- o cliente envia `X-CSRF-Token` em `POST`, `PUT`, `PATCH` e `DELETE`;
- o servidor compara em tempo constante e rejeita token ausente ou inválido;
- todas as operações inseguras também validam `Origin` contra a origem canônica; `Referer` é fallback controlado;
- `Sec-Fetch-Site` incompatível é rejeitado quando presente;
- login e solicitação de recuperação, ainda sem sessão autenticada, exigem JSON, origem válida e rate limit; nenhum `GET` altera estado.

Tokens CSRF são rotacionados no login, troca de empresa, elevação de privilégio e revogação. Falhas geram evento de segurança sem registrar o token.

## Senhas e recuperação

Senhas serão armazenadas com Argon2id. Parâmetro mínimo proposto: 19 MiB de memória, duas iterações e paralelismo 1; a VPS deve ser benchmarkada e elevar o custo até uma latência operacional aceitável. O hash carrega algoritmo e parâmetros para permitir rehash no próximo login. Salt é individual e gerado pela biblioteca. Pepper, se adotado, fica em secret store separado do banco e exige plano próprio de rotação.

Fluxo de recuperação:

1. `POST /api/auth/password/forgot` sempre responde com mensagem e tempo equivalentes, exista ou não a conta.
2. Um token aleatório de 32 bytes, de uso único e validade proposta de 30 minutos é enviado por e-mail. Só seu hash fica no banco.
3. Solicitar novo token invalida os anteriores ativos. Limites são aplicados por conta e IP.
4. A URL usa a origem fixa da configuração, nunca `Host` fornecido pelo cliente. O token não aparece em logs e é removido da URL após ser consumido pela página.
5. `POST /api/auth/password/reset` valida token, expiração e senha, consome o token atomicamente, muda o hash e revoga todas as sessões do usuário.
6. O usuário recebe notificação da alteração, sem envio da nova senha e sem login automático.

A primeira versão requer um provedor de e-mail transacional. Perguntas de segurança não serão usadas. Política de senha, MFA para owners/admins e recuperação de MFA dependem de aprovação.

## Encerramento e gestão de sessões

- `POST /api/auth/logout`: revoga no servidor antes de apagar o cookie.
- `GET /api/auth/sessions`: lista sessões do próprio usuário com dispositivo aproximado, criação, último uso e indicação da atual, sem expor token ou hash.
- `DELETE /api/auth/sessions/:id`: encerra uma sessão própria.
- `POST /api/auth/logout-all`: exige autenticação recente e encerra todas, opcionalmente preservando a atual se isso for aprovado.
- reset de senha, usuário suspenso, organização inativa ou membership removida revogam as sessões aplicáveis imediatamente.
- uma rotina remove ou anonimiza sessões expiradas conforme a retenção aprovada; expiração é verificada em toda request, não depende da rotina.

## Controles complementares

- Rate limit de autenticação precisa de armazenamento compartilhado/persistente antes de haver mais de um processo; o mapa em memória atual não é suficiente.
- Respostas públicas não diferenciam e-mail inexistente, senha errada, conta bloqueada ou membership ausente.
- Eventos registram login bem-sucedido/falho, emissão e consumo de recuperação, troca de empresa, mudança de privilégio e revogação. Nunca registram senha, cookie, CSRF, reset token ou corpo completo.
- Autorização continua sendo verificada em cada request; sessão válida não implica acesso a qualquer empresa ou recurso.
- CORS em produção aceita somente a origem canônica e credentials; a preferência é same-origin pelo proxy.

## Testes que bloqueiam o lançamento

- fixation e rotação de sessão; cookie com atributos exatos; token não aceito por URL/header alternativo;
- idle, absoluto, logout atual, logout total e revogação por membership/senha;
- CSRF ausente, inválido, reutilizado após rotação e origem cruzada;
- enumeração por mensagem e fluxo, brute force/rate limit e concorrência de dois resets;
- alteração de role durante sessão e tentativa de manter permissões antigas;
- sessão de uma empresa tentando acessar recursos de outra.

Referências: [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) e [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
