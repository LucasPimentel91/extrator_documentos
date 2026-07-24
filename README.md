# Analisador de Regras Institucionais

Aplicação web para receber documentos institucionais em PDF, DOCX ou TXT e apresentar
regras fundamentadas no texto original. O resultado inclui categoria, evidência, localização,
confiança e indicação de revisão humana.

> A análise automatizada pode conter erros e não substitui revisão humana nem interpretação
> jurídica.

## Requisitos

- Node.js `>= 24.15`
- npm `>= 11`
- Chave da API Gemini para análises reais

Confira o ambiente:

```bash
node --version
npm --version
```

## Estrutura

```text
.
├── frontend/    # Angular, rotas /upload e /resultado
├── backend/     # Express, API REST, extração e Gemini
├── contracts/   # Tipos TypeScript compartilhados
├── specs/       # Especificação, plano, OpenAPI e rastreabilidade
└── package.json # npm workspaces e scripts compartilhados
```

O frontend nunca acessa o Gemini diretamente. A chave e a integração permanecem no backend.
Não há banco de dados, autenticação, fila, OCR ou persistência de documentos no MVP.

## Instalação

```bash
npm install
cp .env.example .env
```

Edite `.env` e informe localmente `GEMINI_API_KEY` e um `GEMINI_MODEL` disponível para sua
conta. Nunca versione `.env`, chaves, tokens ou documentos institucionais.

O backend lê `process.env`. No Bash, carregue o arquivo antes de iniciar:

```bash
set -a
source .env
set +a
npm run dev
```

Serviços locais:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:300`
- Saúde do backend: `GET http://localhost:3000/healt'
- API: `POST http://localhost:3000/api/documents/analyze`

Durante o desenvolvimento, o proxy Angular encaminha `/api/**` ao backend. Em produção, os
builds podem ser publicados separadamente ou o build Angular pode ser servido pelo backend,
desde que CORS, segredos e a fronteira da API sejam preservados.

## Scripts

```bash
npm run dev        # frontend e backend simultaneamente
npm test           # testes dos dois workspaces
npm run typecheck  # contratos, frontend e backend
npm run lint       # lint dos dois workspaces
npm run build      # builds de produção
```

Também é possível executar um workspace:

```bash
npm test --workspace frontend
npm test --workspace backend
```

Os testes usam doubles do Gemini e não fazem chamadas externas.

## Limites e segurança

- Formatos aceitos: PDF com camada textual, DOCX e TXT.
- Tamanho padrão: 10 MiB, configurável por `MAX_FILE_SIZE_BYTES`.
- Um arquivo por requisição, recebido em memória.
- Extensão, MIME, assinatura, tamanho e conteúdo vazio são validados.
- Chamadas ao Gemini possuem timeout padrão de 120 segundos.
- Conteúdo documental é delimitado como dado não confiável contra prompt injection.
- A saída da IA é validada por schema e toda regra precisa de evidência literal.
- CORS é restrito a `FRONTEND_ORIGIN`; Helmet e rate limit ficam ativos.
- Logs aceitam apenas metadados permitidos e não registram documento, evidência, prompt,
  resposta bruta ou chave.
- Buffers e referências textuais temporárias são limpos ao concluir ou falhar.

## Contratos e documentação

- [Especificação](specs/001-analisar-regras/spec.md)
- [Plano técnico](specs/001-analisar-regras/plan.md)
- [OpenAPI](specs/001-analisar-regras/contracts/openapi.yaml)
- [Validação rápida](specs/001-analisar-regras/quickstart.md)
- [Rastreabilidade](specs/001-analisar-regras/traceability.md)
