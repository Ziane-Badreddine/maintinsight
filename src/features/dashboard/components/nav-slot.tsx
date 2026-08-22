// features/dashboard/components/nav-slot.tsx
import type { Route } from "next";
import { getSession } from "@/lib/session";
import NavClient from "./nav-client";
import { NavItem } from "../layouts/header-nav";
import { hasPermission } from "../lib/permissions";
import { Permissions } from "./header-client";

export default async function NavSlot({
  paramsPromise,
}: {
  paramsPromise: Promise<{ cityId: string }>;
}) {
  const [{ cityId }, session] = await Promise.all([
    paramsPromise,
    getSession(),
  ]);

  const user = session?.user ?? null;

  const navItems: {
    label: string;
    href: Route;
    exact?: boolean;
    permission: Permissions;
  }[] = [
    {
      label: "Overview",
      href: `/dashboard/cities/${cityId}` as Route,
      exact: true,
      permission: { dashboard: ["read"] },
    },
    {
      label: "Plants",
      href: `/dashboard/cities/${cityId}/plants` as Route,
      permission: { plant: ["read"] },
    },
    {
      label: "Workshops",
      href: `/dashboard/cities/${cityId}/workshops` as Route,
      permission: { workshop: ["read"] },
    },
    {
      label: "Equipments",
      href: `/dashboard/cities/${cityId}/equipments` as Route,
      permission: { equipment: ["read"] },
    },
    {
      label: "Inspections",
      href: `/dashboard/cities/${cityId}/inspections` as Route,
      permission: { inspection: ["read"] },
    },
    {
      label: "Reports",
      href: `/dashboard/cities/${cityId}/reports` as Route,
      permission: { report: ["read"] },
    },
  ];

  const nav: NavItem[] = navItems
    .filter((item) => hasPermission(user, item.permission))
    .map(({ label, href, exact }) => ({ label, href, exact }));

  return <NavClient nav={nav} />;
}
