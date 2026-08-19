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
import { ActivityIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useSessionsFilters } from "./searchParams";
import { DataTable } from "./data-table";
import { getColumns, Session } from "./columns";
import { toast } from "@/components/ui/toast";

interface SessionsTableProps {
  sessions: Session[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasFilters: boolean;
}

export function SessionsTable({
  sessions,
  total,
  currentPage,
  totalPages,
  hasFilters,
}: SessionsTableProps) {
  const router = useRouter();
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [{}, setFilters] = useSessionsFilters({ startTransition });

  async function handleRevoke(sessionToken: string) {
    setBusy(true);
    await authClient.admin.revokeUserSession({
      sessionToken,
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            type: "success",
            title: "Session revoked",
          });
          router.refresh();
          setRevokeTarget(null);
        },
        onError: (ctx) => {
          toast.add({
            type: "error",
            title: ctx.error.message,
          });
        },
      },
    });
    setBusy(false);
  }

  const columns = useMemo(
    () => getColumns({ onRevoke: setRevokeTarget, busy }),
    [busy],
  );

  if (sessions.length === 0) {
    return (
      <Empty className="bg-muted/30 rounded-2xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ActivityIcon />
          </EmptyMedia>
          <EmptyTitle>No sessions found</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            {hasFilters
              ? "No sessions match your current filters. Try adjusting your search."
              : "No active sessions in the database."}
          </EmptyDescription>
        </EmptyHeader>
        {hasFilters && (
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() => setFilters({ search: null, page: 1 })}
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
      <p className="text-sm text-muted-foreground">{total} sessions</p>

      <DataTable columns={columns} data={sessions} />

      {totalPages > 1 && (
        <SessionsPagination
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
        open={!!revokeTarget}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke session</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately sign out{" "}
              <span className="font-medium text-foreground">
                {revokeTarget?.user.name}
              </span>{" "}
              from this session. They will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={"destructive"}
              onClick={(e) => {
                e.preventDefault();
                if (revokeTarget) handleRevoke(revokeTarget.token);
              }}
              disabled={busy}
            >
              {busy && <Spinner className="size-4" />}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SessionsPagination({
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
