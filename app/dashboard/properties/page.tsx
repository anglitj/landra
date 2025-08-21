import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getProperties } from "@/lib/actions/properties";
import DashboardLayout from "@/components/dashboard/layout";
import PropertyList from "@/components/property/property-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PropertiesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const properties = await getProperties();

  return (
    <DashboardLayout user={{ name: session.name, email: session.email }}>
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-2">
              Manage your properties and their details.
            </p>
          </div>
          <Link href="/dashboard/properties/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          <PropertyList properties={properties} />
        </div>
      </div>
    </DashboardLayout>
  );
}
