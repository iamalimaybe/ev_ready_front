import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import {
  normalizeVehicle,
  type BackendVehicle,
  type Vehicle,
  type VehicleCategory,
} from '../data/vehicles';
import { ApiError, apiClient } from '../utils/api';

type DcChargingFilter = 'all' | 'yes' | 'no';
type CategoryFilter = 'all' | VehicleCategory;
type PriceFilter =
  | 'all'
  | 'under-100k'
  | 'under-200k'
  | 'under-300k'
  | 'under-400k'
  | 'under-500k'
  | 'under-600k'
  | 'under-700k'
  | 'under-800k'
  | 'under-900k'
  | 'under-1m'
  | 'under-1-5m';
type RangeFilter = 'all' | '50-plus' | '80-plus' | '150-plus' | '250-plus' | '350-plus';
type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'range-desc' | 'range-asc';
type VehicleVerificationStatus =
  | 'OFFICIAL'
  | 'DEALER_CONFIRMED'
  | 'USER_REPORTED'
  | 'UNVERIFIED';

type CatalogBackendVehicle = BackendVehicle & {
  verificationStatus?: VehicleVerificationStatus | null;
};

type CatalogVehicle = Vehicle & {
  verificationStatus: VehicleVerificationStatus;
};

type FilterValues = {
  category: CategoryFilter;
  vehicleType: string;
  brandId: string;
  price: PriceFilter;
  range: RangeFilter;
  dcCharging: DcChargingFilter;
  sort: SortOption;
};

type Brand = {
  id: string;
  name: string;
  displayOrder?: number;
};

const allFilterValue = 'all';
const vehiclePageSize = 12;

const initialFilters: FilterValues = {
  category: allFilterValue,
  vehicleType: allFilterValue,
  brandId: allFilterValue,
  price: 'all',
  range: 'all',
  dcCharging: 'all',
  sort: 'recommended',
};

const currencyFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
  style: 'currency',
  currency: 'PKR',
});

const selectInputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const priceLimits: Record<Exclude<PriceFilter, 'all'>, number> = {
  'under-100k': 100000,
  'under-200k': 200000,
  'under-300k': 300000,
  'under-400k': 400000,
  'under-500k': 500000,
  'under-600k': 600000,
  'under-700k': 700000,
  'under-800k': 800000,
  'under-900k': 900000,
  'under-1m': 1000000,
  'under-1-5m': 1500000,
};

const rangeMinimums: Record<Exclude<RangeFilter, 'all'>, number> = {
  '50-plus': 50,
  '80-plus': 80,
  '150-plus': 150,
  '250-plus': 250,
  '350-plus': 350,
};

const backendSortValues: Record<SortOption, string> = {
  recommended: 'default',
  'price-asc': 'priceAsc',
  'price-desc': 'priceDesc',
  'range-desc': 'rangeDesc',
  'range-asc': 'rangeAsc',
};

const verificationStatusLabels: Record<VehicleVerificationStatus, string> = {
  OFFICIAL: 'Official source',
  DEALER_CONFIRMED: 'Dealer confirmed',
  USER_REPORTED: 'User reported',
  UNVERIFIED: 'Unverified',
};

const verificationStatusClasses: Record<VehicleVerificationStatus, string> = {
  OFFICIAL: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DEALER_CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
  USER_REPORTED: 'border-amber-200 bg-amber-50 text-amber-700',
  UNVERIFIED: 'border-slate-200 bg-slate-50 text-slate-600',
};

function buildVehicleQuery(filters: FilterValues) {
  const params = new URLSearchParams();

  if (filters.category !== allFilterValue) {
    params.set('type', filters.category);
  }

  if (filters.brandId !== allFilterValue) {
    params.set('brandId', filters.brandId);
  }

  if (filters.price !== 'all') {
    params.set('priceMax', String(priceLimits[filters.price]));
  }

  if (filters.range !== 'all') {
    params.set('rangeMin', String(rangeMinimums[filters.range]));
  }

  if (filters.dcCharging !== 'all' && filters.category !== 'Bike') {
    params.set('dcFastCharging', filters.dcCharging === 'yes' ? 'true' : 'false');
  }

  params.set('sort', backendSortValues[filters.sort]);

  const query = params.toString();

  return query ? `/api/v1/vehicles?${query}` : '/api/v1/vehicles';
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

function sortBrands(firstBrand: Brand, secondBrand: Brand) {
  const firstOrder = firstBrand.displayOrder ?? Number.MAX_SAFE_INTEGER;
  const secondOrder = secondBrand.displayOrder ?? Number.MAX_SAFE_INTEGER;

  if (firstOrder !== secondOrder) {
    return firstOrder - secondOrder;
  }

  return firstBrand.name.localeCompare(secondBrand.name);
}

function normalizeVerificationStatus(
  verificationStatus: CatalogBackendVehicle['verificationStatus'],
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

function normalizeCatalogVehicle(vehicle: CatalogBackendVehicle): CatalogVehicle {
  return {
    ...normalizeVehicle(vehicle),
    verificationStatus: normalizeVerificationStatus(vehicle.verificationStatus),
  };
}

export default function VehicleCatalog() {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brandErrorMessage, setBrandErrorMessage] = useState<string | null>(null);

  const vehicleQuery = useMemo(() => buildVehicleQuery(filters), [
    filters.brandId,
    filters.category,
    filters.dcCharging,
    filters.price,
    filters.range,
    filters.sort,
  ]);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setErrorMessage(null);

    apiClient
      .get<CatalogBackendVehicle[]>(vehicleQuery)
      .then((vehicleResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(vehicleResponse)) {
          throw new Error('Vehicle data response was not a list.');
        }

        setVehicles(vehicleResponse.map(normalizeCatalogVehicle));
        setCurrentPage(1);
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setVehicles([]);
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
  }, [vehicleQuery]);

  useEffect(() => {
    let isCurrentRequest = true;

    setBrandErrorMessage(null);

    apiClient
      .get<Brand[]>('/api/v1/brands')
      .then((brandResponse) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!Array.isArray(brandResponse)) {
          throw new Error('Brand data response was not a list.');
        }

        setBrands([...brandResponse].sort(sortBrands));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setBrands([]);
        setBrandErrorMessage(getErrorMessage(error));
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const categoryFilteredVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) => filters.category === allFilterValue || vehicle.category === filters.category,
      ),
    [filters.category, vehicles],
  );

  const vehicleTypes = useMemo(
    () =>
      Array.from(new Set(categoryFilteredVehicles.map((vehicle) => vehicle.vehicleType))).sort(),
    [categoryFilteredVehicles],
  );

  const filteredVehicles = useMemo(() => {
    const matchingVehicles = vehicles.filter((vehicle) => {
      const matchesCategory =
        filters.category === allFilterValue || vehicle.category === filters.category;
      const matchesType =
        filters.vehicleType === allFilterValue || vehicle.vehicleType === filters.vehicleType;
      const matchesPrice =
        filters.price === 'all' || vehicle.approxPricePkr <= priceLimits[filters.price];
      const matchesRange =
        filters.range === 'all' || vehicle.practicalCityRangeKm >= rangeMinimums[filters.range];
      const matchesDcCharging =
        filters.category === 'Bike' ||
        filters.dcCharging === 'all' ||
        (filters.dcCharging === 'yes' && vehicle.supportsDcCharging) ||
        (filters.dcCharging === 'no' && !vehicle.supportsDcCharging);

      return (
        matchesCategory &&
        matchesType &&
        matchesPrice &&
        matchesRange &&
        matchesDcCharging
      );
    });

    return [...matchingVehicles].sort((firstVehicle, secondVehicle) => {
      if (filters.sort === 'price-asc') {
        return firstVehicle.approxPricePkr - secondVehicle.approxPricePkr;
      }

      if (filters.sort === 'price-desc') {
        return secondVehicle.approxPricePkr - firstVehicle.approxPricePkr;
      }

      if (filters.sort === 'range-desc') {
        return secondVehicle.practicalCityRangeKm - firstVehicle.practicalCityRangeKm;
      }

      if (filters.sort === 'range-asc') {
        return firstVehicle.practicalCityRangeKm - secondVehicle.practicalCityRangeKm;
      }

      return 0;
    });
  }, [filters, vehicles]);

  const totalPages = Math.ceil(filteredVehicles.length / vehiclePageSize);
  const firstVehicleIndex = (currentPage - 1) * vehiclePageSize;
  const lastVehicleIndex = Math.min(firstVehicleIndex + vehiclePageSize, filteredVehicles.length);
  const paginatedVehicles = filteredVehicles.slice(firstVehicleIndex, lastVehicleIndex);

  function updateFilter<Key extends keyof FilterValues>(key: Key, value: FilterValues[Key]) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
    setCurrentPage(1);
  }

  function updateCategory(category: CategoryFilter) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      category,
      vehicleType: allFilterValue,
      brandId: allFilterValue,
      dcCharging: category === 'Bike' ? 'all' : currentFilters.dcCharging,
    }));
    setCurrentPage(1);
  }

  return (
    <PageShell eyebrow="Catalog" title="Vehicle Catalog">
      <div className="space-y-6">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p>
            Vehicle specs and prices can change. Verify range, battery details, charging support,
            and final price from the manufacturer or dealer before a purchase decision.
          </p>
          <p className="mt-2">
            Verification labels show the source confidence of catalog data. Always confirm final
            price, specs, and availability before purchase.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-800">
            Bike or car
            <select
              className={selectInputClass}
              value={filters.category}
              onChange={(event) => updateCategory(event.target.value as CategoryFilter)}
            >
              <option value={allFilterValue}>All bikes and cars</option>
              <option value="Bike">EV bikes only</option>
              <option value="Car">EV cars only</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-800">
            Body style
            <select
              className={selectInputClass}
              value={filters.vehicleType}
              onChange={(event) => updateFilter('vehicleType', event.target.value)}
            >
              <option value={allFilterValue}>All vehicle types</option>
              {vehicleTypes.map((vehicleType) => (
                <option key={vehicleType} value={vehicleType}>
                  {vehicleType}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-800">
            Brand
            <select
              className={selectInputClass}
              value={filters.brandId}
              onChange={(event) => updateFilter('brandId', event.target.value)}
            >
              <option value={allFilterValue}>All brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {brandErrorMessage ? (
              <span className="mt-2 block text-xs font-normal leading-5 text-amber-700">
                Brand list could not be loaded. You can still view all vehicles.
              </span>
            ) : null}
          </label>

          <label className="text-sm font-medium text-slate-800">
            Maximum price
            <select
              className={selectInputClass}
              value={filters.price}
              onChange={(event) => updateFilter('price', event.target.value as PriceFilter)}
            >
              <option value="all">Any price / No range</option>
              <option value="under-100k">Under PKR 100,000</option>
              <option value="under-200k">Under PKR 200,000</option>
              <option value="under-300k">Under PKR 300,000</option>
              <option value="under-400k">Under PKR 400,000</option>
              <option value="under-500k">Under PKR 500,000</option>
              <option value="under-600k">Under PKR 600,000</option>
              <option value="under-700k">Under PKR 700,000</option>
              <option value="under-800k">Under PKR 800,000</option>
              <option value="under-900k">Under PKR 900,000</option>
              <option value="under-1m">Under PKR 1,000,000</option>
              <option value="under-1-5m">Under PKR 1,500,000</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-800">
            Minimum city range
            <select
              className={selectInputClass}
              value={filters.range}
              onChange={(event) => updateFilter('range', event.target.value as RangeFilter)}
            >
              <option value="all">Any range</option>
              <option value="50-plus">50 km or more</option>
              <option value="80-plus">80 km or more</option>
              <option value="150-plus">150 km or more</option>
              <option value="250-plus">250 km or more</option>
              <option value="350-plus">350 km or more</option>
            </select>
          </label>

          {filters.category !== 'Bike' ? (
            <label className="text-sm font-medium text-slate-800">
              DC fast charging supported
              <select
                className={selectInputClass}
                value={filters.dcCharging}
                onChange={(event) =>
                  updateFilter('dcCharging', event.target.value as DcChargingFilter)
                }
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          ) : null}

          <label className="text-sm font-medium text-slate-800">
            Sort by
            <select
              className={selectInputClass}
              value={filters.sort}
              onChange={(event) => updateFilter('sort', event.target.value as SortOption)}
            >
              <option value="recommended">Default / Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="range-desc">Range: High to Low</option>
              <option value="range-asc">Range: Low to High</option>
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Loading vehicle catalog...
          </div>
        ) : errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Vehicle catalog could not be loaded.</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {firstVehicleIndex + 1}-{lastVehicleIndex} of {filteredVehicles.length}{' '}
                vehicles
              </span>

              <div className="flex items-center gap-3">
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </button>
                <span className="whitespace-nowrap">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {paginatedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            No vehicles match these filters right now. Try changing the bike/car category, price,
            range, or brand filter.
          </div>
        )}
      </div>
    </PageShell>
  );
}

type VehicleCardProps = {
  vehicle: CatalogVehicle;
};

function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {vehicle.category} - {vehicle.vehicleType}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {vehicle.brand} {vehicle.model}
          </h2>
          <span
            className={`mt-2 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationStatusClasses[vehicle.verificationStatus]}`}
          >
            {verificationStatusLabels[vehicle.verificationStatus]}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-800">
          {currencyFormatter.format(vehicle.approxPricePkr)}
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <SpecRow label="Battery capacity" value={`${vehicle.batteryCapacityKwh} kWh`} />
        <SpecRow label="Claimed range" value={`${vehicle.claimedRangeKm} km`} />
        <SpecRow label="Practical city range" value={`${vehicle.practicalCityRangeKm} km`} />
        <SpecRow label="Practical highway range" value={`${vehicle.practicalHighwayRangeKm} km`} />
        <SpecRow label="Efficiency" value={`${vehicle.efficiencyKwhPerKm} kWh/km`} />
        <SpecRow label="Connector type" value={vehicle.connectorType} />
        <SpecRow label="AC charging support" value={formatBoolean(vehicle.supportsAcCharging)} />
        {vehicle.category === 'Car' ? (
          <SpecRow
            label="DC fast charging support"
            value={formatBoolean(vehicle.supportsDcCharging)}
          />
        ) : null}
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

function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}
