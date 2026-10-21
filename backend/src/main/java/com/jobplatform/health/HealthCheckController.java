package com.jobplatform.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthCheckController {

    private final DataSource dataSource;

    public HealthCheckController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "job-platform-backend");
        response.put("timestamp", Instant.now().toString());

        Map<String, Object> components = new HashMap<>();

        // Test active database connectivity
        try (Connection conn = dataSource.getConnection()) {
            boolean isValid = conn.isValid(2);
            components.put("database", Map.of(
                    "status", isValid ? "UP" : "DOWN",
                    "product", conn.getMetaData().getDatabaseProductName(),
                    "version", conn.getMetaData().getDatabaseProductVersion()
            ));
        } catch (Exception e) {
            components.put("database", Map.of(
                    "status", "DOWN",
                    "error", e.getMessage()
            ));
            response.put("status", "DOWN");
            return ResponseEntity.status(503).body(response);
        }

        response.put("components", components);
        return ResponseEntity.ok(response);
    }
}
