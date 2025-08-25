import { getAllUnits } from "@/lib/actions/units";
import { getAllTenants } from "@/lib/actions/tenants";
import { LeaseForm } from "@/components/lease/lease-form";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  searchParams: {
    unitId?: string;
    tenantId?: string;
  };
}

export default async function NewLeasePage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  try {
    const [units, tenants] = await Promise.all([
      getAllUnits(),
      getAllTenants(),
    ]);

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Lease</h1>
          <p className="text-gray-600 mt-2">
            Set up a new lease agreement for a unit and tenant
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <LeaseForm
            units={convertedUnits}
            tenants={convertedTenants}
            preselectedUnitId={searchParams.unitId}
            preselectedTenantId={searchParams.tenantId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading new lease page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Form
          </h1>
          <p className="text-gray-600">
            Failed to load form data. Please try again.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/leases">Back to Leases</Link>
          </Button>
        </div>
      </div>
    );
  }
}
