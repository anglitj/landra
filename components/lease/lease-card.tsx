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
  FileText,
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  Edit,
  StopCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { terminateLease } from "@/lib/actions/leases";

interface LeaseCardProps {
  lease: {
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
    propertyId?: string;
    propertyName: string;
    createdAt: Date;
  };
  onEdit?: (lease: LeaseCardProps["lease"]) => void;
  onDelete?: () => void;
}

export function LeaseCard({ lease, onEdit, onDelete }: LeaseCardProps) {
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const handleTerminate = async () => {
    setIsTerminating(true);
    try {
      const result = await terminateLease(lease.id);
      if (result.success) {
        onDelete?.();
        setShowTerminateDialog(false);
      }
    } catch (error) {
      console.error("Error terminating lease:", error);
    } finally {
      setIsTerminating(false);
    }
  };

  const endDate = new Date(lease.endDate);
  const today = new Date();
  const isExpiringSoon =
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 60;
  const isExpired = endDate < today;

  const getStatusBadge = () => {
    switch (lease.status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <FileText className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "terminated":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <StopCircle className="w-3 h-3 mr-1" />
            Terminated
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive">
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const getExpiryBadge = () => {
    if (lease.status !== "active") return null;

    if (isExpired) {
      return (
        <Badge variant="destructive" className="ml-2">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }

    if (isExpiringSoon) {
      return (
        <Badge
          variant="outline"
          className="ml-2 border-orange-300 text-orange-700"
        >
          <Clock className="w-3 h-3 mr-1" />
          Expires Soon
        </Badge>
      );
    }

    return null;
  };

  const formatCurrency = (amount: string) => {
    return `₱${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = () => {
    const days = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0
      ? `${days} days remaining`
      : `${Math.abs(days)} days overdue`;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {lease.propertyName} - Unit {lease.unitNumber}
                </CardTitle>
                <div className="flex items-center mt-1">
                  {getStatusBadge()}
                  {getExpiryBadge()}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(lease)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Lease
                </DropdownMenuItem>
                {lease.status === "active" && (
                  <DropdownMenuItem
                    onClick={() => setShowTerminateDialog(true)}
                    className="text-red-600"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Terminate Lease
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tenant Information */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Tenant</h4>
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              {lease.tenantFirstName} {lease.tenantLastName}
            </div>
            <div className="text-sm text-gray-600 ml-6">
              {lease.tenantEmail}
            </div>
          </div>

          {/* Lease Terms */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Lease Terms</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDate(lease.startDate)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDate(lease.endDate)}</span>
              </div>
            </div>
            {lease.status === "active" && (
              <p className="text-xs text-gray-500 ml-6">{getDaysRemaining()}</p>
            )}
          </div>

          {/* Financial Information */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Financial</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  Monthly Rent
                </span>
                <span className="font-semibold">
                  {formatCurrency(lease.monthlyRent)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Security Deposit</span>
                <span>{formatCurrency(lease.depositPaid)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Advance Payment</span>
                <span>{formatCurrency(lease.advancePaid)}</span>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              <strong>Due Date:</strong> {lease.dueDate}
              {lease.dueDate === 1
                ? "st"
                : lease.dueDate === 2
                ? "nd"
                : lease.dueDate === 3
                ? "rd"
                : "th"}{" "}
              of each month
            </p>
            <p className="text-xs text-gray-500">
              <strong>Created:</strong>{" "}
              {new Date(lease.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={showTerminateDialog}
        onOpenChange={setShowTerminateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Lease</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to terminate the lease for{" "}
              {lease.tenantFirstName} {lease.tenantLastName}? This action will
              mark the lease as terminated and make the unit available for new
              tenants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminate}
              disabled={isTerminating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isTerminating ? "Terminating..." : "Terminate Lease"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
