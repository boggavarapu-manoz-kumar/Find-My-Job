package com.jobplatform.service;

import com.jobplatform.dto.JobApplicationRequestDTO;
import com.jobplatform.dto.JobApplicationResponseDTO;
import com.jobplatform.dto.SavedJobResponseDTO;
import com.jobplatform.entity.*;
import com.jobplatform.exception.ApiException;
import com.jobplatform.exception.ResourceNotFoundException;
import com.jobplatform.repository.JobApplicationRepository;
import com.jobplatform.repository.JobRepository;
import com.jobplatform.repository.SavedJobRepository;
import com.jobplatform.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class CandidateServiceImpl implements CandidateService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public CandidateServiceImpl(
            UserRepository userRepository,
            JobRepository jobRepository,
            SavedJobRepository savedJobRepository,
            JobApplicationRepository jobApplicationRepository
    ) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.savedJobRepository = savedJobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    private User getAuthenticatedUser(String username) {
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new ApiException("Authenticated user could not be resolved", HttpStatus.UNAUTHORIZED));
    }

    private Job getPublishedJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opportunity not found with id: " + jobId));

        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new ApiException("Job opportunity is not active or accepting applications", HttpStatus.BAD_REQUEST);
        }
        return job;
    }

    @Override
    public SavedJobResponseDTO saveJob(String username, Long jobId) {
        User user = getAuthenticatedUser(username);
        Job job = getPublishedJob(jobId);

        if (savedJobRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
            SavedJob existing = savedJobRepository.findByUserIdAndJobId(user.getId(), job.getId())
                    .orElseThrow(() -> new ApiException("Unexpected error retrieving saved job", HttpStatus.INTERNAL_SERVER_ERROR));
            return mapToSavedJobResponse(existing);
        }

        try {
            SavedJob savedJob = new SavedJob(user, job);
            SavedJob persisted = savedJobRepository.save(savedJob);
            return mapToSavedJobResponse(persisted);
        } catch (DataIntegrityViolationException ex) {
            // Idempotent fallback in case of concurrent requests
            SavedJob existing = savedJobRepository.findByUserIdAndJobId(user.getId(), job.getId())
                    .orElseThrow(() -> new ApiException("Job already saved", HttpStatus.CONFLICT));
            return mapToSavedJobResponse(existing);
        }
    }

    @Override
    public void unsaveJob(String username, Long jobId) {
        User user = getAuthenticatedUser(username);
        savedJobRepository.deleteByUserIdAndJobId(user.getId(), jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SavedJobResponseDTO> getSavedJobs(String username, Pageable pageable) {
        User user = getAuthenticatedUser(username);
        return savedJobRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToSavedJobResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isJobSaved(String username, Long jobId) {
        User user = getAuthenticatedUser(username);
        return savedJobRepository.existsByUserIdAndJobId(user.getId(), jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isJobApplied(String username, Long jobId) {
        User user = getAuthenticatedUser(username);
        return jobApplicationRepository.existsByUserIdAndJobId(user.getId(), jobId);
    }

    @Override
    public JobApplicationResponseDTO applyToJob(String username, JobApplicationRequestDTO request) {
        User user = getAuthenticatedUser(username);
        Job job = getPublishedJob(request.getJobId());

        if (jobApplicationRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
            throw new ApiException("You have already submitted an application for this job posting", HttpStatus.CONFLICT);
        }

        try {
            String candidateName = StringUtils.hasText(request.getCandidateName())
                    ? request.getCandidateName().trim()
                    : user.getUsername();
            String candidateEmail = StringUtils.hasText(request.getCandidateEmail())
                    ? request.getCandidateEmail().trim().toLowerCase()
                    : user.getEmail();
            String resumeUrl = StringUtils.hasText(request.getResumeUrl())
                    ? request.getResumeUrl().trim()
                    : (StringUtils.hasText(job.getApplicationUrl()) ? job.getApplicationUrl().trim() : "https://findmyjob.site");

            JobApplication application = new JobApplication(
                    user,
                    job,
                    candidateName,
                    candidateEmail,
                    request.getCandidatePhone() != null ? request.getCandidatePhone().trim() : null,
                    resumeUrl,
                    request.getCoverLetter() != null ? request.getCoverLetter().trim() : null
            );

            JobApplication persisted = jobApplicationRepository.save(application);
            return mapToApplicationResponse(persisted);
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException("You have already submitted an application for this job posting", HttpStatus.CONFLICT);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponseDTO> getCandidateApplications(String username, Pageable pageable) {
        User user = getAuthenticatedUser(username);
        return jobApplicationRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToApplicationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponseDTO getCandidateApplicationById(String username, Long applicationId) {
        User user = getAuthenticatedUser(username);
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application record not found with id: " + applicationId));

        return mapToApplicationResponse(application);
    }

    @Override
    public JobApplicationResponseDTO withdrawApplication(String username, Long applicationId) {
        User user = getAuthenticatedUser(username);
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application record not found with id: " + applicationId));

        if (application.getStatus() == ApplicationStatus.OFFER || application.getStatus() == ApplicationStatus.REJECTED) {
            throw new ApiException("Cannot withdraw an application that has already reached a concluding decision", HttpStatus.BAD_REQUEST);
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        JobApplication updated = jobApplicationRepository.save(application);
        return mapToApplicationResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponseDTO> getApplicationsForJob(Long jobId, Pageable pageable) {
        return jobApplicationRepository.findByJobIdOrderByCreatedAtDesc(jobId, pageable)
                .map(this::mapToApplicationResponse);
    }

    @Override
    public JobApplicationResponseDTO updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application record not found with id: " + applicationId));

        application.setStatus(status);
        JobApplication updated = jobApplicationRepository.save(application);
        return mapToApplicationResponse(updated);
    }

    private SavedJobResponseDTO mapToSavedJobResponse(SavedJob saved) {
        Job j = saved.getJob();
        return new SavedJobResponseDTO(
                saved.getId(),
                j.getId(),
                j.getSlug(),
                j.getTitle(),
                j.getCompany(),
                j.getCompanyLogo(),
                j.getCategory(),
                j.getEmploymentType() != null ? j.getEmploymentType().name() : null,
                j.getWorkMode() != null ? j.getWorkMode().name() : null,
                j.getExperienceLevel() != null ? j.getExperienceLevel().name() : null,
                j.isFresherEligible(),
                j.getLocation(),
                j.getSalaryMin(),
                j.getSalaryMax(),
                j.getSalaryCurrency(),
                j.getSalaryPeriod(),
                j.isHideSalary(),
                saved.getCreatedAt()
        );
    }

    private JobApplicationResponseDTO mapToApplicationResponse(JobApplication app) {
        Job j = app.getJob();
        return new JobApplicationResponseDTO(
                app.getId(),
                j.getId(),
                j.getTitle(),
                j.getCompany(),
                j.getCompanyLogo(),
                j.getLocation(),
                j.getSlug(),
                app.getCandidateName(),
                app.getCandidateEmail(),
                app.getCandidatePhone(),
                app.getResumeUrl(),
                app.getCoverLetter(),
                app.getStatus(),
                app.getCreatedAt(),
                app.getUpdatedAt()
        );
    }
}
