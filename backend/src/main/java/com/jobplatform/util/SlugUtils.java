package com.jobplatform.util;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s_]+");
    private static final Pattern MULTIDASH = Pattern.compile("-+");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final char[] HEX_CHARS = "0123456789abcdef".toCharArray();

    private SlugUtils() {}

    /**
     * Normalizes a text string into a clean, URL-safe kebab-case token.
     * Handles accents, special characters, repeated whitespace, and punctuation.
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "job";
        }

        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = MULTIDASH.matcher(slug).replaceAll("-");
        slug = slug.toLowerCase(Locale.ENGLISH);

        // Strip leading or trailing dashes
        if (slug.startsWith("-")) {
            slug = slug.substring(1);
        }
        if (slug.endsWith("-")) {
            slug = slug.substring(0, slug.length() - 1);
        }

        return slug.isEmpty() ? "job" : slug;
    }

    /**
     * Generates a 4-character random hex entropy suffix.
     */
    public static String generateEntropy() {
        char[] result = new char[4];
        for (int i = 0; i < 4; i++) {
            result[i] = HEX_CHARS[RANDOM.nextInt(HEX_CHARS.length)];
        }
        return new String(result);
    }

    /**
     * Composes a canonical, URL-safe job slug with built-in entropy to prevent collisions.
     * Example: "Staff Engineer" + "Stripe" -> "staff-engineer-stripe-f91a"
     */
    public static String generateJobSlug(String title, String company) {
        String titleSlug = toSlug(title);
        String companySlug = toSlug(company);
        String entropy = generateEntropy();

        String combined = titleSlug + "-" + companySlug + "-" + entropy;
        // Truncate safely if exceeding maximum column capacity (160 chars)
        if (combined.length() > 160) {
            int allowedPrefix = 160 - 5 - companySlug.length(); // -5 for dashes and entropy
            if (allowedPrefix > 10) {
                combined = titleSlug.substring(0, allowedPrefix) + "-" + companySlug + "-" + entropy;
            } else {
                combined = combined.substring(0, 155) + "-" + entropy;
            }
        }
        return combined;
    }
}
