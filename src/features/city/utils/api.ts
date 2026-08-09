import { api } from "@/lib/axios";
import { queryOptions } from "@tanstack/react-query";
import { City } from "../../../../prisma/generated/prisma/client";

async function fetchCities(): Promise<City[]> {
  const { data } = await api.get<City[]>("/cities");
  return data;
}

export const citiesQueryOptions = queryOptions({
  queryKey: ["cities"],
  queryFn: fetchCities,
  staleTime: 5 * 60 * 1000, // cities barely change
});
