import { Suspense } from 'react';

import { PayablesPageContent } from '@/features/payables/components/PayablesPageContent';

// PayablesPageContent reads ?bill= with useSearchParams, which needs a Suspense boundary.
export default function AdminPayablesPage() {
  return (
    <Suspense fallback={null}>
      <PayablesPageContent />
    </Suspense>
  );
}
