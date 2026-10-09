import { Suspense } from 'react';

import { ExpenseReviewPageContent } from '@/features/admin-expenses/components/ExpenseReviewPageContent';

// Reads ?claim= with useSearchParams, which needs a Suspense boundary.
export default function AdminExpenseReviewPage() {
  return (
    <Suspense fallback={null}>
      <ExpenseReviewPageContent />
    </Suspense>
  );
}
