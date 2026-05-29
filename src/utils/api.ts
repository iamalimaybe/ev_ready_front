const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

export const API_BASE_URL = configuredApiBaseUrl || "http://localhost:8080";

export type BackendFieldErrors = Record<string, string> | BackendFieldError[];

export interface BackendFieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: BackendFieldErrors;
}

export class ApiError extends Error {
  readonly response: BackendErrorResponse;

  constructor(response: BackendErrorResponse) {
    super(response.message || response.error || "API request failed");
    this.name = "ApiError";
    this.response = response;
  }
}

type JsonBody = Record<string, unknown> | unknown[];

export type VehicleReviewExperienceTypeOption = {
  value: string;
  label: string;
  description?: string | null;
  displayOrder?: number | null;
};

export type VehicleReviewSubmission = {
  rating: number;
  experienceType: string;
  reviewText?: string;
  displayName?: string;
  city?: string;
};

export type VehicleReviewSubmissionResponse = {
  id?: string | number;
  status?: string;
  message?: string;
};

export type PublicVehicleReview = {
  id?: string | number;
  rating?: number | string | null;
  reviewText?: string | null;
  displayName?: string | null;
  city?: string | null;
  experienceType?: string | null;
  createdAt?: string | null;
};

export type PageResponse<T> = {
  content?: T[];
  number?: number;
  page?: number;
  size?: number;
  totalPages?: number;
  totalElements?: number;
  first?: boolean;
  last?: boolean;
};

interface RequestOptions {
  body?: JsonBody;
}

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

const isBackendErrorResponse = (value: unknown): value is BackendErrorResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.timestamp === "string" &&
    typeof candidate.status === "number" &&
    typeof candidate.error === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.path === "string"
  );
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

const toApiError = (response: Response, payload: unknown, path: string) => {
  if (isBackendErrorResponse(payload)) {
    return new ApiError(payload);
  }

  return new ApiError({
    timestamp: new Date().toISOString(),
    status: response.status,
    error: response.statusText || "Request failed",
    message: response.statusText || "Request failed",
    path,
  });
};

const request = async <T>(method: "GET" | "POST", path: string, options: RequestOptions = {}) => {
  const response = await fetch(buildUrl(path), {
    method,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw toApiError(response, payload, path);
  }

  return payload as T;
};

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: JsonBody) => request<T>("POST", path, { body }),
};

export const vehicleReviewApi = {
  getExperienceTypes: () =>
    apiClient.get<VehicleReviewExperienceTypeOption[]>(
      "/api/v1/vehicles/reviews/experience-types",
    ),
  submitReview: (vehicleId: string, review: VehicleReviewSubmission) =>
    apiClient.post<VehicleReviewSubmissionResponse>(
      `/api/v1/vehicles/${encodeURIComponent(vehicleId)}/reviews`,
      review,
    ),
  getApprovedReviews: (vehicleId: string, page = 0, size = 10) =>
    apiClient.get<PageResponse<PublicVehicleReview> | PublicVehicleReview[]>(
      `/api/v1/vehicles/${encodeURIComponent(vehicleId)}/reviews?page=${page}&size=${size}`,
    ),
};
