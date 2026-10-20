'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Select } from '@/components/ui/select';
import { useServiceTypes } from '@/features/vehicles/hooks/useVehicles';

interface ServiceTypeSelectProps {
  id: string;
  registration: UseFormRegisterReturn;
}

/** Catalog forms: which vehicle service an approved claim in this (sub) category records. */
export function ServiceTypeSelect({ id, registration }: ServiceTypeSelectProps) {
  const { data } = useServiceTypes({ category: 'vehicle', status: 'active' });
  return (
    <FormField label="Creates vehicle service record" htmlFor={id}>
      <Select id={id} {...registration}>
        <option value="">None — only record the odometer</option>
        {data?.items.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
      <p className="text-xs text-muted-foreground">
        When a claim here is approved, the vehicle gets this record with the claim&apos;s date, km and amount.
      </p>
    </FormField>
  );
}

/** Empty select → null, otherwise the id. */
export const serviceTypeIdValue = (v: unknown) => (v === '' || v === '0' || v == null ? null : Number(v));
