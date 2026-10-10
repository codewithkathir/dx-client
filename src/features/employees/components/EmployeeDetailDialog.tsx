'use client';

import Link from 'next/link';
import { Calendar, CreditCard, File, IdCard, Laptop, Pen, type LucideIcon } from 'lucide-react';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { EmployeeAvatar } from '@/features/employees/components/EmployeeAvatar';
import { formatExpenseDate, parseExpenseDate } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/employee.types';

interface EmployeeDetailDialogProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

/** Documents expiring within this many days are highlighted. */
const EXPIRY_WARNING_DAYS = 90;
const DAY_MS = 86_400_000;

type Expiry = { label: string; variant: 'success' | 'warning' | 'destructive' };

function expiryStatus(date: string | null): Expiry | null {
  if (!date) return null;
  const expires = parseExpenseDate(date);
  if (Number.isNaN(expires.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((expires.getTime() - today.getTime()) / DAY_MS);
  if (days < 0) return { label: 'Expired', variant: 'destructive' };
  if (days <= EXPIRY_WARNING_DAYS) return { label: days === 0 ? 'Today' : `In ${days} days`, variant: 'warning' };
  return { label: `Exp. ${expires.getFullYear()}`, variant: 'success' };
}

function Detail({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words">{children}</dd>
    </div>
  );
}

function DocumentCard({
  icon: Icon,
  label,
  value,
  expiry,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  expiry: Expiry | null;
}) {
  const attention = expiry && expiry.variant !== 'success';
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3.5 py-3',
        attention ? 'border-[#f3dfb3] bg-[#fffbf2]' : 'border-border',
        expiry?.variant === 'destructive' && 'border-[color-mix(in_oklch,var(--destructive)_30%,var(--card))] bg-status-danger/40',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-[10px]',
          attention ? 'bg-status-warning text-status-warning-ink' : 'bg-brand-blue-50 text-primary',
        )}
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
      {expiry ? <Badge variant={expiry.variant}>{expiry.label}</Badge> : null}
    </div>
  );
}

/** Design "ModalEmployeeDetail": profile, contact & address, document cards with expiry, comments. */
export function EmployeeDetailDialog({ employee, open, onClose, onEdit }: EmployeeDetailDialogProps) {
  if (!employee) return null;

  const documents = [
    {
      icon: IdCard,
      label: 'Emirates ID',
      value: employee.emiratesIdNo,
      expiry: expiryStatus(employee.emiratesIdExpiryDate),
    },
    {
      icon: File,
      label: 'Passport',
      value: employee.passportNo,
      expiry: expiryStatus(employee.passportExpiryDate),
    },
    {
      icon: Calendar,
      label: 'Visa expiry',
      value: formatExpenseDate(employee.visaExpiryDate),
      expiry: expiryStatus(employee.visaExpiryDate),
    },
    {
      icon: CreditCard,
      label: 'Driving license',
      value: employee.drivingLicenseNo ?? '—',
      expiry: expiryStatus(employee.drivingLicenseExpiryDate),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[720px]" onClose={onClose}>
        <DialogIconHeader icon={IdCard} title="Employee details" description="View profile and document information." />
        <DialogBody className="flex flex-col gap-[22px]">
          <div className="flex items-center gap-4">
            <EmployeeAvatar
              employeeId={employee.id}
              name={employee.empName}
              hasProfilePhoto={Boolean(employee.profilePhoto)}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-semibold">{employee.empName}</div>
              <div className="truncate text-sm text-muted-foreground">
                {employee.email}
                {employee.role ? ` · ${employee.role}` : ''}
              </div>
            </div>
            <StatusBadge status={employee.status} />
          </div>

          <section aria-labelledby="emp-contact">
            <h3 id="emp-contact" className="mb-2.5 text-xs font-semibold tracking-[.04em] text-muted-foreground uppercase">
              Contact &amp; address
            </h3>
            <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              <Detail label="Phone">{employee.phoneNo}</Detail>
              <Detail label="WhatsApp">{employee.whatsappNo ?? '—'}</Detail>
              <Detail label="Company">{employee.companyName}</Detail>
              <Detail label="Date of birth">{employee.dob ? formatExpenseDate(employee.dob) : '—'}</Detail>
              <Detail label="Home address" wide>
                {employee.homeAddress}
              </Detail>
              <Detail label="City / State">{employee.cityState}</Detail>
              <Detail label="Country">{employee.country}</Detail>
            </dl>
          </section>

          <section aria-labelledby="emp-docs">
            <h3 id="emp-docs" className="mb-2.5 text-xs font-semibold tracking-[.04em] text-muted-foreground uppercase">
              Documents
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {documents.map((doc) => (
                <DocumentCard key={doc.label} {...doc} />
              ))}
            </div>
          </section>

          <section aria-labelledby="emp-comments">
            <h3 id="emp-comments" className="mb-2.5 text-xs font-semibold tracking-[.04em] text-muted-foreground uppercase">
              Comments
            </h3>
            <p className="text-sm leading-[21px] text-[#33415a]">{employee.comments?.trim() ? employee.comments : '—'}</p>
          </section>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" size="lg" render={<Link href={`${ADMIN_ROUTES.ASSETS}?employee=${employee.id}`} />}>
            <Laptop className="size-4" />
            View assets
          </Button>
          <Button type="button" size="lg" onClick={() => onEdit(employee)}>
            <Pen className="size-4" />
            Edit employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
