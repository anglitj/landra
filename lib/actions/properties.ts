"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { propertySchema, type PropertyFormData } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(data: PropertyFormData) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const validatedData = propertySchema.parse(data);

    const [property] = await db
      .insert(properties)
      .values({
        ownerId: session.userId,
        name: validatedData.name,
        address: validatedData.address,
        description: validatedData.description,
        totalUnits: validatedData.totalUnits || 0,
        amenities: validatedData.amenities || [],
        images: validatedData.images || [],
        rules: validatedData.rules,
      })
      .returning();

    revalidatePath("/dashboard/properties");
    return { success: true, property };
  } catch (error) {
    console.error("Error creating property:", error);
    return { success: false, error: "Failed to create property" };
  }
}

export async function getProperties() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const userProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.ownerId, session.userId))
      .orderBy(properties.createdAt);

    return userProperties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

export async function getProperty(propertyId: string) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, session.userId)
        )
      );

    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}

export async function updateProperty(
  propertyId: string,
  data: PropertyFormData
) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const validatedData = propertySchema.parse(data);

    const [property] = await db
      .update(properties)
      .set({
        name: validatedData.name,
        address: validatedData.address,
        description: validatedData.description,
        totalUnits: validatedData.totalUnits || 0,
        amenities: validatedData.amenities || [],
        images: validatedData.images || [],
        rules: validatedData.rules,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, session.userId)
        )
      )
      .returning();

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${propertyId}`);
    return { success: true, property };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: "Failed to update property" };
  }
}

export async function deleteProperty(propertyId: string) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .delete(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, session.userId)
        )
      );

    revalidatePath("/dashboard/properties");
    redirect("/dashboard/properties");
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, error: "Failed to delete property" };
  }
}
