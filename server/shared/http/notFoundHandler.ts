import { RequestHandler } from "express";
import { AppError } from "./error";

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new AppError(404, "NOT_FOUND", "请求的接口不存在。"));
};
