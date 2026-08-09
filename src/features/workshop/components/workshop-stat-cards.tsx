import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FactoryIcon, TriangleAlertIcon, TrendingDownIcon } from "lucide-react";
import type { WorkshopRow } from "./workshop-columns";

interface WorkshopStatCardsProps {
  rows: WorkshopRow[];
}

export function WorkshopStatCards({ rows }: WorkshopStatCardsProps) {
  const totalWorkshops = rows.length;
  const withCritical = rows.filter((r) => r.critical > 0).length;
  const worst = rows.reduce<WorkshopRow | null>((acc, r) => {
    if (r.total === 0) return acc;
    if (!acc || r.healthRate < acc.healthRate) return r;
    return acc;
  }, null);

  const items = [
    {
      label: "Total workshops",
      value: totalWorkshops,
      icon: FactoryIcon,
      tone: "text-foreground",
    },
    {
      label: "With critical equipment",
      value: withCritical,
      icon: TriangleAlertIcon,
      tone: "text-red-600",
    },
    {
      label: "Needs attention",
      value: worst ? `${worst.name} (${worst.healthRate}%)` : "—",
      icon: TrendingDownIcon,
      tone: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <item.icon className={`size-4 ${item.tone}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-semibold ${item.tone}`}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
