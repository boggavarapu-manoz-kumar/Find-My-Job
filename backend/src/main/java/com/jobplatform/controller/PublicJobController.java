package com.jobplatform.controller;

import com.jobplatform.dto.ApiResponse;
import com.jobplatform.dto.JobResponseDTO;
import com.jobplatform.dto.PaginatedResponseDTO;
import com.jobplatform.entity.*;
import com.jobplatform.service.JobService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/jobs")
public class PublicJobController {

    private final JobService jobService;

    public PublicJobController(JobService jobService) {
        this.jobService = jobService;
    }

    /**
     * Public paginated job discovery endpoint with multi-criteria filtering.
     * Evaluates published records only.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobResponseDTO>>> getPublicJobs(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) WorkMode workMode,
        @RequestParam(required = false) EmploymentType employmentType,
        @RequestParam(required = false) ExperienceLevel experienceLevel,
        @RequestParam(required = false) Boolean fresher,
        @RequestParam(required = false) Long salaryMin,
        @RequestParam(required = false) Long salaryMax,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "publishedAt,desc") String sort
    ) {
        // Enforce safe pagination bounds
        int validatedPage = Math.max(page, 0);
        int validatedSize = Math.min(Math.max(size, 1), 50);

        // Validate salary numeric ranges
        if (salaryMin != null && salaryMin < 0) {
            throw new com.jobplatform.exception.ApiException("Minimum salary cannot be negative", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (salaryMax != null && salaryMax < 0) {
            throw new com.jobplatform.exception.ApiException("Maximum salary cannot be negative", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
            throw new com.jobplatform.exception.ApiException("Minimum salary cannot be greater than maximum salary", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        // Validate and map sort parameter against approved whitelist
        Sort sorting = Sort.by(Sort.Direction.DESC, "publishedAt", "id");
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String property = parts[0].trim();
            Sort.Direction direction = Sort.Direction.DESC;
            if (parts.length > 1) {
                String dirStr = parts[1].trim().toLowerCase();
                if (!"asc".equals(dirStr) && !"desc".equals(dirStr)) {
                    throw new com.jobplatform.exception.ApiException("Invalid sort direction: " + parts[1], org.springframework.http.HttpStatus.BAD_REQUEST);
                }
                direction = "asc".equals(dirStr) ? Sort.Direction.ASC : Sort.Direction.DESC;
            }

            // Approved whitelist of sort properties
            switch (property) {
                case "publishedAt":
                case "createdAt":
                case "title":
                case "company":
                case "salaryMax":
                    sorting = Sort.by(direction, property).and(Sort.by(Sort.Direction.DESC, "id"));
                    break;
                default:
                    throw new com.jobplatform.exception.ApiException("Unsupported sort property: " + property, org.springframework.http.HttpStatus.BAD_REQUEST);
            }
        }

        Pageable pageable = PageRequest.of(validatedPage, validatedSize, sorting);

        PaginatedResponseDTO<JobResponseDTO> response = jobService.getPublicJobs(
            keyword,
            location,
            category,
            workMode,
            employmentType,
            experienceLevel,
            fresher,
            salaryMin,
            salaryMax,
            pageable
        );

        return ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=30, stale-while-revalidate=120")
            .body(ApiResponse.success("Jobs retrieved successfully", response));
    }

    /**
     * Public lookup by permanent slug.
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<JobResponseDTO>> getJobBySlug(@PathVariable String slug) {
        JobResponseDTO job = jobService.getPublicJobBySlug(slug);
        return ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=60, stale-while-revalidate=300")
            .body(ApiResponse.success("Job details retrieved successfully", job));
    }

    /**
     * Public featured listings for landing page curated showcase.
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<JobResponseDTO>>> getFeaturedJobs() {
        List<JobResponseDTO> featured = jobService.getFeaturedJobs();
        return ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=60, stale-while-revalidate=300")
            .body(ApiResponse.success("Featured positions retrieved successfully", featured));
    }

    /**
     * Public related opportunities in same category.
     */
    @GetMapping("/{slug}/related")
    public ResponseEntity<ApiResponse<List<JobResponseDTO>>> getRelatedJobs(@PathVariable String slug) {
        List<JobResponseDTO> related = jobService.getRelatedJobs(slug);
        return ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=60, stale-while-revalidate=300")
            .body(ApiResponse.success("Related positions retrieved successfully", related));
    }
}
