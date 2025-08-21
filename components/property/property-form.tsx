"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, type PropertyFormData } from "@/lib/validations";
import { createProperty, updateProperty } from "@/lib/actions/properties";
import { Property } from "@/lib/db/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PropertyFormProps {
  property?: Property;
  mode: "create" | "edit";
}

export default function PropertyForm({ property, mode }: PropertyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [amenities, setAmenities] = useState<string[]>(
    property?.amenities || []
  );
  const [newAmenity, setNewAmenity] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property?.name || "",
      address: property?.address || "",
      description: property?.description || "",
      totalUnits: property?.totalUnits || 0,
      amenities: property?.amenities || [],
      rules: property?.rules || "",
    },
  });

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      const updatedAmenities = [...amenities, newAmenity.trim()];
      setAmenities(updatedAmenities);
      setValue("amenities", updatedAmenities);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    const updatedAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(updatedAmenities);
    setValue("amenities", updatedAmenities);
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);

    try {
      const formData = { ...data, amenities };

      if (mode === "create") {
        const result = await createProperty(formData);
        if (result.success) {
          router.push("/dashboard/properties");
        } else {
          console.error("Error creating property:", result.error);
        }
      } else if (property) {
        const result = await updateProperty(property.id, formData);
        if (result.success) {
          router.push(`/dashboard/properties/${property.id}`);
        } else {
          console.error("Error updating property:", result.error);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add New Property" : "Edit Property"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a new property to manage units and tenants."
            : "Update your property information."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter property name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter complete address"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your property"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="totalUnits">Total Units</Label>
            <Input
              id="totalUnits"
              type="number"
              {...register("totalUnits", { valueAsNumber: true })}
              placeholder="Number of units"
            />
            {errors.totalUnits && (
              <p className="text-sm text-red-600 mt-1">
                {errors.totalUnits.message}
              </p>
            )}
          </div>

          <div>
            <Label>Amenities</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAmenity())
                }
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                Add
              </Button>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="rules">Rules</Label>
            <Textarea
              id="rules"
              {...register("rules")}
              placeholder="Property rules and regulations"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : mode === "create"
                ? "Create Property"
                : "Update Property"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
