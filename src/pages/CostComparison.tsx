import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import {
  calculateManualCostComparison,
  validateManualCostComparisonInput,
  type HomeChargingVehicleType,
} from '../utils/calculators';

type FormValues = {
  vehicleType: HomeChargingVehicleType;
  dailyKm: number;
  daysPerMonth: number;
  petrolPricePerLitre: number;
  petrolAverageKmPerLitre: number;
  batteryCapacityKwh: number;
  rangePerFullChargeKm: number;
  electricityUnitPrice: number;
};

const vehicleDefaults: Record<HomeChargingVehicleType, FormValues> = {
  Bike: {
    vehicleType: 'Bike',
    dailyKm: 40,
    daysPerMonth: 26,
    petrolPricePerLitre: 280,
    petrolAverageKmPerLitre: 45,
    batteryCapacityKwh: 2,
    rangePerFullChargeKm: 80,
    electricityUnitPrice: 65,
  },
  Car: {
    vehicleType: 'Car',
    dailyKm: 40,
    daysPerMonth: 26,
    petrolPricePerLitre: 280,
    petrolAverageKmPerLitre: 12,
    batteryCapacityKwh: 50,
    rangePerFullChargeKm: 350,
    electricityUnitPrice: 65,
  },
};

const initialFormValues: FormValues = {
  vehicleType: 'Bike',
  dailyKm: 40,
  daysPerMonth: 26,
  petrolPricePerLitre: 280,
  petrolAverageKmPerLitre: 45,
  batteryCapacityKwh: 2,
  rangePerFullChargeKm: 80,
  electricityUnitPrice: 65,
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

export default function CostComparison() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

  const validationMessages = useMemo(
    () =>
      validateManualCostComparisonInput({
        vehicleType: formValues.vehicleType,
        dailyKm: formValues.dailyKm,
        daysPerMonth: formValues.daysPerMonth,
        petrolPricePerLitre: formValues.petrolPricePerLitre,
        petrolAverageKmPerLitre: formValues.petrolAverageKmPerLitre,
        batteryCapacityKwh: formValues.batteryCapacityKwh,
        rangePerFullChargeKm: formValues.rangePerFullChargeKm,
        electricityUnitPrice: formValues.electricityUnitPrice,
      }),
    [formValues],
  );
  const hasValidationErrors = validationMessages.length > 0;

  const result = useMemo(() => {
    if (hasValidationErrors) {
      return undefined;
    }

    return calculateManualCostComparison({
      vehicleType: formValues.vehicleType,
      dailyKm: formValues.dailyKm,
      daysPerMonth: formValues.daysPerMonth,
      petrolPricePerLitre: formValues.petrolPricePerLitre,
      petrolAverageKmPerLitre: formValues.petrolAverageKmPerLitre,
      batteryCapacityKwh: formValues.batteryCapacityKwh,
      rangePerFullChargeKm: formValues.rangePerFullChargeKm,
      electricityUnitPrice: formValues.electricityUnitPrice,
    });
  }, [formValues, hasValidationErrors]);

  const isExtraCost = result ? result.monthlySavings < 0 : false;
  const monthlySavingsLabel = isExtraCost
    ? 'Estimated extra monthly cost'
    : 'Estimated monthly savings';
  const yearlySavingsLabel = isExtraCost
    ? 'Estimated extra yearly cost'
    : 'Estimated yearly savings';

  function updateFormValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function updateVehicleType(vehicleType: HomeChargingVehicleType) {
    setFormValues(vehicleDefaults[vehicleType]);
  }

  return (
    <PageShell eyebrow="Calculator" title="EV vs Petrol Quick Cost Comparison">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Quickly compare estimated EV charging cost with petrol cost for a bike or car in
          Pakistan, using your own daily travel and price assumptions.
        </p>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          This quick estimate does not include purchase price, resale value, or payback period. For
          detailed petrol bike to EV bike payback, use the{' '}
          <Link to="/ev-bike-savings" className="font-semibold text-brand-700 hover:text-brand-800">
            EV Bike Savings Calculator
          </Link>
          .
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800 sm:col-span-2">
              Are you checking a bike or car?
              <select
                className={selectInputClass}
                value={formValues.vehicleType}
                onChange={(event) => updateVehicleType(event.target.value as HomeChargingVehicleType)}
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
              label="Petrol price per litre"
              helperText="Use the petrol price you normally pay in PKR."
              min={0}
              value={formValues.petrolPricePerLitre}
              onChange={(value) => updateFormValue('petrolPricePerLitre', value)}
            />

            <NumberField
              label="Petrol average (km per litre)"
              helperText="How far your current bike or car usually goes on one litre."
              min={1}
              value={formValues.petrolAverageKmPerLitre}
              onChange={(value) => updateFormValue('petrolAverageKmPerLitre', value)}
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
              label="Electricity unit price (PKR per kWh/unit)"
              helperText="Use your home electricity unit price, including taxes if you know it."
              min={0}
              value={formValues.electricityUnitPrice}
              onChange={(value) => updateFormValue('electricityUnitPrice', value)}
            />
          </form>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            {hasValidationErrors || !result ? (
              <ValidationCard messages={validationMessages} />
            ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                  Monthly estimate
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {formatCurrency(Math.abs(result.monthlySavings))}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{monthlySavingsLabel}</p>
              </div>

              <div className="grid gap-3 text-sm">
                <ResultRow label="Vehicle type" value={result.vehicleType} />
                <ResultRow label="Monthly distance" value={`${result.monthlyKm} km`} />
                <ResultRow
                  label="EV efficiency"
                  value={`${formatNumber(result.evKwhPerKm)} kWh/km`}
                />
                <ResultRow
                  label="Monthly EV electricity usage"
                  value={`${formatNumber(result.monthlyKwh)} kWh`}
                />
                <ResultRow
                  label="Monthly EV cost"
                  value={formatCurrency(result.monthlyEvCost)}
                />
                <ResultRow
                  label="Petrol litres required"
                  value={`${formatNumber(result.litresNeeded)} L`}
                />
                <ResultRow
                  label="Monthly petrol cost"
                  value={formatCurrency(result.monthlyPetrolCost)}
                />
                <ResultRow
                  label={monthlySavingsLabel}
                  value={formatCurrency(Math.abs(result.monthlySavings))}
                />
                <ResultRow
                  label={yearlySavingsLabel}
                  value={formatCurrency(Math.abs(result.yearlySavings))}
                />
              </div>

              <p className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
                This is a quick estimate, not a guarantee. Real cost can vary with traffic, load,
                driving style, tyre condition, charging losses, electricity tariff slabs, petrol
                price changes, and maintenance.
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
    'Petrol average km/l must be greater than 0.':
      'Petrol average must be greater than 0 km per litre.',
    'Battery capacity kWh must be greater than 0.':
      'Battery size must be greater than 0 kWh.',
    'Range per full charge km must be greater than 0.':
      'Range on one full charge must be greater than 0 km.',
    'Electricity unit price must not be negative.':
      'Electricity unit price cannot be negative. Enter 0 or more.',
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
