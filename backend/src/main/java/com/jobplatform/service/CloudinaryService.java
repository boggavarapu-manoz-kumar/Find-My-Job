package com.jobplatform.service;

import com.jobplatform.dto.CloudinaryUploadResult;
import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    CloudinaryUploadResult uploadLogo(MultipartFile file, String companySlug);

    void deleteLogo(String publicId);

    boolean isConfigured();
}
