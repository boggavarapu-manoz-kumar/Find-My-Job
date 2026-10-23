package com.jobplatform.controller;

import com.jobplatform.dto.CompanyResponseDTO;
import com.jobplatform.service.CompanyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompanyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CompanyService companyService;

    private CompanyResponseDTO buildSampleCompanyDto(Long id, String name, String logoUrl) {
        CompanyResponseDTO dto = new CompanyResponseDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setNormalizedName(name.toLowerCase());
        dto.setSlug(name.toLowerCase().replace(" ", "-"));
        dto.setLogoUrl(logoUrl);
        dto.setLogoAltText(name + " logo");
        dto.setWebsiteUrl("https://" + name.toLowerCase() + ".com");
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    @Test
    @DisplayName("Public search endpoint is open without authentication")
    void testPublicSearchCompanies() throws Exception {
        CompanyResponseDTO dto = buildSampleCompanyDto(1L, "Netflix", "https://res.cloudinary.com/demo/image/upload/netflix.png");

        when(companyService.searchCompanies(eq("net"), anyInt())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/public/companies/search")
                        .param("query", "net")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Netflix"))
                .andExpect(jsonPath("$.data[0].logoUrl").value("https://res.cloudinary.com/demo/image/upload/netflix.png"));
    }

    @Test
    @DisplayName("Admin logo upload endpoint denies unauthenticated access")
    void testAdminUploadLogoRequiresAuth() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/v1/admin/companies/1/logo").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "candidate@example.com", roles = {"USER"})
    @DisplayName("Admin logo upload endpoint forbids non-admin candidates")
    void testAdminUploadLogoForbidsCandidate() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/v1/admin/companies/1/logo").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@jobplatform.com", roles = {"ADMIN"})
    @DisplayName("Admin logo upload endpoint succeeds for authorized admin")
    void testAdminUploadLogoSucceeds() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", new byte[]{1, 2, 3});
        CompanyResponseDTO dto = buildSampleCompanyDto(1L, "Spotify", "https://res.cloudinary.com/demo/image/upload/spotify.png");

        when(companyService.uploadCompanyLogo(eq(1L), any())).thenReturn(dto);

        mockMvc.perform(multipart("/api/v1/admin/companies/1/logo").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Spotify"))
                .andExpect(jsonPath("$.data.logoUrl").value("https://res.cloudinary.com/demo/image/upload/spotify.png"));
    }
}
