import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { JobPostingSchema } from '../components/seo/JobPostingSchema';
import type { Job } from '../types/job.types';

const MOCK_JOB: Job = {
  id: 101,
  slug: 'senior-full-stack-engineer-acme',
  title: 'Senior Full Stack Engineer',
  company: 'Acme Corp',
  companyLogo: 'https://findmyjob.site/logo.png',
  category: 'Engineering',
  employmentType: 'FULL_TIME',
  workMode: 'REMOTE',
  experienceLevel: 'SENIOR',
  fresherEligible: false,
  location: 'Bengaluru, India',
  salaryMin: 3500000,
  salaryMax: 4500000,
  salaryCurrency: 'INR',
  salaryPeriod: 'YEAR',
  hideSalary: false,
  description: 'Design and build enterprise software and microservices.',
  applicationUrl: 'https://acme.example.com/apply',
  status: 'PUBLISHED',
  featured: true,
  viewsCount: 15,
  clicksCount: 3,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-15T12:00:00Z',
  publishedAt: '2026-10-02T10:00:00Z',
};

describe('Technical SEO & Structured Data', () => {
  beforeEach(() => {
    document.title = '';
    const oldCanonical = document.querySelector('link[rel="canonical"]');
 if (oldCanonical) oldCanonical.remove();
 const oldLdJson = document.getElementById('job-posting-jsonld');
 if (oldLdJson) oldLdJson.remove();
 });

 it('updates document title, description, and canonical link to findmyjob.site', () => {
    render(
      <SEOHead
        title="Explore Software Engineering Jobs"
        description="Discover top developer jobs across India with direct applications."
        canonicalPath="/jobs"
      />
    );

    expect(document.title).toBe('Explore Software Engineering Jobs | Find My Job');

    const metaDesc = document.querySelector('meta[name="description"]');
 expect(metaDesc?.getAttribute('content')).toBe(
 'Discover top developer jobs across India with direct applications.'
 );

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    expect(canonicalEl?.getAttribute('href')).toBe('https://findmyjob.site/jobs');
  });

 it('generates valid Google JobPosting JSON-LD structured data', () => {
 const { unmount } = render(<JobPostingSchema job={MOCK_JOB} />);

 const scriptEl = document.getElementById('job-posting-jsonld') as HTMLScriptElement;
 expect(scriptEl).not.toBeNull();

 const data = JSON.parse(scriptEl.textContent || '{}');
 expect(data['@context']).toBe('https://schema.org');
 expect(data['@type']).toBe('JobPosting');
 expect(data.title).toBe('Senior Full Stack Engineer');
 expect(data.hiringOrganization.name).toBe('Acme Corp');
 expect(data.jobLocationType).toBe('TELECOMMUTE');
 expect(data.directApply).toBe(true);
 expect(data.baseSalary.currency).toBe('INR');
 expect(data.baseSalary.value.minValue).toBe(3500000);
 expect(data.baseSalary.value.maxValue).toBe(4500000);

 // Cleans up script on unmount to prevent schema lingering
 unmount();
 expect(document.getElementById('job-posting-jsonld')).toBeNull();
 });
});