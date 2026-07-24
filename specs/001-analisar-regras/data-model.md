# Data Model: Analisador de Regras Institucionais

## Overview

O modelo é efêmero: nenhuma entidade é persistida. A requisição mantém o documento e o texto
somente durante validação, extração e análise; o frontend mantém o último resultado apenas em
memória para navegação entre `/upload` e `/resultado`.

## Entity: UploadedDocument

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `originalName` | string | yes | basename sanitizada, não vazia |
| `mediaType` | enum | yes | PDF, DOCX ou TXT permitido |
| `extension` | enum | yes | `.pdf`, `.docx` ou `.txt`, coerente com conteúdo |
| `sizeBytes` | integer | yes | `1..MAX_FILE_SIZE_BYTES` |
| `buffer` | bytes | yes | somente memória; nunca logado/persistido |

Relationship: produz exatamente um `ExtractedDocument` ou um `ProcessingError`.

## Entity: ExtractedDocument

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | derivado do nome sanitizado |
| `type` | string | yes | tipo validado |
| `text` | string | yes | texto não vazio após normalização segura |
| `characters` | integer | yes | quantidade de caracteres de `text`, mínimo 1 |
| `locations` | extraction metadata | no | páginas/seções quando o extrator fornecer |

`text` é dado não confiável e só pode entrar no campo de conteúdo delimitado do analisador.

## Entity: AnalysisResult

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `document` | `DocumentMetadata` | yes | nome, tipo e caracteres |
| `summary` | `AnalysisSummary` | yes | coerente com `rules` |
| `rules` | `Rule[]` | yes | pode ser vazio |

Invariants:

- `summary.totalRules === rules.length`.
- `summary.requiresHumanReview` é verdadeiro se qualquer regra exigir revisão ou se não houver
  regras.
- IDs são únicos e sequenciais no formato `R001`, `R002`, ...
- Nenhuma regra existe sem evidência literal não vazia.

## Value Object: DocumentMetadata

| Field | Type | Validation |
|-------|------|------------|
| `name` | string | nome sanitizado |
| `type` | string | tipo validado |
| `characters` | integer | maior ou igual a zero |

## Value Object: AnalysisSummary

| Field | Type | Validation |
|-------|------|------------|
| `totalRules` | integer | maior ou igual a zero e igual a `rules.length` |
| `requiresHumanReview` | boolean | derivado pelas invariantes |

## Entity: Rule

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `id` | string | yes | `^R[0-9]{3,}$`, único |
| `title` | string | yes | curto, não vazio |
| `description` | string | yes | normalizada, não vazia |
| `type` | `RuleType` | yes | enum fechado |
| `evidence` | string | yes | trecho literal não vazio do documento |
| `location` | `RuleLocation` | yes | objeto com valores anuláveis |
| `subject` | string/null | yes | `null` se não identificável |
| `action` | string/null | yes | `null` se não identificável |
| `deadline` | string/null | yes | `null` se ausente |
| `condition` | string/null | yes | `null` se ausente |
| `exception` | string/null | yes | `null` se ausente |
| `confidence` | `Confidence` | yes | `high`, `medium` ou `low` |
| `requiresHumanReview` | boolean | yes | verdadeiro em ambiguidade/baixa confiança |

`RuleType`: `obligation`, `prohibition`, `permission`, `deadline`, `condition`, `exception`,
`procedure`, `definition`, `penalty`.

`Confidence`: `high`, `medium`, `low`.

## Value Object: RuleLocation

| Field | Type | Validation |
|-------|------|------------|
| `page` | integer/null | inteiro positivo quando conhecido |
| `section` | string/null | não vazia quando conhecida |

Ambos podem ser `null`, mas o objeto sempre existe para manter contrato estável.

## Entity: ProcessingError

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `code` | `ErrorCode` | yes | enum público fechado |
| `message` | string | yes | segura, sem detalhes internos |
| `requestId` | string | yes | identificador opaco |
| `cause` | unknown | internal only | nunca enviado nem logado com documento |

## State Transitions

```text
EMPTY
  → FILE_SELECTED
  → VALIDATING
  → READY
  → UPLOADING
  → ANALYZING
  → COMPLETED

VALIDATING → INVALID_FILE
UPLOADING/ANALYZING → FAILED
COMPLETED/FAILED/INVALID_FILE → EMPTY
```

Transições inválidas são ignoradas ou redirecionadas para `EMPTY`; não existe estado
persistido ou retomada após recarregar a aplicação.

## Lifecycle and Disposal

1. Multer cria o buffer limitado em memória.
2. Extração cria texto temporário e metadados.
3. O adapter recebe texto e retorna resultado validado.
4. Ao responder ou falhar, referências a buffer, texto e resposta bruta são liberadas.
5. Nenhum cache, arquivo temporário, banco ou log retém o conteúdo; o teto constitucional de
   uma hora é satisfeito pelo ciclo da requisição, com timeout de 120 segundos.
