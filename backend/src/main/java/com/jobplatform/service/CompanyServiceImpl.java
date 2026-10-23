package com.jobplatform.service;

import com.jobplatform.dto.CloudinaryUploadResult;
import com.jobplatform.dto.CompanyCreateRequestDTO;
import com.jobplatform.dto.CompanyResponseDTO;
import com.jobplatform.entity.Company;
import com.jobplatform.exception.ApiException;
import com.jobplatform.exception.ResourceNotFoundException;
import com.jobplatform.repository.CompanyRepository;
import com.jobplatform.repository.JobRepository;
import com.jobplatform.util.CompanyNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@Service
public class CompanyServiceImpl implements CompanyService {

    private static final Logger log = LoggerFactory.getLogger(CompanyServiceImpl.class);

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final CloudinaryService cloudinaryService;

    public CompanyServiceImpl(
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            CloudinaryService cloudinaryService
    ) {
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "companiesSearch", key = "#query + '_' + #limit", condition = "#query != null && #query.length() > 0")
    public List<CompanyResponseDTO> searchCompanies(String query, int limit) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        int boundedLimit = Math.min(Math.max(limit, 1), 20);
        List<Company> companies = companyRepository.searchByName(query.trim(), PageRequest.of(0, boundedLimit));
        return companies.stream().map(CompanyResponseDTO::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company with ID " + id + " not found"));
        return CompanyResponseDTO.fromEntity(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDTO getCompanyBySlug(String slug) {
        Company company = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Company with slug " + slug + " not found"));
        return CompanyResponseDTO.fromEntity(company);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"companiesSearch"}, allEntries = true)
    public CompanyResponseDTO createCompany(CompanyCreateRequestDTO request) {
        Company entity = findOrCreateCompanyEntity(request.getName(), request.getLogoUrl(), request.getWebsiteUrl());
        return CompanyResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public Company findOrCreateCompanyEntity(String rawName, String logoUrl, String websiteUrl) {
        if (rawName == null || rawName.isBlank()) {
            throw new ApiException("Company name cannot be blank", HttpStatus.BAD_REQUEST);
        }

        String normalized = CompanyNormalizer.normalize(rawName);
        return companyRepository.findByNormalizedName(normalized)
                .map(existing -> {
                    // Backfill logo or website if newly provided and previously null
                    boolean changed = false;
                    if (existing.getLogoUrl() == null && logoUrl != null && !logoUrl.isBlank()) {
                        existing.setLogoUrl(logoUrl.trim());
                        changed = true;
                    }
                    if (existing.getWebsiteUrl() == null && websiteUrl != null && !websiteUrl.isBlank()) {
                        existing.setWebsiteUrl(websiteUrl.trim());
                        changed = true;
                    }
                    return changed ? companyRepository.save(existing) : existing;
                })
                .orElseGet(() -> {
                    String baseSlug = CompanyNormalizer.generateSlug(rawName);
                    String slug = baseSlug;
                    int attempts = 0;
                    while (companyRepository.existsBySlug(slug) && attempts < 10) {
                        attempts++;
                        slug = baseSlug + "-" + attempts;
                    }

                    Company company = new Company(rawName.trim(), normalized, slug);
                    if (logoUrl != null && !logoUrl.isBlank()) {
                        company.setLogoUrl(logoUrl.trim());
                    }
                    if (websiteUrl != null && !websiteUrl.isBlank()) {
                        company.setWebsiteUrl(websiteUrl.trim());
                    }

                    try {
                        return companyRepository.save(company);
                    } catch (DataIntegrityViolationException ex) {
                        // Concurrent insert safety: return the concurrently created company
                        return companyRepository.findByNormalizedName(normalized)
                                .orElseThrow(() -> ex);
                    }
                });
    }

    @Override
    @Transactional
    @CacheEvict(value = {"companiesSearch", "publicJobs", "jobsBySlug", "featuredJobs", "relatedJobs"}, allEntries = true)
    public CompanyResponseDTO uploadCompanyLogo(Long companyId, MultipartFile file) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company with ID " + companyId + " not found"));

        // Retain old public ID for safe replacement cleanup
        String oldPublicId = company.getLogoPublicId();

        // Upload new logo asset to Cloudinary
        CloudinaryUploadResult uploadResult = cloudinaryService.uploadLogo(file, company.getSlug());

        // Update company record
        company.setLogoPublicId(uploadResult.getPublicId());
        company.setLogoAssetId(uploadResult.getAssetId());
        company.setLogoUrl(uploadResult.getSecureUrl());
        company.setLogoAltText(company.getName() + " logo");
        Company saved = companyRepository.save(company);

        // Delete previous Cloudinary asset to avoid orphaned files in CDN storage
        if (oldPublicId != null && !oldPublicId.isBlank() && !oldPublicId.equals(uploadResult.getPublicId())) {
            cloudinaryService.deleteLogo(oldPublicId);
        }

        // Synchronize logo across all jobs belonging to this company for instant site-wide consistency
        try {
            jobRepository.updateCompanyLogoForCompany(company.getId(), company.getNormalizedName(), saved.getLogoUrl());
        } catch (Exception ex) {
            log.warn("Non-fatal note: jobs sync after company logo upload completed with: {}", ex.getMessage());
        }

        log.info("Company logo uploaded successfully for company ID {}: {}", companyId, saved.getLogoUrl());
        return CompanyResponseDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"companiesSearch", "publicJobs", "jobsBySlug", "featuredJobs", "relatedJobs"}, allEntries = true)
    public void removeCompanyLogo(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company with ID " + companyId + " not found"));

        String publicId = company.getLogoPublicId();
        company.setLogoPublicId(null);
        company.setLogoAssetId(null);
        company.setLogoUrl(null);
        company.setLogoAltText(null);
        companyRepository.save(company);

        if (publicId != null && !publicId.isBlank()) {
            cloudinaryService.deleteLogo(publicId);
        }

        try {
            jobRepository.updateCompanyLogoForCompany(company.getId(), company.getNormalizedName(), null);
        } catch (Exception ex) {
            log.warn("Non-fatal note: jobs sync after company logo removal completed with: {}", ex.getMessage());
        }

        log.info("Company logo removed for company ID {}", companyId);
    }
}
