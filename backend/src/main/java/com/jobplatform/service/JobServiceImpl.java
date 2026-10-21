package com.jobplatform.service;

import com.jobplatform.dto.*;
import com.jobplatform.entity.*;
import com.jobplatform.exception.ApiException;
import com.jobplatform.exception.ResourceNotFoundException;
import com.jobplatform.repository.JobRepository;
import com.jobplatform.repository.JobSpecifications;
import com.jobplatform.util.SlugUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    public JobServiceImpl(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDTO<JobResponseDTO> getPublicJobs(
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
    ) {
        Specification<Job> spec = JobSpecifications.withPublicFilters(
            keyword,
            location,
            category,
            workMode,
            employmentType,
            experienceLevel,
            fresher,
            salaryMin,
            salaryMax
        );

        Page<Job> page = jobRepository.findAll(spec, pageable);
        List<JobResponseDTO> dtos = page.getContent().stream()
            .map(JobResponseDTO::fromEntity)
            .toList();

        return new PaginatedResponseDTO<>(
            dtos,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            page.hasNext(),
            page.hasPrevious()
        );
    }

    @Override
    @Transactional
    public JobResponseDTO getPublicJobBySlug(String slug) {
        Job job = jobRepository.findBySlugAndStatus(slug, JobStatus.PUBLISHED)
            .orElseThrow(() -> new ResourceNotFoundException("Job opportunity not found or no longer active"));

        // Atomically increment public view metric
        jobRepository.incrementViewsCount(job.getId());
        job.setViewsCount(job.getViewsCount() + 1);

        return JobResponseDTO.fromEntity(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDTO> getFeaturedJobs() {
        return jobRepository.findTop6ByStatusAndFeaturedTrueOrderByPublishedAtDesc(JobStatus.PUBLISHED)
            .stream()
            .map(JobResponseDTO::fromEntity)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDTO> getRelatedJobs(String slug) {
        Job job = jobRepository.findBySlugAndStatus(slug, JobStatus.PUBLISHED)
            .orElseThrow(() -> new ResourceNotFoundException("Job opportunity not found"));

        return jobRepository.findTop3ByStatusAndCategoryAndIdNotOrderByPublishedAtDesc(
            JobStatus.PUBLISHED,
            job.getCategory(),
            job.getId()
        ).stream().map(JobResponseDTO::fromEntity).toList();
    }

    @Override
    @Transactional
    public JobResponseDTO createJob(JobCreateRequestDTO request) {
        // Generate collision-resistant permanent slug
        String slug = SlugUtils.generateJobSlug(request.getTitle(), request.getCompany());
        int attempts = 0;
        while (jobRepository.existsBySlug(slug) && attempts < 5) {
            slug = SlugUtils.generateJobSlug(request.getTitle(), request.getCompany());
            attempts++;
        }
        if (jobRepository.existsBySlug(slug)) {
            throw new ApiException("Unable to generate a unique URL slug for this job listing", HttpStatus.CONFLICT);
        }

        Job job = new Job(
            slug,
            request.getTitle(),
            request.getCompany(),
            request.getCategory(),
            request.getEmploymentType(),
            request.getWorkMode(),
            request.getExperienceLevel(),
            request.getLocation(),
            request.getDescription(),
            request.getApplicationUrl()
        );

        job.setCompanyLogo(request.getCompanyLogo());
        job.setFresherEligible(request.isFresherEligible());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        if (request.getSalaryCurrency() != null) job.setSalaryCurrency(request.getSalaryCurrency());
        if (request.getSalaryPeriod() != null) job.setSalaryPeriod(request.getSalaryPeriod());
        job.setHideSalary(request.isHideSalary());
        job.setResponsibilities(request.getResponsibilities());
        job.setQualifications(request.getQualifications());
        job.setSkills(request.getSkills());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setFeatured(request.isFeatured());

        if (request.isPublishImmediately()) {
            job.setStatus(JobStatus.PUBLISHED);
            job.setPublishedAt(LocalDateTime.now());
        } else {
            job.setStatus(JobStatus.DRAFT);
        }

        Job saved = jobRepository.save(job);
        return JobResponseDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    public JobResponseDTO updateJob(Long id, JobUpdateRequestDTO request) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job with ID " + id + " not found"));

        // Preserve original permanent slug to protect bookmarks and SEO URLs
        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setCompanyLogo(request.getCompanyLogo());
        job.setCategory(request.getCategory());
        job.setEmploymentType(request.getEmploymentType());
        job.setWorkMode(request.getWorkMode());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setFresherEligible(request.isFresherEligible());
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        if (request.getSalaryCurrency() != null) job.setSalaryCurrency(request.getSalaryCurrency());
        if (request.getSalaryPeriod() != null) job.setSalaryPeriod(request.getSalaryPeriod());
        job.setHideSalary(request.isHideSalary());
        job.setDescription(request.getDescription());
        job.setResponsibilities(request.getResponsibilities());
        job.setQualifications(request.getQualifications());
        job.setSkills(request.getSkills());
        job.setApplicationUrl(request.getApplicationUrl());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setFeatured(request.isFeatured());

        Job updated = jobRepository.save(job);
        return JobResponseDTO.fromEntity(updated);
    }

    @Override
    @Transactional
    public JobResponseDTO updateJobStatus(Long id, JobStatusUpdateRequestDTO request) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job with ID " + id + " not found"));

        JobStatus newStatus = request.getStatus();
        if (newStatus == JobStatus.PUBLISHED && job.getPublishedAt() == null) {
            job.setPublishedAt(LocalDateTime.now());
        }
        job.setStatus(newStatus);

        Job updated = jobRepository.save(job);
        return JobResponseDTO.fromEntity(updated);
    }

    @Override
    @Transactional
    public void archiveJob(Long id) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job with ID " + id + " not found"));

        job.setStatus(JobStatus.ARCHIVED);
        jobRepository.save(job);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDTO<JobResponseDTO> getAdminJobs(Pageable pageable) {
        Page<Job> page = jobRepository.findAll(pageable);
        List<JobResponseDTO> dtos = page.getContent().stream()
            .map(JobResponseDTO::fromEntity)
            .toList();

        return new PaginatedResponseDTO<>(
            dtos,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            page.hasNext(),
            page.hasPrevious()
        );
    }
}
