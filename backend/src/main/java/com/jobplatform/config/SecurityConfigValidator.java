package com.jobplatform.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Validates security-critical configuration properties on startup.
 * Prevents running in production with default/insecure credentials.
 */
@Component
public class SecurityConfigValidator {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfigValidator.class);
    private static final String DEFAULT_DEV_JWT_SECRET = "4c9b31d4e78a63581f92e4a8b75319c5a1728e209d84bf273e89a35d8a0c2174";

    private final Environment environment;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    public SecurityConfigValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validate() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (isProd) {
            if (jwtSecret == null || jwtSecret.trim().isEmpty() || jwtSecret.equals(DEFAULT_DEV_JWT_SECRET)) {
                log.error("CRITICAL SECURITY ERROR: The JWT_SECRET environment variable is missing, empty, or using the default development secret in the 'prod' profile!");
                throw new IllegalStateException("Production startup aborted: A unique, strong JWT_SECRET must be supplied via environment variable.");
            }
            if (jwtSecret.length() < 32) {
                log.error("CRITICAL SECURITY ERROR: The JWT_SECRET must be at least 32 characters long in production.");
                throw new IllegalStateException("Production startup aborted: JWT_SECRET length is insufficient.");
            }
            log.info("Production security configuration validated successfully.");
        }
    }
}
