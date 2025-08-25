"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { units, properties } from "@/lib/db/schema";
import { unitSchema, type UnitFormData } from "@/lib/validations";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createUnit(propertyId: string, data: UnitFormData) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify property ownership
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, session.userId)
        )
      );

    if (!property) {
      throw new Error("Property not found or unauthorized");
    }

    const validatedData = unitSchema.parse(data);

    const [unit] = await db
      .insert(units)
      .values({
        propertyId,
        unitNumber: validatedData.unitNumber,
        monthlyRent: validatedData.monthlyRent.toString(),
        depositRequired: validatedData.depositRequired.toString(),
        advanceRequired: validatedData.advanceRequired.toString(),
        sizeSqm: validatedData.sizeSqm?.toString(),
        bedrooms: validatedData.bedrooms || 0,
        bathrooms: validatedData.bathrooms || 0,
        isAvailable: validatedData.isAvailable,
        images: validatedData.images || [],
      })
      .returning();

    revalidatePath(`/dashboard/properties/${propertyId}`);
    return { success: true, unit };
  } catch (error) {
    console.error("Error creating unit:", error);
    return { success: false, error: "Failed to create unit" };
  }
}

export async function getUnits(propertyId: string) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify property ownership first
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, session.userId)
        )
      );

    if (!property) {
      throw new Error("Property not found or unauthorized");
    }

    const propertyUnits = await db
      .select()
      .from(units)
      .where(eq(units.propertyId, propertyId))
      .orderBy(units.unitNumber);

    return propertyUnits;
  } catch (error) {
    console.error("Error fetching units:", error);
    return [];
  }
}

export async function getUnit(unitId: string) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const [unit] = await db
      .select({
        unit: units,
        property: properties,
      })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, unitId), eq(properties.ownerId, session.userId)));

    return unit;
  } catch (error) {
    console.error("Error fetching unit:", error);
    return null;
  }
}

export async function updateUnit(unitId: string, data: UnitFormData) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify ownership through property
    const [existingUnit] = await db
      .select({
        unit: units,
        property: properties,
      })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, unitId), eq(properties.ownerId, session.userId)));

    if (!existingUnit) {
      throw new Error("Unit not found or unauthorized");
    }

    const validatedData = unitSchema.parse(data);

    const [unit] = await db
      .update(units)
      .set({
        unitNumber: validatedData.unitNumber,
        monthlyRent: validatedData.monthlyRent.toString(),
        depositRequired: validatedData.depositRequired.toString(),
        advanceRequired: validatedData.advanceRequired.toString(),
        sizeSqm: validatedData.sizeSqm?.toString(),
        bedrooms: validatedData.bedrooms || 0,
        bathrooms: validatedData.bathrooms || 0,
        isAvailable: validatedData.isAvailable,
        images: validatedData.images || [],
        updatedAt: new Date(),
      })
      .where(eq(units.id, unitId))
      .returning();

    revalidatePath(`/dashboard/properties/${existingUnit.property.id}`);
    return { success: true, unit };
  } catch (error) {
    console.error("Error updating unit:", error);
    return { success: false, error: "Failed to update unit" };
  }
}

export async function deleteUnit(unitId: string) {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify ownership through property
    const [existingUnit] = await db
      .select({
        unit: units,
        property: properties,
      })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, unitId), eq(properties.ownerId, session.userId)));

    if (!existingUnit) {
      throw new Error("Unit not found or unauthorized");
    }

    await db.delete(units).where(eq(units.id, unitId));

    revalidatePath(`/dashboard/properties/${existingUnit.property.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting unit:", error);
    return { success: false, error: "Failed to delete unit" };
  }
}

export async function getAllUnits() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const results = await db
      .select({
        id: units.id,
        propertyId: units.propertyId,
        unitNumber: units.unitNumber,
        monthlyRent: units.monthlyRent,
        depositRequired: units.depositRequired,
        advanceRequired: units.advanceRequired,
        sizeSqm: units.sizeSqm,
        bedrooms: units.bedrooms,
        bathrooms: units.bathrooms,
        isAvailable: units.isAvailable,
        images: units.images,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        propertyName: properties.name,
      })
      .from(units)
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.ownerId, session.userId))
      .orderBy(desc(units.createdAt));

    return results;
  } catch (error) {
    console.error("Error fetching all units:", error);
    throw new Error("Failed to fetch units");
  }
}
