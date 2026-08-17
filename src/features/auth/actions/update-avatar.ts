"use server";

import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function updateAvatarAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false as const, error: "NO_FILE" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false as const, error: "FILE_TOO_LARGE" };
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { success: false as const, error: "INVALID_FILE_TYPE" };
  }

  const { url } = await put(`avatars/${session.user.id}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await auth.api.updateUser({
    body: { image: url },
    headers: await headers(),
  });

  return { success: true as const, image: url };
}
