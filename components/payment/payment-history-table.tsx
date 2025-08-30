"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  payment_method: "gcash" | "paymaya" | "bank_transfer" | "cash";
  payment_date: Date;
  reference_number: string | null;
  status: "pending" | "confirmed";
  notes: string | null;
  tenant_name: string;
  unit_number: string;
}

export function PaymentHistoryTable({ data }: { data: Payment[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No payments recorded
              </TableCell>
            </TableRow>
          ) : (
            data.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(new Date(payment.payment_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{payment.tenant_name}</TableCell>
                <TableCell>{payment.unit_number}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(payment.amount)}
                </TableCell>
                <TableCell>
                  {payment.payment_method.replace("_", " ").toUpperCase()}
                </TableCell>
                <TableCell>{payment.reference_number || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "confirmed" ? "default" : "secondary"
                    }
                    className={
                      payment.status === "confirmed" ? "bg-green-500" : ""
                    }
                  >
                    {payment.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
