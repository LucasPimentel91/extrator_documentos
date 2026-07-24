<!--
Sync Impact Report
- Version change: template (unversioned) → 1.0.0
- Modified principles: none (initial ratification)
- Added principles:
  - I. Monorepositório com Aplicações Separadas
  - II. Frontend Angular Acessível e Responsivo
  - III. Backend Node.js com API REST
  - IV. Gemini Exclusivamente no Backend
  - V. Segredos Fora do Versionamento
  - VI. Validação Prévia de Arquivos
  - VII. Documentos São Dados Não Confiáveis
  - VIII. Resposta Estruturada e Validada
  - IX. Regras Extraídas com Evidências
  - X. Revisão Humana Obrigatoriamente Sinalizada
  - XI. Resiliência e Observabilidade Seguras
  - XII. Testes Automatizados Obrigatórios
  - XIII. Simplicidade e Baixo Acoplamento
  - XIV. Não Persistência de Documentos no MVP
  - XV. Rastreabilidade Ponta a Ponta
- Added sections:
  - Restrições de Arquitetura, Segurança e Dados
  - Fluxo de Desenvolvimento e Portões de Qualidade
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Command and runtime guidance reviewed:
  - ✅ .agents/skills/speckit-tasks/SKILL.md updated
  - ✅ Other .agents/skills/speckit-*/SKILL.md files reviewed; no updates required
  - ✅ No runtime guidance documents found
- Follow-up TODOs: none
-->
# Extrator de Regras Institucionais Constitution

## Core Principles

### I. Monorepositório com Aplicações Separadas
Frontend e backend DEVEM permanecer no mesmo repositório, em diretórios de aplicação
claramente separados. Dependências, configuração, código-fonte e testes de cada aplicação
DEVEM ter limites explícitos; compartilhamento só é permitido por contratos ou pacotes
deliberadamente comuns. Essa estrutura mantém uma única linha de evolução sem misturar
responsabilidades.

### II. Frontend Angular Acessível e Responsivo
O frontend DEVE usar Angular e TypeScript, componentes independentes (standalone) e
formulários reativos. Toda jornada DEVE ser operável por teclado, usar semântica e nomes
acessíveis adequados e funcionar nos tamanhos de tela definidos na especificação. Critérios
de aceitação DEVEM cobrir estados de carregamento, erro e validação.

### III. Backend Node.js com API REST
O backend DEVE usar Node.js e TypeScript e expor suas capacidades ao frontend por uma API
REST versionável, com contratos explícitos de entrada, saída e erro. Regras de negócio NÃO
DEVEM depender diretamente do framework HTTP, para permanecerem testáveis e desacopladas.

### IV. Gemini Exclusivamente no Backend
O frontend NUNCA DEVE chamar a API do Gemini nem receber credenciais capazes de fazê-lo.
Toda integração com o Gemini DEVE ocorrer no backend por uma fronteira de integração
dedicada. Esse limite protege segredos, centraliza controles e impede que clientes contornem
as validações da aplicação.

### V. Segredos Fora do Versionamento
Chaves, tokens e credenciais DEVEM ser obtidos por variáveis de ambiente ou mecanismo de
segredos equivalente e NUNCA DEVEM ser versionados, registrados em logs ou enviados ao
frontend. O repositório PODE conter apenas nomes de variáveis e valores fictícios seguros.

### VI. Validação Prévia de Arquivos
Todo arquivo recebido DEVE ter formato e tamanho validados no backend antes de leitura,
extração ou envio a serviços externos. Formatos e limites aceitos DEVEM ser definidos na
especificação; arquivos inválidos DEVEM ser rejeitados com erro seguro e compreensível.

### VII. Documentos São Dados Não Confiáveis
Conteúdo documental DEVE ser tratado como entrada não confiável. Instruções, prompts ou
pedidos encontrados no documento NUNCA DEVEM alterar regras do sistema, ferramentas,
credenciais, contrato de saída ou instruções da aplicação. Prompts DEVEM separar
inequivocamente instruções da aplicação do conteúdo analisado e testes DEVEM cobrir
tentativas de prompt injection.

### VIII. Resposta Estruturada e Validada
Toda resposta do Gemini DEVE obedecer a um contrato JSON explicitamente definido e
versionado. O backend DEVE validar estrutura, tipos, campos obrigatórios e limites semânticos
antes de devolver dados ao frontend; respostas inválidas DEVEM falhar de modo controlado e
NÃO DEVEM ser repassadas como se fossem confiáveis.

### IX. Regras Extraídas com Evidências
Cada regra extraída DEVE conter, sempre que a informação estiver disponível, texto da regra,
categoria, trecho de evidência, localização no documento e nível de confiança. Ausências
DEVEM ser representadas explicitamente, sem fabricação de evidência ou localização. O
contrato DEVE permitir rastrear cada resultado à sua fonte.

### X. Revisão Humana Obrigatoriamente Sinalizada
Toda interface e saída destinada ao usuário DEVE informar de forma clara e próxima ao
resultado que a análise automatizada pode conter erros e não substitui revisão humana nem
interpretação jurídica. O produto NÃO DEVE apresentar resultados como aconselhamento
jurídico definitivo.

### XI. Resiliência e Observabilidade Seguras
O backend DEVE possuir tratamento centralizado de erros, logs estruturados sem documentos,
segredos ou outros conteúdos sensíveis e limites de tempo explícitos para chamadas externas.
Falhas externas DEVEM ser convertidas em respostas seguras e rastreáveis por identificadores
técnicos que não exponham dados do usuário.

### XII. Testes Automatizados Obrigatórios
Regras de negócio e integrações externas DEVEM possuir testes automatizados. Integrações
DEVEM ser testadas por contratos e doubles controlados, incluindo timeout, resposta inválida
e indisponibilidade. Uma mudança que altere comportamento NÃO PODE ser aceita sem teste que
demonstre o requisito correspondente.

### XIII. Simplicidade e Baixo Acoplamento
A implementação DEVE priorizar a solução mais simples que satisfaça requisitos observáveis,
com nomes claros, módulos coesos e dependências direcionadas por contratos. Abstrações
DEVEM ser introduzidas somente quando houver variação ou reutilização comprovada; qualquer
complexidade adicional DEVE ser justificada no plano.

### XIV. Não Persistência de Documentos no MVP
O MVP NÃO DEVE armazenar permanentemente documentos enviados. Dados temporários DEVEM ser
descartados ao final do processamento ou após prazo operacional curto e explicitamente
definido. Persistência futura exige alteração explícita da especificação, com retenção,
acesso, exclusão e proteção de dados definidos.

### XV. Rastreabilidade Ponta a Ponta
Toda mudança DEVE manter ligações verificáveis entre requisito, história de usuário, tarefa,
código e teste. Especificações e tarefas DEVEM usar identificadores estáveis, e commits ou
pull requests DEVEM citar os identificadores atendidos. Código ou teste sem origem
rastreável, quando alterar comportamento, DEVE ser corrigido antes da aprovação.

## Restrições de Arquitetura, Segurança e Dados

- A estrutura padrão DEVE separar `frontend/` e `backend/`, admitindo pacotes compartilhados
  apenas quando documentados no plano.
- Contratos REST e o contrato JSON do Gemini DEVEM ser artefatos revisáveis e validados em
  suas respectivas fronteiras.
- O backend é a única zona autorizada a processar arquivos, acessar segredos e chamar o
  Gemini.
- Especificações DEVEM declarar formatos e tamanhos aceitos, timeouts externos, política de
  dados temporários, campos do resultado e comportamento para valores ausentes.
- Logs, mensagens de erro, telemetria e fixtures versionadas NÃO DEVEM conter documentos,
  credenciais ou conteúdo institucional sensível.

## Fluxo de Desenvolvimento e Portões de Qualidade

1. Cada especificação DEVE declarar histórias, requisitos e critérios mensuráveis com
   identificadores estáveis, inclusive requisitos de segurança, acessibilidade e aviso legal.
2. Cada plano DEVE passar pela verificação constitucional antes da pesquisa e novamente
   após o desenho, registrando qualquer complexidade excepcional.
3. Cada lista de tarefas DEVE incluir validação de arquivos, isolamento contra prompt
   injection, contrato JSON, erros/logs/timeouts, acessibilidade, descarte de documentos e os
   testes automatizados aplicáveis.
4. A revisão DEVE confirmar rastreabilidade entre história, requisito, tarefa, código e teste,
   além da ausência de segredos e dados sensíveis versionados.
5. Nenhuma entrega PODE prosseguir com violação não resolvida de um `MUST`/`DEVE` desta
   constituição. Exceções exigem emenda constitucional anterior à implementação.

## Governance

Esta constituição prevalece sobre planos, especificações, tarefas e práticas conflitantes.
Emendas DEVEM ser propostas por escrito, indicar motivação e impacto, atualizar os artefatos
dependentes e receber aprovação explícita dos responsáveis pelo projeto antes de vigorar.

O versionamento segue SemVer: MAJOR para remoção ou redefinição incompatível de princípios;
MINOR para novo princípio ou expansão material de obrigações; PATCH para esclarecimentos sem
mudança normativa. Toda emenda DEVE atualizar a data de última alteração e o Sync Impact
Report.

Planos e revisões de mudança DEVEM demonstrar conformidade. Violações bloqueiam aprovação
até correção ou emenda formal. Uma revisão periódica DEVE verificar se templates, contratos,
testes e orientações continuam alinhados à versão vigente.

**Version**: 1.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-23
