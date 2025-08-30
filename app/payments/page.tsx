"use client";

import {
  PaymentForm,
  type PaymentFormValues,
} from "@/components/payment/payment-form";
import { createPayment, getPayments } from "@/app/actions/payment-actions";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentHistoryTable } from "@/components/payment/payment-history-table";

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

const payments: Payment[] = [];

// Temporary mock data for testing - will be replaced with real data from API
const mockLeases = [
  {
    id: "1",
    tenant: "John Doe",
    unit: "101",
    monthlyRent: 15000,
  },
  {
    id: "2",
    tenant: "Jane Smith",
    unit: "102",
    monthlyRent: 18000,
  },
];

export default function PaymentsPage() {
  // const [payments, setPayments] = useState<Payment[]>([]);

  // Temporary mock data for testing - will be replaced with real data from API
  // const mockLeases = [
  //   {
  //     id: "1",
  //     tenant: "John Doe",
  //     unit: "101",
  //     monthlyRent: 15000,
  //   },
  //   {
  //     id: "2",
  //     tenant: "Jane Smith",
  //     unit: "102",
  //     monthlyRent: 18000,
  //   },
  // ];

  // useEffect(() => {
  //   loadPayments();
  // }, []);

  // async function loadPayments() {
  //   try {
  //     const result = await getPayments();
  //     if (!result.success) {
  //       throw new Error(result.error);
  //     }
  //     // setPayments(
  //     //   (result.data || []).map((item: any) => ({
  //     //     id: item.id,
  //     //     lease_id: item.leaseId,
  //     //     amount:
  //     //       typeof item.amount === "string"
  //     //         ? parseFloat(item.amount)
  //     //         : item.amount,
  //     //     payment_method: item.paymentMethod,
  //     //     payment_date: new Date(item.paymentDate),
  //     //     reference_number: item.referenceNumber ?? null,
  //     //     status: item.status === "overdue" ? "pending" : item.status, // fallback if needed
  //     //     notes: item.notes ?? null,
  //     //     tenant_name: item.tenantName ?? "",
  //     //     unit_number: item.unitNumber ?? "",
  //     //   }))
  //     // );
  //   } catch (error) {
  //     console.error("Error loading payments:", error);
  //     toast.error("Failed to load payments");
  //   }
  // }

  const handlePaymentSubmit = async (values: PaymentFormValues) => {
    try {
      const result = await createPayment(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Payment recorded successfully");
      // loadPayments(); // Reload payments after successful creation
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to record payment");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Payment Management
        </h1>
        <p className="text-muted-foreground">
          Record and manage tenant payments
        </p>
      </div>

      <Tabs defaultValue="record" className="space-y-4">
        <TabsList>
          <TabsTrigger value="record">Record Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <Card>
            <CardHeader>
              <CardTitle>Record New Payment</CardTitle>
              <CardDescription>
                Enter the payment details below to record a new payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentForm leases={mockLeases} onSubmit={handlePaymentSubmit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View and manage all recorded payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentHistoryTable data={payments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
