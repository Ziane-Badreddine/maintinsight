"use client";

import { useQuery } from "@tanstack/react-query";
import { getIpLocation } from "../actions/get-ip-location";

export function useIpLocation(ip: string | null | undefined) {
  return useQuery({
    queryKey: ["ip-location", ip],
    queryFn: () => getIpLocation(ip as string),
    enabled: Boolean(ip),
    staleTime: 60 * 60 * 1000, // 1h — la géoloc d'une IP ne change pas souvent
  });
}
