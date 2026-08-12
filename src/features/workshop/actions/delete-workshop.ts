"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function deleteWorkshop(id: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "You must be signed in to delete a workshop." };
  }

  try {
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      select: { id: true, plantId: true },
    });

    if (!workshop) {
      return { error: "Workshop not found." };
    }

    // Deletes cascade to equipment / inspections if your Prisma schema
    // defines onDelete: Cascade on those relations. If not, delete
    // dependents explicitly here inside a transaction before removing
    // the workshop itself.
    await prisma.workshop.delete({ where: { id } });

    revalidatePath(`/plants/${workshop.plantId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete workshop:", error);
    return { error: "Something went wrong while deleting the workshop." };
  }
}
