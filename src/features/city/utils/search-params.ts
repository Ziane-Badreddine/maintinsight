import {
  createLoader,
  parseAsString,
  type Options,
  type UrlKeys,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const citiesSearchParams = {
  search: parseAsString.withDefault(""),
};

const urlKeys: UrlKeys<typeof citiesSearchParams> = {
  search: "q",
};

// Server — used in page.tsx to parse searchParams
export const loadCitiesSearchParams = createLoader(citiesSearchParams, {
  urlKeys,
});

// Client — used in toolbar, table (shallow=false → triggers server re-render)
export const useCitiesFilters = (options: Options = {}) =>
  useQueryStates(citiesSearchParams, { ...options, shallow: false, urlKeys });
