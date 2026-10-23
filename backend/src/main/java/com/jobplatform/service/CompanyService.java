package com.jobplatform.service;

import com.jobplatform.dto.CompanyCreateRequestDTO;
import com.jobplatform.dto.CompanyResponseDTO;
import com.jobplatform.entity.Company;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CompanyService {

    List<CompanyResponseDTO> searchCompanies(String query, int limit);

    CompanyResponseDTO getCompanyById(Long id);

    CompanyResponseDTO getCompanyBySlug(String slug);

    CompanyResponseDTO createCompany(CompanyCreateRequestDTO request);

    Company findOrCreateCompanyEntity(String rawName, String logoUrl, String websiteUrl);

    CompanyResponseDTO uploadCompanyLogo(Long companyId, MultipartFile file);

    void removeCompanyLogo(Long companyId);
}
