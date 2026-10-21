package com.jobplatform.dto;

import com.jobplatform.entity.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class JobCreateRequestDTO {

    @NotBlank(message = "Job title is required")
    @Size(max = 160, message = "Job title must not exceed 160 characters")
    private String title;

    @NotBlank(message = "Company name is required")
    @Size(max = 120, message = "Company name must not exceed 120 characters")
    private String company;

    @Pattern(regexp = "^(https?://.+)?$", message = "Company logo must be a valid HTTP or HTTPS URL")
    @Size(max = 500, message = "Company logo URL must not exceed 500 characters")
    private String companyLogo;

    @NotBlank(message = "Job category is required")
    @Size(max = 80, message = "Category must not exceed 80 characters")
    private String category;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    private boolean fresherEligible = false;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    @Min(value = 0, message = "Minimum salary cannot be negative")
    private Long salaryMin;

    @Min(value = 0, message = "Maximum salary cannot be negative")
    private Long salaryMax;

    @Size(max = 10, message = "Salary currency code must not exceed 10 characters")
    private String salaryCurrency = "USD";

    @Size(max = 20, message = "Salary period must not exceed 20 characters")
    private String salaryPeriod = "YEAR";

    private boolean hideSalary = false;

    @NotBlank(message = "Job description is required")
    @Size(min = 20, message = "Job description must be at least 20 characters")
    private String description;

    private String responsibilities;

    private String qualifications;

    @Size(max = 500, message = "Skills list must not exceed 500 characters")
    private String skills;

    @NotBlank(message = "External application URL is required")
    @Pattern(regexp = "^https?://.+", message = "Application URL must be a valid HTTP or HTTPS URL")
    @Size(max = 1000, message = "Application URL must not exceed 1000 characters")
    private String applicationUrl;

    @FutureOrPresent(message = "Application deadline must be today or in the future")
    private LocalDate applicationDeadline;

    private boolean publishImmediately = false;

    private boolean featured = false;

    @AssertTrue(message = "Maximum salary cannot be less than minimum salary")
    public boolean isSalaryRangeValid() {
        if (salaryMin != null && salaryMax != null) {
            return salaryMax >= salaryMin;
        }
        return true;
    }

    public JobCreateRequestDTO() {}

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

    public boolean isPublishImmediately() {
        return publishImmediately;
    }

    public void setPublishImmediately(boolean publishImmediately) {
        this.publishImmediately = publishImmediately;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }
}
