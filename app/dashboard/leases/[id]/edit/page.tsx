import { getLease } from "@/lib/actions/leases";
import { getAllUnits } from "@/lib/actions/units";
import { getAllTenants } from "@/lib/actions/tenants";
import { LeaseForm } from "@/components/lease/lease-form";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditLeasePage({ params }: Props) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  try {
    const [leaseResult, units, tenants] = await Promise.all([
      getLease(params.id),
      getAllUnits(),
      getAllTenants(),
    ]);

    if (leaseResult.error || !leaseResult.lease) {
      notFound();
    }

    const lease = leaseResult.lease;

    // Convert lease data to match form expectations
    const convertedLease = {
      id: lease.id,
      unitId: lease.unitId,
      tenantId: lease.tenantId,
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyRent: lease.monthlyRent,
      depositPaid: lease.depositPaid,
      advancePaid: lease.advancePaid,
      dueDate: lease.dueDate,
      status: lease.status || ("active" as const),
    };

    // Convert tenant data for compatibility
    const convertedTenants = tenants.map(
      (tenant: {
        id: string;
        propertyId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        emergencyContact: unknown;
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        ...tenant,
        emergencyContact: tenant.emergencyContact || undefined,
      })
    );

    // Convert units data for compatibility
    const convertedUnits = units.map((unit) => ({
      ...unit,
      propertyName: unit.propertyName || "",
      isAvailable: unit.isAvailable || false,
    }));

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/leases">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leases
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lease</h1>
          <p className="text-gray-600 mt-2">
            Update lease information and terms
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <LeaseForm
            lease={convertedLease}
            units={convertedUnits}
            tenants={convertedTenants}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading lease edit page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Lease
          </h1>
          <p className="text-gray-600">
            Failed to load lease data. Please try again.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/leases">Back to Leases</Link>
          </Button>
        </div>
      </div>
    );
  }
}
