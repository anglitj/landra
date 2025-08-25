"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TenantCard } from "./tenant-card";
import { TenantForm } from "./tenant-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Users } from "lucide-react";

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Property {
  id: string;
  name: string;
}

interface TenantListProps {
  tenants: Tenant[];
  properties: Property[];
}

export function TenantList({ tenants, properties }: TenantListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Filter tenants based on search term and selected property
  const filteredTenants = useMemo(() => {
    let filtered = tenants;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tenant) =>
          tenant.firstName.toLowerCase().includes(term) ||
          tenant.lastName.toLowerCase().includes(term) ||
          tenant.email.toLowerCase().includes(term) ||
          tenant.phone.includes(term) ||
          tenant.propertyName.toLowerCase().includes(term)
      );
    }

    // Filter by property
    if (selectedProperty !== "all") {
      filtered = filtered.filter(
        (tenant) => tenant.propertyId === selectedProperty
      );
    }

    return filtered;
  }, [tenants, searchTerm, selectedProperty]);

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    router.refresh();
  };

  const handleEditSuccess = () => {
    setEditingTenant(null);
    router.refresh();
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
  };

  const handleDelete = () => {
    router.refresh();
  };

  if (tenants.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No tenants yet
        </h3>
        <p className="text-gray-500 mb-6">
          Get started by adding your first tenant.
        </p>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add First Tenant
        </Button>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
            </DialogHeader>
            <TenantForm
              properties={properties}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-500">
            {filteredTenants.length} of {tenants.length} tenants
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search tenants
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search tenants by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-64">
          <Label htmlFor="property-filter" className="sr-only">
            Filter by property
          </Label>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger>
              <SelectValue placeholder="All properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tenant Grid */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tenants found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onEdit={() => handleEdit(tenant)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Tenant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm
            properties={properties}
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog
        open={!!editingTenant}
        onOpenChange={() => setEditingTenant(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          {editingTenant && (
            <TenantForm
              tenant={editingTenant}
              properties={properties}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingTenant(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
