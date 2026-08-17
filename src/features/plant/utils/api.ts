import { api } from "@/lib/axios";
import { queryOptions } from "@tanstack/react-query";
import { Plant } from "../../../../prisma/generated/prisma/client";

export async function fetchPlantsByCity(cityId: string): Promise<Plant[]> {
  const { data } = await api.get<Plant[]>(`/cities/${cityId}/plants`);
  return data;
}

export const plantsByCityQueryOptions = (cityId: string) =>
  queryOptions({
    queryKey: ["plants", cityId],
    queryFn: () => fetchPlantsByCity(cityId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(cityId),
  });
