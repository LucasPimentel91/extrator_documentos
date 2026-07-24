# Implementation Plan: Analisador de Regras Institucionais

**Branch**: `001-analisar-regras` | **Date**: 2026-07-23 | **Spec**:
[spec.md](spec.md)

**Input**: Feature specification from `specs/001-analisar-regras/spec.md`

## Summary

Implementar um monorepositório npm com duas aplicações claramente separadas: um frontend
Angular 22 para upload, progresso e exploração acessível dos resultados; e um backend
Express 5 em Node.js 24 LTS que valida o arquivo em memória, extrai texto, chama o Gemini por
uma interface substituível, valida a saída estruturada e devolve um contrato REST estável.
O MVP não usa banco, autenticação, filas, microsserviços, Docker ou persistência documental.

## Technical Context

**Language/Version**: TypeScript 6.0; Angular 22; Node.js 24 LTS

**Primary Dependencies**: Angular Router, Reactive Forms, HttpClient e signals; Express,
Multer, Zod, SDK oficial `@google/genai`, `pdf-parse`, `mammoth`, Helmet, CORS e rate limiter

**Storage**: N/A; arquivo, texto e resultado existem apenas em memória durante a requisição

**Testing**: Ferramenta padrão do Angular (Vitest), TestBed e ComponentFixture; Vitest e
Supertest no backend, com adapter Gemini substituído por fake

**Target Platform**: Navegadores suportados pelo Angular 22; servidor Node.js 24 LTS em Linux

**Project Type**: Aplicação web em monorepositório npm com `frontend/` e `backend/`

**Performance Goals**: validação local percebida em até 1 segundo; estado de processamento
visível durante toda operação; timeout total da análise em 120 segundos

**Constraints**: PDF/DOCX/TXT; limite configurável; um documento por requisição; upload em
memória; nenhuma persistência; resposta sempre validada; conteúdo documental não confiável

**Scale/Scope**: MVP sem autenticação, processamento síncrono, uma instância pode atender
requisições concorrentes dentro dos limites de memória e rate limit configurados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Repository boundaries — PASS**: raiz com npm workspaces e aplicações independentes em
  `frontend/` e `backend/`; único contrato compartilhado é documentado em `contracts/`.
- **Required stack — PASS**: Angular/TypeScript com standalone components e Reactive Forms;
  Node.js/TypeScript com API REST.
- **Trust boundaries — PASS**: upload, credenciais, extração, Gemini e validação ficam no
  backend. O prompt delimita o documento como dados e ignora instruções nele contidas.
- **Input/output contracts — PASS**: OpenAPI, tipos TypeScript e schemas de runtime definem
  formatos, limite, campos anuláveis, evidência obrigatória e erros.
- **User protection — PASS**: rotas e componentes incluem teclado, semântica, responsividade
  e aviso de revisão humana/jurídica junto aos resultados.
- **Operations and data — PASS**: buffer apenas em memória, referências descartadas ao fim da
  requisição, timeout de 120 segundos, logs redigidos e erros centralizados.
- **Verification and traceability — PASS**: artefatos preservam IDs US/FR/SC e a estratégia de
  testes cobre regras, integrações, upload, prompt injection e falhas.
- **Simplicity — PASS**: estado por services/signals, requisição síncrona e adapter único; sem
  banco, fila, autenticação, Docker ou abstrações sem uso comprovado.

**Post-design re-check**: PASS. `data-model.md`, `contracts/` e `quickstart.md` mantêm todos os
portões sem exceções.

## Project Structure

### Documentation (this feature)

```text
specs/001-analisar-regras/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi.yaml
│   └── types.ts
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
.
├── package.json
├── package-lock.json
├── .env.example
├── README.md
├── contracts/
│   └── analysis.ts
├── frontend/
│   ├── package.json
│   ├── proxy.conf.json
│   └── src/
│       ├── app/
│       │   ├── app.config.ts
│       │   ├── app.routes.ts
│       │   ├── core/
│       │   │   ├── interceptors/api-error.interceptor.ts
│       │   │   ├── services/analysis-api.service.ts
│       │   │   └── state/analysis.store.ts
│       │   ├── features/
│       │   │   ├── upload/
│       │   │   │   ├── upload-page.component.ts
│       │   │   │   ├── file-upload.component.ts
│       │   │   │   └── analysis-progress.component.ts
│       │   │   └── result/
│       │   │       ├── result-page.component.ts
│       │   │       ├── result-summary.component.ts
│       │   │       ├── rule-filter.component.ts
│       │   │       └── rule-card.component.ts
│       │   └── shared/
│       │       └── components/human-review-notice.component.ts
│       └── styles.css
└── backend/
    ├── package.json
    ├── src/
    │   ├── app.ts
    │   ├── server.ts
    │   ├── config/env.ts
    │   ├── routes/document.routes.ts
    │   ├── controllers/document.controller.ts
    │   ├── services/document-analysis.service.ts
    │   ├── services/text-extraction.service.ts
    │   ├── services/extractors/
    │   │   ├── pdf.extractor.ts
    │   │   ├── docx.extractor.ts
    │   │   └── txt.extractor.ts
    │   ├── adapters/rule-analyzer.ts
    │   ├── adapters/gemini-rule-analyzer.ts
    │   ├── schemas/analysis.schema.ts
    │   ├── schemas/upload.schema.ts
    │   ├── middlewares/upload.middleware.ts
    │   ├── middlewares/error.middleware.ts
    │   ├── middlewares/request-id.middleware.ts
    │   ├── middlewares/rate-limit.middleware.ts
    │   ├── errors/app-error.ts
    │   └── logging/logger.ts
    └── tests/
        ├── unit/
        ├── integration/
        └── fixtures/
```

**Structure Decision**: npm workspaces coordenam scripts e instalação, mas cada aplicação
possui configuração, dependências e testes próprios. `contracts/analysis.ts` contém somente
tipos estáveis de fronteira; o backend mantém seus schemas Zod como fonte de validação em
runtime e verifica compatibilidade com esse contrato.

## Architectural Decisions

### 1. Monorepositório npm sem framework adicional

O `package.json` raiz declara workspaces `frontend` e `backend` e scripts `dev`, `build`,
`test`, `lint` e `typecheck`. `npm run dev` executa os dois processos simultaneamente com uma
ferramenta mínima de orquestração. Isso atende ao fluxo solicitado sem introduzir Nx, Turborepo
ou outra camada de build no MVP.

### 2. Frontend orientado a rotas e estado efêmero

`/upload` contém formulário reativo, drag-and-drop, validação preliminar e progresso.
`/resultado` lê o resultado do `AnalysisStore`; acesso direto sem resultado redireciona para
`/upload`. O store usa signals para estado e valores derivados, enquanto
`AnalysisApiService` concentra HTTP. O interceptor converte erros do contrato em mensagens de
interface, preservando `requestId` para suporte.

### 3. Pipeline síncrono no backend

`POST /api/documents/analyze` executa: rate limit → Multer em memória → validação de extensão,
MIME, assinatura/conteúdo e tamanho → sanitização do nome → extração → análise → validação
Zod → mapeamento da resposta. O controller apenas traduz HTTP; orquestração vive no service;
extratores e provedor de IA ficam atrás de interfaces.

### 4. Fronteira `RuleAnalyzer`

```ts
export interface RuleAnalyzer {
  analyze(input: {
    text: string;
    signal: AbortSignal;
  }): Promise<{ rules: ExtractedRule[] }>;
}
```

`GeminiRuleAnalyzer` é a implementação de produção. Testes e futuros provedores implementam a
mesma interface sem afetar controller, extração ou regras de validação.

### 5. Saída estruturada com validação e reparo limitado

O Gemini recebe schema de saída compatível com o contrato e `application/json`. A resposta é
validada por Zod e cada evidência normalizada deve existir no texto extraído. Em falha
exclusivamente estrutural, o adapter pode realizar uma única
tentativa de reparo pedindo ao modelo que reconforme o JSON ao mesmo schema, sem acrescentar
regras ou evidências. Nova falha resulta em `AI_INVALID_RESPONSE`; nunca se devolve JSON
parcial ou não validado.

### 6. Isolamento contra prompt injection

As instruções fixas declaram que o documento é conteúdo não confiável delimitado, que comandos
dentro dele devem ser ignorados e que só regras apoiadas por evidência literal podem sair.
Documento não é concatenado como instrução de sistema. Schemas, allowlists de enum, evidência
não vazia e testes adversariais formam uma segunda barreira; não se confia apenas no prompt.

### 7. Segurança e observabilidade

Helmet fornece headers, CORS aceita somente `FRONTEND_ORIGIN`, rate limit é configurável e o
nome do arquivo é reduzido a basename segura para exibição. Logs estruturados incluem
`requestId`, duração, tipo, tamanho, caracteres, quantidade de regras e código de erro, nunca
buffer, texto, evidência, prompt, resposta bruta ou chave. Um `AbortController` encerra Gemini
no timeout.

### 8. Execução e produção

Desenvolvimento usa portas distintas e proxy Angular `/api` para o backend. Produção pode
servir o build Angular pelo Express somente como decisão de empacotamento, preservando a API
e os módulos separados. Essa opção não altera o MVP nem adiciona infraestrutura.

## Error Strategy

Todas as falhas usam:

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "O arquivo excede o limite permitido.",
    "requestId": "uuid"
  }
}
```

| Status | Códigos | Comportamento |
|--------|---------|---------------|
| 400 | `FILE_REQUIRED`, `INVALID_FILE_TYPE`, `EMPTY_FILE` | Corrigir/substituir arquivo |
| 413 | `FILE_TOO_LARGE` | Exibir limite vigente |
| 422 | `DOCUMENT_UNREADABLE` | Selecionar outro documento |
| 429 | `RATE_LIMITED` | Aguardar e tentar novamente |
| 502 | `AI_INVALID_RESPONSE` | Erro temporário; nenhuma saída parcial |
| 503 | `AI_UNAVAILABLE` | Erro temporário e nova tentativa |
| 504 | `AI_TIMEOUT` | Operação cancelada após 120 segundos |
| 500 | `INTERNAL_ERROR` | Mensagem neutra com `requestId` |

Erros conhecidos são instâncias de `AppError`; o middleware central redige detalhes. Erros
desconhecidos são registrados sem conteúdo sensível e retornam `INTERNAL_ERROR`.

## Test Strategy

- **Frontend unitário**: validação de seleção/drag-and-drop, estados do formulário, store,
  filtros, interceptor, redirecionamento sem resultado, aviso humano e acessibilidade básica.
- **Frontend fluxo**: upload válido → progresso → resultado → filtro → analisar outro, com
  `HttpClient` simulado; falhas de arquivo, leitura, timeout e serviço também são cobertas.
- **Backend unitário**: extratores PDF/DOCX/TXT com fixtures mínimas não sensíveis; validação
  de extensão/MIME/assinatura/tamanho; sanitização; schemas; deduplicação e invariantes.
- **Adapter**: fake de transporte Gemini cobre sucesso, timeout, indisponibilidade, JSON
  inválido, reparo único, enum inválido, evidência vazia e prompt injection documental.
- **Integração REST**: Supertest exercita multipart, resposta completa, documento sem regras,
  formatos inválidos, limite, leitura impossível, rate limit e erros de IA.
- **Contrato**: resposta de integração é validada contra o schema Zod e o OpenAPI; tipos
  compartilhados passam por typecheck nos dois workspaces.
- **Privacidade**: logger de teste comprova que chave, buffer, texto, prompt e resposta bruta
  não aparecem em logs nos caminhos de sucesso e falha.

## Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| PDFs escaneados/complexos não produzem texto | Falso estado sem regras | Detectar texto vazio e retornar erro; OCR fora do MVP |
| MIME fornecido pelo cliente é falso | Upload malicioso | Cruzar extensão, MIME e assinatura/conteúdo |
| Buffer em memória sob concorrência | Exaustão de memória | Limite baixo/configurável, rate limit e um arquivo por request |
| Resposta IA válida no JSON, mas sem fundamento | Regra inventada | Evidência obrigatória, prompt estrito, confiança/revisão e testes de referência |
| Prompt injection dentro do documento | Desvio da análise | Separação de papéis, delimitação, schema/allowlist e testes adversariais |
| Reparo de JSON introduz conteúdo | Resultado não confiável | Uma tentativa estrutural; revalidar tudo; falhar se evidência mudar/sumir |
| Timeout HTTP não cancela trabalho externo | Recursos presos | Propagar `AbortSignal` até o SDK e observar cancelamento em teste |
| Estado de resultado perdido ao recarregar | Retorno inesperado | Guard/redirecionamento claro; persistência deliberadamente fora do MVP |

## Incremental Implementation Plan

1. **Fundação**: workspaces, scripts raiz, configuração de ambiente, lint/typecheck/test e
   esqueletos Angular/Express.
2. **Contratos e segurança basal**: tipos compartilhados, schemas Zod, erros, request ID,
   logger redigido, Helmet, CORS e rate limit.
3. **Upload e extração**: multipart em memória, validações e extratores com testes unitários.
4. **Análise isolada**: `RuleAnalyzer`, adapter Gemini, schema estruturado, timeout, reparo
   limitado e suíte adversarial.
5. **Endpoint vertical**: service/controller/route e testes de integração de todos os estados.
6. **Fluxo Angular P1**: `/upload`, formulário, progresso, API service, interceptor e erros.
7. **Resultados P2/P3**: `/resultado`, resumo, cards, filtros, aviso e guard de navegação.
8. **Recuperação P4 e qualidade**: analisar outro, responsividade, teclado, testes de fluxo,
   privacidade de logs e validação do quickstart.

## Complexity Tracking

Nenhuma violação constitucional ou complexidade excepcional foi identificada.
