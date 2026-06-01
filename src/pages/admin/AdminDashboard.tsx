import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, type BackendFieldErrors } from '../../utils/api';
import { adminApiClient } from '../../utils/adminApi';

type AdminSession = {
  username?: string;
};

type Lead = {
  id: number | string;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  interestType?: string | null;
  leadStatus?: string | null;
  createdAt?: string | null;
  message?: string | null;
  sourcePage?: string | null;
};

type ContactSubmission = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  organization?: string | null;
  inquiryType?: string | null;
  contactStatus?: string | null;
  createdAt?: string | null;
  message?: string | null;
  sourcePage?: string | null;
};

type VehicleReview = {
  id: number | string;
  vehicleId?: number | string | null;
  rating?: number | string | null;
  reviewText?: string | null;
  displayName?: string | null;
  city?: string | null;
  experienceType?: string | null;
  reviewStatus?: string | null;
  createdAt?: string | null;
  moderatedAt?: string | null;
  moderatedBy?: string | null;
  moderationReason?: string | null;
};

type ChargerFeedback = {
  id: number | string;
  chargerId?: number | string | null;
  chargerName?: string | null;
  rating?: number | string | null;
  feedbackType?: string | null;
  message?: string | null;
  displayName?: string | null;
  city?: string | null;
  reportedByContact?: string | null;
  feedbackStatus?: string | null;
  createdAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  moderatedAt?: string | null;
  moderatedBy?: string | null;
};

type AdminCharger = {
  id: number | string;
  chargerTypeId?: number | string | null;
  chargerType?: {
    id?: number | string | null;
    name?: string | null;
  } | null;
  name?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  chargingType?: string | null;
  status?: string | null;
  powerKw?: number | string | null;
  priceNote?: string | null;
  description?: string | null;
  image?: string | null;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
  sourceCheckedAt?: string | null;
  verificationStatus?: string | null;
  active?: boolean | string | null;
  displayOrder?: number | string | null;
};

type AdminVehicle = {
  id: number | string;
  type?: string | null;
  brandId?: number | string | null;
  brand?: {
    id?: number | string | null;
    name?: string | null;
  } | null;
  chargerTypeId?: number | string | null;
  chargerType?: {
    id?: number | string | null;
    name?: string | null;
  } | null;
  model?: string | null;
  variant?: string | null;
  pricePkr?: number | string | null;
  rangeKm?: number | string | null;
  batteryCapacityKwh?: number | string | null;
  dcFastCharging?: boolean | string | null;
  image?: string | null;
  description?: string | null;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
  sourceCheckedAt?: string | null;
  verificationStatus?: string | null;
  active?: boolean | string | null;
  displayOrder?: number | string | null;
};

type StatusOption = {
  value: string;
  label: string;
};

type ChargerFormOption = {
  value: string;
  label: string;
};

type ChargerFormOptions = {
  chargerTypes: ChargerFormOption[];
  chargingTypes: ChargerFormOption[];
  statuses: ChargerFormOption[];
  verificationStatuses: ChargerFormOption[];
};

type VehicleFormOptions = {
  brands: ChargerFormOption[];
  chargerTypes: ChargerFormOption[];
  vehicleTypes: ChargerFormOption[];
  verificationStatuses: ChargerFormOption[];
};

type ChargerFormState = {
  chargerTypeId: string;
  name: string;
  city: string;
  area: string;
  address: string;
  latitude: string;
  longitude: string;
  chargingType: string;
  status: string;
  powerKw: string;
  priceNote: string;
  description: string;
  image: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceCheckedAt: string;
  verificationStatus: string;
  active: boolean;
  displayOrder: string;
};

type ChargerFormErrors = Partial<Record<keyof ChargerFormState, string>>;

type VehicleFormState = {
  type: string;
  brandId: string;
  chargerTypeId: string;
  model: string;
  variant: string;
  pricePkr: string;
  rangeKm: string;
  batteryCapacityKwh: string;
  dcFastCharging: boolean;
  image: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceCheckedAt: string;
  verificationStatus: string;
  active: boolean;
  displayOrder: string;
};

type VehicleFormErrors = Partial<Record<keyof VehicleFormState, string>>;

type PagePayload<T> = {
  content?: T[];
  number?: number;
  page?: number;
  size?: number;
  totalPages?: number;
  totalElements?: number;
  first?: boolean;
  last?: boolean;
};

type PageState<T> = {
  items: T[];
  page: number;
  totalPages?: number;
  totalElements?: number;
  isLoading: boolean;
  error: string | null;
};

type AdminSection = 'leads' | 'contacts' | 'vehicles' | 'vehicleReviews' | 'chargerFeedback' | 'chargers';
type AdminMenuGroup = 'ev' | 'chargers' | null;
type ChargerManagementView = 'list' | 'create' | 'edit';
type VehicleManagementView = 'list' | 'create' | 'edit';

type ModerationDraft = {
  reviewStatus: string;
  moderationReason: string;
};

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

const primaryButtonClass =
  'rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300';

const initialChargerForm: ChargerFormState = {
  chargerTypeId: '',
  name: '',
  city: '',
  area: '',
  address: '',
  latitude: '',
  longitude: '',
  chargingType: '',
  status: '',
  powerKw: '',
  priceNote: '',
  description: '',
  image: '',
  sourceUrl: '',
  sourceLabel: '',
  sourceCheckedAt: '',
  verificationStatus: '',
  active: true,
  displayOrder: '0',
};

const emptyChargerFormOptions: ChargerFormOptions = {
  chargerTypes: [],
  chargingTypes: [],
  statuses: [],
  verificationStatuses: [],
};

const initialVehicleForm: VehicleFormState = {
  type: '',
  brandId: '',
  chargerTypeId: '',
  model: '',
  variant: '',
  pricePkr: '',
  rangeKm: '',
  batteryCapacityKwh: '',
  dcFastCharging: false,
  image: '',
  description: '',
  sourceUrl: '',
  sourceLabel: '',
  sourceCheckedAt: '',
  verificationStatus: '',
  active: true,
  displayOrder: '0',
};

const emptyVehicleFormOptions: VehicleFormOptions = {
  brands: [],
  chargerTypes: [],
  vehicleTypes: [],
  verificationStatuses: [],
};

const emptyPage = <T,>(page = 0): PageState<T> => ({
  items: [],
  page,
  isLoading: false,
  error: null,
});

const normalizePage = <T,>(payload: PagePayload<T> | T[], fallbackPage: number): PageState<T> => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: fallbackPage,
      isLoading: false,
      error: null,
    };
  }

  return {
    items: Array.isArray(payload.content) ? payload.content : [],
    page: typeof payload.number === 'number' ? payload.number : payload.page ?? fallbackPage,
    totalPages: payload.totalPages,
    totalElements: payload.totalElements,
    isLoading: false,
    error: null,
  };
};

const getAdminErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && (error.response.status === 401 || error.response.status === 403)) {
    return 'Your admin session is not active. Please sign in again.';
  }

  return 'Unable to load admin data right now.';
};

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') {
    return 'Not listed';
  }

  return String(value);
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not listed';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatStatusLabel = (value: string | null | undefined, options: StatusOption[]) => {
  if (!value) {
    return 'Not listed';
  }

  const option = options.find((status) => status.value === value);
  if (option) {
    return option.label;
  }

  return value;
};

const getChargerTypeName = (charger: AdminCharger) => {
  if (charger.chargerType?.name) {
    return charger.chargerType.name;
  }

  return formatValue(charger.chargerTypeId);
};

const formatAreaAddress = (charger: AdminCharger) => {
  const parts = [charger.area, charger.address].filter((value) => value !== null && value !== undefined && value !== '');
  return parts.length > 0 ? parts.join(' - ') : 'Not listed';
};

const normalizeOption = (option: unknown): ChargerFormOption | null => {
  if (!option || typeof option !== 'object') {
    return null;
  }

  const candidate = option as Record<string, unknown>;
  const rawValue = candidate.value ?? candidate.id ?? candidate.code;
  const rawLabel = candidate.label ?? candidate.name ?? candidate.value ?? candidate.id ?? candidate.code;

  if (rawValue === null || rawValue === undefined || rawLabel === null || rawLabel === undefined) {
    return null;
  }

  return {
    value: String(rawValue),
    label: String(rawLabel),
  };
};

const normalizeOptions = (options: unknown): ChargerFormOption[] =>
  Array.isArray(options)
    ? options.map((option) => normalizeOption(option)).filter((option): option is ChargerFormOption => Boolean(option))
    : [];

const normalizeChargerFormOptions = (payload: unknown): ChargerFormOptions => {
  if (!payload || typeof payload !== 'object') {
    return emptyChargerFormOptions;
  }

  const options = payload as Record<string, unknown>;

  return {
    chargerTypes: normalizeOptions(options.chargerTypes ?? options.chargerTypeOptions),
    chargingTypes: normalizeOptions(options.chargingTypes ?? options.chargingTypeOptions),
    statuses: normalizeOptions(options.statuses ?? options.statusOptions ?? options.chargerStatuses),
    verificationStatuses: normalizeOptions(
      options.verificationStatuses ?? options.verificationStatusOptions ?? options.sourceConfidenceOptions,
    ),
  };
};

const normalizeVehicleFormOptions = (payload: unknown): VehicleFormOptions => {
  if (!payload || typeof payload !== 'object') {
    return emptyVehicleFormOptions;
  }

  const options = payload as Record<string, unknown>;

  return {
    brands: normalizeOptions(options.brands ?? options.brandOptions),
    chargerTypes: normalizeOptions(options.chargerTypes ?? options.chargerTypeOptions),
    vehicleTypes: normalizeOptions(options.vehicleTypes ?? options.typeOptions ?? options.types),
    verificationStatuses: normalizeOptions(
      options.verificationStatuses ?? options.verificationStatusOptions ?? options.sourceConfidenceOptions,
    ),
  };
};

const getChargerTypeId = (charger: AdminCharger) => charger.chargerTypeId ?? charger.chargerType?.id ?? '';

const getVehicleBrandId = (vehicle: AdminVehicle) => vehicle.brandId ?? vehicle.brand?.id ?? '';

const getVehicleChargerTypeId = (vehicle: AdminVehicle) => vehicle.chargerTypeId ?? vehicle.chargerType?.id ?? '';

const getVehicleBrandName = (vehicle: AdminVehicle) => {
  if (vehicle.brand?.name) {
    return vehicle.brand.name;
  }

  return formatValue(vehicle.brandId);
};

const getVehicleChargerTypeName = (vehicle: AdminVehicle) => {
  if (vehicle.chargerType?.name) {
    return vehicle.chargerType.name;
  }

  return formatValue(vehicle.chargerTypeId);
};

const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
};

const chargerToForm = (charger: AdminCharger): ChargerFormState => ({
  chargerTypeId: String(getChargerTypeId(charger)),
  name: String(charger.name ?? ''),
  city: String(charger.city ?? ''),
  area: String(charger.area ?? ''),
  address: String(charger.address ?? ''),
  latitude: String(charger.latitude ?? ''),
  longitude: String(charger.longitude ?? ''),
  chargingType: String(charger.chargingType ?? ''),
  status: String(charger.status ?? ''),
  powerKw: String(charger.powerKw ?? ''),
  priceNote: String(charger.priceNote ?? ''),
  description: String(charger.description ?? ''),
  image: String(charger.image ?? ''),
  sourceUrl: String(charger.sourceUrl ?? ''),
  sourceLabel: String(charger.sourceLabel ?? ''),
  sourceCheckedAt: toDateInputValue(charger.sourceCheckedAt),
  verificationStatus: String(charger.verificationStatus ?? ''),
  active: charger.active === false || charger.active === 'false' ? false : true,
  displayOrder: String(charger.displayOrder ?? '0'),
});

const vehicleToForm = (vehicle: AdminVehicle): VehicleFormState => ({
  type: String(vehicle.type ?? ''),
  brandId: String(getVehicleBrandId(vehicle)),
  chargerTypeId: String(getVehicleChargerTypeId(vehicle)),
  model: String(vehicle.model ?? ''),
  variant: String(vehicle.variant ?? ''),
  pricePkr: String(vehicle.pricePkr ?? ''),
  rangeKm: String(vehicle.rangeKm ?? ''),
  batteryCapacityKwh: String(vehicle.batteryCapacityKwh ?? ''),
  dcFastCharging: vehicle.dcFastCharging === true || vehicle.dcFastCharging === 'true',
  image: String(vehicle.image ?? ''),
  description: String(vehicle.description ?? ''),
  sourceUrl: String(vehicle.sourceUrl ?? ''),
  sourceLabel: String(vehicle.sourceLabel ?? ''),
  sourceCheckedAt: toDateInputValue(vehicle.sourceCheckedAt),
  verificationStatus: String(vehicle.verificationStatus ?? ''),
  active: vehicle.active === false || vehicle.active === 'false' ? false : true,
  displayOrder: String(vehicle.displayOrder ?? '0'),
});

const trimOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const optionalStringField = (key: string, value: string) => {
  const trimmed = trimOptional(value);
  return trimmed ? { [key]: trimmed } : {};
};

const optionalNumberField = (key: string, value: string) => {
  const trimmed = trimOptional(value);
  if (!trimmed) {
    return {};
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? { [key]: parsed } : { [key]: trimmed };
};

const chargerFormToPayload = (form: ChargerFormState) => ({
  ...optionalNumberField('chargerTypeId', form.chargerTypeId),
  ...optionalStringField('name', form.name),
  ...optionalStringField('city', form.city),
  ...optionalStringField('area', form.area),
  ...optionalStringField('address', form.address),
  ...optionalNumberField('latitude', form.latitude),
  ...optionalNumberField('longitude', form.longitude),
  ...optionalStringField('chargingType', form.chargingType),
  ...optionalStringField('status', form.status),
  ...optionalNumberField('powerKw', form.powerKw),
  ...optionalStringField('priceNote', form.priceNote),
  ...optionalStringField('description', form.description),
  ...optionalStringField('image', form.image),
  ...optionalStringField('sourceUrl', form.sourceUrl),
  ...optionalStringField('sourceLabel', form.sourceLabel),
  ...optionalStringField('sourceCheckedAt', form.sourceCheckedAt),
  ...optionalStringField('verificationStatus', form.verificationStatus),
  active: form.active,
  ...optionalNumberField('displayOrder', form.displayOrder),
});

const vehicleFormToPayload = (form: VehicleFormState) => ({
  ...optionalStringField('type', form.type),
  ...optionalNumberField('brandId', form.brandId),
  ...optionalNumberField('chargerTypeId', form.chargerTypeId),
  ...optionalStringField('model', form.model),
  ...optionalStringField('variant', form.variant),
  ...optionalNumberField('pricePkr', form.pricePkr),
  ...optionalNumberField('rangeKm', form.rangeKm),
  ...optionalNumberField('batteryCapacityKwh', form.batteryCapacityKwh),
  dcFastCharging: form.dcFastCharging,
  ...optionalStringField('image', form.image),
  ...optionalStringField('description', form.description),
  ...optionalStringField('sourceUrl', form.sourceUrl),
  ...optionalStringField('sourceLabel', form.sourceLabel),
  ...optionalStringField('sourceCheckedAt', form.sourceCheckedAt),
  ...optionalStringField('verificationStatus', form.verificationStatus),
  active: form.active,
  ...optionalNumberField('displayOrder', form.displayOrder),
});

const isChargerFormField = (field: string): field is keyof ChargerFormState => field in initialChargerForm;

const isVehicleFormField = (field: string): field is keyof VehicleFormState => field in initialVehicleForm;

const getChargerFieldErrors = (fieldErrors: BackendFieldErrors | undefined): ChargerFormErrors => {
  if (!fieldErrors) {
    return {};
  }

  const nextErrors: ChargerFormErrors = {};

  if (Array.isArray(fieldErrors)) {
    fieldErrors.forEach((fieldError) => {
      if (isChargerFormField(fieldError.field) && fieldError.message) {
        nextErrors[fieldError.field] = fieldError.message;
      }
    });
    return nextErrors;
  }

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (isChargerFormField(field) && message) {
      nextErrors[field] = message;
    }
  });

  return nextErrors;
};

const getVehicleFieldErrors = (fieldErrors: BackendFieldErrors | undefined): VehicleFormErrors => {
  if (!fieldErrors) {
    return {};
  }

  const nextErrors: VehicleFormErrors = {};

  if (Array.isArray(fieldErrors)) {
    fieldErrors.forEach((fieldError) => {
      if (isVehicleFormField(fieldError.field) && fieldError.message) {
        nextErrors[fieldError.field] = fieldError.message;
      }
    });
    return nextErrors;
  }

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (isVehicleFormField(field) && message) {
      nextErrors[field] = message;
    }
  });

  return nextErrors;
};

const hasNextPage = <T,>(pageState: PageState<T>) => {
  if (typeof pageState.totalPages === 'number') {
    return pageState.page + 1 < pageState.totalPages;
  }

  return pageState.items.length === DEFAULT_PAGE_SIZE;
};

const hasNextPaginatedPage = <T,>(pageState: PageState<T>) =>
  typeof pageState.totalPages === 'number' && pageState.page + 1 < pageState.totalPages;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [adminUser, setAdminUser] = useState<AdminSession | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('leads');
  const [openMenuGroup, setOpenMenuGroup] = useState<AdminMenuGroup>(null);
  const [leadPage, setLeadPage] = useState<PageState<Lead>>(emptyPage<Lead>());
  const [contactPage, setContactPage] = useState<PageState<ContactSubmission>>(emptyPage<ContactSubmission>());
  const [vehicleReviewPage, setVehicleReviewPage] = useState<PageState<VehicleReview>>(emptyPage<VehicleReview>());
  const [chargerFeedbackPage, setChargerFeedbackPage] = useState<PageState<ChargerFeedback>>(
    emptyPage<ChargerFeedback>(),
  );
  const [vehiclePage, setVehiclePage] = useState<PageState<AdminVehicle>>(emptyPage<AdminVehicle>());
  const [chargerPage, setChargerPage] = useState<PageState<AdminCharger>>(emptyPage<AdminCharger>());
  const [vehiclePageSize, setVehiclePageSize] = useState(DEFAULT_PAGE_SIZE);
  const [chargerPageSize, setChargerPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<number | string | null>(null);
  const [updatingContactId, setUpdatingContactId] = useState<number | string | null>(null);
  const [updatingVehicleReviewId, setUpdatingVehicleReviewId] = useState<number | string | null>(null);
  const [updatingChargerFeedbackId, setUpdatingChargerFeedbackId] = useState<number | string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [leadStatusOptions, setLeadStatusOptions] = useState<StatusOption[]>([]);
  const [isLeadStatusOptionsLoading, setIsLeadStatusOptionsLoading] = useState(false);
  const [leadStatusOptionsError, setLeadStatusOptionsError] = useState<string | null>(null);
  const [contactStatusOptions, setContactStatusOptions] = useState<StatusOption[]>([]);
  const [isContactStatusOptionsLoading, setIsContactStatusOptionsLoading] = useState(false);
  const [contactStatusOptionsError, setContactStatusOptionsError] = useState<string | null>(null);
  const [vehicleReviewStatusOptions, setVehicleReviewStatusOptions] = useState<StatusOption[]>([]);
  const [isVehicleReviewStatusOptionsLoading, setIsVehicleReviewStatusOptionsLoading] = useState(false);
  const [vehicleReviewStatusOptionsError, setVehicleReviewStatusOptionsError] = useState<string | null>(null);
  const [vehicleReviewStatusFilter, setVehicleReviewStatusFilter] = useState('PENDING');
  const [vehicleReviewVehicleIdFilter, setVehicleReviewVehicleIdFilter] = useState('');
  const [vehicleReviewDrafts, setVehicleReviewDrafts] = useState<Record<string, ModerationDraft>>({});
  const [chargerFeedbackStatusOptions, setChargerFeedbackStatusOptions] = useState<StatusOption[]>([]);
  const [isChargerFeedbackStatusOptionsLoading, setIsChargerFeedbackStatusOptionsLoading] = useState(false);
  const [chargerFeedbackStatusOptionsError, setChargerFeedbackStatusOptionsError] = useState<string | null>(null);
  const [chargerFeedbackStatusFilter, setChargerFeedbackStatusFilter] = useState('PENDING');
  const [chargerFeedbackChargerIdFilter, setChargerFeedbackChargerIdFilter] = useState('');
  const [chargerFeedbackDrafts, setChargerFeedbackDrafts] = useState<Record<string, string>>({});
  const [vehicleFormOptions, setVehicleFormOptions] = useState<VehicleFormOptions>(emptyVehicleFormOptions);
  const [isVehicleFormOptionsLoading, setIsVehicleFormOptionsLoading] = useState(false);
  const [vehicleFormOptionsError, setVehicleFormOptionsError] = useState<string | null>(null);
  const [vehicleActiveFilter, setVehicleActiveFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [vehicleBrandFilter, setVehicleBrandFilter] = useState('all');
  const [vehicleChargerTypeFilter, setVehicleChargerTypeFilter] = useState('all');
  const [vehicleVerificationStatusFilter, setVehicleVerificationStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(initialVehicleForm);
  const [vehicleFormErrors, setVehicleFormErrors] = useState<VehicleFormErrors>({});
  const [vehicleFormMode, setVehicleFormMode] = useState<'create' | 'edit'>('create');
  const [vehicleFormMessage, setVehicleFormMessage] = useState<string | null>(null);
  const [vehicleFormError, setVehicleFormError] = useState<string | null>(null);
  const [vehicleManagementView, setVehicleManagementView] = useState<VehicleManagementView>('list');
  const [isVehicleDetailLoading, setIsVehicleDetailLoading] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [chargerFormOptions, setChargerFormOptions] = useState<ChargerFormOptions>(emptyChargerFormOptions);
  const [isChargerFormOptionsLoading, setIsChargerFormOptionsLoading] = useState(false);
  const [chargerFormOptionsError, setChargerFormOptionsError] = useState<string | null>(null);
  const [chargerActiveFilter, setChargerActiveFilter] = useState('all');
  const [chargerCityFilter, setChargerCityFilter] = useState('');
  const [chargerStatusFilter, setChargerStatusFilter] = useState('all');
  const [chargerVerificationStatusFilter, setChargerVerificationStatusFilter] = useState('all');
  const [selectedCharger, setSelectedCharger] = useState<AdminCharger | null>(null);
  const [chargerForm, setChargerForm] = useState<ChargerFormState>(initialChargerForm);
  const [chargerFormErrors, setChargerFormErrors] = useState<ChargerFormErrors>({});
  const [chargerFormMode, setChargerFormMode] = useState<'create' | 'edit'>('create');
  const [chargerFormMessage, setChargerFormMessage] = useState<string | null>(null);
  const [chargerFormError, setChargerFormError] = useState<string | null>(null);
  const [chargerManagementView, setChargerManagementView] = useState<ChargerManagementView>('list');
  const [isChargerDetailLoading, setIsChargerDetailLoading] = useState(false);
  const [isSavingCharger, setIsSavingCharger] = useState(false);

  useEffect(() => {
    let isMounted = true;

    adminApiClient
      .get<AdminSession>('/api/v1/admin/auth/me')
      .then((session) => {
        if (!isMounted) {
          return;
        }

        setAdminUser(session);
        setAuthState('authenticated');
      })
      .catch(() => {
        if (isMounted) {
          setAuthState('unauthenticated');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadLeads = async (page: number) => {
    setLeadPage((current) => ({ ...current, page, isLoading: true, error: null }));

    try {
      const payload = await adminApiClient.get<PagePayload<Lead> | Lead[]>(
        `/api/v1/admin/leads?page=${page}&size=${DEFAULT_PAGE_SIZE}`,
      );
      setLeadPage(normalizePage(payload, page));
    } catch (error) {
      setLeadPage((current) => ({ ...current, isLoading: false, error: getAdminErrorMessage(error) }));
    }
  };

  const loadContacts = async (page: number) => {
    setContactPage((current) => ({ ...current, page, isLoading: true, error: null }));

    try {
      const payload = await adminApiClient.get<PagePayload<ContactSubmission> | ContactSubmission[]>(
        `/api/v1/admin/contact-submissions?page=${page}&size=${DEFAULT_PAGE_SIZE}`,
      );
      setContactPage(normalizePage(payload, page));
    } catch (error) {
      setContactPage((current) => ({ ...current, isLoading: false, error: getAdminErrorMessage(error) }));
    }
  };

  const loadVehicleReviews = async (
    page: number,
    reviewStatus = vehicleReviewStatusFilter,
    vehicleId = vehicleReviewVehicleIdFilter,
  ) => {
    setVehicleReviewPage((current) => ({ ...current, page, isLoading: true, error: null }));

    try {
      const payload = await adminApiClient.listVehicleReviews<PagePayload<VehicleReview> | VehicleReview[]>({
        page,
        size: DEFAULT_PAGE_SIZE,
        reviewStatus: reviewStatus === 'all' ? undefined : reviewStatus,
        vehicleId: vehicleId.trim() || undefined,
      });
      const nextPage = normalizePage(payload, page);
      setVehicleReviewPage(nextPage);
      setVehicleReviewDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };

        nextPage.items.forEach((review) => {
          const reviewKey = String(review.id);
          if (!nextDrafts[reviewKey]) {
            nextDrafts[reviewKey] = {
              reviewStatus: review.reviewStatus ?? '',
              moderationReason: review.moderationReason ?? '',
            };
          }
        });

        return nextDrafts;
      });
    } catch (error) {
      setVehicleReviewPage((current) => ({ ...current, isLoading: false, error: getAdminErrorMessage(error) }));
    }
  };

  const loadChargerFeedback = async (
    page: number,
    feedbackStatus = chargerFeedbackStatusFilter,
    chargerId = chargerFeedbackChargerIdFilter,
  ) => {
    setChargerFeedbackPage((current) => ({ ...current, page, isLoading: true, error: null }));

    try {
      const payload = await adminApiClient.listChargerFeedback<PagePayload<ChargerFeedback> | ChargerFeedback[]>({
        page,
        size: DEFAULT_PAGE_SIZE,
        feedbackStatus: feedbackStatus === 'all' ? undefined : feedbackStatus,
        chargerId: chargerId.trim() || undefined,
      });
      const nextPage = normalizePage(payload, page);
      setChargerFeedbackPage(nextPage);
      setChargerFeedbackDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };

        nextPage.items.forEach((feedback) => {
          const feedbackKey = String(feedback.id);
          if (!nextDrafts[feedbackKey]) {
            nextDrafts[feedbackKey] = feedback.feedbackStatus ?? '';
          }
        });

        return nextDrafts;
      });
    } catch (error) {
      setChargerFeedbackPage((current) => ({ ...current, isLoading: false, error: getAdminErrorMessage(error) }));
    }
  };

  const loadVehicles = async (
    page: number,
    active = vehicleActiveFilter,
    type = vehicleTypeFilter,
    brandId = vehicleBrandFilter,
    chargerTypeId = vehicleChargerTypeFilter,
    verificationStatus = vehicleVerificationStatusFilter,
    size = vehiclePageSize,
  ) => {
    setVehiclePage((current) => ({ ...current, page, isLoading: true, error: null }));

    try {
      const payload = await adminApiClient.listVehicles<PagePayload<AdminVehicle> | AdminVehicle[]>({
        page,
        size,
        active: active === 'all' ? undefined : active,
        type: type === 'all' ? undefined : type,
        brandId: brandId === 'all' ? undefined : brandId,
        chargerTypeId: chargerTypeId === 'all' ? undefined : chargerTypeId,
        verificationStatus: verificationStatus === 'all' ? undefined : verificationStatus,
      });
      setVehiclePage(normalizePage(payload, page));
    } catch (error) {
      setVehiclePage((current) => ({ ...current, isLoading: false, error: getAdminErrorMessage(error) }));
    }
  };

  const loadChargers = async (
    page: number,
    active = chargerActiveFilter,
    city = chargerCityFilter,
    status = chargerStatusFilter,
    verificationStatus = chargerVerificationStatusFilter,
    size = chargerPageSize,
  ) => {
    setChargerPage((current) => ({ ...current, page, isLoading: true, error: null }));

    try {
      const payload = await adminApiClient.listChargers<PagePayload<AdminCharger> | AdminCharger[]>({
        page,
        size,
        active: active === 'all' ? undefined : active,
        city: city.trim() || undefined,
        status: status === 'all' ? undefined : status,
        verificationStatus: verificationStatus === 'all' ? undefined : verificationStatus,
      });
      setChargerPage(normalizePage(payload, page));
    } catch (error) {
      setChargerPage((current) => ({ ...current, isLoading: false, error: getAdminErrorMessage(error) }));
    }
  };

  const loadLeadStatusOptions = async () => {
    setIsLeadStatusOptionsLoading(true);
    setLeadStatusOptionsError(null);

    try {
      const options = await adminApiClient.getLeadStatusOptions<StatusOption[]>();
      const validOptions = Array.isArray(options)
        ? options.filter((option) => typeof option.value === 'string' && typeof option.label === 'string')
        : [];

      setLeadStatusOptions(validOptions);
      if (validOptions.length === 0) {
        setLeadStatusOptionsError('Lead status options are not available. Status updates are disabled for now.');
      }
    } catch {
      setLeadStatusOptions([]);
      setLeadStatusOptionsError('Lead status options could not be loaded. Status updates are disabled for now.');
    } finally {
      setIsLeadStatusOptionsLoading(false);
    }
  };

  const loadContactStatusOptions = async () => {
    setIsContactStatusOptionsLoading(true);
    setContactStatusOptionsError(null);

    try {
      const options = await adminApiClient.getContactStatusOptions<StatusOption[]>();
      const validOptions = Array.isArray(options)
        ? options.filter((option) => typeof option.value === 'string' && typeof option.label === 'string')
        : [];

      setContactStatusOptions(validOptions);
      if (validOptions.length === 0) {
        setContactStatusOptionsError('Contact status options are not available. Status updates are disabled for now.');
      }
    } catch {
      setContactStatusOptions([]);
      setContactStatusOptionsError(
        'Contact status options could not be loaded. Status updates are disabled for now.',
      );
    } finally {
      setIsContactStatusOptionsLoading(false);
    }
  };

  const loadVehicleReviewStatusOptions = async () => {
    setIsVehicleReviewStatusOptionsLoading(true);
    setVehicleReviewStatusOptionsError(null);

    try {
      const options = await adminApiClient.getVehicleReviewStatusOptions<StatusOption[]>();
      const validOptions = Array.isArray(options)
        ? options.filter((option) => typeof option.value === 'string' && typeof option.label === 'string')
        : [];

      setVehicleReviewStatusOptions(validOptions);
      if (validOptions.length === 0) {
        setVehicleReviewStatusOptionsError(
          'Vehicle review status options are not available. Review moderation is disabled for now.',
        );
      }
    } catch {
      setVehicleReviewStatusOptions([]);
      setVehicleReviewStatusOptionsError(
        'Vehicle review status options could not be loaded. Review moderation is disabled for now.',
      );
    } finally {
      setIsVehicleReviewStatusOptionsLoading(false);
    }
  };

  const loadChargerFeedbackStatusOptions = async () => {
    setIsChargerFeedbackStatusOptionsLoading(true);
    setChargerFeedbackStatusOptionsError(null);

    try {
      const options = await adminApiClient.getChargerFeedbackStatusOptions<StatusOption[]>();
      const validOptions = Array.isArray(options)
        ? options.filter((option) => typeof option.value === 'string' && typeof option.label === 'string')
        : [];

      setChargerFeedbackStatusOptions(validOptions);
      if (validOptions.length === 0) {
        setChargerFeedbackStatusOptionsError(
          'Charger feedback status options are not available. Feedback moderation is disabled for now.',
        );
      }
    } catch {
      setChargerFeedbackStatusOptions([]);
      setChargerFeedbackStatusOptionsError(
        'Charger feedback status options could not be loaded. Feedback moderation is disabled for now.',
      );
    } finally {
      setIsChargerFeedbackStatusOptionsLoading(false);
    }
  };

  const loadVehicleFormOptions = async () => {
    setIsVehicleFormOptionsLoading(true);
    setVehicleFormOptionsError(null);

    try {
      const options = await adminApiClient.getVehicleFormOptions<unknown>();
      const nextOptions = normalizeVehicleFormOptions(options);
      setVehicleFormOptions(nextOptions);

      if (
        nextOptions.brands.length === 0 ||
        nextOptions.chargerTypes.length === 0 ||
        nextOptions.vehicleTypes.length === 0 ||
        nextOptions.verificationStatuses.length === 0
      ) {
        setVehicleFormOptionsError('Vehicle form options are incomplete. Create and edit are disabled for now.');
      }
    } catch {
      setVehicleFormOptions(emptyVehicleFormOptions);
      setVehicleFormOptionsError('Vehicle form options could not be loaded. Create and edit are disabled for now.');
    } finally {
      setIsVehicleFormOptionsLoading(false);
    }
  };

  const loadChargerFormOptions = async () => {
    setIsChargerFormOptionsLoading(true);
    setChargerFormOptionsError(null);

    try {
      const options = await adminApiClient.getChargerFormOptions<unknown>();
      const nextOptions = normalizeChargerFormOptions(options);
      setChargerFormOptions(nextOptions);

      if (
        nextOptions.chargerTypes.length === 0 ||
        nextOptions.chargingTypes.length === 0 ||
        nextOptions.statuses.length === 0 ||
        nextOptions.verificationStatuses.length === 0
      ) {
        setChargerFormOptionsError('Charger form options are incomplete. Create and edit are disabled for now.');
      }
    } catch {
      setChargerFormOptions(emptyChargerFormOptions);
      setChargerFormOptionsError('Charger form options could not be loaded. Create and edit are disabled for now.');
    } finally {
      setIsChargerFormOptionsLoading(false);
    }
  };

  useEffect(() => {
    if (authState === 'authenticated') {
      void loadLeadStatusOptions();
      void loadContactStatusOptions();
      void loadVehicleReviewStatusOptions();
      void loadChargerFeedbackStatusOptions();
      void loadVehicleFormOptions();
      void loadChargerFormOptions();
      void loadLeads(0);
      void loadContacts(0);
      void loadVehicleReviews(0);
      void loadChargerFeedback(0);
      void loadVehicles(0);
      void loadChargers(0);
    }
  }, [authState]);

  const handleLogout = async () => {
    try {
      await adminApiClient.post('/api/v1/admin/auth/logout');
    } finally {
      setAdminUser(null);
      setSelectedLead(null);
      setSelectedContact(null);
      setOpenMenuGroup(null);
      navigate('/admin/login');
    }
  };

  const handleVehicleReviewStatusFilterChange = (nextStatus: string) => {
    setVehicleReviewStatusFilter(nextStatus);
    void loadVehicleReviews(0, nextStatus, vehicleReviewVehicleIdFilter);
  };

  const handleVehicleReviewVehicleIdFilterSubmit = () => {
    void loadVehicleReviews(0, vehicleReviewStatusFilter, vehicleReviewVehicleIdFilter);
  };

  const handleChargerFeedbackStatusFilterChange = (nextStatus: string) => {
    setChargerFeedbackStatusFilter(nextStatus);
    void loadChargerFeedback(0, nextStatus, chargerFeedbackChargerIdFilter);
  };

  const handleChargerFeedbackChargerIdFilterSubmit = () => {
    void loadChargerFeedback(0, chargerFeedbackStatusFilter, chargerFeedbackChargerIdFilter);
  };

  const handleVehicleFiltersApply = () => {
    void loadVehicles(
      0,
      vehicleActiveFilter,
      vehicleTypeFilter,
      vehicleBrandFilter,
      vehicleChargerTypeFilter,
      vehicleVerificationStatusFilter,
      vehiclePageSize,
    );
  };

  const handleVehiclePageSizeChange = (nextPageSize: number) => {
    const safePageSize = Math.min(nextPageSize, 100);
    setVehiclePageSize(safePageSize);
    void loadVehicles(
      0,
      vehicleActiveFilter,
      vehicleTypeFilter,
      vehicleBrandFilter,
      vehicleChargerTypeFilter,
      vehicleVerificationStatusFilter,
      safePageSize,
    );
  };

  const startCreateVehicle = () => {
    setSelectedVehicle(null);
    setVehicleForm(initialVehicleForm);
    setVehicleFormErrors({});
    setVehicleFormMode('create');
    setVehicleFormMessage(null);
    setVehicleFormError(null);
    setVehicleManagementView('create');
  };

  const returnToVehicleList = () => {
    setSelectedVehicle(null);
    setVehicleForm(initialVehicleForm);
    setVehicleFormErrors({});
    setVehicleFormError(null);
    setVehicleManagementView('list');
  };

  const handleSelectVehicle = async (vehicle: AdminVehicle) => {
    setVehicleFormMode('edit');
    setSelectedVehicle(vehicle);
    setVehicleForm(vehicleToForm(vehicle));
    setVehicleFormErrors({});
    setVehicleFormMessage(null);
    setVehicleFormError(null);
    setVehicleManagementView('edit');
    setIsVehicleDetailLoading(true);

    try {
      const detail = await adminApiClient.getVehicle<AdminVehicle>(vehicle.id);
      setSelectedVehicle(detail);
      setVehicleForm(vehicleToForm(detail));
    } catch {
      setVehicleFormError('Full vehicle details could not be loaded. The list values are shown for editing.');
    } finally {
      setIsVehicleDetailLoading(false);
    }
  };

  const updateVehicleForm = <Key extends keyof VehicleFormState>(key: Key, value: VehicleFormState[Key]) => {
    setVehicleForm((current) => ({ ...current, [key]: value }));
    setVehicleFormErrors((current) => ({ ...current, [key]: undefined }));
    setVehicleFormMessage(null);
    setVehicleFormError(null);
  };

  const handleVehicleSave = async () => {
    if (vehicleFormOptionsError || isVehicleFormOptionsLoading) {
      setVehicleFormError('Vehicle form options are not available yet.');
      return;
    }

    if (vehicleFormMode === 'edit' && !selectedVehicle) {
      setVehicleFormError('Select a vehicle before saving changes.');
      return;
    }

    setIsSavingVehicle(true);
    setVehicleFormMessage(null);
    setVehicleFormError(null);
    setVehicleFormErrors({});

    try {
      const payload = vehicleFormToPayload(vehicleForm);
      const savedMode = vehicleFormMode;
      const savedVehicle =
        savedMode === 'create'
          ? await adminApiClient.createVehicle<AdminVehicle>(payload)
          : await adminApiClient.updateVehicle<AdminVehicle>(selectedVehicle!.id, payload);

      setSelectedVehicle(savedVehicle);
      setVehicleForm(vehicleToForm(savedVehicle));
      setVehicleFormMode('edit');
      setVehiclePage((current) => {
        const exists = current.items.some((vehicle) => vehicle.id === savedVehicle.id);
        return {
          ...current,
          items: exists
            ? current.items.map((vehicle) => (vehicle.id === savedVehicle.id ? savedVehicle : vehicle))
            : [savedVehicle, ...current.items],
          totalElements:
            exists || typeof current.totalElements !== 'number' ? current.totalElements : current.totalElements + 1,
        };
      });
      setVehicleFormMessage(`EV ${savedVehicle.id} saved. Source confidence does not mean EVReady verified the specs.`);
      setVehicleManagementView('list');
      void loadVehicles(savedMode === 'create' ? 0 : vehiclePage.page);
    } catch (error) {
      if (error instanceof ApiError) {
        setVehicleFormErrors(getVehicleFieldErrors(error.response.fieldErrors));
        setVehicleFormError(error.response.message || 'Vehicle could not be saved.');
      } else {
        setVehicleFormError('Vehicle could not be saved. Please try again.');
      }
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleChargerFiltersApply = () => {
    void loadChargers(
      0,
      chargerActiveFilter,
      chargerCityFilter,
      chargerStatusFilter,
      chargerVerificationStatusFilter,
      chargerPageSize,
    );
  };

  const handleChargerPageSizeChange = (nextPageSize: number) => {
    const safePageSize = Math.min(nextPageSize, 100);
    setChargerPageSize(safePageSize);
    void loadChargers(
      0,
      chargerActiveFilter,
      chargerCityFilter,
      chargerStatusFilter,
      chargerVerificationStatusFilter,
      safePageSize,
    );
  };

  const startCreateCharger = () => {
    setSelectedCharger(null);
    setChargerForm(initialChargerForm);
    setChargerFormErrors({});
    setChargerFormMode('create');
    setChargerFormMessage(null);
    setChargerFormError(null);
    setChargerManagementView('create');
  };

  const returnToChargerList = () => {
    setSelectedCharger(null);
    setChargerForm(initialChargerForm);
    setChargerFormErrors({});
    setChargerFormError(null);
    setChargerManagementView('list');
  };

  const handleSelectCharger = async (charger: AdminCharger) => {
    setChargerFormMode('edit');
    setSelectedCharger(charger);
    setChargerForm(chargerToForm(charger));
    setChargerFormErrors({});
    setChargerFormMessage(null);
    setChargerFormError(null);
    setChargerManagementView('edit');
    setIsChargerDetailLoading(true);

    try {
      const detail = await adminApiClient.getCharger<AdminCharger>(charger.id);
      setSelectedCharger(detail);
      setChargerForm(chargerToForm(detail));
    } catch {
      setChargerFormError('Full charger details could not be loaded. The list values are shown for editing.');
    } finally {
      setIsChargerDetailLoading(false);
    }
  };

  const updateChargerForm = <Key extends keyof ChargerFormState>(key: Key, value: ChargerFormState[Key]) => {
    setChargerForm((current) => ({ ...current, [key]: value }));
    setChargerFormErrors((current) => ({ ...current, [key]: undefined }));
    setChargerFormMessage(null);
    setChargerFormError(null);
  };

  const handleChargerSave = async () => {
    if (chargerFormOptionsError || isChargerFormOptionsLoading) {
      setChargerFormError('Charger form options are not available yet.');
      return;
    }

    if (chargerFormMode === 'edit' && !selectedCharger) {
      setChargerFormError('Select a charger before saving changes.');
      return;
    }

    setIsSavingCharger(true);
    setChargerFormMessage(null);
    setChargerFormError(null);
    setChargerFormErrors({});

    try {
      const payload = chargerFormToPayload(chargerForm);
      const savedMode = chargerFormMode;
      const savedCharger =
        savedMode === 'create'
          ? await adminApiClient.createCharger<AdminCharger>(payload)
          : await adminApiClient.updateCharger<AdminCharger>(selectedCharger!.id, payload);

      setSelectedCharger(savedCharger);
      setChargerForm(chargerToForm(savedCharger));
      setChargerFormMode('edit');
      setChargerPage((current) => {
        const exists = current.items.some((charger) => charger.id === savedCharger.id);
        return {
          ...current,
          items: exists
            ? current.items.map((charger) => (charger.id === savedCharger.id ? savedCharger : charger))
            : [savedCharger, ...current.items],
          totalElements:
            exists || typeof current.totalElements !== 'number' ? current.totalElements : current.totalElements + 1,
        };
      });
      setChargerFormMessage(
        `Charger ${savedCharger.id} saved. Public charger status remains reported data, not live availability.`,
      );
      setChargerManagementView('list');
      void loadChargers(savedMode === 'create' ? 0 : chargerPage.page);
    } catch (error) {
      if (error instanceof ApiError) {
        setChargerFormErrors(getChargerFieldErrors(error.response.fieldErrors));
        setChargerFormError(error.response.message || 'Charger could not be saved.');
      } else {
        setChargerFormError('Charger could not be saved. Please try again.');
      }
    } finally {
      setIsSavingCharger(false);
    }
  };

  const updateVehicleReviewDraft = (
    reviewId: number | string,
    field: keyof ModerationDraft,
    value: string,
  ) => {
    const reviewKey = String(reviewId);
    setVehicleReviewDrafts((currentDrafts) => ({
      ...currentDrafts,
      [reviewKey]: {
        reviewStatus: currentDrafts[reviewKey]?.reviewStatus ?? '',
        moderationReason: currentDrafts[reviewKey]?.moderationReason ?? '',
        [field]: value,
      },
    }));
    setStatusMessage(null);
    setStatusError(null);
  };

  const updateChargerFeedbackDraft = (feedbackId: number | string, feedbackStatus: string) => {
    setChargerFeedbackDrafts((currentDrafts) => ({
      ...currentDrafts,
      [String(feedbackId)]: feedbackStatus,
    }));
    setStatusMessage(null);
    setStatusError(null);
  };

  const handleVehicleReviewStatusUpdate = async (review: VehicleReview) => {
    const reviewKey = String(review.id);
    const draft = vehicleReviewDrafts[reviewKey] ?? {
      reviewStatus: review.reviewStatus ?? '',
      moderationReason: review.moderationReason ?? '',
    };

    if (!draft.reviewStatus) {
      setStatusError('Choose a review status before updating.');
      return;
    }

    setUpdatingVehicleReviewId(review.id);
    setStatusMessage(null);
    setStatusError(null);

    try {
      const updatedReview = await adminApiClient.updateVehicleReviewStatus<VehicleReview>(
        review.id,
        draft.reviewStatus,
        draft.moderationReason.trim() || undefined,
      );
      setVehicleReviewPage((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === updatedReview.id ? updatedReview : item)),
      }));
      setVehicleReviewDrafts((currentDrafts) => ({
        ...currentDrafts,
        [reviewKey]: {
          reviewStatus: updatedReview.reviewStatus ?? '',
          moderationReason: updatedReview.moderationReason ?? '',
        },
      }));
      setStatusMessage(
        `Vehicle review ${updatedReview.id} status updated to ${formatStatusLabel(
          updatedReview.reviewStatus,
          vehicleReviewStatusOptions,
        )}.`,
      );
    } catch {
      setStatusError('Vehicle review status could not be updated. Please try again.');
    } finally {
      setUpdatingVehicleReviewId(null);
    }
  };

  const handleChargerFeedbackStatusUpdate = async (feedback: ChargerFeedback) => {
    const feedbackKey = String(feedback.id);
    const feedbackStatus = chargerFeedbackDrafts[feedbackKey] ?? feedback.feedbackStatus ?? '';

    if (!feedbackStatus) {
      setStatusError('Choose a feedback status before updating.');
      return;
    }

    setUpdatingChargerFeedbackId(feedback.id);
    setStatusMessage(null);
    setStatusError(null);

    try {
      const updatedFeedback = await adminApiClient.updateChargerFeedbackStatus<ChargerFeedback>(
        feedback.id,
        feedbackStatus,
      );
      setChargerFeedbackPage((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === updatedFeedback.id ? updatedFeedback : item)),
      }));
      setChargerFeedbackDrafts((currentDrafts) => ({
        ...currentDrafts,
        [feedbackKey]: updatedFeedback.feedbackStatus ?? '',
      }));
      setStatusMessage(
        `Charger feedback ${updatedFeedback.id} status updated to ${formatStatusLabel(
          updatedFeedback.feedbackStatus,
          chargerFeedbackStatusOptions,
        )}. Public charger status and live availability were not changed.`,
      );
    } catch {
      setStatusError('Charger feedback status could not be updated. Please try again.');
    } finally {
      setUpdatingChargerFeedbackId(null);
    }
  };

  const handleViewLead = async (lead: Lead) => {
    setDetailError(null);
    setSelectedContact(null);
    setIsDetailLoading(true);

    try {
      const detail = await adminApiClient.get<Lead>(`/api/v1/admin/leads/${lead.id}`);
      setSelectedLead(detail);
    } catch {
      setSelectedLead(lead);
      setDetailError('Full lead details could not be loaded.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleViewContact = async (contact: ContactSubmission) => {
    setDetailError(null);
    setSelectedLead(null);
    setIsDetailLoading(true);

    try {
      const detail = await adminApiClient.get<ContactSubmission>(`/api/v1/admin/contact-submissions/${contact.id}`);
      setSelectedContact(detail);
    } catch {
      setSelectedContact(contact);
      setDetailError('Full contact details could not be loaded.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleLeadStatusChange = async (lead: Lead, nextStatus: string) => {
    if (lead.leadStatus === nextStatus) {
      return;
    }

    setUpdatingLeadId(lead.id);
    setStatusMessage(null);
    setStatusError(null);

    try {
      const updatedLead = await adminApiClient.updateLeadStatus<Lead>(lead.id, nextStatus);
      setLeadPage((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === updatedLead.id ? updatedLead : item)),
      }));
      setSelectedLead((current) => (current?.id === updatedLead.id ? updatedLead : current));
      setStatusMessage(
        `Lead ${updatedLead.id} status updated to ${formatStatusLabel(updatedLead.leadStatus, leadStatusOptions)}.`,
      );
    } catch {
      setStatusError('Lead status could not be updated. Please try again.');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleContactStatusChange = async (contact: ContactSubmission, nextStatus: string) => {
    if (contact.contactStatus === nextStatus) {
      return;
    }

    setUpdatingContactId(contact.id);
    setStatusMessage(null);
    setStatusError(null);

    try {
      const updatedContact = await adminApiClient.updateContactStatus<ContactSubmission>(contact.id, nextStatus);
      setContactPage((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === updatedContact.id ? updatedContact : item)),
      }));
      setSelectedContact((current) => (current?.id === updatedContact.id ? updatedContact : current));
      setStatusMessage(
        `Contact ${updatedContact.id} status updated to ${formatStatusLabel(
          updatedContact.contactStatus,
          contactStatusOptions,
        )}.`,
      );
    } catch {
      setStatusError('Contact status could not be updated. Please try again.');
    } finally {
      setUpdatingContactId(null);
    }
  };

  const isEvSectionActive = activeSection === 'vehicles' || activeSection === 'vehicleReviews';
  const isChargerSectionActive =
    activeSection === 'chargers' || activeSection === 'chargerFeedback';
  const showEvSubmenu = openMenuGroup === 'ev' || isEvSectionActive;
  const showChargerSubmenu = openMenuGroup === 'chargers' || isChargerSectionActive;

  if (authState === 'checking') {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Internal admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Checking admin session...</h1>
      </main>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Internal admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Admin access required</h1>
        <p className="mt-3 text-slate-600">
          This read-only area is limited to authorized EVReady Pakistan admin users.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800"
          to="/admin/login"
        >
          Go to admin sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Internal admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Admin moderation dashboard</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Access to Get Help leads, Contact Us submissions, EV Catalogue management, charger
            directory management, vehicle reviews, and charger feedback. This view does not create
            callback, booking, payment, SLA, or live charger availability commitments.
          </p>
          <p className="mt-2 text-sm text-slate-500">Signed in as {formatValue(adminUser?.username)}</p>
        </div>

        <button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          onClick={handleLogout}
          type="button"
        >
          Sign out
        </button>
      </div>

      <div className="flex flex-wrap items-start gap-3" role="tablist" aria-label="Admin sections">
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'leads' ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
          }`}
          onClick={() => {
            setActiveSection('leads');
            setOpenMenuGroup(null);
          }}
          type="button"
        >
          Get Help Leads
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'contacts' ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
          }`}
          onClick={() => {
            setActiveSection('contacts');
            setOpenMenuGroup(null);
          }}
          type="button"
        >
          Contact Submissions
        </button>
        <div className="flex flex-col gap-2">
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              isEvSectionActive ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
            }`}
            onClick={() => setOpenMenuGroup((group) => (group === 'ev' ? null : 'ev'))}
            type="button"
          >
            EV
          </button>
          {showEvSubmenu ? (
            <div className="flex flex-wrap gap-2 pl-2">
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeSection === 'vehicles' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => {
                  setActiveSection('vehicles');
                  setOpenMenuGroup('ev');
                  setVehicleManagementView('list');
                }}
                type="button"
              >
                Catalogue
              </button>
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeSection === 'vehicleReviews' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => {
                  setActiveSection('vehicleReviews');
                  setOpenMenuGroup('ev');
                }}
                type="button"
              >
                Reviews
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              isChargerSectionActive ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
            }`}
            onClick={() =>
              setOpenMenuGroup((group) => (group === 'chargers' ? null : 'chargers'))
            }
            type="button"
          >
            Chargers
          </button>
          {showChargerSubmenu ? (
            <div className="flex flex-wrap gap-2 pl-2">
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeSection === 'chargers' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => {
                  setActiveSection('chargers');
                  setOpenMenuGroup('chargers');
                  setChargerManagementView('list');
                }}
                type="button"
              >
                Catalogue
              </button>
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeSection === 'chargerFeedback'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => {
                  setActiveSection('chargerFeedback');
                  setOpenMenuGroup('chargers');
                }}
                type="button"
              >
                Feedback
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {activeSection === 'leads' ? (
        <section className="flex flex-col gap-4">
          <AdminSectionHeader
            count={leadPage.totalElements}
            title="Get Help Leads"
            onRefresh={() => void loadLeads(leadPage.page)}
          />
          {leadPage.error ? <Alert message={leadPage.error} /> : null}
          {leadStatusOptionsError ? <Alert message={leadStatusOptionsError} /> : null}
          {statusError ? <Alert message={statusError} /> : null}
          {statusMessage ? <SuccessMessage message={statusMessage} /> : null}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadPage.items.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-3">{formatValue(lead.id)}</td>
                    <td className="px-4 py-3">{formatValue(lead.name)}</td>
                    <td className="px-4 py-3">{formatValue(lead.phone)}</td>
                    <td className="px-4 py-3">{formatValue(lead.city)}</td>
                    <td className="px-4 py-3">{formatValue(lead.interestType)}</td>
                    <td className="px-4 py-3">
                      <p className="mb-1 text-xs font-semibold text-slate-600">
                        {formatStatusLabel(lead.leadStatus, leadStatusOptions)}
                      </p>
                      <select
                        aria-label={`Update lead ${lead.id} status`}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
                        disabled={
                          updatingLeadId === lead.id ||
                          isLeadStatusOptionsLoading ||
                          Boolean(leadStatusOptionsError) ||
                          leadStatusOptions.length === 0
                        }
                        onChange={(event) => void handleLeadStatusChange(lead, event.target.value)}
                        value={
                          leadStatusOptions.some((status) => status.value === lead.leadStatus)
                            ? lead.leadStatus ?? ''
                            : ''
                        }
                      >
                        <option value="" disabled>
                          {isLeadStatusOptionsLoading ? 'Loading statuses...' : 'Select status'}
                        </option>
                        {leadStatusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      {updatingLeadId === lead.id ? (
                        <p className="mt-1 text-xs text-slate-500">Updating...</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="font-semibold text-emerald-700" onClick={() => void handleViewLead(lead)}>
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!leadPage.isLoading && leadPage.items.length === 0 ? <EmptyState label="No leads found." /> : null}
            {leadPage.isLoading ? <LoadingState label="Loading leads..." /> : null}
          </div>
          <Pagination
            isLoading={leadPage.isLoading}
            onNext={() => void loadLeads(leadPage.page + 1)}
            onPrevious={() => void loadLeads(leadPage.page - 1)}
            page={leadPage.page}
            showNext={hasNextPage(leadPage)}
            totalPages={leadPage.totalPages}
          />
          {selectedLead ? (
            <DetailsPanel
              detailError={detailError}
              isLoading={isDetailLoading}
              onClose={() => setSelectedLead(null)}
              rows={[
                ['ID', formatValue(selectedLead.id)],
                ['Name', formatValue(selectedLead.name)],
                ['Phone', formatValue(selectedLead.phone)],
                ['City', formatValue(selectedLead.city)],
                ['Interest', formatValue(selectedLead.interestType)],
                ['Status', formatStatusLabel(selectedLead.leadStatus, leadStatusOptions)],
                ['Source page', formatValue(selectedLead.sourcePage)],
                ['Message', formatValue(selectedLead.message)],
              ]}
              title="Lead details"
            />
          ) : null}
        </section>
      ) : activeSection === 'contacts' ? (
        <section className="flex flex-col gap-4">
          <AdminSectionHeader
            count={contactPage.totalElements}
            title="Contact Submissions"
            onRefresh={() => void loadContacts(contactPage.page)}
          />
          {contactPage.error ? <Alert message={contactPage.error} /> : null}
          {contactStatusOptionsError ? <Alert message={contactStatusOptionsError} /> : null}
          {statusError ? <Alert message={statusError} /> : null}
          {statusMessage ? <SuccessMessage message={statusMessage} /> : null}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Inquiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contactPage.items.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-4 py-3">{formatValue(contact.id)}</td>
                    <td className="px-4 py-3">{formatValue(contact.name)}</td>
                    <td className="px-4 py-3">{formatValue(contact.email)}</td>
                    <td className="px-4 py-3">{formatValue(contact.phone)}</td>
                    <td className="px-4 py-3">{formatValue(contact.organization)}</td>
                    <td className="px-4 py-3">{formatValue(contact.inquiryType)}</td>
                    <td className="px-4 py-3">
                      <p className="mb-1 text-xs font-semibold text-slate-600">
                        {formatStatusLabel(contact.contactStatus, contactStatusOptions)}
                      </p>
                      <select
                        aria-label={`Update contact ${contact.id} status`}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
                        disabled={
                          updatingContactId === contact.id ||
                          isContactStatusOptionsLoading ||
                          Boolean(contactStatusOptionsError) ||
                          contactStatusOptions.length === 0
                        }
                        onChange={(event) => void handleContactStatusChange(contact, event.target.value)}
                        value={
                          contactStatusOptions.some((status) => status.value === contact.contactStatus)
                            ? contact.contactStatus ?? ''
                            : ''
                        }
                      >
                        <option value="" disabled>
                          {isContactStatusOptionsLoading ? 'Loading statuses...' : 'Select status'}
                        </option>
                        {contactStatusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      {updatingContactId === contact.id ? (
                        <p className="mt-1 text-xs text-slate-500">Updating...</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{formatDate(contact.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        className="font-semibold text-emerald-700"
                        onClick={() => void handleViewContact(contact)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!contactPage.isLoading && contactPage.items.length === 0 ? (
              <EmptyState label="No contact submissions found." />
            ) : null}
            {contactPage.isLoading ? <LoadingState label="Loading contact submissions..." /> : null}
          </div>
          <Pagination
            isLoading={contactPage.isLoading}
            onNext={() => void loadContacts(contactPage.page + 1)}
            onPrevious={() => void loadContacts(contactPage.page - 1)}
            page={contactPage.page}
            showNext={hasNextPage(contactPage)}
            totalPages={contactPage.totalPages}
          />
          {selectedContact ? (
            <DetailsPanel
              detailError={detailError}
              isLoading={isDetailLoading}
              onClose={() => setSelectedContact(null)}
              rows={[
                ['ID', formatValue(selectedContact.id)],
                ['Name', formatValue(selectedContact.name)],
                ['Email', formatValue(selectedContact.email)],
                ['Phone', formatValue(selectedContact.phone)],
                ['Organization', formatValue(selectedContact.organization)],
                ['Inquiry', formatValue(selectedContact.inquiryType)],
                ['Status', formatStatusLabel(selectedContact.contactStatus, contactStatusOptions)],
                ['Source page', formatValue(selectedContact.sourcePage)],
                ['Message', formatValue(selectedContact.message)],
              ]}
              title="Contact details"
            />
          ) : null}
        </section>
      ) : activeSection === 'vehicleReviews' ? (
        <section className="flex flex-col gap-4">
          <AdminSectionHeader
            count={vehicleReviewPage.totalElements}
            title="Vehicle Review Moderation"
            onRefresh={() => void loadVehicleReviews(vehicleReviewPage.page)}
          />
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Approve only reviews that look safe and useful for public display later. Approval does
            not mean EVReady has verified the claim.
          </div>
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">
              Review status
              <select
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                disabled={isVehicleReviewStatusOptionsLoading}
                onChange={(event) => handleVehicleReviewStatusFilterChange(event.target.value)}
                value={vehicleReviewStatusFilter}
              >
                <option value="all">All</option>
                {vehicleReviewStatusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Vehicle ID
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  onChange={(event) => setVehicleReviewVehicleIdFilter(event.target.value)}
                  placeholder="Optional vehicle ID"
                  type="text"
                  value={vehicleReviewVehicleIdFilter}
                />
                <button
                  className={primaryButtonClass}
                  onClick={handleVehicleReviewVehicleIdFilterSubmit}
                  type="button"
                >
                  Apply
                </button>
              </div>
            </label>
          </div>
          {vehicleReviewPage.error ? <Alert message={vehicleReviewPage.error} /> : null}
          {vehicleReviewStatusOptionsError ? <Alert message={vehicleReviewStatusOptionsError} /> : null}
          {statusError ? <Alert message={statusError} /> : null}
          {statusMessage ? <SuccessMessage message={statusMessage} /> : null}
          <Pagination
            isLoading={vehicleReviewPage.isLoading}
            onNext={() => void loadVehicleReviews(vehicleReviewPage.page + 1)}
            onPrevious={() => void loadVehicleReviews(vehicleReviewPage.page - 1)}
            page={vehicleReviewPage.page}
            showNext={hasNextPage(vehicleReviewPage)}
            totalPages={vehicleReviewPage.totalPages}
          />
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Vehicle ID</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">Display name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Moderated</th>
                  <th className="px-4 py-3">Moderated by</th>
                  <th className="px-4 py-3">Moderation reason</th>
                  <th className="px-4 py-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {vehicleReviewPage.items.map((review) => {
                  const draft = vehicleReviewDrafts[String(review.id)] ?? {
                    reviewStatus: review.reviewStatus ?? '',
                    moderationReason: review.moderationReason ?? '',
                  };

                  return (
                    <tr key={review.id}>
                      <td className="px-4 py-3">{formatValue(review.id)}</td>
                      <td className="px-4 py-3">{formatValue(review.vehicleId)}</td>
                      <td className="px-4 py-3">{formatValue(review.rating)}</td>
                      <td className="max-w-sm px-4 py-3">
                        <div className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded-md bg-slate-50 px-3 py-2">
                          {formatValue(review.reviewText)}
                        </div>
                      </td>
                      <td className="px-4 py-3">{formatValue(review.displayName)}</td>
                      <td className="px-4 py-3">{formatValue(review.city)}</td>
                      <td className="px-4 py-3">{formatValue(review.experienceType)}</td>
                      <td className="px-4 py-3">
                        {formatStatusLabel(review.reviewStatus, vehicleReviewStatusOptions)}
                      </td>
                      <td className="px-4 py-3">{formatDate(review.createdAt)}</td>
                      <td className="px-4 py-3">{formatDate(review.moderatedAt)}</td>
                      <td className="px-4 py-3">{formatValue(review.moderatedBy)}</td>
                      <td className="max-w-xs whitespace-pre-wrap px-4 py-3">
                        {formatValue(review.moderationReason)}
                      </td>
                      <td className="min-w-72 px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <select
                            aria-label={`Update vehicle review ${review.id} status`}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
                            disabled={
                              updatingVehicleReviewId === review.id ||
                              isVehicleReviewStatusOptionsLoading ||
                              Boolean(vehicleReviewStatusOptionsError) ||
                              vehicleReviewStatusOptions.length === 0
                            }
                            onChange={(event) =>
                              updateVehicleReviewDraft(review.id, 'reviewStatus', event.target.value)
                            }
                            value={
                              vehicleReviewStatusOptions.some((status) => status.value === draft.reviewStatus)
                                ? draft.reviewStatus
                                : ''
                            }
                          >
                            <option value="" disabled>
                              {isVehicleReviewStatusOptionsLoading ? 'Loading statuses...' : 'Select status'}
                            </option>
                            {vehicleReviewStatusOptions.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          <input
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800"
                            onChange={(event) =>
                              updateVehicleReviewDraft(review.id, 'moderationReason', event.target.value)
                            }
                            placeholder="Optional moderation reason"
                            type="text"
                            value={draft.moderationReason}
                          />
                          <button
                            className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            disabled={
                              updatingVehicleReviewId === review.id ||
                              isVehicleReviewStatusOptionsLoading ||
                              Boolean(vehicleReviewStatusOptionsError) ||
                              vehicleReviewStatusOptions.length === 0
                            }
                            onClick={() => void handleVehicleReviewStatusUpdate(review)}
                            type="button"
                          >
                            {updatingVehicleReviewId === review.id ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!vehicleReviewPage.isLoading && vehicleReviewPage.items.length === 0 ? (
              <EmptyState label="No vehicle reviews found." />
            ) : null}
            {vehicleReviewPage.isLoading ? <LoadingState label="Loading vehicle reviews..." /> : null}
          </div>
          <Pagination
            isLoading={vehicleReviewPage.isLoading}
            onNext={() => void loadVehicleReviews(vehicleReviewPage.page + 1)}
            onPrevious={() => void loadVehicleReviews(vehicleReviewPage.page - 1)}
            page={vehicleReviewPage.page}
            showNext={hasNextPage(vehicleReviewPage)}
            totalPages={vehicleReviewPage.totalPages}
          />
        </section>
      ) : activeSection === 'vehicles' ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {vehicleManagementView === 'create'
                  ? 'Add new EV'
                  : vehicleManagementView === 'edit'
                    ? `Edit EV ${formatValue(selectedVehicle?.id)}`
                    : 'EV Catalogue Management'}
              </h2>
              {vehicleManagementView === 'list' && typeof vehiclePage.totalElements === 'number' ? (
                <p className="text-sm text-slate-500">{vehiclePage.totalElements} total records</p>
              ) : null}
            </div>
            {vehicleManagementView === 'list' ? (
              <div className="flex items-center gap-2">
                <button
                  aria-label="Add new EV"
                  className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-2xl font-semibold leading-none text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={Boolean(vehicleFormOptionsError) || isVehicleFormOptionsLoading}
                  onClick={startCreateVehicle}
                  title="Add new EV"
                  type="button"
                >
                  <span className="block leading-none">+</span>
                </button>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => void loadVehicles(vehiclePage.page)}
                  type="button"
                >
                  Refresh
                </button>
              </div>
            ) : null}
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            EV Catalogue records are admin-maintained source data. Source confidence is about data
            provenance, not EVReady field verification of specs, price, availability, range,
            battery, warranty, or dealer claims.
          </div>
          {vehiclePage.error ? <Alert message={vehiclePage.error} /> : null}
          {vehicleFormOptionsError ? <Alert message={vehicleFormOptionsError} /> : null}
          {vehicleFormError ? <Alert message={vehicleFormError} /> : null}
          {vehicleFormMessage ? <SuccessMessage message={vehicleFormMessage} /> : null}
          {vehicleManagementView === 'list' ? (
            <div className="space-y-4">
              <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
                <label className="text-sm font-semibold text-slate-700">
                  Active
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    onChange={(event) => setVehicleActiveFilter(event.target.value)}
                    value={vehicleActiveFilter}
                  >
                    <option value="all">All</option>
                    <option value="true">Active only</option>
                    <option value="false">Inactive only</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Type
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    disabled={isVehicleFormOptionsLoading || vehicleFormOptions.vehicleTypes.length === 0}
                    onChange={(event) => setVehicleTypeFilter(event.target.value)}
                    value={vehicleTypeFilter}
                  >
                    <option value="all">All</option>
                    {vehicleFormOptions.vehicleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Brand
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    disabled={isVehicleFormOptionsLoading || vehicleFormOptions.brands.length === 0}
                    onChange={(event) => setVehicleBrandFilter(event.target.value)}
                    value={vehicleBrandFilter}
                  >
                    <option value="all">All</option>
                    {vehicleFormOptions.brands.map((brand) => (
                      <option key={brand.value} value={brand.value}>
                        {brand.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Charger type
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    disabled={isVehicleFormOptionsLoading || vehicleFormOptions.chargerTypes.length === 0}
                    onChange={(event) => setVehicleChargerTypeFilter(event.target.value)}
                    value={vehicleChargerTypeFilter}
                  >
                    <option value="all">All</option>
                    {vehicleFormOptions.chargerTypes.map((chargerType) => (
                      <option key={chargerType.value} value={chargerType.value}>
                        {chargerType.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Source confidence
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      disabled={isVehicleFormOptionsLoading || vehicleFormOptions.verificationStatuses.length === 0}
                      onChange={(event) => setVehicleVerificationStatusFilter(event.target.value)}
                      value={vehicleVerificationStatusFilter}
                    >
                      <option value="all">All</option>
                      {vehicleFormOptions.verificationStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className={primaryButtonClass}
                      onClick={handleVehicleFiltersApply}
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PageSizeSelect
                  disabled={vehiclePage.isLoading}
                  onChange={handleVehiclePageSizeChange}
                  value={vehiclePageSize}
                />
                <Pagination
                  isLoading={vehiclePage.isLoading}
                  onNext={() => void loadVehicles(vehiclePage.page + 1)}
                  onPrevious={() => void loadVehicles(vehiclePage.page - 1)}
                  page={vehiclePage.page}
                  showNext={hasNextPaginatedPage(vehiclePage)}
                  totalPages={vehiclePage.totalPages}
                />
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Variant</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Range</th>
                      <th className="px-4 py-3">Charger type</th>
                      <th className="px-4 py-3">Source confidence</th>
                      <th className="px-4 py-3">Active</th>
                      <th className="px-4 py-3">Display order</th>
                      <th className="px-4 py-3">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 align-top">
                    {vehiclePage.items.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="px-4 py-3">{formatValue(vehicle.id)}</td>
                        <td className="px-4 py-3">{formatStatusLabel(vehicle.type, vehicleFormOptions.vehicleTypes)}</td>
                        <td className="px-4 py-3">{getVehicleBrandName(vehicle)}</td>
                        <td className="px-4 py-3">{formatValue(vehicle.model)}</td>
                        <td className="px-4 py-3">{formatValue(vehicle.variant)}</td>
                        <td className="px-4 py-3">{formatValue(vehicle.pricePkr)}</td>
                        <td className="px-4 py-3">{formatValue(vehicle.rangeKm)}</td>
                        <td className="px-4 py-3">{getVehicleChargerTypeName(vehicle)}</td>
                        <td className="px-4 py-3">
                          {formatStatusLabel(vehicle.verificationStatus, vehicleFormOptions.verificationStatuses)}
                        </td>
                        <td className="px-4 py-3">
                          {vehicle.active === false || vehicle.active === 'false' ? 'No' : 'Yes'}
                        </td>
                        <td className="px-4 py-3">{formatValue(vehicle.displayOrder)}</td>
                        <td className="px-4 py-3">
                          <button
                            className="font-semibold text-emerald-700"
                            onClick={() => void handleSelectVehicle(vehicle)}
                            type="button"
                          >
                            View/Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!vehiclePage.isLoading && vehiclePage.items.length === 0 ? (
                  <EmptyState label="No vehicles found." />
                ) : null}
                {vehiclePage.isLoading ? <LoadingState label="Loading vehicles..." /> : null}
              </div>
              <Pagination
                isLoading={vehiclePage.isLoading}
                onNext={() => void loadVehicles(vehiclePage.page + 1)}
                onPrevious={() => void loadVehicles(vehiclePage.page - 1)}
                page={vehiclePage.page}
                showNext={hasNextPaginatedPage(vehiclePage)}
                totalPages={vehiclePage.totalPages}
              />
            </div>
          ) : (
            <VehicleFormPanel
              errors={vehicleFormErrors}
              form={vehicleForm}
              formMode={vehicleFormMode}
              isDetailLoading={isVehicleDetailLoading}
              isOptionsLoading={isVehicleFormOptionsLoading}
              isSaving={isSavingVehicle}
              onCancel={returnToVehicleList}
              onSave={() => void handleVehicleSave()}
              onUpdate={updateVehicleForm}
              options={vehicleFormOptions}
              optionsError={vehicleFormOptionsError}
              selectedVehicle={selectedVehicle}
            />
          )}
        </section>
      ) : activeSection === 'chargers' ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {chargerManagementView === 'create'
                  ? 'Add new charger'
                  : chargerManagementView === 'edit'
                    ? `Edit charger ${formatValue(selectedCharger?.id)}`
                    : 'Charger Management'}
              </h2>
              {chargerManagementView === 'list' && typeof chargerPage.totalElements === 'number' ? (
                <p className="text-sm text-slate-500">{chargerPage.totalElements} total records</p>
              ) : null}
            </div>
            {chargerManagementView === 'list' ? (
              <div className="flex items-center gap-2">
                <button
                  aria-label="Add new charger"
                  className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-2xl font-semibold leading-none text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={Boolean(chargerFormOptionsError) || isChargerFormOptionsLoading}
                  onClick={startCreateCharger}
                  title="Add new charger"
                  type="button"
                >
                  <span className="block leading-none">+</span>
                </button>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => void loadChargers(chargerPage.page)}
                  type="button"
                >
                  Refresh
                </button>
              </div>
            ) : null}
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Charger records use reported, non-live status. Editing a charger does not confirm it is
            working right now, available, unoccupied, compatible, accessible, or priced as shown.
            Source confidence is about data provenance, not EVReady field verification.
          </div>
          {chargerPage.error ? <Alert message={chargerPage.error} /> : null}
          {chargerFormOptionsError ? <Alert message={chargerFormOptionsError} /> : null}
          {chargerFormError ? <Alert message={chargerFormError} /> : null}
          {chargerFormMessage ? <SuccessMessage message={chargerFormMessage} /> : null}
          {chargerManagementView === 'list' ? (
            <div className="space-y-4">
              <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
                <label className="text-sm font-semibold text-slate-700">
                  Active
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    onChange={(event) => setChargerActiveFilter(event.target.value)}
                    value={chargerActiveFilter}
                  >
                    <option value="all">All</option>
                    <option value="true">Active only</option>
                    <option value="false">Inactive only</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Reported status
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    disabled={isChargerFormOptionsLoading || chargerFormOptions.statuses.length === 0}
                    onChange={(event) => setChargerStatusFilter(event.target.value)}
                    value={chargerStatusFilter}
                  >
                    <option value="all">All</option>
                    {chargerFormOptions.statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Source confidence
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    disabled={isChargerFormOptionsLoading || chargerFormOptions.verificationStatuses.length === 0}
                    onChange={(event) => setChargerVerificationStatusFilter(event.target.value)}
                    value={chargerVerificationStatusFilter}
                  >
                    <option value="all">All</option>
                    {chargerFormOptions.verificationStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  City
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      onChange={(event) => setChargerCityFilter(event.target.value)}
                      placeholder="Optional city"
                      type="text"
                      value={chargerCityFilter}
                    />
                    <button
                      className={primaryButtonClass}
                      onClick={handleChargerFiltersApply}
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PageSizeSelect
                  disabled={chargerPage.isLoading}
                  onChange={handleChargerPageSizeChange}
                  value={chargerPageSize}
                />
                <Pagination
                  isLoading={chargerPage.isLoading}
                  onNext={() => void loadChargers(chargerPage.page + 1)}
                  onPrevious={() => void loadChargers(chargerPage.page - 1)}
                  page={chargerPage.page}
                  showNext={hasNextPaginatedPage(chargerPage)}
                  totalPages={chargerPage.totalPages}
                />
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Area / address</th>
                      <th className="px-4 py-3">Charger type</th>
                      <th className="px-4 py-3">Charging type</th>
                      <th className="px-4 py-3">Reported status</th>
                      <th className="px-4 py-3">Source confidence</th>
                      <th className="px-4 py-3">Active</th>
                      <th className="px-4 py-3">Display order</th>
                      <th className="px-4 py-3">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 align-top">
                    {chargerPage.items.map((charger) => (
                      <tr key={charger.id}>
                        <td className="px-4 py-3">{formatValue(charger.id)}</td>
                        <td className="px-4 py-3">{formatValue(charger.name)}</td>
                        <td className="px-4 py-3">{formatValue(charger.city)}</td>
                        <td className="max-w-sm whitespace-pre-wrap px-4 py-3">{formatAreaAddress(charger)}</td>
                        <td className="px-4 py-3">{getChargerTypeName(charger)}</td>
                        <td className="px-4 py-3">{formatStatusLabel(charger.chargingType, chargerFormOptions.chargingTypes)}</td>
                        <td className="px-4 py-3">{formatStatusLabel(charger.status, chargerFormOptions.statuses)}</td>
                        <td className="px-4 py-3">
                          {formatStatusLabel(charger.verificationStatus, chargerFormOptions.verificationStatuses)}
                        </td>
                        <td className="px-4 py-3">{charger.active === false || charger.active === 'false' ? 'No' : 'Yes'}</td>
                        <td className="px-4 py-3">{formatValue(charger.displayOrder)}</td>
                        <td className="px-4 py-3">
                          <button
                            className="font-semibold text-emerald-700"
                            onClick={() => void handleSelectCharger(charger)}
                            type="button"
                          >
                            View/Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!chargerPage.isLoading && chargerPage.items.length === 0 ? (
                  <EmptyState label="No chargers found." />
                ) : null}
                {chargerPage.isLoading ? <LoadingState label="Loading chargers..." /> : null}
              </div>
              <Pagination
                isLoading={chargerPage.isLoading}
                onNext={() => void loadChargers(chargerPage.page + 1)}
                onPrevious={() => void loadChargers(chargerPage.page - 1)}
                page={chargerPage.page}
                showNext={hasNextPaginatedPage(chargerPage)}
                totalPages={chargerPage.totalPages}
              />
            </div>
          ) : (
            <ChargerFormPanel
              errors={chargerFormErrors}
              form={chargerForm}
              formMode={chargerFormMode}
              isDetailLoading={isChargerDetailLoading}
              isOptionsLoading={isChargerFormOptionsLoading}
              isSaving={isSavingCharger}
              onCancel={returnToChargerList}
              onSave={() => void handleChargerSave()}
              onUpdate={updateChargerForm}
              options={chargerFormOptions}
              optionsError={chargerFormOptionsError}
              selectedCharger={selectedCharger}
            />
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <AdminSectionHeader
            count={chargerFeedbackPage.totalElements}
            title="Charger User Feedback Moderation"
            onRefresh={() => void loadChargerFeedback(chargerFeedbackPage.page)}
          />
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Moderate charger feedback carefully. Feedback status controls whether user-submitted
            feedback can be displayed; it does not change public charger status and must not be
            treated as live availability, working condition, access, occupancy, compatibility, or
            pricing confirmation.
          </div>
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">
              Feedback status
              <select
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                disabled={isChargerFeedbackStatusOptionsLoading}
                onChange={(event) => handleChargerFeedbackStatusFilterChange(event.target.value)}
                value={chargerFeedbackStatusFilter}
              >
                <option value="all">All</option>
                {chargerFeedbackStatusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Charger ID
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  onChange={(event) => setChargerFeedbackChargerIdFilter(event.target.value)}
                  placeholder="Optional charger ID"
                  type="text"
                  value={chargerFeedbackChargerIdFilter}
                />
                <button
                  className={primaryButtonClass}
                  onClick={handleChargerFeedbackChargerIdFilterSubmit}
                  type="button"
                >
                  Apply
                </button>
              </div>
            </label>
          </div>
          {chargerFeedbackPage.error ? <Alert message={chargerFeedbackPage.error} /> : null}
          {chargerFeedbackStatusOptionsError ? <Alert message={chargerFeedbackStatusOptionsError} /> : null}
          {statusError ? <Alert message={statusError} /> : null}
          {statusMessage ? <SuccessMessage message={statusMessage} /> : null}
          <Pagination
            isLoading={chargerFeedbackPage.isLoading}
            onNext={() => void loadChargerFeedback(chargerFeedbackPage.page + 1)}
            onPrevious={() => void loadChargerFeedback(chargerFeedbackPage.page - 1)}
            page={chargerFeedbackPage.page}
            showNext={hasNextPage(chargerFeedbackPage)}
            totalPages={chargerFeedbackPage.totalPages}
          />
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Charger ID</th>
                  <th className="px-4 py-3">Charger</th>
                  <th className="px-4 py-3">User experience</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Display name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Reviewed</th>
                  <th className="px-4 py-3">Reviewed by</th>
                  <th className="px-4 py-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {chargerFeedbackPage.items.map((feedback) => {
                  const draftStatus = chargerFeedbackDrafts[String(feedback.id)] ?? feedback.feedbackStatus ?? '';

                  return (
                    <tr key={feedback.id}>
                      <td className="px-4 py-3">{formatValue(feedback.id)}</td>
                      <td className="px-4 py-3">{formatValue(feedback.chargerId)}</td>
                      <td className="px-4 py-3">{formatValue(feedback.chargerName)}</td>
                      <td className="px-4 py-3">{formatValue(feedback.rating)}</td>
                      <td className="px-4 py-3">{formatValue(feedback.feedbackType)}</td>
                      <td className="max-w-sm px-4 py-3">
                        <div className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded-md bg-slate-50 px-3 py-2">
                          {formatValue(feedback.message)}
                        </div>
                      </td>
                      <td className="px-4 py-3">{formatValue(feedback.displayName)}</td>
                      <td className="px-4 py-3">{formatValue(feedback.city)}</td>
                      <td className="px-4 py-3">{formatValue(feedback.reportedByContact)}</td>
                      <td className="px-4 py-3">
                        {formatStatusLabel(feedback.feedbackStatus, chargerFeedbackStatusOptions)}
                      </td>
                      <td className="px-4 py-3">{formatDate(feedback.createdAt)}</td>
                      <td className="px-4 py-3">{formatDate(feedback.reviewedAt ?? feedback.moderatedAt)}</td>
                      <td className="px-4 py-3">{formatValue(feedback.reviewedBy ?? feedback.moderatedBy)}</td>
                      <td className="min-w-56 px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <select
                            aria-label={`Update charger feedback ${feedback.id} status`}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
                            disabled={
                              updatingChargerFeedbackId === feedback.id ||
                              isChargerFeedbackStatusOptionsLoading ||
                              Boolean(chargerFeedbackStatusOptionsError) ||
                              chargerFeedbackStatusOptions.length === 0
                            }
                            onChange={(event) => updateChargerFeedbackDraft(feedback.id, event.target.value)}
                            value={
                              chargerFeedbackStatusOptions.some((status) => status.value === draftStatus)
                                ? draftStatus
                                : ''
                            }
                          >
                            <option value="" disabled>
                              {isChargerFeedbackStatusOptionsLoading ? 'Loading statuses...' : 'Select status'}
                            </option>
                            {chargerFeedbackStatusOptions.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          <button
                            className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            disabled={
                              updatingChargerFeedbackId === feedback.id ||
                              isChargerFeedbackStatusOptionsLoading ||
                              Boolean(chargerFeedbackStatusOptionsError) ||
                              chargerFeedbackStatusOptions.length === 0
                            }
                            onClick={() => void handleChargerFeedbackStatusUpdate(feedback)}
                            type="button"
                          >
                            {updatingChargerFeedbackId === feedback.id ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!chargerFeedbackPage.isLoading && chargerFeedbackPage.items.length === 0 ? (
              <EmptyState label="No charger feedback found." />
            ) : null}
            {chargerFeedbackPage.isLoading ? <LoadingState label="Loading charger feedback..." /> : null}
          </div>
          <Pagination
            isLoading={chargerFeedbackPage.isLoading}
            onNext={() => void loadChargerFeedback(chargerFeedbackPage.page + 1)}
            onPrevious={() => void loadChargerFeedback(chargerFeedbackPage.page - 1)}
            page={chargerFeedbackPage.page}
            showNext={hasNextPage(chargerFeedbackPage)}
            totalPages={chargerFeedbackPage.totalPages}
          />
        </section>
      )}
    </main>
  );
};

type ChargerFormPanelProps = {
  errors: ChargerFormErrors;
  form: ChargerFormState;
  formMode: 'create' | 'edit';
  isDetailLoading: boolean;
  isOptionsLoading: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onUpdate: <Key extends keyof ChargerFormState>(key: Key, value: ChargerFormState[Key]) => void;
  options: ChargerFormOptions;
  optionsError: string | null;
  selectedCharger: AdminCharger | null;
};

type VehicleFormPanelProps = {
  errors: VehicleFormErrors;
  form: VehicleFormState;
  formMode: 'create' | 'edit';
  isDetailLoading: boolean;
  isOptionsLoading: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onUpdate: <Key extends keyof VehicleFormState>(key: Key, value: VehicleFormState[Key]) => void;
  options: VehicleFormOptions;
  optionsError: string | null;
  selectedVehicle: AdminVehicle | null;
};

const VehicleFormPanel = ({
  errors,
  form,
  formMode,
  isDetailLoading,
  isOptionsLoading,
  isSaving,
  onCancel,
  onSave,
  onUpdate,
  options,
  optionsError,
  selectedVehicle,
}: VehicleFormPanelProps) => {
  const isDisabled = Boolean(optionsError) || isOptionsLoading || isSaving;

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            {formMode === 'create' ? 'Add new EV' : `Edit EV ${formatValue(selectedVehicle?.id)}`}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Source confidence is about data provenance, not EVReady verification of specs,
            pricing, availability, range, battery, warranty, or dealer claims.
          </p>
          {isDetailLoading ? <p className="mt-1 text-sm text-slate-500">Loading EV details...</p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <AdminSelect
          disabled={isDisabled}
          error={errors.type}
          label="Type"
          onChange={(value) => onUpdate('type', value)}
          options={options.vehicleTypes}
          value={form.type}
        />
        <AdminSelect
          disabled={isDisabled}
          error={errors.brandId}
          label="Brand"
          onChange={(value) => onUpdate('brandId', value)}
          options={options.brands}
          value={form.brandId}
        />
        <AdminSelect
          disabled={isDisabled}
          error={errors.chargerTypeId}
          label="Charger type"
          onChange={(value) => onUpdate('chargerTypeId', value)}
          options={options.chargerTypes}
          value={form.chargerTypeId}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.model}
          label="Model"
          onChange={(value) => onUpdate('model', value)}
          value={form.model}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.variant}
          label="Variant"
          onChange={(value) => onUpdate('variant', value)}
          value={form.variant}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.pricePkr}
          label="Price PKR"
          onChange={(value) => onUpdate('pricePkr', value)}
          type="number"
          value={form.pricePkr}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.rangeKm}
          label="Range km"
          onChange={(value) => onUpdate('rangeKm', value)}
          type="number"
          value={form.rangeKm}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.batteryCapacityKwh}
          label="Battery capacity kWh"
          onChange={(value) => onUpdate('batteryCapacityKwh', value)}
          type="number"
          value={form.batteryCapacityKwh}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.image}
          label="Image URL/path"
          onChange={(value) => onUpdate('image', value)}
          value={form.image}
        />
        <AdminTextarea
          className="md:col-span-2"
          disabled={isDisabled}
          error={errors.description}
          label="Description"
          onChange={(value) => onUpdate('description', value)}
          value={form.description}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.sourceUrl}
          label="Source URL"
          onChange={(value) => onUpdate('sourceUrl', value)}
          value={form.sourceUrl}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.sourceLabel}
          label="Source label"
          onChange={(value) => onUpdate('sourceLabel', value)}
          value={form.sourceLabel}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.sourceCheckedAt}
          label="Source checked date"
          onChange={(value) => onUpdate('sourceCheckedAt', value)}
          type="date"
          value={form.sourceCheckedAt}
        />
        <AdminSelect
          disabled={isDisabled}
          error={errors.verificationStatus}
          label="Source confidence"
          onChange={(value) => onUpdate('verificationStatus', value)}
          options={options.verificationStatuses}
          value={form.verificationStatus}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.displayOrder}
          label="Display order"
          onChange={(value) => onUpdate('displayOrder', value)}
          type="number"
          value={form.displayOrder}
        />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            checked={form.dcFastCharging}
            className="h-4 w-4 rounded border-slate-300 text-emerald-700"
            disabled={isDisabled}
            onChange={(event) => onUpdate('dcFastCharging', event.target.checked)}
            type="checkbox"
          />
          DC fast charging
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            checked={form.active}
            className="h-4 w-4 rounded border-slate-300 text-emerald-700"
            disabled={isDisabled}
            onChange={(event) => onUpdate('active', event.target.checked)}
            type="checkbox"
          />
          Active in public EV Catalogue
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isDisabled}
          onClick={onSave}
          type="button"
        >
          {isSaving ? 'Saving...' : formMode === 'create' ? 'Add EV' : 'Save EV'}
        </button>
        <button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </aside>
  );
};

const ChargerFormPanel = ({
  errors,
  form,
  formMode,
  isDetailLoading,
  isOptionsLoading,
  isSaving,
  onCancel,
  onSave,
  onUpdate,
  options,
  optionsError,
  selectedCharger,
}: ChargerFormPanelProps) => {
  const isDisabled = Boolean(optionsError) || isOptionsLoading || isSaving;

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            {formMode === 'create' ? 'Add new charger' : `Edit charger ${formatValue(selectedCharger?.id)}`}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Reported status is not live availability. Source confidence is not field verification.
          </p>
          {isDetailLoading ? <p className="mt-1 text-sm text-slate-500">Loading charger details...</p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <AdminSelect
          disabled={isDisabled}
          error={errors.chargerTypeId}
          label="Charger type"
          onChange={(value) => onUpdate('chargerTypeId', value)}
          options={options.chargerTypes}
          value={form.chargerTypeId}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.name}
          label="Name"
          onChange={(value) => onUpdate('name', value)}
          value={form.name}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.city}
          label="City"
          onChange={(value) => onUpdate('city', value)}
          value={form.city}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.area}
          label="Area"
          onChange={(value) => onUpdate('area', value)}
          value={form.area}
        />
        <AdminInput
          className="md:col-span-2"
          disabled={isDisabled}
          error={errors.address}
          label="Address"
          onChange={(value) => onUpdate('address', value)}
          value={form.address}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.latitude}
          label="Latitude"
          onChange={(value) => onUpdate('latitude', value)}
          type="number"
          value={form.latitude}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.longitude}
          label="Longitude"
          onChange={(value) => onUpdate('longitude', value)}
          type="number"
          value={form.longitude}
        />
        <AdminSelect
          disabled={isDisabled}
          error={errors.chargingType}
          label="Charging type"
          onChange={(value) => onUpdate('chargingType', value)}
          options={options.chargingTypes}
          value={form.chargingType}
        />
        <AdminSelect
          disabled={isDisabled}
          error={errors.status}
          label="Reported non-live status"
          onChange={(value) => onUpdate('status', value)}
          options={options.statuses}
          value={form.status}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.powerKw}
          label="Power kW"
          onChange={(value) => onUpdate('powerKw', value)}
          type="number"
          value={form.powerKw}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.priceNote}
          label="Price note"
          onChange={(value) => onUpdate('priceNote', value)}
          value={form.priceNote}
        />
        <AdminTextarea
          className="md:col-span-2"
          disabled={isDisabled}
          error={errors.description}
          label="Description"
          onChange={(value) => onUpdate('description', value)}
          value={form.description}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.image}
          label="Image URL/path"
          onChange={(value) => onUpdate('image', value)}
          value={form.image}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.sourceUrl}
          label="Source URL"
          onChange={(value) => onUpdate('sourceUrl', value)}
          value={form.sourceUrl}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.sourceLabel}
          label="Source label"
          onChange={(value) => onUpdate('sourceLabel', value)}
          value={form.sourceLabel}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.sourceCheckedAt}
          label="Source checked date"
          onChange={(value) => onUpdate('sourceCheckedAt', value)}
          type="date"
          value={form.sourceCheckedAt}
        />
        <AdminSelect
          disabled={isDisabled}
          error={errors.verificationStatus}
          label="Source confidence"
          onChange={(value) => onUpdate('verificationStatus', value)}
          options={options.verificationStatuses}
          value={form.verificationStatus}
        />
        <AdminInput
          disabled={isDisabled}
          error={errors.displayOrder}
          label="Display order"
          onChange={(value) => onUpdate('displayOrder', value)}
          type="number"
          value={form.displayOrder}
        />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            checked={form.active}
            className="h-4 w-4 rounded border-slate-300 text-emerald-700"
            disabled={isDisabled}
            onChange={(event) => onUpdate('active', event.target.checked)}
            type="checkbox"
          />
          Active in public directory
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isDisabled}
          onClick={onSave}
          type="button"
        >
          {isSaving ? 'Saving...' : formMode === 'create' ? 'Add charger' : 'Save charger'}
        </button>
        <button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </aside>
  );
};

type AdminInputProps = {
  className?: string;
  disabled: boolean;
  error?: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
};

const AdminInput = ({ className = '', disabled, error, label, onChange, type = 'text', value }: AdminInputProps) => (
  <label className={`text-sm font-semibold text-slate-700 ${className}`}>
    {label}
    <input
      className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      value={value}
    />
    {error ? <span className="mt-1 block text-xs font-normal text-red-700">{error}</span> : null}
  </label>
);

type AdminTextareaProps = {
  className?: string;
  disabled: boolean;
  error?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

const AdminTextarea = ({ className = '', disabled, error, label, onChange, value }: AdminTextareaProps) => (
  <label className={`text-sm font-semibold text-slate-700 ${className}`}>
    {label}
    <textarea
      className="mt-2 min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
    {error ? <span className="mt-1 block text-xs font-normal text-red-700">{error}</span> : null}
  </label>
);

type AdminSelectProps = {
  disabled: boolean;
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: ChargerFormOption[];
  value: string;
};

const AdminSelect = ({ disabled, error, label, onChange, options, value }: AdminSelectProps) => (
  <label className="text-sm font-semibold text-slate-700">
    {label}
    <select
      className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
      disabled={disabled || options.length === 0}
      onChange={(event) => onChange(event.target.value)}
      value={options.some((option) => option.value === value) ? value : ''}
    >
      <option value="" disabled>
        Select option
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error ? <span className="mt-1 block text-xs font-normal text-red-700">{error}</span> : null}
  </label>
);

type AdminSectionHeaderProps = {
  count?: number;
  title: string;
  onRefresh: () => void;
};

const AdminSectionHeader = ({ count, title, onRefresh }: AdminSectionHeaderProps) => (
  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      {typeof count === 'number' ? <p className="text-sm text-slate-500">{count} total records</p> : null}
    </div>
    <button
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      onClick={onRefresh}
      type="button"
    >
      Refresh
    </button>
  </div>
);

type PaginationProps = {
  isLoading: boolean;
  page: number;
  showNext: boolean;
  totalPages?: number;
  onNext: () => void;
  onPrevious: () => void;
};

const Pagination = ({ isLoading, page, showNext, totalPages, onNext, onPrevious }: PaginationProps) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <button
      className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isLoading || page <= 0}
      onClick={onPrevious}
      type="button"
    >
      Previous
    </button>
    <span className="text-slate-500">
      Page {page + 1}
      {typeof totalPages === 'number' ? ` of ${totalPages}` : ''}
    </span>
    <button
      className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isLoading || !showNext}
      onClick={onNext}
      type="button"
    >
      Next
    </button>
  </div>
);

type PageSizeSelectProps = {
  disabled: boolean;
  onChange: (pageSize: number) => void;
  value: number;
};

const PageSizeSelect = ({ disabled, onChange, value }: PageSizeSelectProps) => (
  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
    Records per page
    <select
      className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      value={value}
    >
      {PAGE_SIZE_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

type DetailsPanelProps = {
  detailError: string | null;
  isLoading: boolean;
  onClose: () => void;
  rows: Array<[string, string]>;
  title: string;
};

const DetailsPanel = ({ detailError, isLoading, onClose, rows, title }: DetailsPanelProps) => (
  <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        {isLoading ? <p className="mt-1 text-sm text-slate-500">Loading details...</p> : null}
        {detailError ? <p className="mt-1 text-sm text-amber-700">{detailError}</p> : null}
      </div>
      <button className="text-sm font-semibold text-slate-600 hover:text-slate-900" onClick={onClose} type="button">
        Close
      </button>
    </div>
    <dl className="mt-4 grid gap-3 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div className="rounded-md bg-slate-50 p-3" key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value}</dd>
        </div>
      ))}
    </dl>
  </aside>
);

const Alert = ({ message }: { message: string }) => (
  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
);

const SuccessMessage = ({ message }: { message: string }) => (
  <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
);

const EmptyState = ({ label }: { label: string }) => <p className="px-4 py-6 text-sm text-slate-500">{label}</p>;

const LoadingState = ({ label }: { label: string }) => <p className="px-4 py-6 text-sm text-slate-500">{label}</p>;

export default AdminDashboard;
