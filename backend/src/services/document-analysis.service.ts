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
    const extracted = await this.extractor.extract(file);
    const output = await this.analyzer.analyze({
      text: extracted.text,
      signal,
    });
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
  }
}
