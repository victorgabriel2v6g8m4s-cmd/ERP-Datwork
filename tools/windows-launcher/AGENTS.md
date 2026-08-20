# AGENTS — Windows Launcher

## Objetivo e status

Esta região implementa apenas o inicializador **local** do ERP Datwork para Windows. Ela não representa deploy, serviço Windows, ambiente SaaS, readiness produtivo ou autenticação real.

## Limites

- O launcher inicia exclusivamente `node.exe tools/dev-stack.mjs` a partir da raiz validada do repositório.
- Não aceitar comando, argumento, URL, script ou variável de ambiente livre pela interface.
- Não usar `cmd.exe`, PowerShell ou shell para iniciar o stack.
- Controlar e encerrar somente a árvore do processo criada pela própria instância.
- Parada forçada por PID é apenas fallback posterior à parada cooperativa e deve usar o PID ainda pertencente ao launcher.
- Bind, probes e protocolo de controle permanecem em loopback/local; nenhuma API administrativa HTTP é permitida.
- Instalação é por atalhos do usuário atual. Não usar HKLM, elevação, serviço Windows ou tarefa agendada.
- Configuração gerada, binários, logs e estado runtime não entram no Git.
- Logs registram somente lifecycle técnico, sem ambiente completo, segredo, payload ou dado pessoal.

## Estrutura

- `Domain`: estados e configuração validada.
- `Application`: coordenação do lifecycle e política de tentativas.
- `Infrastructure`: processo, probes, configuração, logging e recursos Windows.
- `Presentation`: NotifyIcon, menus, ícones e ações do usuário.
- scripts PowerShell: build e instalação reversível, sem executar instalação implicitamente.

Dependências seguem `Presentation → Application → Domain` e `Application → Infrastructure/Domain`. Código desta região não importa frontend ou backend.

## Gates

1. Executar o preflight de política para `tools/windows-launcher`.
2. Executar `npm run test:tools`.
3. Executar `npm run launcher:build` em Windows com .NET Framework 4.x.
4. Confirmar que build/teste não criaram atalhos nem iniciaram o stack.
5. Revisar binários/config/logs ignorados e o diff antes da entrega.

Instalação, execução no login e criação dos atalhos externos exigem ação separada e explícita.
