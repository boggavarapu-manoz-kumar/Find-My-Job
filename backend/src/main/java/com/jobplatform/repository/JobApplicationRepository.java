package com.jobplatform.repository;

import com.jobplatform.entity.ApplicationStatus;
import com.jobplatform.entity.JobApplication;
import com.jobplatform.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Page<JobApplication> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<JobApplication> findByJobIdOrderByCreatedAtDesc(Long jobId, Pageable pageable);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    long countByJobId(Long jobId);

    long countByStatus(ApplicationStatus status);
}
