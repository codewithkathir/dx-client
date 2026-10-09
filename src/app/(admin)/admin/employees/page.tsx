import { Suspense } from 'react';

import { EmployeesPageContent } from '@/features/employees/components/EmployeesPageContent';

export default function AdminEmployeesPage() {
  return (
    <Suspense>
      <EmployeesPageContent />
    </Suspense>
  );
}
