package com.jobplatform.dto;

import com.jobplatform.entity.JobStatus;
import jakarta.validation.constraints.NotNull;

public class JobStatusUpdateRequestDTO {

    @NotNull(message = "Job status is required")
    private JobStatus status;

    public JobStatusUpdateRequestDTO() {}

    public JobStatusUpdateRequestDTO(JobStatus status) {
        this.status = status;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }
}
