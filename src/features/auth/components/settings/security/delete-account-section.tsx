"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useLinkedAccounts } from "../../../hooks/use-linked-accounts";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { DeleteAccountEmailDialog } from "./delete-account-email-dialog";

export function DeleteAccountSection() {
  const { data: accounts, isLoading } = useLinkedAccounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasPassword = (accounts ?? []).some(
    (a) => a.providerId === "credential",
  );

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 ">
      <Item className="px-0">
        <ItemMedia>
          <TriangleAlert className="size-10 text-destructive" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Delete account</ItemTitle>
          <ItemDescription>
            Permanently delete your account and all of its data. This action
            cannot be undone.
          </ItemDescription>
        </ItemContent>
      </Item>

      <div className="mb-4 flex justify-end">
        {hasPassword ? <DeleteAccountDialog /> : <DeleteAccountEmailDialog />}
      </div>
    </div>
  );
}
