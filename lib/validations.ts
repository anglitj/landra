import { z } from "zod";

// Property validation schema
export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(255),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  totalUnits: z.number().min(0, "Total units must be 0 or greater").optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.string().optional(),
});

// Unit validation schema
export const unitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required").max(50),
  monthlyRent: z.number().min(0, "Monthly rent must be positive"),
  depositRequired: z.number().min(0, "Deposit must be positive"),
  advanceRequired: z.number().min(0, "Advance must be positive"),
  sizeSqm: z.number().min(0, "Size must be positive").optional(),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or greater").optional(),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or greater").optional(),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string()).optional(),
});

// Tenant validation schema
export const tenantSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(1, "Phone number is required").max(50),
  emergencyContact: z
    .object({
      name: z.string().min(1, "Emergency contact name is required"),
      phone: z.string().min(1, "Emergency contact phone is required"),
      relationship: z.string().min(1, "Relationship is required"),
    })
    .optional(),
});

// Lease validation schema
export const leaseSchema = z.object({
  unitId: z.string().uuid("Invalid unit ID"),
  tenantId: z.string().uuid("Invalid tenant ID"),
  startDate: z.date(),
  endDate: z.date(),
  monthlyRent: z.number().min(0, "Monthly rent must be positive"),
  depositPaid: z.number().min(0, "Deposit must be positive"),
  advancePaid: z.number().min(0, "Advance must be positive"),
  dueDate: z.number().min(1).max(31, "Due date must be between 1 and 31"),
  status: z.enum(["active", "terminated", "expired"]).default("active"),
});

// Payment validation schema
export const paymentSchema = z.object({
  leaseId: z.string().uuid("Invalid lease ID"),
  amount: z.number().min(0, "Amount must be positive"),
  paymentMethod: z.enum(["gcash", "paymaya", "bank_transfer", "cash"]),
  paymentDate: z.date(),
  dueDate: z.date(),
  referenceNumber: z.string().max(100).optional(),
  status: z.enum(["pending", "confirmed", "overdue"]).default("pending"),
  notes: z.string().optional(),
});

// Export types
export type PropertyFormData = z.infer<typeof propertySchema>;
export type UnitFormData = z.infer<typeof unitSchema>;
export type TenantFormData = z.infer<typeof tenantSchema>;
export type LeaseFormData = z.infer<typeof leaseSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
