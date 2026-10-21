package com.jobplatform.dto;

import com.jobplatform.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public class ApplicationStatusUpdateRequestDTO {

    @NotNull(message = "Status cannot be null")
    private ApplicationStatus status;

    public ApplicationStatusUpdateRequestDTO() {}

    public ApplicationStatusUpdateRequestDTO(ApplicationStatus status) {
        this.status = status;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}
