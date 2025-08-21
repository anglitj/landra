import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  json,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Enums
export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "basic",
  "premium",
]);
export const leaseStatusEnum = pgEnum("lease_status", [
  "active",
  "terminated",
  "expired",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "gcash",
  "paymaya",
  "bank_transfer",
  "cash",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "overdue",
]);
export const inquirySourceEnum = pgEnum("inquiry_source", [
  "chatbot",
  "direct",
  "referral",
]);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "scheduled",
  "converted",
  "closed",
]);

// Users table (Property Owners) - Extended for NextAuth
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified"),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  password: varchar("password", { length: 255 }), // For simple auth
  phone: varchar("phone", { length: 50 }),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NextAuth.js required tables
export const accounts = pgTable("accounts", {
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationTokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  description: text("description"),
  totalUnits: integer("total_units").default(0),
  amenities: json("amenities").$type<string[]>(),
  rules: text("rules"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Units table
export const units = pgTable("units", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  unitNumber: varchar("unit_number", { length: 50 }).notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  depositRequired: decimal("deposit_required", {
    precision: 10,
    scale: 2,
  }).notNull(),
  advanceRequired: decimal("advance_required", {
    precision: 10,
    scale: 2,
  }).notNull(),
  sizeSqm: decimal("size_sqm", { precision: 8, scale: 2 }),
  bedrooms: integer("bedrooms").default(0),
  bathrooms: integer("bathrooms").default(0),
  isAvailable: boolean("is_available").default(true),
  images: json("images").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenants table
export const tenants = pgTable("tenants", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  emergencyContact: json("emergency_contact").$type<{
    name: string;
    phone: string;
    relationship: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leases table
export const leases = pgTable("leases", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  depositPaid: decimal("deposit_paid", { precision: 10, scale: 2 }).notNull(),
  advancePaid: decimal("advance_paid", { precision: 10, scale: 2 }).notNull(),
  dueDate: integer("due_date").notNull(), // day of month (1-31)
  status: leaseStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  leaseId: uuid("lease_id")
    .references(() => leases.id, { onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentDate: date("payment_date").notNull(),
  dueDate: date("due_date").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  status: paymentStatusEnum("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inquiries table
export const inquiries = pgTable("inquiries", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  source: inquirySourceEnum("source").default("direct"),
  status: inquiryStatusEnum("status").default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat Conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }),
  inquiryId: uuid("inquiry_id").references(() => inquiries.id, {
    onDelete: "cascade",
  }),
  messages: json("messages").$type<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>
  >(),
  visitorId: varchar("visitor_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type NewChatConversation = typeof chatConversations.$inferInsert;
