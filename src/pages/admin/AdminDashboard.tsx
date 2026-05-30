import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../utils/api';
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

type StatusOption = {
  value: string;
  label: string;
};

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

type AdminSection = 'leads' | 'contacts' | 'vehicleReviews' | 'chargerFeedback';

type ModerationDraft = {
  reviewStatus: string;
  moderationReason: string;
};

const PAGE_SIZE = 20;

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

const hasNextPage = <T,>(pageState: PageState<T>) => {
  if (typeof pageState.totalPages === 'number') {
    return pageState.page + 1 < pageState.totalPages;
  }

  return pageState.items.length === PAGE_SIZE;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [adminUser, setAdminUser] = useState<AdminSession | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('leads');
  const [leadPage, setLeadPage] = useState<PageState<Lead>>(emptyPage<Lead>());
  const [contactPage, setContactPage] = useState<PageState<ContactSubmission>>(emptyPage<ContactSubmission>());
  const [vehicleReviewPage, setVehicleReviewPage] = useState<PageState<VehicleReview>>(emptyPage<VehicleReview>());
  const [chargerFeedbackPage, setChargerFeedbackPage] = useState<PageState<ChargerFeedback>>(
    emptyPage<ChargerFeedback>(),
  );
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
        `/api/v1/admin/leads?page=${page}&size=${PAGE_SIZE}`,
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
        `/api/v1/admin/contact-submissions?page=${page}&size=${PAGE_SIZE}`,
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
        size: PAGE_SIZE,
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
        size: PAGE_SIZE,
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

  useEffect(() => {
    if (authState === 'authenticated') {
      void loadLeadStatusOptions();
      void loadContactStatusOptions();
      void loadVehicleReviewStatusOptions();
      void loadChargerFeedbackStatusOptions();
      void loadLeads(0);
      void loadContacts(0);
      void loadVehicleReviews(0);
      void loadChargerFeedback(0);
    }
  }, [authState]);

  const handleLogout = async () => {
    try {
      await adminApiClient.post('/api/v1/admin/auth/logout');
    } finally {
      setAdminUser(null);
      setSelectedLead(null);
      setSelectedContact(null);
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
        )}. Charger status was not changed.`,
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
            Access to Get Help leads, Contact Us submissions, vehicle reviews, and charger
            feedback. This view does not create callback, booking, payment, SLA, or live charger
            availability commitments.
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

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'leads' ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
          }`}
          onClick={() => setActiveSection('leads')}
          type="button"
        >
          Get Help Leads
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'contacts' ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
          }`}
          onClick={() => setActiveSection('contacts')}
          type="button"
        >
          Contact Submissions
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'vehicleReviews' ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
          }`}
          onClick={() => setActiveSection('vehicleReviews')}
          type="button"
        >
          Vehicle Reviews
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'chargerFeedback' ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-700'
          }`}
          onClick={() => setActiveSection('chargerFeedback')}
          type="button"
        >
          Charger Feedback
        </button>
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
                <option value="all">All statuses</option>
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
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                      <td className="max-w-sm whitespace-pre-wrap px-4 py-3">{formatValue(review.reviewText)}</td>
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
          />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <AdminSectionHeader
            count={chargerFeedbackPage.totalElements}
            title="Charger Feedback Moderation"
            onRefresh={() => void loadChargerFeedback(chargerFeedbackPage.page)}
          />
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Moderate charger feedback carefully. Status updates here do not change public charger
            status and must not be treated as live availability, access, occupancy, compatibility,
            or pricing confirmation.
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
                <option value="all">All statuses</option>
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
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Charger ID</th>
                  <th className="px-4 py-3">Charger</th>
                  <th className="px-4 py-3">Rating</th>
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
                      <td className="max-w-sm whitespace-pre-wrap px-4 py-3">{formatValue(feedback.message)}</td>
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
          />
        </section>
      )}
    </main>
  );
};

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
  onNext: () => void;
  onPrevious: () => void;
};

const Pagination = ({ isLoading, page, showNext, onNext, onPrevious }: PaginationProps) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <button
      className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isLoading || page <= 0}
      onClick={onPrevious}
      type="button"
    >
      Previous
    </button>
    <span className="text-slate-500">Page {page + 1}</span>
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
