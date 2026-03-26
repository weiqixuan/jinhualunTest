import { z } from "zod";
import { AppError, FieldError } from "../shared/http/error";
import { AgentQueryCommand } from "./agent.types";

const questionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "请输入至少 2 个字符的问题。")
    .max(160, "问题不能超过 160 个字符。")
});

function toFieldErrors(issues: z.ZodIssue[]): FieldError[] {
  return issues.map((issue) => ({
    field: issue.path.join(".") || "form",
    message: issue.message
  }));
}

export function parseAgentQueryCommand(payload: unknown): AgentQueryCommand {
  const parsed = questionSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "请求参数不合法。", toFieldErrors(parsed.error.issues));
  }

  return parsed.data;
}
