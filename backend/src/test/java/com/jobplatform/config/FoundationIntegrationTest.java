package com.jobplatform.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class FoundationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Validation failure returns 400 with structured JSON error envelope")
    void testValidationFailureReturnsStructuredErrors() throws Exception {
        String invalidJson = "{\"title\":\"\", \"email\":\"not-an-email\"}";

        mockMvc.perform(post("/api/v1/public/test/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed for one or more fields"))
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("Valid payload returns 200 with structured JSON success envelope")
    void testValidationSuccess() throws Exception {
        String validJson = "{\"title\":\"Senior Engineer\", \"email\":\"developer@example.com\"}";

        mockMvc.perform(post("/api/v1/public/test/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Senior Engineer"))
                .andExpect(jsonPath("$.data.email").value("developer@example.com"));
    }

    @Test
    @DisplayName("Unauthenticated request to protected administrative endpoints is forbidden")
    void testAdminEndpointsAreProtected() throws Exception {
        mockMvc.perform(get("/api/v1/admin/jobs"))
                .andExpect(status().isForbidden());
    }
}
