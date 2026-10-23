package com.jobplatform.util;

import java.text.Normalizer;
import java.util.Locale;

public final class CompanyNormalizer {

    private CompanyNormalizer() {}

    /**
     * Consistent normalization: trims, collapses whitespace, converts to lowercase.
     * Preserves punctuation and distinct organization names.
     */
    public static String normalize(String name) {
        if (name == null) {
            return "";
        }
        // Normalize unicode diacritics
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFC);
        // Collapse multiple spaces/tabs into a single space, trim, lowercase
        return normalized.replaceAll("\\s+", " ").trim().toLowerCase(Locale.ROOT);
    }

    /**
     * Generates a URL-friendly slug from the company name.
     */
    public static String generateSlug(String name) {
        if (name == null || name.isBlank()) {
            return "company";
        }
        String clean = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        return clean.isBlank() ? "company" : clean;
    }
}
