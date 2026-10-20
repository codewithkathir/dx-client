import { notFound } from 'next/navigation';

import { VehicleDetailContent } from '@/features/vehicles/components/VehicleDetailContent';

export default async function AdminVehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) notFound();
  return <VehicleDetailContent vehicleId={vehicleId} />;
}
