package com.jobplatform.controller;

import com.jobplatform.dto.ApiResponse;
import com.jobplatform.dto.ApplicationStatusUpdateRequestDTO;
import com.jobplatform.dto.JobApplicationResponseDTO;
import com.jobplatform.dto.PaginatedResponseDTO;
import com.jobplatform.service.CandidateService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/applications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminApplicationController {

    private final CandidateService candidateService;

    public AdminApplicationController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobApplicationResponseDTO>>> getApplicationsForJob(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int boundedSize = Math.min(Math.max(size, 1), 50);
        int boundedPage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize);

        Page<JobApplicationResponseDTO> pageResult = candidateService.getApplicationsForJob(jobId, pageable);
        PaginatedResponseDTO<JobApplicationResponseDTO> response = new PaginatedResponseDTO<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast(),
                pageResult.hasNext(),
                pageResult.hasPrevious()
        );

        return ResponseEntity.ok(ApiResponse.success("Job applications retrieved successfully", response));
    }

    @PatchMapping("/{applicationId}/status")
    public ResponseEntity<ApiResponse<JobApplicationResponseDTO>> updateStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationStatusUpdateRequestDTO request) {
        JobApplicationResponseDTO updated = candidateService.updateApplicationStatus(applicationId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Application status updated successfully", updated));
    }
}
