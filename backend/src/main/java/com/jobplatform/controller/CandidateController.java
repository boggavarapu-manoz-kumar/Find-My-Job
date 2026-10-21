package com.jobplatform.controller;

import com.jobplatform.dto.ApiResponse;
import com.jobplatform.dto.JobApplicationRequestDTO;
import com.jobplatform.dto.JobApplicationResponseDTO;
import com.jobplatform.dto.PaginatedResponseDTO;
import com.jobplatform.dto.SavedJobResponseDTO;
import com.jobplatform.service.CandidateService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/candidate")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    // --- Saved Jobs ---

    @PostMapping("/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<SavedJobResponseDTO>> saveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        SavedJobResponseDTO saved = candidateService.saveJob(userDetails.getUsername(), jobId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job successfully saved to your profile", saved));
    }

    @DeleteMapping("/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        candidateService.unsaveJob(userDetails.getUsername(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job removed from saved list", null));
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<SavedJobResponseDTO>>> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        int boundedSize = Math.min(Math.max(size, 1), 50);
        int boundedPage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize);

        Page<SavedJobResponseDTO> pageResult = candidateService.getSavedJobs(userDetails.getUsername(), pageable);
        PaginatedResponseDTO<SavedJobResponseDTO> response = new PaginatedResponseDTO<>(
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

        return ResponseEntity.ok(ApiResponse.success("Saved jobs retrieved successfully", response));
    }

    @GetMapping("/saved-jobs/{jobId}/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkSaved(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isSaved = candidateService.isJobSaved(userDetails.getUsername(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Saved status checked", Map.of("isSaved", isSaved)));
    }

    // --- Job Applications ---

    @PostMapping("/applications")
    public ResponseEntity<ApiResponse<JobApplicationResponseDTO>> submitApplication(
            @Valid @RequestBody JobApplicationRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobApplicationResponseDTO app = candidateService.applyToJob(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application successfully submitted", app));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobApplicationResponseDTO>>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        int boundedSize = Math.min(Math.max(size, 1), 50);
        int boundedPage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize);

        Page<JobApplicationResponseDTO> pageResult = candidateService.getCandidateApplications(userDetails.getUsername(), pageable);
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

        return ResponseEntity.ok(ApiResponse.success("Applications retrieved successfully", response));
    }

    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<ApiResponse<JobApplicationResponseDTO>> getApplicationById(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobApplicationResponseDTO app = candidateService.getCandidateApplicationById(userDetails.getUsername(), applicationId);
        return ResponseEntity.ok(ApiResponse.success("Application details retrieved", app));
    }

    @PatchMapping("/applications/{applicationId}/withdraw")
    public ResponseEntity<ApiResponse<JobApplicationResponseDTO>> withdrawApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobApplicationResponseDTO app = candidateService.withdrawApplication(userDetails.getUsername(), applicationId);
        return ResponseEntity.ok(ApiResponse.success("Application has been withdrawn", app));
    }
}
