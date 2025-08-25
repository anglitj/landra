import { getProperty, updateProperty } from "@/lib/actions/properties";
import DashboardLayout from "@/components/dashboard/layout";
import PropertyForm from "@/components/property/property-form";
import { notFound } from "next/navigation";

interface EditPropertyPageProps {
  params: { id: string };
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
        <PropertyForm property={property} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
