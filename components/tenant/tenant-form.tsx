"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema } from "@/lib/validations";
import { createTenant, updateTenant } from "@/lib/actions/tenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, X } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { z } from "zod";

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantFormProps {
  propertyId?: string;
  properties?: Array<{ id: string; name: string }>;
  tenant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    propertyId: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TenantForm({
  propertyId,
  properties = [],
  tenant,
  onSuccess,
  onCancel,
}: TenantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState(
    propertyId || tenant?.propertyId || ""
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant
      ? {
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          phone: tenant.phone,
          emergencyContact: tenant.emergencyContact,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          emergencyContact: {
            name: "",
            phone: "",
            relationship: "",
          },
        },
  });

  const onSubmit = async (data: TenantFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = {
        ...data,
        propertyId: selectedProperty,
      };

      const result = tenant
        ? await updateTenant(tenant.id, formData)
        : await createTenant(formData);

      if (result.error) {
        setError(result.error);
      } else {
        reset();
        onSuccess?.();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const showPropertySelector = !propertyId && properties.length > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{tenant ? "Edit Tenant" : "Add New Tenant"}</CardTitle>
        <CardDescription>
          {tenant
            ? "Update tenant information"
            : "Enter the tenant's details to add them to your property"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showPropertySelector && (
            <div className="space-y-2">
              <Label htmlFor="property">Property *</Label>
              <Select
                value={selectedProperty}
                onValueChange={setSelectedProperty}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  placeholder="Enter phone number"
                  value={value}
                  onChange={onChange}
                  defaultCountry="PH"
                  international
                  countryCallingCodeEditable={false}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Emergency Contact (Optional)
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Contact Name</Label>
                <Input
                  id="emergencyName"
                  {...register("emergencyContact.name")}
                  placeholder="Enter emergency contact name"
                />
                {errors.emergencyContact?.name && (
                  <p className="text-sm text-red-600">
                    {errors.emergencyContact.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Contact Phone</Label>
                <Controller
                  name="emergencyContact.phone"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      placeholder="Enter emergency contact phone"
                      value={value}
                      onChange={onChange}
                      defaultCountry="PH"
                      international
                      countryCallingCodeEditable={false}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                />
                {errors.emergencyContact?.phone && (
                  <p className="text-sm text-red-600">
                    {errors.emergencyContact.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              <Input
                id="emergencyRelationship"
                {...register("emergencyContact.relationship")}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
              {errors.emergencyContact?.relationship && (
                <p className="text-sm text-red-600">
                  {errors.emergencyContact.relationship.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading || !selectedProperty}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {tenant ? "Update Tenant" : "Add Tenant"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
