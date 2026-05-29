import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { normalizeVehicle, type BackendVehicle, type Vehicle } from '../data/vehicles';
import {
  ApiError,
  apiClient,
  vehicleReviewApi,
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

export default function VehicleDetail() {
  const { id } = useParams();
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

  return (
    <PageShell eyebrow="Vehicle details" title={vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle Details'}>
      <div className="space-y-6">
        <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" to="/vehicles">
          Back to Vehicle Catalog
        </Link>

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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    {vehicle.category} - {vehicle.vehicleType}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <span
                    className={`mt-2 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationStatusClasses[vehicle.verificationStatus]}`}
                  >
                    {verificationStatusLabels[vehicle.verificationStatus]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {formatPrice(vehicle.approxPricePkr)}
                </p>
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

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950">Share your vehicle experience</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Your review will be submitted for moderation before any public display is added.
                  EVReady does not verify user claims, and public ratings/comments are not shown
                  yet.
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
