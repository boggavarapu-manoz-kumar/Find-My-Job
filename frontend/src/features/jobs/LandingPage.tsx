import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Layers,
  Award,
  GraduationCap,
  Briefcase,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { PageContainer } from '../../components/ui/PageContainer';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button';
import { JobCard } from '../../components/ui/JobCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { jobService } from '../../api/jobService';
import { CompanyLogoMarquee } from '../companies/components/CompanyLogoMarquee';
import { staggerContainer, fadeInUp, staggerItem } from '../../utils/motion';
import type { Job } from '../../types/job.types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = jobService.getCategories();

  const loadLandingData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [featured, latest] = await Promise.all([
        jobService.getFeaturedJobs(signal),
        jobService.getLatestJobs({ size: 6 }, signal),
      ]);
      setFeaturedJobs(featured);
      setLatestJobs(latest.content);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to load positions from the server. Please check your connection or retry.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Find My Job - Verified Job Discovery Platform';
    const controller = new AbortController();
    loadLandingData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadLandingData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handleChipClick = (filterParam: string, value: string) => {
    navigate(`/jobs?${filterParam}=${encodeURIComponent(value)}`);
  };

  return (
    <div className="space-y-20 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-16 border-b border-canvas-border overflow-hidden">
        <PageContainer size="wide">
          <motion.div
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.div
              variants={shouldReduceMotion ? undefined : fadeInUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-badge text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              Verified Direct Listings • No Candidate Sign-In Required
            </motion.div>

            <motion.h1
              variants={shouldReduceMotion ? undefined : fadeInUp}
              className="text-4xl sm:text-6xl font-bold tracking-tight text-ink-900 leading-[1.12]"
            >
              Find the right job opportunity with complete clarity.
            </motion.h1>

            <motion.p
              variants={shouldReduceMotion ? undefined : fadeInUp}
              className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-2xl mx-auto"
            >
              Discover curated technology positions across reputable teams, from campus fresher hiring to senior architecture. Browse openly and apply directly to employer portals.
            </motion.p>

            {/* Hero Search Box */}
            <motion.form
              variants={shouldReduceMotion ? undefined : fadeInUp}
              onSubmit={handleSearchSubmit}
              className="mt-8 p-3 sm:p-3.5 bg-canvas-card border border-canvas-border rounded-card shadow-card-hover text-left"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Keyword Field */}
                <div className="sm:col-span-6 relative flex items-center">
                  <div className="absolute left-3.5 text-ink-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Job title, skill, or company..."
                    aria-label="Job title, skill, or company"
                    className="w-full h-12 pl-10 pr-3 rounded-button bg-canvas-subtle sm:bg-transparent border border-transparent sm:border-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="hidden sm:block sm:col-span-1 text-center">
                  <div className="w-px h-7 bg-canvas-border mx-auto" />
                </div>

                {/* Location Field */}
                <div className="sm:col-span-3 relative flex items-center">
                  <div className="absolute left-3.5 text-ink-400 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location or Remote"
                    aria-label="Location or Remote"
                    className="w-full h-12 pl-10 pr-3 rounded-button bg-canvas-subtle sm:bg-transparent border border-transparent sm:border-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* Search Button */}
                <div className="sm:col-span-2">
                  <PrimaryButton
                    type="submit"
                    size="md"
                    className="w-full h-12 text-sm font-semibold"
                    aria-label="Search Jobs"
                  >
                    Find Jobs
                  </PrimaryButton>
                </div>
              </div>
            </motion.form>

            {/* Quick Filter Chips */}
            <motion.div
              variants={shouldReduceMotion ? undefined : fadeInUp}
              className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs"
            >
              <span className="text-ink-400 font-medium mr-1">Popular Filters:</span>
              <button
                type="button"
                onClick={() => handleChipClick('fresher', 'true')}
                className="px-3 py-1.5 rounded-badge bg-canvas-card border border-canvas-border text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors shadow-xs"
              >
                🎓 Freshers / Entry-Level
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('experienceLevel', 'SENIOR')}
                className="px-3 py-1.5 rounded-badge bg-canvas-card border border-canvas-border text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors shadow-xs"
              >
                💼 Experienced / Senior
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('workMode', 'REMOTE')}
                className="px-3 py-1.5 rounded-badge bg-canvas-card border border-canvas-border text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors shadow-xs"
              >
                🌐 Remote Opportunities
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('employmentType', 'INTERNSHIP')}
                className="px-3 py-1.5 rounded-badge bg-canvas-card border border-canvas-border text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors shadow-xs"
              >
                🌱 Internships
              </button>
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* 2. FEATURED COMPANIES CONTINUOUS MARQUEE */}
      <CompanyLogoMarquee />

      {/* 3. FEATURED POSITIONS SECTION */}
      <motion.section
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <PageContainer size="wide" className="space-y-6">
          <SectionHeading
            title="Featured Positions"
            subtitle="Curated, verified technology roles with clear job responsibilities and requirements."
            tag="Curated"
            action={
              <button
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all openings <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />

          {/* Featured Positions Result Area */}
          {errorMessage ? (
            <div className="p-8 bg-canvas-card border border-rose-200 rounded-card text-center space-y-4 max-w-md mx-auto">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink-900">Positions Currently Unavailable</h3>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">{errorMessage}</p>
              </div>
              <SecondaryButton size="sm" onClick={() => loadLandingData()} icon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry Loading
              </SecondaryButton>
            </div>
          ) : isLoading ? (
            <LoadingSkeleton count={4} />
          ) : featuredJobs.length === 0 ? (
            <div className="p-8 bg-canvas-card border border-canvas-border rounded-card text-center space-y-2">
              <p className="text-sm font-medium text-ink-700">No featured positions currently open.</p>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Browse all job openings &rarr;
              </button>
            </div>
          ) : (
            <motion.div
              variants={shouldReduceMotion ? undefined : staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {featuredJobs.map((job) => (
                <motion.div key={`featured-${job.id}`} variants={shouldReduceMotion ? undefined : staggerItem}>
                  <JobCard
                    job={job}
                    onClick={() => navigate(`/jobs/${job.slug}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </PageContainer>
      </motion.section>

      {/* 4. LATEST OPPORTUNITIES SECTION */}
      <motion.section
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <PageContainer size="wide" className="space-y-6">
          <SectionHeading
            title="Latest Openings"
            subtitle="Recently published listings ready for direct candidate exploration."
            tag="Fresh"
            action={
              <button
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Browse All Openings <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />

          {isLoading ? (
            <LoadingSkeleton count={4} />
          ) : latestJobs.length === 0 ? (
            <div className="p-8 bg-canvas-card border border-canvas-border rounded-card text-center text-sm text-ink-500">
              No recent openings listed at the moment.
            </div>
          ) : (
            <motion.div
              variants={shouldReduceMotion ? undefined : staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {latestJobs.map((job) => (
                <motion.div key={`latest-${job.id}`} variants={shouldReduceMotion ? undefined : staggerItem}>
                  <JobCard
                    job={job}
                    onClick={() => navigate(`/jobs/${job.slug}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </PageContainer>
      </motion.section>

      {/* 5. EXPLORE CATEGORIES */}
      <motion.section
        id="categories"
        className="py-2"
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <PageContainer size="wide" className="space-y-6">
          <SectionHeading
            title="Explore by Discipline"
            subtitle="Explore available career opportunities organized by technical domains and roles."
            tag="Disciplines"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => navigate(`/jobs?category=${encodeURIComponent(category.key)}`)}
                className="p-5 text-left bg-canvas-card border border-canvas-border rounded-card hover:border-brand-400 hover:shadow-card-hover transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-badge bg-canvas-subtle text-ink-700 group-hover:bg-brand-50 group-hover:text-brand-600 flex items-center justify-center mb-3 transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-ink-500 mt-1.5 leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 mt-4 group-hover:translate-x-0.5 transition-transform">
                  Explore roles <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </PageContainer>
      </motion.section>

      {/* 6. FRESHER AND EXPERIENCED CAREER PATHWAYS */}
      <motion.section
        className="py-4"
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <PageContainer size="wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Freshers & Graduates Pathway */}
            <div className="p-8 rounded-card bg-gradient-to-br from-brand-50/60 to-canvas-card border border-brand-200/60 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-button bg-brand-100/70 text-brand-700 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block">
                  Campus & Early Career
                </span>
                <h3 className="text-2xl font-bold text-ink-900">
                  Fresher & Graduate Roles
                </h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  Tailored opportunities welcoming entry-level applicants, recent university graduates, and candidates starting their technology journey with zero prior experience requirements.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/jobs?fresher=true')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors group"
                >
                  Explore Fresher Opportunities
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Experienced Professionals Pathway */}
            <div className="p-8 rounded-card bg-canvas-card border border-canvas-border shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-button bg-ink-100 text-ink-800 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 block">
                  Mid & Senior Career
                </span>
                <h3 className="text-2xl font-bold text-ink-900">
                  Experienced Professionals
                </h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  Specialized roles for mid-level developers, tech leads, engineering managers, and principal architects seeking verified responsibilities, stack requirements, and salary transparency.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/jobs?experienceLevel=SENIOR')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-brand-600 transition-colors group"
                >
                  Explore Senior Openings
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </PageContainer>
      </motion.section>

      {/* 7. HOW THE PLATFORM WORKS */}
      <motion.section
        className="bg-canvas-card border-y border-canvas-border py-16"
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <PageContainer size="wide" className="space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
              Straightforward Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              How Find My Job Works
            </h2>
            <p className="text-sm text-ink-500 leading-relaxed">
              No account creation, no password fatigue, and no intermediary candidate data storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-canvas-subtle/50 border border-canvas-border rounded-card space-y-3 text-left">
              <div className="w-10 h-10 rounded-button bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-ink-900">Discover Opportunities</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Filter by technical discipline, fresher eligibility, experience tier, work mode, and location to find exactly what aligns with your background.
              </p>
            </div>

            <div className="p-6 bg-canvas-subtle/50 border border-canvas-border rounded-card space-y-3 text-left">
              <div className="w-10 h-10 rounded-button bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-ink-900">Examine Details</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Review complete job descriptions, skills required, responsibilities, and verified compensation disclosures without speculative guesswork.
              </p>
            </div>

            <div className="p-6 bg-canvas-subtle/50 border border-canvas-border rounded-card space-y-3 text-left">
              <div className="w-10 h-10 rounded-button bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-ink-900">Apply Directly</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Follow the verified application link directly to the employer's official careers portal. Your application is submitted directly to the hiring team.
              </p>
            </div>
          </div>
        </PageContainer>
      </motion.section>

      {/* 8. WHY USE THIS PLATFORM / TRUST & VALUE */}
      <motion.section
        id="about"
        className="py-8"
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <PageContainer size="wide" className="space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
              Integrity First
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              A cleaner, more transparent hiring destination
            </h2>
            <p className="text-sm text-ink-500 leading-relaxed">
              We eliminate candidate clutter, walled gardens, and hidden salary estimates to connect talent with direct employer career portals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-canvas-card border border-canvas-border rounded-card space-y-3">
              <div className="w-10 h-10 rounded-button bg-brand-50 text-brand-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-ink-900">100% Public Access</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Zero candidate registration, password gates, or resume trapping. Browse jobs and examine company requirements without creating an account.
              </p>
            </div>

            <div className="p-6 bg-canvas-card border border-canvas-border rounded-card space-y-3">
              <div className="w-10 h-10 rounded-button bg-emerald-soft text-emerald-text flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-ink-900">Direct External Applications</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Apply directly on genuine employer career pages. Every link is verified with clear, countdown-guided redirection.
              </p>
            </div>

            <div className="p-6 bg-canvas-card border border-canvas-border rounded-card space-y-3">
              <div className="w-10 h-10 rounded-button bg-ink-100 text-ink-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-ink-900">Honest Compensation</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Clear compensation disclosures without speculative algorithms. Undisclosed salaries are marked plainly, never displayed as zero.
              </p>
            </div>
          </div>
        </PageContainer>
      </motion.section>

      {/* 9. SECONDARY JOB DISCOVERY CALL TO ACTION */}
      <motion.section
        className="pb-16"
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <PageContainer size="wide">
          <div className="p-8 sm:p-12 rounded-card bg-ink-900 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-card-hover relative overflow-hidden">
            <div className="space-y-2 max-w-xl relative z-10">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-300">
                Start Exploring Today
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to take the next step in your career?
              </h2>
              <p className="text-sm text-ink-200 leading-relaxed">
                Discover the latest engineering, design, cloud, and product opportunities across verified hiring teams.
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <PrimaryButton
                size="lg"
                onClick={() => navigate('/jobs')}
                className="bg-white text-ink-900 hover:bg-ink-100 hover:text-ink-950 font-bold px-6 shadow-md"
                icon={<ArrowRight className="w-4 h-4 text-brand-600" />}
              >
                Browse All Jobs
              </PrimaryButton>
            </div>
            {/* Subtle background ambient glow */}
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </PageContainer>
      </motion.section>
    </div>
  );
};
