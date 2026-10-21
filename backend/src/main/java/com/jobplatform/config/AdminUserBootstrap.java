package com.jobplatform.config;

import com.jobplatform.entity.User;
import com.jobplatform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.bootstrap.username:admin}")
    private String bootstrapUsername;

    @Value("${app.admin.bootstrap.email:admin@careerforge.local}")
    private String bootstrapEmail;

    @Value("${app.admin.bootstrap.password:AdminSecure2026!}")
    private String bootstrapPassword;

    public AdminUserBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled via configuration.");
            return;
        }

        if (userRepository.existsByUsername(bootstrapUsername) || userRepository.existsByEmail(bootstrapEmail)) {
            log.info("Administrator account already exists (username='{}' or email='{}'). Skipping bootstrap.",
                    bootstrapUsername, bootstrapEmail);
            return;
        }

        log.info("Provisioning initial administrator account '{}'...", bootstrapUsername);
        User admin = new User(
                bootstrapUsername,
                bootstrapEmail,
                passwordEncoder.encode(bootstrapPassword),
                "ROLE_ADMIN"
        );
        userRepository.save(admin);
        log.info("Initial administrator account '{}' provisioned successfully.", bootstrapUsername);
    }
}
