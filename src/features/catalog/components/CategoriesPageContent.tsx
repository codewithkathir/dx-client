'use client';

import { FolderTree } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { CategoriesTab } from '@/features/catalog/components/CategoriesTab';
import { SubCategoriesTab } from '@/features/catalog/components/SubCategoriesTab';
import { SubSubCategoriesTab } from '@/features/catalog/components/SubSubCategoriesTab';
import type { CatalogTab } from '@/features/catalog/constants/catalog.constants';
import {
  useCategories,
  useSubCategories,
  useSubSubCategories,
} from '@/features/catalog/hooks/useCatalogQueries';
import { cn } from '@/lib/utils';

const COUNT_QUERY = { page: 1, limit: 1 } as const;

const LEVELS: Array<{ id: CatalogTab; stat: string; tab: string; hint: string; icon: LucideIcon }> = [
  { id: 'categories', stat: 'Main categories', tab: 'Categories', hint: 'Level 1 · e.g. Travel, Meals', icon: FolderTree },
  { id: 'sub-categories', stat: 'Sub categories', tab: 'Sub categories', hint: 'Level 2 · e.g. Travel › Taxi', icon: FolderTree },
  { id: 'sub-sub-categories', stat: 'Sub sub categories', tab: 'Sub sub categories', hint: 'Level 3 · optional detail', icon: FolderTree },
];

/** Design "Categories": clickable level cards above one card holding the level tabs. */
export function CategoriesPageContent() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('categories');
  const counts: Record<CatalogTab, number | undefined> = {
    categories: useCategories(COUNT_QUERY).data?.meta.total,
    'sub-categories': useSubCategories(COUNT_QUERY).data?.meta.total,
    'sub-sub-categories': useSubSubCategories(COUNT_QUERY).data?.meta.total,
  };

  return (
    <div className="space-y-5">
      <PageHeader title={PAGE_TITLES.ADMIN_CATEGORIES} description={PAGE_DESCRIPTIONS.ADMIN_CATEGORIES} />

      <section aria-label="Catalog levels" className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {LEVELS.map(({ id, stat, hint, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-start justify-between gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                active ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40',
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{stat}</p>
                {counts[id] === undefined ? (
                  <Skeleton className="mt-2 h-8 w-12" />
                ) : (
                  <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{counts[id]}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </div>
              <Icon className={cn('size-5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
            </button>
          );
        })}
      </section>

      <Card className="gap-0 py-0" aria-label="Categories">
        <div role="tablist" aria-label="Catalog level" className="flex flex-wrap border-b border-border px-5">
          {LEVELS.map(({ id, tab }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex h-12 items-center gap-2 px-3 text-sm transition-colors',
                  selected
                    ? 'font-semibold text-primary shadow-[inset_0_-2px_0_var(--primary)]'
                    : 'font-medium text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
                {counts[id] !== undefined ? (
                  <span
                    className={cn(
                      'rounded-full px-2 py-px text-xs font-semibold tabular-nums',
                      selected ? 'bg-brand-blue-50 text-brand-blue-hover' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {counts[id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div role="tabpanel">
          {activeTab === 'categories' ? <CategoriesTab /> : null}
          {activeTab === 'sub-categories' ? <SubCategoriesTab /> : null}
          {activeTab === 'sub-sub-categories' ? <SubSubCategoriesTab /> : null}
        </div>
      </Card>
    </div>
  );
}
