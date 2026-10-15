/**
 * RFC 7807 Problem Details for HTTP APIs (application/problem+json).
 * @see https://www.rfc-editor.org/rfc/rfc7807
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [extension: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Attempts to interpret an arbitrary JSON body as Problem Details.
 * Returns undefined if the shape is not compatible.
 */
export function parseProblemDetails(body: unknown): ProblemDetails | undefined {
  if (!isRecord(body)) return undefined;
  const { type, title, status, detail, instance } = body;
  const hasCoreField =
    typeof type === "string" ||
    typeof title === "string" ||
    typeof status === "number" ||
    typeof detail === "string" ||
    typeof instance === "string";
  if (!hasCoreField) return undefined;
  return body as ProblemDetails;
}
