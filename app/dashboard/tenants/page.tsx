import { getTenants } from "@/lib/actions/tenants";
import { getProperties } from "@/lib/actions/properties";
import { TenantList } from "@/components/tenant/tenant-list";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function TenantsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  try {
    const [tenantsResult, properties] = await Promise.all([
      getTenants(),
      getProperties(),
    ]);

    if (tenantsResult.error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Tenants
            </h1>
            <p className="text-gray-600">{tenantsResult.error}</p>
          </div>
        </div>
      );
    }

    const tenants = tenantsResult.tenants || [];

    // Convert null to undefined for compatibility
    const convertedTenants = tenants.map((tenant) => ({
      ...tenant,
      emergencyContact: tenant.emergencyContact || undefined,
    }));

    return (
      <div className="container mx-auto px-4 py-8">
        <TenantList tenants={convertedTenants} properties={properties} />
      </div>
    );
  } catch (error) {
    console.error("Error loading tenants page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Tenants
          </h1>
          <p className="text-gray-600">
            An unexpected error occurred. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}
