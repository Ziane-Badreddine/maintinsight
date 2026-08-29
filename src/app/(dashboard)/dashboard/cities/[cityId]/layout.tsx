import type { Metadata } from "next";

import { notFound } from "next/navigation";

import Header from "@/features/dashboard/components/header";
import { cache } from "react";
import { getCityOverview } from "@/features/global/server/city-overview";

export const getCityOverviewCached = cache(async (cityId: number) =>
  getCityOverview(cityId),
);

export async function generateMetadata({
  params,
}: LayoutProps<"/dashboard/cities/[cityId]">): Promise<Metadata> {
  const { cityId } = await params;

  const data = await getCityOverviewCached(Number(cityId));

  if (!data) notFound();

  return {
    title: {
      default: data.city.name,
      template: `%s - ${data.city.name} - MaintInsight`,
    },
    description: `Maintenance intelligence and overview for ${data.city.name}.`,
  };
}

export default async function CityLayout({
  children,
  params,
}: LayoutProps<"/dashboard/cities/[cityId]">) {
  return (
    <div>
      <Header paramsPromise={params} />

      <div className="[--app-layout-spacing:--spacing(6)] mx-auto mt-8 w-[calc(100%-var(--app-layout-spacing))] pb-10">
        {children}
      </div>
    </div>
  );
}
