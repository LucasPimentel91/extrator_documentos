# Research: Analisador de Regras Institucionais

**Date**: 2026-07-23

All technical unknowns are resolved. Sources are official documentation or primary project
documentation consulted for this plan.

## Runtime and Workspace

**Decision**: Angular 22 with TypeScript 6 and Node.js 24 LTS in npm workspaces.

**Rationale**: Angular 22 is active and supports Node 24.15+ and TypeScript 6. Node 24 is LTS;
Node 26 is still Current on the planning date. One LTS runtime serves both workspaces.

**Alternatives considered**: Node 26 (not LTS yet); Angular 20/21 (supported, not active);
Nx/Turborepo (unnecessary for two applications).

**Sources**: https://angular.dev/reference/releases,
https://angular.dev/reference/versions,
https://nodejs.org/en/about/previous-releases

## Angular Application Model

**Decision**: Standalone bootstrap/components with explicit imports; `provideRouter` with
eager `/upload`, lazy `/resultado`, and redirects to `/upload`. Root service state uses private
writable signals and readonly/computed signals.

**Rationale**: Angular recommends standalone for new code. Upload is the landing page; results
are not needed initially. Signals provide framework-native state without an external store.
Direct result navigation without in-memory state redirects with an explanation.

**Alternatives considered**: NgModules (legacy); both routes eager (valid, larger initial
bundle); component-local state (lost between routes); external store/persistence (premature).

**Sources**: https://angular.dev/guide/components/importing,
https://angular.dev/guide/ngmodules/overview,
https://angular.dev/guide/routing,
https://angular.dev/best-practices/performance/lazy-loaded-routes,
https://angular.dev/guide/signals

## Angular Forms, HTTP and Testing

**Decision**: Typed Reactive Forms; `HttpClient` behind an API service; functional interceptor
via `provideHttpClient(withInterceptors(...))`; `FormData`; explicit indeterminate “uploading”
and “analyzing” states. Proxy `/api/**` in development. Keep Angular CLI's Vitest/jsdom,
TestBed, ComponentFixture and HTTP test utilities.

**Rationale**: Reactive Forms have explicit, synchronous and testable state. Functional
interceptors have predictable ordering. The requirement does not demand byte percentage, and
Angular's fetch backend does not emit upload progress. Relative proxy URLs avoid environment
coupling.

**Alternatives considered**: Template-driven forms; XHR only for byte progress; absolute dev
URLs; Karma/browser mode without a demonstrated need.

**Sources**: https://angular.dev/guide/forms/reactive-forms,
https://angular.dev/guide/http/setup,
https://angular.dev/guide/http/interceptors,
https://angular.dev/tools/cli/serve,
https://angular.dev/guide/testing,
https://angular.dev/guide/http/testing

## Express Layers and Errors

**Decision**: Express 5 with routes → controllers → services, adapters at external boundaries,
and centralized error middleware registered last.

**Rationale**: Express 5 forwards rejected async handlers to the error middleware. Thin
controllers and services/adapters keep behavior testable. Production never exposes stacks.

**Alternatives considered**: Nest or Fastify; rejected because the requested Express stack and
MVP simplicity do not justify another application model.

**Sources**: https://expressjs.com/en/guide/error-handling/,
https://expressjs.com/en/advanced/best-practice-performance/

## In-memory Upload

**Decision**: Multer `single("file")` only on the analyze route, memory storage, `fileSize`,
`files: 1`, and restrictive part/field limits. Treat `fileFilter` as preliminary; cross-check
sanitized extension, declared MIME, and file signature/content afterward.

**Rationale**: Memory storage honors non-persistence but risks RAM exhaustion, so file/request
limits are mandatory. Client name and MIME are not authoritative.

**Alternatives considered**: Global Multer middleware (larger attack surface); disk storage
(cleanup and retention risk).

**Source**: https://github.com/expressjs/multer

## Text Extraction

**Decision**: A `DocumentTextExtractor` registry selects `pdf-parse` v2 for PDF,
`mammoth.extractRawText({buffer})` for DOCX, or strict UTF-8 decoding for TXT. Reject empty,
binary, corrupt, protected, or image-only input; OCR remains out of scope.

**Rationale**: Raw text avoids rendering untrusted HTML. Per-type strategies are small and
testable while preserving page metadata where available.

**Alternatives considered**: `pdfjs-dist` directly (more control and code); DOCX-to-HTML
(unneeded); OCR (outside MVP).

**Sources**: https://www.npmjs.com/package/pdf-parse,
https://github.com/mwilliamson/mammoth.js/

## Zod and Contracts

**Decision**: Canonical Zod schemas for environment, analyzer output, and HTTP response;
`safeParse` at boundaries plus semantic refinements for evidence, IDs, totals, and review
flags. Maintain equivalent Gemini JSON Schema, OpenAPI, and TypeScript contracts.

**Rationale**: Structured output constrains shape but does not guarantee semantic truth.
Compile-time types do not validate external data.

**Alternatives considered**: TypeScript-only validation; trusting provider schema.

**Sources**: https://zod.dev/,
https://ai.google.dev/gemini-api/docs/structured-output

## Gemini Adapter

**Decision**: Official `@google/genai` client inside `GeminiRuleAnalyzer`; server-only key,
configurable model, system instruction, structured JSON, low temperature, and 120-second
timeout propagated with `AbortSignal`. Allow one structure-only repair, then fail closed.

**Rationale**: The adapter enables substitution and deterministic fakes. Cancellation bounds
resources. Limited repair handles format drift without making partial output trustworthy.

**Alternatives considered**: SDK calls in controllers; unbounded retries; prose parsing;
returning partially valid rules.

**Sources**:
https://googleapis.github.io/js-genai/release_docs/classes/client.GoogleGenAI.html,
https://googleapis.github.io/js-genai/release_docs/interfaces/types.GenerateContentConfig.html,
https://googleapis.github.io/js-genai/release_docs/interfaces/types.HttpOptions.html,
https://ai.google.dev/gemini-api/docs/structured-output

## Prompt Injection Defense

**Decision**: Delimit input as `UNTRUSTED_DOCUMENT_DATA`; embedded commands are content only.
Give the model no tools or secret access. Enforce closed schemas and verify normalized
evidence is a literal substring of extracted text. Test indirect commands, invisible Unicode,
and “ignore previous”.

**Rationale**: Prompt wording alone cannot eliminate injection. Isolation, least privilege,
deterministic grounding, validation, and tests provide defense in depth.

**Alternatives considered**: Keyword blocklist alone; model refusal alone; unnecessary tools.

**Sources**:
https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html,
https://genai.owasp.org/llmrisk/llm01-prompt-injection/

## HTTP Security and Logging

**Decision**: Exact CORS allowlist, Helmet before routes, and stricter rate limit on analysis.
JSON logs contain request ID, status, duration, bytes, validated type, characters, model ID,
rule count, and error class only.

**Rationale**: Controls reduce browser misuse, common header risks, memory/cost abuse, and
sensitive-data leakage. An in-memory limiter is sufficient for one MVP instance.

**Alternatives considered**: Permissive CORS; high global limit; logging prompts or raw model
responses.

**Sources**: https://expressjs.com/en/resources/middleware/,
https://helmetjs.github.io/,
https://github.com/express-rate-limit/express-rate-limit

## Test Stack

**Decision**: Vitest and Supertest in the backend. Mock `RuleAnalyzer`, not SDK internals.
Cover extractors, schemas, multipart, error mapping, invalid AI output, grounding, timeout,
no-rule output, prompt injection, and log redaction.

**Rationale**: One TypeScript-friendly runner across workspaces reduces overhead. Interface
fakes remain stable across SDK updates.

**Alternatives considered**: Node test runner (fewer dependencies but less workspace
uniformity); SDK method mocks (brittle).

**Sources**: https://nodejs.org/api/test.html,
https://vitest.dev/guide/mocking

## Risks Confirmed

- Memory upload plus concurrency can exhaust RAM.
- Byte limits do not bound extracted characters or provider tokens.
- PDFs can lose reading order/page metadata; complex DOCX can flatten poorly.
- Structured JSON can remain semantically false.
- Provider quota, timeout, and repair can amplify latency and cost.

Mitigations are byte/character limits, rate limiting, explicit unreadable states, literal
evidence grounding, one repair maximum, cancellation, and human-review indicators.
