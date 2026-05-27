export type MonthlyEvCostInput = {
  dailyKm: number;
  daysPerMonth: number;
  efficiencyKwhPerKm: number;
  electricityUnitPrice: number;
};

export type MonthlyEvCostResult = {
  monthlyKm: number;
  monthlyKwh: number;
  monthlyEvCost: number;
};

export type MonthlyPetrolCostInput = {
  dailyKm: number;
  daysPerMonth: number;
  petrolPricePerLitre: number;
  petrolAverageKmPerLitre: number;
};

export type MonthlyPetrolCostResult = {
  monthlyKm: number;
  litresNeeded: number;
  monthlyPetrolCost: number;
};

export type CostComparisonValidationInput = MonthlyEvCostInput & MonthlyPetrolCostInput;

export type SuitabilityVerdict =
  | 'STRONG_FIT'
  | 'GOOD_WITH_CONDITIONS'
  | 'RISKY'
  | 'NOT_RECOMMENDED';

export type RouteFeasibilityVerdict = 'SAFE' | 'RISKY' | 'NOT_RECOMMENDED';

export type EvBikeSavingsVerdict =
  | 'STRONG_SAVINGS'
  | 'MODEST_SAVINGS'
  | 'LOW_OR_NO_SAVINGS'
  | 'INVALID_INPUT';

export type HomeChargingVehicleType = 'Bike' | 'Car';

export type ManualCostComparisonInput = {
  vehicleType: HomeChargingVehicleType;
  dailyKm: number;
  daysPerMonth: number;
  petrolPricePerLitre: number;
  petrolAverageKmPerLitre: number;
  batteryCapacityKwh: number;
  rangePerFullChargeKm: number;
  electricityUnitPrice: number;
};

export type ManualCostComparisonResult = {
  vehicleType: HomeChargingVehicleType;
  monthlyKm: number;
  evKwhPerKm: number;
  monthlyKwh: number;
  monthlyEvCost: number;
  litresNeeded: number;
  monthlyPetrolCost: number;
  monthlySavings: number;
  yearlySavings: number;
};

export type SuitabilityScoreInput = {
  dailyKm: number;
  practicalRangeKm: number;
  hasHomeCharging: boolean;
  hasSolarAvailable: boolean;
  monthlySavings: number;
  hasCitySupport: boolean;
  needsFrequentIntercityTravel: boolean;
};

export type SuitabilityScoreResult = {
  score: number;
  verdict: SuitabilityVerdict;
  solarBonusPoints: number;
};

export type RouteMatchInput<Route extends RouteCityPair> = {
  routes: Route[];
  fromCity: string;
  toCity: string;
};

export type RouteCityPair = {
  fromCity: string;
  toCity: string;
};

export type RouteFeasibilityInput = {
  distanceKm: number;
  practicalHighwayRangeKm: number;
  currentBatteryPercentage: number;
  reserveBatteryPercentage: number;
};

export type RouteFeasibilityResult = {
  usableBatteryPercentage: number;
  usableRangeKm: number;
  verdict: RouteFeasibilityVerdict;
  chargingRequired: boolean;
};

export type EvBikeSavingsInput = {
  dailyKm: number;
  daysPerMonth: number;
  petrolPricePerLitre: number;
  petrolBikeAverageKmPerLitre: number;
  batteryCapacityKwh: number;
  rangePerFullChargeKm: number;
  electricityUnitPrice: number;
  evBikePurchasePricePkr?: number;
  currentPetrolBikeResaleValuePkr?: number;
};

export type EvBikeSavingsResult = {
  monthlyKm: number;
  litresNeeded: number;
  monthlyPetrolCost: number;
  evKwhPerKm: number;
  monthlyKwh: number;
  monthlyEvCost: number;
  monthlySavings: number;
  yearlySavings: number;
  costPerFullCharge: number;
  fullChargesPerMonth: number;
  netUpgradeCost: number;
  paybackMonths?: number;
  verdict: EvBikeSavingsVerdict;
};

export type HomeChargingCostInput = {
  vehicleType: HomeChargingVehicleType;
  batteryCapacityKwh: number;
  currentBatteryPercentage: number;
  targetBatteryPercentage: number;
  electricityUnitPrice: number;
  chargerPowerKw: number;
  chargingLossPercentage: number;
};

export type HomeChargingCostResult = {
  vehicleType: HomeChargingVehicleType;
  batteryPercentageToCharge: number;
  energyNeededBeforeLoss: number;
  gridEnergyRequiredKwh: number;
  estimatedChargingCost: number;
  estimatedChargingTimeHours: number;
  electricityUnitPrice: number;
};

export type SolarEvChargingInput = {
  vehicleType: HomeChargingVehicleType;
  dailyKm: number;
  daysPerMonth: number;
  batteryCapacityKwh: number;
  rangePerFullChargeKm: number;
  gridElectricityUnitPrice: number;
  solarChargingSharePercentage: number;
  effectiveSolarUnitCost: number;
};

export type SolarEvChargingResult = {
  vehicleType: HomeChargingVehicleType;
  monthlyKm: number;
  evKwhPerKm: number;
  monthlyEnergyNeedKwh: number;
  solarCoveredKwh: number;
  gridRequiredKwh: number;
  fullGridCost: number;
  estimatedBlendedCost: number;
  estimatedMonthlySavings: number;
  estimatedYearlySavings: number;
};

export const routeBatteryValidationMessage =
  'Reserve battery must be lower than current battery to estimate usable range.';

const solarSuitabilityBonusPoints = 5;

const solarSuitabilityNote =
  'Solar availability improves charging independence, but EV cost is still calculated using the entered electricity unit price. Solar cost reduction can be added later when solar charging share is captured.';

const verdictExplanations: Record<SuitabilityVerdict, string> = {
  STRONG_FIT:
    'Your daily range, home charging, and savings assumptions make this EV look practical for routine use.',
  GOOD_WITH_CONDITIONS:
    'This looks workable, but charging access, route planning, or running cost assumptions still deserve a closer check.',
  RISKY:
    'The estimate has some pressure points. Review range buffer, charging access, and intercity needs before relying on this EV.',
  NOT_RECOMMENDED:
    'Based on these inputs, an EV may create too many range, charging, or cost tradeoffs for your current usage.',
};

export function calculateMonthlyEvCost(input: MonthlyEvCostInput): MonthlyEvCostResult {
  const dailyKm = sanitizeNonNegativeNumber(input.dailyKm);
  const daysPerMonth = sanitizeNonNegativeNumber(input.daysPerMonth);
  const efficiencyKwhPerKm = sanitizeNonNegativeNumber(input.efficiencyKwhPerKm);
  const electricityUnitPrice = sanitizeNonNegativeNumber(input.electricityUnitPrice);
  const monthlyKm = dailyKm * daysPerMonth;
  const monthlyKwh = monthlyKm * efficiencyKwhPerKm;
  const monthlyEvCost = monthlyKwh * electricityUnitPrice;

  return {
    monthlyKm,
    monthlyKwh,
    monthlyEvCost,
  };
}

export function calculateMonthlyPetrolCost(
  input: MonthlyPetrolCostInput,
): MonthlyPetrolCostResult {
  const dailyKm = sanitizeNonNegativeNumber(input.dailyKm);
  const daysPerMonth = sanitizeNonNegativeNumber(input.daysPerMonth);
  const petrolPricePerLitre = sanitizeNonNegativeNumber(input.petrolPricePerLitre);
  const petrolAverageKmPerLitre = isPositiveFiniteNumber(input.petrolAverageKmPerLitre)
    ? input.petrolAverageKmPerLitre
    : 0;
  const monthlyKm = dailyKm * daysPerMonth;
  const litresNeeded = petrolAverageKmPerLitre > 0 ? monthlyKm / petrolAverageKmPerLitre : 0;
  const monthlyPetrolCost = litresNeeded * petrolPricePerLitre;

  return {
    monthlyKm,
    litresNeeded,
    monthlyPetrolCost,
  };
}

export function calculateMonthlySavings(evCost: number, petrolCost: number): number {
  return sanitizeFiniteNumber(petrolCost) - sanitizeFiniteNumber(evCost);
}

export function validateCostComparisonInput(
  input: CostComparisonValidationInput,
): string | undefined {
  const validationMessages = validateCostComparisonInputs(input);

  return validationMessages[0];
}

export function validateCostComparisonInputs(
  input: CostComparisonValidationInput,
): string[] {
  const validationMessages: string[] = [];

  if (!isNonNegativeFiniteNumber(input.dailyKm)) {
    validationMessages.push('Daily km must not be negative.');
  }

  if (!Number.isFinite(input.daysPerMonth) || input.daysPerMonth < 1 || input.daysPerMonth > 31) {
    validationMessages.push('Days per month must be between 1 and 31.');
  }

  if (!isNonNegativeFiniteNumber(input.electricityUnitPrice)) {
    validationMessages.push('Electricity unit price must not be negative.');
  }

  if (!isNonNegativeFiniteNumber(input.petrolPricePerLitre)) {
    validationMessages.push('Petrol price per litre must not be negative.');
  }

  if (!isPositiveFiniteNumber(input.petrolAverageKmPerLitre)) {
    validationMessages.push('Petrol vehicle average km per litre must be greater than 0.');
  }

  return validationMessages;
}

export function calculateManualCostComparison(
  input: ManualCostComparisonInput,
): ManualCostComparisonResult {
  const dailyKm = sanitizeNonNegativeNumber(input.dailyKm);
  const daysPerMonth = sanitizeNonNegativeNumber(input.daysPerMonth);
  const petrolPricePerLitre = sanitizeNonNegativeNumber(input.petrolPricePerLitre);
  const petrolAverageKmPerLitre = isPositiveFiniteNumber(input.petrolAverageKmPerLitre)
    ? input.petrolAverageKmPerLitre
    : 0;
  const batteryCapacityKwh = isPositiveFiniteNumber(input.batteryCapacityKwh)
    ? input.batteryCapacityKwh
    : 0;
  const rangePerFullChargeKm = isPositiveFiniteNumber(input.rangePerFullChargeKm)
    ? input.rangePerFullChargeKm
    : 0;
  const electricityUnitPrice = sanitizeNonNegativeNumber(input.electricityUnitPrice);
  const monthlyKm = dailyKm * daysPerMonth;
  const evKwhPerKm =
    batteryCapacityKwh > 0 && rangePerFullChargeKm > 0
      ? batteryCapacityKwh / rangePerFullChargeKm
      : 0;
  const monthlyKwh = monthlyKm * evKwhPerKm;
  const monthlyEvCost = monthlyKwh * electricityUnitPrice;
  const litresNeeded =
    petrolAverageKmPerLitre > 0 ? monthlyKm / petrolAverageKmPerLitre : 0;
  const monthlyPetrolCost = litresNeeded * petrolPricePerLitre;
  const monthlySavings = monthlyPetrolCost - monthlyEvCost;

  return {
    vehicleType: input.vehicleType,
    monthlyKm,
    evKwhPerKm,
    monthlyKwh,
    monthlyEvCost,
    litresNeeded,
    monthlyPetrolCost,
    monthlySavings,
    yearlySavings: monthlySavings * 12,
  };
}

export function validateManualCostComparisonInput(
  input: ManualCostComparisonInput,
): string[] {
  const validationMessages: string[] = [];

  if (!isNonNegativeFiniteNumber(input.dailyKm)) {
    validationMessages.push('Daily km must not be negative.');
  }

  if (!Number.isFinite(input.daysPerMonth) || input.daysPerMonth < 1 || input.daysPerMonth > 31) {
    validationMessages.push('Days per month must be between 1 and 31.');
  }

  if (!isNonNegativeFiniteNumber(input.petrolPricePerLitre)) {
    validationMessages.push('Petrol price per litre must not be negative.');
  }

  if (!isPositiveFiniteNumber(input.petrolAverageKmPerLitre)) {
    validationMessages.push('Petrol average km/l must be greater than 0.');
  }

  if (!isPositiveFiniteNumber(input.batteryCapacityKwh)) {
    validationMessages.push('Battery capacity kWh must be greater than 0.');
  }

  if (!isPositiveFiniteNumber(input.rangePerFullChargeKm)) {
    validationMessages.push('Range per full charge km must be greater than 0.');
  }

  if (!isNonNegativeFiniteNumber(input.electricityUnitPrice)) {
    validationMessages.push('Electricity unit price must not be negative.');
  }

  return validationMessages;
}

export function calculateEvBikeSavings(input: EvBikeSavingsInput): EvBikeSavingsResult {
  const dailyKm = sanitizeNonNegativeNumber(input.dailyKm);
  const daysPerMonth = sanitizeNonNegativeNumber(input.daysPerMonth);
  const petrolPricePerLitre = sanitizeNonNegativeNumber(input.petrolPricePerLitre);
  const petrolBikeAverageKmPerLitre = isPositiveFiniteNumber(input.petrolBikeAverageKmPerLitre)
    ? input.petrolBikeAverageKmPerLitre
    : 0;
  const batteryCapacityKwh = isPositiveFiniteNumber(input.batteryCapacityKwh)
    ? input.batteryCapacityKwh
    : 0;
  const rangePerFullChargeKm = isPositiveFiniteNumber(input.rangePerFullChargeKm)
    ? input.rangePerFullChargeKm
    : 0;
  const electricityUnitPrice = sanitizeNonNegativeNumber(input.electricityUnitPrice);
  const evBikePurchasePricePkr = sanitizeNonNegativeNumber(input.evBikePurchasePricePkr ?? 0);
  const currentPetrolBikeResaleValuePkr = sanitizeNonNegativeNumber(
    input.currentPetrolBikeResaleValuePkr ?? 0,
  );

  const monthlyKm = dailyKm * daysPerMonth;
  const litresNeeded =
    petrolBikeAverageKmPerLitre > 0 ? monthlyKm / petrolBikeAverageKmPerLitre : 0;
  const monthlyPetrolCost = litresNeeded * petrolPricePerLitre;
  const evKwhPerKm =
    batteryCapacityKwh > 0 && rangePerFullChargeKm > 0
      ? batteryCapacityKwh / rangePerFullChargeKm
      : 0;
  const monthlyKwh = monthlyKm * evKwhPerKm;
  const monthlyEvCost = monthlyKwh * electricityUnitPrice;
  const monthlySavings = monthlyPetrolCost - monthlyEvCost;
  const yearlySavings = monthlySavings * 12;
  const costPerFullCharge = batteryCapacityKwh * electricityUnitPrice;
  const fullChargesPerMonth = batteryCapacityKwh > 0 ? monthlyKwh / batteryCapacityKwh : 0;
  const netUpgradeCost = Math.max(evBikePurchasePricePkr - currentPetrolBikeResaleValuePkr, 0);
  const paybackMonths =
    monthlySavings > 0 && netUpgradeCost > 0 ? netUpgradeCost / monthlySavings : undefined;

  return {
    monthlyKm,
    litresNeeded,
    monthlyPetrolCost,
    evKwhPerKm,
    monthlyKwh,
    monthlyEvCost,
    monthlySavings,
    yearlySavings,
    costPerFullCharge,
    fullChargesPerMonth,
    netUpgradeCost,
    paybackMonths,
    verdict: getEvBikeSavingsVerdict(monthlySavings, paybackMonths),
  };
}

export function validateEvBikeSavingsInput(input: EvBikeSavingsInput): string[] {
  const validationMessages: string[] = [];

  if (!isNonNegativeFiniteNumber(input.dailyKm)) {
    validationMessages.push('Daily km must not be negative.');
  }

  if (!Number.isFinite(input.daysPerMonth) || input.daysPerMonth < 1 || input.daysPerMonth > 31) {
    validationMessages.push('Days per month must be between 1 and 31.');
  }

  if (!isNonNegativeFiniteNumber(input.petrolPricePerLitre)) {
    validationMessages.push('Petrol price per litre must not be negative.');
  }

  if (!isPositiveFiniteNumber(input.petrolBikeAverageKmPerLitre)) {
    validationMessages.push('Petrol bike average km per litre must be greater than 0.');
  }

  if (!isPositiveFiniteNumber(input.batteryCapacityKwh)) {
    validationMessages.push('EV bike battery capacity kWh must be greater than 0.');
  }

  if (!isPositiveFiniteNumber(input.rangePerFullChargeKm)) {
    validationMessages.push('EV bike range per full charge km must be greater than 0.');
  }

  if (!isNonNegativeFiniteNumber(input.electricityUnitPrice)) {
    validationMessages.push('Electricity unit price must not be negative.');
  }

  if (
    input.evBikePurchasePricePkr !== undefined &&
    !isNonNegativeFiniteNumber(input.evBikePurchasePricePkr)
  ) {
    validationMessages.push('EV bike purchase price PKR must not be negative.');
  }

  if (
    input.currentPetrolBikeResaleValuePkr !== undefined &&
    !isNonNegativeFiniteNumber(input.currentPetrolBikeResaleValuePkr)
  ) {
    validationMessages.push('Current petrol bike resale value PKR must not be negative.');
  }

  return validationMessages;
}

export function calculateHomeChargingCost(
  input: HomeChargingCostInput,
): HomeChargingCostResult {
  const batteryCapacityKwh = isPositiveFiniteNumber(input.batteryCapacityKwh)
    ? input.batteryCapacityKwh
    : 0;
  const currentBatteryPercentage = clampPercentage(input.currentBatteryPercentage);
  const targetBatteryPercentage = clampPercentage(input.targetBatteryPercentage);
  const electricityUnitPrice = sanitizeNonNegativeNumber(input.electricityUnitPrice);
  const chargerPowerKw = isPositiveFiniteNumber(input.chargerPowerKw) ? input.chargerPowerKw : 0;
  const chargingLossPercentage = isPercentageUpTo(input.chargingLossPercentage, 50)
    ? input.chargingLossPercentage
    : 0;
  const batteryPercentageToCharge = Math.max(
    targetBatteryPercentage - currentBatteryPercentage,
    0,
  );
  const energyNeededBeforeLoss = (batteryCapacityKwh * batteryPercentageToCharge) / 100;
  const chargingLossMultiplier = 1 + chargingLossPercentage / 100;
  const gridEnergyRequiredKwh = energyNeededBeforeLoss * chargingLossMultiplier;
  const estimatedChargingCost = gridEnergyRequiredKwh * electricityUnitPrice;
  const estimatedChargingTimeHours =
    chargerPowerKw > 0 ? gridEnergyRequiredKwh / chargerPowerKw : 0;

  return {
    vehicleType: input.vehicleType,
    batteryPercentageToCharge,
    energyNeededBeforeLoss,
    gridEnergyRequiredKwh,
    estimatedChargingCost,
    estimatedChargingTimeHours,
    electricityUnitPrice,
  };
}

export function validateHomeChargingCostInput(input: HomeChargingCostInput): string[] {
  const validationMessages: string[] = [];

  if (!isPositiveFiniteNumber(input.batteryCapacityKwh)) {
    validationMessages.push('Battery capacity must be greater than 0.');
  }

  if (!isPercentage(input.currentBatteryPercentage)) {
    validationMessages.push('Current battery percentage must be between 0 and 100.');
  }

  if (!isPercentage(input.targetBatteryPercentage)) {
    validationMessages.push('Target battery percentage must be between 0 and 100.');
  }

  if (
    isPercentage(input.currentBatteryPercentage) &&
    isPercentage(input.targetBatteryPercentage) &&
    input.targetBatteryPercentage <= input.currentBatteryPercentage
  ) {
    validationMessages.push('Target battery percentage must be greater than current battery percentage.');
  }

  if (!isNonNegativeFiniteNumber(input.electricityUnitPrice)) {
    validationMessages.push('Electricity unit price must not be negative.');
  }

  if (!isPositiveFiniteNumber(input.chargerPowerKw)) {
    validationMessages.push('Charger power must be greater than 0.');
  }

  if (!isPercentageUpTo(input.chargingLossPercentage, 50)) {
    validationMessages.push('Charging loss percentage must be between 0 and 50.');
  }

  return validationMessages;
}

export function calculateSolarEvCharging(input: SolarEvChargingInput): SolarEvChargingResult {
  const dailyKm = sanitizeNonNegativeNumber(input.dailyKm);
  const daysPerMonth = sanitizeNonNegativeNumber(input.daysPerMonth);
  const batteryCapacityKwh = isPositiveFiniteNumber(input.batteryCapacityKwh)
    ? input.batteryCapacityKwh
    : 0;
  const rangePerFullChargeKm = isPositiveFiniteNumber(input.rangePerFullChargeKm)
    ? input.rangePerFullChargeKm
    : 0;
  const gridElectricityUnitPrice = sanitizeNonNegativeNumber(input.gridElectricityUnitPrice);
  const solarChargingSharePercentage = isPercentage(input.solarChargingSharePercentage)
    ? input.solarChargingSharePercentage
    : 0;
  const effectiveSolarUnitCost = sanitizeNonNegativeNumber(input.effectiveSolarUnitCost);
  const monthlyKm = dailyKm * daysPerMonth;
  const evKwhPerKm =
    batteryCapacityKwh > 0 && rangePerFullChargeKm > 0
      ? batteryCapacityKwh / rangePerFullChargeKm
      : 0;
  const monthlyEnergyNeedKwh = monthlyKm * evKwhPerKm;
  const solarCoveredKwh = (monthlyEnergyNeedKwh * solarChargingSharePercentage) / 100;
  const gridRequiredKwh = monthlyEnergyNeedKwh - solarCoveredKwh;
  const fullGridCost = monthlyEnergyNeedKwh * gridElectricityUnitPrice;
  const solarCoveredCost = solarCoveredKwh * effectiveSolarUnitCost;
  const remainingGridCost = gridRequiredKwh * gridElectricityUnitPrice;
  const estimatedBlendedCost = solarCoveredCost + remainingGridCost;
  const estimatedMonthlySavings = fullGridCost - estimatedBlendedCost;

  return {
    vehicleType: input.vehicleType,
    monthlyKm,
    evKwhPerKm,
    monthlyEnergyNeedKwh,
    solarCoveredKwh,
    gridRequiredKwh,
    fullGridCost,
    estimatedBlendedCost,
    estimatedMonthlySavings,
    estimatedYearlySavings: estimatedMonthlySavings * 12,
  };
}

export function validateSolarEvChargingInput(input: SolarEvChargingInput): string[] {
  const validationMessages: string[] = [];

  if (!isNonNegativeFiniteNumber(input.dailyKm)) {
    validationMessages.push('Daily km must not be negative.');
  }

  if (!Number.isFinite(input.daysPerMonth) || input.daysPerMonth < 1 || input.daysPerMonth > 31) {
    validationMessages.push('Days per month must be between 1 and 31.');
  }

  if (!isPositiveFiniteNumber(input.batteryCapacityKwh)) {
    validationMessages.push('Battery capacity kWh must be greater than 0.');
  }

  if (!isPositiveFiniteNumber(input.rangePerFullChargeKm)) {
    validationMessages.push('Range per full charge km must be greater than 0.');
  }

  if (!isNonNegativeFiniteNumber(input.gridElectricityUnitPrice)) {
    validationMessages.push('Grid electricity unit price must not be negative.');
  }

  if (!isPercentage(input.solarChargingSharePercentage)) {
    validationMessages.push('Solar charging share percentage must be between 0 and 100.');
  }

  if (!isNonNegativeFiniteNumber(input.effectiveSolarUnitCost)) {
    validationMessages.push('Effective solar unit cost must not be negative.');
  }

  return validationMessages;
}

export function calculateSuitabilityScore(
  input: SuitabilityScoreInput,
): SuitabilityScoreResult {
  let score = 0;
  const solarBonusPoints = input.hasSolarAvailable ? solarSuitabilityBonusPoints : 0;
  const dailyKm = sanitizeNonNegativeNumber(input.dailyKm);
  const practicalRangeKm = sanitizeNonNegativeNumber(input.practicalRangeKm);
  const monthlySavings = sanitizeFiniteNumber(input.monthlySavings);

  if (dailyKm <= practicalRangeKm) {
    score += 35;
  }

  if (input.hasHomeCharging) {
    score += 25;
  }

  if (monthlySavings > 0) {
    score += 20;
  }

  if (input.hasCitySupport) {
    score += 10;
  }

  if (!input.needsFrequentIntercityTravel) {
    score += 10;
  }

  score = Math.min(score + solarBonusPoints, 100);

  return {
    score,
    verdict: getSuitabilityVerdict(score),
    solarBonusPoints,
  };
}

export function getSuitabilityVerdictExplanation(
  verdict: SuitabilityVerdict,
  hasSolarAvailable: boolean,
): string {
  if (!hasSolarAvailable) {
    return verdictExplanations[verdict];
  }

  return `${verdictExplanations[verdict]} ${solarSuitabilityNote}`;
}

export function findMatchingRoute<Route extends RouteCityPair>(
  input: RouteMatchInput<Route>,
): Route | undefined {
  return input.routes.find(
    (route) =>
      isSameCityPair(route.fromCity, input.fromCity) &&
      isSameCityPair(route.toCity, input.toCity),
  ) ?? input.routes.find(
    (route) =>
      isSameCityPair(route.fromCity, input.toCity) &&
      isSameCityPair(route.toCity, input.fromCity),
  );
}

export function calculateRouteFeasibility(
  input: RouteFeasibilityInput,
): RouteFeasibilityResult {
  const currentBatteryPercentage = clampPercentage(input.currentBatteryPercentage);
  const reserveBatteryPercentage = clampPercentage(input.reserveBatteryPercentage);
  const practicalHighwayRangeKm = sanitizeNonNegativeNumber(input.practicalHighwayRangeKm);
  const distanceKm = sanitizeNonNegativeNumber(input.distanceKm);
  const usableBatteryPercentage = Math.max(
    currentBatteryPercentage - reserveBatteryPercentage,
    0,
  );
  const usableRangeKm = (practicalHighwayRangeKm * usableBatteryPercentage) / 100;
  const verdict = getRouteFeasibilityVerdict(distanceKm, usableRangeKm);

  return {
    usableBatteryPercentage,
    usableRangeKm,
    verdict,
    chargingRequired: verdict !== 'SAFE',
  };
}

export function validateRouteFeasibilityInput(
  input: RouteFeasibilityInput,
): string | undefined {
  if (!isPercentage(input.currentBatteryPercentage)) {
    return 'Current battery percentage must be between 0 and 100.';
  }

  if (!isPercentage(input.reserveBatteryPercentage)) {
    return 'Reserve battery percentage must be between 0 and 100.';
  }

  if (input.reserveBatteryPercentage >= input.currentBatteryPercentage) {
    return routeBatteryValidationMessage;
  }

  return undefined;
}

export function getRouteFeasibilityExplanation(verdict: RouteFeasibilityVerdict): string {
  if (verdict === 'SAFE') {
    return 'This trip looks feasible on the entered battery and reserve assumptions, with a practical range buffer remaining.';
  }

  if (verdict === 'RISKY') {
    return 'This trip is close to the available range. Plan a charging stop or increase your starting battery before relying on this estimate.';
  }

  return 'This trip is not recommended on the entered battery and reserve assumptions. Charging should be planned before departure.';
}

export function getEvBikeSavingsVerdictExplanation(verdict: EvBikeSavingsVerdict): string {
  if (verdict === 'STRONG_SAVINGS') {
    return 'This looks like a strong savings case, with meaningful monthly savings and a reasonable payback period.';
  }

  if (verdict === 'MODEST_SAVINGS') {
    return 'This shows positive savings, but the payback period may be longer. Check purchase price, battery warranty, and maintenance assumptions.';
  }

  if (verdict === 'LOW_OR_NO_SAVINGS') {
    return 'This does not show clear monthly savings on the entered assumptions. Review fuel economy, electricity price, and expected daily distance.';
  }

  return 'Please fix the inputs before viewing an EV bike savings verdict.';
}

function getSuitabilityVerdict(score: number): SuitabilityVerdict {
  if (score >= 80) {
    return 'STRONG_FIT';
  }

  if (score >= 60) {
    return 'GOOD_WITH_CONDITIONS';
  }

  if (score >= 40) {
    return 'RISKY';
  }

  return 'NOT_RECOMMENDED';
}

function getRouteFeasibilityVerdict(
  distanceKm: number,
  usableRangeKm: number,
): RouteFeasibilityVerdict {
  if (usableRangeKm >= distanceKm) {
    return 'SAFE';
  }

  if (usableRangeKm >= distanceKm * 0.85) {
    return 'RISKY';
  }

  return 'NOT_RECOMMENDED';
}

function getEvBikeSavingsVerdict(
  monthlySavings: number,
  paybackMonths: number | undefined,
): EvBikeSavingsVerdict {
  if (monthlySavings <= 0) {
    return 'LOW_OR_NO_SAVINGS';
  }

  if (monthlySavings >= 3000 && paybackMonths !== undefined && paybackMonths <= 36) {
    return 'STRONG_SAVINGS';
  }

  return 'MODEST_SAVINGS';
}

function isSameCityPair(firstCity: string, secondCity: string): boolean {
  return firstCity.trim().toLowerCase() === secondCity.trim().toLowerCase();
}

function sanitizeFiniteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function sanitizeNonNegativeNumber(value: number): number {
  return isNonNegativeFiniteNumber(value) ? value : 0;
}

function isNonNegativeFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isPercentage(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function isPercentageUpTo(value: number, max: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= max;
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
}
