import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GaugeIcon,
  TriangleAlertIcon,
  PowerOffIcon,
  WifiOffIcon,
  BoxesIcon,
} from "lucide-react";

interface StatCardsProps {
  total: number;
  healthRate: number;
  statusCounts: Record<string, number>;
}

export function StatCards({ total, healthRate, statusCounts }: StatCardsProps) {
  const critical = (statusCounts.ALARM ?? 0) + (statusCounts.ALERT ?? 0);
  const stopped = statusCounts.STOPPED ?? 0;
  const notMonitored = statusCounts.NOT_MONITORED ?? 0;

  const items = [
    {
      label: "Total equipments",
      value: total,
      icon: BoxesIcon,
      tone: "text-foreground",
    },
    {
      label: "Health rate",
      value: `${healthRate}%`,
      icon: GaugeIcon,
      tone: "text-emerald-600",
    },
    {
      label: "Critical",
      value: critical,
      icon: TriangleAlertIcon,
      tone: "text-red-600",
    },
    {
      label: "Stopped",
      value: stopped,
      icon: PowerOffIcon,
      tone: "text-muted-foreground",
    },
    {
      label: "Not monitored",
      value: notMonitored,
      icon: WifiOffIcon,
      tone: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <item.icon className={`size-4 ${item.tone}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${item.tone}`}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
