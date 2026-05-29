import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { ApiError, apiClient } from '../utils/api';

type ChargingType = 'AC' | 'DC' | 'AC_DC';
type ChargerStatus = 'OPERATIONAL' | 'LIMITED' | 'COMING_SOON' | 'UNKNOWN';
type ChargerVerificationStatus =
  | 'OFFICIAL'
  | 'DEALER_CONFIRMED'
  | 'USER_REPORTED'
  | 'UNVERIFIED';

type ChargerType = {
  id: string;
  name: string;
};

type BackendChargerDetail = {
  id: string;
  name?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  chargerTypeId?: string;
  charger_type_id?: string;
  chargerType?: ChargerType;
  connectorType?: string;
  chargingType?: ChargingType | null;
  powerKw?: number | string | null;
  status?: ChargerStatus | null;
  verificationStatus?: ChargerVerificationStatus | null;
  sourceCheckedAt?: string | null;
  priceNote?: string | null;
  description?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type ChargerDetailRecord = Omit<BackendChargerDetail, 'latitude' | 'longitude' | 'verificationStatus'> & {
  latitude: number | null;
  longitude: number | null;
  verificationStatus: ChargerVerificationStatus;
};

const verificationStatusLabels: Record<ChargerVerificationStatus, string> = {
  OFFICIAL: 'Operator source-backed',
  DEALER_CONFIRMED: 'Provider source-backed',
  USER_REPORTED: 'User reported source',
  UNVERIFIED: 'Source not confirmed',
};

const verificationStatusClasses: Record<ChargerVerificationStatus, string> = {
  OFFICIAL: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DEALER_CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
  USER_REPORTED: 'border-amber-200 bg-amber-50 text-amber-700',
  UNVERIFIED: 'border-slate-200 bg-slate-50 text-slate-600',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.response.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Charger details could not be loaded right now.';
}

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.response.status === 404;
}

function normalizeVerificationStatus(
  verificationStatus: BackendChargerDetail['verificationStatus'],
): ChargerVerificationStatus {
  if (
    verificationStatus === 'OFFICIAL' ||
    verificationStatus === 'DEALER_CONFIRMED' ||
    verificationStatus === 'USER_REPORTED'
  ) {
    return verificationStatus;
  }

  return 'UNVERIFIED';
}

function normalizeChargerDetail(charger: BackendChargerDetail): ChargerDetailRecord {
  return {
    ...charger,
    latitude: parseCoordinate(charger.latitude, -90, 90),
    longitude: parseCoordinate(charger.longitude, -180, 180),
    verificationStatus: normalizeVerificationStatus(charger.verificationStatus),
  };
}

export default function ChargerDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [charger, setCharger] = useState<ChargerDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    if (!id) {
      setCharger(null);
      setIsLoading(false);
      setErrorMessage(null);
      setNotFoundMessage('Charger ID was not provided.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundMessage(null);

    apiClient
      .get<BackendChargerDetail>(`/api/v1/chargers/${encodeURIComponent(id)}`)
      .then((chargerResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!chargerResponse || typeof chargerResponse !== 'object') {
          throw new Error('Charger detail response was empty.');
        }

        setCharger(normalizeChargerDetail(chargerResponse));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setCharger(null);

        if (isNotFoundError(error)) {
          setNotFoundMessage('This charger could not be found.');
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

  const mapLink = charger ? buildMapsLink(charger.latitude, charger.longitude) : null;
  const backLink = (
    <Link
      className="inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-700 sm:w-auto"
      to={`/chargers${location.search}`}
    >
      Back to Charger Directory
    </Link>
  );

  return (
    <PageShell
      actions={backLink}
      eyebrow="Charger details"
      title={charger ? formatText(charger.name, 'Charger Details') : 'Charger Details'}
    >
      <div className="space-y-6">
        {isLoading ? (
          <StateMessage>Loading charger details...</StateMessage>
        ) : notFoundMessage ? (
          <StateMessage>{notFoundMessage}</StateMessage>
        ) : errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Charger details could not be loaded.</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        ) : charger ? (
          <>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Charger status is not live availability. Verify connector support, access, pricing,
              and operation before travel. Source-confidence labels describe the data source, not a
              physical EVReady audit.
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    {formatText(charger.city, 'City not listed')}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {formatText(charger.name, 'Charger name not listed')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {getLocationText(charger)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationStatusClasses[charger.verificationStatus]}`}
                    >
                      {verificationStatusLabels[charger.verificationStatus]}
                    </span>
                    {mapLink ? (
                      <a
                        className="inline-flex w-fit rounded-full border border-brand-200 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-800"
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Maps
                      </a>
                    ) : null}
                  </div>
                </div>
                <p className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  {formatEnumLabel(charger.status ?? 'UNKNOWN')}
                </p>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <SpecRow label="Name" value={formatText(charger.name, 'Charger name not listed')} />
                <SpecRow label="City" value={formatText(charger.city, 'City not listed')} />
                <SpecRow label="Area" value={formatText(charger.area, 'Area not listed')} />
                <SpecRow label="Address" value={formatText(charger.address, 'Address not listed')} />
                <SpecRow label="Charger / connector type" value={getChargerTypeName(charger)} />
                <SpecRow label="Charging type" value={formatChargingTypeLabel(charger.chargingType)} />
                <SpecRow label="Reported status" value={formatEnumLabel(charger.status ?? 'UNKNOWN')} />
                <SpecRow label="Power" value={formatPower(charger.powerKw)} />
                <SpecRow label="Price note" value={formatText(charger.priceNote, 'Price note not listed')} />
                {formatDate(charger.sourceCheckedAt) ? (
                  <SpecRow label="Source checked" value={formatDate(charger.sourceCheckedAt) ?? ''} />
                ) : null}
              </div>

              {isMeaningfulString(charger.description) ? (
                <div className="mt-5 rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {charger.description.trim()}
                  </p>
                </div>
              ) : null}
            </section>
          </>
        ) : (
          <StateMessage>Charger details are not available right now.</StateMessage>
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

function getChargerTypeName(charger: ChargerDetailRecord) {
  if (isMeaningfulString(charger.chargerType?.name)) {
    return charger.chargerType.name.trim();
  }

  if (isMeaningfulString(charger.connectorType)) {
    return charger.connectorType.trim();
  }

  return 'Unknown';
}

function getLocationText(charger: ChargerDetailRecord) {
  if (isMeaningfulString(charger.address)) {
    return charger.address.trim();
  }

  if (isMeaningfulString(charger.area)) {
    return charger.area.trim();
  }

  return 'Address not listed';
}

function isMeaningfulString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatText(value: unknown, fallback: string) {
  return isMeaningfulString(value) ? value.trim() : fallback;
}

function formatPower(powerKw: ChargerDetailRecord['powerKw']) {
  if (typeof powerKw === 'number' && Number.isFinite(powerKw)) {
    return `${powerKw} kW`;
  }

  if (isMeaningfulString(powerKw)) {
    const parsedPower = Number(powerKw);

    if (Number.isFinite(parsedPower)) {
      return `${parsedPower} kW`;
    }
  }

  return 'Power not listed';
}

function formatDate(value: unknown) {
  if (!isMeaningfulString(value)) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return dateFormatter.format(date);
}

function parseCoordinate(value: unknown, min: number, max: number) {
  const coordinate =
    typeof value === 'number' ? value : isMeaningfulString(value) ? Number(value) : Number.NaN;

  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    return null;
  }

  return coordinate;
}

function buildMapsLink(latitude: ChargerDetailRecord['latitude'], longitude: ChargerDetailRecord['longitude']) {
  if (latitude === null || longitude === null) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function formatChargingTypeLabel(value: unknown) {
  if (value === 'AC_DC') {
    return 'AC/DC';
  }

  if (value === 'AC' || value === 'DC') {
    return value;
  }

  return 'Charging type not listed';
}

function formatEnumLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
