'use client';

import { useState } from 'react';
import { ChevronRight, CircleCheck, Clock, PackageCheck } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetIcon } from '@/features/assets/components/AssetIcon';
import { AssetPhotos } from '@/features/assets/components/AssetPhotos';
import { AssetThumb } from '@/features/assets/components/AssetThumb';
import { ASSET_CATEGORY_LABELS, ASSET_CONDITION_LABELS } from '@/features/assets/constants/asset.constants';
import { useAcknowledgeAsset, useMyAssets } from '@/features/assets/hooks/useAssets';
import { shortDate } from '@/features/expenses/utils/claim.utils';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { MyAsset } from '@/types/asset.types';
import { todayIso } from '@/utils/money.utils';

type View = 'current' | 'past';

const isOverdue = (a: MyAsset) => !a.returnedDate && Boolean(a.expectedReturnDate && a.expectedReturnDate < todayIso());
const makeModel = (a: MyAsset) => [a.brand, a.model].filter(Boolean).join(' ');

function AssetRow({ asset, onOpen }: { asset: MyAsset; onOpen: () => void }) {
  const overdue = isOverdue(asset);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors not-first:border-t not-first:border-border hover:bg-muted/50"
    >
      {asset.images[0] ? (
        <AssetThumb
          src={API_ENDPOINTS.EMPLOYEE_ASSETS.IMAGE(asset.assignmentId, asset.images[0].id)}
          alt=""
          className="size-11 shrink-0 rounded-xl"
        />
      ) : (
        <AssetIcon category={asset.category} size="lg" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{asset.name}</span>
        <span className="mt-0.5 mb-1.5 block truncate text-xs text-muted-foreground">
          {[makeModel(asset) || ASSET_CATEGORY_LABELS[asset.category], asset.assetNo].join(' · ')}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {asset.returnedDate ? (
            <Badge variant="muted">Returned {shortDate(asset.returnedDate)}</Badge>
          ) : !asset.acknowledgedAt ? (
            <Badge variant="warning" dot>
              Confirm receipt
            </Badge>
          ) : overdue ? (
            <Badge variant="destructive" dot>
              Return overdue
            </Badge>
          ) : (
            <Badge variant="success" dot>
              With you since {shortDate(asset.assignedDate)}
            </Badge>
          )}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

function Line({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 not-first:border-t not-first:border-border">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className={cn('text-right text-sm font-medium break-words', mono && 'font-mono text-[13px]')}>{children}</dd>
    </div>
  );
}

function AssetSheet({ asset, onClose }: { asset: MyAsset | null; onClose: () => void }) {
  const acknowledge = useAcknowledgeAsset();
  if (!asset) return null;
  const overdue = isOverdue(asset);
  const needsConfirm = !asset.returnedDate && !asset.acknowledgedAt;

  return (
    <BottomSheet open onClose={onClose} title={asset.name} description={<span className="font-mono">{asset.assetNo}</span>}>
      {needsConfirm ? (
        <div className="flex gap-3 rounded-xl bg-status-warning px-3.5 py-3 text-sm text-status-warning-ink">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>Please check the item and confirm you received it. You are responsible for it until it is returned.</p>
        </div>
      ) : null}
      {overdue && !needsConfirm ? (
        <div className="rounded-xl bg-status-danger px-3.5 py-3 text-sm text-status-danger-ink">
          This was due back on {formatExpenseDate(asset.expectedReturnDate!)}. Please return it to your administrator.
        </div>
      ) : null}

      {asset.images.length > 0 ? (
        <AssetPhotos
          compact
          assetName={asset.name}
          images={asset.images}
          srcFor={(imageId) => API_ENDPOINTS.EMPLOYEE_ASSETS.IMAGE(asset.assignmentId, imageId)}
        />
      ) : null}

      <dl className="rounded-[14px] border border-border px-4">
        <Line label="Category">{ASSET_CATEGORY_LABELS[asset.category]}</Line>
        {makeModel(asset) ? <Line label="Make / model">{makeModel(asset)}</Line> : null}
        {asset.serialNo ? (
          <Line label="Serial no." mono>
            {asset.serialNo}
          </Line>
        ) : null}
        <Line label="Assigned on">{formatExpenseDate(asset.assignedDate)}</Line>
        <Line label="Condition given">{ASSET_CONDITION_LABELS[asset.conditionOut]}</Line>
        {!asset.returnedDate ? (
          <Line label="Return by">{asset.expectedReturnDate ? formatExpenseDate(asset.expectedReturnDate) : 'No return date'}</Line>
        ) : null}
        {asset.warrantyExpiry ? <Line label="Warranty until">{formatExpenseDate(asset.warrantyExpiry)}</Line> : null}
        {asset.acknowledgedAt ? <Line label="You confirmed">{formatExpenseDate(asset.acknowledgedAt.slice(0, 10))}</Line> : null}
        {asset.returnedDate ? (
          <>
            <Line label="Returned on">{formatExpenseDate(asset.returnedDate)}</Line>
            {asset.conditionIn ? <Line label="Condition returned">{ASSET_CONDITION_LABELS[asset.conditionIn]}</Line> : null}
          </>
        ) : null}
      </dl>

      {asset.notes || asset.returnNotes ? (
        <div className="space-y-2 text-sm">
          {asset.notes ? (
            <p>
              <span className="text-muted-foreground">Notes: </span>
              {asset.notes}
            </p>
          ) : null}
          {asset.returnNotes ? (
            <p>
              <span className="text-muted-foreground">Return notes: </span>
              {asset.returnNotes}
            </p>
          ) : null}
        </div>
      ) : null}

      {needsConfirm ? (
        <Button
          size="lg"
          className="h-12 w-full text-[15px]"
          loading={acknowledge.isPending}
          onClick={() => acknowledge.mutate(asset.assignmentId, { onSuccess: onClose })}
        >
          <CircleCheck className="size-5" />
          Confirm received
        </Button>
      ) : (
        <Button variant="outline" size="lg" className="h-12 w-full text-[15px]" onClick={onClose}>
          Close
        </Button>
      )}
    </BottomSheet>
  );
}

/** Employee app: the company assets assigned to me, and ones I've returned. */
export function MyAssetsContent() {
  const [view, setView] = useState<View>('current');
  const [openId, setOpenId] = useState<number | null>(null);
  const { data, isLoading, isError, error, refetch } = useMyAssets();
  const list = data ? data[view] : [];
  const toConfirm = data?.current.filter((a) => !a.acknowledgedAt).length ?? 0;
  const open = data ? [...data.current, ...data.past].find((a) => a.assignmentId === openId) ?? null : null;

  return (
    <div className="flex flex-col pb-6">
      <div className="sticky top-0 z-10 bg-background">
        <header className="flex flex-col gap-1 px-5 pt-5 pb-3">
          <h1 className="text-2xl font-semibold tracking-[-0.025em]">My assets</h1>
          <p className="text-[13px] leading-[18px] text-muted-foreground">Company equipment assigned to you.</p>
        </header>
        <div role="radiogroup" aria-label="Show assets" className="flex gap-2 px-5 pt-1 pb-3">
          {(
            [
              { value: 'current', label: 'With me', count: data?.current.length },
              { value: 'past', label: 'Returned', count: data?.past.length },
            ] as const
          ).map((chip) => {
            const on = view === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setView(chip.value)}
                className={cn(
                  'h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors',
                  on ? 'border-primary bg-primary text-primary-foreground' : 'border-input-border bg-card text-[#33415a]',
                )}
              >
                {chip.label}
                {chip.count !== undefined ? ` · ${chip.count}` : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5">
        {isError ? (
          <ErrorPanel title="Couldn't load your assets" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-[240px] rounded-[14px]" />
        ) : (
          <>
            {view === 'current' && toConfirm > 0 ? (
              <div className="flex items-center gap-3 rounded-[14px] bg-status-warning px-4 py-3 text-sm text-status-warning-ink">
                <PackageCheck className="size-5 shrink-0" aria-hidden />
                <span>
                  {toConfirm === 1 ? '1 asset is' : `${toConfirm} assets are`} waiting for you to confirm receipt.
                </span>
              </div>
            ) : null}
            {list.length === 0 ? (
              <div className="rounded-[14px] border border-border bg-card p-6">
                <EmptyState
                  title={view === 'current' ? 'No assets with you' : 'Nothing returned yet'}
                  description={
                    view === 'current'
                      ? 'When your company gives you a laptop, phone or other equipment it shows up here.'
                      : 'Assets you hand back appear here.'
                  }
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-[14px] border border-border bg-card">
                {list.map((asset) => (
                  <AssetRow key={asset.assignmentId} asset={asset} onOpen={() => setOpenId(asset.assignmentId)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AssetSheet asset={open} onClose={() => setOpenId(null)} />
    </div>
  );
}
