// features/auth/components/settings/update-avatar.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload as UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
  UpdateAvatarInput,
  updateAvatarSchema,
} from "@/features/auth/schemas/update-avatar-schema";
import { updateAvatarAction } from "@/features/auth/actions/update-avatar";

export default function UpdateAvatar() {
  const {
    data: session,
    refetch,
    isPending: isPendingAuth,
  } = authClient.useSession();
  const user = session?.user;

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateAvatarInput>({
    resolver: zodResolver(updateAvatarSchema),
    defaultValues: { file: undefined },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentFile = watch("file");
  const hasNewFile = currentFile instanceof File;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setPreview(user?.image ?? null);
    } else {
      reset({ file: undefined });
      setPreview(null);
    }
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) return;
    setValue("file", file, { shouldValidate: true });
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  }

  function onSubmit(values: UpdateAvatarInput) {
    const formData = new FormData();
    formData.append("file", values.file);

    startTransition(async () => {
      const result = await updateAvatarAction(formData);

      if (!result.success) {
        toast.add({
          type: "error",
          title: "Failed to update avatar",
          description: "Please try again",
        });
        return;
      }

      await refetch();
      toast.add({ type: "success", title: "Avatar updated" });
      handleOpenChange(false);
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg  border-t-0 "
    >
      <FieldGroup>
        <Field data-invalid={!!errors.file}>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-primary bg-accent"
                : "border-border hover:border-primary/50",
            )}
          >
            {preview ? (
              <Avatar className="size-24">
                <AvatarImage src={preview} alt="Avatar preview" />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-muted">
                <UploadIcon className="size-8 text-muted-foreground" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {preview && open
                  ? "Click or drop to change"
                  : "Click or drag an image here"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG or WebP, max 5MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            disabled={isPending || isPendingAuth}
          />

          {errors.file && <FieldError errors={[errors.file]} />}
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending || isPendingAuth}
          onClick={() => handleOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !hasNewFile || isPendingAuth}
        >
          {isPending && <Spinner />}
          Save
        </Button>
      </div>
    </form>
  );
}
