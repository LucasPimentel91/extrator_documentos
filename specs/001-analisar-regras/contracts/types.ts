export const RULE_TYPES = [
  "obligation",
  "prohibition",
  "permission",
  "deadline",
  "condition",
  "exception",
  "procedure",
  "definition",
  "penalty",
] as const;

export type RuleType = (typeof RULE_TYPES)[number];
export type Confidence = "high" | "medium" | "low";

export interface DocumentMetadata {
  name: string;
  type: string;
  characters: number;
}

export interface AnalysisSummary {
  totalRules: number;
  requiresHumanReview: boolean;
}

export interface RuleLocation {
  page: number | null;
  section: string | null;
}

export interface ExtractedRule {
  id: string;
  title: string;
  description: string;
  type: RuleType;
  evidence: string;
  location: RuleLocation;
  subject: string | null;
  action: string | null;
  deadline: string | null;
  condition: string | null;
  exception: string | null;
  confidence: Confidence;
  requiresHumanReview: boolean;
}

export interface AnalysisResult {
  document: DocumentMetadata;
  summary: AnalysisSummary;
  rules: ExtractedRule[];
}

export type AnalysisErrorCode =
  | "FILE_REQUIRED"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "DOCUMENT_UNREADABLE"
  | "RATE_LIMITED"
  | "AI_INVALID_RESPONSE"
  | "AI_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "INTERNAL_ERROR";

export interface AnalysisErrorResponse {
  error: {
    code: AnalysisErrorCode;
    message: string;
    requestId: string;
  };
}

export interface RuleAnalyzer {
  analyze(input: {
    text: string;
    signal: AbortSignal;
  }): Promise<{ rules: ExtractedRule[] }>;
}
