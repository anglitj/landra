import { getProperty } from "@/lib/actions/properties";
import DashboardLayout from "@/components/dashboard/layout";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface PropertyDetailsPageProps {
  params: { id: string };
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {property.name}
            </CardTitle>
            <div className="mt-2 text-gray-600">{property.address}</div>
            <Badge variant="secondary" className="mt-2">
              {property.totalUnits} units
            </Badge>
          </CardHeader>
          <CardContent>
            {property.description && (
              <p className="mb-4 text-gray-700">{property.description}</p>
            )}

            {property.images && property.images.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Images</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images.map((image: string, idx: number) => (
                    <Image
                      key={idx}
                      src={image}
                      alt={`Property image ${idx + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-1">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6">
              <a
                href={`/dashboard/properties/${property.id}/edit`}
                className="text-blue-600 hover:underline"
              >
                Edit Property
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
