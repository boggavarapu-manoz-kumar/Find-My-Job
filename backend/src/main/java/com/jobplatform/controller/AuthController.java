package com.jobplatform.controller;

import com.jobplatform.dto.*;
import com.jobplatform.entity.User;
import com.jobplatform.exception.ApiException;
import com.jobplatform.repository.UserRepository;
import com.jobplatform.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Candidate registration endpoint.
     * Enforces unique username and email, hashes password, and hardcodes role to ROLE_CANDIDATE.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody CandidateRegisterRequestDTO request) {
        String normalizedUsername = request.getUsername().trim();
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new ApiException("Username is already taken", HttpStatus.CONFLICT);
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("Email address is already registered", HttpStatus.CONFLICT);
        }

        try {
            User candidate = new User(
                    normalizedUsername,
                    normalizedEmail,
                    passwordEncoder.encode(request.getPassword()),
                    "ROLE_CANDIDATE"
            );

            User savedUser = userRepository.save(candidate);

            // Generate token directly for the newly registered candidate
            String token = tokenProvider.generateTokenFromUsernameAndRoles(
                    savedUser.getUsername(),
                    savedUser.getRole()
            );

            UserResponseDTO userDTO = new UserResponseDTO(
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    savedUser.getRole(),
                    savedUser.isEnabled(),
                    savedUser.getCreatedAt()
            );

            AuthResponseDTO authResponse = new AuthResponseDTO(
                    token,
                    tokenProvider.getExpirationMs() / 1000,
                    userDTO
            );

            log.info("Candidate registered successfully with username '{}'", savedUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Candidate registered successfully", authResponse));

        } catch (DataIntegrityViolationException ex) {
            log.warn("Registration data integrity conflict: {}", ex.getMessage());
            throw new ApiException("Username or email is already registered", HttpStatus.CONFLICT);
        } catch (Exception ex) {
            log.error("Registration fatal error for username '{}'", normalizedUsername, ex);
            throw new ApiException("Registration failed: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Authenticate credentials (Admin or Candidate) and return signed JWT with roles.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail().trim(),
                            request.getPassword()
                    )
            );

            String token = tokenProvider.generateToken(authentication);

            // Single indexed OR-query – avoids two sequential round-trips to the DB
            String identifier = request.getUsernameOrEmail().trim();
            User user = userRepository.findByUsernameOrEmail(identifier).orElse(null);

            UserResponseDTO userDTO = null;
            if (user != null) {
                userDTO = new UserResponseDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole(),
                        user.isEnabled(),
                        user.getCreatedAt()
                );
            }

            AuthResponseDTO authResponse = new AuthResponseDTO(
                    token,
                    tokenProvider.getExpirationMs() / 1000,
                    userDTO
            );

            log.info("Login successful for identifier '{}'", identifier);
            return ResponseEntity.ok(ApiResponse.success("Authentication successful", authResponse));

        } catch (BadCredentialsException ex) {
            log.warn("Login bad credentials for identifier '{}'", request.getUsernameOrEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username/email or password"));
        } catch (DisabledException ex) {
            log.warn("Login disabled account for identifier '{}'", request.getUsernameOrEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Account is disabled. Please contact administrator."));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            log.warn("Login authentication exception for identifier '{}': {}", request.getUsernameOrEmail(), ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication failed: " + ex.getMessage()));
        } catch (Exception ex) {
            log.error("Login fatal unexpected error for identifier '{}'", request.getUsernameOrEmail(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login service encountered an internal error: " + ex.getMessage()));
        }
    }

    /**
     * Return authenticated user profile for frontend session rehydration.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User profile not found"));
        }

        UserResponseDTO userDTO = new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved successfully", userDTO));
    }

    /**
     * Optional logout endpoint for audit and client handshake.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful. Client token should be discarded.", null));
    }
}
