'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { DatePicker } from '@/components/forms/DatePicker';
import { CountrySelect } from '@/components/forms/CountrySelect';
import { FormField } from '@/components/forms/FormField';
import { todayIso } from '@/utils/money.utils';
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

  const { register, handleSubmit, formState, control } = useForm<EmployeeProfileFormValues>({
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
          <Controller
            control={control}
            name="dob"
            render={({ field }) => (
              <DatePicker
                id="dob"
                max={todayIso()}
                yearDropdown
                aria-invalid={errors.dob ? true : undefined}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
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
          <CountrySelect
            portal={AUTH_PORTAL.USER}
            id="country"
            savedValue={profile.country}
            {...register('country', { deps: ['phoneNo', 'whatsappNo'] })}
          />
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
        <Button loading={updateProfile.isPending} type="submit" disabled={!hasChanges || updateProfile.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
