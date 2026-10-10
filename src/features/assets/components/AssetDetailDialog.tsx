'use client';

import { CircleCheck, Clock, Pen, Trash, Undo2, UserPlus } from 'lucide-react';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AssetIcon } from '@/features/assets/components/AssetIcon';
import { AssetPhotos } from '@/features/assets/components/AssetPhotos';
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_VARIANT,
} from '@/features/assets/constants/asset.constants';
import { useAsset, useAssetMutations } from '@/features/assets/hooks/useAssets';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { AssetDetail } from '@/types/asset.types';
import { formatMoney, todayIso } from '@/utils/money.utils';

interface AssetDetailDialogProps {
  assetId: number | null;
  onClose: () => void;
  onEdit: (asset: AssetDetail) => void;
  onAssign: (asset: AssetDetail) => void;
  onReturn: (asset: AssetDetail) => void;
  onDelete: (asset: AssetDetail) => void;
}

function Detail({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-sm font-medium break-words', mono && 'font-mono text-[13px]')}>{children}</dd>
    </div>
  );
}

export function AssetDetailDialog({ assetId, onClose, onEdit, onAssign, onReturn, onDelete }: AssetDetailDialogProps) {
  const { data: asset, isLoading, isError, error } = useAsset(assetId);
  const { addImage, removeImage } = useAssetMutations();
  if (assetId === null) return null;
  const current = asset?.currentAssignment ?? null;
  const warrantyOver = Boolean(asset?.warrantyExpiry && asset.warrantyExpiry < todayIso());

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[800px]">
        <DialogHeader className="flex-row items-start gap-3.5">
          {asset ? <AssetIcon category={asset.category} size="lg" /> : isError ? null : <Skeleton className="size-11 rounded-xl" />}
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <DialogTitle>{asset?.name ?? 'Asset'}</DialogTitle>
              {asset ? (
                <Badge variant={ASSET_STATUS_VARIANT[asset.status]} dot>
                  {ASSET_STATUS_LABELS[asset.status]}
                </Badge>
              ) : null}
            </div>
            <p className="font-mono text-[13px] text-muted-foreground">{asset?.assetNo ?? ' '}</p>
          </div>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          {isError ? (
            <ErrorPanel title="Couldn't load this asset" message={error?.message ?? 'It may have been deleted.'} />
          ) : isLoading || !asset ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              {current ? (
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-sm',
                    current.isOverdue ? 'bg-status-danger text-status-danger-ink' : 'bg-brand-blue-50 text-brand-blue-hover',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">
                      With {current.employeeName}
                      {current.employeeCode ? ` (${current.employeeCode})` : ''}
                    </div>
                    <div className="text-[13px] opacity-90">
                      Since {formatExpenseDate(current.assignedDate)}
                      {current.expectedReturnDate
                        ? ` · ${current.isOverdue ? 'was due back' : 'return by'} ${formatExpenseDate(current.expectedReturnDate)}`
                        : ' · no return date'}
                    </div>
                  </div>
                  {current.acknowledgedAt ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-status-success-ink">
                      <CircleCheck className="size-4" aria-hidden />
                      Receipt confirmed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-status-warning-ink">
                      <Clock className="size-4" aria-hidden />
                      Waiting for employee to confirm
                    </span>
                  )}
                </div>
              ) : null}

              <dl className="grid gap-x-5 gap-y-3.5 sm:grid-cols-3">
                <Detail label="Category">{ASSET_CATEGORY_LABELS[asset.category]}</Detail>
                <Detail label="Make / model">{[asset.brand, asset.model].filter(Boolean).join(' ') || '—'}</Detail>
                <Detail label="Serial no." mono>
                  {asset.serialNo ?? '—'}
                </Detail>
                <Detail label="Condition">{ASSET_CONDITION_LABELS[asset.condition]}</Detail>
                <Detail label="Purchased">
                  {asset.purchaseDate ? formatExpenseDate(asset.purchaseDate) : '—'}
                  {asset.purchaseCost != null ? ` · ${formatMoney(asset.purchaseCost)}` : ''}
                </Detail>
                <Detail label="Warranty until">
                  <span className={warrantyOver ? 'text-destructive' : undefined}>
                    {asset.warrantyExpiry ? formatExpenseDate(asset.warrantyExpiry) : '—'}
                    {warrantyOver ? ' · expired' : ''}
                  </span>
                </Detail>
                {asset.notes ? (
                  <div className="sm:col-span-3">
                    <dt className="text-[13px] text-muted-foreground">Notes</dt>
                    <dd className="mt-0.5 text-sm whitespace-pre-line">{asset.notes}</dd>
                  </div>
                ) : null}
              </dl>

              <section aria-labelledby="asset-photos">
                <h3 id="asset-photos" className="mb-2 text-sm font-semibold">
                  Photos
                </h3>
                <AssetPhotos
                  assetName={asset.name}
                  images={asset.images}
                  srcFor={(imageId) => API_ENDPOINTS.ASSETS.IMAGE(asset.id, imageId)}
                  onAdd={(file) => addImage.mutate({ id: asset.id, file })}
                  onRemove={(imageId) => removeImage.mutate({ id: asset.id, imageId })}
                  adding={addImage.isPending}
                  removingId={removeImage.isPending ? removeImage.variables?.imageId : null}
                />
              </section>

              <section aria-labelledby="asset-history">
                <h3 id="asset-history" className="mb-2 text-sm font-semibold">
                  Hand-over history
                </h3>
                {asset.history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                    Never assigned yet.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead>Returned</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {asset.history.map((h) => (
                          <TableRow key={h.id}>
                            <TableCell className="font-medium whitespace-nowrap">{h.employeeName ?? '—'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatExpenseDate(h.assignedDate)}
                              {h.assignedByName ? <div className="text-xs text-muted-foreground">by {h.assignedByName}</div> : null}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {h.returnedDate ? (
                                formatExpenseDate(h.returnedDate)
                              ) : (
                                <Badge variant="secondary">Current</Badge>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {ASSET_CONDITION_LABELS[h.conditionOut]}
                              {h.conditionIn ? ` → ${ASSET_CONDITION_LABELS[h.conditionIn]}` : ''}
                            </TableCell>
                            <TableCell className="max-w-56 text-[13px] text-muted-foreground">
                              {[h.notes, h.returnNotes && `Return: ${h.returnNotes}`].filter(Boolean).join(' · ') || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            </>
          )}
        </DialogBody>
        <DialogFooter className="justify-between sm:justify-between">
          <div>
            {asset && asset.status !== 'assigned' ? (
              <Button variant="ghost" size="lg" className="text-destructive hover:text-destructive" onClick={() => onDelete(asset)}>
                <Trash className="size-4" />
                Delete
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {asset ? (
              <Button variant="outline" size="lg" onClick={() => onEdit(asset)}>
                <Pen className="size-4" />
                Edit
              </Button>
            ) : null}
            {asset?.status === 'assigned' ? (
              <Button size="lg" onClick={() => onReturn(asset)}>
                <Undo2 className="size-4" />
                Record return
              </Button>
            ) : asset?.status === 'available' ? (
              <Button size="lg" onClick={() => onAssign(asset)}>
                <UserPlus className="size-4" />
                Assign
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
