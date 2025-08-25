"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LeaseCard } from "./lease-card";
import { LeaseForm } from "./lease-form";
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
import { Plus, Search, FileText, Filter } from "lucide-react";

interface Lease {
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
  unitNumber: string;
  tenantFirstName: string;
  tenantLastName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyId: string;
  propertyName: string;
  createdAt: Date;
}

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

interface Property {
  id: string;
  name: string;
}

interface LeaseListProps {
  leases: Lease[];
  units: Unit[];
  tenants: Tenant[];
  properties: Property[];
}

export function LeaseList({
  leases,
  units,
  tenants,
  properties,
}: LeaseListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);

  // Filter leases based on search term, property, and status
  const filteredLeases = useMemo(() => {
    let filtered = leases;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lease) =>
          lease.tenantFirstName.toLowerCase().includes(term) ||
          lease.tenantLastName.toLowerCase().includes(term) ||
          lease.tenantEmail.toLowerCase().includes(term) ||
          lease.propertyName.toLowerCase().includes(term) ||
          lease.unitNumber.toLowerCase().includes(term)
      );
    }

    // Filter by property
    if (selectedProperty !== "all") {
      filtered = filtered.filter(
        (lease) => lease.propertyId === selectedProperty
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((lease) => lease.status === selectedStatus);
    }

    return filtered;
  }, [leases, searchTerm, selectedProperty, selectedStatus]);

  // Group leases by status for summary
  const leaseSummary = useMemo(() => {
    const summary = {
      active: 0,
      terminated: 0,
      expired: 0,
      expiringSoon: 0,
    };

    const today = new Date();
    const sixtyDaysFromNow = new Date(
      today.getTime() + 60 * 24 * 60 * 60 * 1000
    );

    leases.forEach((lease) => {
      summary[lease.status]++;

      if (lease.status === "active") {
        const endDate = new Date(lease.endDate);
        if (endDate <= sixtyDaysFromNow && endDate > today) {
          summary.expiringSoon++;
        }
      }
    });

    return summary;
  }, [leases]);

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    router.refresh();
  };

  const handleEditSuccess = () => {
    setEditingLease(null);
    router.refresh();
  };

  const handleEdit = (lease: Lease) => {
    setEditingLease(lease);
  };

  const handleDelete = () => {
    router.refresh();
  };

  if (leases.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No lease agreements yet
        </h3>
        <p className="text-gray-500 mb-6">
          Create your first lease agreement to get started.
        </p>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create First Lease
        </Button>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lease Agreement</DialogTitle>
            </DialogHeader>
            <LeaseForm
              units={units}
              tenants={tenants}
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
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lease Agreements</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>
              <strong>{leaseSummary.active}</strong> Active
            </span>
            <span>
              <strong>{leaseSummary.expiringSoon}</strong> Expiring Soon
            </span>
            <span>
              <strong>{leaseSummary.terminated}</strong> Terminated
            </span>
            <span>
              <strong>{leaseSummary.expired}</strong> Expired
            </span>
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Lease
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search leases
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search by tenant name, property, or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-48">
            <Label htmlFor="property-filter" className="sr-only">
              Filter by property
            </Label>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
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

          <div className="w-40">
            <Label htmlFor="status-filter" className="sr-only">
              Filter by status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredLeases.length} of {leases.length} lease agreements
      </div>

      {/* Lease Grid */}
      {filteredLeases.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No leases found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => (
            <LeaseCard
              key={lease.id}
              lease={lease}
              onEdit={() => handleEdit(lease)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Lease Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lease Agreement</DialogTitle>
          </DialogHeader>
          <LeaseForm
            units={units}
            tenants={tenants}
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Lease Dialog */}
      <Dialog open={!!editingLease} onOpenChange={() => setEditingLease(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lease Agreement</DialogTitle>
          </DialogHeader>
          {editingLease && (
            <LeaseForm
              lease={{
                id: editingLease.id,
                unitId: editingLease.unitId,
                tenantId: editingLease.tenantId,
                startDate: editingLease.startDate,
                endDate: editingLease.endDate,
                monthlyRent: editingLease.monthlyRent,
                depositPaid: editingLease.depositPaid,
                advancePaid: editingLease.advancePaid,
                dueDate: editingLease.dueDate,
                status: editingLease.status,
              }}
              units={units}
              tenants={tenants}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingLease(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
