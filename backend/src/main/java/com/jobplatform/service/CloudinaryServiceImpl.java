package com.jobplatform.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.jobplatform.config.CloudinaryProperties;
import com.jobplatform.dto.CloudinaryUploadResult;
import com.jobplatform.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryServiceImpl.class);

    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;

    public CloudinaryServiceImpl(Cloudinary cloudinary, CloudinaryProperties properties) {
        this.cloudinary = cloudinary;
        this.properties = properties;
    }

    @Override
    public boolean isConfigured() {
        return properties.isConfigured();
    }

    @Override
    public CloudinaryUploadResult uploadLogo(MultipartFile file, String companySlug) {
        if (!properties.isConfigured()) {
            throw new ApiException(
                    "Cloudinary image service is not configured on this server. " +
                    "Please supply CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
                    HttpStatus.SERVICE_UNAVAILABLE
            );
        }

        validateLogoFile(file);

        String cleanSlug = (companySlug != null && !companySlug.isBlank()) ? companySlug : "logo";
        String uniquePublicId = properties.getFolder() + "/" + cleanSlug + "_" + UUID.randomUUID().toString().substring(0, 8);

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException ex) {
            throw new ApiException("Failed to read uploaded file: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
        }

        // Attempt upload with 1 automatic retry for transient Cloudinary 503/network errors
        return doUploadWithRetry(fileBytes, uniquePublicId, cleanSlug, 0);
    }

    private CloudinaryUploadResult doUploadWithRetry(byte[] fileBytes, String uniquePublicId, String slug, int attempt) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(fileBytes, ObjectUtils.asMap(
                    "public_id",     uniquePublicId,
                    "overwrite",     true,
                    "resource_type", "image",
                    "tags",          "company-logo",
                    // Pre-generate optimised 200x200 variant at upload time — first CDN hit is instant
                    "eager",         "c_fit,w_200,h_200,q_auto,f_auto",
                    "eager_async",   false,
                    "quality",       "auto",
                    "fetch_format",  "auto",
                    "timeout",       30000   // 30 s — free Cloudinary can be slow
            ));

            String publicId  = (String) uploadResult.get("public_id");
            String assetId   = (String) uploadResult.get("asset_id");
            String secureUrl = (String) uploadResult.get("secure_url");
            String format    = (String) uploadResult.get("format");
            int    width     = uploadResult.get("width")  instanceof Number n ? n.intValue()  : 0;
            int    height    = uploadResult.get("height") instanceof Number n ? n.intValue()  : 0;
            long   bytes     = uploadResult.get("bytes")  instanceof Number n ? n.longValue() : fileBytes.length;

            log.info("Cloudinary logo uploaded: publicId={}, url={}, format={}, {}x{}", publicId, secureUrl, format, width, height);
            return new CloudinaryUploadResult(publicId, assetId, secureUrl, format, width, height, bytes);

        } catch (Exception ex) {
            String msg = extractCloudinaryMessage(ex);
            boolean isTransient = msg.contains("503") || msg.contains("502") || msg.contains("timeout")
                    || msg.contains("connection") || msg.contains("network");

            if (isTransient && attempt < 1) {
                log.warn("Transient Cloudinary error (attempt {}), retrying in 2 s: {}", attempt + 1, msg);
                try { Thread.sleep(2000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                return doUploadWithRetry(fileBytes, uniquePublicId, slug, attempt + 1);
            }

            log.error("Cloudinary upload failed for slug '{}' after {} attempt(s): {}", slug, attempt + 1, msg);
            if (ex instanceof ApiException ae) throw ae;
            throw new ApiException("Logo upload failed: " + msg, HttpStatus.BAD_GATEWAY);
        }
    }

    @Override
    public void deleteLogo(String publicId) {
        if (!properties.isConfigured() || publicId == null || publicId.isBlank()) {
            return;
        }

        // Security: restrict deletion strictly to assets within the configured folder
        if (!publicId.startsWith(properties.getFolder() + "/")) {
            log.warn("Blocked attempt to delete foreign Cloudinary asset: {}", publicId);
            throw new ApiException("Unauthorized deletion target: asset does not belong to company logos", HttpStatus.BAD_REQUEST);
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
            log.info("Cloudinary logo deleted: publicId={}, result={}", publicId, result.get("result"));
        } catch (Exception ex) {
            log.warn("Non-fatal Cloudinary asset cleanup warning for {}: {}", publicId, ex.getMessage());
        }
    }

    /**
     * Strict content validation: validates file size, declared MIME, and binary magic bytes.
     */
    private void validateLogoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("No image file provided for logo upload", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            long maxMb = properties.getMaxFileSizeBytes() / (1024 * 1024);
            throw new ApiException("Image file exceeds maximum allowable size of " + maxMb + " MB", HttpStatus.BAD_REQUEST);
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length < 4) {
                throw new ApiException("Invalid or corrupted image file", HttpStatus.BAD_REQUEST);
            }

            boolean isPng  = bytes[0] == (byte) 0x89 && bytes[1] == (byte) 0x50 && bytes[2] == (byte) 0x4E && bytes[3] == (byte) 0x47;
            boolean isJpeg = bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF;
            boolean isWebp = bytes.length >= 12 &&
                    bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                    bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
            boolean isSvg  = checkSvgContent(bytes);

            if (!isPng && !isJpeg && !isWebp && !isSvg) {
                throw new ApiException("Unsupported image format. Allowed formats: PNG, JPEG, WebP, SVG.", HttpStatus.BAD_REQUEST);
            }

        } catch (IOException ex) {
            throw new ApiException("Failed to read image content for validation", HttpStatus.BAD_REQUEST);
        }
    }

    private boolean checkSvgContent(byte[] bytes) {
        try {
            String content = new String(bytes, 0, Math.min(bytes.length, 1024), StandardCharsets.UTF_8).toLowerCase();
            if (!content.contains("<svg") && !content.contains("<?xml")) {
                return false;
            }
            String fullContent = new String(bytes, StandardCharsets.UTF_8).toLowerCase();
            if (fullContent.contains("<script") ||
                fullContent.contains("javascript:") ||
                fullContent.contains("onload=") ||
                fullContent.contains("onerror=") ||
                fullContent.contains("<foreignobject")) {
                throw new ApiException("SVG image contains disallowed active script tags", HttpStatus.BAD_REQUEST);
            }
            return true;
        } catch (Exception ex) {
            if (ex instanceof ApiException) throw (ApiException) ex;
            return false;
        }
    }

    private String extractCloudinaryMessage(Exception ex) {
        if (ex.getMessage() != null) return ex.getMessage();
        Throwable cause = ex.getCause();
        return cause != null && cause.getMessage() != null ? cause.getMessage() : ex.getClass().getSimpleName();
    }
}
