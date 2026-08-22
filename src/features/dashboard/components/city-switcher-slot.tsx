// features/city/components/city-switcher-slot.tsx
import { Slash } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CitySwitcherHeader } from "@/features/city/components/city-switcher";

export default async function CitySwitcherSlot({
  paramsPromise,
}: {
  paramsPromise: Promise<{ cityId: string }>;
}) {
  const { cityId } = await paramsPromise;
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <Slash className="size-4 -rotate-20 text-border" />
      <CitySwitcherHeader cityId={cityId} cities={cities} />
    </>
  );
}
