// features/auth/components/settings/security/passkey-actions-menu.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

interface PasskeyActionsMenuProps {
  id: string;
  currentName: string | null;
}

export function PasskeyActionsMenu({
  id,
  currentName,
}: PasskeyActionsMenuProps) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(currentName ?? "");

  const renameMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.passkey.updatePasskey({
        id,
        name: name.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.add({ type: "success", title: "Passkey renamed" });
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
      setRenameOpen(false);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to rename passkey",
        description: error.message ?? "Please try again",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.passkey.deletePasskey({ id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.add({ type: "success", title: "Passkey removed" });
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
      setDeleteOpen(false);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to remove passkey",
        description: error.message ?? "Please try again",
      });
    },
  });

  function openRename() {
    setName(currentName ?? "");
    setMenuOpen(false);
    // léger délai pour laisser le dropdown se fermer proprement
    // avant d'ouvrir le dialog (évite les conflits de focus/overlay)
    setTimeout(() => setRenameOpen(true), 0);
  }

  function openDelete() {
    setMenuOpen(false);
    setTimeout(() => setDeleteOpen(true), 0);
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        ></DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openRename}>
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={openDelete}>
            <Trash2 className="size-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename passkey</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`rename-${id}`}>Name</FieldLabel>
              <Input
                id={`rename-${id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) {
                    e.preventDefault();
                    renameMutation.mutate();
                  }
                }}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={renameMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => renameMutation.mutate()}
              disabled={renameMutation.isPending || !name.trim()}
            >
              {renameMutation.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              You won&apos;t be able to sign in using this passkey anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
