import { Suspense } from 'react';

import { ReceivablesPageContent } from '@/features/receivables/components/ReceivablesPageContent';

// ReceivablesPageContent reads ?invoice= with useSearchParams, which needs a Suspense boundary.
export default function AdminReceivablesPage() {
  return (
    <Suspense fallback={null}>
      <ReceivablesPageContent />
    </Suspense>
  );
}
