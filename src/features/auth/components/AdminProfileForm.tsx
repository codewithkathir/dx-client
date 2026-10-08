'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { useUpdateProfile } from '@/features/auth/hooks/useUpdateProfile';
import {
  adminProfileSchema,
  type AdminProfileFormValues,
} from '@/features/auth/schemas/profile.schema';
import { adminProfilePhotoUrl } from '@/features/auth/utils/auth-photo.utils';
import { ProfilePhotoUpload } from '@/features/employees/components/ProfilePhotoUpload';
import type { AdminProfile } from '@/types/admin-auth.types';

interface AdminProfileFormProps {
  profile: AdminProfile;
  onDone: () => void;
}

export function AdminProfileForm({ profile, onDone }: AdminProfileFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const updateProfile = useUpdateProfile(AUTH_PORTAL.ADMIN);

  const { register, handleSubmit, formState } = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: { name: profile.name },
  });

  const submit = handleSubmit((values) => {
    updateProfile.mutate(
      { portal: AUTH_PORTAL.ADMIN, fields: values, photo },
      { onSuccess: onDone },
    );
  });

  const hasChanges = formState.isDirty || photo !== null;

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <ProfilePhotoUpload
        value={photo}
        onChange={setPhoto}
        existingPhotoFetchUrl={profile.profilePhoto ? adminProfilePhotoUrl() : null}
        hasExistingPhoto={Boolean(profile.profilePhoto)}
      />

      <FormField label="Full name" htmlFor="name" required error={formState.errors.name?.message}>
        <Input id="name" autoComplete="name" {...register('name')} />
      </FormField>

      <p className="text-xs text-muted-foreground">
        Email, role and status can&apos;t be changed here.
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
