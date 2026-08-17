// features/global/search-params/workshops-overview.ts
import { createLoader, parseAsInteger, type Options } from "nuqs/server";
import { useQueryStates } from "nuqs";

export const workshopsOverviewSearchParams = {
  workshopPlantId: parseAsInteger,
};

export const loadWorkshopsOverviewSearchParams = createLoader(
  workshopsOverviewSearchParams,
);

export const useWorkshopsOverviewFilters = (options: Options = {}) =>
  useQueryStates(workshopsOverviewSearchParams, {
    ...options,
    shallow: false,
  });
