package com.jobplatform.service;

import com.jobplatform.dto.*;
import com.jobplatform.entity.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobService {

    /**
     * Public paginated job discovery with optional filters.
     * Strictly evaluates published jobs only.
     */
    PaginatedResponseDTO<JobResponseDTO> getPublicJobs(
        String keyword,
        String location,
        String category,
        WorkMode workMode,
        EmploymentType employmentType,
        ExperienceLevel experienceLevel,
        Boolean fresher,
        Long salaryMin,
        Long salaryMax,
        Pageable pageable
    );

    /**
     * Public lookup by permanent slug.
     * Strictly returns published jobs or throws ResourceNotFoundException.
     */
    JobResponseDTO getPublicJobBySlug(String slug);

    /**
     * Public featured listings for landing page showcase.
     */
    List<JobResponseDTO> getFeaturedJobs();

    /**
     * Public related opportunities in same category.
     */
    List<JobResponseDTO> getRelatedJobs(String slug);

    /**
     * Protected job creation.
     */
    JobResponseDTO createJob(JobCreateRequestDTO request);

    /**
     * Protected job update.
     */
    JobResponseDTO updateJob(Long id, JobUpdateRequestDTO request);

    /**
     * Protected status transition.
     */
    JobResponseDTO updateJobStatus(Long id, JobStatusUpdateRequestDTO request);

    /**
     * Protected job archival.
     */
    void archiveJob(Long id);

    /**
     * Protected admin lookup with all publication statuses.
     */
    PaginatedResponseDTO<JobResponseDTO> getAdminJobs(Pageable pageable);
}
