import { Suspense } from 'react';

import { AssetsPageContent } from '@/features/assets/components/AssetsPageContent';

export default function AdminAssetsPage() {
  return (
    <Suspense>
      <AssetsPageContent />
    </Suspense>
  );
}
