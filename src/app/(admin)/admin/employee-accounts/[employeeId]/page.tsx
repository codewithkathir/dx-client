import { notFound } from 'next/navigation';

import { EmployeeAccountDetailContent } from '@/features/employee-accounts/components/EmployeeAccountDetailContent';

export default async function AdminEmployeeAccountPage({ params }: { params: Promise<{ employeeId: string }> }) {
  const { employeeId } = await params;
  const id = Number(employeeId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <EmployeeAccountDetailContent employeeId={id} />;
}
