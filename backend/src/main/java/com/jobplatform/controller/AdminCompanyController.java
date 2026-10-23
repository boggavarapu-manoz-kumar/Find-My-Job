package com.jobplatform.controller;

import com.jobplatform.dto.ApiResponse;
import com.jobplatform.dto.CompanyCreateRequestDTO;
import com.jobplatform.dto.CompanyResponseDTO;
import com.jobplatform.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/companies")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCompanyController {

    private final CompanyService companyService;

    public AdminCompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * Create or register a new company record.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> createCompany(
            @Valid @RequestBody CompanyCreateRequestDTO request
    ) {
        CompanyResponseDTO company = companyService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created successfully", company));
    }

    /**
     * Upload or replace a company logo with server-side validation and Cloudinary CDN storage.
     */
    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> uploadCompanyLogo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        CompanyResponseDTO updated = companyService.uploadCompanyLogo(id, file);
        return ResponseEntity.ok(ApiResponse.success("Company logo uploaded successfully", updated));
    }

    /**
     * Remove a company logo from Cloudinary and clear database reference.
     */
    @DeleteMapping("/{id}/logo")
    public ResponseEntity<ApiResponse<Void>> removeCompanyLogo(@PathVariable Long id) {
        companyService.removeCompanyLogo(id);
        return ResponseEntity.ok(ApiResponse.success("Company logo removed successfully", null));
    }
}
