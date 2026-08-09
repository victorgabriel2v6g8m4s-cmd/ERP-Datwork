## Resumo

Descreva objetivamente o que esta alteração faz e por quê.

## Tipo de mudança

- [ ] Feature
- [ ] Correção de bug
- [ ] Refatoração
- [ ] Performance
- [ ] Segurança
- [ ] Infraestrutura / CI
- [ ] Documentação

## Validação realizada

- [ ] Frontend: `npm test`
- [ ] Frontend: `npm run build`
- [ ] Backend: migrations em banco temporário
- [ ] Backend: `npm test`
- [ ] Fluxo alterado foi testado manualmente quando aplicável

## Checklist de engenharia

- [ ] Mantive o escopo da tarefa isolado.
- [ ] Evitei duplicação e reutilizei módulos existentes quando possível.
- [ ] Páginas/controllers continuam como orquestradores e não acumularam regras de negócio.
- [ ] Não introduzi `console.*` em código refatorado; usei `CustomLogger`.
- [ ] Logs novos são técnicos, úteis e não expõem dados sensíveis.
- [ ] Validei dados externos nas fronteiras adequadas.
- [ ] Revisei impacto de segurança.
- [ ] Revisei impacto de performance.
- [ ] Estilos novos seguem componentes/tokens/padrões reutilizáveis.
- [ ] Adicionei ou atualizei testes quando aplicável.
- [ ] CI está verde ou qualquer exceção está documentada abaixo.

## Riscos / observações

Informe regressões possíveis, débitos técnicos conhecidos ou decisões que merecem atenção futura.
