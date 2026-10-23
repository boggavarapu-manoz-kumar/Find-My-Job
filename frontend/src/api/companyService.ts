import apiClient from './client';
import type { AxiosError } from 'axios';

export interface CompanyResponse {
  id: number;
  name: string;
  normalizedName: string;
  slug: string;
  logoAssetId?: string | null;
  logoPublicId?: string | null;
  logoUrl?: string | null;
  logoAltText?: string | null;
  websiteUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCreatePayload {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export const companyService = {
  /**
   * Search companies with debounced autocomplete query.
   */
  async searchCompanies(query: string, limit: number = 10): Promise<CompanyResponse[]> {
    if (!query || !query.trim()) return [];
    try {
      const response = await apiClient.get<{ success: boolean; data: CompanyResponse[] }>(
        '/public/companies/search',
        { params: { query: query.trim(), limit } }
      );
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Retrieve company details by numeric ID.
   */
  async getCompanyById(id: number): Promise<CompanyResponse | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CompanyResponse }>(
        `/public/companies/${id}`
      );
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Admin: Create a new company.
   */
  async createCompany(payload: CompanyCreatePayload): Promise<CompanyResponse> {
    const response = await apiClient.post<{ success: boolean; data: CompanyResponse }>(
      '/admin/companies',
      payload
    );
    return response.data.data;
  },

  /**
   * Admin: Upload or replace a company logo via secure backend → Cloudinary pipeline.
   *
   * Uses a 60 s timeout because Cloudinary processing on the free tier can take
   * 10–20 s on first upload. Retries once automatically on transient 502/503/504.
   */
  async uploadCompanyLogo(companyId: number, file: File, attempt = 0): Promise<CompanyResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<{ success: boolean; data: CompanyResponse; message?: string }>(
        `/admin/companies/${companyId}/logo`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000, // Cloudinary upload can take up to 30 s on free tier
        }
      );
      return response.data.data;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;
      const serverMsg = axiosErr.response?.data?.message;

      // Retry once on transient gateway/timeout errors
      if (attempt < 1 && (!status || [502, 503, 504].includes(status) || axiosErr.code === 'ECONNABORTED')) {
        await new Promise((r) => setTimeout(r, 2000));
        return this.uploadCompanyLogo(companyId, file, attempt + 1);
      }

      if (status === 503) {
        throw new Error(
          serverMsg ||
          'Logo upload service is not available. Please ensure Cloudinary credentials are configured on the server.'
        );
      }
      throw new Error(serverMsg || axiosErr.message || 'Logo upload failed. Please try again.');
    }
  },

  /**
   * Admin: Remove company logo from Cloudinary and clear company record.
   */
  async removeCompanyLogo(companyId: number): Promise<void> {
    await apiClient.delete(`/admin/companies/${companyId}/logo`);
  },
};

export default companyService;

