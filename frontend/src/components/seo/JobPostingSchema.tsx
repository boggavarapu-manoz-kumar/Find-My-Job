import React, { useEffect } from 'react';
import type { Job } from '../../types/job.types';

interface JobPostingSchemaProps {
  job: Job;
}

const CANONICAL_HOST = 'https://findmyjob.site';

export const JobPostingSchema: React.FC<JobPostingSchemaProps> = ({ job }) => {
  useEffect(() => {
    // Only construct schema if job is valid and has minimum required fields
    if (!job || !job.title || !job.description) return;

    const canonicalJobUrl = `${CANONICAL_HOST}/jobs/${job.slug}`;

    // Map employment type to Schema.org standard
    const mapEmploymentType = (type: string): string => {
      switch (type) {
        case 'FULL_TIME': return 'FULL_TIME';
        case 'PART_TIME': return 'PART_TIME';
        case 'CONTRACT': return 'CONTRACTOR';
        case 'INTERNSHIP': return 'INTERN';
        default: return 'FULL_TIME';
      }
    };

    // Format validThrough if applicationDeadline exists
    const validThroughDate = job.applicationDeadline
      ? `${job.applicationDeadline}T23:59:59Z`
      : undefined;

    // Build structured JobPosting object
    const schemaData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.publishedAt ? new Date(job.publishedAt).toISOString() : new Date().toISOString(),
      employmentType: mapEmploymentType(job.employmentType),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
        logo: job.companyLogo || `${CANONICAL_HOST}/logo-badge.png`,
        sameAs: undefined,
      },
      directApply: true,
      identifier: {
        '@type': 'PropertyValue',
        name: 'Find My Job Reference',
        value: String(job.id),
      },
      url: canonicalJobUrl,
    };

    if (validThroughDate) {
      schemaData.validThrough = validThroughDate;
    }

    // Work location & remote handling
    if (job.workMode === 'REMOTE') {
      schemaData.jobLocationType = 'TELECOMMUTE';
      schemaData.applicantLocationRequirements = {
        '@type': 'Country',
        name: 'India',
      };
    } else {
      schemaData.jobLocation = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'IN',
        },
      };
    }

    // Base salary when available and not marked hidden
    if (!job.hideSalary && (job.salaryMin || job.salaryMax)) {
      schemaData.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: job.salaryCurrency || 'USD',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMin || undefined,
          maxValue: job.salaryMax || undefined,
          unitText: job.salaryPeriod || 'YEAR',
        },
      };
    }

    // Create and inject script tag
    const scriptId = 'job-posting-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schemaData);

    // BreadcrumbList JSON-LD
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: CANONICAL_HOST,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Jobs',
          item: `${CANONICAL_HOST}/jobs`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: job.title,
          item: canonicalJobUrl,
        },
      ],
    };

    const breadcrumbScriptId = 'job-breadcrumb-jsonld';
    let breadcrumbEl = document.getElementById(breadcrumbScriptId) as HTMLScriptElement | null;
    if (!breadcrumbEl) {
      breadcrumbEl = document.createElement('script');
      breadcrumbEl.id = breadcrumbScriptId;
      breadcrumbEl.type = 'application/ld+json';
      document.head.appendChild(breadcrumbEl);
    }
    breadcrumbEl.textContent = JSON.stringify(breadcrumbData);

    // Clean up on component unmount
    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
      const bEl = document.getElementById(breadcrumbScriptId);
      if (bEl) bEl.remove();
    };
  }, [job]);

  return null;
};
