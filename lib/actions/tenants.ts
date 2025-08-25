"use server";

import { db } from "@/lib/db";
import { tenants, properties } from "@/lib/db/schema";
import { tenantSchema } from "@/lib/validations";
import { getSession } from "@/lib/session";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Get current user's tenants with optional filtering
export async function getTenants(filters?: {
  propertyId?: string;
  search?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    let whereConditions = eq(properties.ownerId, session.userId);

    // Apply property filter
    if (filters?.propertyId) {
      whereConditions = and(
        eq(properties.ownerId, session.userId),
        eq(tenants.propertyId, filters.propertyId)
      )!;
    }

    let results = await db
      .select({
        id: tenants.id,
        firstName: tenants.firstName,
        lastName: tenants.lastName,
        email: tenants.email,
        phone: tenants.phone,
        emergencyContact: tenants.emergencyContact,
        propertyId: tenants.propertyId,
        propertyName: properties.name,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt,
      })
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(whereConditions)
      .orderBy(desc(tenants.createdAt));

    // Apply search filter (client-side for simplicity)
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(
        (tenant) =>
          tenant.firstName.toLowerCase().includes(searchTerm) ||
          tenant.lastName.toLowerCase().includes(searchTerm) ||
          tenant.email.toLowerCase().includes(searchTerm) ||
          tenant.phone.includes(searchTerm)
      );
    }

    return { tenants: results };
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return { error: "Failed to fetch tenants" };
  }
}

// Get specific tenant details
export async function getTenantDetails(tenantId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const [tenant] = await db
      .select({
        id: tenants.id,
        firstName: tenants.firstName,
        lastName: tenants.lastName,
        email: tenants.email,
        phone: tenants.phone,
        emergencyContact: tenants.emergencyContact,
        propertyId: tenants.propertyId,
        propertyName: properties.name,
        propertyAddress: properties.address,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt,
      })
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(
        and(eq(tenants.id, tenantId), eq(properties.ownerId, session.userId))
      )
      .limit(1);

    if (!tenant) {
      return { error: "Tenant not found" };
    }

    return { tenant };
  } catch (error) {
    console.error("Error fetching tenant details:", error);
    return { error: "Failed to fetch tenant details" };
  }
}

// Create new tenant
export async function createTenant(
  data: FormData | (z.infer<typeof tenantSchema> & { propertyId: string })
) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    let rawData;
    if (data instanceof FormData) {
      rawData = {
        propertyId: data.get("propertyId") as string,
        firstName: data.get("firstName") as string,
        lastName: data.get("lastName") as string,
        email: data.get("email") as string,
        phone: data.get("phone") as string,
        emergencyContact: data.get("emergencyContact")
          ? JSON.parse(data.get("emergencyContact") as string)
          : undefined,
      };
    } else {
      rawData = data;
    }

    // Validate input
    const validatedData = tenantSchema.parse({
      firstName: rawData.firstName,
      lastName: rawData.lastName,
      email: rawData.email,
      phone: rawData.phone,
      emergencyContact: rawData.emergencyContact,
    });

    // Verify property ownership
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, rawData.propertyId),
          eq(properties.ownerId, session.userId)
        )
      )
      .limit(1);

    if (!property) {
      return { error: "Property not found or unauthorized" };
    }

    // Check if tenant email already exists for this user's properties
    const existingTenant = await db
      .select()
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(
        and(
          eq(tenants.email, validatedData.email),
          eq(properties.ownerId, session.userId)
        )
      )
      .limit(1);

    if (existingTenant.length > 0) {
      return {
        error: "A tenant with this email already exists in your properties",
      };
    }

    // Create tenant
    const [newTenant] = await db
      .insert(tenants)
      .values({
        propertyId: rawData.propertyId,
        ...validatedData,
      })
      .returning();

    revalidatePath("/dashboard/tenants");
    revalidatePath("/dashboard/properties");

    return { success: true, tenant: newTenant };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating tenant:", error);
    return { error: "Failed to create tenant" };
  }
}

// Update tenant
export async function updateTenant(
  tenantId: string,
  data: FormData | Partial<z.infer<typeof tenantSchema>>
) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    let rawData;
    if (data instanceof FormData) {
      rawData = {
        firstName: data.get("firstName") as string,
        lastName: data.get("lastName") as string,
        email: data.get("email") as string,
        phone: data.get("phone") as string,
        emergencyContact: data.get("emergencyContact")
          ? JSON.parse(data.get("emergencyContact") as string)
          : undefined,
      };
    } else {
      rawData = data;
    }

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([, v]) => v !== undefined)
    );

    // Validate input (partial validation)
    const validatedData = tenantSchema.partial().parse(cleanData);

    // Verify tenant ownership
    const [existingTenant] = await db
      .select()
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(
        and(eq(tenants.id, tenantId), eq(properties.ownerId, session.userId))
      )
      .limit(1);

    if (!existingTenant) {
      return { error: "Tenant not found or unauthorized" };
    }

    // If email is being updated, check for duplicates
    if (
      validatedData.email &&
      validatedData.email !== existingTenant.tenants.email
    ) {
      const duplicateTenant = await db
        .select()
        .from(tenants)
        .innerJoin(properties, eq(tenants.propertyId, properties.id))
        .where(
          and(
            eq(tenants.email, validatedData.email),
            eq(properties.ownerId, session.userId)
          )
        )
        .limit(1);

      if (duplicateTenant.length > 0) {
        return {
          error: "A tenant with this email already exists in your properties",
        };
      }
    }

    // Update tenant
    const [updatedTenant] = await db
      .update(tenants)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    revalidatePath("/dashboard/tenants");
    revalidatePath(`/dashboard/tenants/${tenantId}`);

    return { success: true, tenant: updatedTenant };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating tenant:", error);
    return { error: "Failed to update tenant" };
  }
}

// Delete tenant
export async function deleteTenant(tenantId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    // Verify tenant ownership
    const [existingTenant] = await db
      .select()
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(
        and(eq(tenants.id, tenantId), eq(properties.ownerId, session.userId))
      )
      .limit(1);

    if (!existingTenant) {
      return { error: "Tenant not found or unauthorized" };
    }

    // TODO: Check if tenant has active leases before deletion
    // This should be implemented when lease management is complete

    // Delete tenant
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    revalidatePath("/dashboard/tenants");
    revalidatePath("/dashboard/properties");

    return { success: true };
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return { error: "Failed to delete tenant" };
  }
}

// Get tenants for a specific property (useful for dropdowns)
export async function getTenantsForProperty(propertyId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    // Verify property ownership
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, session.userId)
        )
      )
      .limit(1);

    if (!property) {
      return { error: "Property not found or unauthorized" };
    }

    const propertyTenants = await db
      .select({
        id: tenants.id,
        firstName: tenants.firstName,
        lastName: tenants.lastName,
        email: tenants.email,
        phone: tenants.phone,
      })
      .from(tenants)
      .where(eq(tenants.propertyId, propertyId))
      .orderBy(tenants.firstName, tenants.lastName);

    return { tenants: propertyTenants };
  } catch (error) {
    console.error("Error fetching tenants for property:", error);
    return { error: "Failed to fetch tenants" };
  }
}

export async function getAllTenants() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const results = await db
      .select({
        id: tenants.id,
        propertyId: tenants.propertyId,
        firstName: tenants.firstName,
        lastName: tenants.lastName,
        email: tenants.email,
        phone: tenants.phone,
        emergencyContact: tenants.emergencyContact,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt,
      })
      .from(tenants)
      .leftJoin(properties, eq(tenants.propertyId, properties.id))
      .where(eq(properties.ownerId, session.userId))
      .orderBy(tenants.firstName, tenants.lastName);

    return results;
  } catch (error) {
    console.error("Error fetching all tenants:", error);
    throw new Error("Failed to fetch tenants");
  }
}
