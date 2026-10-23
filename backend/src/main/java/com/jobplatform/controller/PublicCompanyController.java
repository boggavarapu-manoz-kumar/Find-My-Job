package com.jobplatform.controller;

import com.jobplatform.dto.ApiResponse;
import com.jobplatform.dto.CompanyResponseDTO;
import com.jobplatform.service.CompanyService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/companies")
public class PublicCompanyController {

    private final CompanyService companyService;

    public PublicCompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * Autocomplete search for companies (used by job creation forms and search UI).
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CompanyResponseDTO>>> searchCompanies(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "10") int limit
    ) {
        String searchTerm = query != null ? query : (q != null ? q : "");
        List<CompanyResponseDTO> results = companyService.searchCompanies(searchTerm, limit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=60, stale-while-revalidate=300")
                .body(ApiResponse.success("Companies retrieved successfully", results));
    }

    /**
     * Retrieve company details and logo metadata by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> getCompanyById(@PathVariable Long id) {
        CompanyResponseDTO company = companyService.getCompanyById(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=120, stale-while-revalidate=600")
                .body(ApiResponse.success("Company retrieved successfully", company));
    }

    /**
     * Retrieve company details by SEO slug.
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> getCompanyBySlug(@PathVariable String slug) {
        CompanyResponseDTO company = companyService.getCompanyBySlug(slug);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=120, stale-while-revalidate=600")
                .body(ApiResponse.success("Company retrieved successfully", company));
    }
}
