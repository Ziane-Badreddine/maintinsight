"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { WorkshopRow } from "./workshop-columns";
import { updateWorkshop } from "../actions/update-workshop";
import { createWorkshop } from "../actions/create-workshop";
import { Spinner } from "@/components/ui/spinner";

interface WorkshopFormSheetProps {
  plantId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop?: WorkshopRow; // présent = edit, absent = create
}

export function WorkshopFormSheet({
  plantId,
  open,
  onOpenChange,
  workshop,
}: WorkshopFormSheetProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(workshop);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateWorkshop(workshop!.id, plantId, formData)
        : await createWorkshop(plantId, formData);

      if (result?.error) {
        toast.add({
          type: "error",
          title: result.error,
        });
        return;
      }

      toast.add({
        type: "success",
        title: isEdit ? "Workshop updated" : "Workshop created",
      });
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-screen sm:max-w-2xl! flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit workshop" : "New workshop"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this workshop's details."
              : "Add a new workshop to this plant."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <form
            id="form-create-edit-workshop"
            key={workshop?.id ?? "new"}
            action={handleSubmit}
            className="flex flex-col gap-4 px-4 pb-4"
          >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="SAP, PAP, DAP…"
              defaultValue={workshop?.name}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              placeholder="Optional"
              defaultValue={workshop?.code ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional"
              defaultValue={workshop?.description ?? ""}
              rows={3}
            />
          </div>
          </form>
        </ScrollArea>
        <SheetFooter className="flex-row gap-2 pb-4 ">
          <div className=" flex gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 "
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="form-create-edit-workshop"
              className="flex-1"
              disabled={isPending}
            >
              {isPending && <Spinner />}
              {isEdit ? "Save changes" : "Create workshop"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
