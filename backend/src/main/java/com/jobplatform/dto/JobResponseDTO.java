package com.jobplatform.dto;

import com.jobplatform.entity.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobResponseDTO {

    private Long id;
    private Long companyId;
    private String slug;
    private String title;
    private String company;
    private String companyLogo;
    private String category;
    private EmploymentType employmentType;
    private WorkMode workMode;
    private ExperienceLevel experienceLevel;
    private boolean fresherEligible;
    private String location;
    private Long salaryMin;
    private Long salaryMax;
    private String salaryCurrency;
    private String salaryPeriod;
    private boolean hideSalary;
    private String description;
    private String responsibilities;
    private String qualifications;
    private String skills;
    private String applicationUrl;
    private LocalDate applicationDeadline;
    private JobStatus status;
    private boolean featured;
    private Long viewsCount;
    private Long clicksCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    public JobResponseDTO() {}

    public static JobResponseDTO fromEntity(Job job) {
        if (job == null) return null;
        JobResponseDTO dto = new JobResponseDTO();
        dto.setId(job.getId());
        if (job.getCompanyRef() != null) {
            dto.setCompanyId(job.getCompanyRef().getId());
        }
        dto.setSlug(job.getSlug());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        if (job.getCompanyLogo() != null && !job.getCompanyLogo().isBlank()) {
            dto.setCompanyLogo(job.getCompanyLogo());
        } else if (job.getCompanyRef() != null && job.getCompanyRef().getLogoUrl() != null) {
            dto.setCompanyLogo(job.getCompanyRef().getLogoUrl());
        }
        dto.setCategory(job.getCategory());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setWorkMode(job.getWorkMode());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setFresherEligible(job.isFresherEligible());
        dto.setLocation(job.getLocation());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setSalaryCurrency(job.getSalaryCurrency());
        dto.setSalaryPeriod(job.getSalaryPeriod());
        dto.setHideSalary(job.isHideSalary());
        dto.setDescription(job.getDescription());
        dto.setResponsibilities(job.getResponsibilities());
        dto.setQualifications(job.getQualifications());
        dto.setSkills(job.getSkills());
        dto.setApplicationUrl(job.getApplicationUrl());
        dto.setApplicationDeadline(job.getApplicationDeadline());
        dto.setStatus(job.getStatus());
        dto.setFeatured(job.isFeatured());
        dto.setViewsCount(job.getViewsCount());
        dto.setClicksCount(job.getClicksCount());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());
        dto.setPublishedAt(job.getPublishedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getCompanyLogo() {
        return companyLogo;
    }

    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public WorkMode getWorkMode() {
        return workMode;
    }

    public void setWorkMode(WorkMode workMode) {
        this.workMode = workMode;
    }

    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public boolean isFresherEligible() {
        return fresherEligible;
    }

    public void setFresherEligible(boolean fresherEligible) {
        this.fresherEligible = fresherEligible;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Long getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Long salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Long getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Long salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getSalaryCurrency() {
        return salaryCurrency;
    }

    public void setSalaryCurrency(String salaryCurrency) {
        this.salaryCurrency = salaryCurrency;
    }

    public String getSalaryPeriod() {
        return salaryPeriod;
    }

    public void setSalaryPeriod(String salaryPeriod) {
        this.salaryPeriod = salaryPeriod;
    }

    public boolean isHideSalary() {
        return hideSalary;
    }

    public void setHideSalary(boolean hideSalary) {
        this.hideSalary = hideSalary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getResponsibilities() {
        return responsibilities;
    }

    public void setResponsibilities(String responsibilities) {
        this.responsibilities = responsibilities;
    }

    public String getQualifications() {
        return qualifications;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getApplicationUrl() {
        return applicationUrl;
    }

    public void setApplicationUrl(String applicationUrl) {
        this.applicationUrl = applicationUrl;
    }

    public LocalDate getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(LocalDate applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public Long getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(Long viewsCount) {
        this.viewsCount = viewsCount;
    }

    public Long getClicksCount() {
        return clicksCount;
    }

    public void setClicksCount(Long clicksCount) {
        this.clicksCount = clicksCount;
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

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }
}
