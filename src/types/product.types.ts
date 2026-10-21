export type ProductStatus = 'active' | 'inactive';

/** A product on the price list, used for invoice lines. Products are never deleted, only made inactive. */
export interface Product {
  id: number;
  code: string | null;
  name: string;
  /** Unit of sale, e.g. "pcs", "kg", "hour". */
  unit: string;
  /** Price per unit, before VAT. */
  unitPrice: number;
  description: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/** Active product for the invoice line picker. */
export interface ProductOption {
  id: number;
  code: string | null;
  name: string;
  unit: string;
  unitPrice: number;
}

export interface ProductPayload {
  code: string | null;
  name: string;
  unit: string;
  unitPrice: number;
  description: string | null;
  status: ProductStatus;
}

export interface ProductListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus | '';
  order?: 'asc' | 'desc';
}
