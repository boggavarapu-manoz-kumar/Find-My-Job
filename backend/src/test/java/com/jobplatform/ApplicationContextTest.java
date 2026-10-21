package com.jobplatform;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextTest {

    @Test
    @DisplayName("Spring application context loads successfully with all beans")
    void contextLoads() {
        // Verifies the entire dependency graph, security filter chains, JPA configurations and validators initialize
    }
}
