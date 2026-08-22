// features/inspection/components/create-inspection-slot.tsx
import { CreateInspectionButton } from "@/features/inspection/components/create-inspection-button";
import { getSession } from "@/lib/session";
import { hasPermission } from "../lib/permissions";

export default async function CreateInspectionSlot() {
  const session = await getSession();
  const canCreate = hasPermission(session?.user ?? null, {
    inspection: ["create"],
  });
  return canCreate ? <CreateInspectionButton /> : null;
}
