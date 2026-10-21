package com.jobplatform.dto;

import java.time.LocalDateTime;

public class SavedJobResponseDTO {

    private Long id;
    private Long jobId;
    private String slug;
    private String title;
    private String company;
    private String companyLogo;
    private String category;
    private String employmentType;
    private String workMode;
    private String experienceLevel;
    private boolean fresherEligible;
    private String location;
    private Long salaryMin;
    private Long salaryMax;
    private String salaryCurrency;
    private String salaryPeriod;
    private boolean hideSalary;
    private LocalDateTime savedAt;

    public SavedJobResponseDTO() {}

    public SavedJobResponseDTO(
            Long id,
            Long jobId,
            String slug,
            String title,
            String company,
            String companyLogo,
            String category,
            String employmentType,
            String workMode,
            String experienceLevel,
            boolean fresherEligible,
            String location,
            Long salaryMin,
            Long salaryMax,
            String salaryCurrency,
            String salaryPeriod,
            boolean hideSalary,
            LocalDateTime savedAt
    ) {
        this.id = id;
        this.jobId = jobId;
        this.slug = slug;
        this.title = title;
        this.company = company;
        this.companyLogo = companyLogo;
        this.category = category;
        this.employmentType = employmentType;
        this.workMode = workMode;
        this.experienceLevel = experienceLevel;
        this.fresherEligible = fresherEligible;
        this.location = location;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.salaryCurrency = salaryCurrency;
        this.salaryPeriod = salaryPeriod;
        this.hideSalary = hideSalary;
        this.savedAt = savedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
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

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getWorkMode() {
        return workMode;
    }

    public void setWorkMode(String workMode) {
        this.workMode = workMode;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
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

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}
