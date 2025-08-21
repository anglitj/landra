import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/layout";
import PropertyForm from "@/components/property/property-form";

export default async function NewPropertyPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <DashboardLayout user={{ name: session.name, email: session.email }}>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-2">
            Create a new property to start managing units and tenants.
          </p>
        </div>

        <PropertyForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
