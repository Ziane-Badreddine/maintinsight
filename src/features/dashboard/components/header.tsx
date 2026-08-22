import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HeaderClient from "./header-client";
import { Skeleton } from "@/components/ui/skeleton";

async function HeaderData() {
  const [cities, session] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: "asc" } }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return <HeaderClient cities={cities} session={session?.user ?? null} />;
}

function HeaderFallback() {
  return <>
    <header className="flex h-[64.8px] items-center border-b px-4"><Skeleton className="h-8 w-32" /></header>
    <div className="flex h-12 items-center gap-2 border-b px-3.5"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
  </>;
}

export default function Header() {
  return <Suspense fallback={<HeaderFallback />}><HeaderData /></Suspense>;
}
