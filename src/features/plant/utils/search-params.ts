import {
  createLoader,
  parseAsString,
  type Options,
  type UrlKeys,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const plantsSearchParams = {
  search: parseAsString.withDefault(""),
};

const urlKeys: UrlKeys<typeof plantsSearchParams> = {
  search: "q",
};

// Server — used in page.tsx to parse searchParams
export const loadPlantsSearchParams = createLoader(plantsSearchParams, {
  urlKeys,
});

// Client — used in toolbar (shallow=false → triggers server re-render)
export const usePlantsFilters = (options: Options = {}) =>
  useQueryStates(plantsSearchParams, { ...options, shallow: false, urlKeys });
