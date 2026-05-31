import { API_BASE_URL, ApiError, type BackendErrorResponse } from './api';

type JsonBody = Record<string, unknown> | unknown[];

type VehicleReviewListParams = {
  page?: number;
  size?: number;
  reviewStatus?: string;
  vehicleId?: string;
};

type ChargerFeedbackListParams = {
  page?: number;
  size?: number;
  feedbackStatus?: string;
  chargerId?: string;
};

type ChargerListParams = {
  page?: number;
  size?: number;
  active?: string;
  city?: string;
  status?: string;
  verificationStatus?: string;
};

type AdminVehicleListParams = {
  page?: number;
  size?: number;
  active?: string;
  type?: string;
  brandId?: string;
  chargerTypeId?: string;
  verificationStatus?: string;
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
  listChargerFeedback: <T>({ page = 0, size = 20, feedbackStatus, chargerId }: ChargerFeedbackListParams = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (feedbackStatus) {
      params.set('feedbackStatus', feedbackStatus);
    }

    if (chargerId) {
      params.set('chargerId', chargerId);
    }

    return request<T>('GET', `/api/v1/admin/charger-feedback?${params.toString()}`);
  },
  getChargerFeedbackStatusOptions: <T>() => request<T>('GET', '/api/v1/admin/charger-feedback/statuses'),
  getChargerFeedback: <T>(feedbackId: number | string) =>
    request<T>('GET', `/api/v1/admin/charger-feedback/${feedbackId}`),
  updateChargerFeedbackStatus: <T>(feedbackId: number | string, feedbackStatus: string) =>
    request<T>('PATCH', `/api/v1/admin/charger-feedback/${feedbackId}/status`, { feedbackStatus }),
  listChargers: <T>({
    page = 0,
    size = 20,
    active,
    city,
    status,
    verificationStatus,
  }: ChargerListParams = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (active) {
      params.set('active', active);
    }

    if (city) {
      params.set('city', city);
    }

    if (status) {
      params.set('status', status);
    }

    if (verificationStatus) {
      params.set('verificationStatus', verificationStatus);
    }

    return request<T>('GET', `/api/v1/admin/chargers?${params.toString()}`);
  },
  getCharger: <T>(chargerId: number | string) => request<T>('GET', `/api/v1/admin/chargers/${chargerId}`),
  getChargerFormOptions: <T>() => request<T>('GET', '/api/v1/admin/chargers/form-options'),
  createCharger: <T>(charger: Record<string, unknown>) => request<T>('POST', '/api/v1/admin/chargers', charger),
  updateCharger: <T>(chargerId: number | string, charger: Record<string, unknown>) =>
    request<T>('PATCH', `/api/v1/admin/chargers/${chargerId}`, charger),
  listVehicles: <T>({
    page = 0,
    size = 20,
    active,
    type,
    brandId,
    chargerTypeId,
    verificationStatus,
  }: AdminVehicleListParams = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (active) {
      params.set('active', active);
    }

    if (type) {
      params.set('type', type);
    }

    if (brandId) {
      params.set('brandId', brandId);
    }

    if (chargerTypeId) {
      params.set('chargerTypeId', chargerTypeId);
    }

    if (verificationStatus) {
      params.set('verificationStatus', verificationStatus);
    }

    return request<T>('GET', `/api/v1/admin/vehicles?${params.toString()}`);
  },
  getVehicle: <T>(vehicleId: number | string) => request<T>('GET', `/api/v1/admin/vehicles/${vehicleId}`),
  getVehicleFormOptions: <T>() => request<T>('GET', '/api/v1/admin/vehicles/form-options'),
  createVehicle: <T>(vehicle: Record<string, unknown>) => request<T>('POST', '/api/v1/admin/vehicles', vehicle),
  updateVehicle: <T>(vehicleId: number | string, vehicle: Record<string, unknown>) =>
    request<T>('PATCH', `/api/v1/admin/vehicles/${vehicleId}`, vehicle),
};
