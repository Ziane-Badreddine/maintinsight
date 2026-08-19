"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreatePlantInput,
  createPlantSchema,
} from "../validations/create-plant.schema";

type CreatePlantResult =
  | { success: true }
  | { success: false; error: string; field?: "code" | "name" };

export async function createPlant(
  values: CreatePlantInput,
): Promise<CreatePlantResult> {
  const parsed = createPlantSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Please fill all required fields." };
  }

  try {
    await prisma.plant.create({ data: parsed.data });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        error: "A plant with this code already exists.",
        field: "code",
      };
    }

    return { success: false, error: "Something went wrong." };
  }

  revalidatePath(`/dashboard/cities/${parsed.data.cityId}`);

  return { success: true };
}
