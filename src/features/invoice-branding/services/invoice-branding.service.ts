import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type { BrandingImageKind, InvoiceBranding, InvoiceBrandingPayload } from '@/types/invoice-branding.types';

class InvoiceBrandingService extends BaseService {
  getBranding(): Promise<InvoiceBranding> {
    return this.get<InvoiceBranding>(API_ENDPOINTS.INVOICE_BRANDING.DETAIL);
  }

  update(payload: InvoiceBrandingPayload): Promise<InvoiceBranding> {
    return this.put<InvoiceBranding>(API_ENDPOINTS.INVOICE_BRANDING.DETAIL, payload);
  }

  uploadImage(kind: BrandingImageKind, file: File): Promise<InvoiceBranding> {
    const formData = new FormData();
    formData.append('image', file);
    return this.put<InvoiceBranding>(API_ENDPOINTS.INVOICE_BRANDING.IMAGE(kind), formData);
  }

  removeImage(kind: BrandingImageKind): Promise<InvoiceBranding> {
    return this.delete<InvoiceBranding>(API_ENDPOINTS.INVOICE_BRANDING.IMAGE(kind));
  }
}

export const invoiceBrandingService = new InvoiceBrandingService();
