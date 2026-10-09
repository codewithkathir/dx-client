import { Suspense } from 'react';

import { AdminExpensesPageContent } from '@/features/admin-expenses/components/AdminExpensesPageContent';

// Reads ?search= / ?stage= with useSearchParams, which needs a Suspense boundary.
export default function AdminExpensesPage() {
  return (
    <Suspense fallback={null}>
      <AdminExpensesPageContent />
    </Suspense>
  );
}
