import type { AnalysisResult } from "../../../contracts/analysis.js";
import type { RuleAnalyzer } from "../adapters/rule-analyzer.js";
import { analysisResultSchema } from "../schemas/analysis.schema.js";
import { TextExtractionService } from "./text-extraction.service.js";

export class DocumentAnalysisService {
  constructor(
    private readonly extractor: TextExtractionService,
    private readonly analyzer: RuleAnalyzer,
  ) {}

  async analyze(
    file: { name: string; type: string; buffer: Buffer },
    signal: AbortSignal,
  ): Promise<AnalysisResult> {
    let extracted:
      | Awaited<ReturnType<TextExtractionService["extract"]>>
      | undefined;
    const analysisInput = { text: "", signal };
    try {
      extracted = await this.extractor.extract(file);
      analysisInput.text = extracted.text;
      const output = await this.analyzer.analyze(analysisInput);
      const result: AnalysisResult = {
        document: {
          name: extracted.name,
          type: extracted.type,
          characters: extracted.characters,
        },
        summary: {
          totalRules: output.rules.length,
          requiresHumanReview:
            output.rules.length === 0 ||
            output.rules.some((rule) => rule.requiresHumanReview),
        },
        rules: output.rules,
      };
      return analysisResultSchema.parse(result);
    } finally {
      file.buffer.fill(0);
      analysisInput.text = "";
      if (extracted) {
        extracted.text = "";
        extracted.pages = undefined;
      }
      extracted = undefined;
    }
  }
}
