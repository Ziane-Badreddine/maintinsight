import { queryOptions } from "@tanstack/react-query";

import { getInspection } from "../actions/get-inspection";

export function inspectionDetailQueryOptions(inspectionId: number) {
  return queryOptions({
    queryKey: ["inspection", inspectionId],
    queryFn: async () => {
      const result = await getInspection(inspectionId);
      if (!result.success) {
        throw new Error(String(result.error));
      }
      return result.inspection;
    },
  });
}
