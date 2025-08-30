"use server";

import { db } from "@/lib/db";
import { Payment, payments, type NewPayment } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { PaymentFormValues } from "@/components/payment/payment-form";
import { z } from "zod";
import { ApiResponse } from "@/lib/db/types";

const PaymentInsertSchema = z.object({
  lease_id: z.string(),
  amount: z.number(),
  payment_method: z.enum(["gcash", "paymaya", "bank_transfer", "cash"]),
  payment_date: z.date(),
  reference_number: z.string().nullable(),
  status: z.enum(["pending", "confirmed"]),
  notes: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export async function createPayment(data: PaymentFormValues) {
  try {
    const insertData: NewPayment = {
      leaseId: data.leaseId,
      amount: data.amount.toString(),
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate.toISOString().split("T")[0],
      dueDate: data.paymentDate.toISOString().split("T")[0], // TODO: Calculate proper due date based on lease due date
      referenceNumber: data.referenceNumber || null,
      status: data.status,
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const payment = await db.insert(payments).values(insertData).returning();

    revalidatePath("/payments");
    return { success: true, data: payment[0] };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: "Failed to create payment" };
  }
}

export async function getPaymentsByLease(
  leaseId: string
): Promise<ApiResponse<Payment[]>> {
  try {
    const leasePayments = await db
      .select()
      .from(payments)
      .where(eq(payments.leaseId, leaseId))
      .orderBy(payments.paymentDate);

    return { success: true, data: leasePayments };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}

export async function getPayments(
  page = 1,
  limit = 10
): Promise<ApiResponse<Payment[]>> {
  try {
    const offset = (page - 1) * limit;
    const allPayments: Payment[] = await db
      .select()
      .from(payments)
      .limit(limit)
      .offset(offset)
      .orderBy(payments.createdAt);

    return { success: true, data: allPayments };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: "pending" | "confirmed"
): Promise<ApiResponse<Payment>> {
  try {
    const updatedPayment = await db
      .update(payments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    revalidatePath("/payments");
    return { success: true, data: updatedPayment[0] };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}
