import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  Share2,
  Copy,
  Calendar,
  Sparkles,
  AlertCircle,
  Building,
  RefreshCw,
  Check,
  Bookmark,
} from 'lucide-react';
import { PageContainer } from '../../components/ui/PageContainer';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button';
import { Badge, Tag } from '../../components/ui/Badge';
import { JobCard } from '../../components/ui/JobCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Toast } from '../../components/ui/Toast';
import { jobService } from '../../api/jobService';
import candidateService from '../../api/candidateService';
import { isValidHttpUrl } from '../../utils/url';
import type { Job } from '../../types/job.types';
import { useAuth } from '../../hooks/useAuth';
import { SEOHead } from '../../components/seo/SEOHead';
import { JobPostingSchema } from '../../components/seo/JobPostingSchema';

export const JobDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state: routerState } = useLocation() as { state: { initialJob?: Job } | null };
  const [job, setJob] = useState<Job | null>(routerState?.initialJob || null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(!routerState?.initialJob);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();

  // Candidate Actions state
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch job record by slug
  const fetchJobData = useCallback(async (signal?: AbortSignal) => {
    if (!slug) return;
    if (!routerState?.initialJob) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const jobData = await jobService.getJobBySlug(slug, signal);
      if (jobData) {
        setJob(jobData);
      }

      if (jobData) {
        // Fire related jobs concurrently in background without blocking main job content
        jobService.getRelatedJobs(slug, 3, signal)
          .then((related) => setRelatedJobs(related))
          .catch(() => {});

        // Check if saved by candidate
        if (isAuthenticated && user?.role === 'ROLE_CANDIDATE') {
          try {
            const saved = await candidateService.checkSaved(jobData.id);
            setIsSaved(saved);
          } catch {
            // Non-critical, ignore
          }
        }

        // Dynamic Document Title and SEO Metadata
        document.title = `${jobData.title} at ${jobData.company} | Find My Job`;

        // Update meta description dynamically
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute(
          'content',
          `Apply for ${jobData.title} at ${jobData.company} in ${jobData.location}. ${jobData.description.slice(
            0,
            120
          )}...`
        );

        // Update canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.href);
      } else {
        document.title = 'Job Not Found | Find My Job';
      }
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to load job details. Please verify your connection or retry.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug, isAuthenticated, user]);

  useEffect(() => {
    setJob(null);
    setRelatedJobs([]);
    const controller = new AbortController();
    fetchJobData(controller.signal);

    if (typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // Safe fallback in test environments
      }
    }

    return () => {
      controller.abort();
    };
  }, [fetchJobData]);

  // Format salary display cleanly without hardcoding 0
  const formatSalary = (j: Job) => {
    if (j.hideSalary || (!j.salaryMin && !j.salaryMax)) {
      return 'Not disclosed';
    }
    const currency = j.salaryCurrency === 'USD' ? '$' : j.salaryCurrency === 'EUR' ? '€' : '£';
    const period = j.salaryPeriod ? ` / ${j.salaryPeriod.toLowerCase()}` : '';

    if (j.salaryMin && j.salaryMax) {
      return `${currency}${Math.round(j.salaryMin / 1000)}k - ${currency}${Math.round(j.salaryMax / 1000)}k${period}`;
    }
    if (j.salaryMin) {
      return `From ${currency}${Math.round(j.salaryMin / 1000)}k${period}`;
    }
    return `Up to ${currency}${Math.round(j.salaryMax! / 1000)}k${period}`;
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setToastMessage('Canonical job link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setToastMessage('Link: ' + url);
    }
  };

  const handleShare = async () => {
    if (!job) return;
    const shareData = {
      title: `${job.title} at ${job.company}`,
      text: `Check out this ${job.title} opportunity at ${job.company} on Find My Job:`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveToggle = async () => {
    if (!job) return;
    if (!isAuthenticated) {
      navigate('/candidate/login', { state: { from: location } });
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await candidateService.unsaveJob(job.id);
        setIsSaved(false);
        setToastMessage('Job removed from saved bookmarks');
      } else {
        await candidateService.saveJob(job.id);
        setIsSaved(true);
        setToastMessage('Job saved to your candidate profile');
      }
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : 'Could not update saved status');
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <PageContainer size="narrow" className="py-10 space-y-6">
        <div className="h-5 bg-ink-200 rounded w-36 animate-pulse" />
        <LoadingSkeleton count={3} />
      </PageContainer>
    );
  }

  // 2. Error State
  if (errorMessage) {
    return (
      <PageContainer size="narrow" className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink-900">Communication Error</h2>
        <p className="text-xs text-ink-500 max-w-sm mx-auto">{errorMessage}</p>
        <SecondaryButton size="sm" onClick={() => fetchJobData()} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Loading Job
        </SecondaryButton>
      </PageContainer>
    );
  }

  // 3. Not Found State
  if (!job) {
    return (
      <PageContainer size="narrow" className="py-16 text-center space-y-5">
        <SEOHead
          title="Opportunity Closed or Not Found"
          description="This job opportunity is closed, archived, or no longer accepting applications on Find My Job."
          noindex={true}
        />
        <div className="w-12 h-12 rounded-full bg-canvas-subtle text-ink-400 mx-auto flex items-center justify-center">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Opportunity Not Found</h1>
          <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto leading-relaxed">
            The job listing with slug &ldquo;<span className="font-mono text-ink-700">{slug}</span>&rdquo; is either invalid, archived, or no longer accepting applications.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/jobs">
            <SecondaryButton size="sm">Browse active directory</SecondaryButton>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const skillList = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <PageContainer size="narrow" className="py-8 space-y-8 pb-20">
      {/* ── SEO Metadata & Structured Data ── */}
      <SEOHead
        title={`${job.title} at ${job.company}`}
        description={`Apply for ${job.title} at ${job.company} in ${job.location}. ${job.description.slice(0, 150)}...`}
        canonicalPath={`/jobs/${job.slug}`}
        ogType="article"
      />
      <JobPostingSchema job={job} />

      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
          aria-label="Back to jobs directory"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to job directory
        </Link>

        <span className="text-[11px] text-ink-400 font-mono">
          Ref: #{job.id}
        </span>
      </div>

      {/* Main Job Hero Header Card */}
      <div className="p-6 sm:p-8 bg-canvas-card border border-canvas-border rounded-card shadow-card space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">
              {job.company}
            </span>
            <div className="flex items-center gap-2">
              {job.fresherEligible ? (
                <Badge variant="success" size="sm">
                  <Sparkles className="w-3 h-3 mr-1 inline" />
                  Fresher Eligible
                </Badge>
              ) : null}
              <Badge variant="neutral" size="sm">
                {job.category}
              </Badge>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink-900 leading-tight">
            {job.title}
          </h1>

          {/* Metadata badges strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-600 pt-3 border-t border-canvas-border">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-ink-400" />
              {job.location} ({job.workMode.toLowerCase()})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-ink-400" />
              {job.employmentType.replace('_', ' ').toLowerCase()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-ink-400" />
              {formatSalary(job)}
            </span>
            {job.applicationDeadline ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-ink-400" />
                Deadline: {job.applicationDeadline}
              </span>
            ) : null}
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-canvas-border">
          <div className="flex items-center gap-3">
            <PrimaryButton
              size="lg"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() => {
                if (!job) return;
                if (isValidHttpUrl(job.applicationUrl)) {
                  window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
                } else {
                  setToastMessage('Application link is invalid or uses an unsupported protocol.');
                }
              }}
              aria-label="Apply Now to external employer portal"
            >
              Apply Now
            </PrimaryButton>
          </div>

          <div className="flex items-center gap-2">
            <SecondaryButton
              size="md"
              icon={
                <Bookmark
                  className={`w-4 h-4 ${isSaved ? 'fill-brand-600 text-brand-600' : ''}`}
                />
              }
              onClick={handleSaveToggle}
              disabled={isSaving}
              aria-label={isSaved ? 'Unsave Job' : 'Save Job'}
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </SecondaryButton>

            <SecondaryButton
              size="md"
              icon={copiedLink ? <Check className="w-4 h-4 text-emerald-text" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopyLink}
              aria-label="Copy canonical job link"
            >
              {copiedLink ? 'Link Copied' : 'Copy Link'}
            </SecondaryButton>

            <SecondaryButton
              size="md"
              icon={<Share2 className="w-4 h-4" />}
              onClick={handleShare}
              aria-label="Share opportunity"
            >
              Share
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* Detailed Description, Responsibilities & Qualifications */}
      <div className="p-6 sm:p-8 bg-canvas-card border border-canvas-border rounded-card shadow-card space-y-6 text-sm text-ink-800 leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-ink-900 mb-2">Role Overview</h2>
          <p className="text-ink-600 leading-relaxed">{job.description}</p>
        </div>

        {job.responsibilities ? (
          <div>
            <h2 className="text-base font-bold text-ink-900 mb-2">Core Responsibilities</h2>
            <p className="text-ink-600 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
          </div>
        ) : null}

        {job.qualifications ? (
          <div>
            <h2 className="text-base font-bold text-ink-900 mb-2">Desired Qualifications & Requirements</h2>
            <p className="text-ink-600 leading-relaxed whitespace-pre-line">{job.qualifications}</p>
          </div>
        ) : null}

        {skillList.length > 0 ? (
          <div>
            <h2 className="text-base font-bold text-ink-900 mb-3">Required Technical Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skillList.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Real Related Opportunities */}
      {relatedJobs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-canvas-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900">Similar Positions in {job.category}</h2>
              <p className="text-xs text-ink-500">Related active openings in the same technical discipline</p>
            </div>
            <Link to={`/jobs?category=${encodeURIComponent(job.category)}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              Explore all &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {relatedJobs.map((related) => (
              <JobCard
                key={related.id}
                job={related}
                onClick={() => navigate(`/jobs/${related.slug}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        isOpen={!!toastMessage}
        type="success"
        message={toastMessage || ''}
        onClose={() => setToastMessage(null)}
      />
    </PageContainer>
  );
};
