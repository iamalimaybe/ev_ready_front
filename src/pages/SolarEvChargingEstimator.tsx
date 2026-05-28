import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import {
  calculateSolarEvCharging,
  validateSolarEvChargingInput,
  type HomeChargingVehicleType,
} from '../utils/calculators';

type FormValues = {
  vehicleType: HomeChargingVehicleType;
  dailyKm: number;
  daysPerMonth: number;
  batteryCapacityKwh: number;
  rangePerFullChargeKm: number;
  gridElectricityUnitPrice: number;
  solarChargingSharePercentage: number;
  effectiveSolarUnitCost: number;
};

const initialFormValues: FormValues = {
  vehicleType: 'Bike',
  dailyKm: 40,
  daysPerMonth: 26,
  batteryCapacityKwh: 2,
  rangePerFullChargeKm: 80,
  gridElectricityUnitPrice: 65,
  solarChargingSharePercentage: 50,
  effectiveSolarUnitCost: 0,
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

export default function SolarEvChargingEstimator() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [copyMessage, setCopyMessage] = useState<string | undefined>();

  const validationMessages = useMemo(
    () =>
      validateSolarEvChargingInput({
        vehicleType: formValues.vehicleType,
        dailyKm: formValues.dailyKm,
        daysPerMonth: formValues.daysPerMonth,
        batteryCapacityKwh: formValues.batteryCapacityKwh,
        rangePerFullChargeKm: formValues.rangePerFullChargeKm,
        gridElectricityUnitPrice: formValues.gridElectricityUnitPrice,
        solarChargingSharePercentage: formValues.solarChargingSharePercentage,
        effectiveSolarUnitCost: formValues.effectiveSolarUnitCost,
      }),
    [formValues],
  );
  const hasValidationErrors = validationMessages.length > 0;

  const result = useMemo(() => {
    if (hasValidationErrors) {
      return undefined;
    }

    return calculateSolarEvCharging({
      vehicleType: formValues.vehicleType,
      dailyKm: formValues.dailyKm,
      daysPerMonth: formValues.daysPerMonth,
      batteryCapacityKwh: formValues.batteryCapacityKwh,
      rangePerFullChargeKm: formValues.rangePerFullChargeKm,
      gridElectricityUnitPrice: formValues.gridElectricityUnitPrice,
      solarChargingSharePercentage: formValues.solarChargingSharePercentage,
      effectiveSolarUnitCost: formValues.effectiveSolarUnitCost,
    });
  }, [formValues, hasValidationErrors]);

  const isExtraCost = result ? result.estimatedMonthlySavings < 0 : false;
  const monthlySavingsLabel = isExtraCost
    ? 'Estimated extra monthly cost'
    : 'Estimated monthly savings';
  const yearlySavingsLabel = isExtraCost
    ? 'Estimated extra yearly cost'
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
    <PageShell eyebrow="Calculator" title="Solar EV Charging Estimator">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Estimate how much EV bike or car charging may cost when some home charging comes from
          solar. Solar is not always free, so enter your own solar unit cost if needed.
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800">
              Are you checking a bike or car?
              <select
                className={selectInputClass}
                value={formValues.vehicleType}
                onChange={(event) =>
                  updateFormValue('vehicleType', event.target.value as HomeChargingVehicleType)
                }
              >
                <option value="Bike">Bike</option>
                <option value="Car">Car</option>
              </select>
            </label>

            <NumberField
              label="How many km do you travel daily?"
              min={0}
              value={formValues.dailyKm}
              onChange={(value) => updateFormValue('dailyKm', value)}
            />

            <NumberField
              label="How many days per month do you use it?"
              min={1}
              max={31}
              value={formValues.daysPerMonth}
              onChange={(value) => updateFormValue('daysPerMonth', value)}
            />

            <NumberField
              label="Battery size of the EV (kWh)"
              helperText="The total energy the EV battery can store."
              min={0.1}
              step={0.1}
              value={formValues.batteryCapacityKwh}
              onChange={(value) => updateFormValue('batteryCapacityKwh', value)}
            />

            <NumberField
              label="Range on one full charge (km)"
              helperText="Distance the EV can travel after a full charge."
              min={1}
              value={formValues.rangePerFullChargeKm}
              onChange={(value) => updateFormValue('rangePerFullChargeKm', value)}
            />

            <NumberField
              label="Grid electricity unit price (PKR per kWh/unit)"
              helperText="Use your normal home electricity unit price."
              min={0}
              value={formValues.gridElectricityUnitPrice}
              onChange={(value) => updateFormValue('gridElectricityUnitPrice', value)}
            />

            <NumberField
              label="Charging covered by solar (%)"
              helperText="Your rough guess for how much EV charging comes from solar."
              min={0}
              max={100}
              value={formValues.solarChargingSharePercentage}
              onChange={(value) => updateFormValue('solarChargingSharePercentage', value)}
            />

            <NumberField
              label="Solar unit cost (PKR per kWh/unit)"
              helperText="Use 0 if you want to treat solar charging as free for this estimate."
              min={0}
              value={formValues.effectiveSolarUnitCost}
              onChange={(value) => updateFormValue('effectiveSolarUnitCost', value)}
            />
          </form>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            {hasValidationErrors || !result ? (
              <ValidationCard messages={validationMessages} />
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    Solar charging estimate
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {formatCurrency(Math.abs(result.estimatedMonthlySavings))}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{monthlySavingsLabel}</p>
                </div>

                <div className="grid gap-3 text-sm">
                  <ResultRow label="Vehicle type" value={result.vehicleType} />
                  <ResultRow label="Monthly distance" value={`${formatNumber(result.monthlyKm)} km`} />
                  <ResultRow
                    label="Estimated EV charging units per month"
                    value={`${formatNumber(result.monthlyEnergyNeedKwh)} kWh`}
                  />
                  <ResultRow
                    label="Units covered by solar"
                    value={`${formatNumber(result.solarCoveredKwh)} kWh`}
                  />
                  <ResultRow
                    label="Units still taken from grid"
                    value={`${formatNumber(result.gridRequiredKwh)} kWh`}
                  />
                  <ResultRow
                    label="Full grid charging cost"
                    value={formatCurrency(result.fullGridCost)}
                  />
                  <ResultRow
                    label="Solar + grid charging cost"
                    value={formatCurrency(result.estimatedBlendedCost)}
                  />
                  <ResultRow
                    label={monthlySavingsLabel}
                    value={formatCurrency(Math.abs(result.estimatedMonthlySavings))}
                  />
                  <ResultRow
                    label={yearlySavingsLabel}
                    value={formatCurrency(Math.abs(result.estimatedYearlySavings))}
                  />
                </div>

                <p className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
                  With these inputs, solar covers part of your monthly EV charging units and the
                  remaining units are priced at the grid electricity rate.
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
                  This is a quick estimate, not a guarantee. Real solar charging cost can vary with
                  solar system size, daytime charging, household load, net metering, battery backup,
                  weather, tariff slabs, and actual EV efficiency.
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
    'Battery capacity kWh must be greater than 0.':
      'Battery size must be greater than 0 kWh.',
    'Range per full charge km must be greater than 0.':
      'Range on one full charge must be greater than 0 km.',
    'Grid electricity unit price must not be negative.':
      'Grid electricity unit price cannot be negative. Enter 0 or more.',
    'Solar charging share percentage must be between 0 and 100.':
      'Solar charging share should be from 0% to 100%.',
    'Effective solar unit cost must not be negative.':
      'Solar unit cost cannot be negative. Enter 0 or more.',
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
  vehicleType: HomeChargingVehicleType;
  monthlyKm: number;
  monthlyEnergyNeedKwh: number;
  solarCoveredKwh: number;
  gridRequiredKwh: number;
  fullGridCost: number;
  estimatedBlendedCost: number;
  estimatedMonthlySavings: number;
  estimatedYearlySavings: number;
};

function createResultSummary(formValues: FormValues, result: CopyableResult): string {
  const monthlySavingsLine =
    result.estimatedMonthlySavings >= 0
      ? `Estimated monthly savings: ${formatSummaryCurrency(result.estimatedMonthlySavings)}`
      : `Estimated extra monthly cost: ${formatSummaryCurrency(Math.abs(result.estimatedMonthlySavings))}`;
  const yearlySavingsLine =
    result.estimatedYearlySavings >= 0
      ? `Estimated yearly savings: ${formatSummaryCurrency(result.estimatedYearlySavings)}`
      : `Estimated extra yearly cost: ${formatSummaryCurrency(Math.abs(result.estimatedYearlySavings))}`;

  return [
    'EVReady Pakistan - Solar EV Charging Estimate',
    '',
    `Vehicle type: ${result.vehicleType}`,
    `Daily travel: ${formatSummaryNumber(formValues.dailyKm)} km`,
    `Days per month: ${formatSummaryNumber(formValues.daysPerMonth)}`,
    `Monthly distance: ${formatSummaryNumber(result.monthlyKm)} km`,
    `Battery size used: ${formatSummaryNumber(formValues.batteryCapacityKwh)} kWh`,
    `Range used: ${formatSummaryNumber(formValues.rangePerFullChargeKm)} km per full charge`,
    `Grid electricity unit price used: ${formatSummaryCurrency(formValues.gridElectricityUnitPrice)} per kWh/unit`,
    `Solar charging share used: ${formatSummaryNumber(formValues.solarChargingSharePercentage)}%`,
    `Solar unit cost used: ${formatSummaryCurrency(formValues.effectiveSolarUnitCost)} per kWh/unit`,
    `Estimated monthly EV charging units: ${formatSummaryNumber(result.monthlyEnergyNeedKwh)} kWh`,
    `Units covered by solar: ${formatSummaryNumber(result.solarCoveredKwh)} kWh`,
    `Units still taken from grid: ${formatSummaryNumber(result.gridRequiredKwh)} kWh`,
    `Estimated full-grid charging cost: ${formatSummaryCurrency(result.fullGridCost)}`,
    `Estimated solar + grid charging cost: ${formatSummaryCurrency(result.estimatedBlendedCost)}`,
    monthlySavingsLine,
    yearlySavingsLine,
    '',
    'This is a quick estimate, not a guarantee. Actual solar charging cost can vary with solar system size, daytime charging, household load, net metering, battery backup, weather, tariff slabs, and actual EV efficiency.',
  ].join('\n');
}

function formatSummaryCurrency(value: number): string {
  return Number.isFinite(value) ? `Rs ${numberFormatter.format(Math.round(value))}` : '-';
}

function formatSummaryNumber(value: number): string {
  return Number.isFinite(value) ? numberFormatter.format(Math.round(value)) : '-';
}
