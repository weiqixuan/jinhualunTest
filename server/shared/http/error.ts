export interface FieldError {
  field: string;
  message: string;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  fieldErrors?: FieldError[];

  constructor(statusCode: number, code: string, message: string, fieldErrors?: FieldError[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
