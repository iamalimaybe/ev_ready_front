import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import {
  ApiError,
  apiClient,
  chargerFeedbackApi,
  type BackendFieldErrors,
  type ChargerFeedbackSubmission,
  type ChargerFeedbackTypeOption,
  type PageResponse,
  type PublicChargerFeedback,
} from '../utils/api';

type ChargingType = 'AC' | 'DC' | 'AC_DC';
type ChargerStatus = 'OPERATIONAL' | 'LIMITED' | 'COMING_SOON' | 'UNKNOWN';
type ChargerVerificationStatus =
  | 'OFFICIAL'
  | 'DEALER_CONFIRMED'
  | 'USER_REPORTED'
  | 'UNVERIFIED';

type ChargerType = {
  id: string;
  name: string;
};

type BackendChargerDetail = {
  id: string;
  name?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  chargerTypeId?: string;
  charger_type_id?: string;
  chargerType?: ChargerType;
  connectorType?: string;
  chargingType?: ChargingType | null;
  powerKw?: number | string | null;
  status?: ChargerStatus | null;
  verificationStatus?: ChargerVerificationStatus | null;
  sourceCheckedAt?: string | null;
  priceNote?: string | null;
  description?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type ChargerDetailRecord = Omit<BackendChargerDetail, 'latitude' | 'longitude' | 'verificationStatus'> & {
  latitude: number | null;
  longitude: number | null;
  verificationStatus: ChargerVerificationStatus;
};

type ChargerFeedbackFormState = {
  rating: string;
  feedbackType: string;
  message: string;
  displayName: string;
  city: string;
  reportedByContact: string;
};

type ChargerFeedbackFormErrors = Partial<Record<keyof ChargerFeedbackFormState, string>>;

type ApprovedFeedbackPageState = {
  feedback: PublicChargerFeedback[];
  page: number;
  totalPages?: number;
  totalElements?: number;
  isLoading: boolean;
  errorMessage: string | null;
};

const verificationStatusLabels: Record<ChargerVerificationStatus, string> = {
  OFFICIAL: 'Operator source-backed',
  DEALER_CONFIRMED: 'Provider source-backed',
  USER_REPORTED: 'User reported source',
  UNVERIFIED: 'Source not confirmed',
};

const verificationStatusClasses: Record<ChargerVerificationStatus, string> = {
  OFFICIAL: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DEALER_CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
  USER_REPORTED: 'border-amber-200 bg-amber-50 text-amber-700',
  UNVERIFIED: 'border-slate-200 bg-slate-50 text-slate-600',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const initialFeedbackForm: ChargerFeedbackFormState = {
  rating: '',
  feedbackType: '',
  message: '',
  displayName: '',
  city: '',
  reportedByContact: '',
};

const inputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const approvedFeedbackPageSize = 10;

const emptyApprovedFeedbackPage = (page = 0): ApprovedFeedbackPageState => ({
  feedback: [],
  page,
  isLoading: false,
  errorMessage: null,
});

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.response.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Charger details could not be loaded right now.';
}

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.response.status === 404;
}

function normalizeVerificationStatus(
  verificationStatus: BackendChargerDetail['verificationStatus'],
): ChargerVerificationStatus {
  if (
    verificationStatus === 'OFFICIAL' ||
    verificationStatus === 'DEALER_CONFIRMED' ||
    verificationStatus === 'USER_REPORTED'
  ) {
    return verificationStatus;
  }

  return 'UNVERIFIED';
}

function normalizeChargerDetail(charger: BackendChargerDetail): ChargerDetailRecord {
  return {
    ...charger,
    latitude: parseCoordinate(charger.latitude, -90, 90),
    longitude: parseCoordinate(charger.longitude, -180, 180),
    verificationStatus: normalizeVerificationStatus(charger.verificationStatus),
  };
}

function normalizeApprovedFeedbackPage(
  payload: PageResponse<PublicChargerFeedback> | PublicChargerFeedback[],
  fallbackPage: number,
): ApprovedFeedbackPageState {
  if (Array.isArray(payload)) {
    return {
      feedback: payload,
      page: fallbackPage,
      isLoading: false,
      errorMessage: null,
    };
  }

  return {
    feedback: Array.isArray(payload.content) ? payload.content : [],
    page: typeof payload.number === 'number' ? payload.number : payload.page ?? fallbackPage,
    totalPages: payload.totalPages,
    totalElements: payload.totalElements,
    isLoading: false,
    errorMessage: null,
  };
}

export default function ChargerDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [charger, setCharger] = useState<ChargerDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [feedbackTypes, setFeedbackTypes] = useState<ChargerFeedbackTypeOption[]>([]);
  const [feedbackTypeErrorMessage, setFeedbackTypeErrorMessage] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<ChargerFeedbackFormState>(initialFeedbackForm);
  const [feedbackFormErrors, setFeedbackFormErrors] = useState<ChargerFeedbackFormErrors>({});
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState<string | null>(null);
  const [feedbackErrorMessage, setFeedbackErrorMessage] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [approvedFeedbackPage, setApprovedFeedbackPage] = useState<ApprovedFeedbackPageState>(
    emptyApprovedFeedbackPage(),
  );

  useEffect(() => {
    let isCurrentRequest = true;

    if (!id) {
      setCharger(null);
      setIsLoading(false);
      setErrorMessage(null);
      setNotFoundMessage('Charger ID was not provided.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundMessage(null);

    apiClient
      .get<BackendChargerDetail>(`/api/v1/chargers/${encodeURIComponent(id)}`)
      .then((chargerResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!chargerResponse || typeof chargerResponse !== 'object') {
          throw new Error('Charger detail response was empty.');
        }

        setCharger(normalizeChargerDetail(chargerResponse));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setCharger(null);

        if (isNotFoundError(error)) {
          setNotFoundMessage('This charger could not be found.');
          return;
        }

        setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setApprovedFeedbackPage(emptyApprovedFeedbackPage());
      return;
    }

    void loadApprovedFeedback(0, id);
  }, [id]);

  useEffect(() => {
    let isCurrentRequest = true;

    setFeedbackTypeErrorMessage(null);

    chargerFeedbackApi
      .getFeedbackTypes()
      .then((feedbackTypeResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(feedbackTypeResponse)) {
          throw new Error('Charger feedback type response was not a list.');
        }

        setFeedbackTypes(
          feedbackTypeResponse
            .map((feedbackType) => normalizeFeedbackTypeOption(feedbackType))
            .filter((feedbackType): feedbackType is ChargerFeedbackTypeOption =>
              Boolean(feedbackType),
            ),
        );
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setFeedbackTypes([]);
        setFeedbackTypeErrorMessage(getErrorMessage(error));
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  function updateFeedbackField<Key extends keyof ChargerFeedbackFormState>(
    key: Key,
    value: ChargerFeedbackFormState[Key],
  ) {
    setFeedbackForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));

    setFeedbackFormErrors((currentErrors) => ({
      ...currentErrors,
      [key]: undefined,
    }));
    setFeedbackSuccessMessage(null);
    setFeedbackErrorMessage(null);
  }

  function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) {
      setFeedbackErrorMessage('Charger ID was not available for feedback submission.');
      return;
    }

    const nextErrors: ChargerFeedbackFormErrors = {};
    const rating = feedbackForm.rating ? Number(feedbackForm.rating) : undefined;

    if (
      feedbackForm.rating &&
      (rating === undefined || !Number.isInteger(rating) || rating < 1 || rating > 5)
    ) {
      nextErrors.rating = 'Choose a rating from 1 to 5, or leave it blank.';
    }

    if (!feedbackForm.feedbackType) {
      nextErrors.feedbackType = 'Choose the kind of charger feedback you are sharing.';
    }

    setFeedbackFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackErrorMessage(null);
    setFeedbackSuccessMessage(null);

    const feedbackSubmission: ChargerFeedbackSubmission = {
      feedbackType: feedbackForm.feedbackType,
      ...(rating !== undefined ? { rating } : {}),
      ...optionalPayloadField('message', feedbackForm.message),
      ...optionalPayloadField('displayName', feedbackForm.displayName),
      ...optionalPayloadField('city', feedbackForm.city),
      ...optionalPayloadField('reportedByContact', feedbackForm.reportedByContact),
    };

    chargerFeedbackApi
      .submitFeedback(id, feedbackSubmission)
      .then((response) => {
        const responseMessage = isMeaningfulString(response.message)
          ? response.message.trim()
          : 'Feedback submitted for review.';
        setFeedbackSuccessMessage(
          `${responseMessage} It is not public yet and does not update live charger availability or reported status.`,
        );
        setFeedbackForm(initialFeedbackForm);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError) {
          setFeedbackFormErrors(getFieldErrorMap(error.response.fieldErrors));
        }
        setFeedbackErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        setIsSubmittingFeedback(false);
      });
  }

  async function loadApprovedFeedback(page: number, chargerId = id) {
    if (!chargerId) {
      return;
    }

    setApprovedFeedbackPage((currentPage) => ({
      ...currentPage,
      page,
      isLoading: true,
      errorMessage: null,
    }));

    try {
      const feedbackResponse = await chargerFeedbackApi.getApprovedFeedback(
        chargerId,
        page,
        approvedFeedbackPageSize,
      );
      setApprovedFeedbackPage(normalizeApprovedFeedbackPage(feedbackResponse, page));
    } catch (error: unknown) {
      setApprovedFeedbackPage((currentPage) => ({
        ...currentPage,
        isLoading: false,
        errorMessage: getErrorMessage(error),
      }));
    }
  }

  const mapLink = charger ? buildMapsLink(charger.latitude, charger.longitude) : null;
  const backLink = (
    <Link
      className="inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-700 sm:w-auto"
      to={`/chargers${location.search}`}
    >
      Back to Charger Directory
    </Link>
  );

  return (
    <PageShell
      actions={backLink}
      eyebrow="Charger details"
      title={charger ? formatText(charger.name, 'Charger Details') : 'Charger Details'}
    >
      <div className="space-y-6">
        {isLoading ? (
          <StateMessage>Loading charger details...</StateMessage>
        ) : notFoundMessage ? (
          <StateMessage>{notFoundMessage}</StateMessage>
        ) : errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Charger details could not be loaded.</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        ) : charger ? (
          <>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Charger status is not live availability. Verify connector support, access, pricing,
              and operation before travel. Source-confidence labels describe the data source, not a
              physical EVReady audit.
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    {formatText(charger.city, 'City not listed')}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {formatText(charger.name, 'Charger name not listed')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {getLocationText(charger)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationStatusClasses[charger.verificationStatus]}`}
                    >
                      {verificationStatusLabels[charger.verificationStatus]}
                    </span>
                    {mapLink ? (
                      <a
                        className="inline-flex w-fit rounded-full border border-brand-200 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-800"
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Maps
                      </a>
                    ) : null}
                  </div>
                </div>
                <p className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  {formatEnumLabel(charger.status ?? 'UNKNOWN')}
                </p>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <SpecRow label="Name" value={formatText(charger.name, 'Charger name not listed')} />
                <SpecRow label="City" value={formatText(charger.city, 'City not listed')} />
                <SpecRow label="Area" value={formatText(charger.area, 'Area not listed')} />
                <SpecRow label="Address" value={formatText(charger.address, 'Address not listed')} />
                <SpecRow label="Charger / connector type" value={getChargerTypeName(charger)} />
                <SpecRow label="Charging type" value={formatChargingTypeLabel(charger.chargingType)} />
                <SpecRow label="Reported status" value={formatEnumLabel(charger.status ?? 'UNKNOWN')} />
                <SpecRow label="Power" value={formatPower(charger.powerKw)} />
                <SpecRow label="Price note" value={formatText(charger.priceNote, 'Price note not listed')} />
                {formatDate(charger.sourceCheckedAt) ? (
                  <SpecRow label="Source checked" value={formatDate(charger.sourceCheckedAt) ?? ''} />
                ) : null}
              </div>

              {isMeaningfulString(charger.description) ? (
                <div className="mt-5 rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {charger.description.trim()}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950">Share charger feedback</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Submitted feedback is reviewed before any public display. It is not live charger
                  availability and does not confirm that the charger is working, accessible,
                  unoccupied, compatible with your vehicle, or priced as shown.
                </p>
              </div>

              {feedbackTypeErrorMessage ? (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Charger feedback options could not be loaded right now. Please try again later.
                </div>
              ) : null}

              <form className="mt-5 space-y-4" onSubmit={handleFeedbackSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-800">
                    User experience rating{' '}
                    <span className="font-normal text-slate-500">(optional)</span>
                    <select
                      className={inputClass}
                      value={feedbackForm.rating}
                      onChange={(event) => updateFeedbackField('rating', event.target.value)}
                    >
                      <option value="">No experience rating</option>
                      <option value="1">1 - Very poor</option>
                      <option value="2">2 - Poor</option>
                      <option value="3">3 - Okay</option>
                      <option value="4">4 - Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                    <FieldError message={feedbackFormErrors.rating} />
                  </label>

                  <label className="text-sm font-medium text-slate-800">
                    Feedback type
                    <select
                      className={inputClass}
                      value={feedbackForm.feedbackType}
                      disabled={feedbackTypes.length === 0}
                      onChange={(event) => updateFeedbackField('feedbackType', event.target.value)}
                    >
                      <option value="">Choose one</option>
                      {feedbackTypes.map((feedbackType) => (
                        <option key={feedbackType.value} value={feedbackType.value}>
                          {feedbackType.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={feedbackFormErrors.feedbackType} />
                  </label>

                  <label className="text-sm font-medium text-slate-800">
                    Display name <span className="font-normal text-slate-500">(optional)</span>
                    <input
                      className={inputClass}
                      type="text"
                      value={feedbackForm.displayName}
                      onChange={(event) => updateFeedbackField('displayName', event.target.value)}
                    />
                    <FieldError message={feedbackFormErrors.displayName} />
                  </label>

                  <label className="text-sm font-medium text-slate-800">
                    City <span className="font-normal text-slate-500">(optional)</span>
                    <input
                      className={inputClass}
                      type="text"
                      value={feedbackForm.city}
                      onChange={(event) => updateFeedbackField('city', event.target.value)}
                    />
                    <FieldError message={feedbackFormErrors.city} />
                  </label>

                  <label className="text-sm font-medium text-slate-800 md:col-span-2">
                    Contact for internal follow-up only{' '}
                    <span className="font-normal text-slate-500">(optional)</span>
                    <input
                      className={inputClass}
                      type="text"
                      value={feedbackForm.reportedByContact}
                      onChange={(event) =>
                        updateFeedbackField('reportedByContact', event.target.value)
                      }
                    />
                    <FieldError message={feedbackFormErrors.reportedByContact} />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-800">
                  Message <span className="font-normal text-slate-500">(optional)</span>
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    value={feedbackForm.message}
                    onChange={(event) => updateFeedbackField('message', event.target.value)}
                  />
                  <FieldError message={feedbackFormErrors.message} />
                </label>

                {feedbackSuccessMessage ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                    {feedbackSuccessMessage}
                  </div>
                ) : null}

                {feedbackErrorMessage ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                    {feedbackErrorMessage}
                  </div>
                ) : null}

                <button
                  className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  type="submit"
                  disabled={isSubmittingFeedback || feedbackTypes.length === 0}
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950">Community feedback</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Approved user feedback is reviewed before display. This feedback is
                  user-submitted and is not live charger availability. It does not confirm the
                  charger is working right now, accessible, unoccupied, compatible with your
                  vehicle, or priced as shown. Verify charger details before travel.
                </p>
              </div>

              {approvedFeedbackPage.isLoading ? (
                <StateMessage>Loading approved user feedback...</StateMessage>
              ) : approvedFeedbackPage.errorMessage ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  <p className="font-semibold">Approved user feedback could not be loaded.</p>
                  <p className="mt-1">{approvedFeedbackPage.errorMessage}</p>
                </div>
              ) : approvedFeedbackPage.feedback.length > 0 ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {approvedFeedbackPage.feedback.map((feedback, index) => (
                      <ApprovedFeedbackCard key={feedback.id ?? index} feedback={feedback} />
                    ))}
                  </div>
                  {shouldShowFeedbackPagination(approvedFeedbackPage) ? (
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={approvedFeedbackPage.isLoading || approvedFeedbackPage.page <= 0}
                        onClick={() => void loadApprovedFeedback(approvedFeedbackPage.page - 1)}
                        type="button"
                      >
                        Previous
                      </button>
                      <span className="text-slate-500">Page {approvedFeedbackPage.page + 1}</span>
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!hasNextFeedbackPage(approvedFeedbackPage)}
                        onClick={() => void loadApprovedFeedback(approvedFeedbackPage.page + 1)}
                        type="button"
                      >
                        Next
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  No approved user feedback yet. This does not indicate live charger availability
                  or reliability.
                </div>
              )}
            </section>
          </>
        ) : (
          <StateMessage>Charger details are not available right now.</StateMessage>
        )}
      </div>
    </PageShell>
  );
}

type SpecRowProps = {
  label: string;
  value: string;
};

function SpecRow({ label, value }: SpecRowProps) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function StateMessage({ children }: { children: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="mt-2 block text-xs font-normal text-red-700">{message}</span>;
}

function ApprovedFeedbackCard({ feedback }: { feedback: PublicChargerFeedback }) {
  const createdDate = formatDate(feedback.createdAt);

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6">
      <div className="flex flex-wrap items-center gap-2">
        {feedback.rating !== null && feedback.rating !== undefined && feedback.rating !== '' ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            User experience {feedback.rating}/5
          </span>
        ) : null}
        {isMeaningfulString(feedback.feedbackType) ? (
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
            {formatEnumLabel(feedback.feedbackType)}
          </span>
        ) : null}
      </div>

      {isMeaningfulString(feedback.message) ? (
        <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-white px-3 py-2 text-slate-800">
          {feedback.message.trim()}
        </p>
      ) : (
        <p className="mt-3 text-slate-500">No message provided.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>{formatText(feedback.displayName, 'EVReady user')}</span>
        {isMeaningfulString(feedback.city) ? <span>{feedback.city.trim()}</span> : null}
        {createdDate ? <span>{createdDate}</span> : null}
      </div>
    </article>
  );
}

function shouldShowFeedbackPagination(feedbackPage: ApprovedFeedbackPageState) {
  return feedbackPage.page > 0 || feedbackPage.feedback.length === approvedFeedbackPageSize;
}

function hasNextFeedbackPage(feedbackPage: ApprovedFeedbackPageState) {
  if (typeof feedbackPage.totalPages === 'number') {
    return feedbackPage.page + 1 < feedbackPage.totalPages;
  }

  return feedbackPage.feedback.length === approvedFeedbackPageSize;
}

function normalizeFeedbackTypeOption(
  feedbackType: ChargerFeedbackTypeOption,
): ChargerFeedbackTypeOption | null {
  if (!isMeaningfulString(feedbackType.value) || !isMeaningfulString(feedbackType.label)) {
    return null;
  }

  return {
    ...feedbackType,
    value: feedbackType.value.trim(),
    label: feedbackType.label.trim(),
  };
}

function getFieldErrorMap(fieldErrors: BackendFieldErrors | undefined): ChargerFeedbackFormErrors {
  if (!fieldErrors) {
    return {};
  }

  const nextErrors: ChargerFeedbackFormErrors = {};

  if (Array.isArray(fieldErrors)) {
    fieldErrors.forEach((fieldError) => {
      addFieldError(nextErrors, fieldError.field, fieldError.message);
    });
    return nextErrors;
  }

  Object.entries(fieldErrors).forEach(([field, message]) => {
    addFieldError(nextErrors, field, message);
  });

  return nextErrors;
}

function addFieldError(
  errors: ChargerFeedbackFormErrors,
  field: string,
  message: string | undefined,
) {
  if (!isFeedbackField(field) || !isMeaningfulString(message)) {
    return;
  }

  errors[field] = message;
}

function isFeedbackField(field: string): field is keyof ChargerFeedbackFormState {
  return field in initialFeedbackForm;
}

function getChargerTypeName(charger: ChargerDetailRecord) {
  if (isMeaningfulString(charger.chargerType?.name)) {
    return charger.chargerType.name.trim();
  }

  if (isMeaningfulString(charger.connectorType)) {
    return charger.connectorType.trim();
  }

  return 'Unknown';
}

function getLocationText(charger: ChargerDetailRecord) {
  if (isMeaningfulString(charger.address)) {
    return charger.address.trim();
  }

  if (isMeaningfulString(charger.area)) {
    return charger.area.trim();
  }

  return 'Address not listed';
}

function isMeaningfulString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatText(value: unknown, fallback: string) {
  return isMeaningfulString(value) ? value.trim() : fallback;
}

function trimOptionalValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function optionalPayloadField<Key extends keyof ChargerFeedbackSubmission>(
  key: Key,
  value: string,
) {
  const trimmedValue = trimOptionalValue(value);
  return trimmedValue ? { [key]: trimmedValue } : {};
}

function formatPower(powerKw: ChargerDetailRecord['powerKw']) {
  if (typeof powerKw === 'number' && Number.isFinite(powerKw)) {
    return `${powerKw} kW`;
  }

  if (isMeaningfulString(powerKw)) {
    const parsedPower = Number(powerKw);

    if (Number.isFinite(parsedPower)) {
      return `${parsedPower} kW`;
    }
  }

  return 'Power not listed';
}

function formatDate(value: unknown) {
  if (!isMeaningfulString(value)) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return dateFormatter.format(date);
}

function parseCoordinate(value: unknown, min: number, max: number) {
  const coordinate =
    typeof value === 'number' ? value : isMeaningfulString(value) ? Number(value) : Number.NaN;

  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    return null;
  }

  return coordinate;
}

function buildMapsLink(latitude: ChargerDetailRecord['latitude'], longitude: ChargerDetailRecord['longitude']) {
  if (latitude === null || longitude === null) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function formatChargingTypeLabel(value: unknown) {
  if (value === 'AC_DC') {
    return 'AC/DC';
  }

  if (value === 'AC' || value === 'DC') {
    return value;
  }

  return 'Charging type not listed';
}

function formatEnumLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
