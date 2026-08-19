"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldX } from "lucide-react";
import { UserWithRole } from "better-auth/plugins";
import { DataTableFeatures } from "@/features/dashboard/components/data-table-features";

export interface Session {
  id: string;
  token: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  expiresAt: Date;
  impersonatedBy?: string | null;
  user: UserWithRole;
}

/** Extract a short readable label from a raw user-agent string */
function parseUserAgent(ua?: string | null): string {
  if (!ua) return "Unknown";
  if (/iPhone|iPad|iOS/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Chrome/i.test(ua) && !/Edg|OPR/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua)) return "Safari";
  if (/Edg/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Mozilla/i.test(ua)) return "Mozilla";
  return "Browser";
}

const columnHelper = createColumnHelper<DataTableFeatures, Session>();

interface GetColumnsOptions {
  onRevoke: (session: Session) => void;
  busy: boolean;
}

export function getColumns({ onRevoke, busy }: GetColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor("user", {
      header: "User",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div>
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {session.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            {session.impersonatedBy && (
              <Badge
                variant="outline"
                className="mt-1 text-xs text-amber-600 border-amber-200"
              >
                Impersonated
              </Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP Address",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-mono">
          {row.original.ipAddress ?? "—"}
        </span>
      ),
    }),
    columnHelper.accessor("userAgent", {
      header: "Client",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {parseUserAgent(row.original.userAgent)}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
          })}
        </span>
      ),
    }),
    columnHelper.accessor("expiresAt", {
      header: "Expires",
      cell: ({ row }) => {
        const expired = isPast(new Date(row.original.expiresAt));
        return expired ? (
          <Badge variant="secondary" className="text-xs">
            Expired
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.expiresAt), {
              addSuffix: true,
            })}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={busy}
              />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onRevoke(row.original)}
            >
              <ShieldX className="size-4" />
              Revoke session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]);
}
