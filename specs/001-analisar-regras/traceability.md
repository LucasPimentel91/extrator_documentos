# Traceability: Analisador de Regras Institucionais

Esta matriz liga requisitos e histórias às tarefas, ao código executável e aos testes. Os
caminhos são relativos à raiz do repositório.

| Requisitos | História | Tarefas | Código principal | Verificação |
|------------|----------|---------|------------------|-------------|
| FR-001, FR-005, FR-021, FR-029, FR-030 | US1, US4 | T050–T058, T071–T075, T077–T078 | `frontend/src/app/features/upload/`, `analysis.store.ts` | `upload-page.component.spec.ts`, `upload-errors.spec.ts`, `app-flow.spec.ts`, `accessibility-flow.spec.ts` |
| FR-002–FR-004 | US1 | T016–T017, T043, T046 | `upload.schema.ts`, `upload.middleware.ts` | `upload.schema.spec.ts`, `document-upload.spec.ts` |
| FR-006–FR-007 | US1, US4 | T026–T034, T045, T051, T071, T074 | `services/extractors/`, `text-extraction.service.ts`, upload UI | extractor suites, `document-analysis-errors.spec.ts`, UI error tests |
| FR-008, FR-013–FR-018 | US1, US2 | T035–T042, T047, T059–T065 | `gemini-rule-analyzer.ts`, `analysis.schema.ts`, result components | adapter/schema suites, result component suites, `analysis-contract.spec.ts` |
| FR-009–FR-012 | US1 | T038–T042, T082–T083 | Gemini adapter, upload/security middleware | `gemini-prompt-injection.spec.ts`, `evidence-grounding.spec.ts`, `security-regression.spec.ts` |
| FR-019 | US3 | T066–T070, T077 | `analysis.store.ts`, `rule-filter.component.ts`, result page | store/filter tests, `app-flow.spec.ts` |
| FR-020 | US2 | T059, T061–T065, T078 | summary and human-review notice | summary/page/accessibility tests |
| FR-022 | US1, US4 | T037, T041, T045, T071–T076 | Gemini timeout, recovery UI/store, disposal | adapter/error/recovery/disposal tests |
| FR-023 | US4 | T072, T075, T077 | store reset and result action | `analysis-recovery.spec.ts`, result page and app flow tests |
| FR-024 | US1–US4 | T001–T076 | public routes and API without auth middleware | app flow and endpoint integration suites |
| FR-025–FR-026 | US1, US4 | T046–T049, T073, T076, T081–T083 | in-memory upload and `DocumentAnalysisService` cleanup | `document-disposal.spec.ts`, `log-privacy.spec.ts`, security regression |
| FR-027–FR-028 | US1, US4 | T010–T012, T020–T021, T045, T071, T081–T083 | centralized errors, request IDs and allowlisted logger | error/logger/privacy/integration tests |

## Success criteria

| Critério | Evidência |
|----------|-----------|
| SC-001, SC-008, SC-014 | `app-flow.spec.ts`, recovery tests |
| SC-002 | upload schema and endpoint tests |
| SC-003–SC-005 | grounding, schema and result presentation tests |
| SC-006–SC-007 | store and filter component tests |
| SC-009 | `accessibility-flow.spec.ts` at 320, 768 and 1440 px |
| SC-010–SC-011 | Gemini failure, endpoint error and UI recovery tests |
| SC-012 | `document-disposal.spec.ts` |
| SC-013 | summary, result page and accessibility tests |

## Quality gates

- Constitution: `.specify/memory/constitution.md`
- API contract: `specs/001-analisar-regras/contracts/openapi.yaml`
- Runtime schemas: `backend/src/schemas/`
- Shared TypeScript contract: `contracts/analysis.ts`
- Commands: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`
