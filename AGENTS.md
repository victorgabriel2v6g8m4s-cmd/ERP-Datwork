# ERP Datwork — Regras de Desenvolvimento

Este Project representa o desenvolvimento contínuo do ERP Datwork.

## CONCEITO

* Este é um ERP destinado a ser o maior e mais completo ERP do mercado atual. Ele deve atender todas as empresas desde o menor porte até a escala industrial multinacional.
* Por enquanto o projeto está completamente local e conta apenas com um repositório no github, mas embreve será hospedado em um VPS na Hostinger.
* durante o desenvolvimento deste ERP, vamos criar ferramentas que facilitem o nosso próprio desenvolvimento, como um editor de frontend que permite que editamos a estilização de cada componente da página diretamente pelo navegador, um gerenciador de operações matemáticas onde podemos inserir, visualizar, testar e editar fórmulas matemáticas que o ERP utiliza no processamento, e outras features que acharmos necessárias para a otimização do tempo de desenvolvimento.

## Features

A estrutura vai contar com os seguintes serviços e seus componentes:
* Engenharia de produtos e precificação
* Planejamento de Necessidades
* Chão de Fábrica (MES)
* Controle de Qualidade
* Gestão Comercial
* Controle de estoque
* Gestão de Compras
* Recebimento de Mercadorias
* Gerenciamento de insumos
* Agendamento de serviços e tarefas
* Gestão financeira e contábil
* Contas a Pagar e a Receber
* Gestão Fiscal e Tributária
* Gestão de Ativos Fixos
* DRE
* Dashboards e BI com dados analíticos de ponta
* Inteligência Artificial e Analytics
* Gestão de equipe e departamentos
* Chat integrado
* Planejamento de ação
* PDV 100% personalizável.
* Processamento de Pedidos
* CRM Integrado
* Portal do Cliente/E-commerce
* Folha de Pagamento
* Ponto Eletrônico
* Gestão de Talentos
* Gestão de Fretes
* Rastreamento de Carga
* Segurança e Auditoria (LGPD)
* n8n vinculado ao whatsapp para atender clientes, fazer agendamentos, entrar em contato com a equipe, fazer lembretes, cadastrar e editar itens.

## Arquitetura e manutenção

* Manter o projeto altamente modular, DRY e reutilizável.
* Evitar arquivos grandes e difíceis de entender.
* Preferir criar arquivos adicionais pequenos e especializados a concentrar muitas responsabilidades em um único arquivo.
* Cada responsabilidade deve possuir um ponto central/orquestrador, delegando detalhes para services, hooks, utils, contracts, presenters e componentes menores.
* Antes de criar uma solução nova, verificar se já existe componente, hook, service, utilitário ou padrão reutilizável no projeto.

## Frontend

Utilizar os padrões já estabelecidos:

* `TEXTS` para textos e conteúdo visível ao usuário.
* `APP_CONFIG` para valores operacionais e configuráveis.
* `ERP_THEME` para tokens e estilos semânticos.
* `UI_KEYS` + `data-ui-key` para identidade estável dos elementos da interface e preparação do futuro editor visual.
* Services devem ser a fronteira HTTP dos módulos.
* Componentes visuais e hooks de UI não devem importar `api/client` diretamente.
* Respostas externas devem possuir contratos runtime quando apropriado.
* Reutilizar componentes globais em vez de reimplementar comportamentos equivalentes.

## Backend

* Controllers devem permanecer finos.
* Validação HTTP deve ocorrer em validators/contracts próprios.
* Services devem concentrar regras de negócio.
* Presenters devem definir contratos públicos explícitos.
* Evitar `any`, casts inseguros e confiança direta em payloads recebidos.
* Transações devem ser pequenas e determinísticas.
* Operações externas ou recálculos pesados não devem permanecer dentro de transações quando não forem necessários para atomicidade.

## Logging

* Utilizar `CustomLogger`.
* Criar logs suficientes para localizar rapidamente bugs e falhas.
* Evitar `console.log`, `console.warn` e `console.error`.
* Evitar logging excessivo dentro de loops ou caminhos executados para cada item.

## Segurança

* Segurança é prioridade.
* Validar dados recebidos pelo backend.
* Não confiar no cliente para IDs, enums, números, snapshots ou regras de negócio.
* Utilizar allowlists e contratos explícitos.
* Evitar alterações que ampliem superfície de ataque sem necessidade.

## Performance

* Performance e velocidade do sistema são prioridade.
* Evitar requisições HTTP redundantes.
* Evitar refetch desnecessário após mutations quando a resposta canônica puder atualizar o estado.
* Evitar processamento repetitivo por item em renders.
* Considerar code splitting e lazy loading para páginas/módulos quando apropriado.

## Banco de dados

* Não criar migrations ou alterar schema sem necessidade real.
* Toda migration deve ser validada do zero pelo CI.
* Preservar dados existentes e compatibilidade sempre que possível.

## Git

* Trabalhar na branch de desenvolvimento atual, nunca diretamente em `main` sem autorização explícita.
* Antes de publicar alterações, verificar HEAD e garantir fast-forward.
* Commits devem representar mudanças coerentes.
* Não abrir PR nem fazer merge em `main` sem autorização explícita.

## Qualidade

Para cada módulo refatorado:

* criar ou manter typecheck específico quando fizer sentido;
* adicionar testes para bugs corrigidos e contratos importantes;
* manter o TypeScript global verde;
* validar frontend e backend;
* revisar o diff antes de publicar;
* não esconder warnings importantes simplesmente aumentando limites ou desativando regras.

## Direção arquitetural futura

O ERP está sendo preparado para um editor visual no navegador.

A arquitetura deve permitir futuramente:

`elemento DOM → data-ui-key → texto/tema/configuração → override persistido`

Portanto, ao refatorar páginas, centralizar de forma semântica as superfícies visuais e configuráveis importantes, sem transformar cada pequena classe CSS em configuração global.
