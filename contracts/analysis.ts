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

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

export type RuleType = (typeof RULE_TYPES)[number];
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

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

export const ANALYSIS_ERROR_CODES = [
  "FILE_REQUIRED",
  "INVALID_FILE_TYPE",
  "FILE_TOO_LARGE",
  "EMPTY_FILE",
  "DOCUMENT_UNREADABLE",
  "RATE_LIMITED",
  "AI_INVALID_RESPONSE",
  "AI_UNAVAILABLE",
  "AI_TIMEOUT",
  "INTERNAL_ERROR",
] as const;

export type AnalysisErrorCode = (typeof ANALYSIS_ERROR_CODES)[number];

export interface AnalysisErrorResponse {
  error: {
    code: AnalysisErrorCode;
    message: string;
    requestId: string;
  };
}
