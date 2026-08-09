"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createPlantSchema = z.object({
  cityId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2),
  code: z.string().trim().toLowerCase().min(2),
  description: z.string().trim().optional(),
});

export type CreatePlantState = {
  success?: boolean;
  error?: string;
};

export async function createPlant(
  _: CreatePlantState,
  formData: FormData,
): Promise<CreatePlantState> {
  const parsed = createPlantSchema.safeParse({
    cityId: formData.get("cityId"),
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return {
      error: "Please fill all required fields.",
    };
  }

  try {
    await prisma.plant.create({
      data: parsed.data,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === "P2002") {
      return {
        error: "A plant with this code already exists.",
      };
    }

    return {
      error: "Something went wrong.",
    };
  }

  revalidatePath(`/dashboard/cities/${parsed.data.cityId}`);

  return {
    success: true,
  };
}
