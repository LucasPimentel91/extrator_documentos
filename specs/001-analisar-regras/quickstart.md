# Quickstart Validation: Analisador de Regras Institucionais

## Prerequisites

- Node.js 24 LTS compatible with Angular 22
- npm
- Gemini API key authorized for the configured model
- Local PDF, DOCX and TXT fixtures without sensitive institutional content

## Environment

Create `.env` from `.env.example` and set:

```dotenv
GEMINI_API_KEY=replace-locally
GEMINI_MODEL=replace-with-supported-model
BACKEND_PORT=3000
FRONTEND_ORIGIN=http://localhost:4200
MAX_FILE_SIZE_BYTES=10485760
GEMINI_TIMEOUT_MS=120000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=10
```

The example file must contain placeholders only. Never commit `.env` or a real key.

## Install and Run

```bash
npm install
npm run dev
```

Expected:

- Frontend available at `http://localhost:4200`.
- Backend available at `http://localhost:3000`.
- Requests from the frontend to `/api` are proxied to the backend.
- Direct navigation to `/` redirects to `/upload`.

## Automated Validation

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

All workspaces must pass. Gemini is replaced by a fake in automated tests; tests must not
require a real key or external network.

### Validation record — 2026-07-24

| Check | Result | Evidence |
|-------|--------|----------|
| Angular journey and accessibility | PASS | `app-flow.spec.ts`, `accessibility-flow.spec.ts` |
| Upload, extraction and analysis contracts | PASS | backend unit, integration and contract suites |
| Prompt injection and grounding | PASS | adapter and `security-regression.spec.ts` |
| Log privacy and disposal | PASS | `log-privacy.spec.ts`, `document-disposal.spec.ts` |
| TypeScript contracts | PASS | `npm run typecheck` |
| Lint and production builds | PASS | `npm run lint`, `npm run build` |

The automated suite uses controlled fakes and validates all error paths without network
access. A real Gemini request remains a local manual check because it requires a private key,
an authorized model and a non-sensitive test document.

## End-to-End Scenarios

### 1. Valid document with rules

1. Open `/upload`.
2. Select a valid text fixture with obligation, deadline and exception.
3. Start analysis.
4. Observe distinct upload and analysis states.
5. Confirm navigation to `/resultado`.
6. Compare the response to [OpenAPI](contracts/openapi.yaml) and
   [data model](data-model.md).

Expected: total equals the list length; each rule has literal evidence; optional unknown fields
are `null`; the human/legal review notice is visible.

Automated coverage: `document-analysis.spec.ts`, `app-flow.spec.ts`,
`rule-card.component.spec.ts`. Real-provider status: manual, environment-dependent.

### 2. Filters and restart

Filter each returned rule type, restore all, then choose “analisar outro documento”.

Expected: filters do not make another request; `/upload` returns empty and the prior result is
not available.

Automated coverage: `analysis.store.spec.ts`, `rule-filter.component.spec.ts`,
`app-flow.spec.ts`.

### 3. Upload validation

Try an unsupported extension, spoofed extension/MIME, empty file, exact configured limit and
one byte above the limit.

Expected: invalid files are rejected before extraction; exact limit passes; one byte above
returns `FILE_TOO_LARGE` without logging content.

Automated coverage: `document-upload.spec.ts`, `upload-errors.spec.ts`,
`security-regression.spec.ts`.

### 4. Reading and no-rule states

Analyze a corrupt/protected fixture and a valid document with no normative rule.

Expected: the first returns `DOCUMENT_UNREADABLE`; the second returns HTTP 200 with `rules: []`,
`totalRules: 0`, `requiresHumanReview: true` and the no-rule notice.

Automated coverage: extractor suites, `document-analysis-errors.spec.ts`,
`result-summary.component.spec.ts`.

### 5. AI failure paths

With test doubles, return malformed JSON, invalid enum, empty evidence, unavailability and a
request that exceeds 120 seconds.

Expected: no invalid or partial result reaches the frontend; errors map respectively to
`AI_INVALID_RESPONSE`, `AI_UNAVAILABLE` or `AI_TIMEOUT` and include a safe `requestId`.

Automated coverage: `gemini-rule-analyzer-errors.spec.ts`,
`document-analysis-errors.spec.ts`, `upload-errors.spec.ts`.

### 6. Prompt injection resistance

Analyze a fixture containing text such as “ignore prior instructions”, requests to reveal
secrets and a genuine institutional rule.

Expected: only the evidenced institutional rule is returned; no key, system instruction or
unrelated content appears in response or logs.

Automated coverage: `gemini-prompt-injection.spec.ts`, `evidence-grounding.spec.ts`,
`security-regression.spec.ts`.

### 7. Accessibility and responsiveness

Complete upload, result filtering and restart using only a keyboard at viewport widths 320,
768 and 1440 pixels.

Expected: visible focus, meaningful labels/status announcements, no color-only message and no
essential control obscured.

Automated coverage: `accessibility-flow.spec.ts` at 320, 768 and 1440 px plus component tests.
Final visual overlap verification remains part of the local browser smoke test.

### 8. Log privacy

Use a uniquely identifiable phrase inside a fixture and trigger both success and failure.

Expected: logs may include request ID, file metadata, duration and counts, but do not contain
the unique phrase, document text, evidence, raw model response or API key.

Automated coverage: `logger.spec.ts`, `log-privacy.spec.ts`,
`document-disposal.spec.ts`.
