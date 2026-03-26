import { AppConfig } from "../config/env";
import { StaticBusinessDataRepository } from "./businessDataRepository";
import { BusinessDataRepository } from "./businessData.types";
import {
  AgentExecutionResult,
  AgentQueryCommand,
  AgentQueryPlan,
  AgentQueryResult
} from "./agent.types";
import { AgentQueryPlanner } from "./queryPlanner";
import { AgentQueryExecutor } from "./queryExecutor";

interface CreateAgentServiceDependencies {
  businessDataRepository?: BusinessDataRepository;
  queryPlanner?: AgentQueryPlanner;
  queryExecutor?: AgentQueryExecutor;
}

function buildAnswer(plan: AgentQueryPlan, execution: AgentExecutionResult): string {
  if (!execution.supported || plan.queryType === "unsupported") {
    return execution.reason ?? "当前问题暂不支持智能查询。";
  }

  switch (plan.queryType) {
    case "client_holdings": {
      const countMetric = execution.summary[0]?.value ?? "0";
      const amountMetric = execution.summary[1]?.value ?? "0";

      if (execution.records.length === 0) {
        return `${plan.clientName ?? "该客户"}当前没有符合条件的持仓产品。`;
      }

      return `${plan.clientName ?? "该客户"}当前命中 ${countMetric} 个产品，合计持仓 ${amountMetric}。`;
    }
    case "product_clients": {
      const countMetric = execution.summary[0]?.value ?? "0";
      const amountMetric = execution.summary[1]?.value ?? "0";

      if (execution.records.length === 0) {
        return "没有找到符合条件的客户持仓记录。";
      }

      return `${plan.productName ?? plan.productType ?? "目标产品"}当前命中 ${countMetric} 位客户，合计持仓 ${amountMetric}。`;
    }
    case "follow_up_lookup": {
      const countMetric = execution.summary[0]?.value ?? "0";

      if (execution.records.length === 0) {
        return `${plan.clientName ?? "该客户"}当前没有符合条件的跟进记录。`;
      }

      return `${plan.clientName ?? "该客户"}共命中 ${countMetric} 条跟进记录。`;
    }
    case "client_count": {
      const countMetric = execution.summary[0]?.value ?? "0";
      const rangeLabel =
        plan.timeRange === "last_month"
          ? "上个月"
          : plan.timeRange === "this_month"
            ? "本月"
            : "当前范围";

      return `${rangeLabel}新增了 ${countMetric} 个客户。`;
    }
    default:
      return "当前问题暂不支持智能查询。";
  }
}

export class AgentService {
  constructor(
    private readonly businessDataRepository: BusinessDataRepository,
    private readonly queryPlanner: AgentQueryPlanner,
    private readonly queryExecutor: AgentQueryExecutor
  ) {}

  async query(command: AgentQueryCommand): Promise<AgentQueryResult> {
    const snapshot = await this.businessDataRepository.getSnapshot();
    const planning = await this.queryPlanner.plan(command.question, snapshot);
    const execution = this.queryExecutor.execute(planning.plan, snapshot);

    return {
      question: command.question,
      answer: buildAnswer(planning.plan, execution),
      plannerSource: planning.source,
      warnings: planning.warnings,
      trace: planning.trace,
      ...execution
    };
  }
}

export function createAgentService(
  _config: AppConfig,
  dependencies: CreateAgentServiceDependencies = {}
) {
  const businessDataRepository =
    dependencies.businessDataRepository ?? new StaticBusinessDataRepository();
  const queryPlanner = dependencies.queryPlanner ?? new AgentQueryPlanner();
  const queryExecutor = dependencies.queryExecutor ?? new AgentQueryExecutor();

  return new AgentService(businessDataRepository, queryPlanner, queryExecutor);
}
