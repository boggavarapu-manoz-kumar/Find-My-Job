import apiClient from './client';

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
   * Admin: Upload or replace company logo via secure backend Cloudinary pipeline.
   */
  async uploadCompanyLogo(companyId: number, file: File): Promise<CompanyResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; data: CompanyResponse }>(
      `/admin/companies/${companyId}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Admin: Remove company logo from Cloudinary and clear company record.
   */
  async removeCompanyLogo(companyId: number): Promise<void> {
    await apiClient.delete(`/admin/companies/${companyId}/logo`);
  },
};

export default companyService;
