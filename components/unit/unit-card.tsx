"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteUnit } from "@/lib/actions/units";
import { useRouter } from "next/navigation";

interface UnitCardProps {
  unit: {
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
  onEdit?: (unit: UnitCardProps["unit"]) => void;
  onDelete?: () => void;
}

export default function UnitCard({ unit, onEdit, onDelete }: UnitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this unit?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUnit(unit.id);
      if (result.success) {
        if (onDelete) {
          onDelete();
        } else {
          router.refresh();
        }
      } else {
        alert(result.error || "Failed to delete unit");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      alert("An error occurred while deleting the unit");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Unit {unit.unitNumber}</CardTitle>
          <Badge variant={unit.isAvailable ? "default" : "secondary"}>
            {unit.isAvailable ? "Available" : "Occupied"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Monthly Rent:</span>
              <p className="font-semibold">
                ${parseFloat(unit.monthlyRent).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Deposit:</span>
              <p>${parseFloat(unit.depositRequired).toLocaleString()}</p>
            </div>
          </div>

          {unit.bedrooms !== undefined && unit.bathrooms !== undefined && (
            <div className="flex gap-4 text-sm">
              <span>
                🛏️ {unit.bedrooms} bed{unit.bedrooms !== 1 ? "s" : ""}
              </span>
              <span>
                🚿 {unit.bathrooms} bath{unit.bathrooms !== 1 ? "s" : ""}
              </span>
              {unit.sizeSqm && (
                <span>📐 {parseFloat(unit.sizeSqm).toLocaleString()} sqm</span>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-3">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(unit)}>
                Edit
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
