import {
  ApiErrorResponse,
  AuthFieldError,
  CurrentUserResponse,
  AuthSuccessResponse,
  AuthUser,
  LoginValues,
  RegisterValues
} from "../features/auth/types";

export class AuthApiError extends Error {
  status: number;
  code: string;
  fieldErrors: AuthFieldError[];

  constructor(status: number, code: string, message: string, fieldErrors: AuthFieldError[] = []) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === "object" && value !== null && "error" in value;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const hasJsonBody = contentType.includes("application/json");
  const body: unknown = hasJsonBody ? await response.json() : null;

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw new AuthApiError(
        response.status,
        body.error.code,
        body.error.message,
        body.error.fieldErrors ?? []
      );
    }

    throw new AuthApiError(response.status, "REQUEST_FAILED", "请求失败，请稍后重试。");
  }

  return body as T;
}

async function requestJson<T>(path: string, options: RequestInit): Promise<T> {
  const response = await window.fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  return parseResponse<T>(response);
}

export async function registerUser(values: RegisterValues): Promise<AuthUser> {
  const response = await requestJson<AuthSuccessResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(values)
  });

  return response.user;
}

export async function loginUser(values: LoginValues): Promise<AuthUser> {
  const response = await requestJson<AuthSuccessResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(values)
  });

  return response.user;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await requestJson<CurrentUserResponse>("/api/auth/me", {
    method: "GET"
  });

  return response.user;
}

export async function logoutUser(): Promise<void> {
  await requestJson<{ ok: true }>("/api/auth/logout", {
    method: "POST"
  });
}
