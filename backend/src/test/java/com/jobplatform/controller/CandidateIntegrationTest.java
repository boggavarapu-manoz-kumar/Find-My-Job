package com.jobplatform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplatform.dto.CandidateRegisterRequestDTO;
import com.jobplatform.dto.JobApplicationRequestDTO;
import com.jobplatform.dto.LoginRequestDTO;
import com.jobplatform.entity.*;
import com.jobplatform.repository.JobApplicationRepository;
import com.jobplatform.repository.JobRepository;
import com.jobplatform.repository.SavedJobRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CandidateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User candidateUser;
    private User otherCandidateUser;
    private User adminUser;
    private Job publishedJob;
    private Job draftJob;
    private String candidateToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        jobApplicationRepository.deleteAll();
        savedJobRepository.deleteAll();
        jobRepository.deleteAll();
        userRepository.deleteAll();

        // Seed candidate user
        candidateUser = new User(
                "candidate1",
                "candidate1@example.com",
                passwordEncoder.encode("Password123!"),
                "ROLE_CANDIDATE"
        );
        candidateUser = userRepository.save(candidateUser);

        // Seed second candidate
        otherCandidateUser = new User(
                "candidate2",
                "candidate2@example.com",
                passwordEncoder.encode("Password123!"),
                "ROLE_CANDIDATE"
        );
        otherCandidateUser = userRepository.save(otherCandidateUser);

        // Seed admin user
        adminUser = new User(
                "platformadmin",
                "admin@platform.com",
                passwordEncoder.encode("AdminPass123!"),
                "ROLE_ADMIN"
        );
        adminUser = userRepository.save(adminUser);

        // Tokens
        candidateToken = tokenProvider.generateTokenFromUsernameAndRoles(candidateUser.getUsername(), candidateUser.getRole());
        adminToken = tokenProvider.generateTokenFromUsernameAndRoles(adminUser.getUsername(), adminUser.getRole());

        // Published Job
        publishedJob = new Job(
                "senior-java-engineer",
                "Senior Java Engineer",
                "Stripe",
                "Engineering",
                EmploymentType.FULL_TIME,
                WorkMode.REMOTE,
                ExperienceLevel.SENIOR,
                "San Francisco, CA",
                "Develop high throughput payment APIs",
                "https://stripe.com/jobs/apply"
        );
        publishedJob.setStatus(JobStatus.PUBLISHED);
        publishedJob.setPublishedAt(LocalDateTime.now());
        publishedJob = jobRepository.save(publishedJob);

        // Draft Job
        draftJob = new Job(
                "internal-draft-engineer",
                "Internal Draft Engineer",
                "Internal",
                "Engineering",
                EmploymentType.FULL_TIME,
                WorkMode.REMOTE,
                ExperienceLevel.MID,
                "Remote",
                "Internal draft posting",
                "https://internal.com/apply"
        );
        draftJob.setStatus(JobStatus.DRAFT);
        draftJob = jobRepository.save(draftJob);
    }

    // 1. Registration tests
    @Test
    @DisplayName("Candidate registration succeeds and assigns ROLE_CANDIDATE")
    void testCandidateRegistrationSuccess() throws Exception {
        CandidateRegisterRequestDTO request = new CandidateRegisterRequestDTO(
                "newcandidate",
                "new@candidate.com",
                "StrongPassword123!"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_CANDIDATE"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());

        User created = userRepository.findByUsername("newcandidate").orElseThrow();
        assertEquals("ROLE_CANDIDATE", created.getRole());
        assertTrue(passwordEncoder.matches("StrongPassword123!", created.getPasswordHash()));
    }

    @Test
    @DisplayName("Candidate registration rejects duplicate email")
    void testCandidateRegistrationDuplicateEmail() throws Exception {
        CandidateRegisterRequestDTO request = new CandidateRegisterRequestDTO(
                "unique_user",
                "candidate1@example.com",
                "StrongPassword123!"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Candidate registration rejects weak password")
    void testCandidateRegistrationShortPassword() throws Exception {
        CandidateRegisterRequestDTO request = new CandidateRegisterRequestDTO(
                "user_short",
                "short@example.com",
                "short"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // 2. Login & Role Separation
    @Test
    @DisplayName("Candidate login succeeds and provides JWT")
    void testCandidateLoginSuccess() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("candidate1@example.com", "Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("Candidate cannot access admin endpoints (Forbidden 403)")
    void testCandidateForbiddenFromAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/jobs")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to candidate endpoints is unauthorized (401 or 403)")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/v1/candidate/saved-jobs"))
                .andExpect(status().isForbidden());
    }

    // 3. Saved Jobs Operations
    @Test
    @DisplayName("Candidate can save a published job")
    void testSaveJobSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/candidate/saved-jobs/" + publishedJob.getId())
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.jobId").value(publishedJob.getId()));

        assertTrue(savedJobRepository.existsByUserIdAndJobId(candidateUser.getId(), publishedJob.getId()));
    }

    @Test
    @DisplayName("Candidate saving a non-published/draft job is rejected with HTTP 400")
    void testSaveDraftJobRejected() throws Exception {
        mockMvc.perform(post("/api/v1/candidate/saved-jobs/" + draftJob.getId())
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Candidate can unsave a job")
    void testUnsaveJob() throws Exception {
        savedJobRepository.save(new SavedJob(candidateUser, publishedJob));

        mockMvc.perform(delete("/api/v1/candidate/saved-jobs/" + publishedJob.getId())
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertFalse(savedJobRepository.existsByUserIdAndJobId(candidateUser.getId(), publishedJob.getId()));
    }

    @Test
    @DisplayName("Listing saved jobs returns only candidate's own saved items")
    void testListSavedJobsIsolation() throws Exception {
        savedJobRepository.save(new SavedJob(candidateUser, publishedJob));

        mockMvc.perform(get("/api/v1/candidate/saved-jobs")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].jobId").value(publishedJob.getId()));

        // Other candidate has 0 saved jobs
        String otherToken = tokenProvider.generateTokenFromUsernameAndRoles(otherCandidateUser.getUsername(), otherCandidateUser.getRole());
        mockMvc.perform(get("/api/v1/candidate/saved-jobs")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }

    // 4. Job Applications
    @Test
    @DisplayName("Candidate can submit application to published job")
    void testSubmitApplicationSuccess() throws Exception {
        JobApplicationRequestDTO request = new JobApplicationRequestDTO(
                publishedJob.getId(),
                "Candidate One",
                "candidate1@example.com",
                "+14155552671",
                "https://linkedin.com/in/candidate1",
                "Excited to apply for this position!"
        );

        mockMvc.perform(post("/api/v1/candidate/applications")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.candidateEmail").value("candidate1@example.com"));

        assertTrue(jobApplicationRepository.existsByUserIdAndJobId(candidateUser.getId(), publishedJob.getId()));
    }

    @Test
    @DisplayName("Candidate submitting duplicate application returns HTTP 409 Conflict")
    void testDuplicateApplicationRejected() throws Exception {
        JobApplicationRequestDTO request = new JobApplicationRequestDTO(
                publishedJob.getId(),
                "Candidate One",
                "candidate1@example.com",
                "+14155552671",
                "https://linkedin.com/in/candidate1",
                "First application"
        );

        // First application
        mockMvc.perform(post("/api/v1/candidate/applications")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second application attempt -> 409 Conflict
        mockMvc.perform(post("/api/v1/candidate/applications")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Candidate applying to draft job is rejected with HTTP 400")
    void testApplyToDraftJobRejected() throws Exception {
        JobApplicationRequestDTO request = new JobApplicationRequestDTO(
                draftJob.getId(),
                "Candidate One",
                "candidate1@example.com",
                "+14155552671",
                "https://linkedin.com/in/candidate1",
                "Application to draft"
        );

        mockMvc.perform(post("/api/v1/candidate/applications")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Candidate can withdraw an application")
    void testWithdrawApplication() throws Exception {
        JobApplication app = new JobApplication(
                candidateUser,
                publishedJob,
                "Candidate One",
                "candidate1@example.com",
                "+14155552671",
                "https://linkedin.com/in/candidate1",
                "Initial cover letter"
        );
        app = jobApplicationRepository.save(app);

        mockMvc.perform(patch("/api/v1/candidate/applications/" + app.getId() + "/withdraw")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("WITHDRAWN"));
    }

    // 5. Admin Application Status Management
    @Test
    @DisplayName("Admin can view applications for job and update status")
    void testAdminApplicationReviewAndUpdate() throws Exception {
        JobApplication app = new JobApplication(
                candidateUser,
                publishedJob,
                "Candidate One",
                "candidate1@example.com",
                "+14155552671",
                "https://linkedin.com/in/candidate1",
                "Review me"
        );
        app = jobApplicationRepository.save(app);

        // Admin lists applications for publishedJob
        mockMvc.perform(get("/api/v1/admin/applications/job/" + publishedJob.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));

        // Admin updates status to INTERVIEW
        mockMvc.perform(patch("/api/v1/admin/applications/" + app.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"INTERVIEW\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INTERVIEW"));

        // Candidate verifies status updated in their personal tracking
        mockMvc.perform(get("/api/v1/candidate/applications/" + app.getId())
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INTERVIEW"));
    }
}
