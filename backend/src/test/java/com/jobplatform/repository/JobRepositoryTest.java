package com.jobplatform.repository;

import com.jobplatform.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class JobRepositoryTest {

    @Autowired
    private JobRepository jobRepository;

    @BeforeEach
    void setUp() {
        jobRepository.deleteAll();
    }

    private Job createSampleJob(String slug, String title, String company, JobStatus status, boolean featured) {
        Job job = new Job(
            slug,
            title,
            company,
            "Engineering",
            EmploymentType.FULL_TIME,
            WorkMode.REMOTE,
            ExperienceLevel.SENIOR,
            "San Francisco, CA",
            "Job description overview",
            "https://company.com/apply"
        );
        job.setStatus(status);
        job.setFeatured(featured);
        job.setSalaryMin(120000L);
        job.setSalaryMax(160000L);
        job.setSalaryCurrency("USD");
        job.setSalaryPeriod("YEAR");
        job.setHideSalary(false);
        return job;
    }

    @Test
    @DisplayName("Saves and retrieves a published job by slug")
    void testSaveAndFindBySlugAndStatus() {
        Job job = createSampleJob("staff-eng-uber-1234", "Staff Engineer", "Uber", JobStatus.PUBLISHED, true);
        jobRepository.save(job);

        Optional<Job> found = jobRepository.findBySlugAndStatus("staff-eng-uber-1234", JobStatus.PUBLISHED);
        assertTrue(found.isPresent());
        assertEquals("Staff Engineer", found.get().getTitle());
        assertEquals("Uber", found.get().getCompany());
        assertNotNull(found.get().getCreatedAt());
        assertNotNull(found.get().getPublishedAt());
    }

    @Test
    @DisplayName("Prevents unauthenticated public retrieval of draft jobs")
    void testDraftJobNotReturnedByPublishedQuery() {
        Job draftJob = createSampleJob("draft-role-google-abcd", "Draft Engineer", "Google", JobStatus.DRAFT, false);
        jobRepository.save(draftJob);

        Optional<Job> publicLookup = jobRepository.findBySlugAndStatus("draft-role-google-abcd", JobStatus.PUBLISHED);
        assertFalse(publicLookup.isPresent(), "DRAFT job must never be returned to public query");

        Optional<Job> internalLookup = jobRepository.findBySlug("draft-role-google-abcd");
        assertTrue(internalLookup.isPresent(), "Internal/Admin lookup can find draft by slug");
    }

    @Test
    @DisplayName("Enforces unique constraint on job slug at database level")
    void testUniqueSlugConstraint() {
        Job job1 = createSampleJob("unique-slug-test-1111", "Role One", "Acme", JobStatus.PUBLISHED, false);
        jobRepository.saveAndFlush(job1);

        Job job2 = createSampleJob("unique-slug-test-1111", "Role Two", "Beta", JobStatus.PUBLISHED, false);
        assertThrows(DataIntegrityViolationException.class, () -> {
            jobRepository.saveAndFlush(job2);
        });
    }

    @Test
    @DisplayName("Supports pagination and stable ordering")
    void testPaginationAndOrdering() {
        for (int i = 1; i <= 5; i++) {
            Job job = createSampleJob("job-slug-" + i, "Title " + i, "Company", JobStatus.PUBLISHED, false);
            jobRepository.save(job);
        }

        PageRequest pageRequest = PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> page = jobRepository.findByStatus(JobStatus.PUBLISHED, pageRequest);

        assertEquals(5, page.getTotalElements());
        assertEquals(3, page.getTotalPages());
        assertEquals(2, page.getContent().size());
        assertTrue(page.isFirst());
        assertFalse(page.isLast());
    }

    @Test
    @DisplayName("Finds top featured jobs correctly")
    void testFindTopFeaturedJobs() {
        Job featured1 = createSampleJob("feat-1", "Featured 1", "Co1", JobStatus.PUBLISHED, true);
        Job featured2 = createSampleJob("feat-2", "Featured 2", "Co2", JobStatus.PUBLISHED, true);
        Job nonFeatured = createSampleJob("non-feat", "Regular", "Co3", JobStatus.PUBLISHED, false);

        jobRepository.save(featured1);
        jobRepository.save(featured2);
        jobRepository.save(nonFeatured);

        List<Job> featuredJobs = jobRepository.findTop6ByStatusAndFeaturedTrueOrderByPublishedAtDesc(JobStatus.PUBLISHED);
        assertEquals(2, featuredJobs.size());
        assertTrue(featuredJobs.stream().allMatch(Job::isFeatured));
    }
}
