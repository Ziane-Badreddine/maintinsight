"use client";

import { useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { EquipmentRow } from "./equipment-columns";
import { updateEquipmentStatus } from "../actions/update-equipment-status";
import { toast } from "@/components/ui/toast";
import { statusChartConfig } from "@/features/plant/components/chart-config";

interface ChangeStatusDialogProps {
  equipment: EquipmentRow | null;
  performedById: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeStatusDialog({
  equipment,
  performedById,
  open,
  onOpenChange,
}: ChangeStatusDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!performedById) {
    return null;
  }

  function handleSubmit(formData: FormData) {
    if (!equipment || !performedById) return;
    startTransition(async () => {
      const result = await updateEquipmentStatus(
        equipment.id,
        performedById,
        formData,
      );
      if (result?.error) {
        toast.add({
          type: "error",
          title: result.error,
        });
        return;
      }
      toast.add({
        type: "success",
        title: "Status updated",
      });
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Change status</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {equipment?.name} — this creates a new inspection entry, keeping the
            history intact.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form key={equipment?.id} action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={equipment?.status}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusChartConfig).map(([value, cfg]) => (
                  <SelectItem key={value} value={value}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              placeholder="Optional"
              defaultValue={equipment?.diagnosis ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recommendation">Recommendation</Label>
            <Textarea
              id="recommendation"
              name="recommendation"
              placeholder="Optional"
              rows={2}
            />
          </div>

          <ResponsiveModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Update status"}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
