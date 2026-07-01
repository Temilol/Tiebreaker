export interface ProConItem {
  point: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface OptionProsCons {
  option: string;
  pros: ProConItem[];
  cons: ProConItem[];
}

export interface OptionScore {
  option: string;
  score: number; // 1 to 5
  justification: string;
}

export interface ComparisonCriteria {
  criteria: string;
  optionScores: OptionScore[];
}

export interface SwotReport {
  option: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Verdict {
  recommendedOption: string;
  confidence: number; // 0 to 100
  reasoning: string;
  keyTradeoff: string;
  nextSteps: string[];
}

export interface DecisionReport {
  verdict: Verdict;
  prosCons: OptionProsCons[];
  comparisonTable: ComparisonCriteria[];
  swotAnalysis: SwotReport[];
}

export interface SavedDecision {
  id: string;
  topic: string;
  options: string[];
  optionImages?: (string | null)[];
  preferences: string;
  date: string;
  report: DecisionReport;
  tags?: string[];
  chatHistory?: ChatMessage[];
  parentId?: string;
  branchedFromOption?: string;
  childIds?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
