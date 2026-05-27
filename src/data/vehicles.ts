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
  };
}

function isNormalizedVehicle(vehicle: Vehicle | BackendVehicle): vehicle is Vehicle {
  return (
    typeof (vehicle as Vehicle).brand === 'string' &&
    typeof (vehicle as Vehicle).category === 'string' &&
    typeof (vehicle as Vehicle).claimedRangeKm === 'number' &&
    typeof (vehicle as Vehicle).approxPricePkr === 'number'
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

function roundToThreeDecimals(value: number) {
  return Math.round(value * 1000) / 1000;
}
