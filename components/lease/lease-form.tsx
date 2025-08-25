"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseSchema } from "@/lib/validations";
import { createLease, updateLease } from "@/lib/actions/leases";
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
import { Loader2, Save, X, CalendarDays, DollarSign } from "lucide-react";
import { z } from "zod";

type LeaseFormData = z.infer<typeof leaseSchema>;

interface Unit {
  id: string;
  unitNumber: string;
  monthlyRent: string;
  propertyName: string | null;
  isAvailable: boolean;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  propertyId: string;
}

interface LeaseFormProps {
  units?: Unit[];
  tenants?: Tenant[];
  preselectedUnitId?: string;
  preselectedTenantId?: string;
  lease?: {
    id: string;
    unitId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
    monthlyRent: string;
    depositPaid: string;
    advancePaid: string;
    dueDate: number;
    status: "active" | "terminated" | "expired";
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LeaseForm({
  units = [],
  tenants = [],
  preselectedUnitId,
  preselectedTenantId,
  lease,
  onSuccess,
  onCancel,
}: LeaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState(
    preselectedUnitId || lease?.unitId || ""
  );
  const [selectedTenantId, setSelectedTenantId] = useState(
    preselectedTenantId || lease?.tenantId || ""
  );

  // Get selected unit details for rent suggestion
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeaseFormData>({
    resolver: zodResolver(
      leaseSchema.extend({
        status: z.enum(["active", "terminated", "expired"]),
      })
    ),
    defaultValues: lease
      ? {
          unitId: lease.unitId,
          tenantId: lease.tenantId,
          startDate: new Date(lease.startDate),
          endDate: new Date(lease.endDate),
          monthlyRent: parseFloat(lease.monthlyRent),
          depositPaid: parseFloat(lease.depositPaid),
          advancePaid: parseFloat(lease.advancePaid),
          dueDate: lease.dueDate,
          status: lease.status,
        }
      : {
          unitId: preselectedUnitId || "",
          tenantId: preselectedTenantId || "",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          monthlyRent: 0,
          depositPaid: 0,
          advancePaid: 0,
          dueDate: 1,
          status: "active",
        },
  });

  const onSubmit = async (data: LeaseFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = {
        ...data,
        unitId: selectedUnitId,
        tenantId: selectedTenantId,
      };

      const result = lease
        ? await updateLease(lease.id, formData)
        : await createLease(formData);

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

  // Auto-populate rent when unit is selected
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    setValue("unitId", unitId);

    const unit = units.find((u) => u.id === unitId);
    if (unit && !lease) {
      setValue("monthlyRent", parseFloat(unit.monthlyRent));
      setValue("depositPaid", parseFloat(unit.monthlyRent)); // Default: 1 month deposit
      setValue("advancePaid", parseFloat(unit.monthlyRent)); // Default: 1 month advance
    }
  };

  // Auto-set end date when start date changes (default 1 year lease)
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDateValue = new Date(e.target.value);
    const endDateValue = new Date(startDateValue);
    endDateValue.setFullYear(endDateValue.getFullYear() + 1);

    setValue("startDate", startDateValue);
    if (!lease) {
      // Only auto-set for new leases
      setValue("endDate", endDateValue);
    }
  };

  // Filter tenants by selected unit's property if unit is selected
  const availableTenants = selectedUnit
    ? tenants.filter(() => {
        // For now, we'll show all tenants. In the future, you might want to filter by property
        return true;
      })
    : tenants;

  // Filter available units (show unavailable ones if editing existing lease)
  const availableUnits = lease
    ? units || []
    : (units || []).filter((unit) => unit.isAvailable);

  // Debug logging
  console.log("LeaseForm - Total units:", units?.length || 0);
  console.log("LeaseForm - Available units:", availableUnits?.length || 0);
  console.log(
    "LeaseForm - Units availability:",
    units?.map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      isAvailable: u.isAvailable,
    }))
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          {lease ? "Edit Lease Agreement" : "Create New Lease Agreement"}
        </CardTitle>
        <CardDescription>
          {lease
            ? "Update lease terms and conditions"
            : "Set up a new lease agreement between tenant and unit"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Unit and Tenant Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={selectedUnitId}
                onValueChange={handleUnitChange}
                disabled={!!lease} // Can't change unit for existing lease
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex flex-col">
                        <span>
                          {unit.propertyName} - Unit {unit.unitNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          ₱{parseFloat(unit.monthlyRent).toLocaleString()}/month
                          {!unit.isAvailable && " (Currently Occupied)"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedUnitId && (
                <p className="text-sm text-red-600">Please select a unit</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant *</Label>
              <Select
                value={selectedTenantId}
                onValueChange={(value) => {
                  setSelectedTenantId(value);
                  setValue("tenantId", value);
                }}
                disabled={!!lease} // Can't change tenant for existing lease
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      <div className="flex flex-col">
                        <span>
                          {tenant.firstName} {tenant.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {tenant.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedTenantId && (
                <p className="text-sm text-red-600">Please select a tenant</p>
              )}
            </div>
          </div>

          {/* Lease Dates */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate", {
                  setValueAs: (value) => new Date(value),
                })}
                onChange={handleStartDateChange}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate", {
                  setValueAs: (value) => new Date(value),
                })}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Financial Terms */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Terms
            </Label>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₱
                  </span>
                  <Input
                    id="monthlyRent"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("monthlyRent", {
                      setValueAs: (value) => parseFloat(value) || 0,
                    })}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.monthlyRent && (
                  <p className="text-sm text-red-600">
                    {errors.monthlyRent.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositPaid">Security Deposit *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₱
                  </span>
                  <Input
                    id="depositPaid"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("depositPaid", {
                      setValueAs: (value) => parseFloat(value) || 0,
                    })}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.depositPaid && (
                  <p className="text-sm text-red-600">
                    {errors.depositPaid.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="advancePaid">Advance Payment *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₱
                  </span>
                  <Input
                    id="advancePaid"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("advancePaid", {
                      setValueAs: (value) => parseFloat(value) || 0,
                    })}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.advancePaid && (
                  <p className="text-sm text-red-600">
                    {errors.advancePaid.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Monthly Due Date *</Label>
              <Select
                value={watch("dueDate")?.toString()}
                onValueChange={(value) => setValue("dueDate", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                      {day === 1
                        ? "st"
                        : day === 2
                        ? "nd"
                        : day === 3
                        ? "rd"
                        : "th"}{" "}
                      of each month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dueDate && (
                <p className="text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Lease Status *</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) =>
                  setValue(
                    "status",
                    value as "active" | "terminated" | "expired"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {selectedUnit && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Lease Summary
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Unit:</strong> {selectedUnit.propertyName} - Unit{" "}
                  {selectedUnit.unitNumber}
                </p>
                <p>
                  <strong>Suggested Rent:</strong> ₱
                  {parseFloat(selectedUnit.monthlyRent).toLocaleString()}/month
                </p>
                {watch("startDate") && watch("endDate") && (
                  <p>
                    <strong>Duration:</strong>{" "}
                    {Math.ceil(
                      (new Date(watch("endDate")).getTime() -
                        new Date(watch("startDate")).getTime()) /
                        (1000 * 60 * 60 * 24 * 30.44)
                    )}{" "}
                    months
                  </p>
                )}
              </div>
            </div>
          )}

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
            <Button
              type="submit"
              disabled={isLoading || !selectedUnitId || !selectedTenantId}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {lease ? "Update Lease" : "Create Lease"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
