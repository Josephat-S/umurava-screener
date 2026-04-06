import { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const createError = (
  message: string,
  statusCode = 500,
  details?: unknown,
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const appError = err as AppError;
  let statusCode = appError.statusCode ?? 500;
  let message = appError.message || "Internal server error";
  let details = appError.details;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = err.flatten();
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.message;
  } else if ((err as { name?: string }).name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  console.error(`[Error ${statusCode}] ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { error: details } : {}),
    ...(process.env.NODE_ENV === "development" && !details ? { error: appError.stack } : {}),
  });
};
