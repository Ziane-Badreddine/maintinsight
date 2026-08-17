// features/plant/search-params/inspection-history.ts
import {
  createLoader,
  parseAsString,
  type Options,
  type UrlKeys,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const inspectionHistorySearchParams = {
  from: parseAsString,
  to: parseAsString,
};

const urlKeys: UrlKeys<typeof inspectionHistorySearchParams> = {
  from: "inspectionFrom",
  to: "inspectionTo",
};

export const loadInspectionHistorySearchParams = createLoader(
  inspectionHistorySearchParams,
  { urlKeys },
);

export const useInspectionHistoryFilters = (options: Options = {}) =>
  useQueryStates(inspectionHistorySearchParams, {
    ...options,
    shallow: false,
    urlKeys,
  });
