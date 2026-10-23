import apiClient from './client';
import type {
  SavedJob,
  JobApplication,
  JobApplicationRequest,
  CandidateRegisterRequest,
} from '../types/candidate.types';
import type { AuthResponse } from '../types/auth.types';
import type { ApiResponse, PaginatedResponse } from '../types/job.types';

export const candidateService = {
  // Candidate Registration
  register: async (data: CandidateRegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  // Saved Jobs
  saveJob: async (jobId: number): Promise<SavedJob> => {
    const response = await apiClient.post<ApiResponse<SavedJob>>(`/candidate/saved-jobs/${jobId}`);
    return response.data.data;
  },

  unsaveJob: async (jobId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/candidate/saved-jobs/${jobId}`);
  },

  checkSaved: async (jobId: number): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ isSaved: boolean }>>(
      `/candidate/saved-jobs/${jobId}/check`
    );
    return response.data.data.isSaved;
  },

  checkApplied: async (jobId: number): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ isApplied: boolean }>>(
      `/candidate/applications/${jobId}/check`
    );
    return response.data.data.isApplied;
  },

  getSavedJobs: async (
    page: number = 0,
    size: number = 10,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<SavedJob>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SavedJob>>>(
      '/candidate/saved-jobs',
      {
        params: { page, size },
        signal,
      }
    );
    return response.data.data;
  },

  // Applications
  apply: async (data: JobApplicationRequest): Promise<JobApplication> => {
    const response = await apiClient.post<ApiResponse<JobApplication>>(
      '/candidate/applications',
      data
    );
    return response.data.data;
  },

  getApplications: async (
    page: number = 0,
    size: number = 10,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<JobApplication>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<JobApplication>>>(
      '/candidate/applications',
      {
        params: { page, size },
        signal,
      }
    );
    return response.data.data;
  },

  getApplicationById: async (
    applicationId: number,
    signal?: AbortSignal
  ): Promise<JobApplication> => {
    const response = await apiClient.get<ApiResponse<JobApplication>>(
      `/candidate/applications/${applicationId}`,
      { signal }
    );
    return response.data.data;
  },

  withdrawApplication: async (applicationId: number): Promise<JobApplication> => {
    const response = await apiClient.patch<ApiResponse<JobApplication>>(
      `/candidate/applications/${applicationId}/withdraw`
    );
    return response.data.data;
  },
};

export default candidateService;
