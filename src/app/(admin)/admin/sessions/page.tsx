import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessions",
  description: "View and revoke active user sessions.",
  robots: { index: false, follow: false },
};
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { SearchParams } from "nuqs/server";
import {
  loadSessionsSearchParams,
  PAGE_SIZE,
} from "@/features/admin/sessions/searchParams";
import { SessionsTableSkeleton } from "@/features/admin/sessions/sessions-table-skeleton";
import { SessionsToolbar } from "@/features/admin/sessions/sessions-toolbar";
import { SessionsTable } from "@/features/admin/sessions/sessions-table";

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, page } = await loadSessionsSearchParams(searchParams);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Sessions</h1>
        <p className="text-sm text-muted-foreground">
          View and revoke active user sessions.
        </p>
      </div>

      {/* Toolbar is a Client Component — filters update URL → re-streams below */}
      <SessionsToolbar />

      {/* key change on every filter → Suspense re-mounts → streams skeleton then content */}
      <Suspense key={`${search}-${page}`} fallback={<SessionsTableSkeleton />}>
        <SessionsSection search={search} page={page} />
      </Suspense>
    </div>
  );
}

async function SessionsSection({
  search,
  page,
}: {
  search: string;
  page: number;
}) {
  const offset = (page - 1) * PAGE_SIZE;

  const usersResult = await auth.api.listUsers({
    query: {
      limit: search ? 50 : 200,
      offset: 0,
      sortBy: "createdAt",
      sortDirection: "desc",
      ...(search
        ? {
            searchField: "email",
            searchValue: search,
            searchOperator: "contains",
          }
        : {}),
    },
    headers: await headers(),
  });

  const users = usersResult?.users ?? [];

  const perUserSessions = await Promise.all(
    users.map(async (user) => {
      try {
        const { sessions } = await auth.api.listUserSessions({
          body: { userId: user.id },
          headers: await headers(),
        });

        return sessions.map((s) => ({ ...s, user }));
      } catch {
        return [];
      }
    }),
  );

  const allSessions = perUserSessions
    .flat()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const total = allSessions.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = allSessions.slice(offset, offset + PAGE_SIZE);

  return (
    <SessionsTable
      sessions={paginated}
      total={total}
      currentPage={page}
      totalPages={totalPages}
      hasFilters={search !== ""}
    />
  );
}
