import { API_BASE_URL, ApiError, type BackendErrorResponse } from './api';

type JsonBody = Record<string, unknown> | unknown[];

type VehicleReviewListParams = {
  page?: number;
  size?: number;
  reviewStatus?: string;
  vehicleId?: string;
};

const buildAdminUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const isBackendErrorResponse = (value: unknown): value is BackendErrorResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.timestamp === 'string' &&
    typeof candidate.status === 'number' &&
    typeof candidate.error === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.path === 'string'
  );
};

const readJson = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const toApiError = (response: Response, payload: unknown, path: string) => {
  if (isBackendErrorResponse(payload)) {
    return new ApiError(payload);
  }

  return new ApiError({
    timestamp: new Date().toISOString(),
    status: response.status,
    error: response.statusText || 'Admin request failed',
    message: response.statusText || 'Admin request failed. Please try again.',
    path,
  });
};

const request = async <T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: JsonBody): Promise<T> => {
  const response = await fetch(buildAdminUrl(path), {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw toApiError(response, payload, path);
  }

  return payload as T;
};

export const adminApiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: JsonBody) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: JsonBody) => request<T>('PATCH', path, body),
  getLeadStatusOptions: <T>() => request<T>('GET', '/api/v1/admin/leads/statuses'),
  updateLeadStatus: <T>(leadId: number | string, leadStatus: string) =>
    request<T>('PATCH', `/api/v1/admin/leads/${leadId}/status`, { leadStatus }),
  getContactStatusOptions: <T>() => request<T>('GET', '/api/v1/admin/contact-submissions/statuses'),
  updateContactStatus: <T>(contactId: number | string, contactStatus: string) =>
    request<T>('PATCH', `/api/v1/admin/contact-submissions/${contactId}/status`, { contactStatus }),
  listVehicleReviews: <T>({ page = 0, size = 20, reviewStatus, vehicleId }: VehicleReviewListParams = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (reviewStatus) {
      params.set('reviewStatus', reviewStatus);
    }

    if (vehicleId) {
      params.set('vehicleId', vehicleId);
    }

    return request<T>('GET', `/api/v1/admin/vehicle-reviews?${params.toString()}`);
  },
  getVehicleReviewStatusOptions: <T>() => request<T>('GET', '/api/v1/admin/vehicle-reviews/statuses'),
  updateVehicleReviewStatus: <T>(
    reviewId: number | string,
    reviewStatus: string,
    moderationReason?: string,
  ) =>
    request<T>('PATCH', `/api/v1/admin/vehicle-reviews/${reviewId}/status`, {
      reviewStatus,
      moderationReason,
    }),
};
