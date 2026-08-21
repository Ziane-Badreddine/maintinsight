import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NewCityDialog } from "@/features/city/components/new-city-dialog";
import { CitySearch } from "@/features/city/components/city-search";
import {
  CitiesGrid,
  CitiesGridSkeleton,
} from "@/features/city/components/city-card";
import { loadCitiesSearchParams } from "@/features/city/utils/search-params";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { search } = await loadCitiesSearchParams(searchParams);
  const { success: canCreateCity } = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        city: ["create"],
      },
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Industrial sites</h1>
          <p className="text-muted-foreground text-sm">
            Select a site to access its plants
          </p>
        </div>
        {canCreateCity && (
          <NewCityDialog>
            <Button>
              <PlusIcon className="size-4" />
              New city
            </Button>
          </NewCityDialog>
        )}
      </div>

      <div className="mb-6 max-w-sm">
        <CitySearch />
      </div>

      <Suspense fallback={<CitiesGridSkeleton />}>
        <CitiesGrid query={search} />
      </Suspense>
    </div>
  );
}
