import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { demoRoutes } from '../data/routes';
import { normalizeVehicle, type BackendVehicle, type Vehicle } from '../data/vehicles';
import { ApiError, apiClient } from '../utils/api';
import {
  calculateRouteFeasibility,
  findMatchingRoute,
  getRouteFeasibilityExplanation,
  validateRouteFeasibilityInput,
  type RouteFeasibilityVerdict,
} from '../utils/calculators';

type FormValues = {
  fromCity: string;
  toCity: string;
  vehicleId: string;
  currentBatteryPercentage: number;
  reserveBatteryPercentage: number;
};

const cityOptions = Array.from(
  new Set(demoRoutes.flatMap((route) => [route.fromCity, route.toCity])),
).sort();

const initialFormValues: FormValues = {
  fromCity: 'Lahore',
  toCity: 'Islamabad',
  vehicleId: '',
  currentBatteryPercentage: 90,
  reserveBatteryPercentage: 20,
};

const numberInputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const selectInputClass = numberInputClass;

const verdictLabels: Record<RouteFeasibilityVerdict, string> = {
  SAFE: 'Safe',
  RISKY: 'Risky',
  NOT_RECOMMENDED: 'Not recommended',
};

function getAvailableToCities(fromCity: string) {
  return cityOptions.filter((city) => city !== fromCity);
}

function getNextDifferentCity(fromCity: string) {
  return getAvailableToCities(fromCity)[0] ?? fromCity;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.response.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Vehicle data could not be loaded right now.';
}

export default function RouteFeasibility() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehicleLoading, setIsVehicleLoading] = useState(true);
  const [vehicleErrorMessage, setVehicleErrorMessage] = useState<string | null>(null);

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

  const availableToCities = useMemo(
    () => getAvailableToCities(formValues.fromCity),
    [formValues.fromCity],
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === formValues.vehicleId),
    [formValues.vehicleId, vehicles],
  );

  const selectedRoute = useMemo(
    () =>
      findMatchingRoute({
        routes: demoRoutes,
        fromCity: formValues.fromCity,
        toCity: formValues.toCity,
      }),
    [formValues.fromCity, formValues.toCity],
  );

  const batteryValidationMessage = useMemo(
    () => {
      if (!selectedVehicle) {
        return undefined;
      }

      return validateRouteFeasibilityInput({
        distanceKm: selectedRoute?.distanceKm ?? 0,
        practicalHighwayRangeKm: selectedVehicle.practicalHighwayRangeKm,
        currentBatteryPercentage: formValues.currentBatteryPercentage,
        reserveBatteryPercentage: formValues.reserveBatteryPercentage,
      });
    },
    [
      formValues.currentBatteryPercentage,
      formValues.reserveBatteryPercentage,
      selectedRoute?.distanceKm,
      selectedVehicle,
    ],
  );

  const routeResult = useMemo(() => {
    if (batteryValidationMessage) {
      return undefined;
    }

    if (!selectedRoute || !selectedVehicle) {
      return undefined;
    }

    return calculateRouteFeasibility({
      distanceKm: selectedRoute.distanceKm,
      practicalHighwayRangeKm: selectedVehicle.practicalHighwayRangeKm,
      currentBatteryPercentage: formValues.currentBatteryPercentage,
      reserveBatteryPercentage: formValues.reserveBatteryPercentage,
    });
  }, [
    batteryValidationMessage,
    formValues.currentBatteryPercentage,
    formValues.reserveBatteryPercentage,
    selectedRoute,
    selectedVehicle,
  ]);

  function updateFormValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function updateFromCity(fromCity: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      fromCity,
      toCity:
        currentValues.toCity === fromCity ? getNextDifferentCity(fromCity) : currentValues.toCity,
    }));
  }

  return (
    <PageShell eyebrow="Estimator" title="Route Feasibility">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Car-focused intercity estimate for checking whether an EV can complete a selected route
          with your current battery and a safety buffer. Route data is still an estimate and is not
          live or complete.
        </p>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          This estimate is best suited for EV cars and longer intercity routes. EV bikes are better
          evaluated through the{' '}
          <Link to="/ev-bike-savings" className="font-semibold text-brand-700 hover:text-brand-800">
            EV Bike Savings Calculator
          </Link>
          .
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800">
              From city
              <select
                className={selectInputClass}
                value={formValues.fromCity}
                onChange={(event) => updateFromCity(event.target.value)}
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-800">
              To city
              <select
                className={selectInputClass}
                value={formValues.toCity}
                onChange={(event) => updateFormValue('toCity', event.target.value)}
              >
                {availableToCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-800 sm:col-span-2">
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
              label="Battery level before leaving (%)"
              helperText="Your expected battery level at the start of the trip."
              min={0}
              max={100}
              value={formValues.currentBatteryPercentage}
              onChange={(value) => updateFormValue('currentBatteryPercentage', value)}
            />

            <NumberField
              label="Battery you want to keep in reserve (%)"
              helperText="A safety buffer so you do not plan to arrive at 0%."
              min={0}
              max={100}
              value={formValues.reserveBatteryPercentage}
              onChange={(value) => updateFormValue('reserveBatteryPercentage', value)}
            />
          </form>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            {isVehicleLoading ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                Loading EV cars for route checking...
              </div>
            ) : vehicleErrorMessage ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-red-700">
                Vehicle list could not be loaded: {vehicleErrorMessage}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                No EV cars are available for route checking right now.
              </div>
            ) : !selectedVehicle ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                Select an EV car to see the route estimate.
              </div>
            ) : batteryValidationMessage ? (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                Please fix the battery numbers: {getReadableBatteryValidationMessage(
                  batteryValidationMessage,
                )}
              </div>
            ) : selectedRoute && routeResult ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    Route estimate
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {verdictLabels[routeResult.verdict]}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {formValues.fromCity} to {formValues.toCity}
                  </p>
                </div>

                <div className="grid gap-3 text-sm">
                  <ResultRow
                    label="Selected EV"
                    value={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                  />
                  <ResultRow label="Route distance" value={`${selectedRoute.distanceKm} km`} />
                  <ResultRow
                    label="Estimated highway range on full charge"
                    value={`${selectedVehicle.practicalHighwayRangeKm} km`}
                  />
                  <ResultRow
                    label="Battery usable after reserve"
                    value={`${routeResult.usableBatteryPercentage}%`}
                  />
                  <ResultRow
                    label="Estimated usable range"
                    value={`${Math.round(routeResult.usableRangeKm)} km`}
                  />
                  <ResultRow label="Trip verdict" value={verdictLabels[routeResult.verdict]} />
                  <ResultRow
                    label="Charging required"
                    value={routeResult.chargingRequired ? 'Yes' : 'No'}
                  />
                </div>

                <p className="rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-700">
                  {getRouteFeasibilityExplanation(routeResult.verdict)}
                </p>

                <p className="text-xs leading-5 text-slate-600">
                  This is a quick estimate, not a guarantee. It does not check live chargers,
                  traffic, weather, terrain, speed, load, or road conditions.
                </p>
              </div>
            ) : (
              <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-slate-700">
                Route data is not available yet for this city pair.
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

function getReadableBatteryValidationMessage(message: string): string {
  const readableMessages: Record<string, string> = {
    'Current battery percentage must be between 0 and 100.':
      'battery level before leaving should be from 0% to 100%.',
    'Reserve battery percentage must be between 0 and 100.':
      'battery reserve should be from 0% to 100%.',
    'Reserve battery must be lower than current battery to estimate usable range.':
      'battery reserve should be lower than your battery level before leaving.',
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
