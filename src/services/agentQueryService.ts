import { AgentApiErrorResponse, AgentQueryResult } from "../features/agentQuery/types";

export class AgentApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AgentApiError";
    this.status = status;
    this.code = code;
  }
}

function isApiErrorResponse(value: unknown): value is AgentApiErrorResponse {
  return typeof value === "object" && value !== null && "error" in value;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const hasJsonBody = contentType.includes("application/json");
  const body: unknown = hasJsonBody ? await response.json() : null;

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      if (response.status === 404 && body.error.code === "NOT_FOUND") {
        throw new AgentApiError(
          response.status,
          body.error.code,
          "当前运行的后端未包含智能查询接口，请重启后端或部署最新版本。"
        );
      }

      throw new AgentApiError(response.status, body.error.code, body.error.message);
    }

    if (response.status === 404) {
      throw new AgentApiError(response.status, "NOT_FOUND", "当前运行的后端未包含智能查询接口，请重启后端或部署最新版本。");
    }

    throw new AgentApiError(response.status, "REQUEST_FAILED", "智能查询请求失败，请稍后重试。");
  }

  return body as T;
}

export async function queryAgent(question: string): Promise<AgentQueryResult> {
  const response = await window.fetch("/api/agent/query", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  return parseResponse<AgentQueryResult>(response);
}
