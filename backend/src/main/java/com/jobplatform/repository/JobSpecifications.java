package com.jobplatform.repository;

import com.jobplatform.entity.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class JobSpecifications {

    private JobSpecifications() {}

    /**
     * Constructs dynamic JPA query specifications for public published jobs.
     */
    public static Specification<Job> withPublicFilters(
        String keyword,
        String location,
        String category,
        WorkMode workMode,
        EmploymentType employmentType,
        ExperienceLevel experienceLevel,
        Boolean fresher,
        Long salaryMin,
        Long salaryMax
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Rule 1: Public queries must strictly evaluate PUBLISHED jobs
            predicates.add(cb.equal(root.get("status"), JobStatus.PUBLISHED));

            // Rule 2: Keyword search across title, company, skills, location, or description
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate companyMatch = cb.like(cb.lower(root.get("company")), pattern);
                Predicate skillsMatch = cb.like(cb.lower(root.get("skills")), pattern);
                Predicate locationMatch = cb.like(cb.lower(root.get("location")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleMatch, companyMatch, skillsMatch, locationMatch, descMatch));
            }

            // Rule 3: Dedicated Location search
            if (location != null && !location.isBlank()) {
                String pattern = "%" + location.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("location")), pattern));
            }

            // Rule 4: Category exact match (case-insensitive)
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            // Rule 5: WorkMode enum match
            if (workMode != null) {
                predicates.add(cb.equal(root.get("workMode"), workMode));
            }

            // Rule 6: EmploymentType enum match
            if (employmentType != null) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }

            // Rule 7: ExperienceLevel enum match
            if (experienceLevel != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), experienceLevel));
            }

            // Rule 8: Fresher eligibility boolean filter
            if (fresher != null) {
                predicates.add(cb.equal(root.get("fresherEligible"), fresher));
            }

            // Rule 9: Minimum salary filter (job max salary must be at least the requested threshold)
            if (salaryMin != null) {
                predicates.add(cb.and(
                    cb.isNotNull(root.get("salaryMax")),
                    cb.greaterThanOrEqualTo(root.get("salaryMax"), salaryMin)
                ));
            }

            // Rule 10: Maximum salary filter (job min salary must not exceed requested ceiling)
            if (salaryMax != null) {
                predicates.add(cb.and(
                    cb.isNotNull(root.get("salaryMin")),
                    cb.lessThanOrEqualTo(root.get("salaryMin"), salaryMax)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
