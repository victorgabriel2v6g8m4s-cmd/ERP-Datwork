# ADR 0007 — Inicializador Windows local

Status: **Proposto — implementação local parcial; não é decisão de operação produtiva**.

## Contexto

Durante o desenvolvimento, o ERP precisa iniciar frontend e backend juntos e oferecer visibilidade simples do estado sem adicionar um serviço Windows ou um canal administrativo HTTP.

## Decisão proposta

Usar um executável .NET Framework local com `NotifyIcon`, mutex de instância, supervisor de uma árvore própria `node.exe tools/dev-stack.mjs`, probes loopback e atalhos reversíveis no Startup/Desktop do usuário atual. O launcher não aceita comandos livres, não usa shell e não representa deploy ou readiness SaaS.

## Consequências

Positivas: ciclo de vida explícito, estados visíveis, escopo de processo limitado e instalação sem elevação. Negativas: dependência do Windows/.NET/Node local, ausência de assinatura/distribuição, named pipe sem ACL SID portátil e nenhum controle de recursos do laboratório visual.

## Alternativas

- Serviço Windows ou tarefa agendada: adiado; ampliaria privilégio e escopo antes da necessidade.
- Electron/Tauri: rejeitado nesta etapa por peso e supply chain adicionais.
- Usar o launcher como supervisor de VPS: rejeitado; a operação Linux segue [`vps-operations.md`](../vps-operations.md).

## Evidência e próximos gates

Implementação parcial em [`tools/windows-launcher`](../../../tools/windows-launcher), stack em [`tools/dev-stack.mjs`](../../../tools/dev-stack.mjs) e testes em [`tests/windows-launcher.test.mjs`](../../../tests/windows-launcher.test.mjs). Antes de distribuição/produção: decisão humana, binário assinado, atualização/rollback, threat model de host, telemetria sem PII, política de suporte e validação do ambiente-alvo. Esta ADR não é aceite sem decisão explícita.
