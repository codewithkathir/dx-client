'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { CatalogQuickLinks } from '@/features/catalog/components/CatalogQuickLinks';
import { CategoriesTab } from '@/features/catalog/components/CategoriesTab';
import { SubCategoriesTab } from '@/features/catalog/components/SubCategoriesTab';
import { SubSubCategoriesTab } from '@/features/catalog/components/SubSubCategoriesTab';
import type { CatalogTab } from '@/features/catalog/constants/catalog.constants';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { UI_PANEL } from '@/constants/ui.constants';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CategoriesPageContent() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('categories');

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_CATEGORIES}
        description={PAGE_DESCRIPTIONS.ADMIN_CATEGORIES}
      />

      <CatalogQuickLinks activeTab={activeTab} onTabChange={setActiveTab} />

      <Card className={cn(UI_PANEL.content, 'py-4 md:py-6')}>
        {activeTab === 'categories' ? <CategoriesTab /> : null}
        {activeTab === 'sub-categories' ? <SubCategoriesTab /> : null}
        {activeTab === 'sub-sub-categories' ? <SubSubCategoriesTab /> : null}
      </Card>
    </div>
  );
}
