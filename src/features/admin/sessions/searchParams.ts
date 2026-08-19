import {
  createLoader,
  parseAsInteger,
  parseAsString,
  type Options,
  type UrlKeys,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const sessionsSearchParams = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

const urlKeys: UrlKeys<typeof sessionsSearchParams> = {
  search: "q",
  page: "p",
};

// Server — used in page.tsx to parse searchParams
export const loadSessionsSearchParams = createLoader(sessionsSearchParams, {
  urlKeys,
});

// Client — used in toolbar, table (shallow=false → triggers server re-render)
export const useSessionsFilters = (options: Options = {}) =>
  useQueryStates(sessionsSearchParams, { ...options, shallow: false, urlKeys });

export const PAGE_SIZE = 20;
