"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";

import { createPlant } from "../actions/create-plant";
import {
  CreatePlantInput,
  createPlantSchema,
} from "../validations/create-plant.schema";
import { INSPECTION_SHEET_CLASS } from "@/features/inspection/components/sheets/inspection-sheet-styles";

interface NewPlantSheetProps {
  cityId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function NewPlantSheet({
  cityId,
  open,
  onOpenChange,
  onSaved,
}: NewPlantSheetProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatePlantInput>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: {
      cityId,
      name: "",
      code: "",
      description: "",
    },
  });

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  function onSubmit(values: CreatePlantInput) {
    startTransition(async () => {
      const result = await createPlant(values);

      if (!result.success) {
        if (result.field) {
          form.setError(result.field, { message: result.error });
        }

        toast.add({
          type: "error",
          title: "Could not create plant",
          description: result.error,
        });
        return;
      }

      toast.add({ type: "success", title: "Plant created" });
      form.reset();
      onSaved?.();
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className={INSPECTION_SHEET_CLASS}>
        <SheetHeader>
          <SheetTitle>New plant</SheetTitle>
          <SheetDescription>Add a new industrial plant.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <form
            id="new-plant-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6 px-4 pb-4"
          >
            <input type="hidden" {...form.register("cityId")} />

            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Jorf Lasfar"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Code</FieldLabel>
                    <Input
                      id="code"
                      placeholder="jorf"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldDescription>
                      Used as a short, unique identifier for this plant.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id="description"
                        rows={3}
                        placeholder="Optional description…"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText>Optional</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 pb-4">
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-plant-form"
              className="flex-1"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Create plant
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
