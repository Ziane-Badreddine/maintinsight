export function getNavItems(cityId: number | string, plantId: number | string) {
  const base = `/dashboard/cities/${cityId}/plants/${plantId}`;

  return [
    { title: "Overview", url: base, icon: "overview" as const },
    {
      title: "Workshops",
      url: `${base}/workshops`,
      icon: "workshops" as const,
    },
    {
      title: "Equipments",
      url: `${base}/equipments`,
      icon: "equipments" as const,
    },
    {
      title: "Inspections",
      url: `${base}/inspections`,
      icon: "inspections" as const,
    },
    { title: "Reports", url: `${base}/reports`, icon: "reports" as const },
  ];
}

export type NavIconKey = ReturnType<typeof getNavItems>[number]["icon"];
