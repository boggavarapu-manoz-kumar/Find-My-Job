package com.jobplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class JobPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobPlatformApplication.class, args);
    }
}
