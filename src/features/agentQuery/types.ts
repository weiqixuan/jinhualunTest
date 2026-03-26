export type AgentQueryType =
  | "client_holdings"
  | "product_clients"
  | "follow_up_lookup"
  | "client_count"
  | "unsupported";

export type AgentPlannerSource = "mock";

export interface AgentAppliedFilter {
  label: string;
  value: string;
}

export interface AgentSummaryMetric {
  label: string;
  value: string;
}

export interface MockAgentTrace {
  normalizedQuestion: string;
  matchedIntent: string;
  matchedEntities: AgentAppliedFilter[];
  appliedRules: string[];
}

export interface AgentHoldingRecord {
  kind: "holding";
  clientId: string;
  clientName: string;
  productId: string;
  productName: string;
  productType: string;
  productStatus: string;
  positionStatus: string;
  amount: number;
}

export interface AgentClientRecord {
  kind: "client";
  clientId: string;
  clientName: string;
  company: string;
  owner: string;
  productId: string | null;
  productName: string | null;
  amount: number | null;
  positionStatus: string | null;
}

export interface AgentFollowUpRecord {
  kind: "follow_up";
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  channel: string;
  content: string;
  relatedProductNames: string[];
}

export type AgentResultRecord =
  | AgentHoldingRecord
  | AgentClientRecord
  | AgentFollowUpRecord;

export interface AgentQueryResult {
  question: string;
  answer: string;
  queryType: AgentQueryType;
  supported: boolean;
  reason: string | null;
  plannerSource: AgentPlannerSource;
  warnings: string[];
  trace: MockAgentTrace;
  appliedFilters: AgentAppliedFilter[];
  summary: AgentSummaryMetric[];
  records: AgentResultRecord[];
}

export interface AgentApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
