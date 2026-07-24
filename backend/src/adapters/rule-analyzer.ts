import type { ExtractedRule } from "../../../contracts/analysis.js";

export interface RuleAnalyzer {
  analyze(input: {
    text: string;
    signal: AbortSignal;
  }): Promise<{ rules: ExtractedRule[] }>;
}
