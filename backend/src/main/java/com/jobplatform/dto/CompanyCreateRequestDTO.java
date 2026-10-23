package com.jobplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompanyCreateRequestDTO {

    @NotBlank(message = "Company name is required")
    @Size(max = 120, message = "Company name must not exceed 120 characters")
    private String name;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    private String websiteUrl;

    public CompanyCreateRequestDTO() {}

    public CompanyCreateRequestDTO(String name, String logoUrl, String websiteUrl) {
        this.name = name;
        this.logoUrl = logoUrl;
        this.websiteUrl = websiteUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }
}
