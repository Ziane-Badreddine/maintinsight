"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient, roleHasPermission } from "@/lib/auth-client";
import {
  inspectionCommentSchema,
  type InspectionCommentInput,
} from "../../schemas/inspection.schema";
import { updateInspectionComment } from "../../actions/update-inspection-header";
import { completeInspection } from "../../actions/complete-inspection";
import { validateInspection } from "../../actions/validate-inspection";
import type { InspectionWithRelations } from "../../types";
import { InspectionStepper } from "../inspection-stepper";
import { InspectionReviewSheet } from "./inspection-review-sheet";
import {
  INSPECTION_SHEET_CLASS,
  INSPECTION_SHEET_SCROLL_CLASS,
} from "./inspection-sheet-styles";

const STATUS_LABEL: Record<InspectionWithRelations["status"], string> = {
  DRAFT: "Draft",
  COMPLETED: "Completed",
  VALIDATED: "Validated",
};

interface InspectionHeaderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: InspectionWithRelations | null;
  onInspectionChange: (inspection: InspectionWithRelations) => void;
}

export function InspectionHeaderSheet({
  open,
  onOpenChange,
  inspection,
  onInspectionChange,
}: InspectionHeaderSheetProps) {
  const { data: session } = authClient.useSession();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [validateOpen, setValidateOpen] = useState(false);
  const [inspectionToValidate, setInspectionToValidate] =
    useState<InspectionWithRelations | null>(null);
  const [isSavingComment, startSaveComment] = useTransition();
  const [isCompleting, startComplete] = useTransition();
  const [isValidating, startValidate] = useTransition();

  const userRole = (session?.user as { role?: string | null } | undefined)
    ?.role;
  const canValidate = roleHasPermission(userRole, {
    inspection: ["validate"],
  });

  const form = useForm<InspectionCommentInput>({
    resolver: zodResolver(
      inspectionCommentSchema,
    ) as Resolver<InspectionCommentInput>,
    values: {
      comment: inspection?.comment ?? "",
    },
  });

  const isDraft = inspection?.status === "DRAFT";
  const isCompleted = inspection?.status === "COMPLETED";
  const isValidated = inspection?.status === "VALIDATED";

  function handleSaveComment() {
    if (!inspection) return;

    startSaveComment(async () => {
      const values = form.getValues();
      const result = await updateInspectionComment(inspection.id, values);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not save comment",
          description: String(result.error),
        });
        return;
      }

      toast.add({ type: "success", title: "Draft saved" });
      onInspectionChange({ ...inspection, comment: result.inspection.comment });
    });
  }

  function handleComplete() {
    if (!inspection) return;

    startComplete(async () => {
      const commentResult = await updateInspectionComment(
        inspection.id,
        form.getValues(),
      );
      if (!commentResult.success) {
        toast.add({
          type: "error",
          title: "Could not save inspection",
          description: String(commentResult.error),
        });
        return;
      }

      const result = await completeInspection(inspection.id);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not complete inspection",
          description: String(result.error),
        });
        return;
      }

      toast.add({ type: "success", title: "Inspection completed" });
      onInspectionChange({
        ...inspection,
        status: "COMPLETED",
        comment: commentResult.inspection.comment,
      });
    });
  }

  function handleValidate() {
    const target = inspectionToValidate ?? inspection;
    if (!target) return;

    startValidate(async () => {
      const result = await validateInspection(target.id);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not validate inspection",
          description: String(result.error),
        });
        return;
      }

      toast.add({ type: "success", title: "Inspection validated" });
      setValidateOpen(false);
      setReviewOpen(false);
      setInspectionToValidate(null);
      onInspectionChange({ ...target, status: "VALIDATED" });
    });
  }

  function handleProceedToValidate(reviewed: InspectionWithRelations) {
    setInspectionToValidate(reviewed);
    setValidateOpen(true);
  }

  const title = isValidated
    ? "Validated inspection"
    : isCompleted
      ? "Completed inspection"
      : "Today's inspection draft";

  const description = isValidated
    ? "This inspection has been reviewed and validated."
    : isCompleted
      ? "Waiting for manager validation."
      : "Add equipment inspected today and complete when ready.";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={INSPECTION_SHEET_CLASS}>
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SheetTitle>{title}</SheetTitle>
              {inspection ? (
                <Badge variant="secondary">
                  {STATUS_LABEL[inspection.status]}
                </Badge>
              ) : null}
            </div>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>

          {inspection ? (
            <>
              <ScrollArea className={INSPECTION_SHEET_SCROLL_CLASS}>
                <div className="flex flex-col gap-4 px-4 pb-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Inspection date</FieldLabel>
                      <div className="flex h-8 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground">
                        <CalendarIcon className="size-4 shrink-0" />
                        {format(new Date(inspection.inspectionDate), "PPP")}
                      </div>
                      <FieldDescription>
                        The date is set automatically and cannot be changed.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="comment">Comment</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          id="comment"
                          rows={3}
                          disabled={!isDraft}
                          placeholder="Optional notes about this inspection…"
                          {...form.register("comment")}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText>Optional</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  </FieldGroup>

                  <InspectionStepper
                    inspection={inspection}
                    onInspectionChange={onInspectionChange}
                  />
                </div>
              </ScrollArea>

              <SheetFooter className="flex-row gap-2 pb-4">
                <div className="ml-auto flex w-full gap-2 sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>

                  {isDraft ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        disabled={isSavingComment}
                        onClick={handleSaveComment}
                      >
                        {isSavingComment && <Spinner />}
                        Save draft
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 sm:flex-none"
                        disabled={
                          isCompleting || inspection.equipments.length === 0
                        }
                        onClick={handleComplete}
                      >
                        {isCompleting && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        Complete inspection
                      </Button>
                    </>
                  ) : null}

                  {isCompleted && canValidate ? (
                    <Button
                      type="button"
                      className="flex-1 sm:flex-none"
                      onClick={() => setReviewOpen(true)}
                    >
                      Review & validate
                    </Button>
                  ) : null}
                </div>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {inspection && (
        <InspectionReviewSheet
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          inspectionId={inspection.id}
          onProceedToValidate={handleProceedToValidate}
          onRevertedToDraft={(reverted) => {
            onInspectionChange(reverted);
          }}
        />
      )}

      <AlertDialog
        open={validateOpen}
        onOpenChange={(open) => {
          setValidateOpen(open);
          if (!open) setInspectionToValidate(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validate this inspection?</AlertDialogTitle>
            <AlertDialogDescription>
              You reviewed this inspection with{" "}
              {inspectionToValidate?.equipments.length ??
                inspection?.equipments.length ??
                0}{" "}
              equipment item(s). Once validated, it can no longer be modified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isValidating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={isValidating} onClick={handleValidate}>
              {isValidating ? "Validating…" : "Validate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
