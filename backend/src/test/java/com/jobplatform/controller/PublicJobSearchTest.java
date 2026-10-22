package com.jobplatform.controller;

import com.jobplatform.dto.JobResponseDTO;
import com.jobplatform.dto.PaginatedResponseDTO;
import com.jobplatform.service.JobService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicJobSearchTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

    @Test
    @DisplayName("GET /api/v1/public/jobs - Rejects unsupported sort property with HTTP 400")
    void testUnsupportedSortProperty() throws Exception {
        mockMvc.perform(get("/api/v1/public/jobs")
                .param("sort", "hackerField,desc")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unsupported sort property: hackerField"));
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs - Rejects invalid sort direction with HTTP 400")
    void testInvalidSortDirection() throws Exception {
        mockMvc.perform(get("/api/v1/public/jobs")
                .param("sort", "title,sideways")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid sort direction: sideways"));
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs - Rejects contradictory salary range with HTTP 400")
    void testContradictorySalaryRange() throws Exception {
        mockMvc.perform(get("/api/v1/public/jobs")
                .param("salaryMin", "200000")
                .param("salaryMax", "100000")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Minimum salary cannot be greater than maximum salary"));
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs - Rejects negative salary filter with HTTP 400")
    void testNegativeSalaryFilter() throws Exception {
        mockMvc.perform(get("/api/v1/public/jobs")
                .param("salaryMin", "-500")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Minimum salary cannot be negative"));
    }

    @Test
    @DisplayName("GET /api/v1/public/jobs - Allows approved sort fields and returns 200 OK")
    void testApprovedSortFields() throws Exception {
        PaginatedResponseDTO<JobResponseDTO> pageResponse = new PaginatedResponseDTO<>(
                List.of(), 0, 10, 0, 1, true, true, false, false
        );

        when(jobService.getPublicJobs(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(pageResponse);

        // title,asc
        mockMvc.perform(get("/api/v1/public/jobs")
                .param("sort", "title,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // salaryMax,desc
        mockMvc.perform(get("/api/v1/public/jobs")
                .param("sort", "salaryMax,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // company,desc
        mockMvc.perform(get("/api/v1/public/jobs")
                .param("sort", "company,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
