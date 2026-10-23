package com.jobplatform.dto;

import com.jobplatform.entity.Company;
import java.time.LocalDateTime;

public class CompanyResponseDTO {

    private Long id;
    private String name;
    private String normalizedName;
    private String slug;
    private String logoAssetId;
    private String logoPublicId;
    private String logoUrl;
    private String logoAltText;
    private String websiteUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CompanyResponseDTO() {}

    public static CompanyResponseDTO fromEntity(Company company) {
        if (company == null) return null;
        CompanyResponseDTO dto = new CompanyResponseDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setNormalizedName(company.getNormalizedName());
        dto.setSlug(company.getSlug());
        dto.setLogoAssetId(company.getLogoAssetId());
        dto.setLogoPublicId(company.getLogoPublicId());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setLogoAltText(company.getLogoAltText() != null ? company.getLogoAltText() : company.getName() + " logo");
        dto.setWebsiteUrl(company.getWebsiteUrl());
        dto.setCreatedAt(company.getCreatedAt());
        dto.setUpdatedAt(company.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNormalizedName() {
        return normalizedName;
    }

    public void setNormalizedName(String normalizedName) {
        this.normalizedName = normalizedName;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getLogoAssetId() {
        return logoAssetId;
    }

    public void setLogoAssetId(String logoAssetId) {
        this.logoAssetId = logoAssetId;
    }

    public String getLogoPublicId() {
        return logoPublicId;
    }

    public void setLogoPublicId(String logoPublicId) {
        this.logoPublicId = logoPublicId;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getLogoAltText() {
        return logoAltText;
    }

    public void setLogoAltText(String logoAltText) {
        this.logoAltText = logoAltText;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
