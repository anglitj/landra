"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UnitForm from "./unit-form";
import UnitCard from "./unit-card";

interface UnitManagementProps {
  propertyId: string;
  units: Array<{
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
  }>;
}

export default function UnitManagement({
  propertyId,
  units,
}: UnitManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<
    UnitManagementProps["units"][0] | null
  >(null);

  const handleAddUnit = () => {
    setEditingUnit(null);
    setShowForm(true);
  };

  const handleEditUnit = (unit: UnitManagementProps["units"][0]) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUnit(null);
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUnit(null);
  };

  const handleUnitDelete = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Units ({units.length})</CardTitle>
            <Button onClick={handleAddUnit}>Add Unit</Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6">
              <UnitForm
                propertyId={propertyId}
                unit={editingUnit || undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {units.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No units created yet.</p>
              <p className="text-sm mt-2">
                Add your first unit to start managing this property.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onEdit={handleEditUnit}
                  onDelete={handleUnitDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
