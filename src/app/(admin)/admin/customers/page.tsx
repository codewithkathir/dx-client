import { Suspense } from 'react';

import { CustomersPageContent } from '@/features/customers/components/CustomersPageContent';

export default function AdminCustomersPage() {
  return (
    <Suspense>
      <CustomersPageContent />
    </Suspense>
  );
}
