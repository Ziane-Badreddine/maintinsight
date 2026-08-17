import { queryOptions } from "@tanstack/react-query";

import {
  searchEquipmentForInspection,
  type EquipmentSearchOption,
} from "../actions/search-equipment";

function stableExcludeKey(excludeIds: number[]) {
  return [...excludeIds].sort((a, b) => a - b).join(",");
}

async function fetchEquipmentForInspection(
  query: string,
  excludeIds: number[],
): Promise<EquipmentSearchOption[]> {
  const result = await searchEquipmentForInspection(query, excludeIds);
  if (!result.success) {
    throw new Error(String(result.error));
  }
  return result.equipments;
}

export function equipmentSearchQueryOptions(
  query: string,
  excludeIds: number[],
) {
  return queryOptions({
    queryKey: ["inspection-equipment-search", query, stableExcludeKey(excludeIds)],
    queryFn: () => fetchEquipmentForInspection(query, excludeIds),
    staleTime: 30_000,
  });
}
