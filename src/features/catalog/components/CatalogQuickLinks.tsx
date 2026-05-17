'use client';

import { Fragment } from 'react';
import { ChevronRight, FolderTree, GitBranch, Layers3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  CATALOG_TABS,
  type CatalogTab,
} from '@/features/catalog/constants/catalog.constants';
import { cn } from '@/lib/utils';

const TAB_ICONS: Record<CatalogTab, LucideIcon> = {
  categories: FolderTree,
  'sub-categories': GitBranch,
  'sub-sub-categories': Layers3,
};

interface CatalogQuickLinksProps {
  activeTab: CatalogTab;
  onTabChange: (tab: CatalogTab) => void;
}

export function CatalogQuickLinks({ activeTab, onTabChange }: CatalogQuickLinksProps) {
  return (
    <nav aria-label="Catalog hierarchy" className="w-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
        {CATALOG_TABS.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = activeTab === tab.id;

          return (
            <Fragment key={tab.id}>
              {index > 0 ? (
                <div className="flex items-center justify-center md:w-6 md:shrink-0">
                  <ChevronRight
                    className="size-5 rotate-90 text-muted-foreground/40 md:rotate-0"
                    aria-hidden
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex w-full min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/35 hover:bg-accent/50',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>

                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold leading-tight',
                        isActive ? 'text-foreground' : 'text-foreground/90',
                      )}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        isActive
                          ? 'bg-primary/80 text-primary-foreground'
                          : 'bg-muted/80 text-muted-foreground',
                      )}
                    >
                      {tab.level}
                    </span>
                  </span>
                  <span className="block text-xs leading-snug text-muted-foreground">
                    {tab.description}
                  </span>
                </span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
