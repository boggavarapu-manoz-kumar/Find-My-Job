package com.jobplatform.service;

import com.jobplatform.dto.CloudinaryUploadResult;
import com.jobplatform.dto.CompanyCreateRequestDTO;
import com.jobplatform.dto.CompanyResponseDTO;
import com.jobplatform.entity.Company;
import com.jobplatform.exception.ApiException;
import com.jobplatform.repository.CompanyRepository;
import com.jobplatform.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CompanyServiceImpl companyService;

    private Company sampleCompany;

    @BeforeEach
    void setUp() {
        sampleCompany = new Company("Google LLC", "google llc", "google-llc");
        sampleCompany.setId(101L);
        sampleCompany.setLogoUrl("https://example.com/logo.png");
        sampleCompany.setWebsiteUrl("https://google.com");
    }

    @Test
    @DisplayName("Find or create company deduplicates based on normalized name")
    void testFindOrCreateCompanyDeduplicates() {
        when(companyRepository.findByNormalizedName("google")).thenReturn(Optional.of(sampleCompany));

        Company resolved = companyService.findOrCreateCompanyEntity("  Google  ", null, null);

        assertThat(resolved).isNotNull();
        assertThat(resolved.getId()).isEqualTo(101L);
        assertThat(resolved.getName()).isEqualTo("Google LLC");
        verify(companyRepository, never()).save(any(Company.class));
    }

    @Test
    @DisplayName("Find or create company saves new entity if not found")
    void testFindOrCreateCompanyCreatesNew() {
        when(companyRepository.findByNormalizedName("microsoft")).thenReturn(Optional.empty());
        when(companyRepository.existsBySlug("microsoft")).thenReturn(false);
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> {
            Company c = invocation.getArgument(0);
            c.setId(202L);
            return c;
        });

        Company created = companyService.findOrCreateCompanyEntity("Microsoft", "https://example.com/ms-logo.png", null);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo(202L);
        assertThat(created.getNormalizedName()).isEqualTo("microsoft");
        assertThat(created.getLogoUrl()).isEqualTo("https://example.com/ms-logo.png");
        verify(companyRepository).save(any(Company.class));
    }

    @Test
    @DisplayName("Search companies returns list of matched DTOs")
    void testSearchCompanies() {
        when(companyRepository.searchByName(eq("goo"), any(Pageable.class)))
                .thenReturn(List.of(sampleCompany));

        List<CompanyResponseDTO> results = companyService.searchCompanies("goo", 5);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Google LLC");
    }

    @Test
    @DisplayName("Upload company logo updates company and propagates to associated jobs")
    void testUploadCompanyLogoSyncsJobs() {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", new byte[]{1, 2, 3});
        CloudinaryUploadResult uploadResult = new CloudinaryUploadResult(
                "job-platform/company-logos/google_123",
                "asset_111",
                "https://res.cloudinary.com/demo/image/upload/v1/job-platform/company-logos/google_123.png",
                "png",
                200,
                200,
                1500L
        );

        when(companyRepository.findById(101L)).thenReturn(Optional.of(sampleCompany));
        when(cloudinaryService.uploadLogo(file, sampleCompany.getSlug())).thenReturn(uploadResult);
        when(companyRepository.save(any(Company.class))).thenReturn(sampleCompany);

        CompanyResponseDTO dto = companyService.uploadCompanyLogo(101L, file);

        assertThat(dto).isNotNull();
        assertThat(sampleCompany.getLogoUrl()).isEqualTo(uploadResult.getSecureUrl());
        assertThat(sampleCompany.getLogoPublicId()).isEqualTo(uploadResult.getPublicId());

        // Verifies job repository was called to synchronize all existing jobs for this company
        verify(jobRepository).updateCompanyLogoForCompany(101L, sampleCompany.getNormalizedName(), uploadResult.getSecureUrl());
    }

    @Test
    @DisplayName("Remove company logo clears logo fields and cleans up CDN asset")
    void testRemoveCompanyLogo() {
        sampleCompany.setLogoPublicId("job-platform/company-logos/google_123");
        sampleCompany.setLogoUrl("https://res.cloudinary.com/demo/image/upload/v1/job-platform/company-logos/google_123.png");

        when(companyRepository.findById(101L)).thenReturn(Optional.of(sampleCompany));
        when(companyRepository.save(any(Company.class))).thenReturn(sampleCompany);

        companyService.removeCompanyLogo(101L);

        assertThat(sampleCompany.getLogoUrl()).isNull();
        assertThat(sampleCompany.getLogoPublicId()).isNull();

        verify(cloudinaryService).deleteLogo("job-platform/company-logos/google_123");
        verify(jobRepository).updateCompanyLogoForCompany(101L, sampleCompany.getNormalizedName(), null);
    }
}
