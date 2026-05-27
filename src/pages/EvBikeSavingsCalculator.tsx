import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import {
  calculateEvBikeSavings,
  getEvBikeSavingsVerdictExplanation,
  validateEvBikeSavingsInput,
  type EvBikeSavingsVerdict,
} from '../utils/calculators';

type FormValues = {
  dailyKm: number;
  daysPerMonth: number;
  petrolPricePerLitre: number;
  petrolBikeAverageKmPerLitre: number;
  batteryCapacityKwh: number;
  rangePerFullChargeKm: number;
  electricityUnitPrice: number;
  evBikePurchasePricePkr: number;
  currentPetrolBikeResaleValuePkr: number;
};

const initialFormValues: FormValues = {
  dailyKm: 40,
  daysPerMonth: 26,
  petrolPricePerLitre: 280,
  petrolBikeAverageKmPerLitre: 45,
  batteryCapacityKwh: 2,
  rangePerFullChargeKm: 80,
  electricityUnitPrice: 65,
  evBikePurchasePricePkr: 250000,
  currentPetrolBikeResaleValuePkr: 120000,
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

const verdictLabels: Record<EvBikeSavingsVerdict, string> = {
  STRONG_SAVINGS: 'Strong savings',
  MODEST_SAVINGS: 'Modest savings',
  LOW_OR_NO_SAVINGS: 'Low or no savings',
  INVALID_INPUT: 'Invalid input',
};

export default function EvBikeSavingsCalculator() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [copyMessage, setCopyMessage] = useState<string | undefined>();

  const validationMessages = useMemo(
    () =>
      validateEvBikeSavingsInput({
        dailyKm: formValues.dailyKm,
        daysPerMonth: formValues.daysPerMonth,
        petrolPricePerLitre: formValues.petrolPricePerLitre,
        petrolBikeAverageKmPerLitre: formValues.petrolBikeAverageKmPerLitre,
        batteryCapacityKwh: formValues.batteryCapacityKwh,
        rangePerFullChargeKm: formValues.rangePerFullChargeKm,
        electricityUnitPrice: formValues.electricityUnitPrice,
        evBikePurchasePricePkr: formValues.evBikePurchasePricePkr,
        currentPetrolBikeResaleValuePkr: formValues.currentPetrolBikeResaleValuePkr,
      }),
    [formValues],
  );
  const hasValidationErrors = validationMessages.length > 0;

  const result = useMemo(() => {
    if (hasValidationErrors) {
      return undefined;
    }

    return calculateEvBikeSavings({
      dailyKm: formValues.dailyKm,
      daysPerMonth: formValues.daysPerMonth,
      petrolPricePerLitre: formValues.petrolPricePerLitre,
      petrolBikeAverageKmPerLitre: formValues.petrolBikeAverageKmPerLitre,
      batteryCapacityKwh: formValues.batteryCapacityKwh,
      rangePerFullChargeKm: formValues.rangePerFullChargeKm,
      electricityUnitPrice: formValues.electricityUnitPrice,
      evBikePurchasePricePkr: formValues.evBikePurchasePricePkr,
      currentPetrolBikeResaleValuePkr: formValues.currentPetrolBikeResaleValuePkr,
    });
  }, [formValues, hasValidationErrors]);

  const isExtraCost = result ? result.monthlySavings < 0 : false;
  const monthlySavingsLabel = isExtraCost
    ? 'Estimated extra monthly cost'
    : 'Estimated monthly savings';
  const yearlySavingsLabel = isExtraCost
    ? 'Estimated yearly extra cost'
    : 'Estimated yearly savings';

  function updateFormValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setCopyMessage(undefined);
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  async function copyResultSummary() {
    if (!result || hasValidationErrors || !navigator.clipboard) {
      setCopyMessage('Could not copy automatically. Please copy the result manually.');
      return;
    }

    try {
      await navigator.clipboard.writeText(createResultSummary(formValues, result));
      setCopyMessage('Result summary copied.');
    } catch {
      setCopyMessage('Could not copy automatically. Please copy the result manually.');
    }
  }

  return (
    <PageShell eyebrow="Calculator" title="EV Bike Savings Calculator">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Bike-focused estimate for switching from a petrol bike to an EV bike, using Pakistan
          petrol and home electricity prices.
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <form className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label="How many km do you ride daily?"
              min={0}
              value={formValues.dailyKm}
              onChange={(value) => updateFormValue('dailyKm', value)}
            />

            <NumberField
              label="How many days per month do you use this bike?"
              min={1}
              max={31}
              value={formValues.daysPerMonth}
              onChange={(value) => updateFormValue('daysPerMonth', value)}
            />

            <NumberField
              label="Petrol price per litre"
              helperText="Use the petrol price you normally pay in PKR."
              min={0}
              value={formValues.petrolPricePerLitre}
              onChange={(value) => updateFormValue('petrolPricePerLitre', value)}
            />

            <NumberField
              label="Petrol average of your current bike (km per litre)"
              helperText="How far your petrol bike usually goes on one litre."
              min={1}
              value={formValues.petrolBikeAverageKmPerLitre}
              onChange={(value) => updateFormValue('petrolBikeAverageKmPerLitre', value)}
            />

            <NumberField
              label="Battery size of the EV bike (kWh)"
              helperText="The total energy the bike battery can store."
              min={0.1}
              step={0.1}
              value={formValues.batteryCapacityKwh}
              onChange={(value) => updateFormValue('batteryCapacityKwh', value)}
            />

            <NumberField
              label="Range on one full charge (km)"
              helperText="Distance the EV bike can travel after a full charge."
              min={1}
              value={formValues.rangePerFullChargeKm}
              onChange={(value) => updateFormValue('rangePerFullChargeKm', value)}
            />

            <NumberField
              label="Electricity unit price (PKR per kWh/unit)"
              helperText="Use your home electricity unit price, including taxes if you know it."
              min={0}
              value={formValues.electricityUnitPrice}
              onChange={(value) => updateFormValue('electricityUnitPrice', value)}
            />

            <NumberField
              label="EV bike purchase price (PKR)"
              min={0}
              value={formValues.evBikePurchasePricePkr}
              onChange={(value) => updateFormValue('evBikePurchasePricePkr', value)}
            />

            <NumberField
              label="Resale value of your current petrol bike (PKR)"
              min={0}
              value={formValues.currentPetrolBikeResaleValuePkr}
              onChange={(value) => updateFormValue('currentPetrolBikeResaleValuePkr', value)}
            />
          </form>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            {hasValidationErrors || !result ? (
              <ValidationCard messages={validationMessages} />
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    Savings estimate
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {formatCurrency(Math.abs(result.monthlySavings))}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{monthlySavingsLabel}</p>
                </div>

                <div className="grid gap-3 text-sm">
                  <ResultRow label="Monthly distance" value={`${formatNumber(result.monthlyKm)} km`} />
                  <ResultRow
                    label="Monthly petrol cost"
                    value={formatCurrency(result.monthlyPetrolCost)}
                  />
                  <ResultRow
                    label="Monthly EV charging cost"
                    value={formatCurrency(result.monthlyEvCost)}
                  />
                  <ResultRow
                    label={monthlySavingsLabel}
                    value={formatCurrency(Math.abs(result.monthlySavings))}
                  />
                  <ResultRow
                    label={yearlySavingsLabel}
                    value={formatCurrency(Math.abs(result.yearlySavings))}
                  />
                  <ResultRow
                    label="EV energy usage per month"
                    value={`${formatNumber(result.monthlyKwh)} kWh`}
                  />
                  <ResultRow
                    label="Estimated cost per full charge"
                    value={formatCurrency(result.costPerFullCharge)}
                  />
                  <ResultRow
                    label="Estimated full charges per month"
                    value={formatNumber(result.fullChargesPerMonth)}
                  />
                  <ResultRow
                    label="Net upgrade cost"
                    value={formatCurrency(result.netUpgradeCost)}
                  />
                  <ResultRow
                    label="Payback period"
                    value={
                      result.paybackMonths
                        ? `${formatNumber(result.paybackMonths)} months`
                        : 'Cannot be estimated from these inputs'
                    }
                  />
                  <ResultRow label="Verdict" value={verdictLabels[result.verdict]} />
                </div>

                <p className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
                  {getEvBikeSavingsVerdictExplanation(result.verdict)}
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
                  This is a quick estimate, not a guarantee. Real cost can vary based on traffic,
                  load, riding style, battery health, charging losses, electricity tariff, petrol
                  price, maintenance, and battery replacement cost.
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
  step?: number;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, helperText, min, max, step, value, onChange }: NumberFieldProps) {
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
        step={step}
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
    'Petrol price per litre must not be negative.':
      'Petrol price per litre cannot be negative. Enter 0 or more.',
    'Petrol bike average km per litre must be greater than 0.':
      'Petrol average must be greater than 0 km per litre.',
    'EV bike battery capacity kWh must be greater than 0.':
      'EV bike battery size must be greater than 0 kWh.',
    'EV bike range per full charge km must be greater than 0.':
      'EV bike range on one full charge must be greater than 0 km.',
    'Electricity unit price must not be negative.':
      'Electricity unit price cannot be negative. Enter 0 or more.',
    'EV bike purchase price PKR must not be negative.':
      'EV bike purchase price cannot be negative. Enter 0 or more.',
    'Current petrol bike resale value PKR must not be negative.':
      'Current petrol bike resale value cannot be negative. Enter 0 or more.',
  };

  return readableMessages[message] ?? message;
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

function formatNumber(value: number): string {
  return Number.isFinite(value) ? numberFormatter.format(value) : '-';
}

type CopyableResult = {
  monthlyKm: number;
  monthlyPetrolCost: number;
  monthlyEvCost: number;
  monthlySavings: number;
  yearlySavings: number;
  paybackMonths?: number;
};

function createResultSummary(formValues: FormValues, result: CopyableResult): string {
  const monthlySavingsLine =
    result.monthlySavings >= 0
      ? `Estimated monthly savings: ${formatSummaryCurrency(result.monthlySavings)}`
      : `Estimated extra monthly cost: ${formatSummaryCurrency(Math.abs(result.monthlySavings))}`;
  const yearlySavingsLine =
    result.yearlySavings >= 0
      ? `Estimated yearly savings: ${formatSummaryCurrency(result.yearlySavings)}`
      : `Estimated yearly extra cost: ${formatSummaryCurrency(Math.abs(result.yearlySavings))}`;
  const paybackLine = result.paybackMonths
    ? `Estimated payback: ${formatSummaryNumber(result.paybackMonths)} months`
    : 'Estimated payback: Cannot be estimated from these inputs';

  return [
    'EVReady Pakistan - EV Bike Savings Estimate',
    '',
    `Daily travel: ${formatSummaryNumber(formValues.dailyKm)} km`,
    `Monthly distance: ${formatSummaryNumber(result.monthlyKm)} km`,
    `Monthly petrol cost: ${formatSummaryCurrency(result.monthlyPetrolCost)}`,
    `Monthly EV bike charging cost: ${formatSummaryCurrency(result.monthlyEvCost)}`,
    monthlySavingsLine,
    yearlySavingsLine,
    paybackLine,
    '',
    'This is a quick estimate, not a guarantee. Actual cost can vary with riding style, battery health, charging losses, electricity tariff, petrol price, maintenance, and battery replacement cost.',
  ].join('\n');
}

function formatSummaryCurrency(value: number): string {
  return Number.isFinite(value) ? `Rs ${numberFormatter.format(Math.round(value))}` : '-';
}

function formatSummaryNumber(value: number): string {
  return Number.isFinite(value) ? numberFormatter.format(Math.round(value)) : '-';
}
