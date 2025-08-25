"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUnit, updateUnit } from "@/lib/actions/units";

interface UnitFormProps {
  propertyId: string;
  unit?: {
    id: string;
    unitNumber: string;
    monthlyRent: string;
    depositRequired: string;
    advanceRequired: string;
    sizeSqm?: string;
    bedrooms?: number;
    bathrooms?: number;
    isAvailable: boolean;
    images?: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UnitForm({
  propertyId,
  unit,
  onSuccess,
  onCancel,
}: UnitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: unit?.unitNumber || "",
    monthlyRent: unit ? parseFloat(unit.monthlyRent) : 0,
    depositRequired: unit ? parseFloat(unit.depositRequired) : 0,
    advanceRequired: unit ? parseFloat(unit.advanceRequired) : 0,
    sizeSqm: unit?.sizeSqm ? parseFloat(unit.sizeSqm) : 0,
    bedrooms: unit?.bedrooms || 0,
    bathrooms: unit?.bathrooms || 0,
    isAvailable: unit?.isAvailable ?? true,
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (unit) {
        result = await updateUnit(unit.id, formData);
      } else {
        result = await createUnit(propertyId, formData);
      }

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        alert(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error saving unit:", error);
      alert("An error occurred while saving the unit");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{unit ? "Edit Unit" : "Add New Unit"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="unitNumber">Unit Number</Label>
            <Input
              id="unitNumber"
              value={formData.unitNumber}
              onChange={(e) => updateField("unitNumber", e.target.value)}
              placeholder="e.g., 101, A1, etc."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthlyRent">Monthly Rent</Label>
              <Input
                id="monthlyRent"
                type="number"
                step="0.01"
                value={formData.monthlyRent}
                onChange={(e) =>
                  updateField("monthlyRent", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="depositRequired">Deposit Required</Label>
              <Input
                id="depositRequired"
                type="number"
                step="0.01"
                value={formData.depositRequired}
                onChange={(e) =>
                  updateField(
                    "depositRequired",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="advanceRequired">Advance Required</Label>
              <Input
                id="advanceRequired"
                type="number"
                step="0.01"
                value={formData.advanceRequired}
                onChange={(e) =>
                  updateField(
                    "advanceRequired",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sizeSqm">Size (sqm)</Label>
              <Input
                id="sizeSqm"
                type="number"
                step="0.01"
                value={formData.sizeSqm}
                onChange={(e) =>
                  updateField("sizeSqm", parseFloat(e.target.value) || 0)
                }
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) =>
                  updateField("bedrooms", parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) =>
                  updateField("bathrooms", parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked: boolean) =>
                updateField("isAvailable", checked)
              }
            />
            <Label htmlFor="isAvailable">Available for rent</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : unit ? "Update Unit" : "Create Unit"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
