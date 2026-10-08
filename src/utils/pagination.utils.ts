export type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

interface PageItemsOptions {
  /** Pages always shown at the start and end. */
  boundaryCount?: number;
  /** Pages shown on each side of the current page. */
  siblingCount?: number;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);
}

/**
 * Page numbers to render, with ellipses for skipped ranges.
 * The item count stays constant once there are enough pages, so the
 * control does not shift width while paging.
 *
 * e.g. getPageItems(6, 11) → [1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 11]
 */
export function getPageItems(
  currentPage: number,
  totalPages: number,
  { boundaryCount = 1, siblingCount = 1 }: PageItemsOptions = {},
): PageItem[] {
  if (totalPages <= 0) return [];

  const page = Math.min(Math.max(currentPage, 1), totalPages);
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages,
  );

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] !== undefined ? endPages[0] - 2 : totalPages - 1,
  );

  const items: PageItem[] = [...startPages];

  if (siblingsStart > boundaryCount + 2) {
    items.push('start-ellipsis');
  } else if (boundaryCount + 1 < totalPages - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < totalPages - boundaryCount - 1) {
    items.push('end-ellipsis');
  } else if (totalPages - boundaryCount > boundaryCount) {
    items.push(totalPages - boundaryCount);
  }

  items.push(...endPages);
  return items;
}
