"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  useHotkey("R", () => {
    handleRefresh();
  });

  function handleRefresh() {
    setSpinning(true);
    startTransition(() => {
      // Revalide le cache client (cities/plants du sidebar & breadcrumb)
      queryClient.invalidateQueries();
      // Revalide les Server Components (données de la page courante)
      router.refresh();
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isPending}
            aria-label="Refresh"
            className={"rounded-full"}
          >
            <RefreshCwIcon
              className={`size-4 ${isPending || spinning ? "animate-spin" : ""}`}
              onAnimationIteration={() => isPending || setSpinning(false)}
            />
          </Button>
        }
      />
      <TooltipContent>
        Refresh <Kbd>R</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
