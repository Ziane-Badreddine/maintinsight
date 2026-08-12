"use client";

import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { ChevronsUpDownIcon, FactoryIcon } from "lucide-react";
import type { EquipmentRow } from "./equipment-columns";
import { updateEquipment } from "../actions/update-equipment";
import { createEquipment } from "../actions/create-equipment";

interface Workshop {
  id: number;
  name: string;
}

interface EquipmentFormSheetProps {
  workshops: Workshop[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: EquipmentRow; // présent = edit
  defaultWorkshopId?: number;
}

export function EquipmentFormSheet({
  workshops,
  open,
  onOpenChange,
  equipment,
  defaultWorkshopId,
}: EquipmentFormSheetProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(equipment);

  const [selectedWorkshop, setSelectedWorkshop] = useState<
    Workshop | undefined
  >(() =>
    workshops.find(
      (ws) => ws.id === (equipment?.workshop.id ?? defaultWorkshopId),
    ),
  );

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateEquipment(equipment!.id, formData)
        : await createEquipment(formData);

      if (result?.error) {
        toast.add({
          type: "error",
          title: result.error,
        });
        return;
      }
      toast.add({
        type: "success",
        title: isEdit ? "Equipment updated" : "Equipment created",
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
          <SheetTitle>{isEdit ? "Edit equipment" : "New equipment"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this equipment's details."
              : "Add a new equipment to a workshop."}
          </SheetDescription>
        </SheetHeader>

        <form
          key={equipment?.id ?? "new"}
          action={handleSubmit}
          id="form-create-edit-equipment"
          className="flex flex-col gap-4 px-4 flex-1"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Pompe circulation bac commun 401AAP02"
              defaultValue={equipment?.name}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              placeholder="Optional"
              defaultValue={equipment?.code ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workshopId">Workshop</Label>
            <input
              type="hidden"
              name="workshopId"
              value={selectedWorkshop?.id ?? ""}
            />
            <Combobox
              items={workshops}
              value={selectedWorkshop}
              itemToStringValue={(ws) => ws.name}
              onValueChange={(ws) => setSelectedWorkshop(ws ?? undefined)}
              filter={null}
            >
              <ComboboxTrigger
                render={
                  <Button
                    id="workshopId"
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FactoryIcon className="size-4 text-muted-foreground shrink-0" />
                      {selectedWorkshop?.name ?? "Select a workshop"}
                    </span>
                    <ChevronsUpDownIcon className="size-4 opacity-50 shrink-0" />
                  </Button>
                }
              />
              <ComboboxContent>
                <ComboboxEmpty>No workshop found.</ComboboxEmpty>
                <ComboboxList>
                  {(ws: Workshop) => (
                    <ComboboxItem
                      key={ws.id}
                      value={ws}
                      className="cursor-pointer"
                    >
                      {ws.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="flex-1" />
        </form>
        <SheetFooter className="flex-row gap-2  pb-4">
          <div className=" flex gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="form-create-edit-equipment"
              className="flex-1"
              disabled={isPending}
            >
              {isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create equipment"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
