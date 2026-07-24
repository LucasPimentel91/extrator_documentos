import type { ExtractedRule } from "../../../contracts/analysis.js";
import type { RuleAnalyzer } from "../../src/adapters/rule-analyzer.js";

export class FakeRuleAnalyzer implements RuleAnalyzer {
  constructor(
    private readonly output: { rules: ExtractedRule[] } = { rules: [] },
    private readonly failure?: Error,
  ) {}

  async analyze(): Promise<{ rules: ExtractedRule[] }> {
    if (this.failure) throw this.failure;
    return structuredClone(this.output);
  }
}
