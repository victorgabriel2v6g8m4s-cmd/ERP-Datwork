# ADR 0001 — Monólito modular

Status: **proposta**.

## Contexto

O produto tem muitos domínios, mas equipe, carga, limites operacionais e necessidade de deploy independente ainda não foram medidos. Microserviços antecipariam rede, consistência distribuída e operação.

## Decisão

Manter frontend e backend implantáveis simples, com backend organizado por bounded context, APIs públicas internas, repositories/adapters e outbox. Extrair serviço somente por necessidade comprovada de escala, isolamento, tecnologia ou ownership.

## Consequências

Transações e desenvolvimento permanecem simples; boundaries e testes devem impedir monólito acoplado. Extração futura exige contrato/evento estável.

## Alternativas

Microserviços desde já (rejeitado por complexidade prematura) ou continuar por camadas globais (rejeitado por acoplamento crescente).
