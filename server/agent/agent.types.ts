import type { SafeUser } from "../auth/auth.types";

export type AgentQueryType =
  | "client_holdings"
  | "product_clients"
  | "follow_up_lookup"
  | "client_count"
  | "unsupported";

export type SupportedAgentQueryType = Exclude<AgentQueryType, "unsupported">;
export type AgentPlannerSource = "mock";
export type AgentTimeRange = "all_time" | "this_month" | "last_month";

export interface AgentQueryCommand {
  question: string;
}

export interface AgentQueryPlan {
  supported: boolean;
  queryType: AgentQueryType;
  clientName: string | null;
  productName: string | null;
  productType: string | null;
  productStatus: string | null;
  positionStatus: string | null;
  followUpChannel: string | null;
  timeRange: AgentTimeRange | null;
  reason: string | null;
}

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

export interface AgentFollowUpRecordResult {
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
  | AgentFollowUpRecordResult;

export interface AgentExecutionResult {
  queryType: AgentQueryType;
  supported: boolean;
  reason: string | null;
  appliedFilters: AgentAppliedFilter[];
  summary: AgentSummaryMetric[];
  records: AgentResultRecord[];
}

export interface AgentQueryResult extends AgentExecutionResult {
  question: string;
  answer: string;
  plannerSource: AgentPlannerSource;
  warnings: string[];
  trace: MockAgentTrace;
}

export interface AgentQueryContext {
  currentUser: SafeUser;
}
