import { Suspense } from 'react';

import { SuppliersPageContent } from '@/features/suppliers/components/SuppliersPageContent';

export default function AdminSuppliersPage() {
  return (
    <Suspense>
      <SuppliersPageContent />
    </Suspense>
  );
}
