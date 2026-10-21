import apiClient from './client';
import type { ApiResponse, Job, PaginatedResponse } from '../types/job.types';

export interface AdminJobFilterParams {
  page?: number;
  size?: number;
}

export const adminJobService = {
  /**
   * Fetch paginated list of all jobs (including DRAFT and ARCHIVED) for admin dashboard.
   * Endpoint: GET /api/v1/admin/jobs
   */
  async getAdminJobs(params: AdminJobFilterParams = {}): Promise<PaginatedResponse<Job>> {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>('/admin/jobs', {
      params: queryParams,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to retrieve jobs for administration');
  },

  /**
   * Create a new job.
   * Endpoint: POST /api/v1/admin/jobs
   */
  async createJob(jobData: Partial<Job>): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>('/admin/jobs', jobData);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to create job');
  },

  /**
   * Update an existing job.
   * Endpoint: PUT /api/v1/admin/jobs/{id}
   */
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job> {
    const response = await apiClient.put<ApiResponse<Job>>(`/admin/jobs/${id}`, jobData);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to update job');
  },

  /**
   * Update job lifecycle status (e.g. DRAFT <-> PUBLISHED, ARCHIVED).
   * Endpoint: PATCH /api/v1/admin/jobs/{id}/status
   */
  async updateJobStatus(id: number, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<Job> {
    const response = await apiClient.patch<ApiResponse<Job>>(`/admin/jobs/${id}/status`, { status });
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to update job status');
  },

  /**
   * Soft-delete / Archive job.
   * Endpoint: DELETE /api/v1/admin/jobs/{id}
   */
  async archiveJob(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/jobs/${id}`);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to archive job');
    }
  },
};

export default adminJobService;
