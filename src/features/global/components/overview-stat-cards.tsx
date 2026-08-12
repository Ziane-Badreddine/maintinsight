// components/dashboard/overview-stat-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Factory, Wrench, Cog } from "lucide-react";

interface OverviewStatCardsProps {
  cityName: string;
  totals: { plants: number; workshops: number; equipments: number };
}

export function OverviewStatCards({
  cityName,
  totals,
}: OverviewStatCardsProps) {
  const stats = [
    { label: "Site", value: cityName, icon: Building2, isText: true },
    { label: "Plants", value: totals.plants, icon: Factory, isText: false },
    {
      label: "Workshops",
      value: totals.workshops,
      icon: Wrench,
      isText: false,
    },
    {
      label: "Equipment",
      value: totals.equipments,
      icon: Cog,
      isText: false,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="relative">
          <stat.icon className=" absolute size-32 top-1/4 right-0 -rotate-16 opacity-20  " />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={
                stat.isText
                  ? "truncate text-xl font-semibold"
                  : "text-2xl font-bold"
              }
            >
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
