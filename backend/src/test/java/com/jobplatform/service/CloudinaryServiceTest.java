package com.jobplatform.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.jobplatform.config.CloudinaryProperties;
import com.jobplatform.dto.CloudinaryUploadResult;
import com.jobplatform.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private CloudinaryProperties properties;
    private CloudinaryServiceImpl cloudinaryService;

    @BeforeEach
    void setUp() {
        properties = new CloudinaryProperties();
        properties.setCloudName("demo-cloud");
        properties.setApiKey("valid-api-key");
        properties.setApiSecret("valid-api-secret");
        properties.setFolder("job-platform/company-logos");
        properties.setMaxFileSizeBytes(2 * 1024 * 1024);

        cloudinaryService = new CloudinaryServiceImpl(cloudinary, properties);
    }

    @Test
    @DisplayName("Rejects empty or null upload files")
    void testRejectsEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "logo.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> cloudinaryService.uploadLogo(emptyFile, "stripe"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("No image file provided");
    }

    @Test
    @DisplayName("Rejects oversized files beyond 2 MB")
    void testRejectsOversizedFile() {
        byte[] oversizedBytes = new byte[3 * 1024 * 1024]; // 3 MB
        oversizedBytes[0] = (byte) 0x89;
        oversizedBytes[1] = (byte) 0x50;
        oversizedBytes[2] = (byte) 0x4E;
        oversizedBytes[3] = (byte) 0x47;

        MockMultipartFile bigFile = new MockMultipartFile("file", "huge.png", "image/png", oversizedBytes);

        assertThatThrownBy(() -> cloudinaryService.uploadLogo(bigFile, "stripe"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("exceeds maximum allowable size");
    }

    @Test
    @DisplayName("Rejects non-image files with spoofed extensions")
    void testRejectsInvalidMagicBytes() {
        byte[] fakeBytes = "Hello this is a text file spoofed as png".getBytes();
        MockMultipartFile fakeFile = new MockMultipartFile("file", "test.png", "image/png", fakeBytes);

        assertThatThrownBy(() -> cloudinaryService.uploadLogo(fakeFile, "stripe"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Unsupported image format");
    }

    @Test
    @DisplayName("Rejects SVG files containing active script tags")
    void testRejectsMaliciousSvg() {
        String xssSvg = "<svg xmlns='http://www.w3.org/2000/svg'><script>alert('xss')</script></svg>";
        MockMultipartFile svgFile = new MockMultipartFile("file", "malicious.svg", "image/svg+xml", xssSvg.getBytes());

        assertThatThrownBy(() -> cloudinaryService.uploadLogo(svgFile, "stripe"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("disallowed active script tags");
    }

    @Test
    @DisplayName("Uploads valid PNG image and returns Cloudinary asset metadata")
    void testUploadValidPng() throws Exception {
        byte[] pngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
        MockMultipartFile validPng = new MockMultipartFile("file", "logo.png", "image/png", pngBytes);

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of(
                "public_id", "job-platform/company-logos/stripe_abc123",
                "asset_id", "asset_998877",
                "secure_url", "https://res.cloudinary.com/demo-cloud/image/upload/v1234/job-platform/company-logos/stripe_abc123.png",
                "format", "png",
                "width", 256,
                "height", 256,
                "bytes", 1234
        ));

        CloudinaryUploadResult result = cloudinaryService.uploadLogo(validPng, "stripe");

        assertThat(result).isNotNull();
        assertThat(result.getPublicId()).isEqualTo("job-platform/company-logos/stripe_abc123");
        assertThat(result.getSecureUrl()).contains("cloudinary.com");
    }

    @Test
    @DisplayName("Blocks deletion of foreign assets outside the configured folder")
    void testBlocksForeignAssetDeletion() {
        assertThatThrownBy(() -> cloudinaryService.deleteLogo("root_asset_12345"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Unauthorized deletion target");

        verifyNoInteractions(cloudinary);
    }
}
