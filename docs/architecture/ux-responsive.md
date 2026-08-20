# UX responsiva e acessível

Status: **direção proposta** com fundação parcial no frontend.

## Objetivo

Permitir que operador iniciante conclua tarefas frequentes rapidamente e que usuário experiente use atalhos/ações em massa, sem ocultar segurança, contexto da empresa ou estado de sincronização.

## Shell alvo

| Desktop | Mobile |
| --- | --- |
| sidebar recolhível + topbar contextual | navegação inferior com até 5 destinos + menu “Mais” |
| conteúdo com largura fluida/densidade configurável | uma coluna, ação primária sticky/FAB quando segura |
| tabela com colunas, seleção e painel lateral | cards/resumo + detalhe fullscreen/sheet |
| atalhos de teclado e command palette | busca e ações recentes acessíveis por toque |

Contexto de organização, ambiente/offline, usuário e sincronização deve ser visível sem dominar a tela.

## Padrão de tela

```text
PageHeader: localização + título + ação primária
ContextBar: empresa, filtros ativos e estado
Toolbar: busca, filtros, ordenação, ações em massa
Content: table/card list/form
States: loading localizado, vazio útil, erro recuperável
Feedback: toast + estado persistente quando necessário
```

## Fluxos ERP

- Cadastro longo: seções ou wizard com resumo, draft e erros por campo/etapa.
- Operação repetitiva (PDV/estoque): menos toques, foco previsível, scanner/teclado e confirmação apenas proporcional ao risco.
- Financeiro/fiscal: valores alinhados/tabulares, moeda/unidade claras, preview e confirmação reforçada.
- Destrutivo/massa: escopo/quantidade explícitos, autenticação recente quando sensível e trilha de auditoria.
- Rede instável: diferenciar offline, pendente, sincronizando, confirmado e conflito; não prometer offline write antes de protocolo próprio.

## Sistema visual recomendado

Evoluir a base atual indigo/slate para tokens semânticos neutros: fundo claro de alto contraste, superfície branca, texto grafite, primária azul/índigo, sucesso esmeralda, atenção âmbar e perigo rosa/vermelho. Tipografia alvo: família sans legível com numerais tabulares; fonte exata depende de licença/bundle e aprovação. Tema por tenant não pode quebrar contraste.

## Gate de UX

- tarefa principal clara, sem clique desnecessário;
- equivalência mobile/desktop e alvo de toque adequado;
- teclado/foco/screen reader/contraste verificados;
- cor acompanhada de texto/ícone;
- loading/vazio/erro/sucesso e duplo envio cobertos;
- tabela responsiva, input preservado e erro orientado ao próximo passo;
- métricas de tarefa e feedback qualitativo definidos antes de redesenho amplo.
