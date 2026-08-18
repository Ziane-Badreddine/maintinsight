"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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
  );
}
