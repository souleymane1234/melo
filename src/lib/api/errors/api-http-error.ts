import type { ProblemDetails } from "./problem-details";

export interface ApiHttpErrorInit {
  message: string;
  status: number;
  statusText: string;
  url: string;
  method: string;
  problemDetails?: ProblemDetails;
  responseBody?: unknown;
  cause?: unknown;
}

/**
 * Normalized failure for HTTP calls (transport + non-2xx responses).
 */
export class ApiHttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly method: string;
  readonly problemDetails?: ProblemDetails;
  readonly responseBody?: unknown;

  constructor(init: ApiHttpErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
    this.name = "ApiHttpError";
    this.status = init.status;
    this.statusText = init.statusText;
    this.url = init.url;
    this.method = init.method;
    this.problemDetails = init.problemDetails;
    this.responseBody = init.responseBody;
  }

  static isInstance(error: unknown): error is ApiHttpError {
    return error instanceof ApiHttpError;
  }
}
