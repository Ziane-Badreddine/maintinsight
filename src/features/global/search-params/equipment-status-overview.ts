// features/global/search-params/equipment-status-overview.ts
import { createLoader, parseAsInteger, type Options } from "nuqs/server";
import { useQueryStates } from "nuqs";

export const equipmentStatusOverviewSearchParams = {
  equipmentPlantId: parseAsInteger,
};

export const loadEquipmentStatusOverviewSearchParams = createLoader(
  equipmentStatusOverviewSearchParams,
);

export const useEquipmentStatusOverviewFilters = (options: Options = {}) =>
  useQueryStates(equipmentStatusOverviewSearchParams, {
    ...options,
    shallow: false,
  });
