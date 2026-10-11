export const BRANDING_IMAGE_KINDS = ['logo', 'signature', 'stamp'] as const;
export type BrandingImageKind = (typeof BRANDING_IMAGE_KINDS)[number];

export interface InvoiceBranding {
  /** Saved file paths; load them through API_ENDPOINTS.INVOICE_BRANDING.IMAGE. */
  logo: string | null;
  signature: string | null;
  stamp: string | null;
  signatoryName: string | null;
  signatoryTitle: string | null;
  updatedAt: string;
}

export interface InvoiceBrandingPayload {
  signatoryName: string | null;
  signatoryTitle: string | null;
}
