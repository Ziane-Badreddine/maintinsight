// src/features/dashboard/components/workshops-overview-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WorkshopsOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <StatCardsSkeleton />

      <ChartSkeleton />

      <WorkshopsDataTableSkeleton />
    </div>
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );
}

function WorkshopsDataTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-64" />

      <div className="overflow-hidden rounded-t-2xl rounded-b-xl outline-4 outline-input/30">
        <div className="bg-input/30 h-12 flex items-center gap-4 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="h-14 flex items-center gap-4 px-4 border-t"
          >
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
