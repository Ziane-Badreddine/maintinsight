"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/common/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCity } from "../actions/create-city";
import { Spinner } from "@/components/ui/spinner";

interface NewCityDialogProps {
  children: React.ReactNode;
}

export function NewCityDialog({ children }: NewCityDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createCity, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router]);
  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>New city</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Add a new industrial site (e.g. Jorf Lasfar, Safi)
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form
          action={formAction}
          id="form-new-city"
          className="space-y-4 p-4 md:p-0"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Jorf Lasfar" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" placeholder="jorf" required />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </form>
        <ResponsiveModalFooter>
          <Button type="submit" form="form-new-city" disabled={isPending}>
            {isPending && <Spinner />} Create city
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
