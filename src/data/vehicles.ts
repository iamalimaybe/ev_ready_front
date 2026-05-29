export type VehicleCategory = 'Bike' | 'Car';

export type VehicleType = 'Bike' | 'Scooter' | 'Car' | 'Hatchback' | 'Sedan' | 'Crossover' | 'SUV';

type BackendVehicleType = 'BIKE' | 'CAR' | string;

type BackendVehicleBrand = {
  id: string | number;
  name: string;
  logo?: string | null;
};

type BackendVehicleChargerType = {
  id: string | number;
  code?: string;
  name: string;
};

type BackendRatingAggregate = {
  average?: number | string | null;
  average_rating?: number | string | null;
  averageRating?: number | string | null;
  ratingAverage?: number | string | null;
  approvedAverageRating?: number | string | null;
  approvedRatingAverage?: number | string | null;
  count?: number | string | null;
  total?: number | string | null;
  totalApprovedReviews?: number | string | null;
  totalReviews?: number | string | null;
  rating_count?: number | string | null;
  ratingCount?: number | string | null;
  ratingsCount?: number | string | null;
  review_count?: number | string | null;
  reviewCount?: number | string | null;
  reviewsCount?: number | string | null;
  approved_review_count?: number | string | null;
  approvedReviewCount?: number | string | null;
  approvedReviewsCount?: number | string | null;
};

export type BackendVehicle = {
  id: string | number;
  vehicleType?: BackendVehicleType;
  brand?: string | BackendVehicleBrand | null;
  chargerType?: string | BackendVehicleChargerType | null;
  model?: string | null;
  variant?: string | null;
  pricePkr?: number | null;
  rangeKm?: number | null;
  batteryCapacityKwh?: number | null;
  dcFastCharging?: boolean | null;
  image?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  averageRating?: number | string | null;
  ratingCount?: number | string | null;
  approvedAverageRating?: number | string | null;
  approvedRatingCount?: number | string | null;
  approvedRatingAverage?: number | string | null;
  approvedRatingsCount?: number | string | null;
  approvedReviewsCount?: number | string | null;
  approvedReviewAverage?: number | string | null;
  approvedReviewAverageRating?: number | string | null;
  approvedReviewRatingAverage?: number | string | null;
  approvedReviewRatingCount?: number | string | null;
  approvedReviewCount?: number | string | null;
  averageReviewRating?: number | string | null;
  reviewAverageRating?: number | string | null;
  reviewCount?: number | string | null;
  reviewsCount?: number | string | null;
  totalApprovedReviews?: number | string | null;
  totalReviews?: number | string | null;
  publicAverageRating?: number | string | null;
  publicRatingCount?: number | string | null;
  ratingsAverage?: number | string | null;
  ratingsCount?: number | string | null;
  ratingStats?: BackendRatingAggregate | null;
  ratingSummary?: BackendRatingAggregate | null;
  ratingsSummary?: BackendRatingAggregate | null;
  ratingAggregate?: BackendRatingAggregate | null;
  reviewStats?: BackendRatingAggregate | null;
  reviewSummary?: BackendRatingAggregate | null;
  reviewsSummary?: BackendRatingAggregate | null;
  reviewAggregate?: BackendRatingAggregate | null;
  approvedRatingStats?: BackendRatingAggregate | null;
  approvedRatingSummary?: BackendRatingAggregate | null;
  approvedRatingsSummary?: BackendRatingAggregate | null;
  approvedReviewStats?: BackendRatingAggregate | null;
  approvedReviewSummary?: BackendRatingAggregate | null;
  approvedReviewRatingSummary?: BackendRatingAggregate | null;
  approvedReviewsSummary?: BackendRatingAggregate | null;
  approvedReviewsRatingSummary?: BackendRatingAggregate | null;
  approvedReviewAggregate?: BackendRatingAggregate | null;
  vehicleReviewSummary?: BackendRatingAggregate | null;
};

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  vehicleType: VehicleType;
  batteryCapacityKwh: number;
  claimedRangeKm: number;
  practicalCityRangeKm: number;
  practicalHighwayRangeKm: number;
  efficiencyKwhPerKm: number;
  connectorType: string;
  supportsAcCharging: boolean;
  supportsDcCharging: boolean;
  approxPricePkr: number;
  averageRating: number | null;
  ratingCount: number;
};

const fallbackEfficiencyKwhPerKm = 0.17;
const cityRangeFactor = 0.82;
const highwayRangeFactor = 0.68;

export function normalizeVehicle(vehicle: Vehicle | BackendVehicle): Vehicle {
  if (isNormalizedVehicle(vehicle)) {
    return vehicle;
  }

  const claimedRangeKm = toFiniteNumber(vehicle.rangeKm, 0);
  const batteryCapacityKwh = toFiniteNumber(vehicle.batteryCapacityKwh, 0);
  const ratingAggregates = getRatingAggregates(vehicle);
  const ratingCount = toFirstPositiveWholeNumber(
    [
      vehicle.ratingCount,
      vehicle.approvedRatingCount,
      vehicle.approvedRatingsCount,
      vehicle.approvedReviewRatingCount,
      vehicle.approvedReviewCount,
      vehicle.approvedReviewsCount,
      vehicle.reviewCount,
      vehicle.reviewsCount,
      vehicle.totalApprovedReviews,
      vehicle.totalReviews,
      vehicle.publicRatingCount,
      vehicle.ratingsCount,
      ...getAggregateValues(ratingAggregates, [
        'ratingCount',
        'rating_count',
        'ratingsCount',
        'reviewCount',
        'review_count',
        'reviewsCount',
        'approvedReviewCount',
        'approved_review_count',
        'approvedReviewsCount',
        'totalApprovedReviews',
        'totalReviews',
        'count',
        'total',
      ]),
    ],
    0,
  );
  const averageRating = toFirstPositiveRatingValue(
    [
      vehicle.averageRating,
      vehicle.approvedAverageRating,
      vehicle.approvedRatingAverage,
      vehicle.approvedReviewAverage,
      vehicle.approvedReviewAverageRating,
      vehicle.approvedReviewRatingAverage,
      vehicle.averageReviewRating,
      vehicle.reviewAverageRating,
      vehicle.publicAverageRating,
      vehicle.ratingsAverage,
      ...getAggregateValues(ratingAggregates, [
        'averageRating',
        'approvedAverageRating',
        'approvedRatingAverage',
        'ratingAverage',
        'average',
        'average_rating',
      ]),
    ],
    ratingCount,
  );
  const efficiencyKwhPerKm =
    claimedRangeKm > 0 && batteryCapacityKwh > 0
      ? roundToThreeDecimals(batteryCapacityKwh / claimedRangeKm)
      : fallbackEfficiencyKwhPerKm;

  return {
    id: String(vehicle.id),
    brand: getBrandName(vehicle.brand),
    model: vehicle.model?.trim() || 'Unknown model',
    category: getCategory(vehicle.vehicleType),
    vehicleType: getVehicleType(vehicle),
    batteryCapacityKwh,
    claimedRangeKm,
    practicalCityRangeKm: Math.round(claimedRangeKm * cityRangeFactor),
    practicalHighwayRangeKm: Math.round(claimedRangeKm * highwayRangeFactor),
    efficiencyKwhPerKm,
    connectorType: getConnectorType(vehicle.chargerType),
    supportsAcCharging: true,
    supportsDcCharging: Boolean(vehicle.dcFastCharging),
    approxPricePkr: toFiniteNumber(vehicle.pricePkr, 0),
    averageRating,
    ratingCount,
  };
}

function isNormalizedVehicle(vehicle: Vehicle | BackendVehicle): vehicle is Vehicle {
  return (
    typeof (vehicle as Vehicle).brand === 'string' &&
    typeof (vehicle as Vehicle).category === 'string' &&
    typeof (vehicle as Vehicle).claimedRangeKm === 'number' &&
    typeof (vehicle as Vehicle).approxPricePkr === 'number' &&
    typeof (vehicle as Vehicle).ratingCount === 'number'
  );
}

function getBrandName(brand: BackendVehicle['brand']) {
  if (typeof brand === 'string') {
    return brand;
  }

  return brand?.name?.trim() || 'Unknown brand';
}

function getCategory(vehicleType: BackendVehicle['vehicleType']): VehicleCategory {
  return vehicleType?.toUpperCase() === 'BIKE' ? 'Bike' : 'Car';
}

function getVehicleType(vehicle: BackendVehicle): VehicleType {
  const variant = vehicle.variant?.trim();
  const normalizedVariant = variant?.toLowerCase();

  if (normalizedVariant === 'sedan') {
    return 'Sedan';
  }

  if (normalizedVariant === 'suv') {
    return 'SUV';
  }

  if (getCategory(vehicle.vehicleType) === 'Bike') {
    return 'Bike';
  }

  return 'Car';
}

function getConnectorType(chargerType: BackendVehicle['chargerType']) {
  if (typeof chargerType === 'string') {
    return chargerType;
  }

  return chargerType?.name?.trim() || 'Unknown';
}

function toFiniteNumber(value: number | null | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getRatingAggregates(vehicle: BackendVehicle) {
  return [
    vehicle.approvedReviewSummary,
    vehicle.approvedReviewRatingSummary,
    vehicle.approvedReviewsSummary,
    vehicle.approvedReviewsRatingSummary,
    vehicle.approvedReviewAggregate,
    vehicle.approvedReviewStats,
    vehicle.approvedRatingSummary,
    vehicle.approvedRatingsSummary,
    vehicle.approvedRatingStats,
    vehicle.ratingSummary,
    vehicle.ratingsSummary,
    vehicle.ratingAggregate,
    vehicle.ratingStats,
    vehicle.reviewSummary,
    vehicle.reviewsSummary,
    vehicle.reviewAggregate,
    vehicle.reviewStats,
    vehicle.vehicleReviewSummary,
  ].filter(isRatingAggregate);
}

function isRatingAggregate(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getAggregateValues(aggregates: Array<Record<string, unknown>>, keys: string[]) {
  return aggregates.flatMap((aggregate) => keys.map((key) => aggregate[key]));
}

function toFirstPositiveWholeNumber(values: unknown[], fallback: number) {
  for (const value of values) {
    const parsedValue = toWholeNumber(value, Number.NaN);

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return fallback;
}

function toWholeNumber(value: unknown, fallback: number) {
  const parsedValue = parseNumericValue(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return Math.floor(parsedValue);
}

function toFirstPositiveRatingValue(values: unknown[], ratingCount: number) {
  if (ratingCount <= 0) {
    return null;
  }

  for (const value of values) {
    const parsedValue = parseNumericValue(value);

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      return Math.min(5, Math.round(parsedValue * 10) / 10);
    }
  }

  return null;
}

function parseNumericValue(value: unknown) {
  return typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
}

function roundToThreeDecimals(value: number) {
  return Math.round(value * 1000) / 1000;
}
