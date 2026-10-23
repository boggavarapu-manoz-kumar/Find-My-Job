package com.jobplatform.service;

import com.jobplatform.dto.JobApplicationRequestDTO;
import com.jobplatform.dto.JobApplicationResponseDTO;
import com.jobplatform.dto.SavedJobResponseDTO;
import com.jobplatform.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CandidateService {

    // Saved Jobs
    SavedJobResponseDTO saveJob(String username, Long jobId);

    void unsaveJob(String username, Long jobId);

    Page<SavedJobResponseDTO> getSavedJobs(String username, Pageable pageable);

    boolean isJobSaved(String username, Long jobId);

    boolean isJobApplied(String username, Long jobId);

    // Job Applications
    JobApplicationResponseDTO applyToJob(String username, JobApplicationRequestDTO request);

    Page<JobApplicationResponseDTO> getCandidateApplications(String username, Pageable pageable);

    JobApplicationResponseDTO getCandidateApplicationById(String username, Long applicationId);

    JobApplicationResponseDTO withdrawApplication(String username, Long applicationId);

    // Admin Access to Applications
    Page<JobApplicationResponseDTO> getApplicationsForJob(Long jobId, Pageable pageable);

    JobApplicationResponseDTO updateApplicationStatus(Long applicationId, ApplicationStatus status);
}
