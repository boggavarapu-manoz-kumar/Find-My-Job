package com.jobplatform.controller;

import com.jobplatform.entity.Job;
import com.jobplatform.entity.JobStatus;
import com.jobplatform.repository.JobRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class SitemapController {

    private static final String CANONICAL_BASE = "https://findmyjob.site";
    private final JobRepository jobRepository;

    public SitemapController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @GetMapping(value = {"/sitemap.xml", "/api/v1/public/sitemap.xml"}, produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getSitemapXml() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // 1. Core Platform Pages
        appendUrl(xml, CANONICAL_BASE + "/", "1.0", "daily", null);
        appendUrl(xml, CANONICAL_BASE + "/jobs", "0.9", "hourly", null);
        appendUrl(xml, CANONICAL_BASE + "/categories", "0.8", "weekly", null);
        appendUrl(xml, CANONICAL_BASE + "/about", "0.7", "monthly", null);

        // 2. Active, Published Job Details
        List<Job> publishedJobs = jobRepository.findAll((root, query, cb) ->
            cb.equal(root.get("status"), JobStatus.PUBLISHED)
        );

        DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_LOCAL_DATE;

        for (Job job : publishedJobs) {
            String jobUrl = CANONICAL_BASE + "/jobs/" + job.getSlug();
            String lastmod = null;
            if (job.getUpdatedAt() != null) {
                lastmod = job.getUpdatedAt().toLocalDate().format(isoFormatter);
            } else if (job.getPublishedAt() != null) {
                lastmod = job.getPublishedAt().toLocalDate().format(isoFormatter);
            }
            appendUrl(xml, jobUrl, "0.8", "daily", lastmod);
        }

        xml.append("</urlset>\n");

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_XML)
            .body(xml.toString());
    }

    private void appendUrl(StringBuilder xml, String loc, String priority, String changefreq, String lastmod) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(loc)).append("</loc>\n");
        if (lastmod != null && !lastmod.isBlank()) {
            xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        }
        if (changefreq != null) {
            xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        }
        if (priority != null) {
            xml.append("    <priority>").append(priority).append("</priority>\n");
        }
        xml.append("  </url>\n");
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }
}
