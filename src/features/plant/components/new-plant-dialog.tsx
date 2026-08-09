"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/common/responsive-modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createPlant, type CreatePlantState } from "../actions/create-plant";
import { Spinner } from "@/components/ui/spinner";

interface NewPlantDialogProps {
  cityId: number;
  children: React.ReactNode;
}

const initialState: CreatePlantState = {};

export function NewPlantDialog({ cityId, children }: NewPlantDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    createPlant,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <ResponsiveModal open={open} onOpenChange={setOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>New plant</ResponsiveModalTitle>

            <ResponsiveModalDescription>
              Add a new industrial plant.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <form
            action={formAction}
            id="new-plant-form"
            className="space-y-4 p-4 md:p-0"
          >
            <input type="hidden" name="cityId" value={cityId} />

            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>

              <Input id="name" name="name" placeholder="Jorf Lasfar" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>

              <Input id="code" name="code" placeholder="jorf" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                name="description"
                placeholder="Optional description..."
              />
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </form>

          <ResponsiveModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" form="new-plant-form" disabled={isPending}>
              {isPending && <Spinner />} Create plant
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
