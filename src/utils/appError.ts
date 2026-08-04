export class AppError extends Error {
  statusCode: number;
  errorDetails?: unknown;

  constructor(statusCode: number, message: string, errorDetails?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    this.name = "AppError";
  }
}
