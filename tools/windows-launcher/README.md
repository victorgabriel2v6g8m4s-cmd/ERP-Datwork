# Inicializador local do ERP Datwork para Windows

Status: **Implementado para build e validação local**. Instalação, inicialização automática e atalhos só passam a existir após execução humana de `npm run launcher:install`.

## Contrato operacional

O executável usa `NotifyIcon` e controla uma única árvore de processo criada por ele: `node.exe tools/dev-stack.mjs`. O stack inicia backend e frontend diretamente com o mesmo runtime Node, em `127.0.0.1`. Não há comando configurável, shell, API HTTP administrativa, serviço Windows, HKLM ou elevação.

Os estados visíveis são:

| Estado | Cor | Significado textual |
| --- | --- | --- |
| `OFFLINE` | cinza | ambiente local desligado |
| `STARTING` | laranja | serviços iniciando ou aguardando probes |
| `ONLINE` | verde | processo próprio vivo, backend `/health` e frontend saudáveis |
| `ERROR` | vermelho | falha, limite de tentativas ou porta respondendo por processo externo |

`ONLINE` não equivale a readiness produtivo. `/ready`, autenticação real e operação SaaS permanecem fora deste launcher local.

## Segurança e lifecycle

- A raiz, `package.json`, `node.exe`, script e URLs loopback são canonizados e validados antes do start.
- O controle cooperativo usa named pipe efêmero e nonce criptográfico por processo, transmitidos somente pelo ambiente do filho, nunca persistidos ou registrados.
- O payload possui versão e comando em allowlist. As credenciais de controle são removidas do ambiente herdado por backend e frontend.
- Os serviços recebem somente `SystemRoot`, `WINDIR`, `TEMP`, `TMP` e as variáveis fixas de cada serviço; `Path`, `NODE_*`, configurações npm e segredos do processo pai não são herdados.
- O .NET Framework/Node usados aqui não expõem uma forma portátil simples de aplicar ACL por SID no `net.createServer`. O nonce de 256 bits mitiga conexões não autorizadas do mesmo host; esta é uma limitação explícita do ambiente local.
- Após timeout cooperativo, `taskkill.exe /PID <pid-próprio> /T /F` é o único fallback. Nunca há encerramento por nome ou porta.
- As tentativas automáticas são limitadas e usam backoff. Uma nova sequência exige ação manual.
- Logs técnicos limitados ficam em `.runtime/launcher`; não recebem stdout, ambiente, payload, segredo ou dado pessoal.

## Modelo de confiança e limites de distribuição

Esta implementação pressupõe um **checkout local confiável**, controlado pelo próprio desenvolvedor. Ela não é um instalador de distribuição e não transforma uma pasta recebida de terceiros em código confiável.

- A canonização atual não é uma defesa completa contra reparse points/junctions alterados após a validação.
- `node.exe`, `tools/dev-stack.mjs`, o executável e a configuração ainda não possuem manifesto de hashes nem verificação de assinatura Authenticode.
- Uma distribuição futura deve usar pacote assinado, hashes fixados, atualização autenticada e validação de reparse points/ownership antes da execução.
- Mutex e eventos de abrir/sair têm nomes previsíveis e coordenam processos do mesmo usuário; não são fronteira de privilégio e podem sofrer sinalização ou negação de serviço por outro processo naquela sessão.
- O pipe de controle tem nome e nonce efêmeros. O nonce autoriza somente `STATUS` e `STOP`, mas não substitui isolamento de conta ou ACL explícita.

## Comandos

```text
npm run launcher:build
npm run launcher:install
npm run launcher:uninstall
```

`launcher:build` somente gera o executável e o ícone ignorados pelo Git. `launcher:install` grava uma configuração local ao lado do binário e cria atalhos no Startup e Desktop do usuário atual. `launcher:uninstall` solicita saída cooperativa e remove atalhos/configuração. Nenhum desses scripts altera registro ou requer administrador.
