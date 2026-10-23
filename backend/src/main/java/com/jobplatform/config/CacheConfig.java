package com.jobplatform.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Fine-grained Caffeine cache configuration.
 *
 * <p>Each cache has its own eviction policy tuned to the data's change rate:
 * <ul>
 *   <li>{@code publicJobs}     — 60 s: changes when admin publishes/edits a job</li>
 *   <li>{@code jobsBySlug}     — 5 min: single-job detail, rarely changes mid-day</li>
 *   <li>{@code featuredJobs}   — 5 min: landing-page hero section</li>
 *   <li>{@code relatedJobs}    — 5 min: sidebar suggestions per slug</li>
 *   <li>{@code categoryCounts} — 10 min: aggregate — cheapest to serve stale</li>
 *   <li>{@code companiesSearch}— 2 min: autocomplete — needs to feel fresh</li>
 * </ul>
 */
@Configuration
public class CacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
            build("publicJobs",      60,  2000),
            build("jobsBySlug",     300,  5000),
            build("featuredJobs",   300,   500),
            build("relatedJobs",    300,  2000),
            build("categoryCounts", 600,    50),
            build("companiesSearch",120,   500)
        ));
        return manager;
    }

    private CaffeineCache build(String name, int expireAfterWriteSeconds, int maxSize) {
        return new CaffeineCache(name,
            Caffeine.newBuilder()
                .expireAfterWrite(expireAfterWriteSeconds, TimeUnit.SECONDS)
                .maximumSize(maxSize)
                .recordStats()          // visible in /actuator/metrics for debugging
                .build()
        );
    }
}
