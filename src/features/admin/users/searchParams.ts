import {
  createLoader,
  parseAsInteger,
  parseAsString,
  type Options,
  type UrlKeys,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const usersSearchParams = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  role: parseAsString.withDefault("all"),
  status: parseAsString.withDefault("all"),
};

const urlKeys: UrlKeys<typeof usersSearchParams> = {
  search: "q",
  page: "p",
  role: "role",
  status: "status",
};

// Server — used in page.tsx to parse searchParams
export const loadUsersSearchParams = createLoader(usersSearchParams, {
  urlKeys,
});

// Client — used in toolbar, table (shallow=false → triggers server re-render)
export const useUsersFilters = (options: Options = {}) =>
  useQueryStates(usersSearchParams, { ...options, shallow: false, urlKeys });

export const PAGE_SIZE = 20;
