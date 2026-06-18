const configuredRecommenderBaseUrl = import.meta.env.VITE_RECOMMENDER_API_BASE_URL?.trim().replace(
  /\/+$/,
  '',
);

export const RECOMMENDER_API_BASE_URL = configuredRecommenderBaseUrl || 'http://localhost:8081';

export type RecommenderHealthStatus = 'UP' | 'DOWN';

export type RecommendationRunStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'RUNNING'
  | 'ANSWERED'
  | 'INSUFFICIENT_CANDIDATES'
  | 'NEEDS_MORE_INFORMATION'
  | 'FAILED'
  | 'TIMED_OUT';

export type RecommendationValidationStatus = 'NOT_VALIDATED' | 'VALID' | 'INVALID';

export type RecommendationRequest = {
  vehicleType?: string;
  budgetPkr?: number;
  city?: string;
  dailyDistanceKm?: number;
  monthlyDistanceKm?: number;
  homeChargingAvailable?: boolean;
  solarAvailable?: boolean;
  primaryUseCase?: string;
  familySize?: number;
  priority?: string;
  additionalNotes?: string;
};

export type RecommendationItem = {
  vehicleId: number;
  rank: number;
  matchReason: string;
  tradeoffs: string[];
  factsUsed: string[];
};

export type RecommendationResponse = {
  id: number;
  status: RecommendationRunStatus;
  summary: string | null;
  recommendations: RecommendationItem[];
  missingInformation: string[];
  warnings: string[];
  validationStatus: RecommendationValidationStatus;
  failureReason: string | null;
};

export type RecommenderFieldError = {
  field: string;
  message: string;
  rejectedValue?: unknown;
};

export type RecommenderErrorResponse = {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  fieldErrors?: RecommenderFieldError[] | Record<string, string>;
};

type ActuatorHealthResponse = {
  status?: string;
};

export class RecommenderApiError extends Error {
  readonly response: RecommenderErrorResponse;

  constructor(response: RecommenderErrorResponse) {
    super(response.message || response.error || 'Recommendation request failed');
    this.name = 'RecommenderApiError';
    this.response = response;
  }
}

const inProgressStatuses: RecommendationRunStatus[] = ['PENDING', 'QUEUED', 'RUNNING'];

export function isRecommendationInProgress(status: RecommendationRunStatus) {
  return inProgressStatuses.includes(status);
}

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${RECOMMENDER_API_BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

const isErrorPayload = (payload: unknown): payload is RecommenderErrorResponse => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.status === 'number' &&
    typeof candidate.error === 'string' &&
    typeof candidate.message === 'string'
  );
};

const toApiError = (response: Response, payload: unknown, path: string) => {
  if (isErrorPayload(payload)) {
    return new RecommenderApiError(payload);
  }

  return new RecommenderApiError({
    status: response.status,
    error: response.statusText || 'Request failed',
    message: response.statusText || 'Request failed',
    path,
  });
};

const request = async <T>(method: 'GET' | 'POST', path: string, body?: unknown) => {
  const response = await fetch(buildUrl(path), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw toApiError(response, payload, path);
  }

  return payload as T;
};

export const recommenderApi = {
  createRecommendation: (body: RecommendationRequest) =>
    request<RecommendationResponse>('POST', '/api/v1/recommendations', body),

  getRecommendation: (id: number) =>
    request<RecommendationResponse>('GET', `/api/v1/recommendations/${encodeURIComponent(id)}`),

  async getHealth(): Promise<RecommenderHealthStatus> {
    try {
      const response = await fetch(`${RECOMMENDER_API_BASE_URL}/actuator/health`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return 'DOWN';
      }

      const data = (await response.json()) as ActuatorHealthResponse;

      return data.status === 'UP' ? 'UP' : 'DOWN';
    } catch {
      return 'DOWN';
    }
  },
};