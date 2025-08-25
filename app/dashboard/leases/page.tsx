import { getLeases } from "@/lib/actions/leases";
import { getAllUnits } from "@/lib/actions/units";
import { getAllTenants } from "@/lib/actions/tenants";
import { getProperties } from "@/lib/actions/properties";
import { LeaseList } from "@/components/lease/lease-list";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function LeasesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  try {
    const [leasesResult, units, tenants, properties] = await Promise.all([
      getLeases(),
      getAllUnits(),
      getAllTenants(),
      getProperties(),
    ]);

    if (leasesResult.error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Leases
            </h1>
            <p className="text-gray-600">{leasesResult.error}</p>
          </div>
        </div>
      );
    }

    const leases = leasesResult.leases || [];

    // Convert lease data to match component expectations
    const convertedLeases = leases.map((lease) => ({
      ...lease,
      status: lease.status || ("active" as const), // Default status if null
    }));

    // Convert tenant data for compatibility
    const convertedTenants = tenants.map((tenant) => ({
      ...tenant,
      emergencyContact: tenant.emergencyContact || undefined,
    }));

    return (
      <div className="container mx-auto px-4 py-8">
        <LeaseList
          leases={convertedLeases}
          units={units}
          tenants={convertedTenants}
          properties={properties}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading leases page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Leases
          </h1>
          <p className="text-gray-600">
            Failed to load lease data. Please try again.
          </p>
        </div>
      </div>
    );
  }
}
