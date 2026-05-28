import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { normalizeVehicle, type BackendVehicle, type Vehicle } from '../data/vehicles';
import { ApiError, apiClient } from '../utils/api';
import {
  calculateMonthlyEvCost,
  calculateMonthlyPetrolCost,
  calculateMonthlySavings,
  calculateSuitabilityScore,
  getSuitabilityVerdictExplanation,
  validateCostComparisonInputs,
  type SuitabilityVerdict,
} from '../utils/calculators';

type IntercityFrequency = 'none' | 'occasional' | 'frequent';

type FormValues = {
  city: string;
  vehicleId: string;
  dailyKm: number;
  daysPerMonth: number;
  electricityUnitPrice: number;
  petrolPricePerLitre: number;
  petrolAverageKmPerLitre: number;
  hasHomeCharging: boolean;
  hasSolar: boolean;
  intercityFrequency: IntercityFrequency;
};

const cityOptions = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Peshawar'];
const citySupportDemoOptions = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan'];

const initialFormValues: FormValues = {
  city: 'Lahore',
  vehicleId: '',
  dailyKm: 40,
  daysPerMonth: 26,
  electricityUnitPrice: 65,
  petrolPricePerLitre: 280,
  petrolAverageKmPerLitre: 12,
  hasHomeCharging: true,
  hasSolar: false,
  intercityFrequency: 'occasional',
};

const currencyFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
  style: 'currency',
  currency: 'PKR',
});

const numberFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 1,
});

const numberInputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const selectInputClass = numberInputClass;

const verdictLabels: Record<SuitabilityVerdict, string> = {
  STRONG_FIT: 'Strong fit',
  GOOD_WITH_CONDITIONS: 'Good with conditions',
  RISKY: 'Risky',
  NOT_RECOMMENDED: 'Not recommended',
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.response.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Vehicle data could not be loaded right now.';
}

export default function SuitabilityCalculator() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehicleLoading, setIsVehicleLoading] = useState(true);
  const [vehicleErrorMessage, setVehicleErrorMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | undefined>();

  useEffect(() => {
    let isCurrentRequest = true;

    setIsVehicleLoading(true);
    setVehicleErrorMessage(null);

    apiClient
      .get<BackendVehicle[]>('/api/v1/vehicles?type=Car&sort=default')
      .then((vehicleResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(vehicleResponse)) {
          throw new Error('Vehicle data response was not a list.');
        }

        const normalizedVehicles = vehicleResponse.map(normalizeVehicle);

        setVehicles(normalizedVehicles);
        setFormValues((currentValues) => ({
          ...currentValues,
          vehicleId: normalizedVehicles.some((vehicle) => vehicle.id === currentValues.vehicleId)
            ? currentValues.vehicleId
            : normalizedVehicles[0]?.id ?? '',
        }));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setVehicles([]);
        setFormValues((currentValues) => ({
          ...currentValues,
          vehicleId: '',
        }));
        setVehicleErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsVehicleLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === formValues.vehicleId),
    [formValues.vehicleId, vehicles],
  );

  const validationMessages = useMemo(
    () => {
      if (!selectedVehicle) {
        return [];
      }

      return validateCostComparisonInputs({
        dailyKm: formValues.dailyKm,
        daysPerMonth: formValues.daysPerMonth,
        efficiencyKwhPerKm: selectedVehicle.efficiencyKwhPerKm,
        electricityUnitPrice: formValues.electricityUnitPrice,
        petrolPricePerLitre: formValues.petrolPricePerLitre,
        petrolAverageKmPerLitre: formValues.petrolAverageKmPerLitre,
      });
    },
    [formValues, selectedVehicle],
  );
  const hasValidationErrors = validationMessages.length > 0;

  const result = useMemo(() => {
    if (hasValidationErrors || !selectedVehicle) {
      return undefined;
    }

    const evCost = calculateMonthlyEvCost({
      dailyKm: formValues.dailyKm,
      daysPerMonth: formValues.daysPerMonth,
      efficiencyKwhPerKm: selectedVehicle.efficiencyKwhPerKm,
      electricityUnitPrice: formValues.electricityUnitPrice,
    });

    const petrolCost = calculateMonthlyPetrolCost({
      dailyKm: formValues.dailyKm,
      daysPerMonth: formValues.daysPerMonth,
      petrolPricePerLitre: formValues.petrolPricePerLitre,
      petrolAverageKmPerLitre: formValues.petrolAverageKmPerLitre,
    });

    const monthlySavings = calculateMonthlySavings(
      evCost.monthlyEvCost,
      petrolCost.monthlyPetrolCost,
    );

    const suitability = calculateSuitabilityScore({
      dailyKm: formValues.dailyKm,
      practicalRangeKm: selectedVehicle.practicalCityRangeKm,
      hasHomeCharging: formValues.hasHomeCharging,
      hasSolarAvailable: formValues.hasSolar,
      monthlySavings,
      hasCitySupport: citySupportDemoOptions.includes(formValues.city),
      needsFrequentIntercityTravel: formValues.intercityFrequency === 'frequent',
    });

    return {
      evCost,
      petrolCost,
      monthlySavings,
      suitability,
    };
  }, [formValues, selectedVehicle, hasValidationErrors]);

  const savingsLabel =
    result && result.monthlySavings < 0
      ? 'Estimated extra monthly cost'
      : 'Estimated monthly savings';

  function updateFormValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setCopyMessage(undefined);
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  async function copyResultSummary() {
    if (!result || hasValidationErrors || !selectedVehicle || !navigator.clipboard) {
      setCopyMessage('Could not copy automatically. Please copy the result manually.');
      return;
    }

    try {
      await navigator.clipboard.writeText(createResultSummary(formValues, selectedVehicle, result));
      setCopyMessage('Result summary copied.');
    } catch {
      setCopyMessage('Could not copy automatically. Please copy the result manually.');
    }
  }

  return (
    <PageShell eyebrow="Calculator" title="Suitability Calculator">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          General EV car fit check using daily travel, monthly running cost, home charging, solar,
          and intercity travel. Vehicle specs and prices should be verified before purchase.
        </p>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          For petrol bike to EV bike savings, use the{' '}
          <Link to="/ev-bike-savings" className="font-semibold text-brand-700 hover:text-brand-800">
            EV Bike Savings Calculator
          </Link>
          .
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800">
              City
              <select
                className={selectInputClass}
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

            <label className="text-sm font-medium text-slate-800">
              EV car to check
              <select
                className={selectInputClass}
                value={formValues.vehicleId}
                onChange={(event) => updateFormValue('vehicleId', event.target.value)}
                disabled={isVehicleLoading || Boolean(vehicleErrorMessage) || vehicles.length === 0}
              >
                {vehicles.length === 0 ? (
                  <option value="">
                    {isVehicleLoading ? 'Loading EV cars...' : 'No EV cars available'}
                  </option>
                ) : null}
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            </label>

            <NumberField
              label="How many km do you drive daily?"
              min={0}
              value={formValues.dailyKm}
              onChange={(value) => updateFormValue('dailyKm', value)}
            />

            <NumberField
              label="How many days per month do you use this car?"
              min={1}
              max={31}
              value={formValues.daysPerMonth}
              onChange={(value) => updateFormValue('daysPerMonth', value)}
            />

            <NumberField
              label="Electricity unit price (PKR per kWh/unit)"
              helperText="Use your home electricity unit price, including taxes if you know it."
              min={0}
              value={formValues.electricityUnitPrice}
              onChange={(value) => updateFormValue('electricityUnitPrice', value)}
            />

            <NumberField
              label="Petrol price per litre"
              helperText="Use the petrol price you normally pay in PKR."
              min={0}
              value={formValues.petrolPricePerLitre}
              onChange={(value) => updateFormValue('petrolPricePerLitre', value)}
            />

            <NumberField
              label="Petrol average of your current car (km per litre)"
              helperText="How far your petrol car usually goes on one litre."
              min={1}
              value={formValues.petrolAverageKmPerLitre}
              onChange={(value) => updateFormValue('petrolAverageKmPerLitre', value)}
            />

            <label className="text-sm font-medium text-slate-800">
              How often do you take intercity trips?
              <select
                className={selectInputClass}
                value={formValues.intercityFrequency}
                onChange={(event) =>
                  updateFormValue('intercityFrequency', event.target.value as IntercityFrequency)
                }
              >
                <option value="none">Almost never</option>
                <option value="occasional">Sometimes</option>
                <option value="frequent">Often</option>
              </select>
            </label>

            <fieldset className="rounded-md border border-slate-200 p-3">
              <legend className="px-1 text-sm font-medium text-slate-800">
                Can you charge at home?
              </legend>
              <RadioPair
                name="home-charging"
                value={formValues.hasHomeCharging}
                onChange={(value) => updateFormValue('hasHomeCharging', value)}
              />
            </fieldset>

            <fieldset className="rounded-md border border-slate-200 p-3">
              <legend className="px-1 text-sm font-medium text-slate-800">
                Do you have solar at home?
              </legend>
              <RadioPair
                name="solar-available"
                value={formValues.hasSolar}
                onChange={(value) => updateFormValue('hasSolar', value)}
              />
            </fieldset>
          </form>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            {isVehicleLoading ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                Loading EV cars for suitability checking...
              </div>
            ) : vehicleErrorMessage ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-red-700">
                Vehicle list could not be loaded: {vehicleErrorMessage}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                No EV cars are available for suitability checking right now.
              </div>
            ) : !selectedVehicle ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                Select an EV car to see the suitability estimate.
              </div>
            ) : hasValidationErrors || !result ? (
              <ValidationCard messages={validationMessages} />
            ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                  Estimate
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {result.suitability.score}/100
                </h2>
                <p className="mt-1 text-sm font-semibold text-brand-800">
                  {verdictLabels[result.suitability.verdict]}
                </p>
              </div>

              <div className="grid gap-3 text-sm">
                <ResultRow
                  label="Selected EV"
                  value={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                />
                <ResultRow
                  label="Monthly EV cost"
                  value={formatCurrency(result.evCost.monthlyEvCost)}
                />
                <ResultRow
                  label="Monthly petrol cost"
                  value={formatCurrency(result.petrolCost.monthlyPetrolCost)}
                />
                <ResultRow
                  label={savingsLabel}
                  value={formatCurrency(Math.abs(result.monthlySavings))}
                />
                <ResultRow label="Suitability score" value={`${result.suitability.score}/100`} />
                <ResultRow
                  label="Verdict"
                  value={verdictLabels[result.suitability.verdict]}
                />
              </div>

              <p className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
                {getSuitabilityVerdictExplanation(
                  result.suitability.verdict,
                  formValues.hasSolar,
                )}
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={copyResultSummary}
                  className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
                >
                  Copy result summary
                </button>
                {copyMessage ? (
                  <p className="text-sm leading-6 text-slate-700">{copyMessage}</p>
                ) : null}
              </div>

              <p className="text-xs leading-5 text-slate-600">
                This is a quick estimate, not a guarantee. Monthly EV cost uses the electricity
                unit price you entered and can vary with traffic, charging access, tariff slabs,
                battery health, and road conditions.
              </p>
            </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

type NumberFieldProps = {
  label: string;
  helperText?: string;
  min: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, helperText, min, max, value, onChange }: NumberFieldProps) {
  return (
    <label className="text-sm font-medium text-slate-800">
      {label}
      {helperText ? (
        <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
          {helperText}
        </span>
      ) : null}
      <input
        className={numberInputClass}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

type ValidationCardProps = {
  messages: string[];
};

function ValidationCard({ messages }: ValidationCardProps) {
  const visibleMessages =
    messages.length > 0 ? messages : ['Please check the numbers above to see the estimate.'];

  return (
    <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
      <p className="font-semibold text-slate-900">Please fix these numbers first:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {visibleMessages.map((message) => (
          <li key={message}>{getReadableValidationMessage(message)}</li>
        ))}
      </ul>
    </div>
  );
}

function getReadableValidationMessage(message: string): string {
  const readableMessages: Record<string, string> = {
    'Daily km must not be negative.': 'Daily km cannot be negative. Enter 0 or a positive number.',
    'Days per month must be between 1 and 31.': 'Days per month should be from 1 to 31.',
    'Electricity unit price must not be negative.':
      'Electricity unit price cannot be negative. Enter 0 or more.',
    'Petrol price per litre must not be negative.':
      'Petrol price per litre cannot be negative. Enter 0 or more.',
    'Petrol vehicle average km per litre must be greater than 0.':
      'Petrol average must be greater than 0 km per litre.',
  };

  return readableMessages[message] ?? message;
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

type ResultRowProps = {
  label: string;
  value: string;
};

function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-brand-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-slate-600">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function formatCurrency(value: number): string {
  return Number.isFinite(value) ? currencyFormatter.format(value) : '-';
}

type CopyableResult = {
  evCost: {
    monthlyEvCost: number;
  };
  petrolCost: {
    monthlyPetrolCost: number;
  };
  monthlySavings: number;
  suitability: {
    score: number;
    verdict: SuitabilityVerdict;
  };
};

function createResultSummary(
  formValues: FormValues,
  selectedVehicle: Vehicle,
  result: CopyableResult,
): string {
  const savingsLine =
    result.monthlySavings >= 0
      ? `Estimated monthly savings: ${formatSummaryCurrency(result.monthlySavings)}`
      : `Estimated extra monthly cost: ${formatSummaryCurrency(Math.abs(result.monthlySavings))}`;

  return [
    'EVReady Pakistan - EV Suitability Estimate',
    '',
    `City: ${formValues.city}`,
    `Selected EV: ${selectedVehicle.brand} ${selectedVehicle.model}`,
    `Daily travel: ${formatSummaryNumber(formValues.dailyKm)} km`,
    `Days per month: ${formatSummaryNumber(formValues.daysPerMonth)}`,
    `Home charging: ${formValues.hasHomeCharging ? 'Yes' : 'No'}`,
    `Solar at home: ${formValues.hasSolar ? 'Yes' : 'No'}`,
    `Intercity trips: ${formatIntercityFrequency(formValues.intercityFrequency)}`,
    `Electricity unit price used: ${formatSummaryCurrency(formValues.electricityUnitPrice)} per kWh/unit`,
    `Petrol price used: ${formatSummaryCurrency(formValues.petrolPricePerLitre)} per litre`,
    `Petrol average used: ${formatSummaryNumber(formValues.petrolAverageKmPerLitre)} km/litre`,
    `Estimated monthly EV cost: ${formatSummaryCurrency(result.evCost.monthlyEvCost)}`,
    `Estimated monthly petrol cost: ${formatSummaryCurrency(result.petrolCost.monthlyPetrolCost)}`,
    savingsLine,
    `Suitability score: ${result.suitability.score}/100`,
    `Verdict: ${verdictLabels[result.suitability.verdict]}`,
    '',
    'This is a quick estimate, not a guarantee. Monthly EV cost uses the electricity unit price entered and can vary with traffic, charging access, tariff slabs, battery health, and road conditions. Verify vehicle specs and prices before purchase.',
  ].join('\n');
}

function formatSummaryCurrency(value: number): string {
  return Number.isFinite(value) ? `Rs ${numberFormatter.format(Math.round(value))}` : '-';
}

function formatSummaryNumber(value: number): string {
  return Number.isFinite(value) ? numberFormatter.format(Math.round(value)) : '-';
}

function formatIntercityFrequency(value: IntercityFrequency): string {
  if (value === 'none') {
    return 'Almost never';
  }

  if (value === 'frequent') {
    return 'Often';
  }

  return 'Sometimes';
}
