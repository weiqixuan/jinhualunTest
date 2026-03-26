import { z } from "zod";
import { AppError, FieldError } from "../shared/http/error";
import { LoginCommand, RegisterCommand } from "./auth.types";

const emailSchema = z
  .string()
  .trim()
  .min(1, "请输入邮箱。")
  .email("请输入有效邮箱地址。")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "密码至少 8 位。")
  .max(72, "密码不能超过 72 位。");

const displayNameSchema = z
  .string()
  .trim()
  .min(2, "姓名至少 2 个字符。")
  .max(32, "姓名不能超过 32 个字符。");

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "请输入密码。")
});

function toFieldErrors(issues: z.ZodIssue[]): FieldError[] {
  return issues.map((issue) => ({
    field: issue.path.join(".") || "form",
    message: issue.message
  }));
}

function parseSchema<T>(schema: z.ZodSchema<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "请求参数不合法。", toFieldErrors(parsed.error.issues));
  }

  return parsed.data;
}

export function parseRegisterCommand(payload: unknown): RegisterCommand {
  return parseSchema(registerSchema, payload);
}

export function parseLoginCommand(payload: unknown): LoginCommand {
  return parseSchema(loginSchema, payload);
}
