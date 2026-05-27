import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import {
  calculateHomeChargingCost,
  validateHomeChargingCostInput,
  type HomeChargingVehicleType,
} from '../utils/calculators';

type FormValues = {
  vehicleType: HomeChargingVehicleType;
  batteryCapacityKwh: number;
  currentBatteryPercentage: number;
  targetBatteryPercentage: number;
  electricityUnitPrice: number;
  chargerPowerKw: number;
  chargingLossPercentage: number;
};

const initialFormValues: FormValues = {
  vehicleType: 'Bike',
  batteryCapacityKwh: 2,
  currentBatteryPercentage: 20,
  targetBatteryPercentage: 100,
  electricityUnitPrice: 65,
  chargerPowerKw: 1.5,
  chargingLossPercentage: 10,
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

export default function HomeChargingCostEstimator() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

  const validationMessages = useMemo(
    () =>
      validateHomeChargingCostInput({
        vehicleType: formValues.vehicleType,
        batteryCapacityKwh: formValues.batteryCapacityKwh,
        currentBatteryPercentage: formValues.currentBatteryPercentage,
        targetBatteryPercentage: formValues.targetBatteryPercentage,
        electricityUnitPrice: formValues.electricityUnitPrice,
        chargerPowerKw: formValues.chargerPowerKw,
        chargingLossPercentage: formValues.chargingLossPercentage,
      }),
    [formValues],
  );
  const hasValidationErrors = validationMessages.length > 0;

  const result = useMemo(() => {
    if (hasValidationErrors) {
      return undefined;
    }

    return calculateHomeChargingCost({
      vehicleType: formValues.vehicleType,
      batteryCapacityKwh: formValues.batteryCapacityKwh,
      currentBatteryPercentage: formValues.currentBatteryPercentage,
      targetBatteryPercentage: formValues.targetBatteryPercentage,
      electricityUnitPrice: formValues.electricityUnitPrice,
      chargerPowerKw: formValues.chargerPowerKw,
      chargingLossPercentage: formValues.chargingLossPercentage,
    });
  }, [formValues, hasValidationErrors]);

  function updateFormValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  return (
    <PageShell eyebrow="Calculator" title="Home Charging Cost Estimator">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Estimate what one home charge may cost for an EV bike or EV car, using your electricity
          unit price and charger details.
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800">
              Are you charging a bike or car?
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
              label="Battery size of the EV (kWh)"
              helperText="The total energy the EV battery can store."
              min={0.1}
              step={0.1}
              value={formValues.batteryCapacityKwh}
              onChange={(value) => updateFormValue('batteryCapacityKwh', value)}
            />

            <NumberField
              label="Battery level now (%)"
              min={0}
              max={100}
              value={formValues.currentBatteryPercentage}
              onChange={(value) => updateFormValue('currentBatteryPercentage', value)}
            />

            <NumberField
              label="Battery level you want (%)"
              min={0}
              max={100}
              value={formValues.targetBatteryPercentage}
              onChange={(value) => updateFormValue('targetBatteryPercentage', value)}
            />

            <NumberField
              label="Electricity unit price (PKR per kWh/unit)"
              helperText="Use your home electricity unit price, including taxes if you know it."
              min={0}
              value={formValues.electricityUnitPrice}
              onChange={(value) => updateFormValue('electricityUnitPrice', value)}
            />

            <NumberField
              label="Charger power (kW)"
              helperText="A higher kW charger usually charges faster."
              min={0.1}
              step={0.1}
              value={formValues.chargerPowerKw}
              onChange={(value) => updateFormValue('chargerPowerKw', value)}
            />

            <NumberField
              label="Charging loss (%)"
              helperText="Some electricity is lost as heat while charging."
              min={0}
              max={50}
              value={formValues.chargingLossPercentage}
              onChange={(value) => updateFormValue('chargingLossPercentage', value)}
            />
          </form>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            {hasValidationErrors || !result ? (
              <ValidationCard messages={validationMessages} />
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    Charging estimate
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {formatCurrency(result.estimatedChargingCost)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Estimated cost for this home charge
                  </p>
                </div>

                <div className="grid gap-3 text-sm">
                  <ResultRow label="Vehicle type" value={result.vehicleType} />
                <ResultRow
                    label="Battery percentage being added"
                    value={`${formatNumber(result.batteryPercentageToCharge)}%`}
                  />
                  <ResultRow
                    label="Energy added to the battery"
                    value={`${formatNumber(result.energyNeededBeforeLoss)} kWh`}
                  />
                  <ResultRow
                    label="Electricity taken from home supply"
                    value={`${formatNumber(result.gridEnergyRequiredKwh)} kWh`}
                  />
                  <ResultRow
                    label="Estimated charging cost"
                    value={formatCurrency(result.estimatedChargingCost)}
                  />
                  <ResultRow
                    label="Estimated charging time"
                    value={formatHours(result.estimatedChargingTimeHours)}
                  />
                  <ResultRow
                    label="Electricity unit price used"
                    value={formatCurrency(result.electricityUnitPrice)}
                  />
                </div>

                <p className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
                  Charger power mostly changes charging time. The cost mostly depends on how many
                  units are used and your electricity unit price.
                </p>

                <p className="text-xs leading-5 text-slate-600">
                  This is a quick estimate, not a guarantee. Real charging cost and time can vary
                  with charger efficiency, battery condition, voltage stability, tariff slabs, and
                  actual charger output.
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
    'Battery capacity must be greater than 0.': 'Battery size must be greater than 0 kWh.',
    'Current battery percentage must be between 0 and 100.':
      'Battery level now should be from 0% to 100%.',
    'Target battery percentage must be between 0 and 100.':
      'Target battery level should be from 0% to 100%.',
    'Target battery percentage must be greater than current battery percentage.':
      'The battery level you want should be higher than the battery level now.',
    'Electricity unit price must not be negative.':
      'Electricity unit price cannot be negative. Enter 0 or more.',
    'Charger power must be greater than 0.': 'Charger power must be greater than 0 kW.',
    'Charging loss percentage must be between 0 and 50.':
      'Charging loss should be from 0% to 50%.',
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

function formatHours(value: number): string {
  return Number.isFinite(value) ? `${numberFormatter.format(value)} hours` : '-';
}
