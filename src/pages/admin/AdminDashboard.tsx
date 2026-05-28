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
  createdAt?: string | null;
  message?: string | null;
  sourcePage?: string | null;
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

type AdminSection = 'leads' | 'contacts';

const PAGE_SIZE = 20;
const LEAD_STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

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

const formatStatusLabel = (value?: string | null) => {
  if (!value) {
    return 'Not listed';
  }

  const option = LEAD_STATUS_OPTIONS.find((status) => status.value === value);
  if (option) {
    return option.label;
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<number | string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

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

  useEffect(() => {
    if (authState === 'authenticated') {
      void loadLeads(0);
      void loadContacts(0);
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
      setStatusMessage(`Lead ${updatedLead.id} status updated to ${formatStatusLabel(updatedLead.leadStatus)}.`);
    } catch {
      setStatusError('Lead status could not be updated. Please try again.');
    } finally {
      setUpdatingLeadId(null);
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
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Lead and contact visibility</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only access to Get Help leads and Contact Us submissions. This view does not create
            callback, booking, payment, or SLA commitments.
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
      </div>

      {activeSection === 'leads' ? (
        <section className="flex flex-col gap-4">
          <AdminSectionHeader
            count={leadPage.totalElements}
            title="Get Help Leads"
            onRefresh={() => void loadLeads(leadPage.page)}
          />
          {leadPage.error ? <Alert message={leadPage.error} /> : null}
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
                      <select
                        aria-label={`Update lead ${lead.id} status`}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
                        disabled={updatingLeadId === lead.id}
                        onChange={(event) => void handleLeadStatusChange(lead, event.target.value)}
                        value={lead.leadStatus ?? ''}
                      >
                        {!lead.leadStatus ? <option value="">Not listed</option> : null}
                        {lead.leadStatus && !LEAD_STATUS_OPTIONS.some((status) => status.value === lead.leadStatus) ? (
                          <option value={lead.leadStatus}>{formatStatusLabel(lead.leadStatus)}</option>
                        ) : null}
                        {LEAD_STATUS_OPTIONS.map((status) => (
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
                ['Status', formatValue(selectedLead.leadStatus)],
                ['Source page', formatValue(selectedLead.sourcePage)],
                ['Message', formatValue(selectedLead.message)],
              ]}
              title="Lead details"
            />
          ) : null}
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <AdminSectionHeader
            count={contactPage.totalElements}
            title="Contact Submissions"
            onRefresh={() => void loadContacts(contactPage.page)}
          />
          {contactPage.error ? <Alert message={contactPage.error} /> : null}
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
                ['Source page', formatValue(selectedContact.sourcePage)],
                ['Message', formatValue(selectedContact.message)],
              ]}
              title="Contact details"
            />
          ) : null}
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
