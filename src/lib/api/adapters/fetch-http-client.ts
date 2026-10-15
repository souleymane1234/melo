import { ApiHttpError } from "../errors/api-http-error";
import { parseProblemDetails } from "../errors/problem-details";
import type { HttpClient } from "../ports/http-client.port";
import type { TokenProvider } from "../ports/token-provider.port";
import type { ApiEnvironment } from "../config/api-environment";
import type { HttpRequest } from "../types/http-request";

export interface FetchHttpClientOptions {
  environment: ApiEnvironment;
  /** Optional Authorization: Bearer … */
  getToken?: TokenProvider;
  /** Extra headers merged on every request (e.g. API keys from env). */
  defaultHeaders?: Record<string, string>;
  fetchImplementation?: typeof fetch;
  /** Après 401, appeler puis réessayer une fois avec le nouveau jeton. */
  refreshAccessToken?: () => Promise<string | null>;
  /** Par défaut : pas de refresh sur les routes SMS / refresh. */
  shouldRetryWithRefreshOn401?: (path: string) => boolean;
}

function defaultShouldRetryWithRefreshOn401(path: string): boolean {
  if (path.includes("/api/v1/auth/sms/")) return false;
  if (path.includes("/api/v1/auth/refresh")) return false;
  return true;
}

function buildQueryString(query: HttpRequest["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

function joinUrl(baseUrl: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${p}`;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function throwApiError(
  response: Response,
  body: unknown,
  url: string,
  method: HttpRequest["method"],
): never {
  const problem = parseProblemDetails(body);
  const bodyMessage =
    body && typeof body === "object" && "message" in body && typeof (body as Record<string, unknown>).message === "string"
      ? ((body as Record<string, unknown>).message as string)
      : undefined;
  const message =
    problem?.detail ??
    problem?.title ??
    bodyMessage ??
    (typeof body === "string" && body ? body : response.statusText || "Request failed");
  throw new ApiHttpError({
    message: String(message),
    status: response.status,
    statusText: response.statusText,
    url,
    method,
    problemDetails: problem,
    responseBody: body,
  });
}

/**
 * Fetch-based implementation of {@link HttpClient}.
 */
export function createFetchHttpClient(options: FetchHttpClientOptions): HttpClient {
  const fetchFn = options.fetchImplementation ?? globalThis.fetch.bind(globalThis);
  const {
    environment,
    getToken,
    defaultHeaders = {},
    refreshAccessToken,
    shouldRetryWithRefreshOn401 = defaultShouldRetryWithRefreshOn401,
  } = options;

  return {
    async request<TResponse>(input: HttpRequest): Promise<TResponse> {
      const url = `${joinUrl(environment.baseUrl, input.path)}${buildQueryString(input.query)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), environment.timeoutMs);
      if (input.signal) {
        if (input.signal.aborted) controller.abort();
        else input.signal.addEventListener("abort", () => controller.abort(), { once: true });
      }

      const rawBody = input.body;
      const hasBody = rawBody !== undefined && rawBody !== null;
      const isFormData = typeof FormData !== "undefined" && rawBody instanceof FormData;

      const doFetch = async (bearerToken: string | null): Promise<{ response: Response; body: unknown }> => {
        const headers: Record<string, string> = {
          Accept: "application/json, application/problem+json;q=0.9, */*;q=0.1",
          "Accept-Language": environment.acceptLanguage,
          ...defaultHeaders,
          ...input.headers,
        };

        if (bearerToken) {
          headers.Authorization = `Bearer ${bearerToken}`;
        }

        if (hasBody && !isFormData && !headers["Content-Type"]) {
          headers["Content-Type"] = "application/json; charset=utf-8";
        }

        const fetchBody: BodyInit | undefined = hasBody
          ? isFormData
            ? (rawBody as FormData)
            : JSON.stringify(rawBody)
          : undefined;

        let response: Response;
        try {
          response = await fetchFn(url, {
            method: input.method,
            headers,
            body: fetchBody,
            signal: controller.signal,
          });
        } catch (cause) {
          clearTimeout(timeout);
          const aborted =
            cause instanceof Error && (cause.name === "AbortError" || cause.message.includes("aborted"));
          throw new ApiHttpError({
            message: aborted ? "Request aborted or timed out." : "Network request failed.",
            status: 0,
            statusText: aborted ? "Aborted" : "Network Error",
            url,
            method: input.method,
            cause,
          });
        }

        const body = await readJsonSafely(response);
        return { response, body };
      };

      try {
        const initialToken = getToken ? await Promise.resolve(getToken()) : null;
        let { response, body } = await doFetch(initialToken);

        if (
          response.status === 401 &&
          refreshAccessToken &&
          shouldRetryWithRefreshOn401(input.path)
        ) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            ({ response, body } = await doFetch(newToken));
          }
        }

        clearTimeout(timeout);

        if (!response.ok) {
          throwApiError(response, body, url, input.method);
        }

        return body as TResponse;
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    },
  };
}
