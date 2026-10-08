'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { useUpdateProfile } from '@/features/auth/hooks/useUpdateProfile';
import {
  employeeProfileSchema,
  type EmployeeProfileFormValues,
} from '@/features/auth/schemas/profile.schema';
import { employeeSelfProfilePhotoUrl } from '@/features/auth/utils/auth-photo.utils';
import { ProfilePhotoUpload } from '@/features/employees/components/ProfilePhotoUpload';
import type { EmployeeProfile } from '@/types/employee-auth.types';

interface EmployeeProfileFormProps {
  profile: EmployeeProfile;
  onDone: () => void;
}

export function EmployeeProfileForm({ profile, onDone }: EmployeeProfileFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const updateProfile = useUpdateProfile(AUTH_PORTAL.USER);

  const { register, handleSubmit, formState } = useForm<EmployeeProfileFormValues>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: {
      empName: profile.empName,
      dob: profile.dob,
      phoneNo: profile.phoneNo,
      whatsappNo: profile.whatsappNo ?? '',
      homeAddress: profile.homeAddress,
      cityState: profile.cityState,
      country: profile.country,
    },
  });
  const { errors } = formState;

  const submit = handleSubmit((values) => {
    updateProfile.mutate(
      {
        portal: AUTH_PORTAL.USER,
        fields: { ...values, whatsappNo: values.whatsappNo || null },
        photo,
      },
      { onSuccess: onDone },
    );
  });

  const hasChanges = formState.isDirty || photo !== null;

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <ProfilePhotoUpload
        value={photo}
        onChange={setPhoto}
        existingPhotoFetchUrl={profile.profilePhoto ? employeeSelfProfilePhotoUrl() : null}
        hasExistingPhoto={Boolean(profile.profilePhoto)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="empName" required error={errors.empName?.message}>
          <Input id="empName" autoComplete="name" {...register('empName')} />
        </FormField>
        <FormField label="Date of birth" htmlFor="dob" required error={errors.dob?.message}>
          <Input id="dob" type="date" {...register('dob')} />
        </FormField>
        <FormField label="Phone" htmlFor="phoneNo" required error={errors.phoneNo?.message}>
          <Input id="phoneNo" type="tel" autoComplete="tel" {...register('phoneNo')} />
        </FormField>
        <FormField label="WhatsApp" htmlFor="whatsappNo" error={errors.whatsappNo?.message}>
          <Input id="whatsappNo" type="tel" placeholder="Optional" {...register('whatsappNo')} />
        </FormField>
        <FormField label="City / State" htmlFor="cityState" required error={errors.cityState?.message}>
          <Input id="cityState" autoComplete="address-level1" {...register('cityState')} />
        </FormField>
        <FormField label="Country" htmlFor="country" required error={errors.country?.message}>
          <Input id="country" autoComplete="country-name" {...register('country')} />
        </FormField>
        <FormField
          label="Home address"
          htmlFor="homeAddress"
          required
          error={errors.homeAddress?.message}
          className="sm:col-span-2"
        >
          <Textarea id="homeAddress" rows={3} autoComplete="street-address" {...register('homeAddress')} />
        </FormField>
      </div>

      <p className="text-xs text-muted-foreground">
        Email, company and identity documents are managed by your administrator.
      </p>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={updateProfile.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={!hasChanges || updateProfile.isPending}>
          {updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
