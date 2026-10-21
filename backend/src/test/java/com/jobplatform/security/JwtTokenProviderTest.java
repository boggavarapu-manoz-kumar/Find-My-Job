package com.jobplatform.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private static final String SECRET = "4c9b31d4e78a63581f92e4a8b75319c5a1728e209d84bf273e89a35d8a0c2174";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Should generate valid signed JWT token for authenticated principal")
    void shouldGenerateValidToken() {
        UserDetails principal = new User("admin", "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String token = tokenProvider.generateToken(auth);

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("admin", tokenProvider.getUsernameFromToken(token));
        assertEquals("ROLE_ADMIN", tokenProvider.getRolesFromToken(token));
    }

    @Test
    @DisplayName("Should reject malformed or tampered token")
    void shouldRejectMalformedToken() {
        String invalidToken = "eyJhbGciOiJIUzI1NiJ9.invalidpayload.invalidsignature";
        assertFalse(tokenProvider.validateToken(invalidToken));
    }

    @Test
    @DisplayName("Should reject expired token")
    void shouldRejectExpiredToken() {
        // Provider with negative expiration creates an already-expired token
        JwtTokenProvider expiredProvider = new JwtTokenProvider(SECRET, -1000);
        String expiredToken = expiredProvider.generateTokenFromUsernameAndRoles("admin", "ROLE_ADMIN");

        assertFalse(tokenProvider.validateToken(expiredToken));
    }

    @Test
    @DisplayName("Should reject token signed with different key")
    void shouldRejectTokenWithDifferentSignature() {
        String differentSecret = "8f9a21b3e67c54120e81d3f7a64208b4c0617e198d73ac162e78b24c7a9b1063";
        JwtTokenProvider otherProvider = new JwtTokenProvider(differentSecret, EXPIRATION_MS);

        String foreignToken = otherProvider.generateTokenFromUsernameAndRoles("admin", "ROLE_ADMIN");

        assertFalse(tokenProvider.validateToken(foreignToken));
    }
}
