"use client";

import { useTransition } from "react";
import { debounce } from "nuqs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { X, Search, Loader2 } from "lucide-react";
import { useSessionsFilters } from "./searchParams";

export function SessionsToolbar() {
  const [isPending, startTransition] = useTransition();
  const [{ search }, setFilters] = useSessionsFilters({ startTransition });

  const hasFilters = search !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <InputGroup className="w-full md:w-64">
        <InputGroupInput
          placeholder="Search by email..."
          value={search}
          onChange={(e) =>
            setFilters(
              { search: e.target.value || null, page: 1 },
              { limitUrlUpdates: debounce(300) },
            )
          }
          disabled={isPending}
        />
        <InputGroupAddon>
          {isPending ? (
            <Loader2 className="animate-spin text-muted-foreground" />
          ) : search ? (
            <InputGroupButton
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => setFilters({ search: null, page: 1 })}
              aria-label="Clear search"
            >
              <X />
            </InputGroupButton>
          ) : (
            <Search className="text-muted-foreground" />
          )}
        </InputGroupAddon>
      </InputGroup>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="outline"
          className="h-9 px-2"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setFilters({ search: null, page: 1 });
            })
          }
        >
          <X className="size-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
