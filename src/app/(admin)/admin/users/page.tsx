import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { SearchParams } from "nuqs/server";
import {
  loadUsersSearchParams,
  PAGE_SIZE,
} from "@/features/admin/users/searchParams";
import { UsersToolbar } from "@/features/admin/users/users-toolbar";
import { UsersTableSkeleton } from "@/features/admin/users/users-table-skeleton";
import { UsersTable } from "@/features/admin/users/users-table";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, page, role, status } =
    await loadUsersSearchParams(searchParams);

  const offset = (page - 1) * PAGE_SIZE;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage, ban, and delete users.
        </p>
      </div>

      {/* Toolbar is a Client Component — filters update URL → re-streams below */}
      <UsersToolbar />

      {/* key change on every filter → Suspense re-mounts → streams skeleton then content */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersSection
          search={search}
          page={page}
          role={role}
          status={status}
          offset={offset}
        />
      </Suspense>
    </div>
  );
}

async function UsersSection({
  search,
  page,
  role,
  status,
  offset,
}: {
  search: string;
  page: number;
  role: string;
  status: string;
  offset: number;
}) {
  const result = await auth.api.listUsers({
    query: {
      limit: PAGE_SIZE,
      offset,
      sortBy: "createdAt",
      sortDirection: "desc",
      ...(search
        ? {
            searchField: "name",
            searchValue: search,
            searchOperator: "contains",
          }
        : {}),
      ...(role !== "all"
        ? { filterField: "role", filterValue: role, filterOperator: "eq" }
        : {}),
      ...(status === "banned"
        ? { filterField: "banned", filterValue: true, filterOperator: "eq" }
        : {}),
      ...(status === "active"
        ? { filterField: "banned", filterValue: false, filterOperator: "eq" }
        : {}),
    },
    headers: await headers(),
  });

  const users = result.users ?? [];
  const total = result.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <UsersTable
      users={users}
      total={total}
      currentPage={page}
      totalPages={totalPages}
      hasFilters={search !== "" || role !== "all" || status !== "all"}
    />
  );
}
