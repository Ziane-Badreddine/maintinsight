"use client";

import { ChevronRightIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InspectionListItemProps {
  title: string;
  subtitle?: string | null;
  meta?: React.ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  removeDisabled?: boolean;
  statusClassName?: string;
  className?: string;
}

export function InspectionListItem({
  title,
  subtitle,
  meta,
  onClick,
  onRemove,
  disabled = false,
  removeDisabled = false,
  statusClassName,
  className,
}: InspectionListItemProps) {
  const Comp = onClick ? "button" : "div";

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border transition-colors",
        statusClassName,
        className,
      )}
    >
      <Comp
        type={onClick ? "button" : undefined}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 p-3 text-left",
          onClick && !disabled && "hover:bg-black/5 dark:hover:bg-white/5",
          disabled && "opacity-60",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          {subtitle ? (
            <p className="truncate text-sm opacity-80">{subtitle}</p>
          ) : null}
          {meta ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {meta}
            </div>
          ) : null}
        </div>
        {onClick ? (
          <ChevronRightIcon className="size-4 shrink-0 opacity-60" />
        ) : null}
      </Comp>

      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={removeDisabled}
          className="me-1 shrink-0 text-destructive hover:text-destructive"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <Trash2Icon className="size-4" />
          <span className="sr-only">Remove</span>
        </Button>
      ) : null}
    </div>
  );
}
