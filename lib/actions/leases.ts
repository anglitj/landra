"use server";

import { db } from "@/lib/db";
import { leases, units, tenants, properties } from "@/lib/db/schema";
import { leaseSchema } from "@/lib/validations";
import { getSession } from "@/lib/session";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Get current user's leases with optional filtering
export async function getLeases(filters?: {
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  status?: "active" | "terminated" | "expired";
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    let whereConditions = eq(properties.ownerId, session.userId);

    // Apply filters
    if (filters?.propertyId) {
      whereConditions = and(
        whereConditions,
        eq(properties.id, filters.propertyId)
      )!;
    }

    if (filters?.unitId) {
      whereConditions = and(
        whereConditions,
        eq(leases.unitId, filters.unitId)
      )!;
    }

    if (filters?.tenantId) {
      whereConditions = and(
        whereConditions,
        eq(leases.tenantId, filters.tenantId)
      )!;
    }

    if (filters?.status) {
      whereConditions = and(
        whereConditions,
        eq(leases.status, filters.status)
      )!;
    }

    const results = await db
      .select({
        id: leases.id,
        unitId: leases.unitId,
        tenantId: leases.tenantId,
        startDate: leases.startDate,
        endDate: leases.endDate,
        monthlyRent: leases.monthlyRent,
        depositPaid: leases.depositPaid,
        advancePaid: leases.advancePaid,
        dueDate: leases.dueDate,
        status: leases.status,
        createdAt: leases.createdAt,
        updatedAt: leases.updatedAt,
        // Unit details
        unitNumber: units.unitNumber,
        // Tenant details
        tenantFirstName: tenants.firstName,
        tenantLastName: tenants.lastName,
        tenantEmail: tenants.email,
        tenantPhone: tenants.phone,
        // Property details
        propertyId: properties.id,
        propertyName: properties.name,
        propertyAddress: properties.address,
      })
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(whereConditions)
      .orderBy(desc(leases.createdAt));

    return { leases: results };
  } catch (error) {
    console.error("Error fetching leases:", error);
    return { error: "Failed to fetch leases" };
  }
}

// Get active leases
export async function getActiveLeases() {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const results = await db
      .select({
        id: leases.id,
        unitId: leases.unitId,
        tenantId: leases.tenantId,
        startDate: leases.startDate,
        endDate: leases.endDate,
        monthlyRent: leases.monthlyRent,
        dueDate: leases.dueDate,
        unitNumber: units.unitNumber,
        tenantFirstName: tenants.firstName,
        tenantLastName: tenants.lastName,
        propertyName: properties.name,
      })
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(eq(properties.ownerId, session.userId), eq(leases.status, "active"))
      )
      .orderBy(desc(leases.createdAt));

    return { leases: results };
  } catch (error) {
    console.error("Error fetching active leases:", error);
    return { error: "Failed to fetch active leases" };
  }
}

// Get leases expiring soon (within next 60 days)
export async function getExpiringLeases(days = 60) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const results = await db
      .select({
        id: leases.id,
        unitId: leases.unitId,
        tenantId: leases.tenantId,
        startDate: leases.startDate,
        endDate: leases.endDate,
        monthlyRent: leases.monthlyRent,
        dueDate: leases.dueDate,
        unitNumber: units.unitNumber,
        tenantFirstName: tenants.firstName,
        tenantLastName: tenants.lastName,
        propertyName: properties.name,
        daysUntilExpiry:
          sql<number>`DATE_PART('day', ${leases.endDate} - CURRENT_DATE)`.as(
            "daysUntilExpiry"
          ),
      })
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(
          eq(properties.ownerId, session.userId),
          eq(leases.status, "active"),
          gte(leases.endDate, today.toISOString().split("T")[0]),
          lte(leases.endDate, futureDate.toISOString().split("T")[0])
        )
      )
      .orderBy(leases.endDate);

    return { leases: results };
  } catch (error) {
    console.error("Error fetching expiring leases:", error);
    return { error: "Failed to fetch expiring leases" };
  }
}

// Get specific lease details
export async function getLeaseDetails(leaseId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const [lease] = await db
      .select({
        id: leases.id,
        unitId: leases.unitId,
        tenantId: leases.tenantId,
        startDate: leases.startDate,
        endDate: leases.endDate,
        monthlyRent: leases.monthlyRent,
        depositPaid: leases.depositPaid,
        advancePaid: leases.advancePaid,
        dueDate: leases.dueDate,
        status: leases.status,
        createdAt: leases.createdAt,
        updatedAt: leases.updatedAt,
        // Unit details
        unitNumber: units.unitNumber,
        unitSize: units.sizeSqm,
        unitBedrooms: units.bedrooms,
        unitBathrooms: units.bathrooms,
        // Tenant details
        tenantFirstName: tenants.firstName,
        tenantLastName: tenants.lastName,
        tenantEmail: tenants.email,
        tenantPhone: tenants.phone,
        tenantEmergencyContact: tenants.emergencyContact,
        // Property details
        propertyId: properties.id,
        propertyName: properties.name,
        propertyAddress: properties.address,
      })
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(eq(leases.id, leaseId), eq(properties.ownerId, session.userId))
      )
      .limit(1);

    if (!lease) {
      return { error: "Lease not found" };
    }

    return { lease };
  } catch (error) {
    console.error("Error fetching lease details:", error);
    return { error: "Failed to fetch lease details" };
  }
}

// Create new lease
export async function createLease(
  data: FormData | z.infer<typeof leaseSchema>
) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    let rawData;
    if (data instanceof FormData) {
      rawData = {
        unitId: data.get("unitId") as string,
        tenantId: data.get("tenantId") as string,
        startDate: new Date(data.get("startDate") as string),
        endDate: new Date(data.get("endDate") as string),
        monthlyRent: parseFloat(data.get("monthlyRent") as string),
        depositPaid: parseFloat(data.get("depositPaid") as string),
        advancePaid: parseFloat(data.get("advancePaid") as string),
        dueDate: parseInt(data.get("dueDate") as string),
        status:
          (data.get("status") as "active" | "terminated" | "expired") ||
          "active",
      };
    } else {
      rawData = data;
    }

    // Validate input
    const validatedData = leaseSchema.parse(rawData);

    // Verify unit ownership
    const [unit] = await db
      .select()
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(
          eq(units.id, validatedData.unitId),
          eq(properties.ownerId, session.userId)
        )
      )
      .limit(1);

    if (!unit) {
      return { error: "Unit not found or unauthorized" };
    }

    // Verify tenant ownership
    const [tenant] = await db
      .select()
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(
        and(
          eq(tenants.id, validatedData.tenantId),
          eq(properties.ownerId, session.userId)
        )
      )
      .limit(1);

    if (!tenant) {
      return { error: "Tenant not found or unauthorized" };
    }

    // Check for overlapping active leases on the same unit
    const overlappingLeases = await db
      .select()
      .from(leases)
      .where(
        and(
          eq(leases.unitId, validatedData.unitId),
          eq(leases.status, "active"),
          sql`(${leases.startDate} <= ${
            validatedData.endDate.toISOString().split("T")[0]
          } AND ${leases.endDate} >= ${
            validatedData.startDate.toISOString().split("T")[0]
          })`
        )
      );

    if (overlappingLeases.length > 0) {
      return {
        error: "Unit has an overlapping active lease for the specified period",
      };
    }

    // Create lease
    const [newLease] = await db
      .insert(leases)
      .values({
        ...validatedData,
        monthlyRent: validatedData.monthlyRent.toString(),
        depositPaid: validatedData.depositPaid.toString(),
        advancePaid: validatedData.advancePaid.toString(),
        startDate: validatedData.startDate.toISOString().split("T")[0],
        endDate: validatedData.endDate.toISOString().split("T")[0],
      })
      .returning();

    // Update unit availability if lease is active
    if (validatedData.status === "active") {
      await db
        .update(units)
        .set({
          isAvailable: false,
          updatedAt: new Date(),
        })
        .where(eq(units.id, validatedData.unitId));
    }

    revalidatePath("/dashboard/leases");
    revalidatePath("/dashboard/units");
    revalidatePath("/dashboard/properties");

    return { success: true, lease: newLease };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating lease:", error);
    return { error: "Failed to create lease" };
  }
}

// Update lease
export async function updateLease(
  leaseId: string,
  data: FormData | Partial<z.infer<typeof leaseSchema>>
) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    let rawData;
    if (data instanceof FormData) {
      rawData = {
        startDate: data.get("startDate")
          ? new Date(data.get("startDate") as string)
          : undefined,
        endDate: data.get("endDate")
          ? new Date(data.get("endDate") as string)
          : undefined,
        monthlyRent: data.get("monthlyRent")
          ? parseFloat(data.get("monthlyRent") as string)
          : undefined,
        depositPaid: data.get("depositPaid")
          ? parseFloat(data.get("depositPaid") as string)
          : undefined,
        advancePaid: data.get("advancePaid")
          ? parseFloat(data.get("advancePaid") as string)
          : undefined,
        dueDate: data.get("dueDate")
          ? parseInt(data.get("dueDate") as string)
          : undefined,
        status: data.get("status") as
          | "active"
          | "terminated"
          | "expired"
          | undefined,
      };
    } else {
      rawData = data;
    }

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([, v]) => v !== undefined)
    );

    // Validate input (partial validation)
    const validatedData = leaseSchema.partial().parse(cleanData);

    // Verify lease ownership
    const [existingLease] = await db
      .select()
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(eq(leases.id, leaseId), eq(properties.ownerId, session.userId))
      )
      .limit(1);

    if (!existingLease) {
      return { error: "Lease not found or unauthorized" };
    }

    // Prepare update data with proper types
    const updateData: Partial<typeof leases.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validatedData.monthlyRent !== undefined) {
      updateData.monthlyRent = validatedData.monthlyRent.toString();
    }
    if (validatedData.depositPaid !== undefined) {
      updateData.depositPaid = validatedData.depositPaid.toString();
    }
    if (validatedData.advancePaid !== undefined) {
      updateData.advancePaid = validatedData.advancePaid.toString();
    }
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate
        .toISOString()
        .split("T")[0];
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate.toISOString().split("T")[0];
    }
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate;
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    // Update lease
    const [updatedLease] = await db
      .update(leases)
      .set(updateData)
      .where(eq(leases.id, leaseId))
      .returning();

    // Update unit availability based on lease status
    if (validatedData.status) {
      const isAvailable = validatedData.status !== "active";
      await db
        .update(units)
        .set({
          isAvailable,
          updatedAt: new Date(),
        })
        .where(eq(units.id, existingLease.leases.unitId));
    }

    revalidatePath("/dashboard/leases");
    revalidatePath(`/dashboard/leases/${leaseId}`);
    revalidatePath("/dashboard/units");

    return { success: true, lease: updatedLease };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating lease:", error);
    return { error: "Failed to update lease" };
  }
}

// Terminate lease
export async function terminateLease(leaseId: string, terminationDate?: Date) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    // Verify lease ownership
    const [existingLease] = await db
      .select()
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(eq(leases.id, leaseId), eq(properties.ownerId, session.userId))
      )
      .limit(1);

    if (!existingLease) {
      return { error: "Lease not found or unauthorized" };
    }

    const endDate = terminationDate || new Date();

    // Update lease status and end date
    const [updatedLease] = await db
      .update(leases)
      .set({
        status: "terminated",
        endDate: endDate.toISOString().split("T")[0],
        updatedAt: new Date(),
      })
      .where(eq(leases.id, leaseId))
      .returning();

    // Make unit available
    await db
      .update(units)
      .set({
        isAvailable: true,
        updatedAt: new Date(),
      })
      .where(eq(units.id, existingLease.leases.unitId));

    revalidatePath("/dashboard/leases");
    revalidatePath("/dashboard/units");
    revalidatePath("/dashboard/properties");

    return { success: true, lease: updatedLease };
  } catch (error) {
    console.error("Error terminating lease:", error);
    return { error: "Failed to terminate lease" };
  }
}

// Calculate next payment due date
export async function calculateNextDueDate(
  dueDay: number,
  currentDate = new Date()
): Promise<Date> {
  const nextDue = new Date(currentDate);
  nextDue.setDate(dueDay);

  // If the due day has already passed this month, move to next month
  if (nextDue < currentDate) {
    nextDue.setMonth(nextDue.getMonth() + 1);
  }

  return nextDue;
}

// Get lease analytics for dashboard
export async function getLeaseAnalytics() {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    // Get total leases by status
    const leaseStats = await db
      .select({
        status: leases.status,
        count: sql<number>`count(*)`.as("count"),
        totalRevenue: sql<number>`sum(${leases.monthlyRent})`.as(
          "totalRevenue"
        ),
      })
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.ownerId, session.userId))
      .groupBy(leases.status);

    // Get total monthly revenue from active leases
    const activeRevenueResult = await db
      .select({
        totalMonthlyRevenue: sql<number>`sum(${leases.monthlyRent})`.as(
          "totalMonthlyRevenue"
        ),
      })
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(eq(properties.ownerId, session.userId), eq(leases.status, "active"))
      );

    // Get occupancy rate
    const occupancyResult = await db
      .select({
        totalUnits: sql<number>`count(*)`.as("totalUnits"),
        occupiedUnits:
          sql<number>`sum(case when ${units.isAvailable} = false then 1 else 0 end)`.as(
            "occupiedUnits"
          ),
      })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.ownerId, session.userId));

    const totalMonthlyRevenue =
      activeRevenueResult[0]?.totalMonthlyRevenue || 0;
    const { totalUnits, occupiedUnits } = occupancyResult[0] || {
      totalUnits: 0,
      occupiedUnits: 0,
    };
    const occupancyRate =
      totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      leaseStats,
      totalMonthlyRevenue,
      occupancyRate,
      totalUnits,
      occupiedUnits,
    };
  } catch (error) {
    console.error("Error fetching lease analytics:", error);
    return { error: "Failed to fetch lease analytics" };
  }
}

// Get a single lease by ID
export async function getLease(leaseId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const results = await db
      .select({
        id: leases.id,
        unitId: leases.unitId,
        tenantId: leases.tenantId,
        startDate: leases.startDate,
        endDate: leases.endDate,
        monthlyRent: leases.monthlyRent,
        depositPaid: leases.depositPaid,
        advancePaid: leases.advancePaid,
        dueDate: leases.dueDate,
        status: leases.status,
        createdAt: leases.createdAt,
        updatedAt: leases.updatedAt,
        // Unit details
        unitNumber: units.unitNumber,
        unitMonthlyRent: units.monthlyRent,
        unitDepositRequired: units.depositRequired,
        unitAdvanceRequired: units.advanceRequired,
        // Tenant details
        tenantFirstName: tenants.firstName,
        tenantLastName: tenants.lastName,
        tenantEmail: tenants.email,
        tenantPhone: tenants.phone,
        // Property details
        propertyId: properties.id,
        propertyName: properties.name,
        propertyAddress: properties.address,
      })
      .from(leases)
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(eq(leases.id, leaseId), eq(properties.ownerId, session.userId))
      );

    if (results.length === 0) {
      return { error: "Lease not found" };
    }

    return { lease: results[0] };
  } catch (error) {
    console.error("Error fetching lease:", error);
    return { error: "Failed to fetch lease" };
  }
}
