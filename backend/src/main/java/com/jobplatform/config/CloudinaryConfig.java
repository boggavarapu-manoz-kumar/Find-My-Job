package com.jobplatform.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);

    private final CloudinaryProperties properties;

    public CloudinaryConfig(CloudinaryProperties properties) {
        this.properties = properties;
    }

    @Bean
    public Cloudinary cloudinary() {
        if (!properties.isConfigured()) {
            log.info("[Cloudinary] Credentials not fully configured. Logo upload service will operate in mock/unconfigured mode.");
            return new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", "unconfigured",
                    "api_key", "none",
                    "api_secret", "none"
            ));
        }

        log.info("[Cloudinary] Initialized with cloud: {}", properties.getCloudName());
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.getCloudName(),
                "api_key", properties.getApiKey(),
                "api_secret", properties.getApiSecret(),
                "secure", true
        ));
    }
}
