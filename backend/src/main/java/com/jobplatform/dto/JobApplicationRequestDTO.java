package com.jobplatform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class JobApplicationRequestDTO {

    @NotNull(message = "Job ID cannot be null")
    private Long jobId;

    @Size(max = 150, message = "Candidate name cannot exceed 150 characters")
    private String candidateName;

    @Email(message = "Candidate email must be a valid email address")
    @Size(max = 150, message = "Candidate email cannot exceed 150 characters")
    private String candidateEmail;

    @Size(max = 50, message = "Candidate phone cannot exceed 50 characters")
    private String candidatePhone;

    @Size(max = 1000, message = "Resume URL cannot exceed 1000 characters")
    @Pattern(regexp = "^(https?://.+)?$", message = "Resume URL must be a valid HTTP/HTTPS link if provided")
    private String resumeUrl;

    @Size(max = 5000, message = "Cover letter cannot exceed 5000 characters")
    private String coverLetter;

    public JobApplicationRequestDTO() {}

    public JobApplicationRequestDTO(
            Long jobId,
            String candidateName,
            String candidateEmail,
            String candidatePhone,
            String resumeUrl,
            String coverLetter
    ) {
        this.jobId = jobId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.candidatePhone = candidatePhone;
        this.resumeUrl = resumeUrl;
        this.coverLetter = coverLetter;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public String getCandidatePhone() {
        return candidatePhone;
    }

    public void setCandidatePhone(String candidatePhone) {
        this.candidatePhone = candidatePhone;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }
}
