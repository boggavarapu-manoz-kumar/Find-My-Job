package com.jobplatform.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CompanyNormalizerTest {

    @Test
    @DisplayName("Normalizes harmless whitespace and casing differences identically")
    void testNormalize() {
        String base = CompanyNormalizer.normalize("Google");
        String spaced = CompanyNormalizer.normalize("  Google   ");
        String upper = CompanyNormalizer.normalize("GOOGLE");
        String mixedTabs = CompanyNormalizer.normalize("Google \t ");

        assertThat(base).isEqualTo("google");
        assertThat(spaced).isEqualTo(base);
        assertThat(upper).isEqualTo(base);
        assertThat(mixedTabs).isEqualTo(base);
    }

    @Test
    @DisplayName("Preserves distinct organization names")
    void testPreservesDistinctCompanies() {
        String google = CompanyNormalizer.normalize("Google");
        String alphabet = CompanyNormalizer.normalize("Alphabet");
        String googleCloud = CompanyNormalizer.normalize("Google Cloud");

        assertThat(google).isNotEqualTo(alphabet);
        assertThat(google).isNotEqualTo(googleCloud);
    }

    @Test
    @DisplayName("Generates clean URL-safe slugs")
    void testGenerateSlug() {
        assertThat(CompanyNormalizer.generateSlug("Stripe, Inc.")).isEqualTo("stripe-inc");
        assertThat(CompanyNormalizer.generateSlug("Amazon Web Services (AWS)")).isEqualTo("amazon-web-services-aws");
        assertThat(CompanyNormalizer.generateSlug("   Meta / Facebook   ")).isEqualTo("meta-facebook");
        assertThat(CompanyNormalizer.generateSlug("")).isEqualTo("company");
        assertThat(CompanyNormalizer.generateSlug(null)).isEqualTo("company");
    }
}
