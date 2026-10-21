package com.jobplatform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplatform.dto.LoginRequestDTO;
import com.jobplatform.entity.User;
import com.jobplatform.repository.UserRepository;
import com.jobplatform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User testAdmin = new User(
                "testadmin",
                "testadmin@example.com",
                passwordEncoder.encode("SecurePass123!"),
                "ROLE_ADMIN"
        );
        userRepository.save(testAdmin);
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Success with valid username and password")
    void loginSuccessWithUsername() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("testadmin", "SecurePass123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.username").value("testadmin"))
                .andExpect(jsonPath("$.data.user.email").value("testadmin@example.com"))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_ADMIN"))
                .andExpect(jsonPath("$.data.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Success with valid email and password")
    void loginSuccessWithEmail() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("testadmin@example.com", "SecurePass123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.user.username").value("testadmin"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Failure with incorrect password returns 401")
    void loginFailureIncorrectPassword() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("testadmin", "WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username/email or password"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Failure with non-existent user returns generic 401")
    void loginFailureNonExistentUser() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("nonexistent", "SecurePass123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username/email or password"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Validation failure with blank credentials returns 400")
    void loginValidationFailureBlank() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("", "");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.usernameOrEmail").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - Success with valid Bearer token")
    void getMeSuccess() throws Exception {
        String token = jwtTokenProvider.generateTokenFromUsernameAndRoles("testadmin", "ROLE_ADMIN");

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testadmin"))
                .andExpect(jsonPath("$.data.email").value("testadmin@example.com"))
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - Rejects unauthenticated request with 401/403")
    void getMeUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/admin/jobs - Allowed with valid admin Bearer token")
    void adminJobsAllowedWithBearerToken() throws Exception {
        String token = jwtTokenProvider.generateTokenFromUsernameAndRoles("testadmin", "ROLE_ADMIN");

        mockMvc.perform(get("/api/v1/admin/jobs")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/admin/jobs - Forbidden with non-admin role token")
    void adminJobsForbiddenWithUserRoleToken() throws Exception {
        User regularUser = new User("regularuser", "regular@example.com", passwordEncoder.encode("Pass123!"), "ROLE_USER");
        userRepository.save(regularUser);

        String userToken = jwtTokenProvider.generateTokenFromUsernameAndRoles("regularuser", "ROLE_USER");

        mockMvc.perform(get("/api/v1/admin/jobs")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }
}
