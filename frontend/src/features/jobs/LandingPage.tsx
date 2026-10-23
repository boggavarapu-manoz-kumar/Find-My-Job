import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';
import {
  Search,
  MapPin,
  ArrowRight,
  Briefcase,
  Globe,
  Laptop,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { PageContainer } from '../../components/ui/PageContainer';
import { JobCard } from '../../components/ui/JobCard';
import { jobService } from '../../api/jobService';
import { CompanyLogoMarquee } from '../companies/components/CompanyLogoMarquee';
import { SEOHead } from '../../components/seo/SEOHead';
import { staggerContainer, staggerItem, fadeInUp, fadeInLeft, fadeInRight } from '../../utils/motion';
import type { Job } from '../../types/job.types';

// ─── Hero search form ─────────────────────────────────────────────────────────
const HeroSearch: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" aria-label="Job search form">
      <div className="flex flex-col sm:flex-row gap-2 bg-canvas-card border border-canvas-border rounded-card p-2 shadow-card">
        {/* Keyword */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-button border border-transparent focus-within:border-brand-300 focus-within:bg-brand-50/30 transition-all">
          <Search className="w-4 h-4 text-ink-400 shrink-0" aria-hidden="true" />
          <input
            type="text"
            placeholder="Job title, skill, or company"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            aria-label="Job title, skill, or company"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-canvas-border self-stretch my-1" />

        {/* Location */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-button border border-transparent focus-within:border-brand-300 focus-within:bg-brand-50/30 transition-all">
          <MapPin className="w-4 h-4 text-ink-400 shrink-0" aria-hidden="true" />
          <input
            type="text"
            placeholder="City or remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            aria-label="City or remote"
          />
        </div>

        {/* CTA */}
        <button
          type="submit"
          className="shrink-0 px-5 py-2.5 bg-ink-900 text-white text-sm font-semibold rounded-button hover:bg-ink-800 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          Explore Jobs
        </button>
      </div>

      {/* Quick links */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-400">
        <span>Popular:</span>
        {['Remote', 'Full-time', 'Engineering', 'Design'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              if (tag === 'Remote') navigate('/jobs?workMode=REMOTE');
              else if (tag === 'Full-time') navigate('/jobs?employmentType=FULL_TIME');
              else navigate(`/jobs?category=${encodeURIComponent(tag)}`);
            }}
            className="text-ink-500 hover:text-brand-600 hover:underline transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};

// ─── Work mode pill ────────────────────────────────────────────────────────────
const WorkModePill: React.FC<{
  icon: React.ReactNode;
  label: string;
  href: string;
}> = ({ icon, label, href }) => (
  <Link
    to={href}
    className="inline-flex items-center gap-2 px-4 py-2 bg-canvas-card border border-canvas-border rounded-full text-sm text-ink-700 font-medium hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all duration-150 shadow-xs"
  >
    {icon}
    {label}
  </Link>
);

// ─── How it works step ────────────────────────────────────────────────────────
const HowStep: React.FC<{
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}> = ({ step, icon, title, body }) => (
  <div className="flex gap-4">
    <div className="shrink-0 flex flex-col items-center">
      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 mt-2 w-px bg-canvas-border" />
    </div>
    <div className="pb-8 min-w-0">
      <span className="text-[11px] font-bold text-brand-500 uppercase tracking-widest block mb-1">
        Step {step}
      </span>
      <h3 className="text-base font-semibold text-ink-900 mb-1.5">{title}</h3>
      <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
    </div>
  </div>
);

// ─── Category card ────────────────────────────────────────────────────────────
const CategoryCard: React.FC<{
  name: string;
  categoryKey: string;
  description: string;
}> = ({ name, categoryKey, description }) => {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate(`/jobs?category=${encodeURIComponent(categoryKey)}`)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col justify-between w-full h-full text-left p-5 sm:p-6 bg-canvas-card border border-canvas-border rounded-xl hover:border-brand-500 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
    >
      <div>
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
          <Briefcase className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-ink-900 group-hover:text-brand-600 transition-colors mb-2">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-ink-500 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-canvas-border/50 flex items-center justify-between text-xs font-semibold text-brand-600">
        <span>Explore jobs</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="p-6 bg-canvas-card border border-canvas-border rounded-card space-y-3 animate-pulse">
    <div className="flex gap-3">
      <div className="h-4 w-20 bg-canvas-subtle rounded" />
      <div className="h-4 w-12 bg-canvas-subtle rounded" />
    </div>
    <div className="h-5 w-3/4 bg-canvas-subtle rounded" />
    <div className="flex gap-4">
      <div className="h-3 w-24 bg-canvas-subtle rounded" />
      <div className="h-3 w-20 bg-canvas-subtle rounded" />
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Instant 0ms initial state from multi-tier cache
  const cachedFeatured = jobService.getCachedFeaturedJobs();
  const cachedLatest = jobService.getCachedLatestJobs({ sort: 'publishedAt,desc', size: 6 });

  const [featuredJobs, setFeaturedJobs] = useState<Job[]>(() => cachedFeatured.slice(0, 4));
  const [latestJobs, setLatestJobs] = useState<Job[]>(() => cachedLatest?.content || []);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(() => cachedFeatured.length === 0);
  const [isLoadingLatest, setIsLoadingLatest] = useState(() => !cachedLatest || cachedLatest.content.length === 0);
  const [featuredError, setFeaturedError] = useState(false);
  const [latestError, setLatestError] = useState(false);

  const categories = jobService.getCategories();

  // ── Single coordinated prefetch ─ fires featured + latest + categories in parallel
  // Stale-While-Revalidate: If data is already rendered, update silently in the background
  const loadLandingData = useCallback((signal?: AbortSignal) => {
    setFeaturedError(false);
    setLatestError(false);

    // Fire all three requests concurrently — each resolves independently
    jobService.getFeaturedJobs(signal)
      .then((jobs) => setFeaturedJobs(jobs.slice(0, 4)))
      .catch((err) => { if (!err?.message?.includes('cancel')) setFeaturedError(true); })
      .finally(() => setIsLoadingFeatured(false));

    jobService.getLatestJobs({ sort: 'publishedAt,desc', size: 6 }, signal)
      .then((page) => setLatestJobs(page.content))
      .catch((err) => { if (!err?.message?.includes('cancel')) setLatestError(true); })
      .finally(() => setIsLoadingLatest(false));

    // Fire categories too to warm the cache for CategoryPage
    jobService.getCategoryCounts(signal).catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadLandingData(controller.signal);
    return () => controller.abort();
  }, [loadLandingData]);

  const animProps = shouldReduceMotion
    ? {}
    : {
        variants: fadeInUp,
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once: true, margin: '-40px' },
      };

  const staggerProps = shouldReduceMotion
    ? {}
    : {
        variants: staggerContainer,
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once: true, margin: '-40px' },
      };

  return (
    <div className="overflow-x-hidden">
      {/* ── SEO Metadata ── */}
      <SEOHead
        title="Latest Jobs, Fresher Jobs & Internships"
        description="Discover verified job opportunities, fresher roles, software developer positions, and internships across India with transparent salaries on Find My Job."
        canonicalPath="/"
      />

      {/* ================================================================= */}
      {/* HERO                                                                */}
      {/* ================================================================= */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {/* Subtle background accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand-50 opacity-50 blur-3xl" />
        </div>

        <PageContainer size="wide" className="relative">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                Verified technology opportunities
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-900 tracking-tight leading-[1.1] mb-5"
            >
              Find the right job,{' '}
              <span className="text-gradient-brand">not just any job.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeInUp}
              className="text-lg text-ink-500 leading-relaxed mb-8 max-w-xl"
            >
              Browse verified technology roles with transparent salary
              information and direct employer links. No spam, no middlemen.
            </motion.p>

            {/* Search form */}
            <motion.div variants={fadeInUp} className="mb-8">
              <HeroSearch />
            </motion.div>

            {/* Work mode pills */}
            <motion.div
              variants={staggerContainer}
              className="flex flex-wrap gap-2"
            >
              {[
                { icon: <Globe className="w-3.5 h-3.5" />, label: 'Remote', href: '/jobs?workMode=REMOTE' },
                { icon: <Laptop className="w-3.5 h-3.5" />, label: 'Hybrid', href: '/jobs?workMode=HYBRID' },
                { icon: <Building2 className="w-3.5 h-3.5" />, label: 'On-site', href: '/jobs?workMode=ONSITE' },
                { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Internships', href: '/jobs?employmentType=INTERNSHIP' },
              ].map((pill) => (
                <motion.div key={pill.label} variants={staggerItem}>
                  <WorkModePill {...pill} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* ================================================================= */}
      {/* COMPANY LOGOS MARQUEE                                             */}
      {/* ================================================================= */}
      <CompanyLogoMarquee />

      {/* ================================================================= */}
      {/* FEATURED JOBS                                                       */}
      {/* ================================================================= */}
      <section className="py-14 border-t border-canvas-border bg-canvas-card">
        <PageContainer size="wide">
          <motion.div {...animProps} className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 block mb-1">
                Featured
              </span>
              <h2 className="text-2xl font-bold text-ink-900">
                Highlighted positions
              </h2>
            </div>
            <Link
              to="/jobs?sort=publishedAt,desc"
              className="shrink-0 text-sm text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              All jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : featuredError ? (
            <div className="py-10 text-center text-sm text-ink-400">
              Could not load featured listings.{' '}
              <button
                onClick={() => loadLandingData()}
                className="text-brand-600 hover:underline font-medium"
              >
                Retry
              </button>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-400">
              No featured listings at this time.{' '}
              <Link to="/jobs" className="text-brand-600 hover:underline font-medium">
                Browse all jobs
              </Link>
            </div>
          ) : (
          <motion.div
              {...staggerProps}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch"
            >
              {featuredJobs.map((job) => (
                <motion.div key={job.id} variants={staggerItem} className="flex h-full">
                  <JobCard
                    job={job}
                    className="w-full"
                    onClick={() => navigate(`/jobs/${job.slug}`, { state: { initialJob: job } })}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </PageContainer>
      </section>

      {/* ================================================================= */}
      {/* CATEGORIES                                                          */}
      {/* ================================================================= */}
      <section className="py-14 border-t border-canvas-border">
        <PageContainer size="wide">
          <motion.div {...animProps} className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 block mb-1">
                Browse by discipline
              </span>
              <h2 className="text-2xl font-bold text-ink-900">
                Job categories
              </h2>
            </div>
            <Link
              to="/categories"
              className="shrink-0 text-sm text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div
            {...staggerProps}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {categories.slice(0, 6).map((cat) => (
              <motion.div key={cat.key} variants={staggerItem} className="flex">
                <CategoryCard name={cat.name} categoryKey={cat.key} description={cat.description} />
              </motion.div>
            ))}
          </motion.div>
        </PageContainer>
      </section>

      {/* ================================================================= */}
      {/* LATEST JOBS                                                         */}
      {/* ================================================================= */}
      <section className="py-14 border-t border-canvas-border bg-canvas-card">
        <PageContainer size="wide">
          <motion.div {...animProps} className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 block mb-1">
                Recently published
              </span>
              <h2 className="text-2xl font-bold text-ink-900">
                Latest opportunities
              </h2>
            </div>
            <Link
              to="/jobs"
              className="shrink-0 text-sm text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              Browse all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {isLoadingLatest ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : latestError ? (
            <div className="py-10 text-center text-sm text-ink-400">
              Could not load recent listings.{' '}
              <button
                onClick={() => window.location.reload()}
                className="text-brand-600 hover:underline font-medium"
              >
                Retry
              </button>
            </div>
          ) : latestJobs.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-400">
              No recent listings available.{' '}
              <Link to="/jobs" className="text-brand-600 hover:underline font-medium">
                View all
              </Link>
            </div>
          ) : (
            <motion.div
              {...staggerProps}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch"
            >
              {latestJobs.map((job) => (
                <motion.div key={job.id} variants={staggerItem} className="flex h-full">
                  <JobCard
                    job={job}
                    className="w-full"
                    onClick={() => navigate(`/jobs/${job.slug}`, { state: { initialJob: job } })}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </PageContainer>
      </section>

      {/* ================================================================= */}
      {/* HOW IT WORKS                                                        */}
      {/* ================================================================= */}
      <section className="py-14 border-t border-canvas-border">
        <PageContainer size="wide">
          <motion.div {...animProps} className="mb-10 max-w-xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 block mb-2">
              Process
            </span>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">
              How it works
            </h2>
            <p className="text-sm text-ink-500 leading-relaxed">
              From search to application in four straightforward steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <HowStep
                step="01"
                icon={<Search className="w-5 h-5" />}
                title="Search with filters"
                body="Enter keywords, location, or browse by category. Filter by employment type, work mode, experience level, and salary to narrow results."
              />
              <HowStep
                step="02"
                icon={<SlidersHorizontal className="w-5 h-5" />}
                title="Review listings"
                body="Each listing shows role details, location, salary where disclosed, and employer information. No gated previews."
              />
            </motion.div>

            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <HowStep
                step="03"
                icon={<Bookmark className="w-5 h-5" />}
                title="Save roles you like"
                body="Create a free account to bookmark opportunities and track your applications. Your saved jobs are available from your dashboard."
              />
              <HowStep
                step="04"
                icon={<FileText className="w-5 h-5" />}
                title="Apply directly"
                body="Applications go directly to the employer. We link to the original application page so nothing gets lost in translation."
              />
            </motion.div>
          </div>
        </PageContainer>
      </section>

      {/* ================================================================= */}
      {/* VALUE PROPOSITION                                                   */}
      {/* ================================================================= */}
      <section className="py-14 border-t border-canvas-border bg-canvas-card">
        <PageContainer size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 block mb-3">
                Why this platform
              </span>
              <h2 className="text-2xl font-bold text-ink-900 mb-5 leading-tight">
                Straightforward job discovery,
                <br />
                without the noise.
              </h2>
              <p className="text-sm text-ink-500 leading-relaxed mb-6">
                Job boards can be cluttered with spam, duplicates, and listings
                that haven't been updated in months. Find My Job focuses on
                quality — verified listings, transparent salary data, and
                direct application links.
              </p>
              <ul className="space-y-3">
                {[
                  'Verified listings reviewed before publication',
                  'Salary ranges shown where provided by employer',
                  'Direct application links — no intermediaries',
                  'Free candidate account with saved jobs',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="bg-canvas-subtle border border-canvas-border rounded-card p-8 space-y-4"
            >
              <h3 className="text-base font-semibold text-ink-900">
                Looking for technology roles?
              </h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                We focus on engineering, design, product, data, and adjacent
                technology disciplines. Listings are categorised and searchable
                by employment type, work mode, and experience level.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => navigate('/jobs')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button bg-ink-900 text-white text-sm font-semibold hover:bg-ink-800 transition-colors"
                >
                  Browse open roles <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/candidate/register')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button bg-canvas-card border border-canvas-border text-ink-700 text-sm font-medium hover:bg-canvas-hover transition-colors"
                >
                  Create a free account
                </button>
              </div>
            </motion.div>
          </div>
        </PageContainer>
      </section>

      {/* ================================================================= */}
      {/* FINAL CTA                                                           */}
      {/* ================================================================= */}
      <section className="py-16 border-t border-canvas-border bg-ink-900">
        <PageContainer size="wide">
          <motion.div
            {...animProps}
            className="text-center max-w-xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
              Ready to find your next role?
            </h2>
            <p className="text-ink-400 text-sm leading-relaxed mb-8">
              Explore current openings across engineering, design, product, data
              science, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/jobs')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-button bg-white text-ink-900 font-semibold text-sm hover:bg-canvas-subtle transition-colors"
              >
                Browse all jobs <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/categories')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-button border border-ink-700 text-ink-300 font-medium text-sm hover:bg-ink-800 transition-colors"
              >
                Browse by category
              </button>
            </div>
          </motion.div>
        </PageContainer>
      </section>
    </div>
  );
};

export default LandingPage;
