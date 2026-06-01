import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { normalizeVehicle, type BackendVehicle, type Vehicle } from '../data/vehicles';
import {
  ApiError,
  apiClient,
  vehicleReviewApi,
  type PageResponse,
  type PublicVehicleReview,
  type VehicleReviewExperienceTypeOption,
} from '../utils/api';

type VehicleVerificationStatus =
  | 'OFFICIAL'
  | 'DEALER_CONFIRMED'
  | 'USER_REPORTED'
  | 'UNVERIFIED';

type BackendVehicleDetail = BackendVehicle & {
  verificationStatus?: VehicleVerificationStatus | null;
};

type VehicleDetailRecord = Vehicle & {
  description?: string | null;
  variant?: string | null;
  verificationStatus: VehicleVerificationStatus;
};

type ReviewFormState = {
  rating: string;
  experienceType: string;
  reviewText: string;
  displayName: string;
  city: string;
};

type ReviewFormErrors = {
  rating?: string;
  experienceType?: string;
};

type ApprovedReviewPageState = {
  reviews: PublicVehicleReview[];
  page: number;
  totalPages?: number;
  totalElements?: number;
  isLoading: boolean;
  errorMessage: string | null;
};

const currencyFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
  style: 'currency',
  currency: 'PKR',
});

const verificationStatusLabels: Record<VehicleVerificationStatus, string> = {
  OFFICIAL: 'Official source-backed',
  DEALER_CONFIRMED: 'Dealer source-backed',
  USER_REPORTED: 'User reported source',
  UNVERIFIED: 'Source not confirmed',
};

const verificationStatusClasses: Record<VehicleVerificationStatus, string> = {
  OFFICIAL: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DEALER_CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
  USER_REPORTED: 'border-amber-200 bg-amber-50 text-amber-700',
  UNVERIFIED: 'border-slate-200 bg-slate-50 text-slate-600',
};

const initialReviewForm: ReviewFormState = {
  rating: '',
  experienceType: '',
  reviewText: '',
  displayName: '',
  city: '',
};

const inputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const approvedReviewPageSize = 5;

const emptyApprovedReviewPage = (page = 0): ApprovedReviewPageState => ({
  reviews: [],
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

  return 'Vehicle details could not be loaded right now.';
}

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.response.status === 404;
}

function normalizeVerificationStatus(
  verificationStatus: BackendVehicleDetail['verificationStatus'],
): VehicleVerificationStatus {
  if (
    verificationStatus === 'OFFICIAL' ||
    verificationStatus === 'DEALER_CONFIRMED' ||
    verificationStatus === 'USER_REPORTED'
  ) {
    return verificationStatus;
  }

  return 'UNVERIFIED';
}

function normalizeVehicleDetail(vehicle: BackendVehicleDetail): VehicleDetailRecord {
  return {
    ...normalizeVehicle(vehicle),
    description: vehicle.description,
    variant: vehicle.variant,
    verificationStatus: normalizeVerificationStatus(vehicle.verificationStatus),
  };
}

function normalizeApprovedReviewPage(
  payload: PageResponse<PublicVehicleReview> | PublicVehicleReview[],
  fallbackPage: number,
): ApprovedReviewPageState {
  if (Array.isArray(payload)) {
    return {
      reviews: payload,
      page: fallbackPage,
      isLoading: false,
      errorMessage: null,
    };
  }

  return {
    reviews: Array.isArray(payload.content) ? payload.content : [],
    page: typeof payload.number === 'number' ? payload.number : payload.page ?? fallbackPage,
    totalPages: payload.totalPages,
    totalElements: payload.totalElements,
    isLoading: false,
    errorMessage: null,
  };
}

export default function VehicleDetail() {
  const { id } = useParams();
  const location = useLocation();
  const reviewFormRef = useRef<HTMLElement>(null);
  const approvedReviewsRef = useRef<HTMLElement>(null);
  const [vehicle, setVehicle] = useState<VehicleDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [experienceTypes, setExperienceTypes] = useState<VehicleReviewExperienceTypeOption[]>([]);
  const [experienceTypeErrorMessage, setExperienceTypeErrorMessage] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>(initialReviewForm);
  const [reviewFormErrors, setReviewFormErrors] = useState<ReviewFormErrors>({});
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [approvedReviewPage, setApprovedReviewPage] = useState<ApprovedReviewPageState>(
    emptyApprovedReviewPage(),
  );

  useEffect(() => {
    let isCurrentRequest = true;

    if (!id) {
      setVehicle(null);
      setIsLoading(false);
      setErrorMessage(null);
      setNotFoundMessage('Vehicle ID was not provided.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundMessage(null);

    apiClient
      .get<BackendVehicleDetail>(`/api/v1/vehicles/${encodeURIComponent(id)}`)
      .then((vehicleResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!vehicleResponse || typeof vehicleResponse !== 'object') {
          throw new Error('Vehicle detail response was empty.');
        }

        setVehicle(normalizeVehicleDetail(vehicleResponse));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setVehicle(null);

        if (isNotFoundError(error)) {
          setNotFoundMessage('This vehicle could not be found.');
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
    if (isLoading || !vehicle) {
      return;
    }

    const target =
      location.hash === '#write-review'
        ? reviewFormRef.current
        : location.hash === '#reviews'
          ? approvedReviewsRef.current
          : null;

    if (!target) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);

    return () => window.clearTimeout(scrollTimer);
  }, [isLoading, location.hash, vehicle]);

  useEffect(() => {
    if (!id) {
      setApprovedReviewPage(emptyApprovedReviewPage());
      return;
    }

    void loadApprovedReviews(0, id);
  }, [id]);

  useEffect(() => {
    let isCurrentRequest = true;

    setExperienceTypeErrorMessage(null);

    vehicleReviewApi
      .getExperienceTypes()
      .then((experienceTypeResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(experienceTypeResponse)) {
          throw new Error('Review experience type response was not a list.');
        }

        setExperienceTypes(
          experienceTypeResponse
            .map((experienceType) => normalizeExperienceTypeOption(experienceType))
            .filter((experienceType): experienceType is VehicleReviewExperienceTypeOption =>
              Boolean(experienceType),
            ),
        );
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setExperienceTypes([]);
        setExperienceTypeErrorMessage(getErrorMessage(error));
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  async function loadApprovedReviews(page: number, vehicleId = id) {
    if (!vehicleId) {
      return;
    }

    setApprovedReviewPage((currentPage) => ({
      ...currentPage,
      page,
      isLoading: true,
      errorMessage: null,
    }));

    try {
      const reviewResponse = await vehicleReviewApi.getApprovedReviews(
        vehicleId,
        page,
        approvedReviewPageSize,
      );
      setApprovedReviewPage(normalizeApprovedReviewPage(reviewResponse, page));
    } catch (error: unknown) {
      setApprovedReviewPage((currentPage) => ({
        ...currentPage,
        isLoading: false,
        errorMessage: getErrorMessage(error),
      }));
    }
  }

  function updateReviewField<Key extends keyof ReviewFormState>(
    key: Key,
    value: ReviewFormState[Key],
  ) {
    setReviewForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));

    if (key === 'rating' || key === 'experienceType') {
      setReviewFormErrors((currentErrors) => ({
        ...currentErrors,
        [key]: undefined,
      }));
    }

    setReviewSuccessMessage(null);
    setReviewErrorMessage(null);
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) {
      setReviewErrorMessage('Vehicle ID was not available for review submission.');
      return;
    }

    const rating = Number(reviewForm.rating);
    const nextErrors: ReviewFormErrors = {};

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      nextErrors.rating = 'Choose a rating from 1 to 5.';
    }

    if (!reviewForm.experienceType) {
      nextErrors.experienceType = 'Choose the kind of experience you are sharing.';
    }

    setReviewFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrorMessage(null);
    setReviewSuccessMessage(null);

    vehicleReviewApi
      .submitReview(id, {
        rating,
        experienceType: reviewForm.experienceType,
        reviewText: trimOptionalValue(reviewForm.reviewText),
        displayName: trimOptionalValue(reviewForm.displayName),
        city: trimOptionalValue(reviewForm.city),
      })
      .then((response) => {
        setReviewSuccessMessage(
          isMeaningfulString(response.message)
            ? response.message.trim()
            : 'Review submitted for moderation. It will not be published unless approved.',
        );
        setReviewForm(initialReviewForm);
      })
      .catch((error: unknown) => {
        setReviewErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        setIsSubmittingReview(false);
      });
  }

  function scrollToReviewForm() {
    reviewFormRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  const backLink = (
    <Link
      className="inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-700 sm:w-auto"
      to={`/vehicles${location.search}`}
    >
      Back to EV Catalogue
    </Link>
  );

  return (
    <PageShell
      actions={backLink}
      eyebrow="Vehicle details"
      title={vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle Details'}
    >
      <div className="space-y-6">
        {isLoading ? (
          <StateMessage>Loading vehicle details...</StateMessage>
        ) : notFoundMessage ? (
          <StateMessage>{notFoundMessage}</StateMessage>
        ) : errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Vehicle details could not be loaded.</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        ) : vehicle ? (
          <>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Verify price, availability, specs, and dealer details before purchase.
              Source-confidence labels describe where the catalog information appears to come from;
              they do not mean EVReady field verification.
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    {vehicle.category} - {vehicle.vehicleType}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {formatPrice(vehicle.approxPricePkr)}
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span
                    className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationStatusClasses[vehicle.verificationStatus]}`}
                  >
                    {verificationStatusLabels[vehicle.verificationStatus]}
                  </span>
                  <RatingSummary
                    averageRating={vehicle.averageRating}
                    ratingCount={vehicle.ratingCount}
                  />
                </div>
                <button
                  className="inline-flex w-fit rounded-md border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  type="button"
                  onClick={scrollToReviewForm}
                >
                  Write a Review
                </button>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <SpecRow label="Brand" value={vehicle.brand} />
                <SpecRow label="Model" value={vehicle.model} />
                <SpecRow label="Variant" value={formatText(vehicle.variant, 'Variant not listed')} />
                <SpecRow label="Vehicle type" value={`${vehicle.category} - ${vehicle.vehicleType}`} />
                <SpecRow label="Price" value={formatPrice(vehicle.approxPricePkr)} />
                <SpecRow label="Claimed range" value={formatDistance(vehicle.claimedRangeKm)} />
                <SpecRow label="Practical city range" value={formatDistance(vehicle.practicalCityRangeKm)} />
                <SpecRow label="Practical highway range" value={formatDistance(vehicle.practicalHighwayRangeKm)} />
                <SpecRow label="Battery capacity" value={formatBattery(vehicle.batteryCapacityKwh)} />
                <SpecRow label="Charger type" value={vehicle.connectorType} />
                <SpecRow label="AC charging" value={formatBoolean(vehicle.supportsAcCharging)} />
                <SpecRow label="DC fast charging" value={formatBoolean(vehicle.supportsDcCharging)} />
              </div>

              {isMeaningfulString(vehicle.description) ? (
                <div className="mt-5 rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {vehicle.description.trim()}
                  </p>
                </div>
              ) : null}
            </section>

            <section
              id="write-review"
              ref={reviewFormRef}
              className="scroll-mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950">Share your vehicle experience</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Your review will be submitted for moderation before any public display. EVReady
                  does not verify user claims, and newly submitted reviews do not appear in the
                  approved public list unless they are approved later.
                </p>
              </div>

              {experienceTypeErrorMessage ? (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Review experience options could not be loaded right now. Please try again later.
                </div>
              ) : null}

              <form className="mt-5 space-y-4" onSubmit={handleReviewSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-800">
                    Rating
                    <select
                      className={inputClass}
                      value={reviewForm.rating}
                      onChange={(event) => updateReviewField('rating', event.target.value)}
                    >
                      <option value="">Choose 1 to 5</option>
                      <option value="1">1 - Very poor</option>
                      <option value="2">2 - Poor</option>
                      <option value="3">3 - Okay</option>
                      <option value="4">4 - Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                    {reviewFormErrors.rating ? (
                      <span className="mt-2 block text-xs font-normal text-red-700">
                        {reviewFormErrors.rating}
                      </span>
                    ) : null}
                  </label>

                  <label className="text-sm font-medium text-slate-800">
                    Experience type
                    <select
                      className={inputClass}
                      value={reviewForm.experienceType}
                      disabled={experienceTypes.length === 0}
                      onChange={(event) => updateReviewField('experienceType', event.target.value)}
                    >
                      <option value="">Choose one</option>
                      {experienceTypes.map((experienceType) => (
                        <option key={experienceType.value} value={experienceType.value}>
                          {experienceType.label}
                        </option>
                      ))}
                    </select>
                    {reviewFormErrors.experienceType ? (
                      <span className="mt-2 block text-xs font-normal text-red-700">
                        {reviewFormErrors.experienceType}
                      </span>
                    ) : null}
                  </label>

                  <label className="text-sm font-medium text-slate-800">
                    Display name <span className="font-normal text-slate-500">(optional)</span>
                    <input
                      className={inputClass}
                      type="text"
                      value={reviewForm.displayName}
                      onChange={(event) => updateReviewField('displayName', event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-medium text-slate-800">
                    City <span className="font-normal text-slate-500">(optional)</span>
                    <input
                      className={inputClass}
                      type="text"
                      value={reviewForm.city}
                      onChange={(event) => updateReviewField('city', event.target.value)}
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-800">
                  Review text <span className="font-normal text-slate-500">(optional)</span>
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    value={reviewForm.reviewText}
                    onChange={(event) => updateReviewField('reviewText', event.target.value)}
                  />
                </label>

                {reviewSuccessMessage ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                    {reviewSuccessMessage}
                  </div>
                ) : null}

                {reviewErrorMessage ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                    {reviewErrorMessage}
                  </div>
                ) : null}

                <button
                  className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  type="submit"
                  disabled={isSubmittingReview || experienceTypes.length === 0}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </section>

            <section
              id="reviews"
              ref={approvedReviewsRef}
              className="scroll-mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950">Approved community reviews</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Public reviews are community-submitted and moderated before display. Ratings are
                  not official, and EVReady does not verify every claim.
                </p>
              </div>

              {approvedReviewPage.isLoading ? (
                <StateMessage>Loading approved reviews...</StateMessage>
              ) : approvedReviewPage.errorMessage ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  <p className="font-semibold">Approved reviews could not be loaded.</p>
                  <p className="mt-1">{approvedReviewPage.errorMessage}</p>
                </div>
              ) : approvedReviewPage.reviews.length > 0 ? (
                <div className="mt-5 space-y-4">
                  <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                    {approvedReviewPage.reviews.map((review, index) => (
                      <ApprovedReviewCard key={review.id ?? index} review={review} />
                    ))}
                  </div>
                  {shouldShowReviewPagination(approvedReviewPage) ? (
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={approvedReviewPage.isLoading || approvedReviewPage.page <= 0}
                        onClick={() => void loadApprovedReviews(approvedReviewPage.page - 1)}
                        type="button"
                      >
                        Previous
                      </button>
                      <span className="text-slate-500">Page {approvedReviewPage.page + 1}</span>
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!hasNextReviewPage(approvedReviewPage)}
                        onClick={() => void loadApprovedReviews(approvedReviewPage.page + 1)}
                        type="button"
                      >
                        Next
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  No approved reviews yet.
                </div>
              )}
            </section>
          </>
        ) : (
          <StateMessage>Vehicle details are not available right now.</StateMessage>
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

type RatingSummaryProps = {
  averageRating: number | null;
  ratingCount: number;
  className?: string;
};

function RatingSummary({ averageRating, className = '', ratingCount }: RatingSummaryProps) {
  if (!averageRating || ratingCount <= 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${className}`}>
      <span className="font-semibold text-amber-600" aria-hidden="true">
        {renderStars(averageRating)}
      </span>
      <span className="font-semibold text-slate-800">
        {formatRating(averageRating)}/5 · {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}

function ApprovedReviewCard({ review }: { review: PublicVehicleReview }) {
  const rating = parseRating(review.rating);

  return (
    <article className="min-w-[min(20rem,85vw)] snap-start rounded-md border border-slate-200 bg-slate-50 p-4 sm:min-w-[22rem]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950">{formatText(review.displayName, 'EVReady user')}</p>
          <p className="mt-1 text-sm text-slate-600">
            {formatText(review.city, 'City not listed')} · {formatEnumLabel(formatText(review.experienceType, 'Experience not listed'))}
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-800">
          {rating ? (
            <span>
              <span className="text-amber-600" aria-hidden="true">
                {renderStars(rating)}
              </span>{' '}
              {formatRating(rating)}/5
            </span>
          ) : (
            'Rating not listed'
          )}
        </div>
      </div>
      <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-white px-3 py-2 text-sm leading-6 text-slate-700">
        {formatText(review.reviewText, 'No review text provided.')}
      </p>
      <p className="mt-3 text-xs text-slate-500">Submitted {formatDate(review.createdAt)}</p>
    </article>
  );
}

function isMeaningfulString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatText(value: unknown, fallback: string) {
  return isMeaningfulString(value) ? value.trim() : fallback;
}

function formatPrice(value: number) {
  return value > 0 ? currencyFormatter.format(value) : 'Price not listed';
}

function formatDistance(value: number) {
  return value > 0 ? `${value} km` : 'Range not listed';
}

function formatBattery(value: number) {
  return value > 0 ? `${value} kWh` : 'Battery capacity not listed';
}

function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

function parseRating(value: PublicVehicleReview['rating']) {
  const parsedValue = typeof value === 'number' ? value : isMeaningfulString(value) ? Number(value) : Number.NaN;

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return Math.min(5, Math.round(parsedValue * 10) / 10);
}

function renderStars(rating: number) {
  const roundedRating = Math.round(rating);

  return Array.from({ length: 5 }, (_, index) => (index < roundedRating ? '★' : '☆')).join('');
}

function formatRating(rating: number) {
  return rating.toFixed(1);
}

function formatDate(value: unknown) {
  if (!isMeaningfulString(value)) {
    return 'Date not listed';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.trim();
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(date);
}

function shouldShowReviewPagination(reviewPage: ApprovedReviewPageState) {
  if (typeof reviewPage.totalPages === 'number') {
    return reviewPage.totalPages > 1;
  }

  return reviewPage.page > 0 || reviewPage.reviews.length === approvedReviewPageSize;
}

function hasNextReviewPage(reviewPage: ApprovedReviewPageState) {
  if (typeof reviewPage.totalPages === 'number') {
    return reviewPage.page + 1 < reviewPage.totalPages;
  }

  return reviewPage.reviews.length === approvedReviewPageSize;
}

function trimOptionalValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeExperienceTypeOption(value: unknown): VehicleReviewExperienceTypeOption | null {
  if (isMeaningfulString(value)) {
    return {
      value: value.trim(),
      label: formatEnumLabel(value.trim()),
    };
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const option = value as Record<string, unknown>;
  const optionValue = [option.value, option.code, option.name, option.id].find(isMeaningfulString);

  if (!optionValue) {
    return null;
  }

  const optionLabel = [option.label, option.name].find(isMeaningfulString) ?? optionValue;

  return {
    value: optionValue.trim(),
    label: optionLabel.trim(),
  };
}

function formatEnumLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
