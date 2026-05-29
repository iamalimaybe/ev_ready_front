import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { normalizeVehicle, type BackendVehicle, type Vehicle } from '../data/vehicles';
import { ApiError, apiClient } from '../utils/api';

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
