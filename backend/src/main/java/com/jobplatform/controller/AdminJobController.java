package com.jobplatform.controller;

import com.jobplatform.dto.*;
import com.jobplatform.service.JobService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/jobs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminJobController {

    private final JobService jobService;

    public AdminJobController(JobService jobService) {
        this.jobService = jobService;
    }

    /**
     * Protected job listing for administrators (includes DRAFT and ARCHIVED).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobResponseDTO>>> getAdminJobs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        int validatedPage = Math.max(page, 0);
        int validatedSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(validatedPage, validatedSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        PaginatedResponseDTO<JobResponseDTO> response = jobService.getAdminJobs(pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin jobs retrieved successfully", response));
    }

    /**
     * Protected job creation.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<JobResponseDTO>> createJob(
        @Valid @RequestBody JobCreateRequestDTO request
    ) {
        JobResponseDTO created = jobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Job created successfully", created));
    }

    /**
     * Protected job update.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponseDTO>> updateJob(
        @PathVariable Long id,
        @Valid @RequestBody JobUpdateRequestDTO request
    ) {
        JobResponseDTO updated = jobService.updateJob(id, request);
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", updated));
    }

    /**
     * Protected lifecycle status transition.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<JobResponseDTO>> updateJobStatus(
        @PathVariable Long id,
        @Valid @RequestBody JobStatusUpdateRequestDTO request
    ) {
        JobResponseDTO updated = jobService.updateJobStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Job status updated successfully", updated));
    }

    /**
     * Protected job archival.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> archiveJob(@PathVariable Long id) {
        jobService.archiveJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job archived successfully", null));
    }
}
