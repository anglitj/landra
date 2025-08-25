"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react";
import { deleteTenant } from "@/lib/actions/tenants";

interface TenantCardProps {
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    propertyName: string;
    propertyId?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    createdAt: Date;
    updatedAt?: Date;
  };
  onEdit?: (tenant: TenantCardProps["tenant"]) => void;
  onDelete?: () => void;
}

export function TenantCard({ tenant, onEdit, onDelete }: TenantCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTenant(tenant.id);
      if (result.success) {
        onDelete?.();
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting tenant:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fullName = `${tenant.firstName} ${tenant.lastName}`;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{fullName}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Active Tenant
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(tenant)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Tenant
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Tenant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              {tenant.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {tenant.phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {tenant.propertyName}
            </div>
          </div>

          {tenant.emergencyContact && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Emergency Contact
              </p>
              <p className="text-sm text-gray-600">
                {tenant.emergencyContact.name} (
                {tenant.emergencyContact.relationship})
              </p>
              <p className="text-sm text-gray-600">
                {tenant.emergencyContact.phone}
              </p>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              Added on {new Date(tenant.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {fullName}? This action cannot be
              undone and will remove all tenant information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Tenant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
