package com.jobplatform.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway migration strategy that automatically calls {@code repair()} before
 * {@code migrate()}.
 *
 * <p>Why this exists: if a previous deployment left a failed migration record in
 * {@code flyway_schema_history} (e.g. a syntax error on the first attempt),
 * Flyway's validation step will refuse to proceed on every subsequent deploy
 * with the message "Detected failed migration — please run repair".
 *
 * <p>Calling {@code repair()} removes those failed records and realigns the
 * checksum of already-applied migrations so that a corrected script can be
 * applied cleanly.  It is safe to call on every startup — when there is
 * nothing to repair it is a no-op.
 */
@Configuration
public class FlywayRepairConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayRepairConfig.class);

    @Bean
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            log.info("[Flyway] Running repair to clear any failed migration records...");
            flyway.repair();
            log.info("[Flyway] Repair complete. Proceeding with migrate...");
            flyway.migrate();
        };
    }
}
