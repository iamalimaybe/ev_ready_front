import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import {
  normalizeVehicle,
  type BackendVehicle,
  type Vehicle,
  type VehicleCategory,
} from '../data/vehicles';
import { ApiError, apiClient, type PageResponse } from '../utils/api';

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
const vehiclePageSize = 6;

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

const categoryFilterValues: CategoryFilter[] = ['all', 'Bike', 'Car'];
const priceFilterValues: PriceFilter[] = [
  'all',
  'under-100k',
  'under-200k',
  'under-300k',
  'under-400k',
  'under-500k',
  'under-600k',
  'under-700k',
  'under-800k',
  'under-900k',
  'under-1m',
  'under-1-5m',
];
const rangeFilterValues: RangeFilter[] = [
  'all',
  '50-plus',
  '80-plus',
  '150-plus',
  '250-plus',
  '350-plus',
];
const dcChargingFilterValues: DcChargingFilter[] = ['all', 'yes', 'no'];
const sortOptionValues: SortOption[] = [
  'recommended',
  'price-asc',
  'price-desc',
  'range-desc',
  'range-asc',
];

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

function buildVehicleQuery(filters: FilterValues, page: number) {
  const params = new URLSearchParams();

  if (filters.category !== allFilterValue) {
    params.set('type', filters.category);
  }

  if (filters.vehicleType !== allFilterValue) {
    params.set('vehicleType', filters.vehicleType);
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
  params.set('page', String(page));
  params.set('size', String(vehiclePageSize));

  const query = params.toString();

  return `/api/v1/vehicles?${query}`;
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

function getFiltersFromSearchParams(searchParams: URLSearchParams): FilterValues {
  const category = getAllowedSearchValue(
    searchParams,
    'category',
    categoryFilterValues,
    initialFilters.category,
  );

  return {
    category,
    vehicleType: searchParams.get('vehicleType') || initialFilters.vehicleType,
    brandId: searchParams.get('brandId') || initialFilters.brandId,
    price: getAllowedSearchValue(searchParams, 'price', priceFilterValues, initialFilters.price),
    range: getAllowedSearchValue(searchParams, 'range', rangeFilterValues, initialFilters.range),
    dcCharging:
      category === 'Bike'
        ? 'all'
        : getAllowedSearchValue(
            searchParams,
            'dcCharging',
            dcChargingFilterValues,
            initialFilters.dcCharging,
          ),
    sort: getAllowedSearchValue(searchParams, 'sort', sortOptionValues, initialFilters.sort),
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

function buildListingSearchParams(filters: FilterValues) {
  const params = new URLSearchParams();

  if (filters.category !== initialFilters.category) {
    params.set('category', filters.category);
  }

  if (filters.vehicleType !== initialFilters.vehicleType) {
    params.set('vehicleType', filters.vehicleType);
  }

  if (filters.brandId !== initialFilters.brandId) {
    params.set('brandId', filters.brandId);
  }

  if (filters.price !== initialFilters.price) {
    params.set('price', filters.price);
  }

  if (filters.range !== initialFilters.range) {
    params.set('range', filters.range);
  }

  if (filters.dcCharging !== initialFilters.dcCharging && filters.category !== 'Bike') {
    params.set('dcCharging', filters.dcCharging);
  }

  if (filters.sort !== initialFilters.sort) {
    params.set('sort', filters.sort);
  }

  return params;
}

function normalizeVehiclePage(
  response: PageResponse<CatalogBackendVehicle> | CatalogBackendVehicle[],
  fallbackPage: number,
) {
  if (Array.isArray(response)) {
    return {
      items: response,
      page: fallbackPage,
      totalElements: response.length,
      totalPages: 1,
    };
  }

  if (!Array.isArray(response.content)) {
    throw new Error('Vehicle data response was not a paginated list.');
  }

  return {
    items: response.content,
    page:
      typeof response.page === 'number'
        ? response.page
        : typeof response.number === 'number'
          ? response.number
          : fallbackPage,
    totalElements:
      typeof response.totalElements === 'number'
        ? response.totalElements
        : response.content.length,
    totalPages: typeof response.totalPages === 'number' ? response.totalPages : 1,
  };
}

export default function VehicleCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterValues>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadedPage, setLoadedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brandErrorMessage, setBrandErrorMessage] = useState<string | null>(null);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const nextPageSentinelRef = useRef<HTMLDivElement | null>(null);
  const activeVehicleQueryRef = useRef('');
  const isFetchingNextVehiclePageRef = useRef(false);
  const listingSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const vehicleQueryBase = useMemo(() => buildVehicleQuery(filters, 0), [
    filters.brandId,
    filters.category,
    filters.dcCharging,
    filters.price,
    filters.range,
    filters.sort,
    filters.vehicleType,
  ]);
  const hasNextPage = loadedPage + 1 < totalPages;
  const activeFilterCount = getActiveFilterCount(filters);

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const loadVehiclePage = useCallback(
    (page: number, mode: 'replace' | 'append') => {
      if (mode === 'append' && isFetchingNextVehiclePageRef.current) {
        return Promise.resolve();
      }

      const requestQuery = buildVehicleQuery(filters, page);

      if (mode === 'replace') {
        activeVehicleQueryRef.current = vehicleQueryBase;
        isFetchingNextVehiclePageRef.current = false;
        setVehicles([]);
        setLoadedPage(0);
        setTotalPages(1);
        setTotalElements(0);
        setIsLoadingNextPage(false);
        setIsLoading(true);
      } else {
        isFetchingNextVehiclePageRef.current = true;
        setIsLoadingNextPage(true);
      }

      setErrorMessage(null);

      return apiClient
        .get<PageResponse<CatalogBackendVehicle> | CatalogBackendVehicle[]>(requestQuery)
        .then((vehicleResponse) => {
          if (activeVehicleQueryRef.current !== vehicleQueryBase) {
            return;
          }

          const vehiclePage = normalizeVehiclePage(vehicleResponse, page);
          const normalizedVehicles = vehiclePage.items.map(normalizeCatalogVehicle);

          setVehicles((currentVehicles) =>
            mode === 'replace' ? normalizedVehicles : [...currentVehicles, ...normalizedVehicles],
          );
          setLoadedPage(vehiclePage.page);
          setTotalPages(vehiclePage.totalPages);
          setTotalElements(vehiclePage.totalElements);
        })
        .catch((error: unknown) => {
          if (activeVehicleQueryRef.current !== vehicleQueryBase) {
            return;
          }

          if (mode === 'replace') {
            setVehicles([]);
          }

          setErrorMessage(getErrorMessage(error));
        })
        .finally(() => {
          if (mode === 'append') {
            isFetchingNextVehiclePageRef.current = false;
          }

          if (activeVehicleQueryRef.current !== vehicleQueryBase) {
            return;
          }

          if (mode === 'replace') {
            setIsLoading(false);
          } else {
            setIsLoadingNextPage(false);
          }
        });
    },
    [
      filters.brandId,
      filters.category,
      filters.dcCharging,
      filters.price,
      filters.range,
      filters.sort,
      filters.vehicleType,
      vehicleQueryBase,
    ],
  );

  useEffect(() => {
    activeVehicleQueryRef.current = vehicleQueryBase;
    void loadVehiclePage(0, 'replace');
  }, [loadVehiclePage, vehicleQueryBase]);

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

  useEffect(() => {
    const sentinel = nextPageSentinelRef.current;

    if (!sentinel || !hasNextPage || isLoading || isLoadingNextPage || errorMessage) {
      return undefined;
    }

    let hasRequestedNextPage = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!hasRequestedNextPage && entries.some((entry) => entry.isIntersecting)) {
          hasRequestedNextPage = true;
          void loadVehiclePage(loadedPage + 1, 'append');
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [errorMessage, hasNextPage, isLoading, isLoadingNextPage, loadVehiclePage, loadedPage]);

  function updateFilter<Key extends keyof FilterValues>(key: Key, value: FilterValues[Key]) {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);
    setSearchParams(buildListingSearchParams(nextFilters));
  }

  function updateCategory(category: CategoryFilter) {
    const nextFilters = {
      ...filters,
      category,
      vehicleType: allFilterValue,
      brandId: allFilterValue,
      dcCharging: category === 'Bike' ? 'all' : filters.dcCharging,
    };

    setFilters(nextFilters);
    setSearchParams(buildListingSearchParams(nextFilters));
  }

  function clearFilters() {
    setFilters(initialFilters);
    setSearchParams(buildListingSearchParams(initialFilters));
  }

  return (
    <PageShell eyebrow="Catalogue" title="EV Catalogue">
      <div className="space-y-6">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p>
            Vehicle specs and prices can change. Verify range, battery details, charging support,
            and final price from the manufacturer or dealer before a purchase decision.
          </p>
          <p className="mt-2">
            Source-confidence labels describe where the catalog information appears to come from;
            they do not mean EVReady has physically audited each vehicle. Always confirm final
            price, specs, dealer details, and availability before purchase.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 sm:w-auto"
            type="button"
            onClick={() => setAreFiltersOpen((isOpen) => !isOpen)}
          >
            {areFiltersOpen ? 'Hide filters' : 'Show filters'}
          </button>
          {!areFiltersOpen && activeFilterCount > 0 ? (
            <p className="text-sm text-slate-500">
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </p>
          ) : null}
        </div>

        {areFiltersOpen ? (
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
        ) : null}

        {isLoading ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Loading EV catalogue...
          </div>
        ) : errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">EV catalogue could not be loaded.</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        ) : vehicles.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {vehicles.length} of {totalElements} vehicles
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} listingSearch={listingSearch} vehicle={vehicle} />
              ))}
            </div>

            <div ref={nextPageSentinelRef} className="min-h-1" aria-hidden="true" />

            {isLoadingNextPage ? (
              <p className="text-sm text-slate-600">Loading more vehicles...</p>
            ) : !hasNextPage ? (
              <p className="text-sm text-slate-500">All matching vehicles loaded.</p>
            ) : null}
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
  listingSearch: string;
  vehicle: CatalogVehicle;
};

function VehicleCard({ listingSearch, vehicle }: VehicleCardProps) {
  const detailPath = `/vehicles/${vehicle.id}${listingSearch}`;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {vehicle.category} - {vehicle.vehicleType}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {vehicle.brand} {vehicle.model}
          </h2>
        </div>
        <p className="text-sm font-semibold text-slate-800">
          {currencyFormatter.format(vehicle.approxPricePkr)}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationStatusClasses[vehicle.verificationStatus]}`}
        >
          {verificationStatusLabels[vehicle.verificationStatus]}
        </span>
        <RatingAction
          averageRating={vehicle.averageRating}
          ratingCount={vehicle.ratingCount}
          to={`${detailPath}${vehicle.ratingCount > 0 ? '#reviews' : '#write-review'}`}
        />
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

      <div className="mt-5">
        <Link
          className="inline-flex rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          to={detailPath}
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

function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

type RatingActionProps = {
  averageRating: number | null;
  ratingCount: number;
  to: string;
};

function RatingAction({ averageRating, ratingCount, to }: RatingActionProps) {
  if (!averageRating || ratingCount <= 0) {
    return (
      <Link
        aria-label="Write the first review for this vehicle"
        className="inline-flex rounded-md border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
        title="Write the first review"
        to={to}
      >
        Be the first to review
      </Link>
    );
  }

  return (
    <Link
      aria-label={`Read ${ratingCount} approved ${ratingCount === 1 ? 'review' : 'reviews'} for this vehicle`}
      className="inline-flex flex-wrap items-center justify-start gap-2 rounded-md border border-amber-200 px-3 py-2 text-sm transition hover:border-amber-400 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:justify-end"
      title="Read approved reviews"
      to={to}
    >
      <span className="font-semibold text-amber-600" aria-hidden="true">
        {renderStars(averageRating)}
      </span>
      <span className="font-semibold text-slate-800">
        {formatRating(averageRating)}/5 · {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
      </span>
    </Link>
  );
}

function renderStars(rating: number) {
  const roundedRating = Math.round(rating);

  return Array.from({ length: 5 }, (_, index) => (index < roundedRating ? '★' : '☆')).join('');
}

function formatRating(rating: number) {
  return rating.toFixed(1);
}

function getActiveFilterCount(filters: FilterValues) {
  return (Object.keys(initialFilters) as Array<keyof FilterValues>).filter(
    (key) => filters[key] !== initialFilters[key],
  ).length;
}
