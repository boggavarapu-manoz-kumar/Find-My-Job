const fs = require('fs');

const seoHead = import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
}

const DEFAULT_TITLE = 'Find My Job | Latest Jobs, Fresher Jobs & Internships in India';
const DEFAULT_DESCRIPTION =
  'Discover verified job opportunities, fresher tech jobs, software engineering roles, and internships with transparent salaries on Find My Job.';
const CANONICAL_HOST = 'https://findmyjob.site';
const DEFAULT_OG_IMAGE = CANONICAL_HOST + '/logo-badge.png';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  noindex = false,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
}) => {
  useEffect(() => {
    const fullTitle = title ? title + ' | Find My Job' : DEFAULT_TITLE;
    document.title = fullTitle;

    const setMeta = (attrName, attrVal, content) => {
      let el = document.querySelector('meta[' + attrName + '="  + attrVal +  \]');
 if (!el) {
 el = document.createElement('meta');
 el.setAttribute(attrName, attrVal);
 document.head.appendChild(el);
 }
 el.setAttribute('content', content);
 };

 setMeta('name', 'description', description);
 setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

 setMeta('property', 'og:title', fullTitle);
 setMeta('property', 'og:description', description);
 setMeta('property', 'og:type', ogType);
 setMeta('property', 'og:site_name', 'Find My Job');
 setMeta('property', 'og:image', ogImage);

 setMeta('name', 'twitter:card', 'summary_large_image');
 setMeta('name', 'twitter:title', fullTitle);
 setMeta('name', 'twitter:description', description);
 setMeta('name', 'twitter:image', ogImage);

 const cleanPath =
 canonicalPath !== undefined
 ? (canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath)
 : window.location.pathname;

 const normalizedPath =
 cleanPath.length > 1 && cleanPath.endsWith('/')
 ? cleanPath.slice(0, -1)
 : cleanPath;
 const fullCanonicalUrl = CANONICAL_HOST + normalizedPath;

 let canonicalEl = document.querySelector('link[rel=\canonical\]');
 if (!canonicalEl) {
 canonicalEl = document.createElement('link');
 canonicalEl.setAttribute('rel', 'canonical');
 document.head.appendChild(canonicalEl);
 }
 canonicalEl.setAttribute('href', fullCanonicalUrl);
 setMeta('property', 'og:url', fullCanonicalUrl);
 }, [title, description, canonicalPath, noindex, ogType, ogImage]);

 return null;
};
;

const jobSchema = import React, { useEffect } from 'react';
import type { Job } from '../../types/job.types';

interface JobPostingSchemaProps {
 job: Job;
}

const CANONICAL_HOST = 'https://findmyjob.site';

export const JobPostingSchema: React.FC<JobPostingSchemaProps> = ({ job }) => {
 useEffect(() => {
 if (!job || !job.title || !job.description) return;

 const canonicalJobUrl = CANONICAL_HOST + '/jobs/' + job.slug;

 const mapEmploymentType = (type: string): string => {
 switch (type) {
 case 'FULL_TIME': return 'FULL_TIME';
 case 'PART_TIME': return 'PART_TIME';
 case 'CONTRACT': return 'CONTRACTOR';
 case 'INTERNSHIP': return 'INTERN';
 default: return 'FULL_TIME';
 }
 };

 const validThroughDate = job.applicationDeadline
 ? job.applicationDeadline + 'T23:59:59Z'
 : undefined;

 const schemaData: Record<string, any> = {
 '@context': 'https://schema.org',
 '@type': 'JobPosting',
 title: job.title,
 description: job.description,
 datePosted: job.publishedAt ? new Date(job.publishedAt).toISOString() : new Date().toISOString(),
 employmentType: mapEmploymentType(job.employmentType),
 hiringOrganization: {
 '@type': 'Organization',
 name: job.company,
 logo: job.companyLogo || (CANONICAL_HOST + '/logo-badge.png'),
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

 const scriptId = 'job-posting-jsonld';
 let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
 if (!scriptEl) {
 scriptEl = document.createElement('script');
 scriptEl.id = scriptId;
 scriptEl.type = 'application/ld+json';
 document.head.appendChild(scriptEl);
 }
 scriptEl.textContent = JSON.stringify(schemaData);

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
 item: CANONICAL_HOST + '/jobs',
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

 return () => {
 const el = document.getElementById(scriptId);
 if (el) el.remove();
 const bEl = document.getElementById(breadcrumbScriptId);
 if (bEl) bEl.remove();
 };
 }, [job]);

 return null;
};
;

fs.writeFileSync('C:/Users/manoz/.gemini/antigravity-ide/scratch/job-platform/frontend/src/components/seo/SEOHead.tsx', seoHead, 'utf8');
fs.writeFileSync('C:/Users/manoz/.gemini/antigravity-ide/scratch/job-platform/frontend/src/components/seo/JobPostingSchema.tsx', jobSchema, 'utf8');
console.log('SEO components written successfully.');