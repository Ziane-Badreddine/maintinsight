// components/dashboard/city-header-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function CityHeaderSkeleton() {
  return (
    <>
      <header className="flex h-[64.8px] shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex h-12 w-full shrink-0 items-center gap-4 border-b px-3.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
    </>
  );
}
