"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react";
import { BanUserDialog } from "./ban-user-dialog";
import { DataTableFeatures } from "@/features/dashboard/components/data-table-features";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date;
}

const columnHelper = createColumnHelper<DataTableFeatures, User>();

interface GetColumnsOptions {
  onUnban: (userId: string) => void;
  onDelete: (user: User) => void;
  busy: boolean;
}

export function getColumns({ onUnban, onDelete, busy }: GetColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === "admin" ? "default" : "secondary"}
          className="capitalize text-xs"
        >
          {row.original.role ?? "user"}
        </Badge>
      ),
    }),
    columnHelper.accessor("banned", {
      header: "Status",
      cell: ({ row }) =>
        row.original.banned ? (
          <Badge variant="destructive" className="text-xs">
            Banned
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs text-emerald-600 border-emerald-200"
          >
            Active
          </Badge>
        ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
          })}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
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
              {user.banned ? (
                <DropdownMenuItem onClick={() => onUnban(user.id)}>
                  <ShieldCheck className="size-4" />
                  Unban user
                </DropdownMenuItem>
              ) : (
                <BanUserDialog user={user} trigger="dropdown-item" />
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="size-4" />
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ]);
}
