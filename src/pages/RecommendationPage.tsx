import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import {
  normalizeVehicle,
  type BackendVehicle,
  type Vehicle,
} from '../data/vehicles';
import { apiClient } from '../utils/api';
import {
  RecommenderApiError,
  isRecommendationInProgress,
  recommenderApi,
  type RecommendationItem,
  type RecommendationRequest,
  type RecommendationResponse,
  type RecommenderHealthStatus,
} from '../utils/recommenderApi';

type FormValues = {
  vehicleType: string;
  budgetPkr: number;
  city: string;
  dailyDistanceKm: number;
  monthlyDistanceKm: number;
  homeChargingAvailable: boolean;
  solarAvailable: boolean;
  primaryUseCase: string;
  familySize: number;
  priority: string;
  additionalNotes: string;
};

const initialFormValues: FormValues = {
  vehicleType: 'CAR',
  budgetPkr: 9000000,
  city: 'Lahore',
  dailyDistanceKm: 45,
  monthlyDistanceKm: 1200,
  homeChargingAvailable: true,
  solarAvailable: false,
  primaryUseCase: 'family commute',
  familySize: 4,
  priority: 'longer range',
  additionalNotes: 'Occasional Lahore to Islamabad travel.',
};

type StoredRecommendationRun = {
  id: number;
  createdAt: number;
};

const cityOptions = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Peshawar'];
const vehicleTypeOptions = ['CAR', 'BIKE'];
const pollIntervalMs = 3000;
const maxPollAttempts = 30;

const activeRecommendationStorageKey = 'evready.activeRecommendationRun';
const activeRecommendationTtlMs = 10 * 60 * 1000;

const healthCheckIntervalMs = 15 * 1000;

const inputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const buttonClass =
  'rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-400';

export default function RecommendationPage() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollMessage, setPollMessage] = useState<string | null>(null);
  const [recommenderHealth, setRecommenderHealth] = useState<RecommenderHealthStatus | 'CHECKING'>(
    'CHECKING',
  );
  const [lastHealthCheckedAt, setLastHealthCheckedAt] = useState<Date | null>(null);
  const pollAttemptRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);
  const hasAttemptedResumeRef = useRef(false);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);

  const vehiclesById = useMemo(() => {
    return new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  }, [vehicles]);

  async function checkRecommenderHealth() {
    setRecommenderHealth((currentHealth) => (currentHealth === 'UP' ? 'UP' : 'CHECKING'));

    const healthStatus = await recommenderApi.getHealth();

    setRecommenderHealth(healthStatus);
    setLastHealthCheckedAt(new Date());
  }

  useEffect(() => {
    void checkRecommenderHealth();

    const intervalId = window.setInterval(() => {
      void checkRecommenderHealth();
    }, healthCheckIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
  let isCurrentRequest = true;

  apiClient
    .get<BackendVehicle[]>('/api/v1/vehicles?sort=default')
    .then((vehicleResponse) => {
      if (!isCurrentRequest || !Array.isArray(vehicleResponse)) {
        return;
      }

      setVehicles(vehicleResponse.map(normalizeVehicle));
    })
    .catch(() => {
      if (isCurrentRequest) {
        setVehicles([]);
      }
    });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    if (recommenderHealth !== 'UP' || hasAttemptedResumeRef.current) {
      return;
    }

    hasAttemptedResumeRef.current = true;

    const storedRecommendation = readStoredRecommendationRun();

    if (!storedRecommendation) {
      return;
    }

    setIsSubmitting(true);
    setPollMessage('Checking your previous recommendation request...');
    void resumeStoredRecommendation(storedRecommendation.id);
  }, [recommenderHealth]);

  function clearPendingPoll() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }

  useEffect(() => {
    return () => {
      clearPendingPoll();
    };
  }, []);

  function updateFormValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function saveActiveRecommendationRun(id: number) {
    try {
      localStorage.setItem(
        activeRecommendationStorageKey,
        JSON.stringify({
          id,
          createdAt: Date.now(),
        } satisfies StoredRecommendationRun),
      );
    } catch {
      // Local storage is a convenience only. Recommendation polling still works without it.
    }
  }

  function clearActiveRecommendationRun() {
    try {
      localStorage.removeItem(activeRecommendationStorageKey);
    } catch {
      // Ignore local storage cleanup failures.
    }
  }

  function readStoredRecommendationRun(): StoredRecommendationRun | null {
    try {
      const rawValue = localStorage.getItem(activeRecommendationStorageKey);

      if (!rawValue) {
        return null;
      }

      const parsedValue = JSON.parse(rawValue) as Partial<StoredRecommendationRun>;

      if (
        typeof parsedValue.id !== 'number' ||
        !Number.isFinite(parsedValue.id) ||
        typeof parsedValue.createdAt !== 'number' ||
        !Number.isFinite(parsedValue.createdAt)
      ) {
        clearActiveRecommendationRun();
        return null;
      }

      if (Date.now() - parsedValue.createdAt > activeRecommendationTtlMs) {
        clearActiveRecommendationRun();
        return null;
      }

      return {
        id: parsedValue.id,
        createdAt: parsedValue.createdAt,
      };
    } catch {
      clearActiveRecommendationRun();
      return null;
    }
  }

  async function resumeStoredRecommendation(id: number) {
    try {
      const latest = await recommenderApi.getRecommendation(id);
      setResult(latest);

      if (isRecommendationInProgress(latest.status)) {
        setPollMessage('Your previous recommendation is still being prepared.');
        schedulePoll(id);
        return;
      }

      clearActiveRecommendationRun();
      setIsSubmitting(false);
      setPollMessage(null);
      scrollToResultSection();
    } catch {
      clearActiveRecommendationRun();
      setResult(null);
      setIsSubmitting(false);
      setPollMessage(null);
    }
  }

  function scrollToResultSection() {
    window.setTimeout(() => {
      resultSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearPendingPoll();
    pollAttemptRef.current = 0;
    setIsSubmitting(true);
    setErrorMessage(null);
    setPollMessage('Creating recommendation request...');
    setResult(null);

    try {
      const created = await recommenderApi.createRecommendation(toRecommendationRequest(formValues));
      setResult(created);
      saveActiveRecommendationRun(created.id);

      if (isRecommendationInProgress(created.status)) {
        setPollMessage('Recommendation is being prepared. This can take a little while.');
        schedulePoll(created.id);
      } else {
        clearActiveRecommendationRun();
        setIsSubmitting(false);
        setPollMessage(null);
        scrollToResultSection();
      }
    } catch (error) {
      setIsSubmitting(false);
      setPollMessage(null);
      clearActiveRecommendationRun();
      setErrorMessage(getErrorMessage(error));
    }
  }

  function schedulePoll(id: number) {
    timeoutRef.current = window.setTimeout(() => {
      void pollRecommendation(id);
    }, pollIntervalMs);
  }

  async function pollRecommendation(id: number) {
    pollAttemptRef.current += 1;

    try {
      const latest = await recommenderApi.getRecommendation(id);
      setResult(latest);

      if (isRecommendationInProgress(latest.status)) {
        if (pollAttemptRef.current >= maxPollAttempts) {
          setIsSubmitting(false);
          setPollMessage(
            'This is taking longer than expected. You can keep this page open, retry, or check again later.',
          );
          return;
        }

        setPollMessage(`Still working... current status: ${latest.status}`);
        schedulePoll(id);
        return;
      }
      
      clearActiveRecommendationRun();
      setIsSubmitting(false);
      setPollMessage(null);
      scrollToResultSection();
    } catch (error) {
      setIsSubmitting(false);
      setPollMessage(null);
      clearActiveRecommendationRun();
      setErrorMessage(getErrorMessage(error));
    }
  }

  if (recommenderHealth !== 'UP') {
    return (
      <PageShell eyebrow="AI EV Recommendation" title="Find EV options that fit your real usage">
        <div className="space-y-6">
          <p className="max-w-3xl text-base leading-7 text-slate-700">
            This page checks the AI recommender microservice before starting a recommendation request.
          </p>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                {recommenderHealth === 'CHECKING'
                  ? 'Checking recommender service'
                  : 'Recommender service unavailable'}
              </p>

              <h2 className="text-2xl font-bold text-slate-950">
                {recommenderHealth === 'CHECKING'
                  ? 'Warming up the AI garage...'
                  : 'The AI recommender is taking a tea break.'}
              </h2>

              <p className="max-w-2xl text-sm leading-6 text-slate-700">
                {recommenderHealth === 'CHECKING'
                  ? 'We are checking whether the recommender microservice is ready before showing the form.'
                  : 'The calculators and vehicle catalogue are still fine, but this page needs the separate AI recommender service to be running before it can prepare EV suggestions.'}
              </p>

              {lastHealthCheckedAt && (
                <p className="text-xs text-slate-500">
                  Last checked at {lastHealthCheckedAt.toLocaleTimeString()}
                </p>
              )}

              <button
                type="button"
                onClick={() => void checkRecommenderHealth()}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Check again
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="AI recommendation" title="Find EV options from the EVReady catalogue">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Enter your needs and EVReady will compare matching catalogue vehicles. The AI ranks and
          explains options, but the result stays grounded in catalogue facts and includes safety
          warnings where data is uncertain.
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm font-medium text-slate-800">
              Vehicle type
              <select
                className={inputClass}
                value={formValues.vehicleType}
                onChange={(event) => updateFormValue('vehicleType', event.target.value)}
              >
                {vehicleTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === 'CAR' ? 'Car' : 'Bike'}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-800">
              City
              <select
                className={inputClass}
                value={formValues.city}
                onChange={(event) => updateFormValue('city', event.target.value)}
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <NumberField
              label="Budget in PKR"
              min={1}
              value={formValues.budgetPkr}
              onChange={(value) => updateFormValue('budgetPkr', value)}
            />

            <NumberField
              label="Daily distance in km"
              min={1}
              value={formValues.dailyDistanceKm}
              onChange={(value) => updateFormValue('dailyDistanceKm', value)}
            />

            <NumberField
              label="Monthly distance in km"
              min={1}
              value={formValues.monthlyDistanceKm}
              onChange={(value) => updateFormValue('monthlyDistanceKm', value)}
            />

            <NumberField
              label="Family size"
              min={1}
              value={formValues.familySize}
              onChange={(value) => updateFormValue('familySize', value)}
            />

            <fieldset className="rounded-md border border-slate-200 p-3">
              <legend className="px-1 text-sm font-medium text-slate-800">
                Can you charge at home?
              </legend>
              <RadioPair
                name="home-charging"
                value={formValues.homeChargingAvailable}
                onChange={(value) => updateFormValue('homeChargingAvailable', value)}
              />
            </fieldset>

            <fieldset className="rounded-md border border-slate-200 p-3">
              <legend className="px-1 text-sm font-medium text-slate-800">
                Do you have solar at home?
              </legend>
              <RadioPair
                name="solar-available"
                value={formValues.solarAvailable}
                onChange={(value) => updateFormValue('solarAvailable', value)}
              />
            </fieldset>

            <label className="text-sm font-medium text-slate-800 sm:col-span-2">
              Primary use case
              <input
                className={inputClass}
                type="text"
                maxLength={160}
                value={formValues.primaryUseCase}
                onChange={(event) => updateFormValue('primaryUseCase', event.target.value)}
              />
            </label>

            <label className="text-sm font-medium text-slate-800 sm:col-span-2">
              Priority
              <input
                className={inputClass}
                type="text"
                maxLength={120}
                value={formValues.priority}
                onChange={(event) => updateFormValue('priority', event.target.value)}
              />
            </label>

            <label className="text-sm font-medium text-slate-800 sm:col-span-2">
              Additional notes
              <textarea
                className={`${inputClass} min-h-24`}
                maxLength={1000}
                value={formValues.additionalNotes}
                onChange={(event) => updateFormValue('additionalNotes', event.target.value)}
              />
            </label>

            <div className="sm:col-span-2">
              <button className={buttonClass} type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Preparing recommendation...' : 'Find EV options'}
              </button>
            </div>
          </form>

          <div ref={resultSectionRef} className="scroll-mt-24">
            <RecommendationResultCard
              result={result}
              errorMessage={errorMessage}
              pollMessage={pollMessage}
              vehiclesById={vehiclesById}
            />
          </div>
        </div>

        <p className="max-w-3xl text-xs leading-5 text-slate-600">
          Recommendations are decision-support only. Verify vehicle price, specs, warranty, dealer
          availability, charging access, connector compatibility, route distance, and charger status
          before making a purchase or planning intercity travel.
        </p>
      </div>
    </PageShell>
  );
}

type NumberFieldProps = {
  label: string;
  min: number;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, min, value, onChange }: NumberFieldProps) {
  return (
    <label className="text-sm font-medium text-slate-800">
      {label}
      <input
        className={inputClass}
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

type RadioPairProps = {
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function RadioPair({ name, value, onChange }: RadioPairProps) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <input
          type="radio"
          name={name}
          checked={value}
          onChange={() => onChange(true)}
          className="h-4 w-4 accent-brand-700"
        />
        Yes
      </label>
      <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <input
          type="radio"
          name={name}
          checked={!value}
          onChange={() => onChange(false)}
          className="h-4 w-4 accent-brand-700"
        />
        No
      </label>
    </div>
  );
}

type RecommendationResultCardProps = {
  result: RecommendationResponse | null;
  errorMessage: string | null;
  pollMessage: string | null;
  vehiclesById: Map<string, Vehicle>;
};

function RecommendationResultCard({
  result,
  errorMessage,
  pollMessage,
  vehiclesById,
}: RecommendationResultCardProps) {
  if (errorMessage) {
    return (
      <section className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm leading-6 text-red-800">
        <p className="font-semibold">Recommendation could not be created.</p>
        <p className="mt-2">{errorMessage}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-lg border border-brand-100 bg-brand-50 p-5 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">Recommendation result</p>
        <p className="mt-2">
          Submit the form to create a recommendation run. Slow model responses are handled in the
          background.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-brand-100 bg-brand-50 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          EV recommendation result
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">{formatStatus(result.status)}</h2>
        {pollMessage ? <p className="mt-2 text-sm leading-6 text-slate-700">{pollMessage}</p> : null}
      </div>

      {result.summary ? (
        <p className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
          {result.summary}
        </p>
      ) : null}

      {result.failureReason ? (
        <div className="rounded-md bg-white/80 p-3 text-sm leading-6 text-red-700">
          {getFailureMessage(result)}
        </div>
      ) : null}

      {result.recommendations.length > 0 ? (
        <div className="space-y-3">
          {result.recommendations.map((recommendation) => (
            <article
              key={`${recommendation.rank}-${recommendation.vehicleId}`}
              className="rounded-md bg-white p-4 text-sm shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <RecommendationVehicleLink recommendation={recommendation} vehiclesById={vehiclesById} />
                  <p className="mt-2 leading-6 text-slate-700">{recommendation.matchReason}</p>
                </div>
              </div>

              {recommendation.tradeoffs.length > 0 ? (
                <div className="mt-3">
                  <p className="font-semibold text-slate-800">Tradeoffs</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 leading-6 text-slate-700">
                    {recommendation.tradeoffs.map((tradeoff) => (
                      <li key={tradeoff}>{tradeoff}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {recommendation.factsUsed.length > 0 ? (
                <div className="mt-3">
                  <p className="font-semibold text-slate-800">Facts used</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recommendation.factsUsed.map((fact) => (
                      <span
                        key={fact}
                        className="rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800"
                      >
                        {formatFactUsed(fact)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {result.missingInformation.length > 0 ? (
        <InfoList title="Missing information" items={result.missingInformation} />
      ) : null}

      {result.warnings.length > 0 ? <InfoList title="Warnings" items={result.warnings} /> : null}

      <p className="text-xs leading-5 text-slate-600">
        Validation status: {formatStatus(result.validationStatus)}
      </p>
    </section>
  );
}

type RecommendationVehicleLinkProps = {
  recommendation: RecommendationItem;
  vehiclesById: Map<string, Vehicle>;
};

function RecommendationVehicleLink({
  recommendation,
  vehiclesById,
}: RecommendationVehicleLinkProps) {
  const vehicle = vehiclesById.get(String(recommendation.vehicleId));
  const vehicleName = vehicle
    ? [vehicle.brand, vehicle.model].filter(Boolean).join(' ')
    : `Vehicle #${recommendation.vehicleId}`;

  return (
    <p className="font-semibold text-slate-950">
      Rank {recommendation.rank} ·{' '}
      <Link
          to={`/vehicles/${recommendation.vehicleId}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${vehicleName} detail page in a new tab`}
          className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-100 hover:text-brand-900"
        >
          <span>{vehicleName}</span>
          <span aria-hidden="true" className="text-xs">
            ↗
          </span>
        </Link>
    </p>
  );
}

type InfoListProps = {
  title: string;
  items: string[];
};

function InfoList({ title, items }: InfoListProps) {
  return (
    <div className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
      <p className="font-semibold text-slate-900">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof RecommenderApiError) {
    return error.response.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Recommendation service could not be reached right now.';
}

function getFailureMessage(result: RecommendationResponse) {
  if (result.status === 'TIMED_OUT') {
    return 'Recommendation generation took too long. Please try again in a few minutes.';
  }

  return result.failureReason || 'Recommendation could not be completed safely.';
}

function toRecommendationRequest(formValues: FormValues): RecommendationRequest {
  return {
    vehicleType: formValues.vehicleType,
    budgetPkr: formValues.budgetPkr,
    city: formValues.city,
    dailyDistanceKm: formValues.dailyDistanceKm,
    monthlyDistanceKm: formValues.monthlyDistanceKm,
    homeChargingAvailable: formValues.homeChargingAvailable,
    solarAvailable: formValues.solarAvailable,
    primaryUseCase: formValues.primaryUseCase,
    familySize: formValues.familySize,
    priority: formValues.priority,
    additionalNotes: formValues.additionalNotes,
  };
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function formatFactUsed(fact: string) {
  const labels: Record<string, string> = {
    pricePkr: 'Price',
    rangeKm: 'Range',
    batteryCapacityKwh: 'Battery capacity',
    dcFastCharging: 'DC fast charging support',
    verificationStatus: 'Source confidence',
    chargerType: 'Charger type',
    vehicleType: 'Vehicle type',
  };

  return labels[fact] ?? fact;
}