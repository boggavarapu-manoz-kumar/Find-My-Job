import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobService } from '../api/jobService';
import apiClient from '../api/client';
import { DEV_FEATURED_JOBS, DEV_LATEST_JOBS } from '../features/jobs/fixtures';

describe('jobService API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    jobService.clearCache();
  });

  describe('getFeaturedJobs', () => {
    it('returns featured jobs on successful API response', async () => {
      const mockJobs = DEV_FEATURED_JOBS.slice(0, 2);
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Featured positions retrieved successfully',
          data: mockJobs,
          timestamp: '2026-10-18T10:00:00Z',
        },
      });

      const result = await jobService.getFeaturedJobs();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe(mockJobs[0].title);
      expect(apiClient.get).toHaveBeenCalledWith('/public/jobs/featured', expect.any(Object));
    });

    it('throws descriptive error on server failure', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          data: { success: false, message: 'Server database error' },
        },
      });

      await expect(jobService.getFeaturedJobs()).rejects.toThrow('Server database error');
    });
  });

  describe('getLatestJobs', () => {
    it('sends query parameters and normalizes pagination properties', async () => {
      const mockJobs = DEV_LATEST_JOBS.slice(0, 2);
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Jobs retrieved successfully',
          data: {
            content: mockJobs,
            pageNumber: 0,
            pageSize: 10,
            totalElements: 2,
            totalPages: 1,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
          },
          timestamp: '2026-10-18T10:00:00Z',
        },
      });

      const result = await jobService.getLatestJobs({
        keyword: 'Stripe',
        category: 'Engineering',
        workMode: 'REMOTE',
        fresher: false,
        page: 0,
        size: 10,
      });

      expect(result.content).toHaveLength(2);
      expect(result.isFirst).toBe(true);
      expect(result.isLast).toBe(true);
      expect(result.totalElements).toBe(2);

      expect(apiClient.get).toHaveBeenCalledWith('/public/jobs', {
        params: {
          keyword: 'Stripe',
          category: 'Engineering',
          workMode: 'REMOTE',
          fresher: false,
          page: 0,
          size: 10,
        },
        signal: undefined,
      });
    });

    it('throws error when listing endpoint fails', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network failure'));

      await expect(jobService.getLatestJobs()).rejects.toThrow('Network failure');
    });
  });

  describe('getJobBySlug', () => {
    it('returns published job data when slug is found', async () => {
      const targetJob = DEV_FEATURED_JOBS[0];
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Job details retrieved successfully',
          data: targetJob,
          timestamp: '2026-10-18T10:00:00Z',
        },
      });

      const result = await jobService.getJobBySlug(targetJob.slug);
      expect(result).not.toBeNull();
      expect(result?.title).toBe(targetJob.title);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/public/jobs/${encodeURIComponent(targetJob.slug)}`,
        expect.any(Object)
      );
    });

    it('returns null when slug returns 404 Not Found', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 404,
          data: { success: false, message: 'Job opportunity not found or no longer active' },
        },
      });

      const result = await jobService.getJobBySlug('non-existent-slug');
      expect(result).toBeNull();
    });

    it('returns null if returned job is not in PUBLISHED status', async () => {
      const draftJob = { ...DEV_FEATURED_JOBS[0], status: 'DRAFT' as const };
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Job details retrieved',
          data: draftJob,
          timestamp: '2026-10-18T10:00:00Z',
        },
      });

      const result = await jobService.getJobBySlug(draftJob.slug);
      expect(result).toBeNull();
    });
  });

  describe('getRelatedJobs', () => {
    it('returns related positions when API responds', async () => {
      const mockRelated = DEV_FEATURED_JOBS.slice(1, 3);
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Related positions retrieved',
          data: mockRelated,
          timestamp: '2026-10-18T10:00:00Z',
        },
      });

      const result = await jobService.getRelatedJobs('staff-software-engineer-stripe-f91a', 2);
      expect(result).toHaveLength(2);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/public/jobs/staff-software-engineer-stripe-f91a/related',
        { params: { limit: 2 }, signal: undefined }
      );
    });

    it('returns empty array gracefully on error', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Related service error'));

      const result = await jobService.getRelatedJobs('test-slug');
      expect(result).toEqual([]);
    });
  });

  describe('getCategories', () => {
    it('returns predefined discovery categories', () => {
      const categories = jobService.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some((c) => c.key === 'Engineering')).toBe(true);
    });
  });
});
