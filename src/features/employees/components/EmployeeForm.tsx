'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { ProfilePhotoUpload } from '@/features/employees/components/ProfilePhotoUpload';
import { employeeProfilePhotoUrl } from '@/features/employees/utils/employee-photo.utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EMPLOYEE_STATUS_OPTIONS } from '@/features/employees/constants/employee.constants';
import {
  createEmployeeSchema,
  employeeFormSchema,
  type EmployeeFormValues,
} from '@/features/employees/schemas/employee.schema';
import type { Employee } from '@/types/employee.types';
import { employeeToFormValues } from '@/features/employees/utils/employee.mappers';

const EMPTY_DEFAULTS: EmployeeFormValues = {
  empName: '',
  companyName: '',
  dob: '',
  homeAddress: '',
  cityState: '',
  country: 'UAE',
  phoneNo: '',
  whatsappNo: '',
  emiratesIdNo: '',
  emiratesIdExpiryDate: '',
  visaExpiryDate: '',
  passportNo: '',
  passportExpiryDate: '',
  drivingLicenseNo: '',
  drivingLicenseExpiryDate: '',
  email: '',
  password: '',
  status: 'active',
  comments: '',
  role: 'employee',
};

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  employee?: Employee;
  isSubmitting?: boolean;
  onSubmit: (values: EmployeeFormValues, profilePhoto?: File | null) => void;
  onCancel: () => void;
}

export function EmployeeForm({
  mode,
  employee,
  isSubmitting,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const schema = mode === 'create' ? createEmployeeSchema : employeeFormSchema;

  const { register, handleSubmit, formState } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: employee ? employeeToFormValues(employee) : EMPTY_DEFAULTS,
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profileError, setProfileError] = useState<string | undefined>();

  const submit = handleSubmit((values) => {
    if (mode === 'create' && !profilePhoto) {
      setProfileError('Profile photo is required');
      return;
    }
    setProfileError(undefined);
    onSubmit(values, profilePhoto);
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <ProfilePhotoUpload
        value={profilePhoto}
        onChange={(file) => {
          setProfilePhoto(file);
          if (file) setProfileError(undefined);
        }}
        existingPhotoFetchUrl={
          employee?.profilePhoto && employee?.id ? employeeProfilePhotoUrl(employee.id) : null
        }
        hasExistingPhoto={Boolean(employee?.profilePhoto)}
        required={mode === 'create'}
        error={profileError}
      />

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Personal</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="empName" required error={formState.errors.empName?.message}>
            <Input id="empName" {...register('empName')} />
          </FormField>
          <FormField label="Company" htmlFor="companyName" required error={formState.errors.companyName?.message}>
            <Input id="companyName" {...register('companyName')} />
          </FormField>
          <FormField label="Date of birth" htmlFor="dob" required error={formState.errors.dob?.message}>
            <Input id="dob" type="date" {...register('dob')} />
          </FormField>
          <FormField label="Status" htmlFor="status" required error={formState.errors.status?.message}>
            <Select id="status" {...register('status')}>
              {EMPLOYEE_STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Contact & address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="email" required error={formState.errors.email?.message}>
            <Input id="email" type="email" autoComplete="off" {...register('email')} />
          </FormField>
          {mode === 'create' ? (
            <FormField label="Password" htmlFor="password" required error={formState.errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            </FormField>
          ) : (
            <FormField label="New password" htmlFor="password" error={formState.errors.password?.message}>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                {...register('password')}
              />
            </FormField>
          )}
          <FormField label="Phone" htmlFor="phoneNo" required error={formState.errors.phoneNo?.message}>
            <Input id="phoneNo" {...register('phoneNo')} />
          </FormField>
          <FormField label="WhatsApp" htmlFor="whatsappNo" error={formState.errors.whatsappNo?.message}>
            <Input id="whatsappNo" {...register('whatsappNo')} />
          </FormField>
          <FormField label="Home address" htmlFor="homeAddress" required error={formState.errors.homeAddress?.message} className="sm:col-span-2">
            <Input id="homeAddress" {...register('homeAddress')} />
          </FormField>
          <FormField label="City / State" htmlFor="cityState" required error={formState.errors.cityState?.message}>
            <Input id="cityState" {...register('cityState')} />
          </FormField>
          <FormField label="Country" htmlFor="country" required error={formState.errors.country?.message}>
            <Input id="country" {...register('country')} />
          </FormField>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Emirates ID" htmlFor="emiratesIdNo" required error={formState.errors.emiratesIdNo?.message}>
            <Input id="emiratesIdNo" {...register('emiratesIdNo')} />
          </FormField>
          <FormField label="Emirates ID expiry" htmlFor="emiratesIdExpiryDate" required error={formState.errors.emiratesIdExpiryDate?.message}>
            <Input id="emiratesIdExpiryDate" type="date" {...register('emiratesIdExpiryDate')} />
          </FormField>
          <FormField label="Visa expiry" htmlFor="visaExpiryDate" required error={formState.errors.visaExpiryDate?.message}>
            <Input id="visaExpiryDate" type="date" {...register('visaExpiryDate')} />
          </FormField>
          <FormField label="Passport no." htmlFor="passportNo" required error={formState.errors.passportNo?.message}>
            <Input id="passportNo" {...register('passportNo')} />
          </FormField>
          <FormField label="Passport expiry" htmlFor="passportExpiryDate" required error={formState.errors.passportExpiryDate?.message}>
            <Input id="passportExpiryDate" type="date" {...register('passportExpiryDate')} />
          </FormField>
          <FormField label="Driving license" htmlFor="drivingLicenseNo" error={formState.errors.drivingLicenseNo?.message}>
            <Input id="drivingLicenseNo" {...register('drivingLicenseNo')} />
          </FormField>
          <FormField label="License expiry" htmlFor="drivingLicenseExpiryDate" error={formState.errors.drivingLicenseExpiryDate?.message}>
            <Input id="drivingLicenseExpiryDate" type="date" {...register('drivingLicenseExpiryDate')} />
          </FormField>
        </div>
      </section>

      <FormField label="Comments" htmlFor="comments" error={formState.errors.comments?.message}>
        <Textarea id="comments" rows={3} {...register('comments')} />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create employee' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
