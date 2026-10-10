import { ASSET_CATEGORY_ICONS } from '@/features/assets/constants/asset.constants';
import { cn } from '@/lib/utils';
import type { AssetCategory } from '@/types/asset.types';

/** Category icon in a rounded tile. */
export function AssetIcon({ category, className, size = 'md' }: { category: AssetCategory; className?: string; size?: 'md' | 'lg' }) {
  const Icon = ASSET_CATEGORY_ICONS[category];
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center bg-brand-blue-50 text-primary',
        size === 'lg' ? 'size-11 rounded-xl' : 'size-9 rounded-[10px]',
        className,
      )}
    >
      <Icon className={size === 'lg' ? 'size-[22px]' : 'size-[18px]'} />
    </span>
  );
}
