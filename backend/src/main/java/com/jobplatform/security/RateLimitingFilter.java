package com.jobplatform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-performance sliding-window in-memory Rate Limiting Filter.
 * Protects auth and public search APIs against spam and DDoS without external dependencies.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 120;
    private static final int MAX_AUTH_REQUESTS_PER_MINUTE = 25;

    private static class RequestCounter {
        final long windowStartMs;
        final AtomicInteger count;

        RequestCounter(long windowStartMs) {
            this.windowStartMs = windowStartMs;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        long now = System.currentTimeMillis();

        boolean isAuth = path.startsWith("/api/v1/auth");
        int limit = isAuth ? MAX_AUTH_REQUESTS_PER_MINUTE : MAX_REQUESTS_PER_MINUTE;
        String key = (isAuth ? "auth:" : "api:") + clientIp;

        // Atomic update and cleanup window
        RequestCounter counter = requestCounts.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStartMs > 60_000) {
                return new RequestCounter(now);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        // Add rate-limit headers to response
        int remaining = Math.max(0, limit - counter.count.get());
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        if (counter.count.get() > limit) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please slow down.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
