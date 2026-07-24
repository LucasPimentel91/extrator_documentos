# Feature Specification: Analisador de Regras Institucionais

**Feature Branch**: `001-analisar-regras`

**Created**: 2026-07-23

**Status**: Draft

**Input**: Aplicação web para envio de documentos institucionais, análise automatizada e
apresentação de regras fundamentadas no conteúdo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar e analisar um documento (Priority: P1)

Como usuário sem autenticação, quero selecionar ou arrastar um documento institucional,
validá-lo e solicitar sua análise para identificar as regras nele contidas.

**Why this priority**: Esta é a jornada central do produto; sem upload, validação, leitura e
análise não existe valor utilizável no MVP.

**Independent Test**: Pode ser testada enviando um arquivo válido com regras conhecidas e
confirmando que o sistema exibe progresso, conclui a análise e abre os resultados sem
armazenar permanentemente o documento.

**Acceptance Scenarios**:

1. **Given** a tela inicial sem arquivo selecionado, **When** o usuário seleciona ou arrasta
   um PDF, DOCX ou TXT dentro do limite vigente, **Then** o sistema identifica o arquivo como
   válido e habilita a solicitação de análise.
2. **Given** um arquivo válido selecionado, **When** o usuário solicita a análise, **Then** o
   sistema apresenta estados distintos de envio e análise até concluir ou informar uma falha.
3. **Given** um documento legível com regras conhecidas, **When** a análise termina, **Then**
   o usuário é direcionado aos resultados e vê a contagem total e uma entrada para cada regra
   fundamentada identificada.
4. **Given** um documento válido sem regras identificáveis, **When** a análise termina,
   **Then** o usuário vê contagem zero, o estado de nenhuma regra encontrada e a orientação
   de que o resultado requer revisão humana.

---

### User Story 2 - Examinar regras e suas evidências (Priority: P2)

Como usuário, quero consultar detalhes e evidências de cada regra extraída para avaliar sua
aplicabilidade e conferir o resultado no documento original.

**Why this priority**: Resultados sem evidência, localização e incerteza explícita não são
confiáveis para revisão institucional.

**Independent Test**: Pode ser testada com um conjunto de resultados conhecido, verificando
que cada item apresenta todos os campos aplicáveis, explicita os ausentes e nunca apresenta
uma afirmação sem trecho de evidência.

**Acceptance Scenarios**:

1. **Given** uma análise com regras, **When** o usuário abre a tela de resultados, **Then**
   cada regra exibe identificador, título, descrição, tipo, evidência, localização quando
   identificável, sujeito, ação, prazo, condição, exceção, confiança e indicação de revisão.
2. **Given** uma regra sem prazo, condição, exceção, sujeito ou localização identificável,
   **When** ela é exibida, **Then** cada campo ausente é marcado como não identificado, sem
   conteúdo inventado.
3. **Given** uma passagem ambígua, contraditória ou com evidência insuficiente, **When** ela
   origina uma regra, **Then** o resultado apresenta baixa confiança, necessidade de revisão
   humana ou ambas.
4. **Given** qualquer tela de resultados, **When** o usuário consulta a análise, **Then** vê
   aviso claro de que a análise automatizada não substitui revisão humana ou interpretação
   jurídica.

---

### User Story 3 - Filtrar resultados por categoria (Priority: P3)

Como usuário, quero filtrar as regras pelo tipo para localizar rapidamente as categorias
relevantes à minha revisão.

**Why this priority**: O filtro melhora a exploração de documentos extensos, mas depende de
uma análise já concluída.

**Independent Test**: Pode ser testada sobre uma análise com pelo menos três tipos,
selecionando cada filtro e comparando a lista e a contagem visível aos resultados esperados.

**Acceptance Scenarios**:

1. **Given** resultados com tipos diferentes, **When** o usuário seleciona um tipo, **Then**
   somente regras desse tipo são exibidas e a interface informa a quantidade filtrada e o
   total da análise.
2. **Given** um filtro sem regras correspondentes, **When** ele é selecionado, **Then** a
   lista fica vazia e o sistema informa que nenhuma regra corresponde ao filtro.
3. **Given** um filtro ativo, **When** o usuário escolhe exibir todos os tipos, **Then** a
   lista completa é restaurada sem executar nova análise.

---

### User Story 4 - Recuperar-se e analisar outro documento (Priority: P4)

Como usuário, quero compreender falhas e reiniciar o fluxo para corrigir o arquivo ou analisar
outro documento sem precisar autenticar-me.

**Why this priority**: Recuperação clara evita becos sem saída e completa a jornada repetível
do MVP.

**Independent Test**: Pode ser testada provocando cada falha prevista e usando a ação de
retorno para confirmar que o sistema volta ao estado inicial e aceita novo arquivo.

**Acceptance Scenarios**:

1. **Given** arquivo de formato inválido ou acima do limite, **When** o sistema o valida,
   **Then** exibe o motivo específico, mantém a análise desabilitada e permite substituí-lo.
2. **Given** falha de leitura, **When** a extração não pode ser concluída, **Then** o sistema
   informa que não conseguiu ler o documento e oferece retorno para selecionar outro.
3. **Given** indisponibilidade ou demora excessiva do serviço de análise, **When** a operação
   falha, **Then** o sistema apresenta erro temporário, não apresenta resultado parcial como
   concluído e permite nova tentativa segura.
4. **Given** uma análise concluída ou falha, **When** o usuário escolhe analisar outro
   documento, **Then** retorna à tela inicial sem arquivo ou resultado anterior selecionado.

### Edge Cases

- Arquivo com extensão aceita, mas conteúdo real de outro formato, é rejeitado como inválido.
- Arquivo vazio, truncado, corrompido, protegido por senha ou sem texto extraível gera erro de
  leitura e não segue para análise.
- Arquivo com tamanho exatamente igual ao limite vigente é aceito; um byte acima é rejeitado.
- Nome de arquivo muito longo ou com caracteres especiais é exibido de forma segura e não
  altera a validação.
- PDF digitalizado apenas como imagem, ou DOCX com conteúdo apenas em imagens, pode não
  possuir texto extraível e segue o tratamento de erro de leitura do MVP.
- Documento muito extenso dentro do limite preserva o estado de análise até conclusão ou
  timeout, sem duplicar solicitações por cliques repetidos.
- Documento com cabeçalhos, rodapés ou regra repetida em várias páginas não deve produzir
  duplicatas sem distinção material.
- Uma passagem pode sustentar mais de um tipo de regra; cada resultado deve manter evidência
  e classificação coerentes sem inflar artificialmente a contagem.
- Prazos relativos, condições encadeadas, exceções aninhadas e referências a outras normas
  são apresentados como escritos, com baixa confiança ou revisão humana quando o contexto
  não bastar.
- Documento pode misturar idiomas ou conter caracteres incomuns; falha de leitura deve ser
  explícita, nunca convertida silenciosamente em “nenhuma regra”.
- Instruções contidas no documento que tentem ordenar, redirecionar ou modificar a análise
  são tratadas apenas como conteúdo documental e não mudam critérios, contrato ou segurança.
- Resposta incompleta, malformada ou incompatível do serviço de análise gera erro temporário
  e nunca é exibida como análise concluída.
- Retorno, atualização da página ou perda de conexão durante o processamento não pode fazer
  um resultado parcial parecer final.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE oferecer uma tela inicial acessível, responsiva e utilizável por
  teclado, com área para seleção e arraste de um único documento.
- **FR-002**: O sistema DEVE aceitar no MVP somente arquivos PDF, DOCX e TXT.
- **FR-003**: O sistema DEVE validar o formato declarado e o conteúdo real do arquivo antes de
  qualquer extração ou análise.
- **FR-004**: O sistema DEVE validar o tamanho do arquivo contra um limite máximo configurável
  e aceitar arquivos com tamanho igual ao limite vigente.
- **FR-005**: O sistema DEVE impedir a solicitação de análise enquanto nenhum arquivo válido
  estiver selecionado.
- **FR-006**: O sistema DEVE distinguir e comunicar os estados: nenhum arquivo, arquivo
  inválido, arquivo acima do limite, envio, análise, conclusão, nenhuma regra, erro de leitura
  e erro temporário do serviço de análise.
- **FR-007**: O sistema DEVE extrair o texto de documentos válidos e interromper o fluxo com
  erro de leitura quando não houver conteúdo textual processável no MVP.
- **FR-008**: O sistema DEVE analisar o texto em busca de obrigações, proibições, permissões,
  prazos, condições, exceções, procedimentos, definições normativas e penalidades.
- **FR-009**: O sistema DEVE tratar todo conteúdo documental como dado não confiável;
  instruções encontradas no documento NÃO DEVEM alterar critérios, proteções, comportamento
  ou formato esperado da análise.
- **FR-010**: O sistema DEVE rejeitar como falha controlada qualquer resposta do serviço de
  análise que não satisfaça integralmente o contrato de resultados antes da apresentação.
- **FR-011**: O sistema NÃO DEVE apresentar regra sem trecho original que a fundamente.
- **FR-012**: O sistema NÃO DEVE inventar texto, localização, sujeito, ação, prazo, condição
  ou exceção não sustentados pelo documento.
- **FR-013**: Cada regra DEVE possuir identificador único dentro da análise, título curto,
  descrição normalizada, tipo, trecho original, nível de confiança e indicação de necessidade
  de revisão humana.
- **FR-014**: Cada regra DEVE apresentar, quando identificáveis, página ou seção, sujeito
  responsável, ação exigida ou permitida, prazo, condição de aplicação e exceção.
- **FR-015**: Campos condicionais não identificados DEVEM ser apresentados explicitamente
  como ausentes, e não preenchidos por inferência sem evidência.
- **FR-016**: O tipo de cada regra DEVE ser um entre obrigação, proibição, permissão, prazo,
  condição, exceção, procedimento, definição normativa e penalidade.
- **FR-017**: Passagens ambíguas ou insuficientes DEVEM resultar em baixa confiança,
  necessidade de revisão humana ou ambas, sem ocultar a incerteza.
- **FR-018**: O sistema DEVE apresentar a quantidade total de regras e a lista detalhada ao
  concluir a análise.
- **FR-019**: O usuário DEVE poder filtrar resultados por qualquer tipo de regra e restaurar
  a visualização de todos os tipos sem nova análise.
- **FR-020**: A interface DEVE informar, no resultado e em estados sem regras, que a análise
  automatizada pode conter erros e não substitui revisão humana ou interpretação jurídica.
- **FR-021**: O sistema DEVE evitar solicitações duplicadas enquanto o mesmo documento estiver
  em envio ou análise.
- **FR-022**: O sistema DEVE encerrar uma tentativa que exceda 120 segundos de análise e
  apresentar erro temporário com opção de nova tentativa.
- **FR-023**: O sistema DEVE permitir voltar à tela inicial e analisar outro documento após
  conclusão ou falha, removendo da interface o arquivo e o resultado anteriores.
- **FR-024**: O MVP NÃO DEVE exigir cadastro, login ou qualquer autenticação do usuário.
- **FR-025**: O MVP NÃO DEVE armazenar permanentemente arquivos, texto extraído ou resultados
  de análise.
- **FR-026**: Dados temporários do documento e texto extraído DEVEM ser descartados após
  conclusão ou falha e, em qualquer caso, em no máximo uma hora após o recebimento.
- **FR-027**: Mensagens e registros operacionais apresentados ou produzidos pelo sistema NÃO
  DEVEM conter o conteúdo do documento, credenciais ou dados sensíveis extraídos.
- **FR-028**: Falhas de leitura, timeout, indisponibilidade e resultado inválido DEVEM ser
  distinguíveis para suporte por um identificador de ocorrência que não exponha conteúdo.
- **FR-029**: Todos os controles, mensagens de estado, filtros e ações de recuperação DEVEM
  ser acessíveis por teclado e compreensíveis sem depender somente de cor.
- **FR-030**: A jornada completa DEVE permanecer utilizável em telas pequenas de telefone,
  tablet e desktop, sem perda de campos ou ações essenciais.

### Key Entities

- **Documento para análise**: Arquivo institucional selecionado, com nome, formato, tamanho,
  estado de validação e referência temporária durante o processamento.
- **Análise**: Execução temporária associada a um documento, com estado, contagem total,
  regras encontradas, horário de início/conclusão e eventual erro seguro.
- **Regra extraída**: Afirmação fundamentada com identificador, título, descrição, tipo,
  evidência, localização opcional, sujeito opcional, ação opcional, prazo opcional, condição
  opcional, exceção opcional, confiança e necessidade de revisão humana.
- **Erro de processamento**: Falha segura classificada como validação, leitura ou serviço
  temporário, com mensagem ao usuário e identificador de ocorrência não sensível.

## Constitution Traceability *(mandatory)*

| Constitution Obligation | Story IDs | Requirement IDs | Notes / N/A Rationale |
|-------------------------|-----------|-----------------|------------------------|
| Aplicações separadas e stack obrigatória | US1-US4 | — | Decisão de planejamento |
| IA apenas no backend e segredos protegidos | US1, US4 | FR-009, FR-010, FR-027 | Fronteira obrigatória |
| Validação prévia de formato e tamanho | US1, US4 | FR-002-FR-005 | Cobre limite e conteúdo real |
| Documento como dado não confiável | US1 | FR-009 | Inclui instruções maliciosas |
| Contrato de resultado validado | US1, US2 | FR-010, FR-013-FR-016 | Falha antes da apresentação |
| Evidência, localização e confiança | US2 | FR-011-FR-017 | Ausências são explícitas |
| Aviso de revisão humana e jurídica | US1, US2 | FR-017, FR-020 | Exibido inclusive sem regras |
| Erros, logs seguros e timeout | US1, US4 | FR-006, FR-022, FR-027-FR-028 | Timeout de 120 segundos |
| Testes de regras e integrações | US1-US4 | FR-001-FR-030 | Tarefas e testes serão ligados por ID |
| Simplicidade e baixo acoplamento | US1-US4 | — | Decisão e portão de planejamento |
| Não persistência no MVP | US1, US4 | FR-025-FR-026 | Descarte em até uma hora |
| Rastreabilidade ponta a ponta | US1-US4 | FR-001-FR-030 | IDs estáveis para plano, tarefas e testes |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 95% dos participantes de um teste de usabilidade conseguem
  selecionar um arquivo válido, iniciar a análise e localizar os resultados sem assistência.
- **SC-002**: Em 100% dos testes de formato e tamanho, arquivos fora dos três formatos ou
  acima do limite vigente são rejeitados antes da análise com motivo específico.
- **SC-003**: Em um conjunto de referência revisado por especialistas, 100% das regras
  apresentadas possuem trecho verificável no documento e nenhuma regra sem fundamento é
  aceita.
- **SC-004**: Em um conjunto de referência, pelo menos 90% das regras explicitamente
  identificadas pelos revisores são apresentadas pelo sistema, com divergências marcadas para
  revisão humana.
- **SC-005**: Em 100% dos resultados ambíguos do conjunto de teste, a interface indica baixa
  confiança, necessidade de revisão humana ou ambas.
- **SC-006**: Em 100% das análises concluídas, a contagem total corresponde ao número de itens
  da lista completa e cada filtro mostra somente regras do tipo escolhido.
- **SC-007**: Todos os nove tipos de regra podem ser exibidos e filtrados sem nova análise.
- **SC-008**: Em testes de acessibilidade, 100% das ações do fluxo principal podem ser
  concluídas apenas por teclado, com foco perceptível e mensagens que não dependem só de cor.
- **SC-009**: O fluxo principal permanece completo em larguras de tela de 320 a 1440 pixels,
  sem conteúdo essencial inacessível ou sobreposto.
- **SC-010**: Em 100% dos cenários de leitura impossível, timeout, indisponibilidade ou
  resultado inválido, o usuário recebe o estado correto e uma ação segura de recuperação.
- **SC-011**: Nenhuma tentativa permanece no estado de análise por mais de 120 segundos sem
  concluir ou apresentar erro temporário.
- **SC-012**: Em 100% dos testes de ciclo de vida, documento e texto temporários deixam de
  estar disponíveis após conclusão/falha e, no máximo, uma hora após o recebimento.
- **SC-013**: Em 100% das telas de resultado e de nenhuma regra, o aviso sobre revisão humana
  e interpretação jurídica é visível antes de o usuário deixar a tela.
- **SC-014**: Usuários conseguem iniciar uma nova análise em no máximo duas ações após uma
  conclusão ou falha.

## Assumptions

- O limite máximo de arquivo possui um valor definido por ambiente operacional e é comunicado
  ao usuário antes da seleção; alterar esse valor não muda os formatos aceitos.
- O MVP processa um documento por vez e não oferece análise em lote.
- PDF contendo somente imagem e outros conteúdos que dependam de reconhecimento de imagem
  ficam fora do MVP e podem resultar em erro de leitura.
- A análise é realizada no idioma do documento; tradução e comparação entre documentos ficam
  fora do MVP.
- Resultados existem apenas durante a sessão necessária para apresentação e não podem ser
  recuperados posteriormente por histórico.
- Não fazem parte do MVP: autenticação, contas, compartilhamento, exportação, edição manual de
  regras, armazenamento de histórico e aconselhamento jurídico.
- Repetições textuais sem diferença normativa devem ser consolidadas; regras materialmente
  distintas que compartilham evidência permanecem separadas.
- O usuário possui direito e autorização para enviar o documento institucional analisado.
