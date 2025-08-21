"use client";

import { Property } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface PropertyListProps {
  properties: Property[];
}

export default function PropertyList({ properties }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No properties
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first property.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/properties/new">
            <Button>Add Property</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}
                </CardDescription>
              </div>
              <Badge variant="secondary">{property.totalUnits} units</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {property.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {property.description}
              </p>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-1">
                  {property.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Link href={`/dashboard/properties/${property.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              <div className="flex space-x-2">
                <Link href={`/dashboard/properties/${property.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
