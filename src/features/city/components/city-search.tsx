"use client";

import { debounce } from "nuqs";
import { SearchIcon, XIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useCitiesFilters } from "../utils/search-params";
import { Spinner } from "@/components/ui/spinner";

export function CitySearch() {
  const [isPending, startTransition] = useTransition();
  const [{ search }, setCitiesFilters] = useCitiesFilters({
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
        placeholder="Search cities…"
        value={search}
        onChange={(e) =>
          setCitiesFilters({
            search: e.target.value,
          })
        }
      />
      {search && (
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCitiesFilters(null)}
            aria-label="Clear search"
          >
            <XIcon className="size-4" />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
