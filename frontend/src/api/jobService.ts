import axios, { AxiosError } from 'axios';
import apiClient from './client';
import type { Job, PaginatedResponse, ApiResponse, JobFilterParams } from '../types/job.types';

export type { JobFilterParams };

export interface JobCategorySummary {
  name: string;
  key: string;
  description: string;
}

// High-performance client-side in-memory cache
const memoryCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const jobService = {
  /**
   * Fetch featured positions for landing page showcase directly from Spring Boot REST API.
   * Endpoint: GET /api/v1/public/jobs/featured
   */
  async getFeaturedJobs(signal?: AbortSignal): Promise<Job[]> {
    const cacheKey = 'featured_jobs';
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Job[];
    }

    try {
      const response = await apiClient.get<ApiResponse<Job[]>>('/public/jobs/featured', {
        signal,
      });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        memoryCache.set(cacheKey, { timestamp: Date.now(), data: response.data.data });
        // Pre-warm individual slug cache so clicking any job opens at 0ms even without router state
        response.data.data.forEach((j) => {
          if (j?.slug) {
            memoryCache.set(`job_slug_${j.slug}`, { timestamp: Date.now(), data: j });
          }
        });
        return response.data.data;
      }
      throw new Error('Invalid response structure received for featured positions.');
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Unable to retrieve featured job opportunities from the server.';
      throw new Error(message);
    }
  },

  /**
   * Fetch aggregated counts per category in a single request.
   * Endpoint: GET /api/v1/public/jobs/categories
   */
  async getCategoryCounts(signal?: AbortSignal): Promise<Record<string, number>> {
    const cacheKey = 'category_counts';
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Record<string, number>;
    }

    try {
      const response = await apiClient.get<ApiResponse<Record<string, number>>>('/public/jobs/categories', {
        signal,
      });
      if (response.data && response.data.success && response.data.data) {
        memoryCache.set(cacheKey, { timestamp: Date.now(), data: response.data.data });
        return response.data.data;
      }
      return {};
    } catch {
      return {};
    }
  },

  /**
   * Fetch opportunities with server-side multi-criteria filtering and pagination.
   * Endpoint: GET /api/v1/public/jobs
   */
  async getLatestJobs(params: JobFilterParams = {}, signal?: AbortSignal): Promise<PaginatedResponse<Job>> {
    const cacheKey = `jobs_query_${JSON.stringify(params)}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.data as PaginatedResponse<Job>;
    }

    try {
      const queryParams: Record<string, unknown> = {};

      if (params.keyword?.trim()) queryParams.keyword = params.keyword.trim();
      if (params.location?.trim()) queryParams.location = params.location.trim();
      if (params.category?.trim()) queryParams.category = params.category.trim();
      if (params.workMode) queryParams.workMode = params.workMode;
      if (params.employmentType) queryParams.employmentType = params.employmentType;
      if (params.experienceLevel) queryParams.experienceLevel = params.experienceLevel;
      if (params.fresher !== undefined) queryParams.fresher = params.fresher;
      if (params.salaryMin !== undefined && params.salaryMin >= 0) queryParams.salaryMin = params.salaryMin;
      if (params.salaryMax !== undefined && params.salaryMax >= 0) queryParams.salaryMax = params.salaryMax;
      if (params.dateFilter) queryParams.dateFilter = params.dateFilter;
      if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
      if (params.dateTo) queryParams.dateTo = params.dateTo;
      if (params.sort) queryParams.sort = params.sort;
      if (params.page !== undefined && params.page >= 0) queryParams.page = params.page;
      if (params.size !== undefined && params.size > 0) queryParams.size = params.size;

      const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>('/public/jobs', {
        params: queryParams,
        signal,
      });

      if (response.data && response.data.success && response.data.data) {
        const raw = response.data.data;
        // Normalize boolean pagination properties across backend serializer variants
        const normalized: PaginatedResponse<Job> = {
          content: raw.content || [],
          pageNumber: raw.pageNumber ?? 0,
          pageSize: raw.pageSize ?? (params.size || 10),
          totalElements: raw.totalElements ?? 0,
          totalPages: raw.totalPages ?? 1,
          first: raw.first ?? raw.isFirst ?? raw.pageNumber === 0,
          isFirst: raw.first ?? raw.isFirst ?? raw.pageNumber === 0,
          last: raw.last ?? raw.isLast ?? (raw.pageNumber >= (raw.totalPages ?? 1) - 1),
          isLast: raw.last ?? raw.isLast ?? (raw.pageNumber >= (raw.totalPages ?? 1) - 1),
          hasNext: raw.hasNext ?? false,
          hasPrevious: raw.hasPrevious ?? false,
        };
        memoryCache.set(cacheKey, { timestamp: Date.now(), data: normalized });
        // Pre-warm individual slug cache so clicking any job opens at 0ms instantly
        normalized.content.forEach((j) => {
          if (j?.slug) {
            memoryCache.set(`job_slug_${j.slug}`, { timestamp: Date.now(), data: j });
          }
        });
        return normalized;
      }
      throw new Error('Invalid response structure received for job opportunities.');
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Unable to retrieve job opportunities from the server.';
      throw new Error(message);
    }
  },

  /**
   * Synchronously retrieve job from memory cache if already pre-loaded (instant 0ms response).
   */
  getCachedJobBySlug(slug: string): Job | null {
    const cached = memoryCache.get(`job_slug_${slug}`);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Job;
    }
    return null;
  },

  /**
   * Fetch single job by permanent slug.
   * Endpoint: GET /api/v1/public/jobs/{slug}
   * Returns null if the slug is unknown, unpublished, or archived (404).
   */
  async getJobBySlug(slug: string, signal?: AbortSignal, retryCount: number = 0): Promise<Job | null> {
    const cacheKey = `job_slug_${slug}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Job;
    }

    try {
      const response = await apiClient.get<ApiResponse<Job>>(`/public/jobs/${encodeURIComponent(slug)}`, {
        signal,
        timeout: 15000,
      });

      if (response.data && response.data.success && response.data.data) {
        // Enforce public access status constraint
        if (response.data.data.status === 'PUBLISHED') {
          memoryCache.set(cacheKey, { timestamp: Date.now(), data: response.data.data });
          return response.data.data;
        }
        return null;
      }
      return null;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;
      // If genuine 404 from backend (job definitely not in database), return null
      if (axiosErr.response?.status === 404) {
        return null;
      }

      // If backend was sleeping or network glitch (timeout, 502, 503, 504), retry once automatically
      if (retryCount < 1 && (!axiosErr.response || axiosErr.response.status >= 500 || axiosErr.code === 'ECONNABORTED')) {
        await new Promise((res) => setTimeout(res, 1200));
        return this.getJobBySlug(slug, signal, retryCount + 1);
      }

      const message =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Failed to load job details. Please check connection.';
      throw new Error(message);
    }
  },

  /**
   * Fetch related jobs in the same discipline.
   * Endpoint: GET /api/v1/public/jobs/{slug}/related?limit={limit}
   */
  async getRelatedJobs(slug: string, limit: number = 3, signal?: AbortSignal): Promise<Job[]> {
    try {
      const response = await apiClient.get<ApiResponse<Job[]>>(
        `/public/jobs/${encodeURIComponent(slug)}/related`,
        {
          params: { limit },
          signal,
        }
      );

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      // Related jobs failure is non-blocking for detail page
      return [];
    }
  },

  /**
   * Discovery categories aligned with system ontology.
   */
  getCategories(): JobCategorySummary[] {
    return [
      { name: 'Software Engineering', key: 'Engineering', description: 'Full stack, backend, web systems and distributed platforms' },
      { name: 'Design & Creative', key: 'Design', description: 'Design systems, product UI/UX and interaction architecture' },
      { name: 'DevOps & Cloud', key: 'DevOps & Cloud', description: 'Site reliability, Kubernetes orchestration and CI/CD pipelines' },
      { name: 'Data Science & AI', key: 'Data Science & AI', description: 'Applied machine learning, deep neural models and research' },
      { name: 'Product Management', key: 'Product & Marketing', description: 'Technical product strategy, developer relations and growth' },
    ];
  },
};

export default jobService;
