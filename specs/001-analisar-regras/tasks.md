# Tasks: Analisador de Regras Institucionais

**Input**: Design documents from `specs/001-analisar-regras/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/openapi.yaml`, `contracts/types.ts`, `quickstart.md`

**Tests**: Testes automatizados são obrigatórios para regras de negócio, contratos,
integrações externas e fluxos constitucionais. Nessas áreas, a tarefa de teste precede a
implementação correspondente.

**Organization**: Tarefas são agrupadas por história de usuário. Dentro de cada fase, os
subtítulos preservam as áreas técnicas solicitadas. Cada tarefa cita os requisitos cobertos e
os arquivos exatos.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode executar em paralelo porque altera arquivos diferentes e não depende de tarefa
  incompleta na mesma fase.
- **[Story]**: História atendida (`US1`, `US2`, `US3`, `US4`).
- Toda descrição contém caminho de arquivo.

## Phase 1: Preparação do monorepositório

**Purpose**: Criar a raiz e os dois workspaces sem implementar comportamento de história.

### 1. Preparação do monorepositório

- [X] T001 Criar npm workspaces e scripts raiz `dev`, `build`, `test`, `lint` e `typecheck` em `package.json`
- [X] T002 [P] Criar configuração de ignorados para dependências, builds, `.env` e temporários em `.gitignore`
- [X] T003 [P] Criar placeholders sem segredos para backend, origem, limites e rate limit em `.env.example`
- [X] T004 Criar o workspace Angular 22 standalone em `frontend/package.json`, `frontend/angular.json`, `frontend/tsconfig.json` e `frontend/src/`
- [X] T005 Criar o workspace Express/TypeScript em `backend/package.json`, `backend/tsconfig.json`, `backend/src/` e `backend/tests/`
- [X] T006 [P] Configurar lint e formatação compartilhados em `eslint.config.js` e `.prettierignore`
- [X] T007 Verificar instalação e scripts vazios dos dois workspaces por `package-lock.json` e `package.json`

**Checkpoint**: `npm install` funciona na raiz e os dois workspaces são reconhecidos.

---

## Phase 2: Fundação compartilhada

**Purpose**: Configurar contratos, erros, segurança basal e estrutura Angular que bloqueiam
todas as histórias.

**⚠️ CRITICAL**: Nenhuma história começa antes da conclusão desta fase.

### 2. Configuração do backend

- [X] T008 [P] Criar schema testável de variáveis de ambiente em `backend/src/config/env.ts`
- [X] T009 Criar bootstrap sem rotas de negócio em `backend/src/app.ts` e `backend/src/server.ts`
- [X] T010 [P] Criar testes do envelope e mapeamento de erros conhecidos/desconhecidos em `backend/tests/unit/errors/error-middleware.spec.ts`
- [X] T011 Implementar `AppError` e middleware centralizado redigido em `backend/src/errors/app-error.ts` e `backend/src/middlewares/error.middleware.ts`
- [X] T012 [P] Implementar request ID e logger estruturado sem conteúdo documental em `backend/src/middlewares/request-id.middleware.ts` e `backend/src/logging/logger.ts`

### 3. Contrato e schemas

- [X] T013 [P] Copiar e adaptar os tipos aprovados para o pacote compartilhado em `contracts/analysis.ts`
- [X] T014 [P] Criar testes dos schemas de regra, resultado, erros, IDs, enums, campos nulos e totais em `backend/tests/unit/schemas/analysis.schema.spec.ts`
- [X] T015 Implementar schemas Zod e refinamentos semânticos do contrato em `backend/src/schemas/analysis.schema.ts`
- [X] T016 [P] Criar testes do schema de upload para formatos, MIME, extensão, tamanho e arquivo vazio em `backend/tests/unit/schemas/upload.schema.spec.ts`
- [X] T017 Implementar schema e constantes de upload configurável em `backend/src/schemas/upload.schema.ts`

### 12. Segurança basal

- [X] T018 [P] Criar testes de CORS restrito, headers e limite de requisições em `backend/tests/integration/security.middleware.spec.ts`
- [X] T019 Implementar Helmet, CORS por `FRONTEND_ORIGIN` e rate limit configurável em `backend/src/middlewares/security.middleware.ts` e `backend/src/middlewares/rate-limit.middleware.ts`
- [X] T020 [P] Criar teste de redaction que proíbe chave, texto, evidência, prompt e resposta bruta nos logs em `backend/tests/unit/logging/logger.spec.ts`
- [X] T021 Ajustar campos permitidos e redaction do logger conforme T020 em `backend/src/logging/logger.ts`

### 7. Estrutura Angular

- [X] T022 [P] Configurar bootstrap standalone, HttpClient e interceptor funcional em `frontend/src/app/app.config.ts` e `frontend/src/app/core/interceptors/api-error.interceptor.ts`
- [X] T023 Configurar rotas e shells compiláveis para `/upload`, `/resultado`, redirect e fallback em `frontend/src/app/app.routes.ts`, `frontend/src/app/app.component.ts`, `frontend/src/app/features/upload/upload-page.component.ts` e `frontend/src/app/features/result/result-page.component.ts`
- [X] T024 [P] Configurar proxy `/api/**` e scripts de desenvolvimento em `frontend/proxy.conf.json` e `frontend/angular.json`
- [X] T025 Criar store efêmero com signals para arquivo, status, resultado, erro e filtro em `frontend/src/app/core/state/analysis.store.ts`

**Checkpoint**: Backend inicia com middleware basal; frontend abre e redireciona para `/upload`;
contratos compilam nos dois workspaces.

---

## Phase 3: User Story 1 — Enviar e analisar um documento (Priority: P1) 🎯 MVP

**Goal**: Enviar PDF/DOCX/TXT válido, extrair texto, analisar por uma fronteira segura e
receber resultado ou estado sem regras.

**Independent Test**: Enviar fixtures válidas e inválidas; confirmar estados de upload/análise,
resposta fundamentada ou vazia, ausência de persistência e erros seguros.

### 4. Extração de texto — testes primeiro

- [X] T026 [P] [US1] Criar fixtures mínimas válidas, vazias e corrompidas sem conteúdo sensível em `backend/tests/fixtures/documents/`
- [X] T027 [P] [US1] Criar testes de extração TXT para UTF-8, BOM, binário e texto vazio em `backend/tests/unit/extractors/txt.extractor.spec.ts`
- [X] T028 [P] [US1] Criar testes de extração PDF para texto por página, arquivo corrompido e PDF sem camada textual em `backend/tests/unit/extractors/pdf.extractor.spec.ts`
- [X] T029 [P] [US1] Criar testes de extração DOCX para texto, arquivo corrompido e conteúdo sem texto em `backend/tests/unit/extractors/docx.extractor.spec.ts`
- [X] T030 [P] [US1] Implementar extrator TXT estrito e normalização preservando evidência em `backend/src/services/extractors/txt.extractor.ts`
- [X] T031 [P] [US1] Implementar extrator PDF em memória com localização por página em `backend/src/services/extractors/pdf.extractor.ts`
- [X] T032 [P] [US1] Implementar extrator DOCX como texto bruto em `backend/src/services/extractors/docx.extractor.ts`
- [X] T033 [US1] Criar testes do registro de extratores e rejeição de conteúdo ilegível em `backend/tests/unit/services/text-extraction.service.spec.ts`
- [X] T034 [US1] Implementar seleção por tipo e metadados de texto em `backend/src/services/text-extraction.service.ts`

### 5. Integração com Gemini — testes primeiro

- [X] T035 [P] [US1] Definir contrato interno e fake determinístico de `RuleAnalyzer` em `backend/src/adapters/rule-analyzer.ts` e `backend/tests/fakes/fake-rule-analyzer.ts`
- [X] T036 [P] [US1] Criar testes do adapter para JSON válido, enums, nulos e documento sem regras em `backend/tests/unit/adapters/gemini-rule-analyzer.spec.ts`
- [X] T037 [P] [US1] Criar testes de falha para timeout, indisponibilidade, JSON inválido e reparo único em `backend/tests/unit/adapters/gemini-rule-analyzer-errors.spec.ts`
- [X] T038 [P] [US1] Criar testes adversariais para instruções no documento, Unicode invisível e tentativa de revelar segredos em `backend/tests/unit/adapters/gemini-prompt-injection.spec.ts`
- [X] T039 [P] [US1] Criar testes de grounding para evidência vazia ou ausente do texto original em `backend/tests/unit/adapters/evidence-grounding.spec.ts`
- [X] T040 [US1] Implementar prompt delimitado, saída JSON estruturada e modelo configurável em `backend/src/adapters/gemini-rule-analyzer.ts`
- [X] T041 [US1] Implementar timeout com `AbortSignal`, reparo estrutural único e mapeamento de falhas em `backend/src/adapters/gemini-rule-analyzer.ts`
- [X] T042 [US1] Implementar validação Zod e grounding literal de evidências antes do retorno em `backend/src/adapters/gemini-rule-analyzer.ts`

### 6. Endpoint de análise — testes primeiro

- [X] T043 [P] [US1] Criar testes de upload para arquivo ausente, extensão/MIME divergentes, tamanho exato e excesso em `backend/tests/integration/document-upload.spec.ts`
- [X] T044 [P] [US1] Criar testes contratuais do endpoint para sucesso, nenhuma regra e invariantes do OpenAPI em `backend/tests/integration/document-analysis.spec.ts`
- [X] T045 [P] [US1] Criar testes do endpoint para leitura impossível, IA inválida, indisponibilidade e timeout em `backend/tests/integration/document-analysis-errors.spec.ts`
- [X] T046 [US1] Implementar sanitização de nome, assinatura de arquivo e Multer em memória com limites em `backend/src/middlewares/upload.middleware.ts`
- [X] T047 [US1] Implementar orquestração extração → análise → resumo → descarte em `backend/src/services/document-analysis.service.ts`
- [X] T048 [US1] Implementar controller fino e rota `POST /api/documents/analyze` em `backend/src/controllers/document.controller.ts` e `backend/src/routes/document.routes.ts`
- [X] T049 [US1] Registrar rota e ordem final de middlewares no servidor em `backend/src/app.ts`

### 8. Tela de upload — testes primeiro

- [X] T050 [P] [US1] Criar testes do formulário para nenhum arquivo, drag-and-drop, tipos, limite e clique duplicado em `frontend/src/app/features/upload/upload-page.component.spec.ts`
- [X] T051 [P] [US1] Criar testes dos estados acessíveis de envio e análise em `frontend/src/app/features/upload/analysis-progress.component.spec.ts`
- [X] T052 [US1] Implementar área acessível de seleção/arraste e Reactive Form em `frontend/src/app/features/upload/file-upload.component.ts` e `frontend/src/app/features/upload/upload-page.component.ts`
- [X] T053 [P] [US1] Implementar componente de progresso com anúncios de estado em `frontend/src/app/features/upload/analysis-progress.component.ts`
- [X] T054 [US1] Integrar validação preliminar e bloqueio de submissão duplicada ao store em `frontend/src/app/features/upload/upload-page.component.ts`

### 10. Integração frontend-backend — testes primeiro

- [X] T055 [P] [US1] Criar testes HTTP para multipart, resultado, erros tipados e `requestId` em `frontend/src/app/core/services/analysis-api.service.spec.ts`
- [X] T056 [P] [US1] Criar teste do interceptor para envelopes conhecidos e falha desconhecida em `frontend/src/app/core/interceptors/api-error.interceptor.spec.ts`
- [X] T057 [US1] Implementar envio multipart e consumo dos contratos em `frontend/src/app/core/services/analysis-api.service.ts`
- [X] T058 [US1] Conectar API, store e progresso e renderizar total/lista mínima em `/resultado` em `frontend/src/app/features/upload/upload-page.component.ts` e `frontend/src/app/features/result/result-page.component.ts`

**Checkpoint**: US1 funciona ponta a ponta e pode ser demonstrada sem componentes detalhados de
resultado: contrato válido, total e estado final ficam disponíveis no store.

---

## Phase 4: User Story 2 — Examinar regras e evidências (Priority: P2)

**Goal**: Apresentar resumo, todos os campos de regra, ausências explícitas e aviso humano.

**Independent Test**: Carregar resultado conhecido e verificar cada campo, evidência,
localização/nulos, confiança e aviso jurídico sem nova chamada.

### 9. Tela de resultado — testes primeiro

- [X] T059 [P] [US2] Criar testes do resumo para total, revisão obrigatória e zero regras em `frontend/src/app/features/result/result-summary.component.spec.ts`
- [X] T060 [P] [US2] Criar testes do card para evidência, localização, campos nulos, confiança e tipos em `frontend/src/app/features/result/rule-card.component.spec.ts`
- [X] T061 [P] [US2] Criar testes do aviso humano/jurídico e navegação direta sem estado em `frontend/src/app/features/result/result-page.component.spec.ts`
- [X] T062 [P] [US2] Implementar resumo e estado sem regras em `frontend/src/app/features/result/result-summary.component.ts`
- [X] T063 [P] [US2] Implementar card acessível com todos os campos do contrato em `frontend/src/app/features/result/rule-card.component.ts`
- [X] T064 [P] [US2] Implementar aviso reutilizável de revisão humana em `frontend/src/app/shared/components/human-review-notice.component.ts`
- [X] T065 [US2] Implementar página de resultados, lista por IDs estáveis e redirect sem estado em `frontend/src/app/features/result/result-page.component.ts`

**Checkpoint**: US2 exibe cada resultado fundamentado e sinaliza incerteza/ausência sem inventar
dados.

---

## Phase 5: User Story 3 — Filtrar resultados por categoria (Priority: P3)

**Goal**: Filtrar localmente pelos nove tipos e restaurar a lista completa.

**Independent Test**: Selecionar tipos sobre fixture mista e confirmar lista, total filtrado,
total geral e ausência de nova requisição.

### 9. Tela de resultado — filtros, testes primeiro

- [X] T066 [P] [US3] Criar testes do store para nove tipos, todos, zero correspondências e total derivado em `frontend/src/app/core/state/analysis.store.spec.ts`
- [X] T067 [P] [US3] Criar testes de teclado e rótulos do filtro em `frontend/src/app/features/result/rule-filter.component.spec.ts`
- [X] T068 [US3] Implementar filtro e regras derivadas com `computed` no store em `frontend/src/app/core/state/analysis.store.ts`
- [X] T069 [P] [US3] Implementar controle acessível de categoria em `frontend/src/app/features/result/rule-filter.component.ts`
- [X] T070 [US3] Integrar filtro, contagem filtrada e estado vazio à página em `frontend/src/app/features/result/result-page.component.ts`

**Checkpoint**: US3 filtra sem rede ou mutação do resultado original.

---

## Phase 6: User Story 4 — Recuperar-se e analisar outro documento (Priority: P4)

**Goal**: Exibir falhas específicas, permitir retry seguro e limpar o fluxo para outro arquivo.

**Independent Test**: Simular cada erro e confirmar mensagem/ação; após falha ou sucesso,
retornar vazio a `/upload` em até duas ações.

### 8 e 10. Recuperação frontend-backend — testes primeiro

- [X] T071 [P] [US4] Criar testes de UI para arquivo inválido, excesso, leitura, IA temporária e timeout em `frontend/src/app/features/upload/upload-errors.spec.ts`
- [X] T072 [P] [US4] Criar testes do store para retry, limpeza completa e analisar outro documento em `frontend/src/app/core/state/analysis-recovery.spec.ts`
- [X] T073 [P] [US4] Criar teste de ciclo de vida que comprova liberação de buffer/texto em sucesso e falha em `backend/tests/integration/document-disposal.spec.ts`
- [X] T074 [US4] Implementar mensagens e ações de recuperação por código de erro em `frontend/src/app/features/upload/upload-page.component.ts`
- [X] T075 [US4] Implementar retry controlado, reset e ação “analisar outro” no store e resultado em `frontend/src/app/core/state/analysis.store.ts` e `frontend/src/app/features/result/result-page.component.ts`
- [X] T076 [US4] Garantir descarte de referências temporárias em todos os caminhos em `backend/src/services/document-analysis.service.ts`

**Checkpoint**: US4 fecha todos os estados de falha sem persistir documento ou prender o usuário.

---

## Requirement Traceability

| Requirement IDs | Story | Primary Task IDs | Verification Task IDs |
|-----------------|-------|------------------|-----------------------|
| FR-001, FR-005, FR-006, FR-021, FR-029, FR-030 | US1 | T050-T054, T058 | T050-T051, T077-T078 |
| FR-002-FR-004 | US1 | T016-T017, T043, T046 | T016, T043 |
| FR-007 | US1 | T026-T034, T047 | T027-T029, T033, T045 |
| FR-008, FR-013-FR-016, FR-018 | US1/US2 | T035-T042, T047, T058, T062-T065 | T014, T036, T039, T044, T059-T061 |
| FR-009-FR-012, FR-017 | US1/US2 | T038-T042, T063-T065 | T038-T039, T060-T061, T082 |
| FR-019 | US3 | T068-T070 | T066-T067, T077 |
| FR-020 | US2 | T062, T064-T065 | T059, T061, T078 |
| FR-022 | US1/US4 | T041, T045, T074-T076 | T037, T045, T071-T073 |
| FR-023 | US4 | T074-T075 | T071-T072, T077 |
| FR-024 | US1 | T001-T025, T048-T049 | T044, T077 |
| FR-025-FR-026 | US1/US4 | T046-T049, T076 | T073, T081-T083 |
| FR-027-FR-028 | US1/US4 | T010-T012, T020-T021, T041, T074 | T010, T020, T045, T071, T081 |

---

## Phase 7: Qualidade, segurança e documentação

**Purpose**: Validar requisitos transversais depois que as histórias funcionarem.

### 11. Testes

- [X] T077 [P] Criar teste básico do fluxo Angular upload → progresso → resultado → filtro → reinício em `frontend/src/app/app-flow.spec.ts`
- [X] T078 [P] Criar testes responsivos e de teclado para 320, 768 e 1440 px em `frontend/src/app/accessibility-flow.spec.ts`
- [X] T079 [P] Criar verificação de compatibilidade entre schema Zod, tipos e exemplos OpenAPI em `backend/tests/contract/analysis-contract.spec.ts`
- [X] T080 Executar e corrigir somente falhas do escopo em `frontend/`, `backend/`, `contracts/` via `npm test`, `npm run typecheck`, `npm run lint` e `npm run build`

### 12. Segurança

- [X] T081 [P] Criar teste de regressão que procura segredos e conteúdo único nos logs de sucesso/falha em `backend/tests/integration/log-privacy.spec.ts`
- [X] T082 [P] Criar teste de abuso combinado para rate limit, arquivo grande e prompt injection em `backend/tests/integration/security-regression.spec.ts`
- [X] T083 Revisar e ajustar CORS, headers, rate limit, redaction e não persistência em `backend/src/app.ts`, `backend/src/middlewares/security.middleware.ts`, `backend/src/logging/logger.ts` e `backend/src/services/document-analysis.service.ts`

### 13. Documentação

- [X] T084 [P] Documentar instalação, scripts, arquitetura, portas, proxy e limites do MVP em `README.md`
- [X] T085 [P] Documentar todas as variáveis sem valores reais e política de segredos em `.env.example`
- [X] T086 [P] Sincronizar exemplos finais e códigos de erro no contrato em `specs/001-analisar-regras/contracts/openapi.yaml`
- [X] T087 Validar todos os cenários executáveis e registrar resultados em `specs/001-analisar-regras/quickstart.md`
- [X] T088 Registrar matriz final requisito → história → tarefa → código → teste em `specs/001-analisar-regras/traceability.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: início imediato.
- **Phase 2 — Foundation**: depende de Phase 1 e bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da fundação; entrega o primeiro incremento vertical.
- **US2 (Phase 4)**: depende do resultado produzido pela US1.
- **US3 (Phase 5)**: depende da lista e página da US2.
- **US4 (Phase 6)**: depende dos estados e ações criados em US1-US3.
- **Phase 7 — Quality**: depende das histórias selecionadas para entrega.

### User Story Dependency Graph

```text
Setup → Foundation → US1 → US2 → US3
                         └──────→ US4
US2 ────────────────────────────→ US4
US3 ────────────────────────────→ US4
US1 + US2 + US3 + US4 → Quality/Security/Documentation
```

### Within Each User Story

- Testes de regra/integração são escritos e falham antes da implementação correspondente.
- Schemas e contratos precedem adapters e endpoints.
- Extratores precedem o serviço orquestrador.
- Adapter Gemini precede o endpoint real.
- API service e store precedem integração das páginas.
- Componentes independentes marcados `[P]` podem avançar juntos após seus testes.

## Parallel Opportunities

### Foundation

Após T009, executar em paralelo:

```text
T010/T011 erros
T013 contratos
T014/T015 schema de análise
T016/T017 schema de upload
T018-T021 segurança e logs
T022-T025 estrutura Angular
```

### US1

```text
T027/T030 TXT
T028/T031 PDF
T029/T032 DOCX
T036-T039 testes Gemini
T043-T045 testes endpoint
T050-T051 testes upload Angular
T055-T056 testes HTTP/interceptor
```

As implementações que fazem os testes passarem começam somente após o respectivo teste.

### US2-US4

```text
US2: T059/T062 resumo, T060/T063 card, T061/T064 aviso
US3: T066 store e T067 filtro; depois T068 e T069
US4: T071, T072 e T073 em paralelo; depois T074-T076
```

## Implementation Strategy

### MVP First

1. Completar Phase 1 e Phase 2.
2. Completar US1, incluindo seus testes.
3. Validar upload, extração, Gemini fake/real controlado e endpoint.
4. Demonstrar o incremento antes de ampliar apresentação.

### Incremental Delivery

1. **US1**: documento válido ou erro seguro produz análise contratual.
2. **US2**: usuário examina regra, evidência, nulos, confiança e aviso.
3. **US3**: usuário filtra localmente.
4. **US4**: usuário se recupera e reinicia.
5. **Quality**: validações cruzadas, segurança, documentação e rastreabilidade.

### Explicit MVP Exclusions

Não criar tarefas para banco de dados, autenticação, OCR, exportação, filas, Docker,
microsserviços ou armazenamento permanente.

## Notes

- `[P]` significa arquivos diferentes e ausência de dependência incompleta.
- IDs US/FR/SC devem aparecer em nomes ou descrições de testes quando útil à rastreabilidade.
- Fixtures devem ser mínimas, sintéticas e sem conteúdo institucional sensível.
- Cada tarefa deve resultar em mudança verificável e pode ser commitada isoladamente.
