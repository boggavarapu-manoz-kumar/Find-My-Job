package com.jobplatform.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SlugUtilsTest {

    @Test
    @DisplayName("Normalizes complex strings into clean kebab-case tokens")
    void testToSlugNormalization() {
        assertEquals("senior-java-engineer", SlugUtils.toSlug("Senior Java Engineer"));
        assertEquals("c-developer", SlugUtils.toSlug("C++ Developer"));
        assertEquals("react-lead-remote", SlugUtils.toSlug("  React / Lead & Remote!!! "));
        assertEquals("cafe-con-leche", SlugUtils.toSlug("Café con leche"));
    }

    @Test
    @DisplayName("Generates deterministic 4-character hex entropy")
    void testEntropyLength() {
        String entropy = SlugUtils.generateEntropy();
        assertNotNull(entropy);
        assertEquals(4, entropy.length());
        assertTrue(entropy.matches("^[0-9a-f]{4}$"));
    }

    @Test
    @DisplayName("Creates collision-resistant canonical job slug")
    void testGenerateJobSlug() {
        String slug = SlugUtils.generateJobSlug("Staff Software Engineer", "Stripe");
        assertNotNull(slug);
        assertTrue(slug.startsWith("staff-software-engineer-stripe-"));
        assertEquals(35, slug.length()); // 23 ("staff-software-engineer") + 1 ("-") + 6 ("stripe") + 1 ("-") + 4 (entropy) = 35
    }
}
