"use client";

import { Fingerprint } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatRelativeTime } from "@/lib/utils";
import { PasskeyActionsMenu } from "./passkey-actions-menu";

interface PasskeyRowProps {
  id: string;
  name: string | null;
  createdAt: Date | string;
  deviceType: string;
}

export function PasskeyRow({
  id,
  name,
  createdAt,
  deviceType,
}: PasskeyRowProps) {
  return (
    <Item className="px-0">
      <ItemMedia>
        <Fingerprint className="size-4" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{name || "Unnamed passkey"}</ItemTitle>
        <ItemDescription>
          {deviceType} · Added {formatRelativeTime(createdAt)}
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <PasskeyActionsMenu id={id} currentName={name} />
      </ItemActions>
    </Item>
  );
}
