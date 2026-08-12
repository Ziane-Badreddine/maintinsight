// features/global/search-params/status-history.ts
import {
  createLoader,
  parseAsString,
  type Options,
  type UrlKeys,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const statusHistorySearchParams = {
  from: parseAsString,
  to: parseAsString,
};

const urlKeys: UrlKeys<typeof statusHistorySearchParams> = {
  from: "historyFrom",
  to: "historyTo",
};

export const loadStatusHistorySearchParams = createLoader(
  statusHistorySearchParams,
  { urlKeys },
);

export const useStatusHistoryFilters = (options: Options = {}) =>
  useQueryStates(statusHistorySearchParams, {
    ...options,
    shallow: false,
    urlKeys,
  });
