package com.jobplatform.repository;

import com.jobplatform.entity.Company;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByNormalizedName(String normalizedName);

    Optional<Company> findBySlug(String slug);

    boolean existsByNormalizedName(String normalizedName);

    boolean existsBySlug(String slug);

    @Query("SELECT c FROM Company c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY c.name ASC")
    List<Company> searchByName(@Param("query") String query, Pageable pageable);
}
