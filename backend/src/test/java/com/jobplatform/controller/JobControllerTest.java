package com.jobplatform.controller;

import com.jobplatform.dto.JobCreateRequestDTO;
import com.jobplatform.dto.JobResponseDTO;
import com.jobplatform.dto.PaginatedResponseDTO;
import com.jobplatform.entity.*;
import com.jobplatform.exception.ResourceNotFoundException;
import com.jobplatform.service.JobService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

    private JobResponseDTO createSampleDTO() {
        JobResponseDTO dto = new JobResponseDTO();
        dto.setId(101L);
        dto.setSlug("staff-software-engineer-stripe-f91a");
        dto.setTitle("Staff Software Engineer, Platform Infrastructure");
        dto.setCompany("Stripe");
        dto.setCategory("Engineering");
        dto.setEmploymentType(EmploymentType.FULL_TIME);
        dto.setWorkMode(WorkMode.REMOTE);
        dto.setExperienceLevel(ExperienceLevel.LEAD);
        dto.setFresherEligible(false);
        dto.setLocation("San Francisco, CA (Remote)");
        dto.setSalaryMin(195000L);
        dto.setSalaryMax(245000L);
        dto.setSalaryCurrency("USD");
        dto.setSalaryPeriod("YEAR");
        dto.setHideSalary(false);
        dto.setDescription("Lead the architecture of distributed settlement ledgers.");
        dto.setApplicationUrl("https://stripe.com/jobs");
        dto.setStatus(JobStatus.PUBLISHED);
        dto.setFeatured(true);
        dto.setViewsCount(10L);
        dto.setClicksCount(2L);
        return dto;
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs returns published paginated jobs")
    void testGetPublicJobs() throws Exception {
        JobResponseDTO dto = createSampleDTO();
        PaginatedResponseDTO<JobResponseDTO> pageResponse = new PaginatedResponseDTO<>(
            List.of(dto), 0, 10, 1, 1, true, true, false, false
        );

        when(jobService.getPublicJobs(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/public/jobs")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].slug").value("staff-software-engineer-stripe-f91a"))
            .andExpect(jsonPath("$.data.content[0].title").value("Staff Software Engineer, Platform Infrastructure"))
            .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs/{slug} returns 200 OK for published job")
    void testGetJobBySlugPublished() throws Exception {
        JobResponseDTO dto = createSampleDTO();
        when(jobService.getPublicJobBySlug("staff-software-engineer-stripe-f91a"))
            .thenReturn(dto);

        mockMvc.perform(get("/api/v1/public/jobs/staff-software-engineer-stripe-f91a")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.slug").value("staff-software-engineer-stripe-f91a"))
            .andExpect(jsonPath("$.data.company").value("Stripe"));
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs/{slug} returns 404 NOT_FOUND for unknown slug")
    void testGetJobBySlugNotFound() throws Exception {
        when(jobService.getPublicJobBySlug("unknown-slug-9999"))
            .thenThrow(new ResourceNotFoundException("Job opportunity not found or no longer active"));

        mockMvc.perform(get("/api/v1/public/jobs/unknown-slug-9999")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Job opportunity not found or no longer active"));
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs/featured returns featured listings")
    void testGetFeaturedJobs() throws Exception {
        JobResponseDTO dto = createSampleDTO();
        when(jobService.getFeaturedJobs()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/public/jobs/featured"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].featured").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/admin/jobs without authentication returns 401 or 403")
    void testCreateJobUnauthenticated() throws Exception {
        String json = """
            {
                "title": "Graduate Associate",
                "company": "Accenture",
                "category": "Engineering",
                "employmentType": "FULL_TIME",
                "workMode": "HYBRID",
                "experienceLevel": "ENTRY",
                "location": "Austin, TX",
                "description": "Fast-track engineering program for new college graduates.",
                "applicationUrl": "https://accenture.com/careers"
            }
            """;

        mockMvc.perform(post("/api/v1/admin/jobs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/admin/jobs with ADMIN role creates job successfully")
    void testCreateJobWithAdminRole() throws Exception {
        JobResponseDTO createdDTO = createSampleDTO();
        when(jobService.createJob(any(JobCreateRequestDTO.class))).thenReturn(createdDTO);

        String json = """
            {
                "title": "Staff Software Engineer, Platform Infrastructure",
                "company": "Stripe",
                "category": "Engineering",
                "employmentType": "FULL_TIME",
                "workMode": "REMOTE",
                "experienceLevel": "LEAD",
                "location": "San Francisco, CA (Remote)",
                "description": "Lead the architecture of distributed settlement ledgers.",
                "applicationUrl": "https://stripe.com/jobs"
            }
            """;

        mockMvc.perform(post("/api/v1/admin/jobs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.slug").value("staff-software-engineer-stripe-f91a"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/admin/jobs with invalid salary range returns 400 Bad Request")
    void testCreateJobInvalidSalaryRange() throws Exception {
        String json = """
            {
                "title": "Staff Software Engineer, Platform Infrastructure",
                "company": "Stripe",
                "category": "Engineering",
                "employmentType": "FULL_TIME",
                "workMode": "REMOTE",
                "experienceLevel": "LEAD",
                "location": "San Francisco, CA (Remote)",
                "salaryMin": 250000,
                "salaryMax": 100000,
                "description": "Lead the architecture of distributed settlement ledgers.",
                "applicationUrl": "https://stripe.com/jobs"
            }
            """;

        mockMvc.perform(post("/api/v1/admin/jobs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Validation failed for one or more fields"));
    }
}
