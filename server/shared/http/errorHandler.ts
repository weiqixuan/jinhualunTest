import { ErrorRequestHandler } from "express";
import { AppError, isAppError } from "./error";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (isAppError(error)) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        fieldErrors: error.fieldErrors
      }
    });
    return;
  }

  const fallback = new AppError(500, "INTERNAL_ERROR", "服务暂时不可用，请稍后重试。");

  response.status(fallback.statusCode).json({
    error: {
      code: fallback.code,
      message: fallback.message
    }
  });
};
