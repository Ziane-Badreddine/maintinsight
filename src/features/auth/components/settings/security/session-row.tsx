"use client";

import { Laptop, Smartphone, Tablet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { parseUserAgent } from "../../../lib/parse-user-agent";
import { formatRelativeTime } from "@/lib/utils";
import { useIpLocation } from "../../../hooks/use-ip-location";
import { RevokeSessionButton } from "./sessions-section";

interface SessionRowProps {
  token: string;
  userAgent: string | null | undefined;
  ipAddress: string | null | undefined;
  updatedAt: Date | string;
  isCurrent: boolean;
  onRevoked: () => void;
}

function DeviceIcon({ device }: { device: string }) {
  if (device.startsWith("Mobile")) return <Smartphone className="size-4" />;
  if (device.startsWith("Tablet")) return <Tablet className="size-4" />;
  return <Laptop className="size-10" />;
}

export function SessionRow({
  token,
  userAgent,
  ipAddress,
  updatedAt,
  isCurrent,
  onRevoked,
}: SessionRowProps) {
  const { os, browserLabel } = parseUserAgent(userAgent);
  const { data: geo } = useIpLocation(ipAddress);

  const location =
    geo?.city && geo?.country ? `${geo.city}, ${geo.country}` : null;

  return (
    <Item size="sm" className="px-0 ">
      <ItemMedia variant={"icon"} className="justify-start items-start mb-auto">
        <DeviceIcon device={os.deviceType} />
      </ItemMedia>

      <ItemContent className="gap-0.5">
        <ItemTitle className="flex items-center gap-2">
          {os.label}
          {isCurrent && (
            <Badge variant="secondary" className="text-xs font-normal">
              This device
            </Badge>
          )}
        </ItemTitle>

        <p className="text-sm text-muted-foreground">{browserLabel}</p>

        <p className="text-sm text-muted-foreground">
          {ipAddress}
          {location && <> ({location})</>}
        </p>

        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(updatedAt)}
        </p>
      </ItemContent>

      {!isCurrent && (
        <RevokeSessionButton token={token} onRevoked={onRevoked} />
      )}
    </Item>
  );
}
