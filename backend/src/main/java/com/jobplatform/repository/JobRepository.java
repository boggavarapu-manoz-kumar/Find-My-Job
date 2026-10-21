package com.jobplatform.repository;

import com.jobplatform.entity.Job;
import com.jobplatform.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    /**
     * Resolves a published job strictly by unique permanent slug.
     * Prevents leakage of DRAFT or ARCHIVED jobs to unauthenticated public requests.
     */
    Optional<Job> findBySlugAndStatus(String slug, JobStatus status);

    /**
     * Finds any job by slug regardless of status (used for internal integrity and slug collision checks).
     */
    Optional<Job> findBySlug(String slug);

    /**
     * Fast existence check for unique slug validation.
     */
    boolean existsBySlug(String slug);

    /**
     * Checks if a slug exists for any job other than the given ID (used during updates).
     */
    boolean existsBySlugAndIdNot(String slug, Long id);

    /**
     * Retrieves published jobs with pagination.
     */
    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    /**
     * Retrieves top featured positions for the landing page hero/curated showcase.
     */
    List<Job> findTop6ByStatusAndFeaturedTrueOrderByPublishedAtDesc(JobStatus status);

    /**
     * Retrieves related opportunities within the same category (excluding the current job).
     */
    List<Job> findTop3ByStatusAndCategoryAndIdNotOrderByPublishedAtDesc(JobStatus status, String category, Long id);

    /**
     * Increments public view audit counter atomically.
     */
    @Modifying
    @Query("UPDATE Job j SET j.viewsCount = j.viewsCount + 1 WHERE j.id = :id")
    void incrementViewsCount(@Param("id") Long id);

    /**
     * Aggregates active published job counts grouped by category in a single query.
     */
    @Query("SELECT j.category, COUNT(j) FROM Job j WHERE j.status = :status GROUP BY j.category")
    List<Object[]> countJobsGroupedByCategory(@Param("status") JobStatus status);
}
