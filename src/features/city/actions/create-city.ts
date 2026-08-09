"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCitySchema = z.object({
  name: z.string().min(2),
  code: z.string().trim().toLowerCase().min(2),
});

export type CreateCityState = {
  success?: boolean;
  error?: string;
};

export async function createCity(
  _: CreateCityState,
  formData: FormData,
): Promise<CreateCityState> {
  const parsed = createCitySchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  try {
    await prisma.city.create({
      data: parsed.data,
    });

    revalidatePath("/dashboard/cities");

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "A city with this code already exists." };
    }

    return { error: "Something went wrong." };
  }
}
