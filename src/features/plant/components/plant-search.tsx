"use client";

import { SearchIcon, XIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { usePlantsFilters } from "../utils/search-params";
import { useTransition } from "react";
import { debounce } from "nuqs";
import { Spinner } from "@/components/ui/spinner";

export function PlantSearch() {
  const [isPending, startTransition] = useTransition();
  const [{ search }, setFilters] = usePlantsFilters({
    startTransition,
    limitUrlUpdates: debounce(300),
  });

  return (
    <InputGroup>
      <InputGroupAddon>
        {isPending ? (
          <Spinner />
        ) : (
          <SearchIcon className="size-4 text-muted-foreground" />
        )}
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Search plants…"
        value={search}
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      {search && (
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFilters(null)}
            aria-label="Clear search"
          >
            <XIcon className="size-4" />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
