"use client";

import { useMemo, useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { UsersIcon } from "lucide-react";
import { useUsersFilters } from "./searchParams";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { getColumns, type User } from "./columns";
import { DataTable } from "../sessions/data-table";

interface UsersTableProps {
  users: User[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasFilters: boolean;
}

export function UsersTable({
  users,
  total,
  currentPage,
  totalPages,
  hasFilters,
}: UsersTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [{}, setFilters] = useUsersFilters({ startTransition });

  async function handleUnban(userId: string) {
    setBusy(true);
    await authClient.admin.unbanUser({
      userId,
      fetchOptions: {
        onSuccess: () => {
          toast.add({ type: "success", title: "User unbanned" });
          router.refresh();
        },
        onError: (ctx) => {
          toast.add({ type: "error", title: ctx.error.message });
        },
      },
    });
    setBusy(false);
  }

  async function handleDelete(userId: string) {
    setBusy(true);
    await authClient.admin.removeUser({
      userId,
      fetchOptions: {
        onSuccess: () => {
          toast.add({ type: "success", title: "User deleted" });
          router.refresh();
          setDeleteTarget(null);
        },
        onError: (ctx) => {
          toast.add({ type: "error", title: ctx.error.message });
        },
      },
    });
    setBusy(false);
  }

  const columns = useMemo(
    () =>
      getColumns({
        onUnban: handleUnban,
        onDelete: setDeleteTarget,
        busy,
      }),
    [busy],
  );

  if (users.length === 0) {
    return (
      <Empty className="bg-muted/30 rounded-2xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No users found</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            {hasFilters
              ? "No users match your current filters. Try adjusting your search."
              : "No users in the database yet. Add one to get started."}
          </EmptyDescription>
        </EmptyHeader>
        {hasFilters && (
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ search: null, role: null, status: null, page: 1 })
              }
            >
              Clear filters
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">{total} users</p>

      <DataTable columns={columns} data={users} />

      {totalPages > 1 && (
        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          isPending={isPending}
          onPageChange={(p) =>
            startTransition(async () => {
              await setFilters({ page: p });
            })
          }
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) handleDelete(deleteTarget.id);
              }}
              variant="destructive"
              disabled={busy}
            >
              {busy && <Spinner className="size-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function UsersPagination({
  currentPage,
  totalPages,
  isPending,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={isPending || currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const showEllipsis = prev && p - prev > 1;
          return (
            <>
              {showEllipsis && (
                <PaginationItem key={`ellipsis-${p}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={!isPending && currentPage === p}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            </>
          );
        })}

        <PaginationItem>
          <PaginationNext
            disabled={isPending || currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}