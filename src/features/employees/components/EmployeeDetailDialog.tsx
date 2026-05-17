'use client';

import { Pencil } from 'lucide-react';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmployeeAvatar } from '@/features/employees/components/EmployeeAvatar';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/employee.types';

interface EmployeeDetailDialogProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function EmployeeDetailDialog({
  employee,
  open,
  onClose,
  onEdit,
}: EmployeeDetailDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Employee details</DialogTitle>
          <DialogDescription>View profile and document information.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="mb-6 flex items-center gap-4">
            <EmployeeAvatar
              employeeId={employee.id}
              name={employee.empName}
              hasProfilePhoto={Boolean(employee.profilePhoto)}
              size="lg"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-lg font-semibold">{employee.empName}</p>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
              <StatusBadge status={employee.status} />
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Company" value={employee.companyName} />
            <DetailItem label="Phone" value={employee.phoneNo} />
            <DetailItem label="WhatsApp" value={employee.whatsappNo ?? '—'} />
            <DetailItem label="Date of birth" value={employee.dob} />
            <DetailItem label="City / State" value={employee.cityState} />
            <DetailItem label="Country" value={employee.country} />
            <DetailItem label="Home address" value={employee.homeAddress} className="sm:col-span-2" />
            <DetailItem label="Emirates ID" value={employee.emiratesIdNo} />
            <DetailItem label="Emirates ID expiry" value={employee.emiratesIdExpiryDate} />
            <DetailItem label="Visa expiry" value={employee.visaExpiryDate} />
            <DetailItem label="Passport" value={employee.passportNo} />
            <DetailItem label="Passport expiry" value={employee.passportExpiryDate} />
            <DetailItem label="Driving license" value={employee.drivingLicenseNo ?? '—'} />
            <DetailItem label="License expiry" value={employee.drivingLicenseExpiryDate ?? '—'} />
            <DetailItem label="Role" value={employee.role} />
            <DetailItem
              label="Comments"
              value={employee.comments?.trim() ? employee.comments : '—'}
              className="sm:col-span-2"
            />
          </dl>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={() => onEdit(employee)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
