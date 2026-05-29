import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { ApiError, apiClient } from '../utils/api';

type ChargingType = 'AC' | 'DC' | 'AC_DC';
type ChargerStatus = 'OPERATIONAL' | 'LIMITED' | 'COMING_SOON' | 'UNKNOWN';
type ChargerVerificationStatus =
  | 'OFFICIAL'
  | 'DEALER_CONFIRMED'
  | 'USER_REPORTED'
  | 'UNVERIFIED';
type ChargingTypeFilter = 'all' | ChargingType;
type ChargerStatusFilter = 'all' | ChargerStatus;

type ChargerType = {
  id: string;
  name: string;
};

type BackendCharger = {
  id: string;
  name?: string | null;
  city: string;
  area?: string | null;
  address?: string | null;
  chargerTypeId?: string;
  charger_type_id?: string;
  chargerType?: ChargerType;
  connectorType?: string;
  chargingType?: ChargingType | null;
  powerKw?: number | string | null;
  status: ChargerStatus;
  verificationStatus?: ChargerVerificationStatus | null;
  lastVerifiedAt?: string | null;
  sourceCheckedAt?: string | null;
  notes?: string | null;
  priceNote?: string | null;
  description?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type Charger = Omit<BackendCharger, 'latitude' | 'longitude' | 'verificationStatus'> & {
  latitude: number | null;
  longitude: number | null;
  verificationStatus: ChargerVerificationStatus;
};

type FilterValues = {
  city: string;
  chargerTypeId: string;
  chargingType: ChargingTypeFilter;
  status: ChargerStatusFilter;
};

const allFilterValue = 'all';
const chargerVisibleStep = 6;

const initialFilters: FilterValues = {
  city: allFilterValue,
  chargerTypeId: allFilterValue,
  chargingType: 'all',
  status: allFilterValue,
};

const selectInputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const chargingTypeOptions: ChargingType[] = ['AC', 'DC', 'AC_DC'];
const statusOptions: ChargerStatus[] = ['OPERATIONAL', 'LIMITED', 'COMING_SOON', 'UNKNOWN'];
const chargingTypeFilterOptions: ChargingTypeFilter[] = ['all', ...chargingTypeOptions];
const statusFilterOptions: ChargerStatusFilter[] = ['all', ...statusOptions];

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

function buildChargerQuery(filters: FilterValues) {
  const params = new URLSearchParams();

  if (filters.city !== allFilterValue) {
    params.set('city', filters.city);
  }

  if (filters.chargerTypeId !== allFilterValue) {
    params.set('chargerTypeId', filters.chargerTypeId);
  }

  if (filters.chargingType !== 'all') {
    params.set('chargingType', filters.chargingType);
  }

  if (filters.status !== allFilterValue) {
    params.set('status', filters.status);
  }

  params.set('sort', 'default');

  const query = params.toString();

  return query ? `/api/v1/chargers?${query}` : '/api/v1/chargers';
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.response.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Charger data could not be loaded right now.';
}

function normalizeVerificationStatus(
  verificationStatus: BackendCharger['verificationStatus'],
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

function normalizeCharger(charger: BackendCharger): Charger {
  return {
    ...charger,
    latitude: parseCoordinate(charger.latitude, -90, 90),
    longitude: parseCoordinate(charger.longitude, -180, 180),
    verificationStatus: normalizeVerificationStatus(charger.verificationStatus),
  };
}

function getFiltersFromSearchParams(searchParams: URLSearchParams): FilterValues {
  return {
    city: searchParams.get('city') || initialFilters.city,
    chargerTypeId: searchParams.get('chargerTypeId') || initialFilters.chargerTypeId,
    chargingType: getAllowedSearchValue(
      searchParams,
      'chargingType',
      chargingTypeFilterOptions,
      initialFilters.chargingType,
    ),
    status: getAllowedSearchValue(searchParams, 'status', statusFilterOptions, initialFilters.status),
  };
}

function getAllowedSearchValue<Value extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowedValues: Value[],
  fallback: Value,
) {
  const value = searchParams.get(key);

  return value && allowedValues.includes(value as Value) ? (value as Value) : fallback;
}

function getVisibleCountFromSearchParams(searchParams: URLSearchParams) {
  const visibleCount = Number(searchParams.get('visible'));

  if (!Number.isFinite(visibleCount) || visibleCount < chargerVisibleStep) {
    return chargerVisibleStep;
  }

  return Math.floor(visibleCount / chargerVisibleStep) * chargerVisibleStep;
}

function buildListingSearchParams(filters: FilterValues, visibleCount: number) {
  const params = new URLSearchParams();

  if (filters.city !== initialFilters.city) {
    params.set('city', filters.city);
  }

  if (filters.chargerTypeId !== initialFilters.chargerTypeId) {
    params.set('chargerTypeId', filters.chargerTypeId);
  }

  if (filters.chargingType !== initialFilters.chargingType) {
    params.set('chargingType', filters.chargingType);
  }

  if (filters.status !== initialFilters.status) {
    params.set('status', filters.status);
  }

  if (visibleCount > chargerVisibleStep) {
    params.set('visible', String(visibleCount));
  }

  return params;
}

export default function ChargerDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterValues>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [chargerTypes, setChargerTypes] = useState<ChargerType[]>([]);
  const [visibleCount, setVisibleCount] = useState(() =>
    getVisibleCountFromSearchParams(searchParams),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cityOptionsErrorMessage, setCityOptionsErrorMessage] = useState<string | null>(null);
  const [hasLoadedCityOptions, setHasLoadedCityOptions] = useState(false);
  const [chargerTypesErrorMessage, setChargerTypesErrorMessage] = useState<string | null>(null);
  const listingSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const chargerQuery = useMemo(() => buildChargerQuery(filters), [
    filters.chargerTypeId,
    filters.chargingType,
    filters.city,
    filters.status,
  ]);

  const visibleChargerCount = Math.min(visibleCount, chargers.length);
  const visibleChargers = chargers.slice(0, visibleChargerCount);

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams));
    setVisibleCount(getVisibleCountFromSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    let isCurrentRequest = true;

    setCityOptionsErrorMessage(null);
    setHasLoadedCityOptions(false);

    apiClient
      .get<string[]>('/api/v1/chargers/cities')
      .then((cityResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(cityResponse)) {
          throw new Error('Charger city response was not a list.');
        }

        const cityOptions = Array.from(
          new Set(
            cityResponse
              .filter((city) => typeof city === 'string')
              .map((city) => city.trim())
              .filter(Boolean),
          ),
        ).sort();

        setCities(cityOptions);
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setCities([]);
        setCityOptionsErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (isCurrentRequest) {
          setHasLoadedCityOptions(true);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    setChargerTypesErrorMessage(null);

    apiClient
      .get<ChargerType[]>('/api/v1/charger-types')
      .then((chargerTypeResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(chargerTypeResponse)) {
          throw new Error('Charger type response was not a list.');
        }

        setChargerTypes(chargerTypeResponse);
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setChargerTypes([]);
        setChargerTypesErrorMessage(getErrorMessage(error));
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setErrorMessage(null);

    apiClient
      .get<BackendCharger[]>(chargerQuery)
      .then((chargerResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(chargerResponse)) {
          throw new Error('Charger data response was not a list.');
        }

        setChargers(chargerResponse.map(normalizeCharger));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setChargers([]);
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
  }, [chargerQuery]);

  function updateFilter<Key extends keyof FilterValues>(key: Key, value: FilterValues[Key]) {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);
    setVisibleCount(chargerVisibleStep);
    setSearchParams(buildListingSearchParams(nextFilters, chargerVisibleStep));
  }

  function clearFilters() {
    setFilters(initialFilters);
    setVisibleCount(chargerVisibleStep);
    setSearchParams(buildListingSearchParams(initialFilters, chargerVisibleStep));
  }

  function loadMoreChargers() {
    const nextVisibleCount = visibleCount + chargerVisibleStep;

    setVisibleCount(nextVisibleCount);
    setSearchParams(buildListingSearchParams(filters, nextVisibleCount));
  }

  return (
    <PageShell eyebrow="Directory" title="Charger Directory">
      <div className="space-y-6">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Charger details can change and reported status is not live availability. Source-confidence
          labels describe the data source, not a physical EVReady audit. Verify location, connector
          support, access, pricing, and operation before travel.
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-800">
            City
            <select
              className={selectInputClass}
              value={filters.city}
              onChange={(event) => updateFilter('city', event.target.value)}
            >
              <option value={allFilterValue}>All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {cityOptionsErrorMessage ? (
              <span className="mt-2 block text-xs font-normal leading-5 text-amber-700">
                City options could not be loaded. The charger list can still be viewed.
              </span>
            ) : hasLoadedCityOptions && cities.length === 0 ? (
              <span className="mt-2 block text-xs font-normal leading-5 text-slate-500">
                City filters are not available yet.
              </span>
            ) : null}
          </label>

          <label className="text-sm font-medium text-slate-800">
            Charger / connector type
            <select
              className={selectInputClass}
              value={filters.chargerTypeId}
              onChange={(event) => updateFilter('chargerTypeId', event.target.value)}
            >
              <option value={allFilterValue}>All types</option>
              {chargerTypes.map((chargerType) => (
                <option key={chargerType.id} value={chargerType.id}>
                  {chargerType.name}
                </option>
              ))}
            </select>
            {chargerTypesErrorMessage ? (
              <span className="mt-2 block text-xs font-normal leading-5 text-amber-700">
                Charger types could not be loaded. Showing all types for now.
              </span>
            ) : null}
          </label>

          <label className="text-sm font-medium text-slate-800">
            Charging type
            <select
              className={selectInputClass}
              value={filters.chargingType}
              onChange={(event) =>
                updateFilter('chargingType', event.target.value as ChargingTypeFilter)
              }
            >
              <option value="all">All</option>
              {chargingTypeOptions.map((chargingType) => (
                <option key={chargingType} value={chargingType}>
                  {formatChargingTypeLabel(chargingType)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-800">
            Reported status
            <select
              className={selectInputClass}
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value as ChargerStatusFilter)}
            >
              <option value={allFilterValue}>All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Loading charger directory...
          </div>
        ) : errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Charger directory could not be loaded.</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        ) : chargers.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing 1-{visibleChargerCount} of {chargers.length} chargers
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {visibleChargers.map((charger) => (
                <ChargerCard
                  key={charger.id}
                  charger={charger}
                  chargerTypes={chargerTypes}
                  listingSearch={listingSearch}
                />
              ))}
            </div>

            {visibleCount < chargers.length ? (
              <button
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 sm:w-auto"
                type="button"
                onClick={loadMoreChargers}
              >
                Load more
              </button>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            No chargers match these filters right now.
          </div>
        )}
      </div>
    </PageShell>
  );
}

type ChargerCardProps = {
  charger: Charger;
  chargerTypes: ChargerType[];
  listingSearch: string;
};

function ChargerCard({ charger, chargerTypes, listingSearch }: ChargerCardProps) {
  const sourceCheckedDate = formatDate(charger.sourceCheckedAt);
  const mapLink = buildMapsLink(charger.latitude, charger.longitude);
  const noteLines = getNoteLines(charger);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {formatText(charger.city, 'City not listed')}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {formatText(charger.name, 'Charger name not listed')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{getLocationText(charger)}</p>
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
          {formatEnumLabel(charger.status)}
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <SpecRow label="Charger / connector type" value={getChargerTypeName(charger, chargerTypes)} />
        <SpecRow label="Charging type" value={formatChargingTypeLabel(charger.chargingType)} />
        <SpecRow label="Power" value={formatPower(charger.powerKw)} />
        {sourceCheckedDate ? <SpecRow label="Source checked" value={sourceCheckedDate} /> : null}
      </div>

      {noteLines.length > 0 ? (
        <div className="mt-4 rounded-md bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</p>
          <div className="mt-1 space-y-1 text-sm leading-6 text-slate-700">
            {noteLines.map((noteLine) => (
              <p key={noteLine}>{noteLine}</p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <Link
          className="inline-flex rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          to={`/chargers/${charger.id}${listingSearch}`}
        >
          View details
        </Link>
      </div>
    </article>
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

function getChargerTypeName(charger: Charger, chargerTypes: ChargerType[]) {
  if (isMeaningfulString(charger.chargerType?.name)) {
    return charger.chargerType.name.trim();
  }

  const chargerTypeId = charger.chargerTypeId ?? charger.charger_type_id;
  const matchingType = chargerTypes.find((chargerType) => chargerType.id === chargerTypeId);

  if (isMeaningfulString(matchingType?.name)) {
    return matchingType.name.trim();
  }

  if (isMeaningfulString(charger.connectorType)) {
    return charger.connectorType.trim();
  }

  return 'Unknown';
}

function getLocationText(charger: Charger) {
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

function formatPower(powerKw: Charger['powerKw']) {
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

function getNoteLines(charger: Charger) {
  return [charger.priceNote, charger.description]
    .filter(isMeaningfulString)
    .map((note) => note.trim());
}

function parseCoordinate(value: unknown, min: number, max: number) {
  const coordinate =
    typeof value === 'number' ? value : isMeaningfulString(value) ? Number(value) : Number.NaN;

  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    return null;
  }

  return coordinate;
}

function buildMapsLink(latitude: Charger['latitude'], longitude: Charger['longitude']) {
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
